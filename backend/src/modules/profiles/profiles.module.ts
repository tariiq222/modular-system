import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProfileController } from './controllers/profile.controller';
import { ProfileService } from './services/profile.service';
import { Profile } from './entities/profile.entity';
import { UsersModule } from '../users/users.module';
import { FileUploadService } from './services/file-upload.service';
import { ProfilePreferencesService } from './services/profile-preferences.service';
import { ProfileActivityService } from './services/profile-activity.service';
import { ProfilePreference } from './entities/profile-preference.entity';
import { ProfileActivity } from './entities/profile-activity.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Profile, ProfilePreference, ProfileActivity]),
    UsersModule,
  ],
  controllers: [ProfileController],
  providers: [
    ProfileService,
    FileUploadService,
    ProfilePreferencesService,
    ProfileActivityService,
  ],
  exports: [ProfileService, ProfileActivityService, ProfilePreferencesService],
})
export class ProfilesModule {}