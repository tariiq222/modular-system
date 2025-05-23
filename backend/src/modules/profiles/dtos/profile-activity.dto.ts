import { IsEnum, IsIP, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ActivityType } from '../entities/profile-activity.entity';

export class CreateProfileActivityDto {
  @IsEnum(ActivityType)
  @IsNotEmpty()
  activityType!: ActivityType;

  @IsString()
  @IsOptional()
  details?: string;

  @IsIP()
  @IsOptional()
  ipAddress?: string;

  @IsString()
  @IsOptional()
  userAgent?: string;

  @IsString()
  @IsOptional()
  location?: string;

  @IsString()
  @IsOptional()
  deviceInfo?: string;
}

export class ProfileActivityFilterDto {
  @IsEnum(ActivityType, { each: true })
  @IsOptional()
  activityTypes?: ActivityType[];

  @IsString()
  @IsOptional()
  startDate?: string;

  @IsString()
  @IsOptional()
  endDate?: string;

  @IsString()
  @IsOptional()
  ipAddress?: string;
}