import { Entity, PrimaryGeneratedColumn, Column, BeforeInsert, BeforeUpdate, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { IsEmail, IsNotEmpty, MinLength, IsBoolean, IsDate, IsOptional, IsUUID } from 'class-validator';
import * as bcrypt from 'bcryptjs';
import { Role } from '../../rbac/entities/role.entity';

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  PENDING = 'pending',
}

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  MODERATOR = 'moderator',
  MANAGER = 'manager',
  VIEWER = 'viewer',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  @IsEmail({}, { message: 'البريد الإلكتروني غير صالح' })
  @IsNotEmpty({ message: 'البريد الإلكتروني مطلوب' })
  email!: string;

  @Column({ select: false }) // Don't select password by default
  @MinLength(8, { message: 'يجب أن تكون كلمة المرور 8 أحرف على الأقل' })
  @IsNotEmpty({ message: 'كلمة المرور مطلوبة' })
  password!: string;

  @Column({ name: 'first_name' })
  @IsNotEmpty({ message: 'الاسم الأول مطلوب' })
  firstName!: string;

  @Column({ name: 'last_name' })
  @IsNotEmpty({ message: 'الاسم الأخير مطلوب' })
  lastName!: string;

  @Column({ name: 'phone_number', nullable: true })
  phoneNumber?: string;

  @Column({ name: 'avatar_url', nullable: true })
  avatarUrl?: string;

  @Column({
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.PENDING,
  })
  status!: UserStatus;

  @Column({ name: 'last_login_at', type: 'timestamp', nullable: true })
  lastLoginAt?: Date;

  @Column({ name: 'email_verified', default: false })
  emailVerified!: boolean;

  @Column({ name: 'must_change_password', default: true })
  mustChangePassword!: boolean;

  @Column({ name: 'failed_login_attempts', default: 0 })
  failedLoginAttempts!: number;

  @Column({ name: 'lock_until', type: 'timestamp', nullable: true })
  lockUntil?: Date;

  @ManyToOne(() => Role, { eager: true })
  @JoinColumn({ name: 'role_id' })
  role!: Role;

  @Column({ name: 'role_id', nullable: true })
  @IsUUID()
  roleId?: string;
  
  // يمكن إضافة علاقة ManyToMany مع كيان Role في المستقبل
  // @ManyToMany(() => Role)
  // @JoinTable({
  //   name: 'user_roles',
  //   joinColumn: { name: 'user_id', referencedColumnName: 'id' },
  //   inverseJoinColumn: { name: 'role_id', referencedColumnName: 'id' },
  // })
  // roles: Role[];

  @Column({ name: 'is_active', default: true })
  @IsBoolean()
  isActive: boolean = true;

  @Column({ name: 'last_login', type: 'timestamp', nullable: true })
  @IsDate()
  @IsOptional()
  lastLogin?: Date;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  @IsDate()
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  @IsDate()
  updatedAt!: Date;

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    if (this.password) {
      this.password = await bcrypt.hash(this.password, 10);
    }
  }

  async validatePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
  }

  toJSON() {
    const { password, ...result } = this;
    return result;
  }
}

export type UserWithoutPassword = Omit<User, 'password' | 'hashPassword' | 'validatePassword'>;
