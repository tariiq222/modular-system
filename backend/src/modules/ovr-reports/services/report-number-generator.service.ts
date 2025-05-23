import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OVRReport } from '../entities/ovr-report.entity';

@Injectable()
export class ReportNumberGeneratorService {
  constructor(
    @InjectRepository(OVRReport)
    private readonly reportRepository: Repository<OVRReport>,
  ) {}

  /**
   * توليد رقم تقرير جديد بصيغة OVR-YYYY_XXXX
   * حيث YYYY هي السنة الحالية و XXXX هو رقم متسلسل يبدأ من 1
   */
  async generateReportNumber(): Promise<string> {
    const currentYear = new Date().getFullYear();
    const yearPrefix = `OVR-${currentYear}_`;

    // البحث عن آخر رقم تقرير في السنة الحالية
    const lastReport = await this.reportRepository
      .createQueryBuilder('report')
      .where('report.reportNumber LIKE :prefix', { prefix: `${yearPrefix}%` })
      .orderBy('report.reportNumber', 'DESC')
      .getOne();

    let nextNumber = 1;

    if (lastReport) {
      // استخراج الرقم من آخر تقرير
      const lastNumberPart = lastReport.reportNumber.split('_')[1];
      const lastNumber = parseInt(lastNumberPart, 10);
      nextNumber = lastNumber + 1;
    }

    // تنسيق الرقم بأربعة أرقام مع إضافة أصفار في البداية إذا لزم الأمر
    const formattedNumber = nextNumber.toString().padStart(4, '0');
    
    return `${yearPrefix}${formattedNumber}`;
  }

  /**
   * التحقق من وجود رقم التقرير
   */
  async isReportNumberExists(reportNumber: string): Promise<boolean> {
    const count = await this.reportRepository.count({
      where: { reportNumber },
    });
    return count > 0;
  }

  /**
   * توليد رقم تقرير فريد (مع إعادة المحاولة في حالة التضارب)
   */
  async generateUniqueReportNumber(): Promise<string> {
    let reportNumber: string;
    let attempts = 0;
    const maxAttempts = 10;

    do {
      reportNumber = await this.generateReportNumber();
      attempts++;
      
      if (attempts >= maxAttempts) {
        throw new Error('فشل في توليد رقم تقرير فريد بعد عدة محاولات');
      }
    } while (await this.isReportNumberExists(reportNumber));

    return reportNumber;
  }

  /**
   * الحصول على إحصائيات التقارير للسنة الحالية
   */
  async getCurrentYearStats(): Promise<{
    year: number;
    totalReports: number;
    lastReportNumber: string | null;
  }> {
    const currentYear = new Date().getFullYear();
    const yearPrefix = `OVR-${currentYear}_`;

    const totalReports = await this.reportRepository.count({
      where: {
        reportNumber: {
          like: `${yearPrefix}%`,
        } as any,
      },
    });

    const lastReport = await this.reportRepository
      .createQueryBuilder('report')
      .where('report.reportNumber LIKE :prefix', { prefix: `${yearPrefix}%` })
      .orderBy('report.reportNumber', 'DESC')
      .getOne();

    return {
      year: currentYear,
      totalReports,
      lastReportNumber: lastReport?.reportNumber || null,
    };
  }
}