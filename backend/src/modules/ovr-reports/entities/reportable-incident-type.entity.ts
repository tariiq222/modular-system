import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index, ManyToOne, JoinColumn } from 'typeorm';
import { IsNotEmpty, IsString, IsBoolean, MaxLength } from 'class-validator';
import { IncidentType } from './incident-type.entity';

@Entity('ovr_reportable_incident_types')
export class ReportableIncidentType {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ length: 100 })
  @Index()
  @IsNotEmpty({ message: 'نوع الحادثة القابل للإبلاغ باللغة العربية مطلوب' })
  @IsString({ message: 'نوع الحادثة القابل للإبلاغ باللغة العربية يجب أن يكون نصاً' })
  @MaxLength(100, { message: 'نوع الحادثة القابل للإبلاغ باللغة العربية يجب أن يكون أقل من 100 حرف' })
  nameAr!: string;

  @Column({ length: 100 })
  @Index()
  @IsNotEmpty({ message: 'نوع الحادثة القابل للإبلاغ باللغة الإنجليزية مطلوب' })
  @IsString({ message: 'نوع الحادثة القابل للإبلاغ باللغة الإنجليزية يجب أن يكون نصاً' })
  @MaxLength(100, { message: 'نوع الحادثة القابل للإبلاغ باللغة الإنجليزية يجب أن يكون أقل من 100 حرف' })
  nameEn!: string;

  @Column({ type: 'text', nullable: true })
  @IsString({ message: 'الوصف يجب أن يكون نصاً' })
  description?: string;

  @ManyToOne(() => IncidentType, incidentType => incidentType.reportableTypes, { nullable: false })
  @JoinColumn({ name: 'incident_type_id' })
  incidentType!: IncidentType;

  @Column({ name: 'incident_type_id' })
  incidentTypeId!: string;

  @Column({ default: true })
  @IsBoolean({ message: 'حالة النشاط يجب أن تكون صحيح أو خطأ' })
  isActive!: boolean;

  @Column({ default: 0 })
  sortOrder!: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}