import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { SettingsService } from '../services/settings.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '../../users/entities/user.entity';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';

@ApiTags('settings')
@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  @ApiOperation({ summary: 'الحصول على جميع الإعدادات العامة' })
  @ApiResponse({ status: 200, description: 'تم استرجاع الإعدادات بنجاح' })
  async getAllPublicSettings() {
    return this.settingsService.getAllPublicSettings();
  }

  @Get('all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'الحصول على جميع الإعدادات (للمشرفين فقط)' })
  @ApiResponse({ status: 200, description: 'تم استرجاع الإعدادات بنجاح' })
  async getAllSettings() {
    return this.settingsService.getAllSettings();
  }

  @Get(':key')
  @ApiOperation({ summary: 'الحصول على إعداد محدد بواسطة المفتاح' })
  @ApiResponse({ status: 200, description: 'تم استرجاع الإعداد بنجاح' })
  @ApiResponse({ status: 404, description: 'الإعداد غير موجود' })
  async getSettingByKey(@Param('key') key: string) {
    return this.settingsService.getSettingByKey(key);
  }

  @Post(':key')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'تحديث إعداد محدد (للمشرفين فقط)' })
  @ApiResponse({ status: 200, description: 'تم تحديث الإعداد بنجاح' })
  @ApiResponse({ status: 404, description: 'الإعداد غير موجود' })
  async updateSetting(
    @Param('key') key: string,
    @Body('value') value: string,
  ) {
    return this.settingsService.updateSetting(key, value);
  }
}