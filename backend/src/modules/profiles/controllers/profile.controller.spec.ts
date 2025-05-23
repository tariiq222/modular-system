import { Test, TestingModule } from '@nestjs/testing';
import { ProfileController } from './profile.controller';
import { ProfileService } from '../services/profile.service';
import { ProfilePreferencesService } from '../services/profile-preferences.service';
import { ProfileActivityService } from '../services/profile-activity.service';
import { FileUploadService } from '../services/file-upload.service';
import { UpdateProfileDto } from '../dtos/update-profile.dto';
import { ProfilePreferenceDto } from '../dtos/profile-preference.dto';
import { PreferenceCategory } from '../entities/profile-preference.entity';
import { ProfileActivityFilterDto } from '../dtos/profile-activity.dto';

describe('ProfileController', () => {
  let controller: ProfileController;
  let profileService: ProfileService;
  let preferencesService: ProfilePreferencesService;
  let activityService: ProfileActivityService;
  let fileUploadService: FileUploadService;

  const mockProfileService = {
    findByUserId: jest.fn(),
    updateByUserId: jest.fn(),
    updateAvatar: jest.fn(),
  };

  const mockPreferencesService = {
    findAllByProfileId: jest.fn(),
    findByCategory: jest.fn(),
    create: jest.fn(),
    createOrUpdateBulk: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const mockActivityService = {
    findByProfileId: jest.fn(),
    getRecentActivities: jest.fn(),
    getFailedLoginAttempts: jest.fn(),
    logProfileUpdate: jest.fn(),
  };

  const mockFileUploadService = {
    uploadAvatar: jest.fn(),
    deleteFile: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProfileController],
      providers: [
        { provide: ProfileService, useValue: mockProfileService },
        { provide: ProfilePreferencesService, useValue: mockPreferencesService },
        { provide: ProfileActivityService, useValue: mockActivityService },
        { provide: FileUploadService, useValue: mockFileUploadService },
      ],
    }).compile();

    controller = module.get<ProfileController>(ProfileController);
    profileService = module.get<ProfileService>(ProfileService);
    preferencesService = module.get<ProfilePreferencesService>(ProfilePreferencesService);
    activityService = module.get<ProfileActivityService>(ProfileActivityService);
    fileUploadService = module.get<FileUploadService>(FileUploadService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getMyProfile', () => {
    it('should return user profile', async () => {
      const userId = '1';
      const mockProfile = { id: 'profile-1', userId };
      const mockReq = { user: { userId } };

      mockProfileService.findByUserId.mockResolvedValue(mockProfile);

      const result = await controller.getMyProfile(mockReq as any);

      expect(mockProfileService.findByUserId).toHaveBeenCalledWith(userId);
      expect(result).toEqual(mockProfile);
    });
  });

  describe('updateMyProfile', () => {
    it('should update user profile', async () => {
      const userId = '1';
      const profileId = 'profile-1';
      const updateDto: UpdateProfileDto = { bio: 'New bio' };
      const mockProfile = { id: profileId, userId, bio: 'New bio' };
      const mockReq = { 
        user: { userId },
        ip: '192.168.1.1',
        headers: { 'user-agent': 'test-agent' }
      };

      mockProfileService.updateByUserId.mockResolvedValue(mockProfile);
      mockActivityService.logProfileUpdate.mockResolvedValue({});

      const result = await controller.updateMyProfile(mockReq as any, updateDto);

      expect(mockProfileService.updateByUserId).toHaveBeenCalledWith(userId, updateDto);
      expect(mockActivityService.logProfileUpdate).toHaveBeenCalledWith(
        profileId,
        '192.168.1.1',
        'test-agent'
      );
      expect(result).toEqual(mockProfile);
    });
  });

  describe('uploadAvatar', () => {
    it('should upload avatar and update profile', async () => {
      const userId = '1';
      const profileId = 'profile-1';
      const mockProfile = { id: profileId, userId, avatar: null };
      const mockReq = { user: { userId } };
      const mockFile = { originalname: 'test.jpg' } as Express.Multer.File;
      const avatarPath = 'avatars/test-uuid.jpg';

      mockProfileService.findByUserId.mockResolvedValue(mockProfile);
      mockFileUploadService.uploadAvatar.mockResolvedValue(avatarPath);
      mockProfileService.updateAvatar.mockResolvedValue({ ...mockProfile, avatar: avatarPath });

      const result = await controller.uploadAvatar(mockReq as any, mockFile);

      expect(mockProfileService.findByUserId).toHaveBeenCalledWith(userId);
      expect(mockFileUploadService.uploadAvatar).toHaveBeenCalledWith(userId, mockFile);
      expect(mockProfileService.updateAvatar).toHaveBeenCalledWith(profileId, avatarPath);
      expect(result).toEqual({ avatarUrl: avatarPath });
    });

    it('should delete previous avatar if exists', async () => {
      const userId = '1';
      const profileId = 'profile-1';
      const oldAvatarPath = 'avatars/old.jpg';
      const mockProfile = { id: profileId, userId, avatar: oldAvatarPath };
      const mockReq = { user: { userId } };
      const mockFile = { originalname: 'test.jpg' } as Express.Multer.File;
      const newAvatarPath = 'avatars/test-uuid.jpg';

      mockProfileService.findByUserId.mockResolvedValue(mockProfile);
      mockFileUploadService.deleteFile.mockResolvedValue(true);
      mockFileUploadService.uploadAvatar.mockResolvedValue(newAvatarPath);
      mockProfileService.updateAvatar.mockResolvedValue({ ...mockProfile, avatar: newAvatarPath });

      const result = await controller.uploadAvatar(mockReq as any, mockFile);

      expect(mockFileUploadService.deleteFile).toHaveBeenCalledWith(oldAvatarPath);
      expect(mockFileUploadService.uploadAvatar).toHaveBeenCalledWith(userId, mockFile);
      expect(mockProfileService.updateAvatar).toHaveBeenCalledWith(profileId, newAvatarPath);
      expect(result).toEqual({ avatarUrl: newAvatarPath });
    });
  });

  describe('getMyPreferences', () => {
    it('should return user preferences', async () => {
      const userId = '1';
      const profileId = 'profile-1';
      const mockProfile = { id: profileId, userId };
      const mockPreferences = [{ id: 'pref-1', profileId, key: 'darkMode', value: 'true' }];
      const mockReq = { user: { userId } };

      mockProfileService.findByUserId.mockResolvedValue(mockProfile);
      mockPreferencesService.findAllByProfileId.mockResolvedValue(mockPreferences);

      const result = await controller.getMyPreferences(mockReq as any);

      expect(mockProfileService.findByUserId).toHaveBeenCalledWith(userId);
      expect(mockPreferencesService.findAllByProfileId).toHaveBeenCalledWith(profileId);
      expect(result).toEqual(mockPreferences);
    });
  });

  describe('getPreferencesByCategory', () => {
    it('should return preferences filtered by category', async () => {
      const userId = '1';
      const profileId = 'profile-1';
      const category = PreferenceCategory.NOTIFICATIONS;
      const mockProfile = { id: profileId, userId };
      const mockPreferences = [{ id: 'pref-1', profileId, category, key: 'email', value: 'true' }];
      const mockReq = { user: { userId } };

      mockProfileService.findByUserId.mockResolvedValue(mockProfile);
      mockPreferencesService.findByCategory.mockResolvedValue(mockPreferences);

      const result = await controller.getPreferencesByCategory(mockReq as any, category);

      expect(mockProfileService.findByUserId).toHaveBeenCalledWith(userId);
      expect(mockPreferencesService.findByCategory).toHaveBeenCalledWith(profileId, category);
      expect(result).toEqual(mockPreferences);
    });
  });

  describe('createPreference', () => {
    it('should create preference', async () => {
      const userId = '1';
      const profileId = 'profile-1';
      const mockProfile = { id: profileId, userId };
      const preferenceDto: ProfilePreferenceDto = {
        category: PreferenceCategory.NOTIFICATIONS,
        key: 'email',
        value: 'true',
      };
      const mockPreference = { id: 'pref-1', profileId, ...preferenceDto };
      const mockReq = { user: { userId } };

      mockProfileService.findByUserId.mockResolvedValue(mockProfile);
      mockPreferencesService.create.mockResolvedValue(mockPreference);

      const result = await controller.createPreference(mockReq as any, preferenceDto);

      expect(mockProfileService.findByUserId).toHaveBeenCalledWith(userId);
      expect(mockPreferencesService.create).toHaveBeenCalledWith(profileId, preferenceDto);
      expect(result).toEqual(mockPreference);
    });
  });

  describe('getMyActivities', () => {
    it('should return user activities with filters', async () => {
      const userId = '1';
      const profileId = 'profile-1';
      const mockProfile = { id: profileId, userId };
      const mockActivities = [{ id: 'act-1', profileId, activityType: 'login' }];
      const mockReq = { user: { userId } };
      const filter: ProfileActivityFilterDto = { startDate: '2023-01-01' };

      mockProfileService.findByUserId.mockResolvedValue(mockProfile);
      mockActivityService.findByProfileId.mockResolvedValue(mockActivities);

      const result = await controller.getMyActivities(mockReq as any, filter);

      expect(mockProfileService.findByUserId).toHaveBeenCalledWith(userId);
      expect(mockActivityService.findByProfileId).toHaveBeenCalledWith(profileId, filter);
      expect(result).toEqual(mockActivities);
    });
  });
});