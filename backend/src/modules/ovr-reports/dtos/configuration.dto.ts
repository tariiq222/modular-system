import { IsNotEmpty, IsString, IsBoolean, IsOptional, IsUUID, MaxLength, IsInt, Min } from 'class-validator';

// Job Title DTOs
export class CreateJobTitleDto {
  @IsNotEmpty({ message: 'المسمى الوظيفي باللغة العربية مطلوب' })
  @IsString({ message: 'المسمى الوظيفي باللغة العربية يجب أن يكون نصاً' })
  @MaxLength(100, { message: 'المسمى الوظيفي باللغة العربية يجب أن يكون أقل من 100 حرف' })
  nameAr!: string;

  @IsNotEmpty({ message: 'المسمى الوظيفي باللغة الإنجليزية مطلوب' })
  @IsString({ message: 'المسمى الوظيفي باللغة الإنجليزية يجب أن يكون نصاً' })
  @MaxLength(100, { message: 'المسمى الوظيفي باللغة الإنجليزية يجب أن يكون أقل من 100 حرف' })
  nameEn!: string;

  @IsOptional()
  @IsString({ message: 'الوصف يجب أن يكون نصاً' })
  description?: string;

  @IsOptional()
  @IsBoolean({ message: 'حالة النشاط يجب أن تكون صحيح أو خطأ' })
  isActive?: boolean;

  @IsOptional()
  @IsInt({ message: 'ترتيب العرض يجب أن يكون رقماً صحيحاً' })
  @Min(0, { message: 'ترتيب العرض يجب أن يكون أكبر من أو يساوي 0' })
  sortOrder?: number;
}

export class UpdateJobTitleDto extends CreateJobTitleDto {}

// Department DTOs
export class CreateDepartmentDto {
  @IsNotEmpty({ message: 'اسم الإدارة باللغة العربية مطلوب' })
  @IsString({ message: 'اسم الإدارة باللغة العربية يجب أن يكون نصاً' })
  @MaxLength(100, { message: 'اسم الإدارة باللغة العربية يجب أن يكون أقل من 100 حرف' })
  nameAr!: string;

  @IsNotEmpty({ message: 'اسم الإدارة باللغة الإنجليزية مطلوب' })
  @IsString({ message: 'اسم الإدارة باللغة الإنجليزية يجب أن يكون نصاً' })
  @MaxLength(100, { message: 'اسم الإدارة باللغة الإنجليزية يجب أن يكون أقل من 100 حرف' })
  nameEn!: string;

  @IsOptional()
  @IsString({ message: 'الوصف يجب أن يكون نصاً' })
  description?: string;

  @IsOptional()
  @IsBoolean({ message: 'حالة النشاط يجب أن تكون صحيح أو خطأ' })
  isActive?: boolean;

  @IsOptional()
  @IsInt({ message: 'ترتيب العرض يجب أن يكون رقماً صحيحاً' })
  @Min(0, { message: 'ترتيب العرض يجب أن يكون أكبر من أو يساوي 0' })
  sortOrder?: number;
}

export class UpdateDepartmentDto extends CreateDepartmentDto {}

// Section DTOs
export class CreateSectionDto {
  @IsNotEmpty({ message: 'اسم القسم باللغة العربية مطلوب' })
  @IsString({ message: 'اسم القسم باللغة العربية يجب أن يكون نصاً' })
  @MaxLength(100, { message: 'اسم القسم باللغة العربية يجب أن يكون أقل من 100 حرف' })
  nameAr!: string;

  @IsNotEmpty({ message: 'اسم القسم باللغة الإنجليزية مطلوب' })
  @IsString({ message: 'اسم القسم باللغة الإنجليزية يجب أن يكون نصاً' })
  @MaxLength(100, { message: 'اسم القسم باللغة الإنجليزية يجب أن يكون أقل من 100 حرف' })
  nameEn!: string;

  @IsNotEmpty({ message: 'معرف الإدارة مطلوب' })
  @IsUUID('4', { message: 'معرف الإدارة غير صالح' })
  departmentId!: string;

  @IsOptional()
  @IsString({ message: 'الوصف يجب أن يكون نصاً' })
  description?: string;

  @IsOptional()
  @IsBoolean({ message: 'حالة النشاط يجب أن تكون صحيح أو خطأ' })
  isActive?: boolean;

  @IsOptional()
  @IsInt({ message: 'ترتيب العرض يجب أن يكون رقماً صحيحاً' })
  @Min(0, { message: 'ترتيب العرض يجب أن يكون أكبر من أو يساوي 0' })
  sortOrder?: number;
}

export class UpdateSectionDto extends CreateSectionDto {}

// Incident Type DTOs
export class CreateIncidentTypeDto {
  @IsNotEmpty({ message: 'نوع الحادثة باللغة العربية مطلوب' })
  @IsString({ message: 'نوع الحادثة باللغة العربية يجب أن يكون نصاً' })
  @MaxLength(100, { message: 'نوع الحادثة باللغة العربية يجب أن يكون أقل من 100 حرف' })
  nameAr!: string;

  @IsNotEmpty({ message: 'نوع الحادثة باللغة الإنجليزية مطلوب' })
  @IsString({ message: 'نوع الحادثة باللغة الإنجليزية يجب أن يكون نصاً' })
  @MaxLength(100, { message: 'نوع الحادثة باللغة الإنجليزية يجب أن يكون أقل من 100 حرف' })
  nameEn!: string;

  @IsOptional()
  @IsString({ message: 'الوصف يجب أن يكون نصاً' })
  description?: string;

  @IsOptional()
  @IsBoolean({ message: 'حالة النشاط يجب أن تكون صحيح أو خطأ' })
  isActive?: boolean;

  @IsOptional()
  @IsInt({ message: 'ترتيب العرض يجب أن يكون رقماً صحيحاً' })
  @Min(0, { message: 'ترتيب العرض يجب أن يكون أكبر من أو يساوي 0' })
  sortOrder?: number;
}

export class UpdateIncidentTypeDto extends CreateIncidentTypeDto {}

// Reportable Incident Type DTOs
export class CreateReportableIncidentTypeDto {
  @IsNotEmpty({ message: 'نوع الحادثة القابل للإبلاغ باللغة العربية مطلوب' })
  @IsString({ message: 'نوع الحادثة القابل للإبلاغ باللغة العربية يجب أن يكون نصاً' })
  @MaxLength(100, { message: 'نوع الحادثة القابل للإبلاغ باللغة العربية يجب أن يكون أقل من 100 حرف' })
  nameAr!: string;

  @IsNotEmpty({ message: 'نوع الحادثة القابل للإبلاغ باللغة الإنجليزية مطلوب' })
  @IsString({ message: 'نوع الحادثة القابل للإبلاغ باللغة الإنجليزية يجب أن يكون نصاً' })
  @MaxLength(100, { message: 'نوع الحادثة القابل للإبلاغ باللغة الإنجليزية يجب أن يكون أقل من 100 حرف' })
  nameEn!: string;

  @IsNotEmpty({ message: 'معرف نوع الحادثة مطلوب' })
  @IsUUID('4', { message: 'معرف نوع الحادثة غير صالح' })
  incidentTypeId!: string;

  @IsOptional()
  @IsString({ message: 'الوصف يجب أن يكون نصاً' })
  description?: string;

  @IsOptional()
  @IsBoolean({ message: 'حالة النشاط يجب أن تكون صحيح أو خطأ' })
  isActive?: boolean;

  @IsOptional()
  @IsInt({ message: 'ترتيب العرض يجب أن يكون رقماً صحيحاً' })
  @Min(0, { message: 'ترتيب العرض يجب أن يكون أكبر من أو يساوي 0' })
  sortOrder?: number;
}

export class UpdateReportableIncidentTypeDto extends CreateReportableIncidentTypeDto {}

// Contributing Factor DTOs
export class CreateContributingFactorDto {
  @IsNotEmpty({ message: 'العامل المساهم باللغة العربية مطلوب' })
  @IsString({ message: 'العامل المساهم باللغة العربية يجب أن يكون نصاً' })
  @MaxLength(100, { message: 'العامل المساهم باللغة العربية يجب أن يكون أقل من 100 حرف' })
  nameAr!: string;

  @IsNotEmpty({ message: 'العامل المساهم باللغة الإنجليزية مطلوب' })
  @IsString({ message: 'العامل المساهم باللغة الإنجليزية يجب أن يكون نصاً' })
  @MaxLength(100, { message: 'العامل المساهم باللغة الإنجليزية يجب أن يكون أقل من 100 حرف' })
  nameEn!: string;

  @IsOptional()
  @IsString({ message: 'الوصف يجب أن يكون نصاً' })
  description?: string;

  @IsOptional()
  @IsBoolean({ message: 'حالة النشاط يجب أن تكون صحيح أو خطأ' })
  isActive?: boolean;

  @IsOptional()
  @IsInt({ message: 'ترتيب العرض يجب أن يكون رقماً صحيحاً' })
  @Min(0, { message: 'ترتيب العرض يجب أن يكون أكبر من أو يساوي 0' })
  sortOrder?: number;
}

export class UpdateContributingFactorDto extends CreateContributingFactorDto {}