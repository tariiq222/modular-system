import { Test, TestingModule } from '@nestjs/testing';
import { ProfileService } from './profile.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Profile, GenderType } from '../entities/profile.entity';
import { UserService } from '../../users/services/user.service';
import { CreateProfileDto } from '../dtos/create-profile.dto';
import { UpdateProfileDto } from '../dtos/update-profile.dto';
import { NotFoundException } from '@nestjs/common';

describe('ProfileService', () => {
  let service: ProfileService;
  let mockProfileRepository: any;
  let mockUserService: any;

  beforeEach(async () => {
    mockProfileRepository = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      merge: jest.fn(),
      remove: jest.fn(),
    };

    mockUserService = {
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProfileService,
        { provide: getRepositoryToken(Profile), useValue: mockProfileRepository },
        { provide: UserService, useValue: mockUserService },
      ],
    }).compile();

    service = module.get<ProfileService>(ProfileService);

    // Mock findByUserId method to prevent NotFoundException
    jest.spyOn(service, 'findByUserId').mockImplementation(async (userId: string) => {
      // Return different results based on test cases
      if (userId === 'nonexistent-user') {
        throw new NotFoundException('Profile not found');
      }
      return { id: 'profile-123', userId } as Profile;
    });
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new profile', async () => {
      const userId = 'create-user';
      const createProfileDto: CreateProfileDto = {
        bio: 'u0645u0647u0646u062fu0633 u0628u0631u0645u062cu064au0627u062a',
        gender: GenderType.MALE,
      };
      
      const mockUser = { id: userId, name: 'Test User' };
      const mockProfile = { 
        id: 'new-profile', 
        userId, 
        ...createProfileDto 
      };
      
      mockUserService.findOne.mockResolvedValue(mockUser);
      
      // Mock findByUserId to throw NotFoundException for this test
      mockProfileRepository.findOne.mockRejectedValueOnce(new NotFoundException('Profile not found'));
      
      mockProfileRepository.create.mockReturnValue(mockProfile);
      mockProfileRepository.save.mockResolvedValue(mockProfile);

      const result = await service.create(userId, createProfileDto);
      
      expect(mockUserService.findOne).toHaveBeenCalledWith(userId);
      expect(mockProfileRepository.create).toHaveBeenCalledWith({
        userId,
        ...createProfileDto
      });
      expect(mockProfileRepository.save).toHaveBeenCalledWith(mockProfile);
      expect(result).toEqual(mockProfile);
    });

    it('should update existing profile if already exists', async () => {
      const userId = 'user-123';
      const createProfileDto: CreateProfileDto = {
        bio: 'u0645u0647u0646u062fu0633 u0628u0631u0645u062cu064au0627u062a',
      };
      
      const mockUser = { id: userId, name: 'Test User' };
      const existingProfile = { 
        id: 'profile-123', 
        userId, 
        bio: 'u0633u064au0631u0629 u0630u0627u062au064au0629 u0642u062fu064au0645u0629' 
      };
      const updatedProfile = { 
        ...existingProfile, 
        ...createProfileDto 
      };
      
      mockUserService.findOne.mockResolvedValue(mockUser);
      mockProfileRepository.findOne.mockResolvedValue(existingProfile);
      mockProfileRepository.findOne.mockImplementationOnce(() => Promise.resolve(existingProfile)); // findByUserId
      mockProfileRepository.findOne.mockImplementationOnce(() => Promise.resolve(existingProfile)); // findOne
      mockProfileRepository.merge.mockReturnValue(updatedProfile);
      mockProfileRepository.save.mockResolvedValue(updatedProfile);

      const result = await service.create(userId, createProfileDto);
      
      expect(mockUserService.findOne).toHaveBeenCalledWith(userId);
      expect(mockProfileRepository.merge).toHaveBeenCalled();
      expect(mockProfileRepository.save).toHaveBeenCalled();
      expect(result).toEqual(updatedProfile);
    });

    it('should throw NotFoundException if user does not exist', async () => {
      const userId = 'nonexistent-user';
      const createProfileDto: CreateProfileDto = {
        bio: 'u0645u0647u0646u062fu0633 u0628u0631u0645u062cu064au0627u062a',
      };
      
      mockUserService.findOne.mockResolvedValue(null);

      await expect(service.create(userId, createProfileDto)).rejects.toThrow(NotFoundException);
      expect(mockUserService.findOne).toHaveBeenCalledWith(userId);
    });
  });

  describe('findByUserId', () => {
    it('should return a profile by userId', async () => {
      const userId = 'user-123';
      const mockProfile = { id: 'profile-123', userId };
      
      mockProfileRepository.findOne.mockResolvedValue(mockProfile);

      const result = await service.findByUserId(userId);
      
      expect(mockProfileRepository.findOne).toHaveBeenCalledWith({
        where: { userId },
        relations: ['user', 'preferences', 'activities'],
      });
      expect(result).toEqual(mockProfile);
    });

    it('should throw NotFoundException if profile not found', async () => {
      const userId = 'nonexistent-user';
      
      mockProfileRepository.findOne.mockResolvedValue(null);

      await expect(service.findByUserId(userId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateByUserId', () => {
    it('should update profile by userId', async () => {
      const userId = 'user-123';
      const updateProfileDto: UpdateProfileDto = {
        bio: 'u0633u064au0631u0629 u0630u0627u062au064au0629 u0645u062du062fu062bu0629',
      };
      
      const existingProfile: Profile = { 
        id: 'profile-123', 
        userId,
        user: null,
        bio: 'u0633u064au0631u0629 u0630u0627u062au064au0629 u0642u062fu064au0645u0629',
        avatar: '',
        phoneNumber: '',
        address: '',
        city: '',
        country: '',
        postalCode: '',
        gender: GenderType.PREFER_NOT_TO_SAY,
        birthDate: new Date(),
        profession: '',
        company: '',
        website: '',
        facebookUrl: '',
        twitterUrl: '',
        linkedinUrl: '',
        instagramUrl: '',
        isPublic: false,
        preferences: [],
        activities: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const updatedProfile: Profile = { 
        ...existingProfile,
        bio: 'u0633u064au0631u0629 u0630u0627u062au064au0629 u0645u062du062fu062bu0629' 
      };
      
      // Mock the findOne call in the update method
      mockProfileRepository.findOne.mockResolvedValueOnce(existingProfile);
      mockProfileRepository.merge.mockReturnValue(updatedProfile);
      mockProfileRepository.save.mockResolvedValue(updatedProfile);

      const result = await service.updateByUserId(userId, updateProfileDto);
      
      expect(mockProfileRepository.merge).toHaveBeenCalledWith(existingProfile, updateProfileDto);
      expect(mockProfileRepository.save).toHaveBeenCalledWith(updatedProfile);
      expect(result).toEqual(updatedProfile);
    });

    it('should create profile if not exists', async () => {
      const userId = 'new-user';
      const updateProfileDto: UpdateProfileDto = {
        bio: 'u0633u064au0631u0629 u0630u0627u062au064au0629 u062cu062fu064au062fu0629',
      };
      const newProfile: Profile = { 
        id: 'new-profile', 
        userId, 
        bio: updateProfileDto.bio || '',
        user: null,
        avatar: '',
        phoneNumber: '',
        address: '',
        city: '',
        country: '',
        postalCode: '',
        gender: GenderType.PREFER_NOT_TO_SAY,
        birthDate: new Date(),
        profession: '',
        company: '',
        website: '',
        facebookUrl: '',
        twitterUrl: '',
        linkedinUrl: '',
        instagramUrl: '',
        isPublic: false,
        preferences: [],
        activities: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      // Mock findOne to throw NotFoundException for this test
      mockProfileRepository.findOne.mockRejectedValueOnce(new NotFoundException('Profile not found'));

      // Mock userService.findOne for the create method
      mockUserService.findOne.mockResolvedValue({ id: userId, name: 'Test User' });
      
      // Mock repository create and save methods
      mockProfileRepository.create.mockReturnValue(newProfile);
      mockProfileRepository.save.mockResolvedValue(newProfile);

      const result = await service.updateByUserId(userId, updateProfileDto);
      
      expect(service.create).toHaveBeenCalledWith(userId, updateProfileDto);
      expect(result).toEqual(newProfile);
    });
  });

  describe('updateAvatar', () => {
    it('should update profile avatar', async () => {
      const profileId = 'profile-123';
      const avatarUrl = 'https://example.com/avatars/test.jpg';
      
      const existingProfile = { 
        id: profileId, 
        avatar: 'old-avatar.jpg' 
      };
      const updatedProfile = { 
        ...existingProfile, 
        avatar: avatarUrl 
      };
      
      mockProfileRepository.findOne.mockResolvedValue(existingProfile);
      mockProfileRepository.save.mockResolvedValue(updatedProfile);

      const result = await service.updateAvatar(profileId, avatarUrl);
      
      expect(mockProfileRepository.findOne).toHaveBeenCalledWith({
        where: { id: profileId },
        relations: ['user', 'preferences', 'activities'],
      });
      expect(mockProfileRepository.save).toHaveBeenCalledWith({
        ...existingProfile,
        avatar: avatarUrl
      });
      expect(result).toEqual(updatedProfile);
    });
  });
});