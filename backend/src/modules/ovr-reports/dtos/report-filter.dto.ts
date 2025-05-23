import { IsOptional, IsEnum, IsUUID, IsString, IsBoolean, IsDateString, IsInt, Min, Max } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ReportStatus } from '../enums/report-status.enum';

export class ReportFilterDto {
  @IsOptional()
  @IsEnum(ReportStatus, { message: 'حالة التقرير غير صالحة' })
  status?: ReportStatus;

  @IsOptional()
  @IsString({ message: 'رقم التقرير يجب أن يكون نصاً' })
  reportNumber?: string;

  @IsOptional()
  @IsString({ message: 'اسم المُبلّغ يجب أن يكون نصاً' })
  reporterName?: string;

  @IsOptional()
  @IsUUID('4', { message: 'معرف الإدارة غير صالح' })
  departmentId?: string;

  @IsOptional()
  @IsUUID('4', { message: 'معرف القسم غير صالح' })
  sectionId?: string;

  @IsOptional()
  @IsUUID('4', { message: 'معرف نوع الحادثة غير صالح' })
  incidentTypeId?: string;

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean({ message: 'حقل متعلق بمريض يجب أن يكون صحيح أو خطأ' })
  isPatientRelated?: boolean;

  @IsOptional()
  @IsDateString({}, { message: 'تاريخ البداية غير صالح' })
  dateFrom?: string;

  @IsOptional()
  @IsDateString({}, { message: 'تاريخ النهاية غير صالح' })
  dateTo?: string;

  @IsOptional()
  @IsUUID('4', { message: 'معرف المستخدم المسؤول غير صالح' })
  assignedUserId?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'رقم الصفحة يجب أن يكون رقماً صحيحاً' })
  @Min(1, { message: 'رقم الصفحة يجب أن يكون أكبر من 0' })
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'عدد العناصر في الصفحة يجب أن يكون رقماً صحيحاً' })
  @Min(1, { message: 'عدد العناصر في الصفحة يجب أن يكون أكبر من 0' })
  @Max(100, { message: 'عدد العناصر في الصفحة يجب أن يكون أقل من أو يساوي 100' })
  limit?: number = 10;

  @IsOptional()
  @IsString({ message: 'حقل الترتيب يجب أن يكون نصاً' })
  sortBy?: string = 'createdAt';

  @IsOptional()
  @IsEnum(['ASC', 'DESC'], { message: 'اتجاه الترتيب يجب أن يكون ASC أو DESC' })
  sortOrder?: 'ASC' | 'DESC' = 'DESC';
}

export class ReportSearchDto extends ReportFilterDto {
  @IsOptional()
  @IsString({ message: 'نص البحث يجب أن يكون نصاً' })
  searchTerm?: string;
}

export class ReportTrackingDto {
  @IsString({ message: 'رقم التقرير مطلوب' })
  reportNumber!: string;
}