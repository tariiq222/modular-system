import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { ProfileActivity, ActivityType } from '../entities/profile-activity.entity';
import { CreateProfileActivityDto, ProfileActivityFilterDto } from '../dtos/profile-activity.dto';

@Injectable()
export class ProfileActivityService {
  constructor(
    @InjectRepository(ProfileActivity)
    private readonly activityRepository: Repository<ProfileActivity>,
  ) {}

  /**
   * تسجيل نشاط جديد
   */
  async create(profileId: string, createActivityDto: CreateProfileActivityDto): Promise<ProfileActivity> {
    const activity = this.activityRepository.create({
      profileId,
      ...createActivityDto,
    });

    return this.activityRepository.save(activity);
  }

  /**
   * الحصول على قائمة أنشطة لملف شخصي معين
   */
  async findByProfileId(profileId: string, filter?: ProfileActivityFilterDto): Promise<ProfileActivity[]> {
    const where: any = { profileId };

    // إضافة عوامل التصفية
    if (filter) {
      if (filter.activityTypes && filter.activityTypes.length > 0) {
        where.activityType = filter.activityTypes;
      }

      if (filter.ipAddress) {
        where.ipAddress = filter.ipAddress;
      }

      if (filter.startDate && filter.endDate) {
        where.timestamp = Between(
          new Date(filter.startDate),
          new Date(filter.endDate),
        );
      }
    }

    return this.activityRepository.find({
      where,
      order: { timestamp: 'DESC' },
    });
  }

  /**
   * الحصول على النشاطات الأخيرة
   */
  async getRecentActivities(profileId: string, limit: number = 10): Promise<ProfileActivity[]> {
    return this.activityRepository.find({
      where: { profileId },
      order: { timestamp: 'DESC' },
      take: limit,
    });
  }

  /**
   * الحصول على محاولات تسجيل الدخول الفاشلة
   */
  async getFailedLoginAttempts(profileId: string, limit: number = 10): Promise<ProfileActivity[]> {
    return this.activityRepository.find({
      where: { profileId, activityType: ActivityType.FAILED_LOGIN },
      order: { timestamp: 'DESC' },
      take: limit,
    });
  }

  /**
   * تسجيل نشاط تسجيل الدخول
   */
  async logLogin(profileId: string, ip: string, userAgent: string, location?: string, deviceInfo?: string): Promise<ProfileActivity> {
    return this.create(profileId, {
      activityType: ActivityType.LOGIN,
      ipAddress: ip,
      userAgent,
      location,
      deviceInfo,
    });
  }

  /**
   * تسجيل نشاط تسجيل الخروج
   */
  async logLogout(profileId: string, ip: string, userAgent: string): Promise<ProfileActivity> {
    return this.create(profileId, {
      activityType: ActivityType.LOGOUT,
      ipAddress: ip,
      userAgent,
    });
  }

  /**
   * تسجيل نشاط محاولة تسجيل دخول فاشلة
   */
  async logFailedLogin(profileId: string, ip: string, userAgent: string, details?: string): Promise<ProfileActivity> {
    return this.create(profileId, {
      activityType: ActivityType.FAILED_LOGIN,
      ipAddress: ip,
      userAgent,
      details,
    });
  }

  /**
   * تسجيل نشاط تغيير كلمة المرور
   */
  async logPasswordChange(profileId: string, ip: string, userAgent: string): Promise<ProfileActivity> {
    return this.create(profileId, {
      activityType: ActivityType.PASSWORD_CHANGE,
      ipAddress: ip,
      userAgent,
    });
  }

  /**
   * تسجيل نشاط تحديث الملف الشخصي
   */
  async logProfileUpdate(profileId: string, ip: string, userAgent: string, details?: string): Promise<ProfileActivity> {
    return this.create(profileId, {
      activityType: ActivityType.PROFILE_UPDATE,
      ipAddress: ip,
      userAgent,
      details,
    });
  }

  /**
   * تسجيل نشاط إعادة تعيين كلمة المرور
   */
  async logPasswordReset(profileId: string, ip: string, userAgent: string): Promise<ProfileActivity> {
    return this.create(profileId, {
      activityType: ActivityType.PASSWORD_RESET,
      ipAddress: ip,
      userAgent,
    });
  }
}