import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { OVRReport } from './ovr-report.entity';
import { User } from '../../users/entities/user.entity';

@Entity('ovr_report_comments')
export class ReportComment {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => OVRReport, report => report.comments, { nullable: false })
  @JoinColumn({ name: 'report_id' })
  report!: OVRReport;

  @Column({ name: 'report_id' })
  reportId!: string;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column({ name: 'user_id' })
  userId!: string;

  @Column({ type: 'text' })
  @IsNotEmpty({ message: 'نص التعليق مطلوب' })
  @IsString({ message: 'نص التعليق يجب أن يكون نصاً' })
  comment!: string;

  @Column({ name: 'comment_type', length: 50, default: 'general' })
  @IsString({ message: 'نوع التعليق يجب أن يكون نصاً' })
  @MaxLength(50, { message: 'نوع التعليق يجب أن يكون أقل من 50 حرف' })
  commentType!: string; // general, status_change, internal, etc.

  @Column({ name: 'is_internal', default: false })
  isInternal!: boolean; // تعليق داخلي أم عام

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}