import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards } from '@nestjs/common';
import { RoleService } from '../services/role.service';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '../../users/entities/user.entity';
import { CreateRoleDto } from '../dtos/create-role.dto';
import { UpdateRoleDto } from '../dtos/update-role.dto';
import { RequireAction } from '../decorators/permissions.decorator';
import { ActionType, ResourceType } from '../entities/permission.entity';
import { Role } from '../entities/role.entity';

@ApiTags('permissions')
@ApiBearerAuth('access-token')
@Controller('roles')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @ApiOperation({ summary: 'u0625u0646u0634u0627u0621 u062fu0648u0631 u062cu062fu064au062f (u0645u062au0627u062d u0644u0644u0645u062fu064au0631 u0641u0642u0637)' })
  @ApiResponse({ status: 201, description: 'u062au0645 u0625u0646u0634u0627u0621 u0627u0644u062fu0648u0631 u0628u0646u062cu0627u062d', type: Role })
  @ApiResponse({ status: 400, description: 'u0628u064au0627u0646u0627u062a u063au064au0631 u0635u0627u0644u062du0629' })
  @ApiResponse({ status: 401, description: 'u063au064au0631 u0645u0635u0631u062d u0644u0643 u0628u0627u0644u0648u0635u0648u0644' })
  @ApiResponse({ status: 403, description: 'u0644u0627 u062au0645u0644u0643 u0627u0644u0635u0644u0627u062du064au0627u062a u0627u0644u0643u0627u0641u064au0629' })
  @ApiBody({ type: CreateRoleDto })
  @Post()
  @Roles(UserRole.ADMIN)
  @RequireAction(ActionType.CREATE, ResourceType.ROLE)
  create(@Body() createRoleDto: CreateRoleDto) {
    return this.roleService.create(createRoleDto);
  }

  @ApiOperation({ summary: 'u0627u0644u062du0635u0648u0644 u0639u0644u0649 u0642u0627u0626u0645u0629 u0627u0644u0623u062fu0648u0627u0631' })
  @ApiResponse({ status: 200, description: 'u062au0645 u0627u0644u062du0635u0648u0644 u0639u0644u0649 u0642u0627u0626u0645u0629 u0627u0644u0623u062fu0648u0627u0631 u0628u0646u062cu0627u062d', type: [Role] })
  @ApiResponse({ status: 401, description: 'u063au064au0631 u0645u0635u0631u062d u0644u0643 u0628u0627u0644u0648u0635u0648u0644' })
  @ApiResponse({ status: 403, description: 'u0644u0627 u062au0645u0644u0643 u0627u0644u0635u0644u0627u062du064au0627u062a u0627u0644u0643u0627u0641u064au0629' })
  @Get()
  @RequireAction(ActionType.READ, ResourceType.ROLE)
  findAll() {
    return this.roleService.findAll();
  }

  @ApiOperation({ summary: 'u0627u0644u062du0635u0648u0644 u0639u0644u0649 u062fu0648u0631 u0645u062du062fu062f' })
  @ApiResponse({ status: 200, description: 'u062au0645 u0627u0644u062du0635u0648u0644 u0639u0644u0649 u0627u0644u062fu0648u0631 u0628u0646u062cu0627u062d', type: Role })
  @ApiResponse({ status: 401, description: 'u063au064au0631 u0645u0635u0631u062d u0644u0643 u0628u0627u0644u0648u0635u0648u0644' })
  @ApiResponse({ status: 403, description: 'u0644u0627 u062au0645u0644u0643 u0627u0644u0635u0644u0627u062du064au0627u062a u0627u0644u0643u0627u0641u064au0629' })
  @ApiResponse({ status: 404, description: 'u0627u0644u062fu0648u0631 u063au064au0631 u0645u0648u062cu0648u062f' })
  @ApiParam({ name: 'id', description: 'u0645u0639u0631u0641 u0627u0644u062fu0648u0631' })
  @Get(':id')
  @RequireAction(ActionType.READ, ResourceType.ROLE)
  findOne(@Param('id') id: string) {
    return this.roleService.findOne(id);
  }

  @ApiOperation({ summary: 'u062au062du062fu064au062b u062fu0648u0631 u0645u0648u062cu0648u062f (u0645u062au0627u062d u0644u0644u0645u062fu064au0631 u0641u0642u0637)' })
  @ApiResponse({ status: 200, description: 'u062au0645 u062au062du062fu064au062b u0627u0644u062fu0648u0631 u0628u0646u062cu0627u062d', type: Role })
  @ApiResponse({ status: 400, description: 'u0628u064au0627u0646u0627u062a u063au064au0631 u0635u0627u0644u062du0629' })
  @ApiResponse({ status: 401, description: 'u063au064au0631 u0645u0635u0631u062d u0644u0643 u0628u0627u0644u0648u0635u0648u0644' })
  @ApiResponse({ status: 403, description: 'u0644u0627 u062au0645u0644u0643 u0627u0644u0635u0644u0627u062du064au0627u062a u0627u0644u0643u0627u0641u064au0629' })
  @ApiResponse({ status: 404, description: 'u0627u0644u062fu0648u0631 u063au064au0631 u0645u0648u062cu0648u062f' })
  @ApiParam({ name: 'id', description: 'u0645u0639u0631u0641 u0627u0644u062fu0648u0631' })
  @ApiBody({ type: UpdateRoleDto })
  @Put(':id')
  @Roles(UserRole.ADMIN)
  @RequireAction(ActionType.UPDATE, ResourceType.ROLE)
  update(@Param('id') id: string, @Body() updateRoleDto: UpdateRoleDto) {
    return this.roleService.update(id, updateRoleDto);
  }

  @ApiOperation({ summary: 'u062du0630u0641 u062fu0648u0631 (u0645u062au0627u062d u0644u0644u0645u062fu064au0631 u0641u0642u0637)' })
  @ApiResponse({ status: 200, description: 'u062au0645 u062du0630u0641 u0627u0644u062fu0648u0631 u0628u0646u062cu0627u062d' })
  @ApiResponse({ status: 401, description: 'u063au064au0631 u0645u0635u0631u062d u0644u0643 u0628u0627u0644u0648u0635u0648u0644' })
  @ApiResponse({ status: 403, description: 'u0644u0627 u062au0645u0644u0643 u0627u0644u0635u0644u0627u062du064au0627u062a u0627u0644u0643u0627u0641u064au0629' })
  @ApiResponse({ status: 404, description: 'u0627u0644u062fu0648u0631 u063au064au0631 u0645u0648u062cu0648u062f' })
  @ApiParam({ name: 'id', description: 'u0645u0639u0631u0641 u0627u0644u062fu0648u0631' })
  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @RequireAction(ActionType.DELETE, ResourceType.ROLE)
  remove(@Param('id') id: string) {
    return this.roleService.remove(id);
  }

  @ApiOperation({ summary: 'u062au0639u064au064au0646 u0635u0644u0627u062du064au0627u062a u0644u062fu0648u0631 (u0645u062au0627u062d u0644u0644u0645u062fu064au0631 u0641u0642u0637)' })
  @ApiResponse({ status: 200, description: 'u062au0645 u062au0639u064au064au0646 u0627u0644u0635u0644u0627u062du064au0627u062a u0644u0644u062fu0648u0631 u0628u0646u062cu0627u062d', type: Role })
  @ApiResponse({ status: 401, description: 'u063au064au0631 u0645u0635u0631u062d u0644u0643 u0628u0627u0644u0648u0635u0648u0644' })
  @ApiResponse({ status: 403, description: 'u0644u0627 u062au0645u0644u0643 u0627u0644u0635u0644u0627u062du064au0627u062a u0627u0644u0643u0627u0641u064au0629' })
  @ApiResponse({ status: 404, description: 'u0627u0644u062fu0648u0631 u063au064au0631 u0645u0648u062cu0648u062f' })
  @ApiParam({ name: 'roleId', description: 'u0645u0639u0631u0641 u0627u0644u062fu0648u0631' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        permissionIds: {
          type: 'array',
          items: { type: 'string' },
          description: 'u0642u0627u0626u0645u0629 u0645u0639u0631u0641u0627u062a u0627u0644u0635u0644u0627u062du064au0627u062a',
        },
      },
    },
  })
  @Post(':roleId/permissions')
  @Roles(UserRole.ADMIN)
  @RequireAction(ActionType.UPDATE, ResourceType.ROLE)
  assignPermissions(
    @Param('roleId') roleId: string,
    @Body('permissionIds') permissionIds: string[],
  ) {
    return this.roleService.assignPermissionsToRole(roleId, permissionIds);
  }

  @ApiOperation({ summary: 'u0625u0632u0627u0644u0629 u0635u0644u0627u062du064au0627u062a u0645u0646 u062fu0648u0631 (u0645u062au0627u062d u0644u0644u0645u062fu064au0631 u0641u0642u0637)' })
  @ApiResponse({ status: 200, description: 'u062au0645 u0625u0632u0627u0644u0629 u0627u0644u0635u0644u0627u062du064au0627u062a u0645u0646 u0627u0644u062fu0648u0631 u0628u0646u062cu0627u062d', type: Role })
  @ApiResponse({ status: 401, description: 'u063au064au0631 u0645u0635u0631u062d u0644u0643 u0628u0627u0644u0648u0635u0648u0644' })
  @ApiResponse({ status: 403, description: 'u0644u0627 u062au0645u0644u0643 u0627u0644u0635u0644u0627u062du064au0627u062a u0627u0644u0643u0627u0641u064au0629' })
  @ApiResponse({ status: 404, description: 'u0627u0644u062fu0648u0631 u063au064au0631 u0645u0648u062cu0648u062f' })
  @ApiParam({ name: 'roleId', description: 'u0645u0639u0631u0641 u0627u0644u062fu0648u0631' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        permissionIds: {
          type: 'array',
          items: { type: 'string' },
          description: 'u0642u0627u0626u0645u0629 u0645u0639u0631u0641u0627u062a u0627u0644u0635u0644u0627u062du064au0627u062a u0627u0644u0645u0631u0627u062f u0625u0632u0627u0644u062au0647u0627',
        },
      },
    },
  })
  @Delete(':roleId/permissions')
  @Roles(UserRole.ADMIN)
  @RequireAction(ActionType.UPDATE, ResourceType.ROLE)
  removePermissions(
    @Param('roleId') roleId: string,
    @Body('permissionIds') permissionIds: string[],
  ) {
    return this.roleService.removePermissionsFromRole(roleId, permissionIds);
  }

  @ApiOperation({ summary: 'u062au0647u064au0626u0629 u0627u0644u0623u062fu0648u0627u0631 u0627u0644u0627u0641u062au0631u0627u0636u064au0629 (u0645u062au0627u062d u0644u0644u0645u062fu064au0631 u0641u0642u0637)' })
  @ApiResponse({ status: 201, description: 'u062au0645 u062au0647u064au0626u0629 u0627u0644u0623u062fu0648u0627u0631 u0627u0644u0627u0641u062au0631u0627u0636u064au0629 u0628u0646u062cu0627u062d', type: [Role] })
  @ApiResponse({ status: 401, description: 'u063au064au0631 u0645u0635u0631u062d u0644u0643 u0628u0627u0644u0648u0635u0648u0644' })
  @ApiResponse({ status: 403, description: 'u0644u0627 u062au0645u0644u0643 u0627u0644u0635u0644u0627u062du064au0627u062a u0627u0644u0643u0627u0641u064au0629' })
  @Post('init')
  @Roles(UserRole.ADMIN)
  @RequireAction(ActionType.MANAGE, ResourceType.ROLE)
  initializeDefaultRoles() {
    return this.roleService.createDefaultRoles();
  }
}