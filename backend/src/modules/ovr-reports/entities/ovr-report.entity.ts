import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany, Index } from 'typeorm';
import { IsNotEmpty, IsOptional, IsEmail, IsEnum, IsBoolean, IsDateString, IsString, MaxLength } from 'class-validator';
import { User } from '../../users/entities/user.entity';
import { JobTitle } from './job-title.entity';
import { Department } from './department.entity';
import { Section } from './section.entity';
import { IncidentType } from './incident-type.entity';
import { ReportableIncidentType } from './reportable-incident-type.entity';
import { ContributingFactor } from './contributing-factor.entity';
import { ReportComment } from './report-comment.entity';
import { ReportStatusHistory } from './report-status-history.entity';
import { ReportStatus } from '../enums/report-status.enum';
import { GenderType } from '../enums/gender-type.enum';

@Entity('ovr_reports')
export class OVRReport {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true, length: 20 })
  @Index()
  @IsNotEmpty({ message: 'رقم التقرير مطلوب' })
  reportNumber!: string;

  // معلومات المُبلّغ
  @Column({ name: 'reporter_name' })
  @IsNotEmpty({ message: 'اسم المُبلّغ مطلوب' })
  @MaxLength(100, { message: 'اسم المُبلّغ يجب أن يكون أقل من 100 حرف' })
  reporterName!: string;

  @Column({ name: 'reporter_email', nullable: true })
  @IsOptional()
  @IsEmail({}, { message: 'البريد الإلكتروني غير صالح' })
  reporterEmail?: string;

  @Column({ name: 'reporter_extension', nullable: true })
  @IsOptional()
  @MaxLength(10, { message: 'رقم التحويلة يجب أن يكون أقل من 10 أرقام' })
  reporterExtension?: string;

  // العلاقات مع الإعدادات
  @ManyToOne(() => JobTitle, { nullable: false })
  @JoinColumn({ name: 'job_title_id' })
  jobTitle!: JobTitle;

  @Column({ name: 'job_title_id' })
  jobTitleId!: string;

  @ManyToOne(() => Department, { nullable: false })
  @JoinColumn({ name: 'department_id' })
  department!: Department;

  @Column({ name: 'department_id' })
  departmentId!: string;

  @ManyToOne(() => Section, { nullable: false })
  @JoinColumn({ name: 'section_id' })
  section!: Section;

  @Column({ name: 'section_id' })
  sectionId!: string;

  // معلومات الحادثة
  @Column({ name: 'incident_date', type: 'timestamp' })
  @IsNotEmpty({ message: 'تاريخ ووقت الحادثة مطلوب' })
  @IsDateString({}, { message: 'تاريخ الحادثة غير صالح' })
  incidentDate!: Date;

  @ManyToOne(() => IncidentType, { nullable: false })
  @JoinColumn({ name: 'incident_type_id' })
  incidentType!: IncidentType;

  @Column({ name: 'incident_type_id' })
  incidentTypeId!: string;

  @ManyToOne(() => ReportableIncidentType, { nullable: true })
  @JoinColumn({ name: 'reportable_incident_type_id' })
  reportableIncidentType?: ReportableIncidentType;

  @Column({ name: 'reportable_incident_type_id', nullable: true })
  reportableIncidentTypeId?: string;

  // معلومات المريض
  @Column({ name: 'is_patient_related', default: false })
  @IsBoolean({ message: 'حقل متعلق بمريض يجب أن يكون صحيح أو خطأ' })
  isPatientRelated!: boolean;

  @Column({ name: 'patient_name', nullable: true })
  @IsOptional()
  @MaxLength(100, { message: 'اسم المريض يجب أن يكون أقل من 100 حرف' })
  patientName?: string;

  @Column({ name: 'patient_file_number', nullable: true })
  @IsOptional()
  @MaxLength(20, { message: 'رقم ملف المريض يجب أن يكون أقل من 20 رقم' })
  patientFileNumber?: string;

  @Column({
    name: 'patient_gender',
    type: 'enum',
    enum: GenderType,
    enumName: 'gender_type_enum',
    nullable: true
  })
  @IsOptional()
  @IsEnum(GenderType, { message: 'جنس المريض غير صالح' })
  patientGender?: GenderType;

  @Column({ name: 'patient_birth_date', type: 'date', nullable: true })
  @IsOptional()
  @IsDateString({}, { message: 'تاريخ ميلاد المريض غير صالح' })
  patientBirthDate?: Date;

  // إبلاغ السلطات
  @Column({ name: 'authorities_notified', default: false })
  @IsBoolean({ message: 'حقل إبلاغ السلطات يجب أن يكون صحيح أو خطأ' })
  authoritiesNotified!: boolean;

  // تفاصيل الحادثة
  @Column({ name: 'incident_description', type: 'text' })
  @IsNotEmpty({ message: 'وصف الحادثة مطلوب' })
  incidentDescription!: string;

  @Column({ name: 'actions_taken', type: 'text', nullable: true })
  @IsOptional()
  actionsTaken?: string;

  // العوامل المساهمة (علاقة many-to-many)
  @Column({ name: 'contributing_factor_ids', type: 'json', nullable: true })
  contributingFactorIds?: string[];

  // العلاقة مع العوامل المساهمة (للاختيار المتعدد)
  @Column({ name: 'contributing_factors_text', type: 'text', nullable: true })
  contributingFactorsText?: string; // نص يحتوي على أسماء العوامل المساهمة المختارة (للعرض السريع)

  // حالة التقرير
  @Column({
    name: 'status',
    type: 'enum',
    enum: ReportStatus,
    enumName: 'report_status_enum',
    default: ReportStatus.NEW,
  })
  @IsEnum(ReportStatus, { message: 'حالة التقرير غير صالحة' })
  status!: ReportStatus;

  // المستخدم المسؤول (إذا كان مسجلاً)
  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'assigned_user_id' })
  assignedUser?: User;

  @Column({ name: 'assigned_user_id', nullable: true })
  assignedUserId?: string;

  // العلاقات
  @OneToMany(() => ReportComment, comment => comment.report)
  comments!: ReportComment[];

  @OneToMany(() => ReportStatusHistory, history => history.report)
  statusHistory!: ReportStatusHistory[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  // تاريخ الإغلاق
  @Column({ name: 'closed_at', type: 'timestamp', nullable: true })
  closedAt?: Date;

  // تاريخ الأرشفة
  @Column({ name: 'archived_at', type: 'timestamp', nullable: true })
  archivedAt?: Date;
}