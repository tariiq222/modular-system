import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Permission } from './entities/permission.entity';
import { Role } from './entities/role.entity';
import { ResourcePolicy } from './entities/resource-policy.entity';
import { PermissionService } from './services/permission.service';
import { RoleService } from './services/role.service';
import { PolicyService } from './services/policy.service';
import { PermissionController } from './controllers/permission.controller';
import { RoleController } from './controllers/role.controller';
import { APP_GUARD } from '@nestjs/core';
import { PermissionsGuard } from './guards/permissions.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([Permission, Role, ResourcePolicy]),
  ],
  controllers: [PermissionController, RoleController],
  providers: [
    PermissionService,
    RoleService,
    PolicyService,
    // جعل Guard عمومي في كل التطبيق
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    {
      provide: APP_GUARD,
      useClass: PermissionsGuard,
    },
  ],
  exports: [PermissionService, RoleService, PolicyService],
})
export class PermissionsModule {}