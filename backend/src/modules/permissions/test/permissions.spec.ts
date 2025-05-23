import { Test, TestingModule } from '@nestjs/testing';
import { PermissionService } from '../services/permission.service';
import { RoleService } from '../services/role.service';
import { PolicyService } from '../services/policy.service';
import { PermissionsGuard } from '../guards/permissions.guard';
import { ActionType, Permission, ResourceType } from '../entities/permission.entity';
import { Role } from '../entities/role.entity';
import { ResourcePolicy } from '../entities/resource-policy.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { IS_PUBLIC_KEY } from '../../../shared/decorators/public.decorator';

describe('Permissions System Tests', () => {
  let permissionService: PermissionService;
  let roleService: RoleService;
  let policyService: PolicyService;
  let permissionsGuard: PermissionsGuard;
  let mockPermissionRepository: any;
  let mockRoleRepository: any;
  let mockPolicyRepository: any;
  let mockReflector: any;

  beforeEach(async () => {
    // Create mock repositories
    mockPermissionRepository = {
      find: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      remove: jest.fn(),
    };

    mockRoleRepository = {
      find: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      remove: jest.fn(),
    };

    mockPolicyRepository = {
      find: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      remove: jest.fn(),
    };

    mockReflector = {
      getAllAndOverride: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PermissionService,
        RoleService,
        PolicyService,
        PermissionsGuard,
        { provide: getRepositoryToken(Permission), useValue: mockPermissionRepository },
        { provide: getRepositoryToken(Role), useValue: mockRoleRepository },
        { provide: getRepositoryToken(ResourcePolicy), useValue: mockPolicyRepository },
        { provide: Reflector, useValue: mockReflector },
      ],
    }).compile();

    permissionService = module.get<PermissionService>(PermissionService);
    roleService = module.get<RoleService>(RoleService);
    policyService = module.get<PolicyService>(PolicyService);
    permissionsGuard = module.get<PermissionsGuard>(PermissionsGuard);
  });

  describe('Permission Service', () => {
    it('should create a new permission', async () => {
      const createPermissionDto = {
        action: ActionType.READ,
        resource: ResourceType.USER,
        description: 'Read user information',
      };

      const expectedPermission = {
        id: 'perm-123',
        name: 'read:user',
        ...createPermissionDto,
      };

      mockPermissionRepository.findOne.mockResolvedValue(null);
      mockPermissionRepository.create.mockReturnValue(expectedPermission);
      mockPermissionRepository.save.mockResolvedValue(expectedPermission);

      const result = await permissionService.create(createPermissionDto);

      expect(mockPermissionRepository.findOne).toHaveBeenCalled();
      expect(mockPermissionRepository.create).toHaveBeenCalledWith({
        ...createPermissionDto,
        name: 'read:user',
      });
      expect(mockPermissionRepository.save).toHaveBeenCalledWith(expectedPermission);
      expect(result).toEqual(expectedPermission);
    });

    it('should return existing permission if already exists', async () => {
      const createPermissionDto = {
        action: ActionType.READ,
        resource: ResourceType.USER,
        description: 'Read user information',
        name: 'read:user',
      };

      const existingPermission = {
        id: 'perm-123',
        ...createPermissionDto,
      };

      mockPermissionRepository.findOne.mockResolvedValue(existingPermission);

      const result = await permissionService.create(createPermissionDto);

      expect(mockPermissionRepository.findOne).toHaveBeenCalled();
      expect(mockPermissionRepository.create).not.toHaveBeenCalled();
      expect(mockPermissionRepository.save).not.toHaveBeenCalled();
      expect(result).toEqual(existingPermission);
    });
  });

  describe('Role Service', () => {
    it('should create a new role with permissions', async () => {
      const createRoleDto = {
        name: 'TEST_ROLE',
        description: 'Role for testing',
        isDefault: false,
        permissionIds: ['perm-1', 'perm-2'],
      };

      const roleWithoutPermissions = {
        id: 'role-123',
        name: createRoleDto.name,
        description: createRoleDto.description,
        isDefault: createRoleDto.isDefault,
        isSystem: false,
      };

      const permissions = [
        {
          id: 'perm-1',
          name: 'read:user',
          action: 'read' as any,
          resource: 'user' as any,
          description: 'Read user permission',
          roles: [],
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'perm-2',
          name: 'update:user',
          action: 'update' as any,
          resource: 'user' as any,
          description: 'Update user permission',
          roles: [],
          createdAt: new Date(),
          updatedAt: new Date()
        },
      ];

      const roleWithPermissions: Role = {
        ...roleWithoutPermissions,
        permissions,
        policies: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Mock repository calls
      mockRoleRepository.findOne.mockResolvedValue(null); // No existing role
      mockRoleRepository.create.mockReturnValue(roleWithoutPermissions);
      mockRoleRepository.save.mockResolvedValue(roleWithoutPermissions);
      mockPermissionRepository.find.mockResolvedValue(permissions);

      // Mock findOne after role creation to include permissions
      jest.spyOn(roleService, 'findOne').mockResolvedValue(roleWithPermissions);

      const result = await roleService.create(createRoleDto);

      expect(mockRoleRepository.findOne).toHaveBeenCalled();
      expect(mockRoleRepository.create).toHaveBeenCalled();
      expect(mockRoleRepository.save).toHaveBeenCalled();
      expect(mockPermissionRepository.find).toHaveBeenCalled();
      expect(result).toEqual(roleWithPermissions);
    });

    it('should check if role has permission', async () => {
      const roleId = 'role-123';
      const permissionName = 'read:user';

      const role = {
        id: roleId,
        permissions: [
          { id: 'perm-1', name: 'read:user' },
          { id: 'perm-2', name: 'update:user' },
        ],
      };

      jest.spyOn(roleService, 'findOne').mockResolvedValue(role as any);

      const result = await roleService.hasPermission(roleId, permissionName);

      expect(roleService.findOne).toHaveBeenCalledWith(roleId);
      expect(result).toBe(true);
    });

    it('should return false if role does not have permission', async () => {
      const roleId = 'role-123';
      const permissionName = 'delete:user';

      const role = {
        id: roleId,
        permissions: [
          { id: 'perm-1', name: 'read:user' },
          { id: 'perm-2', name: 'update:user' },
        ],
      };

      jest.spyOn(roleService, 'findOne').mockResolvedValue(role as any);

      const result = await roleService.hasPermission(roleId, permissionName);

      expect(roleService.findOne).toHaveBeenCalledWith(roleId);
      expect(result).toBe(false);
    });
  });

  describe('Policy Service', () => {
    it('should check access based on resource policy', async () => {
      const roleIds = ['role-1'];
      const resource = ResourceType.USER;
      const resourceId = 'user-123';
      const attributes = { departmentId: 'IT' };

      // Policy that allows access for departmentId = IT
      const policies = [
        {
          id: 'policy-1',
          roleId: 'role-1',
          resource: ResourceType.USER,
          resourceId: null,
          attributeName: 'departmentId',
          attributeValue: 'IT',
          condition: true,
        },
      ];

      mockPolicyRepository.find.mockResolvedValue(policies);

      const result = await policyService.checkAccess(roleIds, resource, resourceId, attributes);

      expect(mockPolicyRepository.find).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('should deny access based on resource policy', async () => {
      const roleIds = ['role-1'];
      const resource = ResourceType.USER;
      const resourceId = 'user-123';
      const attributes = { departmentId: 'IT' };

      // Policy that denies access for departmentId = IT
      const policies = [
        {
          id: 'policy-1',
          roleId: 'role-1',
          resource: ResourceType.USER,
          resourceId: null,
          attributeName: 'departmentId',
          attributeValue: 'IT',
          condition: false,
        },
      ];

      mockPolicyRepository.find.mockResolvedValue(policies);

      const result = await policyService.checkAccess(roleIds, resource, resourceId, attributes);

      expect(mockPolicyRepository.find).toHaveBeenCalled();
      expect(result).toBe(false);
    });
  });

  describe('Permissions Guard', () => {
    it('should allow access for public routes', async () => {
      const mockContext = {
        getHandler: jest.fn(),
        getClass: jest.fn(),
        switchToHttp: jest.fn(() => ({
          getRequest: jest.fn(() => ({})),
        })),
      } as unknown as ExecutionContext;

      mockReflector.getAllAndOverride.mockReturnValueOnce(true); // IS_PUBLIC_KEY

      const result = await permissionsGuard.canActivate(mockContext);

      expect(mockReflector.getAllAndOverride).toHaveBeenCalledWith(IS_PUBLIC_KEY, [
        mockContext.getHandler(),
        mockContext.getClass(),
      ]);
      expect(result).toBe(true);
    });

    it('should allow access if no required permissions', async () => {
      const mockContext = {
        getHandler: jest.fn(),
        getClass: jest.fn(),
        switchToHttp: jest.fn(() => ({
          getRequest: jest.fn(() => ({})),
        })),
      } as unknown as ExecutionContext;

      mockReflector.getAllAndOverride.mockReturnValueOnce(false); // IS_PUBLIC_KEY
      mockReflector.getAllAndOverride.mockReturnValueOnce(null); // PERMISSIONS_KEY

      const result = await permissionsGuard.canActivate(mockContext);

      expect(mockReflector.getAllAndOverride).toHaveBeenCalledWith(IS_PUBLIC_KEY, [
        mockContext.getHandler(),
        mockContext.getClass(),
      ]);
      expect(mockReflector.getAllAndOverride).toHaveBeenCalledWith(PERMISSIONS_KEY, [
        mockContext.getHandler(),
        mockContext.getClass(),
      ]);
      expect(result).toBe(true);
    });

    it('should check user role permissions', async () => {
      const requiredPermissions = ['read:user'];
      const userId = 'user-123';
      const roleId = 'role-123';
      const roleName = 'USER';

      const mockRequest = {
        user: { userId, role: roleName },
      };

      const mockContext = {
        getHandler: jest.fn(),
        getClass: jest.fn(),
        switchToHttp: jest.fn(() => ({
          getRequest: jest.fn(() => mockRequest),
        })),
      } as unknown as ExecutionContext;

      const mockRole = {
        id: roleId,
        name: roleName,
        permissions: [
          { id: 'perm-1', name: 'read:user' },
        ],
      };

      mockReflector.getAllAndOverride.mockReturnValueOnce(false); // IS_PUBLIC_KEY
      mockReflector.getAllAndOverride.mockReturnValueOnce(requiredPermissions); // PERMISSIONS_KEY

      jest.spyOn(roleService, 'findByName').mockResolvedValue(mockRole as any);
      jest.spyOn(roleService, 'hasPermission').mockResolvedValue(true);

      const result = await permissionsGuard.canActivate(mockContext);

      expect(mockReflector.getAllAndOverride).toHaveBeenCalledWith(IS_PUBLIC_KEY, [
        mockContext.getHandler(),
        mockContext.getClass(),
      ]);
      expect(mockReflector.getAllAndOverride).toHaveBeenCalledWith(PERMISSIONS_KEY, [
        mockContext.getHandler(),
        mockContext.getClass(),
      ]);
      expect(roleService.findByName).toHaveBeenCalledWith(roleName);
      expect(roleService.hasPermission).toHaveBeenCalledWith(roleId, requiredPermissions[0]);
      expect(result).toBe(true);
    });
  });
});