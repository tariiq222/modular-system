import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RequestResetPasswordDto {
  @ApiProperty({
    description: 'البريد الإلكتروني للمستخدم',
    example: 'user@example.com',
    format: 'email'
  })
  @IsEmail({}, { message: 'البريد الإلكتروني غير صالح' })
  @IsNotEmpty({ message: 'البريد الإلكتروني مطلوب' })
  email: string = '';
}

export class ResetPasswordDto {
  @ApiProperty({
    description: 'كلمة المرور الجديدة',
    example: 'newPassword123',
    minLength: 6
  })
  @IsString()
  @MinLength(6, { message: 'يجب أن تكون كلمة المرور 6 أحرف على الأقل' })
  @IsNotEmpty({ message: 'كلمة المرور الجديدة مطلوبة' })
  password: string = '';

  @ApiProperty({
    description: 'رمز إعادة تعيين كلمة المرور المرسل عبر البريد الإلكتروني',
    example: 'abc123def456'
  })
  @IsString()
  @IsNotEmpty({ message: 'رمز إعادة تعيين كلمة المرور مطلوب' })
  token: string = '';
}
