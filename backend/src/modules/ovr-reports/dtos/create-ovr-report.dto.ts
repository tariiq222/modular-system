import { IsNotEmpty, IsOptional, IsEmail, IsBoolean, IsDateString, IsString, MaxLength, IsUUID, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { GenderType } from '../enums/gender-type.enum';

export class ReporterInfoDto {
    @IsNotEmpty({ message: 'اسم المُبلّغ مطلوب' })
    @IsString({ message: 'اسم المُبلّغ يجب أن يكون نصاً' })
    @MaxLength(100, { message: 'اسم المُبلّغ يجب أن يكون أقل من 100 حرف' })
    reporterName!: string;

    @IsOptional()
    @IsEmail({}, { message: 'البريد الإلكتروني غير صالح' })
    reporterEmail?: string;

    @IsOptional()
    @IsString({ message: 'رقم التحويلة يجب أن يكون نصاً' })
    @MaxLength(10, { message: 'رقم التحويلة يجب أن يكون أقل من 10 أرقام' })
    reporterExtension?: string;

    @IsNotEmpty({ message: 'المسمى الوظيفي مطلوب' })
    @IsUUID('4', { message: 'معرف المسمى الوظيفي غير صالح' })
    jobTitleId!: string;

    @IsNotEmpty({ message: 'الإدارة مطلوبة' })
    @IsUUID('4', { message: 'معرف الإدارة غير صالح' })
    departmentId!: string;

    @IsNotEmpty({ message: 'القسم مطلوب' })
    @IsUUID('4', { message: 'معرف القسم غير صالح' })
    sectionId!: string;
}

export class IncidentInfoDto {
    @IsNotEmpty({ message: 'تاريخ ووقت الحادثة مطلوب' })
    @IsDateString({}, { message: 'تاريخ الحادثة غير صالح' })
    incidentDate!: string;

    @IsNotEmpty({ message: 'نوع الحادثة مطلوب' })
    @IsUUID('4', { message: 'معرف نوع الحادثة غير صالح' })
    incidentTypeId!: string;

    @IsOptional()
    @IsUUID('4', { message: 'معرف نوع الحادثة القابل للإبلاغ غير صالح' })
    reportableIncidentTypeId?: string;

    @IsBoolean({ message: 'حقل إبلاغ السلطات يجب أن يكون صحيح أو خطأ' })
    authoritiesNotified!: boolean;
}

export class PatientInfoDto {
    @IsOptional()
    @IsString({ message: 'اسم المريض يجب أن يكون نصاً' })
    @MaxLength(100, { message: 'اسم المريض يجب أن يكون أقل من 100 حرف' })
    patientName?: string;

    @IsOptional()
    @IsString({ message: 'رقم ملف المريض يجب أن يكون نصاً' })
    @MaxLength(20, { message: 'رقم ملف المريض يجب أن يكون أقل من 20 رقم' })
    patientFileNumber?: string;

    @IsOptional()
    @IsString({ message: 'جنس المريض يجب أن يكون نصاً' })
    patientGender?: GenderType;

    @IsOptional()
    @IsDateString({}, { message: 'تاريخ ميلاد المريض غير صالح' })
    patientBirthDate?: string;
}

export class IncidentDetailsDto {
    @IsNotEmpty({ message: 'وصف الحادثة مطلوب' })
    @IsString({ message: 'وصف الحادثة يجب أن يكون نصاً' })
    incidentDescription!: string;

    @IsOptional()
    @IsString({ message: 'الإجراءات المتخذة يجب أن تكون نصاً' })
    actionsTaken?: string;

    @IsOptional()
    @IsArray({ message: 'العوامل المساهمة يجب أن تكون مصفوفة' })
    @IsUUID('4', { each: true, message: 'معرف العامل المساهم غير صالح' })
    contributingFactorIds?: string[];
  
    @IsOptional()
    @IsString({ message: 'نص العوامل المساهمة يجب أن يكون نصاً' })
    contributingFactorsText?: string;
}

export class CreateOVRReportDto {
    @ValidateNested()
    @Type(() => ReporterInfoDto)
    @IsNotEmpty({ message: 'معلومات المُبلّغ مطلوبة' })
    reporterInfo!: ReporterInfoDto;

    @ValidateNested()
    @Type(() => IncidentInfoDto)
    @IsNotEmpty({ message: 'معلومات الحادثة مطلوبة' })
    incidentInfo!: IncidentInfoDto;

    @IsBoolean({ message: 'حقل متعلق بمريض يجب أن يكون صحيح أو خطأ' })
    isPatientRelated!: boolean;

    @ValidateNested()
    @Type(() => PatientInfoDto)
    @IsOptional()
    patientInfo?: PatientInfoDto;

    @ValidateNested()
    @Type(() => IncidentDetailsDto)
    @IsNotEmpty({ message: 'تفاصيل الحادثة مطلوبة' })
    incidentDetails!: IncidentDetailsDto;
}