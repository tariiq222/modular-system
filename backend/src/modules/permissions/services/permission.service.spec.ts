import { Test, TestingModule } from '@nestjs/testing';
import { PermissionService } from './permission.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Permission, ActionType, ResourceType } from '../entities/permission.entity';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';

describe('PermissionService', () => {
  let service: PermissionService;
  let repository: Repository<Permission>;

  const mockPermissionsRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PermissionService,
        {
          provide: getRepositoryToken(Permission),
          useValue: mockPermissionsRepository,
        },
      ],
    }).compile();

    service = module.get<PermissionService>(PermissionService);
    repository = module.get<Repository<Permission>>(getRepositoryToken(Permission));
    
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new permission with auto-generated name', async () => {
      const createDto = {
        action: ActionType.CREATE,
        resource: ResourceType.USER,
        description: 'إنشاء مستخدمين',
      };

      const expectedName = 'create:user';
      const permission = { id: '1', name: expectedName, ...createDto };

      mockPermissionsRepository.findOne.mockResolvedValue(null);
      mockPermissionsRepository.create.mockReturnValue(permission);
      mockPermissionsRepository.save.mockResolvedValue(permission);

      const result = await service.create(createDto);

      expect(mockPermissionsRepository.findOne).toHaveBeenCalledWith({
        where: { name: expectedName },
      });
      expect(mockPermissionsRepository.create).toHaveBeenCalledWith({
        ...createDto,
        name: expectedName,
      });
      expect(mockPermissionsRepository.save).toHaveBeenCalledWith(permission);
      expect(result).toEqual(permission);
    });

    it('should return existing permission if name already exists', async () => {
      const existingPermission = {
        id: '1',
        name: 'read:user',
        action: ActionType.READ,
        resource: ResourceType.USER,
        description: 'قراءة بيانات المستخدمين',
      };

      const createDto = {
        action: ActionType.READ,
        resource: ResourceType.USER,
        description: 'New description', // Should be ignored
      };

      mockPermissionsRepository.findOne.mockResolvedValue(existingPermission);

      const result = await service.create(createDto);

      expect(mockPermissionsRepository.findOne).toHaveBeenCalled();
      expect(mockPermissionsRepository.create).not.toHaveBeenCalled();
      expect(mockPermissionsRepository.save).not.toHaveBeenCalled();
      expect(result).toEqual(existingPermission);
    });
  });
  
  describe('findAll', () => {
    it('should return all permissions', async () => {
      const permissions = [
        { id: '1', name: 'create:user', action: ActionType.CREATE, resource: ResourceType.USER },
        { id: '2', name: 'read:user', action: ActionType.READ, resource: ResourceType.USER },
      ];
      
      mockPermissionsRepository.find.mockResolvedValue(permissions);
      
      const result = await service.findAll();
      
      expect(mockPermissionsRepository.find).toHaveBeenCalledWith({ relations: ['roles'] });
      expect(result).toEqual(permissions);
    });
  });
  
  describe('findOne', () => {
    it('should find a permission by id', async () => {
      const permission = { id: '1', name: 'create:user', action: ActionType.CREATE, resource: ResourceType.USER };
      
      mockPermissionsRepository.findOne.mockResolvedValue(permission);
      
      const result = await service.findOne('1');
      
      expect(mockPermissionsRepository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
        relations: ['roles'],
      });
      expect(result).toEqual(permission);
    });
    
    it('should throw NotFoundException if permission not found', async () => {
      mockPermissionsRepository.findOne.mockResolvedValue(null);
      
      await expect(service.findOne('999')).rejects.toThrow(NotFoundException);
    });
  });
  
  describe('findByName', () => {
    it('should find a permission by name', async () => {
      const permission = { id: '1', name: 'create:user', action: ActionType.CREATE, resource: ResourceType.USER };
      
      mockPermissionsRepository.findOne.mockResolvedValue(permission);
      
      const result = await service.findByName('create:user');
      
      expect(mockPermissionsRepository.findOne).toHaveBeenCalledWith({
        where: { name: 'create:user' },
        relations: ['roles'],
      });
      expect(result).toEqual(permission);
    });
    
    it('should throw NotFoundException if permission not found by name', async () => {
      mockPermissionsRepository.findOne.mockResolvedValue(null);
      
      await expect(service.findByName('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });
  
  describe('update', () => {
    it('should update a permission', async () => {
      const permission = { id: '1', name: 'create:user', action: ActionType.CREATE, resource: ResourceType.USER, description: '' };
      const updatedPermission = { ...permission, description: 'Updated description' };
      
      mockPermissionsRepository.findOne.mockResolvedValue(permission);
      mockPermissionsRepository.save.mockResolvedValue(updatedPermission);
      
      const result = await service.update('1', { description: 'Updated description' });
      
      expect(mockPermissionsRepository.findOne).toHaveBeenCalled();
      expect(mockPermissionsRepository.save).toHaveBeenCalled();
      expect(result).toEqual(updatedPermission);
    });
  });
  
  describe('remove', () => {
    it('should remove a permission', async () => {
      const permission = { id: '1', name: 'create:user', action: ActionType.CREATE, resource: ResourceType.USER };
      
      mockPermissionsRepository.findOne.mockResolvedValue(permission);
      mockPermissionsRepository.remove.mockResolvedValue(permission);
      
      const result = await service.remove('1');
      
      expect(mockPermissionsRepository.findOne).toHaveBeenCalled();
      expect(mockPermissionsRepository.remove).toHaveBeenCalledWith(permission);
      expect(result).toBe(true);
    });
  });
});