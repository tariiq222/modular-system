import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Role } from '../entities/role.entity';
import { Permission } from '../entities/permission.entity';
import { CreateRoleDto } from '../dtos/create-role.dto';
import { UpdateRoleDto } from '../dtos/update-role.dto';
import { PermissionService } from './permission.service';

@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
    private readonly permissionService: PermissionService,
  ) {}

  /**
   * إنشاء دور جديد
   */
  async create(createRoleDto: CreateRoleDto): Promise<Role> {
    // التحقق من عدم وجود دور بنفس الاسم
    const existingRole = await this.roleRepository.findOne({
      where: { name: createRoleDto.name },
    });

    if (existingRole) {
      throw new ConflictException(`الدور ${createRoleDto.name} موجود بالفعل`);
    }

    // إنشاء الدور الجديد
    const role = this.roleRepository.create({
      name: createRoleDto.name,
      description: createRoleDto.description,
      isDefault: createRoleDto.isDefault || false,
      isSystem: false, // الأدوار المنشأة عبر واجهة البرمجة ليست أدوار نظام
    });

    // حفظ الدور
    const savedRole = await this.roleRepository.save(role);

    // إضافة الصلاحيات إذا تم توفيرها
    if (createRoleDto.permissionIds && createRoleDto.permissionIds.length > 0) {
      await this.assignPermissionsToRole(savedRole.id, createRoleDto.permissionIds);
      return this.findOne(savedRole.id);
    }

    return savedRole;
  }

  /**
   * الحصول على جميع الأدوار
   */
  async findAll(): Promise<Role[]> {
    return this.roleRepository.find({
      relations: ['permissions'],
      order: { name: 'ASC' },
    });
  }

  /**
   * الحصول على دور محدد بالمعرف
   */
  async findOne(id: string): Promise<Role> {
    const role = await this.roleRepository.findOne({
      where: { id },
      relations: ['permissions', 'policies'],
    });

    if (!role) {
      throw new NotFoundException(`الدور غير موجود`);
    }

    return role;
  }

  /**
   * الحصول على دور بواسطة الاسم
   */
  async findByName(name: string): Promise<Role> {
    const role = await this.roleRepository.findOne({
      where: { name },
      relations: ['permissions', 'policies'],
    });

    if (!role) {
      throw new NotFoundException(`الدور ${name} غير موجود`);
    }

    return role;
  }

  /**
   * تحديث دور
   */
  async update(id: string, updateRoleDto: UpdateRoleDto): Promise<Role> {
    const role = await this.findOne(id);

    // التحقق من أنه ليس دور نظام إذا كان يتم تغيير الاسم
    if (role.isSystem && updateRoleDto.name && updateRoleDto.name !== role.name) {
      throw new ConflictException('لا يمكن تغيير اسم دور النظام');
    }

    // تحديث خصائص الدور
    if (updateRoleDto.name) role.name = updateRoleDto.name;
    if (updateRoleDto.description !== undefined) role.description = updateRoleDto.description;
    if (updateRoleDto.isDefault !== undefined) role.isDefault = updateRoleDto.isDefault;

    // حفظ التغييرات
    await this.roleRepository.save(role);

    // تحديث الصلاحيات إذا تم توفيرها
    if (updateRoleDto.permissionIds) {
      await this.assignPermissionsToRole(id, updateRoleDto.permissionIds);
    }

    return this.findOne(id);
  }

  /**
   * حذف دور
   */
  async remove(id: string): Promise<boolean> {
    const role = await this.findOne(id);

    // التحقق من أنه ليس دور نظام
    if (role.isSystem) {
      throw new ConflictException('لا يمكن حذف دور النظام');
    }

    // حذف الدور وعلاقاته
    await this.roleRepository.remove(role);
    return true;
  }

  /**
   * تعيين صلاحيات لدور
   */
  async assignPermissionsToRole(roleId: string, permissionIds: string[]): Promise<Role> {
    const role = await this.findOne(roleId);
    const permissions = await this.permissionRepository.find({
      where: { id: In(permissionIds) },
    });

    role.permissions = permissions;
    return this.roleRepository.save(role);
  }

  /**
   * إزالة صلاحيات من دور
   */
  async removePermissionsFromRole(roleId: string, permissionIds: string[]): Promise<Role> {
    const role = await this.findOne(roleId);
    
    // فلترة الصلاحيات لإزالة المحددة
    role.permissions = role.permissions.filter(
      (permission) => !permissionIds.includes(permission.id)
    );

    return this.roleRepository.save(role);
  }

  /**
   * التحقق مما إذا كان الدور يملك صلاحية محددة
   */
  async hasPermission(roleId: string, permissionName: string): Promise<boolean> {
    const role = await this.findOne(roleId);
    return role.permissions.some(permission => permission.name === permissionName);
  }

  /**
   * إنشاء الأدوار الافتراضية للنظام
   */
  async createDefaultRoles(): Promise<Role[]> {
    // إنشاء الصلاحيات الافتراضية أولاً
    await this.permissionService.createDefaultPermissions();

    // تعريف الأدوار الافتراضية
    const defaultRoles = [
      {
        name: 'ADMIN',
        description: 'مدير النظام مع كامل الصلاحيات',
        isSystem: true,
        isDefault: false,
        permissions: ['manage:user', 'manage:role', 'manage:setting', 'read:report', 'export:report', 'read:log'],
      },
      {
        name: 'MODERATOR',
        description: 'مشرف مع صلاحيات إدارية محدودة',
        isSystem: true,
        isDefault: false,
        permissions: ['read:user', 'update:user', 'read:profile', 'update:profile', 'read:report'],
      },
      {
        name: 'USER',
        description: 'مستخدم عادي',
        isSystem: true,
        isDefault: true,
        permissions: ['read:profile', 'update:profile'],
      },
    ];

    const roles: Role[] = [];

    for (const roleData of defaultRoles) {
      // التحقق من وجود الدور
      let role: Role;
      try {
        role = await this.findByName(roleData.name);
      } catch (error) {
        // إنشاء دور جديد إذا لم يكن موجودًا
        role = this.roleRepository.create({
          name: roleData.name,
          description: roleData.description,
          isSystem: roleData.isSystem,
          isDefault: roleData.isDefault,
        });
        role = await this.roleRepository.save(role);
      }

      // إضافة الصلاحيات
      const permissionNames = roleData.permissions;
      const permissions: Permission[] = [];

      for (const permName of permissionNames) {
        try {
          const permission = await this.permissionService.findByName(permName);
          permissions.push(permission);
        } catch (error) {
          console.warn(`Skipping permission ${permName} as it doesn't exist`);
        }
      }

      role.permissions = permissions;
      await this.roleRepository.save(role);
      roles.push(role);
    }

    return roles;
  }
}