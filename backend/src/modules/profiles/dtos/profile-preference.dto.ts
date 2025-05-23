import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { PreferenceCategory } from '../entities/profile-preference.entity';

export class ProfilePreferenceDto {
  @IsEnum(PreferenceCategory)
  @IsNotEmpty()
  category!: PreferenceCategory;

  @IsString()
  @IsNotEmpty()
  key!: string;

  @IsString()
  @IsNotEmpty()
  value!: string;
}