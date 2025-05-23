import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateProfileDto } from './create-profile.dto';
import { GenderType } from '../entities/profile.entity';

describe('CreateProfileDto Validation', () => {
  it('should pass validation with all valid fields', async () => {
    const profileData = {
      bio: 'مهندس برمجيات',
      phoneNumber: '+966501234567',
      address: 'الرياض، حي النخيل',
      gender: GenderType.MALE,
      website: 'https://example.com',
      isPublic: true
    };

    const dto = plainToInstance(CreateProfileDto, profileData);
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should pass validation with empty object (all fields optional)', async () => {
    const dto = plainToInstance(CreateProfileDto, {});
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should fail validation with invalid phone number', async () => {
    const dto = plainToInstance(CreateProfileDto, {
      phoneNumber: 'not-a-phone-number'
    });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('phoneNumber');
  });

  it('should fail validation with invalid website URL', async () => {
    const dto = plainToInstance(CreateProfileDto, {
      website: 'not-a-url'
    });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('website');
  });

  it('should fail validation with invalid gender type', async () => {
    const dto = plainToInstance(CreateProfileDto, {
      gender: 'invalid-gender'
    });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('gender');
  });
});