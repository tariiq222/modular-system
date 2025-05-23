import { IsString, IsNotEmpty, IsEnum, IsOptional, IsBoolean } from 'class-validator';
import { ResourceType } from '../entities/permission.entity';

export class CreatePolicyDto {
  @IsString()
  @IsNotEmpty()
  roleId!: string;

  @IsEnum(ResourceType)
  @IsNotEmpty()
  resource!: ResourceType;

  @IsString()
  @IsOptional()
  resourceId?: string;

  @IsString()
  @IsOptional()
  attributeName?: string;

  @IsString()
  @IsOptional()
  attributeValue?: string;

  @IsBoolean()
  @IsOptional()
  condition?: boolean = true;
}