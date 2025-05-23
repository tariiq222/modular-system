import { Test, TestingModule } from '@nestjs/testing';
import { RoleService } from './role.service';
import { PermissionService } from './permission.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Role } from '../entities/role.entity';
import { Permission } from '../entities/permission.entity';
import { Repository, In } from 'typeorm';
import { ConflictException, NotFoundException } from '@nestjs/common';

describe('RoleService', () => {
  let service: RoleService;
  let roleRepository: Repository<Role>;
  let permissionRepository: Repository<Permission>;
  let permissionService: PermissionService;

  const mockRoleRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
  };

  const mockPermissionRepository = {
    findByIds: jest.fn(),
    find: jest.fn(),
  };

  const mockPermissionService = {
    createDefaultPermissions: jest.fn(),
    findByName: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RoleService,
        {
          provide: getRepositoryToken(Role),
          useValue: mockRoleRepository,
        },
        {
          provide: getRepositoryToken(Permission),
          useValue: mockPermissionRepository,
        },
        {
          provide: PermissionService,
          useValue: mockPermissionService,
        },
      ],
    }).compile();

    service = module.get<RoleService>(RoleService);
    roleRepository = module.get<Repository<Role>>(getRepositoryToken(Role));
    permissionRepository = module.get<Repository<Permission>>(getRepositoryToken(Permission));
    permissionService = module.get<PermissionService>(PermissionService);
    
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new role', async () => {
      const createRoleDto = {
        name: 'TEST_ROLE',
        description: 'u062fu0648u0631 u0627u062eu062au0628u0627u0631u064a',
      };

      const role = { id: '1', ...createRoleDto, isSystem: false, isDefault: false };

      mockRoleRepository.findOne.mockResolvedValue(null);
      mockRoleRepository.create.mockReturnValue(role);
      mockRoleRepository.save.mockResolvedValue(role);

      const result = await service.create(createRoleDto);

      expect(mockRoleRepository.findOne).toHaveBeenCalledWith({
        where: { name: createRoleDto.name },
      });
      expect(mockRoleRepository.create).toHaveBeenCalledWith(expect.objectContaining({
        name: createRoleDto.name,
        description: createRoleDto.description,
        isDefault: false,
        isSystem: false,
      }));
      expect(mockRoleRepository.save).toHaveBeenCalled();
      expect(result).toEqual(role);
    });

    it('should throw ConflictException if role name already exists', async () => {
      const createRoleDto = {
        name: 'EXISTING_ROLE',
        description: 'u062fu0648u0631 u0645u0648u062cu0648u062f',
      };

      mockRoleRepository.findOne.mockResolvedValue({ id: '1', name: 'EXISTING_ROLE' });

      await expect(service.create(createRoleDto)).rejects.toThrow(ConflictException);
    });

    it('should assign permissions if permissionIds are provided', async () => {
      const createRoleDto = {
        name: 'ROLE_WITH_PERMISSIONS',
        description: 'u062fu0648u0631 u0645u0639 u0635u0644u0627u062du064au0627u062a',
        permissionIds: ['1', '2'],
      };

      const role = { id: '1', name: createRoleDto.name, description: createRoleDto.description, isSystem: false, isDefault: false };
      const permissions = [
        { id: '1', name: 'read:user' },
        { id: '2', name: 'create:user' },
      ];
      const roleWithPermissions = { ...role, permissions };

      mockRoleRepository.findOne.mockResolvedValue(null);
      mockRoleRepository.create.mockReturnValue(role);
      mockRoleRepository.save.mockResolvedValue(role);

      // Mock for the second call to findOne in assignPermissionsToRole
      mockRoleRepository.findOne.mockResolvedValueOnce(null).mockResolvedValueOnce(role);
      mockPermissionRepository.find.mockResolvedValue(permissions);
      mockRoleRepository.save.mockResolvedValueOnce(role).mockResolvedValueOnce(roleWithPermissions);
      
      // Mock for the third call to findOne in the final findOne call
      mockRoleRepository.findOne.mockResolvedValueOnce(null).mockResolvedValueOnce(role).mockResolvedValueOnce(roleWithPermissions);

      const result = await service.create(createRoleDto);

      expect(mockRoleRepository.create).toHaveBeenCalled();
      expect(mockRoleRepository.save).toHaveBeenCalled();
      expect(mockPermissionRepository.find).toHaveBeenCalledWith({
        where: { id: In(createRoleDto.permissionIds) },
      });
      expect(result).toEqual(roleWithPermissions);
    });
  });

  describe('findAll', () => {
    it('should return all roles', async () => {
      const roles = [
        { id: '1', name: 'ADMIN', isSystem: true },
        { id: '2', name: 'USER', isSystem: true },
      ];

      mockRoleRepository.find.mockResolvedValue(roles);

      const result = await service.findAll();

      expect(mockRoleRepository.find).toHaveBeenCalledWith({
        relations: ['permissions'],
        order: { name: 'ASC' },
      });
      expect(result).toEqual(roles);
    });
  });

  describe('findOne', () => {
    it('should find a role by id', async () => {
      const role = { id: '1', name: 'ADMIN', isSystem: true };

      mockRoleRepository.findOne.mockResolvedValue(role);

      const result = await service.findOne('1');

      expect(mockRoleRepository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
        relations: ['permissions', 'policies'],
      });
      expect(result).toEqual(role);
    });

    it('should throw NotFoundException if role not found', async () => {
      mockRoleRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('999')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a role', async () => {
      const role = { 
        id: '1', 
        name: 'TEST_ROLE', 
        description: 'Old description', 
        isSystem: false, 
        isDefault: false,
        permissions: []
      };
      
      const updateRoleDto = {
        description: 'Updated description',
      };
      
      const updatedRole = { ...role, description: 'Updated description' };

      mockRoleRepository.findOne.mockResolvedValue(role);
      mockRoleRepository.save.mockResolvedValue(updatedRole);

      const result = await service.update('1', updateRoleDto);

      expect(mockRoleRepository.findOne).toHaveBeenCalled();
      expect(mockRoleRepository.save).toHaveBeenCalled();
      expect(result).toEqual(updatedRole);
    });

    it('should throw ConflictException when trying to change name of system role', async () => {
      const systemRole = { 
        id: '1', 
        name: 'ADMIN', 
        isSystem: true, 
        permissions: [] 
      };
      
      const updateRoleDto = {
        name: 'NEW_NAME',
      };

      mockRoleRepository.findOne.mockResolvedValue(systemRole);

      await expect(service.update('1', updateRoleDto)).rejects.toThrow(ConflictException);
    });
  });

  describe('remove', () => {
    it('should remove a non-system role', async () => {
      const role = { id: '1', name: 'CUSTOM_ROLE', isSystem: false, permissions: [] };

      mockRoleRepository.findOne.mockResolvedValue(role);
      mockRoleRepository.remove.mockResolvedValue(role);

      const result = await service.remove('1');

      expect(mockRoleRepository.findOne).toHaveBeenCalled();
      expect(mockRoleRepository.remove).toHaveBeenCalledWith(role);
      expect(result).toBe(true);
    });

    it('should throw ConflictException when trying to remove a system role', async () => {
      const systemRole = { id: '1', name: 'ADMIN', isSystem: true, permissions: [] };

      mockRoleRepository.findOne.mockResolvedValue(systemRole);

      await expect(service.remove('1')).rejects.toThrow(ConflictException);
    });
  });

  describe('createDefaultRoles', () => {
    it('should create default roles with permissions', async () => {
      // Mock creating permissions first
      mockPermissionService.createDefaultPermissions.mockResolvedValue([]);
      
      // Mock finding existing roles
      mockRoleRepository.findOne.mockRejectedValue(new NotFoundException());
      
      // Mock creating new roles
      const adminRole = { id: '1', name: 'ADMIN', isSystem: true, permissions: [] };
      const moderatorRole = { id: '2', name: 'MODERATOR', isSystem: true, permissions: [] };
      const userRole = { id: '3', name: 'USER', isSystem: true, permissions: [] };
      
      mockRoleRepository.create.mockReturnValueOnce(adminRole)
                                .mockReturnValueOnce(moderatorRole)
                                .mockReturnValueOnce(userRole);
                                
      mockRoleRepository.save.mockResolvedValueOnce(adminRole)
                              .mockResolvedValueOnce(moderatorRole)
                              .mockResolvedValueOnce(userRole)
                              .mockResolvedValue({ ...adminRole, permissions: [] })
                              .mockResolvedValue({ ...moderatorRole, permissions: [] })
                              .mockResolvedValue({ ...userRole, permissions: [] });
      
      // Mock finding permissions by name
      mockPermissionService.findByName.mockImplementation((name) => {
        return Promise.resolve({ id: name, name });
      });

      const result = await service.createDefaultRoles();

      expect(mockPermissionService.createDefaultPermissions).toHaveBeenCalled();
      expect(mockRoleRepository.create).toHaveBeenCalledTimes(3);
      expect(mockRoleRepository.save).toHaveBeenCalledTimes(6); // 3 for initial save, 3 for saving with permissions
      expect(result.length).toBe(3);
    });
  });
});