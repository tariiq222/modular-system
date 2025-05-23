import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { CreateProfileDto } from './create-profile.dto';
import { GenderType } from '../entities/profile.entity';

describe('CreateProfileDto', () => {
  it('should validate a complete valid profile dto', async () => {
    const profileData = {
      bio: 'مهندس برمجيات ذو خبرة في تطوير تطبيقات الويب',
      avatar: 'https://example.com/avatar.jpg',
      phoneNumber: '+966501234567',
      address: 'حي الورود، شارع الأمير محمد',
      city: 'الرياض',
      country: 'المملكة العربية السعودية',
      postalCode: '12345',
      gender: GenderType.MALE,
      birthDate: new Date('1990-01-01'),
      profession: 'مهندس برمجيات',
      company: 'شركة التقنية المتقدمة',
      website: 'https://example.com',
      facebookUrl: 'https://facebook.com/example',
      twitterUrl: 'https://twitter.com/example',
      linkedinUrl: 'https://linkedin.com/in/example',
      instagramUrl: 'https://instagram.com/example',
      isPublic: true
    };

    const dto = plainToInstance(CreateProfileDto, profileData);
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should validate a minimal profile dto with only required fields', async () => {
    // كل الحقول اختيارية
    const profileData = {};

    const dto = plainToInstance(CreateProfileDto, profileData);
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should fail validation with invalid phone number', async () => {
    const profileData = {
      phoneNumber: 'invalid-phone'
    };

    const dto = plainToInstance(CreateProfileDto, profileData);
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('phoneNumber');
  });

  it('should fail validation with invalid URLs', async () => {
    const profileData = {
      website: 'invalid-url',
      facebookUrl: 'not-a-url'
    };

    const dto = plainToInstance(CreateProfileDto, profileData);
    const errors = await validate(dto);
    expect(errors.length).toBe(2);
    expect(errors.some(e => e.property === 'website')).toBeTruthy();
    expect(errors.some(e => e.property === 'facebookUrl')).toBeTruthy();
  });

  it('should fail validation with invalid gender type', async () => {
    const profileData = {
      gender: 'invalid-gender' // Not a valid GenderType enum value
    };

    const dto = plainToInstance(CreateProfileDto, profileData);
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('gender');
  });

  it('should validate with all valid gender types', async () => {
    // اختبار كل أنواع الجنس المتاحة
    for (const gender of Object.values(GenderType)) {
      const profileData = { gender };
      const dto = plainToInstance(CreateProfileDto, profileData);
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    }
  });
});