import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index, OneToMany } from 'typeorm';
import { IsNotEmpty, IsString, IsBoolean, MaxLength } from 'class-validator';
import { ReportableIncidentType } from './reportable-incident-type.entity';

@Entity('ovr_incident_types')
export class IncidentType {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ length: 100 })
  @Index()
  @IsNotEmpty({ message: 'نوع الحادثة باللغة العربية مطلوب' })
  @IsString({ message: 'نوع الحادثة باللغة العربية يجب أن يكون نصاً' })
  @MaxLength(100, { message: 'نوع الحادثة باللغة العربية يجب أن يكون أقل من 100 حرف' })
  nameAr!: string;

  @Column({ length: 100 })
  @Index()
  @IsNotEmpty({ message: 'نوع الحادثة باللغة الإنجليزية مطلوب' })
  @IsString({ message: 'نوع الحادثة باللغة الإنجليزية يجب أن يكون نصاً' })
  @MaxLength(100, { message: 'نوع الحادثة باللغة الإنجليزية يجب أن يكون أقل من 100 حرف' })
  nameEn!: string;

  @Column({ type: 'text', nullable: true })
  @IsString({ message: 'الوصف يجب أن يكون نصاً' })
  description?: string;

  @Column({ default: true })
  @IsBoolean({ message: 'حالة النشاط يجب أن تكون صحيح أو خطأ' })
  isActive!: boolean;

  @Column({ default: 0 })
  sortOrder!: number;

  @OneToMany(() => ReportableIncidentType, reportableType => reportableType.incidentType)
  reportableTypes!: ReportableIncidentType[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}