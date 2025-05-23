import { Injectable } from '@nestjs/common';
import { Repository, DataSource, SelectQueryBuilder } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { OVRReport } from '../entities/ovr-report.entity';
import { ReportStatus } from '../enums/report-status.enum';

export interface ReportFilterOptions {
  status?: ReportStatus;
  reportNumber?: string;
  reporterName?: string;
  departmentId?: string;
  sectionId?: string;
  incidentTypeId?: string;
  isPatientRelated?: boolean;
  dateFrom?: Date;
  dateTo?: Date;
  assignedUserId?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface ReportSearchResult {
  reports: OVRReport[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Injectable()
export class OVRReportRepository extends Repository<OVRReport> {
  constructor(
    @InjectRepository(OVRReport)
    private readonly reportRepository: Repository<OVRReport>,
    private readonly dataSource: DataSource,
  ) {
    super(OVRReport, dataSource.createEntityManager());
  }

  /**
   * البحث المتقدم في التقارير مع الفلترة والترقيم
   */
  async findWithFilters(options: ReportFilterOptions): Promise<ReportSearchResult> {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
      ...filters
    } = options;

    const queryBuilder = this.createQueryBuilder('report')
      .leftJoinAndSelect('report.jobTitle', 'jobTitle')
      .leftJoinAndSelect('report.department', 'department')
      .leftJoinAndSelect('report.section', 'section')
      .leftJoinAndSelect('report.incidentType', 'incidentType')
      .leftJoinAndSelect('report.reportableIncidentType', 'reportableIncidentType')
      .leftJoinAndSelect('report.assignedUser', 'assignedUser');

    this.applyFilters(queryBuilder, filters);

    // الترتيب
    queryBuilder.orderBy(`report.${sortBy}`, sortOrder);

    // الترقيم
    const offset = (page - 1) * limit;
    queryBuilder.skip(offset).take(limit);

    const [reports, total] = await queryBuilder.getManyAndCount();

    return {
      reports,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * البحث بالنص في التقارير
   */
  async searchReports(searchTerm: string, options: ReportFilterOptions = {}): Promise<ReportSearchResult> {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = options;

    const queryBuilder = this.createQueryBuilder('report')
      .leftJoinAndSelect('report.jobTitle', 'jobTitle')
      .leftJoinAndSelect('report.department', 'department')
      .leftJoinAndSelect('report.section', 'section')
      .leftJoinAndSelect('report.incidentType', 'incidentType')
      .leftJoinAndSelect('report.reportableIncidentType', 'reportableIncidentType')
      .leftJoinAndSelect('report.assignedUser', 'assignedUser')
      .where(
        '(report.reportNumber ILIKE :searchTerm OR ' +
        'report.reporterName ILIKE :searchTerm OR ' +
        'report.incidentDescription ILIKE :searchTerm OR ' +
        'report.patientName ILIKE :searchTerm OR ' +
        'report.patientFileNumber ILIKE :searchTerm)',
        { searchTerm: `%${searchTerm}%` }
      );

    // تطبيق الفلاتر الإضافية
    this.applyFilters(queryBuilder, options);

    queryBuilder.orderBy(`report.${sortBy}`, sortOrder);

    const offset = (page - 1) * limit;
    queryBuilder.skip(offset).take(limit);

    const [reports, total] = await queryBuilder.getManyAndCount();

    return {
      reports,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * البحث عن تقرير برقم التقرير
   */
  async findByReportNumber(reportNumber: string): Promise<OVRReport | null> {
    return this.reportRepository.findOne({
      where: { reportNumber },
      relations: [
        'jobTitle',
        'department',
        'section',
        'incidentType',
        'reportableIncidentType',
        'assignedUser',
        'comments',
        'comments.user',
        'statusHistory',
        'statusHistory.changedByUser',
      ],
    });
  }

  /**
   * الحصول على إحصائيات التقارير
   */
  async getReportsStatistics(): Promise<{
    total: number;
    byStatus: Record<ReportStatus, number>;
    thisMonth: number;
    thisYear: number;
  }> {
    const total = await this.reportRepository.count();

    // إحصائيات حسب الحالة
    const statusStats = await this.reportRepository
      .createQueryBuilder('report')
      .select('report.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('report.status')
      .getRawMany();

    const byStatus = {} as Record<ReportStatus, number>;
    Object.values(ReportStatus).forEach(status => {
      byStatus[status] = 0;
    });
    statusStats.forEach(stat => {
      byStatus[stat.status as ReportStatus] = parseInt(stat.count);
    });

    // إحصائيات هذا الشهر
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const thisMonth = await this.reportRepository.count({
      where: {
        createdAt: {
          gte: startOfMonth,
        } as any,
      },
    });

    // إحصائيات هذا العام
    const startOfYear = new Date();
    startOfYear.setMonth(0, 1);
    startOfYear.setHours(0, 0, 0, 0);

    const thisYear = await this.reportRepository.count({
      where: {
        createdAt: {
          gte: startOfYear,
        } as any,
      },
    });

    return {
      total,
      byStatus,
      thisMonth,
      thisYear,
    };
  }

  /**
   * تطبيق الفلاتر على الاستعلام
   */
  private applyFilters(queryBuilder: SelectQueryBuilder<OVRReport>, filters: Partial<ReportFilterOptions>): void {
    if (filters.status) {
      queryBuilder.andWhere('report.status = :status', { status: filters.status });
    }

    if (filters.reportNumber) {
      queryBuilder.andWhere('report.reportNumber ILIKE :reportNumber', { 
        reportNumber: `%${filters.reportNumber}%` 
      });
    }

    if (filters.reporterName) {
      queryBuilder.andWhere('report.reporterName ILIKE :reporterName', { 
        reporterName: `%${filters.reporterName}%` 
      });
    }

    if (filters.departmentId) {
      queryBuilder.andWhere('report.departmentId = :departmentId', { 
        departmentId: filters.departmentId 
      });
    }

    if (filters.sectionId) {
      queryBuilder.andWhere('report.sectionId = :sectionId', { 
        sectionId: filters.sectionId 
      });
    }

    if (filters.incidentTypeId) {
      queryBuilder.andWhere('report.incidentTypeId = :incidentTypeId', { 
        incidentTypeId: filters.incidentTypeId 
      });
    }

    if (filters.isPatientRelated !== undefined) {
      queryBuilder.andWhere('report.isPatientRelated = :isPatientRelated', { 
        isPatientRelated: filters.isPatientRelated 
      });
    }

    if (filters.assignedUserId) {
      queryBuilder.andWhere('report.assignedUserId = :assignedUserId', { 
        assignedUserId: filters.assignedUserId 
      });
    }

    if (filters.dateFrom) {
      queryBuilder.andWhere('report.incidentDate >= :dateFrom', { 
        dateFrom: filters.dateFrom 
      });
    }

    if (filters.dateTo) {
      queryBuilder.andWhere('report.incidentDate <= :dateTo', { 
        dateTo: filters.dateTo 
      });
    }
  }
}