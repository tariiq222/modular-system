import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { IsNotEmpty, IsString, IsBoolean, MaxLength } from 'class-validator';

@Entity('ovr_contributing_factors')
export class ContributingFactor {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ length: 100 })
  @Index()
  @IsNotEmpty({ message: 'العامل المساهم باللغة العربية مطلوب' })
  @IsString({ message: 'العامل المساهم باللغة العربية يجب أن يكون نصاً' })
  @MaxLength(100, { message: 'العامل المساهم باللغة العربية يجب أن يكون أقل من 100 حرف' })
  nameAr!: string;

  @Column({ length: 100 })
  @Index()
  @IsNotEmpty({ message: 'العامل المساهم باللغة الإنجليزية مطلوب' })
  @IsString({ message: 'العامل المساهم باللغة الإنجليزية يجب أن يكون نصاً' })
  @MaxLength(100, { message: 'العامل المساهم باللغة الإنجليزية يجب أن يكون أقل من 100 حرف' })
  nameEn!: string;

  @Column({ type: 'text', nullable: true })
  @IsString({ message: 'الوصف يجب أن يكون نصاً' })
  description?: string;

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