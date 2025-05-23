import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index, OneToMany } from 'typeorm';
import { IsNotEmpty, IsString, IsBoolean, MaxLength } from 'class-validator';
import { Section } from './section.entity';

@Entity('ovr_departments')
export class Department {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ length: 100 })
  @Index()
  @IsNotEmpty({ message: 'اسم الإدارة باللغة العربية مطلوب' })
  @IsString({ message: 'اسم الإدارة باللغة العربية يجب أن يكون نصاً' })
  @MaxLength(100, { message: 'اسم الإدارة باللغة العربية يجب أن يكون أقل من 100 حرف' })
  nameAr!: string;

  @Column({ length: 100 })
  @Index()
  @IsNotEmpty({ message: 'اسم الإدارة باللغة الإنجليزية مطلوب' })
  @IsString({ message: 'اسم الإدارة باللغة الإنجليزية يجب أن يكون نصاً' })
  @MaxLength(100, { message: 'اسم الإدارة باللغة الإنجليزية يجب أن يكون أقل من 100 حرف' })
  nameEn!: string;

  @Column({ type: 'text', nullable: true })
  @IsString({ message: 'الوصف يجب أن يكون نصاً' })
  description?: string;

  @Column({ default: true })
  @IsBoolean({ message: 'حالة النشاط يجب أن تكون صحيح أو خطأ' })
  isActive!: boolean;

  @Column({ default: 0 })
  sortOrder!: number;

  @OneToMany(() => Section, section => section.department)
  sections!: Section[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}