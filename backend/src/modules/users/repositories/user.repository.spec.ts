import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User, UserRole } from '../entities/user.entity';
import { UserRepository } from './user.repository';
import { CreateUserDto } from '../dtos/create-user.dto';

describe('UserRepository', () => {
  let repository: UserRepository;
  let mockQueryBuilder: any;

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

  beforeEach(async () => {
    mockQueryBuilder = {
      where: jest.fn().mockReturnThis(),
      getOne: jest.fn().mockResolvedValue(mockUser),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserRepository,
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn().mockResolvedValue(mockUser),
            create: jest.fn().mockReturnValue(mockUser),
            save: jest.fn().mockResolvedValue(mockUser),
            update: jest.fn().mockResolvedValue({ affected: 1 }),
            delete: jest.fn().mockResolvedValue({ affected: 1 }),
            createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
          },
        },
      ],
    }).compile();

    repository = module.get<UserRepository>(UserRepository);
  });

  describe('findById', () => {
    it('should find a user by id', async () => {
      const result = await repository.findById('1');
      expect(result).toEqual(mockUser);
    });
  });

  describe('findByEmail', () => {
    it('should find a user by email', async () => {
      const result = await repository.findByEmail('test@example.com');
      expect(result).toEqual(mockUser);
    });
  });

  describe('createUser', () => {
    it('should create a new user', async () => {
      const createUserDto: CreateUserDto = {
        email: 'new@example.com',
        password: 'password123',
        firstName: 'New',
        lastName: 'User',
      };

      jest.spyOn(repository, 'create').mockReturnValue({ ...mockUser, ...createUserDto } as User);
      jest.spyOn(repository, 'save').mockResolvedValue({ ...mockUser, ...createUserDto } as User);

      const result = await repository.createUser(createUserDto);
      
      expect(repository.create).toHaveBeenCalledWith(createUserDto);
      expect(repository.save).toHaveBeenCalled();
      expect(result).toEqual({ ...mockUser, ...createUserDto });
    });
  });

  describe('updateUser', () => {
    it('should update a user', async () => {
      const updateData = { firstName: 'Updated' };
      
      jest.spyOn(repository, 'update').mockResolvedValue({ affected: 1 } as any);
      jest.spyOn(repository, 'findById').mockResolvedValue({ ...mockUser, ...updateData } as User);

      const result = await repository.updateUser('1', updateData);
      
      expect(repository.update).toHaveBeenCalledWith('1', updateData);
      expect(repository.findById).toHaveBeenCalledWith('1');
      expect(result).toEqual({ ...mockUser, ...updateData });
    });

    it('should return null if update fails', async () => {
      const updateData = { firstName: 'Updated' };
      
      jest.spyOn(repository, 'update').mockResolvedValue({ affected: 0 } as any);

      const result = await repository.updateUser('999', updateData);
      
      expect(repository.update).toHaveBeenCalledWith('999', updateData);
      expect(result).toBeNull();
    });
  });

  describe('deleteUser', () => {
    it('should delete a user and return true', async () => {
      jest.spyOn(repository, 'delete').mockResolvedValue({ affected: 1 } as any);

      const result = await repository.deleteUser('1');
      
      expect(repository.delete).toHaveBeenCalledWith('1');
      expect(result).toBe(true);
    });

    it('should return false if delete fails', async () => {
      jest.spyOn(repository, 'delete').mockResolvedValue({ affected: 0 } as any);

      const result = await repository.deleteUser('999');
      
      expect(repository.delete).toHaveBeenCalledWith('999');
      expect(result).toBe(false);
    });
  });

  describe('updateLastLogin', () => {
    it('should update last login date', async () => {
      jest.spyOn(repository, 'update').mockResolvedValue({ affected: 1 } as any);
      
      const result = await repository.updateLastLogin('1');
      
      expect(repository.update).toHaveBeenCalledWith('1', { lastLogin: expect.any(Date) });
      expect(result).toBe(true);
    });
  });

  // markEmailAsConfirmed method removed - test commented out
  /*
  describe('markEmailAsConfirmed', () => {
    it('should mark email as confirmed', async () => {
      jest.spyOn(repository, 'update').mockResolvedValue({ affected: 1 } as any);
      
      const result = await repository.markEmailAsConfirmed('test@example.com');
      
      expect(repository.update).toHaveBeenCalledWith({ email: 'test@example.com' }, { isActive: true });
      expect(result).toBe(true);
    });
  });
  */
});