import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Permission, ActionType, ResourceType } from '../entities/permission.entity';
import { CreatePermissionDto } from '../dtos/create-permission.dto';
import { UpdatePermissionDto } from '../dtos/update-permission.dto';

@Injectable()
export class PermissionService {
  constructor(
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
  ) {}

  /**
   * u0625u0646u0634u0627u0621 u0635u0644u0627u062du064au0629 u062cu062fu064au062fu0629
   */
  async create(createPermissionDto: CreatePermissionDto): Promise<Permission> {
    // u0625u0646u0634u0627u0621 u0627u0633u0645 u0645u0648u062du062f u0644u0644u0635u0644u0627u062du064au0629 u0625u0630u0627 u0644u0645 u064au062au0645 u062au0648u0641u064au0631u0647
    if (!createPermissionDto.name) {
      createPermissionDto.name = Permission.createPermissionName(
        createPermissionDto.action,
        createPermissionDto.resource,
      );
    }

    // u0627u0644u062au062du0642u0642 u0645u0646 u0639u062fu0645 u0648u062cu0648u062f u0635u0644u0627u062du064au0629 u0628u0646u0641u0633 u0627u0644u0627u0633u0645
    const existingPermission = await this.permissionRepository.findOne({
      where: { name: createPermissionDto.name },
    });

    if (existingPermission) {
      return existingPermission;
    }

    const permission = this.permissionRepository.create(createPermissionDto);
    return this.permissionRepository.save(permission);
  }

  /**
   * u0627u0644u062du0635u0648u0644 u0639u0644u0649 u062cu0645u064au0639 u0627u0644u0635u0644u0627u062du064au0627u062a
   */
  async findAll(): Promise<Permission[]> {
    return this.permissionRepository.find({ relations: ['roles'] });
  }

  /**
   * u0627u0644u062du0635u0648u0644 u0639u0644u0649 u0635u0644u0627u062du064au0629 u0645u062du062fu062fu0629 u0628u0627u0644u0645u0639u0631u0641
   */
  async findOne(id: string): Promise<Permission> {
    const permission = await this.permissionRepository.findOne({
      where: { id },
      relations: ['roles'],
    });

    if (!permission) {
      throw new NotFoundException('u0627u0644u0635u0644u0627u062du064au0629 u063au064au0631 u0645u0648u062cu0648u062fu0629');
    }

    return permission;
  }

  /**
   * u0627u0644u062du0635u0648u0644 u0639u0644u0649 u0635u0644u0627u062du064au0629 u0628u0648u0627u0633u0637u0629 u0627u0644u0627u0633u0645
   */
  async findByName(name: string): Promise<Permission> {
    const permission = await this.permissionRepository.findOne({
      where: { name },
      relations: ['roles'],
    });

    if (!permission) {
      throw new NotFoundException(`u0627u0644u0635u0644u0627u062du064au0629 ${name} u063au064au0631 u0645u0648u062cu0648u062fu0629`);
    }

    return permission;
  }

  /**
   * u0627u0644u062du0635u0648u0644 u0639u0644u0649 u0635u0644u0627u062du064au0629 u0628u0648u0627u0633u0637u0629 u0627u0644u0625u062cu0631u0627u0621 u0648u0627u0644u0645u0648u0631u062f
   */
  async findByActionAndResource(action: ActionType, resource: ResourceType): Promise<Permission> {
    const name = Permission.createPermissionName(action, resource);
    return this.findByName(name);
  }

  /**
   * u0627u0644u062du0635u0648u0644 u0639u0644u0649 u0627u0644u0635u0644u0627u062du064au0627u062a u062du0633u0628 u0627u0644u0645u0648u0631u062f
   */
  async findByResource(resource: ResourceType): Promise<Permission[]> {
    return this.permissionRepository.find({
      where: { resource },
      relations: ['roles'],
    });
  }

  /**
   * u062au062du062fu064au062b u0635u0644u0627u062du064au0629
   */
  async update(id: string, updatePermissionDto: UpdatePermissionDto): Promise<Permission> {
    const permission = await this.findOne(id);
    Object.assign(permission, updatePermissionDto);
    return this.permissionRepository.save(permission);
  }

  /**
   * u062du0630u0641 u0635u0644u0627u062du064au0629
   */
  async remove(id: string): Promise<boolean> {
    const permission = await this.findOne(id);
    const result = await this.permissionRepository.remove(permission);
    return !!result;
  }

  /**
   * u0625u0646u0634u0627u0621 u0645u062cu0645u0648u0639u0629 u0645u0646 u0627u0644u0635u0644u0627u062du064au0627u062a u0627u0644u0623u0633u0627u0633u064au0629
   */
  async createDefaultPermissions(): Promise<Permission[]> {
    const defaultPermissions: CreatePermissionDto[] = [
      // u0635u0644u0627u062du064au0627u062a u0627u0644u0645u0633u062au062eu062fu0645u064au0646
      { action: ActionType.CREATE, resource: ResourceType.USER, description: 'u0625u0646u0634u0627u0621 u0645u0633u062au062eu062fu0645u064au0646 u062cu062fu062f' },
      { action: ActionType.READ, resource: ResourceType.USER, description: 'u0639u0631u0636 u0628u064au0627u0646u0627u062a u0627u0644u0645u0633u062au062eu062fu0645u064au0646' },
      { action: ActionType.UPDATE, resource: ResourceType.USER, description: 'u062au062du062fu064au062b u0628u064au0627u0646u0627u062a u0627u0644u0645u0633u062au062eu062fu0645u064au0646' },
      { action: ActionType.DELETE, resource: ResourceType.USER, description: 'u062du0630u0641 u0627u0644u0645u0633u062au062eu062fu0645u064au0646' },
      { action: ActionType.MANAGE, resource: ResourceType.USER, description: 'u0625u062fu0627u0631u0629 u0643u0627u0645u0644u0629 u0644u0644u0645u0633u062au062eu062fu0645u064au0646' },
      
      // u0635u0644u0627u062du064au0627u062a u0627u0644u0645u0644u0641u0627u062a u0627u0644u0634u062eu0635u064au0629
      { action: ActionType.READ, resource: ResourceType.PROFILE, description: 'u0639u0631u0636 u0627u0644u0645u0644u0641u0627u062a u0627u0644u0634u062eu0635u064au0629' },
      { action: ActionType.UPDATE, resource: ResourceType.PROFILE, description: 'u062au062du062fu064au062b u0627u0644u0645u0644u0641u0627u062a u0627u0644u0634u062eu0635u064au0629' },
      
      // u0635u0644u0627u062du064au0627u062a u0627u0644u0623u062fu0648u0627u0631
      { action: ActionType.CREATE, resource: ResourceType.ROLE, description: 'u0625u0646u0634u0627u0621 u0623u062fu0648u0627u0631 u062cu062fu064au062fu0629' },
      { action: ActionType.READ, resource: ResourceType.ROLE, description: 'u0639u0631u0636 u0627u0644u0623u062fu0648u0627u0631' },
      { action: ActionType.UPDATE, resource: ResourceType.ROLE, description: 'u062au062du062fu064au062b u0627u0644u0623u062fu0648u0627u0631' },
      { action: ActionType.DELETE, resource: ResourceType.ROLE, description: 'u062du0630u0641 u0627u0644u0623u062fu0648u0627u0631' },
      { action: ActionType.MANAGE, resource: ResourceType.ROLE, description: 'u0625u062fu0627u0631u0629 u0643u0627u0645u0644u0629 u0644u0644u0623u062fu0648u0627u0631' },
      
      // u0635u0644u0627u062du064au0627u062a u0627u0644u0625u0639u062fu0627u062fu0627u062a
      { action: ActionType.READ, resource: ResourceType.SETTING, description: 'u0639u0631u0636 u0627u0644u0625u0639u062fu0627u062fu0627u062a' },
      { action: ActionType.UPDATE, resource: ResourceType.SETTING, description: 'u062au062du062fu064au062b u0627u0644u0625u0639u062fu0627u062fu0627u062a' },
      { action: ActionType.MANAGE, resource: ResourceType.SETTING, description: 'u0625u062fu0627u0631u0629 u0643u0627u0645u0644u0629 u0644u0644u0625u0639u062fu0627u062fu0627u062a' },

      // u0635u0644u0627u062du064au0627u062a u0627u0644u062au0642u0627u0631u064au0631 u0648u0627u0644u0633u062cu0644u0627u062a
      { action: ActionType.READ, resource: ResourceType.REPORT, description: 'u0639u0631u0636 u0627u0644u062au0642u0627u0631u064au0631' },
      { action: ActionType.EXPORT, resource: ResourceType.REPORT, description: 'u062au0635u062fu064au0631 u0627u0644u062au0642u0627u0631u064au0631' },
      { action: ActionType.READ, resource: ResourceType.LOG, description: 'u0639u0631u0636 u0633u062cu0644u0627u062a u0627u0644u0646u0638u0627u0645' },
    ];

    const permissions: Permission[] = [];
    for (const permDto of defaultPermissions) {
      const permission = await this.create(permDto);
      permissions.push(permission);
    }

    return permissions;
  }
}