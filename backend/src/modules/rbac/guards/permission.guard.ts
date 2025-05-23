import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { PermissionAction, PermissionResource, Permission } from '../entities/permission.entity';

interface UserWithRole {
  role?: {
    permissions?: Permission[];
  };
}

export interface PermissionDecoratorOptions {
  action: PermissionAction;
  resource: PermissionResource;
  requireAll?: boolean;
}

export const PERMISSION_KEY = 'permissions';

export function RequirePermissions(options: PermissionDecoratorOptions) {
  return (target: any, key?: string, descriptor?: TypedPropertyDescriptor<any>) => {
    if (descriptor) {
      Reflect.defineMetadata(PERMISSION_KEY, options, descriptor.value);
      return descriptor;
    }
    Reflect.defineMetadata(PERMISSION_KEY, options, target);
    return target;
  };
}

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const user = request.user as UserWithRole;

    // Allow public routes
    const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    if (!user) {
      throw new ForbiddenException('يجب تسجيل الدخول أولاً');
    }

    // Get permissions from the handler or class
    const permissionOptions = this.reflector.getAllAndOverride<PermissionDecoratorOptions>(
      PERMISSION_KEY,
      [context.getHandler(), context.getClass()],
    );

    // If no permissions are required, allow access
    if (!permissionOptions) {
      return true;
    }

    // Check if user has the required permissions
    const hasPermission = this.checkPermissions(user, permissionOptions);

    if (!hasPermission) {
      throw new ForbiddenException('ليس لديك الصلاحيات الكافية للوصول إلى هذا المورد');
    }

    return true;
  }

  private checkPermissions(
    user: UserWithRole,
    options: PermissionDecoratorOptions | PermissionDecoratorOptions[],
  ): boolean {
    const permissions = Array.isArray(options) ? options : [options];
    const userPermissions = this.getUserPermissions(user);

    // If any permission in the array is sufficient (OR condition)
    if (!permissions.every(p => p.requireAll)) {
      return permissions.some(permission => 
        this.hasPermission(userPermissions, permission)
      );
    }

    // If all permissions are required (AND condition)
    return permissions.every(permission => 
      this.hasPermission(userPermissions, permission)
    );
  }

  private hasPermission(
    userPermissions: { action: string; resource: string }[],
    permission: { action: string; resource: string },
  ): boolean {
    return userPermissions.some(
      (userPermission) =>
        (userPermission.action === permission.action || userPermission.action === PermissionAction.MANAGE) &&
        userPermission.resource === permission.resource,
    );
  }

  private getUserPermissions(user: UserWithRole): { action: string; resource: string }[] {
    if (!user.role || !user.role.permissions) {
      return [];
    }

    return user.role.permissions.map((p: Permission) => ({
      action: p.action,
      resource: p.resource,
    }));
  }
}
