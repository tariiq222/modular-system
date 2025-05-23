import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { IsNotEmpty, IsString, IsEnum, MaxLength } from 'class-validator';
import { OVRReport } from './ovr-report.entity';
import { ReportStatus } from '../enums/report-status.enum';
import { User } from '../../users/entities/user.entity';

@Entity('ovr_report_status_history')
export class ReportStatusHistory {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => OVRReport, report => report.statusHistory, { nullable: false })
  @JoinColumn({ name: 'report_id' })
  report!: OVRReport;

  @Column({ name: 'report_id' })
  reportId!: string;

  @Column({
    name: 'previous_status',
    type: 'enum',
    enum: ReportStatus,
    enumName: 'report_status_enum',
    nullable: true
  })
  previousStatus?: ReportStatus;

  @Column({
    name: 'new_status',
    type: 'enum',
    enum: ReportStatus,
    enumName: 'report_status_enum',
    nullable: false
  })
  @IsNotEmpty({ message: 'الحالة الجديدة مطلوبة' })
  newStatus!: ReportStatus;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'changed_by_user_id' })
  changedByUser?: User;

  @Column({ name: 'changed_by_user_id', nullable: true })
  changedByUserId?: string;

  @Column({ type: 'text', nullable: true })
  @IsString({ message: 'سبب التغيير يجب أن يكون نصاً' })
  reason?: string;

  @Column({ type: 'text', nullable: true })
  @IsString({ message: 'الملاحظات يجب أن تكون نصاً' })
  notes?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}