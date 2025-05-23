import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards } from '@nestjs/common';
import { PermissionService } from '../services/permission.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '../../users/entities/user.entity';
import { CreatePermissionDto } from '../dtos/create-permission.dto';
import { UpdatePermissionDto } from '../dtos/update-permission.dto';
import { RequireAction } from '../decorators/permissions.decorator';
import { ActionType, ResourceType } from '../entities/permission.entity';

@Controller('permissions')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN) // u0641u0642u0637 u0627u0644u0645u0633u0624u0648u0644 u064au0645u0643u0646u0647 u0625u062fu0627u0631u0629 u0627u0644u0635u0644u0627u062du064au0627u062a
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  @Post()
  @RequireAction(ActionType.MANAGE, ResourceType.PERMISSION)
  create(@Body() createPermissionDto: CreatePermissionDto) {
    return this.permissionService.create(createPermissionDto);
  }

  @Get()
  @RequireAction(ActionType.READ, ResourceType.PERMISSION)
  findAll() {
    return this.permissionService.findAll();
  }

  @Get(':id')
  @RequireAction(ActionType.READ, ResourceType.PERMISSION)
  findOne(@Param('id') id: string) {
    return this.permissionService.findOne(id);
  }

  @Put(':id')
  @RequireAction(ActionType.UPDATE, ResourceType.PERMISSION)
  update(@Param('id') id: string, @Body() updatePermissionDto: UpdatePermissionDto) {
    return this.permissionService.update(id, updatePermissionDto);
  }

  @Delete(':id')
  @RequireAction(ActionType.DELETE, ResourceType.PERMISSION)
  remove(@Param('id') id: string) {
    return this.permissionService.remove(id);
  }

  @Post('init')
  @RequireAction(ActionType.MANAGE, ResourceType.PERMISSION)
  initializeDefaultPermissions() {
    return this.permissionService.createDefaultPermissions();
  }
}