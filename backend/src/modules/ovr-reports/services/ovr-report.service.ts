import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { OVRReport } from '../entities/ovr-report.entity';
import { ReportStatus } from '../enums/report-status.enum';
import { ReportComment } from '../entities/report-comment.entity';
import { ReportStatusHistory } from '../entities/report-status-history.entity';
import { ContributingFactor } from '../entities/contributing-factor.entity';
import { CreateOVRReportDto } from '../dtos/create-ovr-report.dto';
import { UpdateOVRReportDto, UpdateReportStatusDto, AddCommentDto } from '../dtos/update-ovr-report.dto';
import { ReportNumberGeneratorService } from './report-number-generator.service';
import { OVRReportRepository, ReportFilterOptions } from '../repositories/ovr-report.repository';

@Injectable()
export class OVRReportService {
  constructor(
    @InjectRepository(OVRReport)
    private readonly reportRepository: Repository<OVRReport>,
    @InjectRepository(ReportComment)
    private readonly commentRepository: Repository<ReportComment>,
    @InjectRepository(ReportStatusHistory)
    private readonly statusHistoryRepository: Repository<ReportStatusHistory>,
    @InjectRepository(ContributingFactor)
    private readonly contributingFactorRepository: Repository<ContributingFactor>,
    private readonly reportNumberGenerator: ReportNumberGeneratorService,
    private readonly customReportRepository: OVRReportRepository,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * إنشاء تقرير جديد
   */
  async create(createReportDto: CreateOVRReportDto): Promise<OVRReport> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // توليد رقم التقرير
      const reportNumber = await this.reportNumberGenerator.generateUniqueReportNumber();

      // إنشاء التقرير
      const report = this.reportRepository.create({
        reportNumber,
        // معلومات المُبلّغ
        reporterName: createReportDto.reporterInfo.reporterName,
        reporterEmail: createReportDto.reporterInfo.reporterEmail,
        reporterExtension: createReportDto.reporterInfo.reporterExtension,
        jobTitleId: createReportDto.reporterInfo.jobTitleId,
        departmentId: createReportDto.reporterInfo.departmentId,
        sectionId: createReportDto.reporterInfo.sectionId,
        // معلومات الحادثة
        incidentDate: new Date(createReportDto.incidentInfo.incidentDate),
        incidentTypeId: createReportDto.incidentInfo.incidentTypeId,
        reportableIncidentTypeId: createReportDto.incidentInfo.reportableIncidentTypeId,
        authoritiesNotified: createReportDto.incidentInfo.authoritiesNotified,
        // معلومات المريض
        isPatientRelated: createReportDto.isPatientRelated,
        patientName: createReportDto.patientInfo?.patientName,
        patientFileNumber: createReportDto.patientInfo?.patientFileNumber,
        patientGender: createReportDto.patientInfo?.patientGender,
        patientBirthDate: createReportDto.patientInfo?.patientBirthDate 
          ? new Date(createReportDto.patientInfo.patientBirthDate) 
          : undefined,
        // تفاصيل الحادثة
        incidentDescription: createReportDto.incidentDetails.incidentDescription,
        actionsTaken: createReportDto.incidentDetails.actionsTaken,
        contributingFactorIds: createReportDto.incidentDetails.contributingFactorIds,
        contributingFactorsText: await this.generateContributingFactorsText(createReportDto.incidentDetails.contributingFactorIds),
        // الحالة الافتراضية
        status: ReportStatus.NEW,
      });

      const savedReport = await queryRunner.manager.save(report);

      // إنشاء سجل في تاريخ الحالات
      const statusHistory = this.statusHistoryRepository.create({
        reportId: savedReport.id,
        previousStatus: undefined,
        newStatus: ReportStatus.NEW,
        reason: 'تم إنشاء التقرير',
      });

      await queryRunner.manager.save(statusHistory);

      await queryRunner.commitTransaction();

      // إرجاع التقرير مع العلاقات
      return this.findOne(savedReport.id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * البحث عن جميع التقارير مع الفلترة
   */
  async findAll(filterOptions: ReportFilterOptions) {
    return this.customReportRepository.findWithFilters(filterOptions);
  }

  /**
   * البحث عن تقرير واحد
   */
  async findOne(id: string): Promise<OVRReport> {
    const report = await this.reportRepository.findOne({
      where: { id },
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

    if (!report) {
      throw new NotFoundException('التقرير غير موجود');
    }

    return report;
  }

  /**
   * البحث عن تقرير برقم التقرير
   */
  async findByReportNumber(reportNumber: string): Promise<OVRReport> {
    const report = await this.customReportRepository.findByReportNumber(reportNumber);
    
    if (!report) {
      throw new NotFoundException('التقرير غير موجود');
    }

    return report;
  }

  /**
   * تحديث التقرير
   */
  async update(id: string, updateReportDto: UpdateOVRReportDto, userId?: string): Promise<OVRReport> {
    const report = await this.findOne(id);

    // التحقق من إمكانية التحديث
    if (report.status === ReportStatus.ARCHIVED) {
      throw new BadRequestException('لا يمكن تحديث التقرير المؤرشف');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // تحديث البيانات
      Object.assign(report, {
        // معلومات المُبلّغ
        ...(updateReportDto.reporterInfo && {
          reporterName: updateReportDto.reporterInfo.reporterName,
          reporterEmail: updateReportDto.reporterInfo.reporterEmail,
          reporterExtension: updateReportDto.reporterInfo.reporterExtension,
          jobTitleId: updateReportDto.reporterInfo.jobTitleId,
          departmentId: updateReportDto.reporterInfo.departmentId,
          sectionId: updateReportDto.reporterInfo.sectionId,
        }),
        // معلومات الحادثة
        ...(updateReportDto.incidentInfo && {
          incidentDate: updateReportDto.incidentInfo.incidentDate 
            ? new Date(updateReportDto.incidentInfo.incidentDate) 
            : report.incidentDate,
          incidentTypeId: updateReportDto.incidentInfo.incidentTypeId,
          reportableIncidentTypeId: updateReportDto.incidentInfo.reportableIncidentTypeId,
          authoritiesNotified: updateReportDto.incidentInfo.authoritiesNotified,
        }),
        // معلومات المريض
        ...(updateReportDto.isPatientRelated !== undefined && {
          isPatientRelated: updateReportDto.isPatientRelated,
        }),
        ...(updateReportDto.patientInfo && {
          patientName: updateReportDto.patientInfo.patientName,
          patientFileNumber: updateReportDto.patientInfo.patientFileNumber,
          patientGender: updateReportDto.patientInfo.patientGender,
          patientBirthDate: updateReportDto.patientInfo.patientBirthDate 
            ? new Date(updateReportDto.patientInfo.patientBirthDate) 
            : report.patientBirthDate,
        }),
        // تفاصيل الحادثة
        ...(updateReportDto.incidentDetails && {
          incidentDescription: updateReportDto.incidentDetails.incidentDescription,
          actionsTaken: updateReportDto.incidentDetails.actionsTaken,
          contributingFactorIds: updateReportDto.incidentDetails.contributingFactorIds,
          contributingFactorsText: updateReportDto.incidentDetails.contributingFactorIds 
            ? await this.generateContributingFactorsText(updateReportDto.incidentDetails.contributingFactorIds)
            : report.contributingFactorsText,
        }),
        // المستخدم المسؤول
        ...(updateReportDto.assignedUserId !== undefined && {
          assignedUserId: updateReportDto.assignedUserId,
        }),
      });

      const updatedReport = await queryRunner.manager.save(report);

      await queryRunner.commitTransaction();

      return this.findOne(updatedReport.id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * تغيير حالة التقرير
   */
  async updateStatus(
    id: string, 
    updateStatusDto: UpdateReportStatusDto, 
    userId?: string
  ): Promise<OVRReport> {
    const report = await this.findOne(id);
    const previousStatus = report.status;

    // التحقق من صحة التغيير
    this.validateStatusTransition(previousStatus, updateStatusDto.status);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // تحديث الحالة
      report.status = updateStatusDto.status;
      report.assignedUserId = updateStatusDto.assignedUserId || report.assignedUserId;

      // تحديث تواريخ خاصة
      if (updateStatusDto.status === ReportStatus.CLOSED) {
        report.closedAt = new Date();
      } else if (updateStatusDto.status === ReportStatus.ARCHIVED) {
        report.archivedAt = new Date();
      }

      await queryRunner.manager.save(report);

      // إنشاء سجل في تاريخ الحالات
      const statusHistory = this.statusHistoryRepository.create({
        reportId: report.id,
        previousStatus,
        newStatus: updateStatusDto.status,
        changedByUserId: userId,
        reason: updateStatusDto.reason,
        notes: updateStatusDto.notes,
      });

      await queryRunner.manager.save(statusHistory);

      await queryRunner.commitTransaction();

      return this.findOne(report.id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * إضافة تعليق على التقرير
   */
  async addComment(
    reportId: string, 
    addCommentDto: AddCommentDto, 
    userId: string
  ): Promise<ReportComment> {
    const report = await this.findOne(reportId);

    const comment = this.commentRepository.create({
      reportId: report.id,
      userId,
      comment: addCommentDto.comment,
      commentType: addCommentDto.commentType || 'general',
      isInternal: addCommentDto.isInternal || false,
    });

    return this.commentRepository.save(comment);
  }

  /**
   * حذف التقرير (soft delete)
   */
  async remove(id: string): Promise<void> {
    const report = await this.findOne(id);
    
    if (report.status !== ReportStatus.NEW) {
      throw new BadRequestException('لا يمكن حذف التقرير إلا إذا كان في حالة جديد');
    }

    await this.reportRepository.softDelete(id);
  }

  /**
   * الحصول على إحصائيات التقارير
   */
  async getStatistics() {
    return this.customReportRepository.getReportsStatistics();
  }

  /**
   * البحث في التقارير
   */
  async search(searchTerm: string, filterOptions: ReportFilterOptions = {}) {
    return this.customReportRepository.searchReports(searchTerm, filterOptions);
  }

  /**
   * التحقق من صحة انتقال الحالة
   */
  private validateStatusTransition(currentStatus: ReportStatus, newStatus: ReportStatus): void {
    const validTransitions: Record<ReportStatus, ReportStatus[]> = {
      [ReportStatus.NEW]: [ReportStatus.IN_PROGRESS, ReportStatus.CLOSED],
      [ReportStatus.IN_PROGRESS]: [ReportStatus.CLOSED, ReportStatus.NEW],
      [ReportStatus.CLOSED]: [ReportStatus.ARCHIVED, ReportStatus.IN_PROGRESS],
      [ReportStatus.ARCHIVED]: [], // لا يمكن تغيير حالة التقرير المؤرشف
    };

    if (!validTransitions[currentStatus].includes(newStatus)) {
      throw new BadRequestException(
        `لا يمكن تغيير حالة التقرير من ${currentStatus} إلى ${newStatus}`
      );
    }
  }

  /**
   * توليد نص العوامل المساهمة من المعرفات
   */
  private async generateContributingFactorsText(factorIds?: string[]): Promise<string | undefined> {
    if (!factorIds || factorIds.length === 0) {
      return undefined;
    }

    const factors = await this.contributingFactorRepository.findByIds(factorIds);
    if (factors.length === 0) {
      return undefined;
    }

    // دمج أسماء العوامل المساهمة بفاصلة
    const factorNames = factors.map(factor => factor.nameAr);
    return factorNames.join('، ');
  }
}