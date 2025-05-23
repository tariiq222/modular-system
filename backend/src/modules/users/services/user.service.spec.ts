import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { UserService } from './user.service';
import { UserRepository } from '../repositories/user.repository';
import { User, UserRole } from '../entities/user.entity';
import { CreateUserDto } from '../dtos/create-user.dto';
import { UpdateUserDto } from '../dtos/update-user.dto';

describe('UserService', () => {
  let service: UserService;
  let repository: UserRepository;

  const mockUser: User = {
    id: '1',
    email: 'test@example.com',
    password: 'hashedPassword',
    firstName: 'Test',
    lastName: 'User',
    role: { name: UserRole.USER } as any,
    isActive: true,
    status: 'active' as any,
    emailVerified: false,
    mustChangePassword: false,
    failedLoginAttempts: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    hashPassword: jest.fn(),
    validatePassword: jest.fn().mockResolvedValue(true),
    toJSON: jest.fn(),
  } as any;

  const mockUserRepository = {
    findByEmail: jest.fn(),
    createUser: jest.fn(),
    find: jest.fn(),
    findById: jest.fn(),
    updateUser: jest.fn(),
    deleteUser: jest.fn(),
    save: jest.fn(),
    updateLastLogin: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(UserRepository),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    repository = module.get<UserRepository>(getRepositoryToken(UserRepository));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const createUserDto: CreateUserDto = {
        email: 'new@example.com',
        password: 'password123',
        firstName: 'New',
        lastName: 'User',
      };

      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockUserRepository.createUser.mockResolvedValue(mockUser);

      const result = await service.create(createUserDto);

      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(createUserDto.email);
      expect(mockUserRepository.createUser).toHaveBeenCalledWith(createUserDto);
      
      // Check that password is not included in the result
      expect(result).not.toHaveProperty('password');
      expect(result).toEqual(expect.objectContaining({
        id: mockUser.id,
        email: mockUser.email,
        firstName: mockUser.firstName,
        lastName: mockUser.lastName,
      }));
    });

    it('should throw ConflictException if email exists', async () => {
      const createUserDto: CreateUserDto = {
        email: 'existing@example.com',
        password: 'password123',
        firstName: 'Existing',
        lastName: 'User',
      };

      mockUserRepository.findByEmail.mockResolvedValue(mockUser);

      await expect(service.create(createUserDto)).rejects.toThrow(ConflictException);
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(createUserDto.email);
      expect(mockUserRepository.createUser).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return all users without passwords', async () => {
      const mockUsers = [mockUser, { ...mockUser, id: '2', email: 'user2@example.com' }];
      mockUserRepository.find.mockResolvedValue(mockUsers);

      const result = await service.findAll();

      expect(mockUserRepository.find).toHaveBeenCalled();
      expect(result.length).toBe(2);
      expect(result[0]).not.toHaveProperty('password');
      expect(result[1]).not.toHaveProperty('password');
    });
  });

  describe('findOne', () => {
    it('should return a user by id without password', async () => {
      mockUserRepository.findById.mockResolvedValue(mockUser);

      const result = await service.findOne('1');

      expect(mockUserRepository.findById).toHaveBeenCalledWith('1');
      expect(result).not.toHaveProperty('password');
      expect(result).toEqual(expect.objectContaining({
        id: mockUser.id,
        email: mockUser.email,
      }));
    });

    it('should throw NotFoundException if user not found', async () => {
      mockUserRepository.findById.mockResolvedValue(null);

      await expect(service.findOne('999')).rejects.toThrow(NotFoundException);
      expect(mockUserRepository.findById).toHaveBeenCalledWith('999');
    });
  });

  describe('update', () => {
    it('should update user details', async () => {
      const updateUserDto: UpdateUserDto = {
        firstName: 'Updated',
        lastName: 'Name',
      };

      const updatedUser = {
        ...mockUser,
        firstName: 'Updated',
        lastName: 'Name',
      };

      mockUserRepository.findById.mockResolvedValue(mockUser);
      mockUserRepository.updateUser.mockResolvedValue(updatedUser);

      const result = await service.update('1', updateUserDto);

      expect(mockUserRepository.findById).toHaveBeenCalledWith('1');
      expect(mockUserRepository.updateUser).toHaveBeenCalledWith('1', expect.objectContaining({
        firstName: 'Updated',
        lastName: 'Name',
      }));
      expect(result).not.toHaveProperty('password');
      expect(result).toEqual(expect.objectContaining({
        firstName: 'Updated',
        lastName: 'Name',
      }));
    });

    it('should update password when new password is provided with valid current password', async () => {
      const updateUserDto: UpdateUserDto = {
        currentPassword: 'currentPassword',
        newPassword: 'newPassword',
      };

      const updatedUser = {
        ...mockUser,
        password: 'hashedNewPassword',
      };

      mockUserRepository.findById.mockResolvedValue({
        ...mockUser,
        validatePassword: jest.fn().mockResolvedValue(true),
      });
      mockUserRepository.updateUser.mockResolvedValue(updatedUser);

      const result = await service.update('1', updateUserDto);

      expect(mockUserRepository.findById).toHaveBeenCalledWith('1');
      expect(mockUserRepository.updateUser).toHaveBeenCalled();
      expect(result).not.toHaveProperty('password');
    });

    it('should throw BadRequestException if current password is missing', async () => {
      const updateUserDto: UpdateUserDto = {
        newPassword: 'newPassword',
      };

      mockUserRepository.findById.mockResolvedValue(mockUser);

      await expect(service.update('1', updateUserDto)).rejects.toThrow(BadRequestException);
      expect(mockUserRepository.findById).toHaveBeenCalledWith('1');
      expect(mockUserRepository.updateUser).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException if current password is invalid', async () => {
      const updateUserDto: UpdateUserDto = {
        currentPassword: 'wrongPassword',
        newPassword: 'newPassword',
      };

      mockUserRepository.findById.mockResolvedValue({
        ...mockUser,
        validatePassword: jest.fn().mockResolvedValue(false),
      });

      await expect(service.update('1', updateUserDto)).rejects.toThrow(BadRequestException);
      expect(mockUserRepository.findById).toHaveBeenCalledWith('1');
      expect(mockUserRepository.updateUser).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException if user not found', async () => {
      mockUserRepository.findById.mockResolvedValue(null);

      await expect(service.update('999', { firstName: 'Test' })).rejects.toThrow(NotFoundException);
      expect(mockUserRepository.findById).toHaveBeenCalledWith('999');
      expect(mockUserRepository.updateUser).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should remove a user', async () => {
      mockUserRepository.deleteUser.mockResolvedValue(true);

      await service.remove('1');

      expect(mockUserRepository.deleteUser).toHaveBeenCalledWith('1');
    });

    it('should throw NotFoundException if user not found', async () => {
      mockUserRepository.deleteUser.mockResolvedValue(false);

      await expect(service.remove('999')).rejects.toThrow(NotFoundException);
      expect(mockUserRepository.deleteUser).toHaveBeenCalledWith('999');
    });
  });

  describe('findByEmail', () => {
    it('should find a user by email', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(mockUser);

      const result = await service.findByEmail('test@example.com');

      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith('test@example.com');
      expect(result).toEqual(mockUser);
    });
  });

  describe('updateLastLogin', () => {
    it('should update last login time', async () => {
      mockUserRepository.updateLastLogin.mockResolvedValue(true);

      const result = await service.updateLastLogin('1');

      expect(mockUserRepository.updateLastLogin).toHaveBeenCalledWith('1');
      expect(result).toBe(true);
    });
  });

  describe('updatePassword', () => {
    it('should update user password', async () => {
      mockUserRepository.findById.mockResolvedValue(mockUser);
      mockUserRepository.save.mockResolvedValue({ ...mockUser, password: 'newHashedPassword' });

      const result = await service.updatePassword('1', 'newPassword');

      expect(mockUserRepository.findById).toHaveBeenCalledWith('1');
      expect(mockUserRepository.save).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('should throw NotFoundException if user not found', async () => {
      mockUserRepository.findById.mockResolvedValue(null);

      await expect(service.updatePassword('999', 'newPassword')).rejects.toThrow(NotFoundException);
      expect(mockUserRepository.findById).toHaveBeenCalledWith('999');
      expect(mockUserRepository.save).not.toHaveBeenCalled();
    });
  });
});