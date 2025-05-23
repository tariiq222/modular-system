import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { IsOptional, IsString, IsEnum } from 'class-validator';
import { UserRole } from '../entities/user.entity';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @IsString()
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsOptional()
  lastName?: string;

  @IsString()
  @IsOptional()
  currentPassword?: string;

  @IsString()
  @IsOptional()
  newPassword?: string;

  @IsEnum(UserRole, { message: 'دور المستخدم غير صالح' })
  @IsOptional()
  role?: UserRole;

  @IsOptional()
  isActive?: boolean;

  @IsOptional()
  lastLoginAt?: Date;
}
