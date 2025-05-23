import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards, Req, UseInterceptors, UploadedFile, Query, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes, ApiBody, ApiParam, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { ProfileService } from '../services/profile.service';
import { CreateProfileDto } from '../dtos/create-profile.dto';
import { UpdateProfileDto } from '../dtos/update-profile.dto';
import { ProfilePreferencesService } from '../services/profile-preferences.service';
import { ProfilePreferenceDto } from '../dtos/profile-preference.dto';
import { Profile } from '../entities/profile.entity';
import { ProfilePreference, PreferenceCategory } from '../entities/profile-preference.entity';
import { ProfileActivityService } from '../services/profile-activity.service';
import { ProfileActivity } from '../entities/profile-activity.entity';
import { ProfileActivityFilterDto } from '../dtos/profile-activity.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileUploadService } from '../services/file-upload.service';

@ApiTags('profiles')
@ApiBearerAuth('access-token')
@Controller('profiles')
@UseGuards(JwtAuthGuard)
export class ProfileController {
  constructor(
    private readonly profileService: ProfileService,
    private readonly preferencesService: ProfilePreferencesService,
    private readonly activityService: ProfileActivityService,
    private readonly fileUploadService: FileUploadService,
  ) {}

  // **** إدارة الملف الشخصي الأساسية **** //

  @ApiOperation({ summary: 'u0627u0644u062du0635u0648u0644 u0639u0644u0649 u0627u0644u0645u0644u0641 u0627u0644u0634u062eu0635u064a u0644u0644u0645u0633u062au062eu062fu0645 u0627u0644u062du0627u0644u064a' })
  @ApiResponse({ status: 200, description: 'u062au0645 u0627u0644u062du0635u0648u0644 u0639u0644u0649 u0627u0644u0645u0644u0641 u0627u0644u0634u062eu0635u064a u0628u0646u062cu0627u062d', type: Profile })
  @ApiResponse({ status: 401, description: 'u063au064au0631 u0645u0635u0631u062d u0644u0643 u0628u0627u0644u0648u0635u0648u0644' })
  @ApiResponse({ status: 404, description: 'u0627u0644u0645u0644u0641 u0627u0644u0634u062eu0635u064a u063au064au0631 u0645u0648u062cu0648u062f' })
  @Get('me')
  async getMyProfile(@Req() request: Request): Promise<Profile> {
    if (!request.user) {
      throw new UnauthorizedException();
    }
    const userId = (request.user as any)['userId'];
    const profile = await this.profileService.findByUserId(userId);
    return profile;
  }

  @ApiOperation({ summary: 'u062au062du062fu064au062b u0627u0644u0645u0644u0641 u0627u0644u0634u062eu0635u064a u0644u0644u0645u0633u062au062eu062fu0645 u0627u0644u062du0627u0644u064a' })
  @ApiResponse({ status: 200, description: 'u062au0645 u062au062du062fu064au062b u0627u0644u0645u0644u0641 u0627u0644u0634u062eu0635u064a u0628u0646u062cu0627u062d', type: Profile })
  @ApiResponse({ status: 400, description: 'u0628u064au0627u0646u0627u062a u063au064au0631 u0635u0627u0644u062du0629' })
  @ApiResponse({ status: 401, description: 'u063au064au0631 u0645u0635u0631u062d u0644u0643 u0628u0627u0644u0648u0635u0648u0644' })
  @ApiBody({ type: UpdateProfileDto, description: 'u0628u064au0627u0646u0627u062a u062au062du062fu064au062b u0627u0644u0645u0644u0641 u0627u0644u0634u062eu0635u064a' })
  @Put('me')
  async updateMyProfile(@Req() request: Request, @Body() updateProfileDto: UpdateProfileDto): Promise<Profile> {
    if (!request.user) {
      throw new UnauthorizedException();
    }
    const userId = (request.user as any)['userId'];
    const updatedProfile = await this.profileService.updateByUserId(userId, updateProfileDto);
    
    // تسجيل نشاط تحديث الملف الشخصي
    if (request.ip) {
      this.activityService.logProfileUpdate(
        updatedProfile.id,
        request.ip,
        request.headers['user-agent'] || '',
      );
    }
    
    return updatedProfile;
  }

  // **** رفع صورة الملف الشخصي **** //

  @ApiOperation({ summary: 'u0631u0641u0639 u0635u0648u0631u0629 u0627u0644u0645u0644u0641 u0627u0644u0634u062eu0635u064a' })
  @ApiResponse({ status: 201, description: 'u062au0645 u0631u0641u0639 u0627u0644u0635u0648u0631u0629 u0628u0646u062cu0627u062d', schema: { properties: { avatarUrl: { type: 'string' } } } })
  @ApiResponse({ status: 400, description: 'u0645u0644u0641 u063au064au0631 u0635u0627u0644u062d' })
  @ApiResponse({ status: 401, description: 'u063au064au0631 u0645u0635u0631u062d u0644u0643 u0628u0627u0644u0648u0635u0648u0644' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        avatar: {
          type: 'string',
          format: 'binary',
          description: 'u0645u0644u0641 u0627u0644u0635u0648u0631u0629 u0627u0644u0634u062eu0635u064au0629',
        },
      },
    },
  })
  @Post('me/avatar')
  @UseInterceptors(FileInterceptor('avatar'))
  async uploadAvatar(@Req() request: Request, @UploadedFile() file: Express.Multer.File): Promise<{ avatarUrl: string }> {
    if (!request.user) {
      throw new UnauthorizedException();
    }
    const userId = (request.user as any)['userId'];
    const profile = await this.profileService.findByUserId(userId);
    
    // حذف الصورة السابقة إذا وجدت
    if (profile.avatar) {
      await this.fileUploadService.deleteFile(profile.avatar);
    }
    
    // رفع الصورة الجديدة
    const avatarPath = await this.fileUploadService.uploadAvatar(userId, file);
    
    // تحديث الملف الشخصي بمسار الصورة الجديدة
    await this.profileService.updateAvatar(profile.id, avatarPath);
    
    return { avatarUrl: avatarPath };
  }

  // **** إدارة التفضيلات **** //

  @ApiOperation({ summary: 'u0627u0644u062du0635u0648u0644 u0639u0644u0649 u062au0641u0636u064au0644u0627u062a u0627u0644u0645u0633u062au062eu062fu0645' })
  @ApiResponse({ status: 200, description: 'u062au0645 u0627u0644u062du0635u0648u0644 u0639u0644u0649 u0627u0644u062au0641u0636u064au0644u0627u062a u0628u0646u062cu0627u062d', type: [ProfilePreference] })
  @ApiResponse({ status: 401, description: 'u063au064au0631 u0645u0635u0631u062d u0644u0643 u0628u0627u0644u0648u0635u0648u0644' })
  @Get('me/preferences')
  async getMyPreferences(@Req() request: Request): Promise<ProfilePreference[]> {
    if (!request.user) {
      throw new UnauthorizedException();
    }
    const userId = (request.user as any)['userId'];
    const profile = await this.profileService.findByUserId(userId);
    return this.preferencesService.findAllByProfileId(profile.id);
  }

  @ApiOperation({ summary: 'u0627u0644u062du0635u0648u0644 u0639u0644u0649 u062au0641u0636u064au0644u0627u062a u0627u0644u0645u0633u062au062eu062fu0645 u062du0633u0628 u0627u0644u0641u0626u0629' })
  @ApiResponse({ status: 200, description: 'u062au0645 u0627u0644u062du0635u0648u0644 u0639u0644u0649 u0627u0644u062au0641u0636u064au0644u0627u062a u0628u0646u062cu0627u062d', type: [ProfilePreference] })
  @ApiResponse({ status: 401, description: 'u063au064au0631 u0645u0635u0631u062d u0644u0643 u0628u0627u0644u0648u0635u0648u0644' })
  @ApiParam({ name: 'category', enum: PreferenceCategory, description: 'u0641u0626u0629 u0627u0644u062au0641u0636u064au0644u0627u062a' })
  @Get('me/preferences/:category')
  async getPreferencesByCategory(
    @Req() request: Request,
    @Param('category') category: PreferenceCategory,
  ): Promise<ProfilePreference[]> {
    if (!request.user) {
      throw new UnauthorizedException();
    }
    const userId = (request.user as any)['userId'];
    const profile = await this.profileService.findByUserId(userId);
    return this.preferencesService.findByCategory(profile.id, category);
  }

  @ApiOperation({ summary: 'u0625u0646u0634u0627u0621 u062au0641u0636u064au0644 u062cu062fu064au062f' })
  @ApiResponse({ status: 201, description: 'u062au0645 u0625u0646u0634u0627u0621 u0627u0644u062au0641u0636u064au0644 u0628u0646u062cu0627u062d', type: ProfilePreference })
  @ApiResponse({ status: 400, description: 'u0628u064au0627u0646u0627u062a u063au064au0631 u0635u0627u0644u062du0629' })
  @ApiResponse({ status: 401, description: 'u063au064au0631 u0645u0635u0631u062d u0644u0643 u0628u0627u0644u0648u0635u0648u0644' })
  @ApiBody({ type: ProfilePreferenceDto, description: 'u0628u064au0627u0646u0627u062a u0627u0644u062au0641u0636u064au0644 u0627u0644u062cu062fu064au062f' })
  @Post('me/preferences')
  async createPreference(
    @Req() request: Request,
    @Body() preferenceDto: ProfilePreferenceDto,
  ): Promise<ProfilePreference> {
    if (!request.user) {
      throw new UnauthorizedException();
    }
    const userId = (request.user as any)['userId'];
    const profile = await this.profileService.findByUserId(userId);
    return this.preferencesService.create(profile.id, preferenceDto);
  }

  @ApiOperation({ summary: 'u0625u0646u0634u0627u0621 u0645u062cu0645u0648u0639u0629 u0645u0646 u0627u0644u062au0641u0636u064au0644u0627u062a u062fu0641u0639u0629 u0648u0627u062du062fu0629' })
  @ApiResponse({ status: 201, description: 'u062au0645 u0625u0646u0634u0627u0621 u0627u0644u062au0641u0636u064au0644u0627u062a u0628u0646u062cu0627u062d', type: [ProfilePreference] })
  @ApiResponse({ status: 400, description: 'u0628u064au0627u0646u0627u062a u063au064au0631 u0635u0627u0644u062du0629' })
  @ApiResponse({ status: 401, description: 'u063au064au0631 u0645u0635u0631u062d u0644u0643 u0628u0627u0644u0648u0635u0648u0644' })
  @ApiBody({
    type: [ProfilePreferenceDto],
    description: 'u0642u0627u0626u0645u0629 u0628u0628u064au0627u0646u0627u062a u0627u0644u062au0641u0636u064au0644u0627u062a u0627u0644u062cu062fu064au062fu0629',
  })
  @Post('me/preferences/bulk')
  async createBulkPreferences(
    @Req() request: Request,
    @Body() preferenceDtos: ProfilePreferenceDto[],
  ): Promise<ProfilePreference[]> {
    if (!request.user) {
      throw new UnauthorizedException();
    }
    const userId = (request.user as any)['userId'];
    const profile = await this.profileService.findByUserId(userId);
    return this.preferencesService.createOrUpdateBulk(profile.id, preferenceDtos);
  }

  @ApiOperation({ summary: 'u062au062du062fu064au062b u062au0641u0636u064au0644 u0645u0648u062cu0648u062f' })
  @ApiResponse({ status: 200, description: 'u062au0645 u062au062du062fu064au062b u0627u0644u062au0641u0636u064au0644 u0628u0646u062cu0627u062d', type: ProfilePreference })
  @ApiResponse({ status: 400, description: 'u0628u064au0627u0646u0627u062a u063au064au0631 u0635u0627u0644u062du0629' })
  @ApiResponse({ status: 404, description: 'u0627u0644u062au0641u0636u064au0644 u063au064au0631 u0645u0648u062cu0648u062f' })
  @ApiParam({ name: 'id', description: 'u0645u0639u0631u0641 u0627u0644u062au0641u0636u064au0644' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        value: {
          type: 'string',
          description: 'u0642u064au0645u0629 u0627u0644u062au0641u0636u064au0644 u0627u0644u062cu062fu064au062fu0629',
        },
      },
    },
  })
  @Put('me/preferences/:id')
  async updatePreference(
    @Param('id') id: string,
    @Body('value') value: string,
  ): Promise<ProfilePreference> {
    return this.preferencesService.update(id, value);
  }

  @ApiOperation({ summary: 'u062du0630u0641 u062au0641u0636u064au0644 u0645u0648u062cu0648u062f' })
  @ApiResponse({ status: 200, description: 'u062au0645 u062du0630u0641 u0627u0644u062au0641u0636u064au0644 u0628u0646u062cu0627u062d', schema: { properties: { success: { type: 'boolean' } } } })
  @ApiResponse({ status: 404, description: 'u0627u0644u062au0641u0636u064au0644 u063au064au0631 u0645u0648u062cu0648u062f' })
  @ApiParam({ name: 'id', description: 'u0645u0639u0631u0641 u0627u0644u062au0641u0636u064au0644' })
  @Delete('me/preferences/:id')
  async deletePreference(@Param('id') id: string): Promise<{ success: boolean }> {
    const result = await this.preferencesService.remove(id);
    return { success: result };
  }

  // **** إدارة سجل النشاطات **** //

  @ApiOperation({ summary: 'u0627u0644u062du0635u0648u0644 u0639u0644u0649 u0646u0634u0627u0637u0627u062a u0627u0644u0645u0633u062au062eu062fu0645 u0627u0644u062du0627u0644u064a' })
  @ApiResponse({ status: 200, description: 'u062au0645 u0627u0644u062du0635u0648u0644 u0639u0644u0649 u0627u0644u0646u0634u0627u0637u0627u062a u0628u0646u062cu0627u062d', type: [ProfileActivity] })
  @ApiResponse({ status: 401, description: 'u063au064au0631 u0645u0635u0631u062d u0644u0643 u0628u0627u0644u0648u0635u0648u0644' })
  @ApiQuery({ type: ProfileActivityFilterDto, required: false })
  @Get('me/activities')
  async getMyActivities(
    @Req() request: Request,
    @Query() filter: ProfileActivityFilterDto,
  ): Promise<ProfileActivity[]> {
    if (!request.user) {
      throw new UnauthorizedException();
    }
    const userId = (request.user as any)['userId'];
    const profile = await this.profileService.findByUserId(userId);
    return this.activityService.findByProfileId(profile.id, filter);
  }

  @ApiOperation({ summary: 'u0627u0644u062du0635u0648u0644 u0639u0644u0649 u0627u0644u0646u0634u0627u0637u0627u062a u0627u0644u0623u062eu064au0631u0629 u0644u0644u0645u0633u062au062eu062fu0645' })
  @ApiResponse({ status: 200, description: 'u062au0645 u0627u0644u062du0635u0648u0644 u0639u0644u0649 u0627u0644u0646u0634u0627u0637u0627u062a u0627u0644u0623u062eu064au0631u0629 u0628u0646u062cu0627u062d', type: [ProfileActivity] })
  @ApiResponse({ status: 401, description: 'u063au064au0631 u0645u0635u0631u062d u0644u0643 u0628u0627u0644u0648u0635u0648u0644' })
  @Get('me/activities/recent')
  async getRecentActivities(@Req() request: Request): Promise<ProfileActivity[]> {
    if (!request.user) {
      throw new UnauthorizedException();
    }
    const userId = (request.user as any)['userId'];
    const profile = await this.profileService.findByUserId(userId);
    return this.activityService.getRecentActivities(profile.id, 10);
  }

  @ApiOperation({ summary: 'u0627u0644u062du0635u0648u0644 u0639u0644u0649 u0646u0634u0627u0637u0627u062a u0627u0644u0623u0645u0627u0646 u0644u0644u0645u0633u062au062eu062fu0645' })
  @ApiResponse({ status: 200, description: 'u062au0645 u0627u0644u062du0635u0648u0644 u0639u0644u0649 u0646u0634u0627u0637u0627u062a u0627u0644u0623u0645u0627u0646 u0628u0646u062cu0627u062d', type: [ProfileActivity] })
  @ApiResponse({ status: 401, description: 'u063au064au0631 u0645u0635u0631u062d u0644u0643 u0628u0627u0644u0648u0635u0648u0644' })
  @Get('me/activities/security')
  async getSecurityActivities(@Req() request: Request): Promise<ProfileActivity[]> {
    if (!request.user) {
      throw new UnauthorizedException();
    }
    const userId = (request.user as any)['userId'];
    const profile = await this.profileService.findByUserId(userId);
    return this.activityService.getFailedLoginAttempts(profile.id, 10);
  }
}