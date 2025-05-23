import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { PermissionService } from '../services/permission.service';
import { IS_PUBLIC_KEY } from '../../../shared/decorators/public.decorator';
import { RoleService } from '../services/role.service';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly permissionService: PermissionService,
    private readonly roleService: RoleService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // u0627u0644u062au062du0642u0642 u0645u0646 u0645u0633u0627u0631u0627u062a u0639u0627u0645u0629
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    // u0627u0644u062du0635u0648u0644 u0639u0644u0649 u0627u0644u0635u0644u0627u062du064au0627u062a u0627u0644u0645u0637u0644u0648u0628u0629 u0645u0646 u0627u0644u0632u062eu0631u0641u0629
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // u0625u0630u0627 u0644u0645 u064au062au0645 u062au062du062fu064au062f u0635u0644u0627u062du064au0627u062au060c u0646u0633u0645u062d u0628u0627u0644u0648u0635u0648u0644
    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // u062fu0648u0646 u0645u0633u062au062eu062fu0645 u0645u0633u062cu0644 u0627u0644u062fu062eu0648u0644
    if (!user) {
      throw new ForbiddenException('u063au064au0631 u0645u0635u0631u062d u0644u0643 u0628u0627u0644u0648u0635u0648u0644');
    }

    // u0627u0644u062au062du0642u0642 u0645u0646 u0648u062cu0648u062f u0645u0639u0644u0648u0645u0627u062a u0627u0644u062fu0648u0631
    if (!user.role) {
      throw new ForbiddenException('u0644u0645 u064au062au0645 u062au062du062fu064au062f u062fu0648u0631 u0627u0644u0645u0633u062au062eu062fu0645');
    }

    try {
      const role = await this.roleService.findByName(user.role);

      // u0627u0644u062au062du0642u0642 u0645u0646 u0627u0644u0635u0644u0627u062du064au0627u062a
      for (const permissionName of requiredPermissions) {
        const hasPermission = await this.roleService.hasPermission(role.id, permissionName);
        if (hasPermission) {
          return true;
        }
      }

      // u0625u0630u0627 u0644u0645 u064au0643u0646 u0644u062fu0649 u0627u0644u0645u0633u062au062eu062fu0645 u0623u064a u0645u0646 u0627u0644u0635u0644u0627u062du064au0627u062a u0627u0644u0645u0637u0644u0648u0628u0629
      throw new ForbiddenException('u0644u064au0633 u0644u062fu064au0643 u0627u0644u0635u0644u0627u062du064au0627u062a u0627u0644u0645u0637u0644u0648u0628u0629');
    } catch (error) {
      throw new ForbiddenException('u062eu0637u0623 u0641u064a u0627u0644u062au062du0642u0642 u0645u0646 u0627u0644u0635u0644u0627u062du064au0627u062a');
    }
  }
}