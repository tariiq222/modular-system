import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { IsNotEmpty, IsString } from 'class-validator';

@Entity('system_settings')
export class SystemSetting {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  @IsNotEmpty({ message: 'مفتاح الإعداد مطلوب' })
  @IsString({ message: 'مفتاح الإعداد يجب أن يكون نصاً' })
  key!: string;

  @Column({ type: 'text', nullable: true })
  @IsString({ message: 'قيمة الإعداد يجب أن تكون نصاً' })
  value!: string;

  @Column({ type: 'text', nullable: true })
  @IsString({ message: 'وصف الإعداد يجب أن يكون نصاً' })
  description!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}