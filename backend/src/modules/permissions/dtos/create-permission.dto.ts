import { IsString, IsNotEmpty, IsEnum, IsOptional } from 'class-validator';
import { ActionType, ResourceType } from '../entities/permission.entity';

export class CreatePermissionDto {
  @IsEnum(ActionType)
  @IsNotEmpty()
  action!: ActionType;

  @IsEnum(ResourceType)
  @IsNotEmpty()
  resource!: ResourceType;

  @IsString()
  @IsOptional()
  name?: string; // يمكن توليده تلقائيًا

  @IsString()
  @IsOptional()
  description?: string;
}