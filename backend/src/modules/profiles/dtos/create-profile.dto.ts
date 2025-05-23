import { IsOptional, IsString, IsEnum, IsBoolean, IsDate, IsUrl, IsPhoneNumber } from 'class-validator';
import { GenderType } from '../entities/profile.entity';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProfileDto {
  @ApiPropertyOptional({ description: 'نبذة شخصية عن المستخدم' })
  @IsString()
  @IsOptional()
  bio?: string;

  @ApiPropertyOptional({ description: 'رابط الصورة الشخصية' })
  @IsString()
  @IsOptional()
  avatar?: string;

  @ApiPropertyOptional({ description: 'رقم الهاتف بتنسيق دولي مثل +966501234567' })
  @IsPhoneNumber()
  @IsOptional()
  phoneNumber?: string;

  @ApiPropertyOptional({ description: 'العنوان' })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiPropertyOptional({ description: 'المدينة' })
  @IsString()
  @IsOptional()
  city?: string;

  @ApiPropertyOptional({ description: 'الدولة' })
  @IsString()
  @IsOptional()
  country?: string;

  @ApiPropertyOptional({ description: 'الرمز البريدي' })
  @IsString()
  @IsOptional()
  postalCode?: string;

  @ApiPropertyOptional({ 
    description: 'الجنس', 
    enum: GenderType,
    enumName: 'GenderType',
    example: GenderType.MALE
  })
  @IsEnum(GenderType)
  @IsOptional()
  gender?: GenderType;

  @ApiPropertyOptional({ 
    description: 'تاريخ الميلاد', 
    type: Date, 
    example: '1990-01-01T00:00:00.000Z' 
  })
  @Type(() => Date)
  @IsDate()
  @IsOptional()
  birthDate?: Date;

  @ApiPropertyOptional({ description: 'المهنة' })
  @IsString()
  @IsOptional()
  profession?: string;

  @ApiPropertyOptional({ description: 'الشركة أو المؤسسة' })
  @IsString()
  @IsOptional()
  company?: string;

  @ApiPropertyOptional({ 
    description: 'الموقع الإلكتروني الشخصي', 
    example: 'https://example.com' 
  })
  @IsUrl()
  @IsOptional()
  website?: string;

  @ApiPropertyOptional({ 
    description: 'رابط صفحة الفيسبوك', 
    example: 'https://facebook.com/username' 
  })
  @IsUrl()
  @IsOptional()
  facebookUrl?: string;

  @ApiPropertyOptional({ 
    description: 'رابط حساب تويتر', 
    example: 'https://twitter.com/username' 
  })
  @IsUrl()
  @IsOptional()
  twitterUrl?: string;

  @ApiPropertyOptional({ 
    description: 'رابط حساب لينكد إن', 
    example: 'https://linkedin.com/in/username' 
  })
  @IsUrl()
  @IsOptional()
  linkedinUrl?: string;

  @ApiPropertyOptional({ 
    description: 'رابط حساب انستغرام', 
    example: 'https://instagram.com/username' 
  })
  @IsUrl()
  @IsOptional()
  instagramUrl?: string;

  @ApiPropertyOptional({ 
    description: 'هل الملف الشخصي عام أم خاص', 
    default: false 
  })
  @IsBoolean()
  @IsOptional()
  isPublic?: boolean;
}