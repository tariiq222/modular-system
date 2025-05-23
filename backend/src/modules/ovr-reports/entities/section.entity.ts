import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index, ManyToOne, JoinColumn } from 'typeorm';
import { IsNotEmpty, IsString, IsBoolean, MaxLength } from 'class-validator';
import { Department } from './department.entity';

@Entity('ovr_sections')
export class Section {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ length: 100 })
  @Index()
  @IsNotEmpty({ message: 'اسم القسم باللغة العربية مطلوب' })
  @IsString({ message: 'اسم القسم باللغة العربية يجب أن يكون نصاً' })
  @MaxLength(100, { message: 'اسم القسم باللغة العربية يجب أن يكون أقل من 100 حرف' })
  nameAr!: string;

  @Column({ length: 100 })
  @Index()
  @IsNotEmpty({ message: 'اسم القسم باللغة الإنجليزية مطلوب' })
  @IsString({ message: 'اسم القسم باللغة الإنجليزية يجب أن يكون نصاً' })
  @MaxLength(100, { message: 'اسم القسم باللغة الإنجليزية يجب أن يكون أقل من 100 حرف' })
  nameEn!: string;

  @Column({ type: 'text', nullable: true })
  @IsString({ message: 'الوصف يجب أن يكون نصاً' })
  description?: string;

  @ManyToOne(() => Department, department => department.sections, { nullable: false })
  @JoinColumn({ name: 'department_id' })
  department!: Department;

  @Column({ name: 'department_id' })
  departmentId!: string;

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