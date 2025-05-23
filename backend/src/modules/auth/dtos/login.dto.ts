import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
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
  @IsNotEmpty({ message: 'كلمة المرور مطلوبة' })
  password: string = '';
}
