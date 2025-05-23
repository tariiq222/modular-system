import { IsEmail, IsNotEmpty, IsString, MinLength, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '../entities/user.entity';

export class CreateUserDto {
  @ApiProperty({
    description: 'البريد الإلكتروني للمستخدم',
    example: 'user@example.com',
    format: 'email'
  })
  @IsEmail({}, { message: 'البريد الإلكتروني غير صالح' })
  @IsNotEmpty({ message: 'البريد الإلكتروني مطلوب' })
  email: string = '';

  @ApiProperty({
    description: 'كلمة مرور المستخدم',
    example: 'password123',
    minLength: 6
  })
  @IsString()
  @MinLength(6, { message: 'يجب أن تكون كلمة المرور 6 أحرف على الأقل' })
  @IsNotEmpty({ message: 'كلمة المرور مطلوبة' })
  password: string = '';

  @ApiPropertyOptional({
    description: 'الاسم الأول للمستخدم',
    example: 'أحمد'
  })
  @IsString()
  @IsOptional()
  firstName?: string;

  @ApiPropertyOptional({
    description: 'الاسم الأخير للمستخدم',
    example: 'محمد'
  })
  @IsString()
  @IsOptional()
  lastName?: string;

  @ApiPropertyOptional({
    description: 'دور المستخدم في النظام',
    enum: UserRole,
    example: UserRole.USER
  })
  @IsEnum(UserRole, { message: 'دور المستخدم غير صالح' })
  @IsOptional()
  role?: UserRole;
}
