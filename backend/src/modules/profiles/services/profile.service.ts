import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Profile } from '../entities/profile.entity';
import { CreateProfileDto } from '../dtos/create-profile.dto';
import { UpdateProfileDto } from '../dtos/update-profile.dto';
import { UserService } from '../../users/services/user.service';

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(Profile)
    private readonly profileRepository: Repository<Profile>,
    private readonly userService: UserService,
  ) {}

  /**
   * إنشاء ملف شخصي جديد للمستخدم
   */
  async create(userId: string, createProfileDto: CreateProfileDto): Promise<Profile> {
    // التحقق من وجود المستخدم
    const user = await this.userService.findOne(userId);
    if (!user) {
      throw new NotFoundException('المستخدم غير موجود');
    }

    // التحقق من عدم وجود ملف شخصي مسبق للمستخدم
    const existingProfile = await this.findByUserId(userId);
    if (existingProfile) {
      return this.update(existingProfile.id, createProfileDto);
    }

    // إنشاء ملف شخصي جديد
    const newProfile = this.profileRepository.create({
      userId,
      ...createProfileDto,
    });

    return this.profileRepository.save(newProfile);
  }

  /**
   * الحصول على جميع الملفات الشخصية
   */
  async findAll(): Promise<Profile[]> {
    return this.profileRepository.find({ 
      relations: ['user'] 
    });
  }

  /**
   * الحصول على ملف شخصي محدد بواسطة المعرف
   */
  async findOne(id: string): Promise<Profile> {
    const profile = await this.profileRepository.findOne({ 
      where: { id },
      relations: ['user', 'preferences', 'activities'],
    });

    if (!profile) {
      throw new NotFoundException('الملف الشخصي غير موجود');
    }

    return profile;
  }

  /**
   * الحصول على ملف شخصي بواسطة معرف المستخدم
   */
  async findByUserId(userId: string): Promise<Profile> {
    const profile = await this.profileRepository.findOne({
      where: { userId },
      relations: ['user', 'preferences', 'activities'],
    });
    if (!profile) {
      throw new NotFoundException('Profile not found');
    }
    return profile;
  }

  /**
   * تحديث ملف شخصي
   */
  async update(id: string, updateProfileDto: UpdateProfileDto): Promise<Profile> {
    const profile = await this.findOne(id);
    
    // تحديث البيانات
    this.profileRepository.merge(profile, updateProfileDto);
    
    return this.profileRepository.save(profile);
  }

  /**
   * تحديث ملف شخصي بواسطة معرف المستخدم
   */
  async updateByUserId(userId: string, updateProfileDto: UpdateProfileDto): Promise<Profile> {
    const profile = await this.findByUserId(userId);
    
    if (!profile) {
      return this.create(userId, updateProfileDto);
    }
    
    return this.update(profile.id, updateProfileDto);
  }

  /**
   * حذف ملف شخصي
   */
  async remove(id: string): Promise<boolean> {
    const profile = await this.findOne(id);
    const result = await this.profileRepository.remove(profile);
    return !!result;
  }

  /**
   * تحديث صورة الملف الشخصي
   */
  async updateAvatar(id: string, avatarUrl: string): Promise<Profile> {
    const profile = await this.findOne(id);
    profile.avatar = avatarUrl;
    return this.profileRepository.save(profile);
  }
}