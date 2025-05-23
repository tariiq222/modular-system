import { PartialType } from '@nestjs/mapped-types';
import { IsOptional, IsEnum, IsUUID, IsString, MaxLength } from 'class-validator';
import { CreateOVRReportDto } from './create-ovr-report.dto';
import { ReportStatus } from '../enums/report-status.enum';

export class UpdateOVRReportDto extends PartialType(CreateOVRReportDto) {
    @IsOptional()
    @IsEnum(ReportStatus, { message: 'حالة التقرير غير صالحة' })
    status?: ReportStatus;

    @IsOptional()
    @IsUUID('4', { message: 'معرف المستخدم المسؤول غير صالح' })
    assignedUserId?: string;
}

export class UpdateReportStatusDto {
    @IsEnum(ReportStatus, { message: 'حالة التقرير غير صالحة' })
    status!: ReportStatus;

    @IsOptional()
    @IsString({ message: 'سبب التغيير يجب أن يكون نصاً' })
    @MaxLength(500, { message: 'سبب التغيير يجب أن يكون أقل من 500 حرف' })
    reason?: string;

    @IsOptional()
    @IsString({ message: 'الملاحظات يجب أن تكون نصاً' })
    @MaxLength(1000, { message: 'الملاحظات يجب أن تكون أقل من 1000 حرف' })
    notes?: string;

    @IsOptional()
    @IsUUID('4', { message: 'معرف المستخدم المسؤول غير صالح' })
    assignedUserId?: string;
}

export class AddCommentDto {
    @IsString({ message: 'نص التعليق يجب أن يكون نصاً' })
    @MaxLength(2000, { message: 'نص التعليق يجب أن يكون أقل من 2000 حرف' })
    comment!: string;

    @IsOptional()
    @IsString({ message: 'نوع التعليق يجب أن يكون نصاً' })
    @MaxLength(50, { message: 'نوع التعليق يجب أن يكون أقل من 50 حرف' })
    commentType?: string;

    @IsOptional()
    isInternal?: boolean;
}