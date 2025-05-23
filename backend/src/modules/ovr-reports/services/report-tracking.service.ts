import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OVRReport } from '../entities/ovr-report.entity';
import { ReportComment } from '../entities/report-comment.entity';
import { ReportStatusHistory } from '../entities/report-status-history.entity';

export interface ReportTrackingInfo {
  report: {
    reportNumber: string;
    status: string;
    createdAt: Date;
    incidentDate: Date;
    incidentDescription: string;
    reporterName: string;
    departmentName: string;
    sectionName: string;
    incidentTypeName: string;
  };
  statusHistory: Array<{
    status: string;
    changedAt: Date;
    changedBy?: string;
    reason?: string;
    notes?: string;
  }>;
  publicComments: Array<{
    comment: string;
    createdAt: Date;
    commentType: string;
  }>;
}

@Injectable()
export class ReportTrackingService {
  constructor(
    @InjectRepository(OVRReport)
    private readonly reportRepository: Repository<OVRReport>,
    @InjectRepository(ReportComment)
    private readonly commentRepository: Repository<ReportComment>,
    @InjectRepository(ReportStatusHistory)
    private readonly statusHistoryRepository: Repository<ReportStatusHistory>,
  ) {}

  /**
   * تتبع التقرير برقم التقرير (للعامة)
   */
  async trackReport(reportNumber: string): Promise<ReportTrackingInfo> {
    const report = await this.reportRepository.findOne({
      where: { reportNumber },
      relations: [
        'department',
        'section',
        'incidentType',
        'statusHistory',
        'statusHistory.changedByUser',
        'comments',
      ],
    });

    if (!report) {
      throw new NotFoundException('رقم التقرير غير صحيح');
    }

    // معلومات التقرير الأساسية
    const reportInfo = {
      reportNumber: report.reportNumber,
      status: this.getStatusDisplayName(report.status),
      createdAt: report.createdAt,
      incidentDate: report.incidentDate,
      incidentDescription: report.incidentDescription,
      reporterName: report.reporterName,
      departmentName: report.department.nameAr,
      sectionName: report.section.nameAr,
      incidentTypeName: report.incidentType.nameAr,
    };

    // تاريخ تغيير الحالات
    const statusHistory = report.statusHistory
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
      .map(history => ({
        status: this.getStatusDisplayName(history.newStatus),
        changedAt: history.createdAt,
        changedBy: history.changedByUser?.firstName 
          ? `${history.changedByUser.firstName} ${history.changedByUser.lastName}`
          : undefined,
        reason: history.reason,
        notes: history.notes,
      }));

    // التعليقات العامة فقط (غير الداخلية)
    const publicComments = report.comments
      .filter(comment => !comment.isInternal)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
      .map(comment => ({
        comment: comment.comment,
        createdAt: comment.createdAt,
        commentType: comment.commentType,
      }));

    return {
      report: reportInfo,
      statusHistory,
      publicComments,
    };
  }

  /**
   * الحصول على معلومات مبسطة للتقرير (للتحقق من وجوده)
   */
  async getReportBasicInfo(reportNumber: string): Promise<{
    exists: boolean;
    status?: string;
    createdAt?: Date;
  }> {
    const report = await this.reportRepository.findOne({
      where: { reportNumber },
      select: ['reportNumber', 'status', 'createdAt'],
    });

    if (!report) {
      return { exists: false };
    }

    return {
      exists: true,
      status: this.getStatusDisplayName(report.status),
      createdAt: report.createdAt,
    };
  }

  /**
   * البحث عن التقارير بمعايير مختلفة (للعامة - محدود)
   */
  async searchPublicReports(criteria: {
    reporterName?: string;
    incidentDate?: Date;
    departmentId?: string;
  }): Promise<Array<{
    reportNumber: string;
    status: string;
    createdAt: Date;
    incidentDate: Date;
    departmentName: string;
  }>> {
    const queryBuilder = this.reportRepository
      .createQueryBuilder('report')
      .leftJoinAndSelect('report.department', 'department')
      .select([
        'report.reportNumber',
        'report.status',
        'report.createdAt',
        'report.incidentDate',
        'department.nameAr',
      ]);

    if (criteria.reporterName) {
      queryBuilder.andWhere('report.reporterName ILIKE :reporterName', {
        reporterName: `%${criteria.reporterName}%`,
      });
    }

    if (criteria.incidentDate) {
      const startOfDay = new Date(criteria.incidentDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(criteria.incidentDate);
      endOfDay.setHours(23, 59, 59, 999);

      queryBuilder.andWhere('report.incidentDate BETWEEN :startOfDay AND :endOfDay', {
        startOfDay,
        endOfDay,
      });
    }

    if (criteria.departmentId) {
      queryBuilder.andWhere('report.departmentId = :departmentId', {
        departmentId: criteria.departmentId,
      });
    }

    // ترتيب بالأحدث أولاً
    queryBuilder.orderBy('report.createdAt', 'DESC');

    // تحديد عدد النتائج لتجنب الحمل الزائد
    queryBuilder.limit(50);

    const reports = await queryBuilder.getMany();

    return reports.map(report => ({
      reportNumber: report.reportNumber,
      status: this.getStatusDisplayName(report.status),
      createdAt: report.createdAt,
      incidentDate: report.incidentDate,
      departmentName: report.department.nameAr,
    }));
  }

  /**
   * الحصول على إحصائيات عامة للتقارير
   */
  async getPublicStatistics(): Promise<{
    totalReports: number;
    reportsThisMonth: number;
    reportsThisYear: number;
    statusDistribution: Record<string, number>;
  }> {
    const totalReports = await this.reportRepository.count();

    // تقارير هذا الشهر
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const reportsThisMonth = await this.reportRepository.count({
      where: {
        createdAt: {
          gte: startOfMonth,
        } as any,
      },
    });

    // تقارير هذا العام
    const startOfYear = new Date();
    startOfYear.setMonth(0, 1);
    startOfYear.setHours(0, 0, 0, 0);

    const reportsThisYear = await this.reportRepository.count({
      where: {
        createdAt: {
          gte: startOfYear,
        } as any,
      },
    });

    // توزيع الحالات
    const statusStats = await this.reportRepository
      .createQueryBuilder('report')
      .select('report.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('report.status')
      .getRawMany();

    const statusDistribution: Record<string, number> = {};
    statusStats.forEach(stat => {
      statusDistribution[this.getStatusDisplayName(stat.status)] = parseInt(stat.count);
    });

    return {
      totalReports,
      reportsThisMonth,
      reportsThisYear,
      statusDistribution,
    };
  }

  /**
   * تحويل حالة التقرير إلى اسم قابل للعرض
   */
  private getStatusDisplayName(status: string): string {
    const statusNames: Record<string, string> = {
      'new': 'جديد',
      'in_progress': 'قيد المعالجة',
      'closed': 'مغلق',
      'archived': 'مؤرشف',
    };

    return statusNames[status] || status;
  }

  /**
   * التحقق من صحة رقم التقرير
   */
  validateReportNumber(reportNumber: string): boolean {
    // تحقق من صيغة رقم التقرير: OVR-YYYY_XXXX
    const pattern = /^OVR-\d{4}_\d{4}$/;
    return pattern.test(reportNumber);
  }
}