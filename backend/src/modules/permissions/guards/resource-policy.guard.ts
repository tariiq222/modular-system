import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RoleService } from '../services/role.service';
import { PolicyService } from '../services/policy.service';
import { ResourceType } from '../entities/permission.entity';
import { IS_PUBLIC_KEY } from '../../../shared/decorators/public.decorator';

@Injectable()
export class ResourcePolicyGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly roleService: RoleService,
    private readonly policyService: PolicyService,
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

    // u0627u0644u062du0635u0648u0644 u0639u0644u0649 u0645u0639u0644u0648u0645u0627u062a u0627u0644u0645u0648u0631u062f u0645u0646 u0627u0644u0632u062eu0631u0641u0629
    const resourceType = this.reflector.getAllAndOverride<ResourceType>('resource_type', [
      context.getHandler(),
      context.getClass(),
    ]);

    // u0625u0630u0627 u0644u0645 u064au062au0645 u062au062du062fu064au062f u0646u0648u0639 u0627u0644u0645u0648u0631u062fu060c u0644u0627 u064au0645u0643u0646 u062au0637u0628u064au0642 u0633u064au0627u0633u0629 u0627u0644u0645u0648u0627u0631u062f
    if (!resourceType) {
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
      // u0627u0644u062du0635u0648u0644 u0639u0644u0649 u062fu0648u0631 u0627u0644u0645u0633u062au062eu062fu0645
      const role = await this.roleService.findByName(user.role);
      
      // u0627u0644u062du0635u0648u0644 u0639u0644u0649 u0645u0639u0631u0641 u0627u0644u0645u0648u0631u062f
      const resourceId = request.params?.id || request.body?.id;
      
      // u0627u0644u062du0635u0648u0644 u0639u0644u0649 u0627u0644u0633u0645u0627u062a u0630u0627u062a u0627u0644u0635u0644u0629
      const attributes = this.extractAttributes(request, resourceType);
      
      // u0627u0644u062au062du0642u0642 u0645u0646 u0627u0644u0633u064au0627u0633u0629
      const hasAccess = await this.policyService.checkAccess(
        [role.id],
        resourceType,
        resourceId,
        attributes,
      );
      
      if (!hasAccess) {
        throw new ForbiddenException('u0644u064au0633 u0644u062fu064au0643 u0627u0644u0635u0644u0627u062du064au0627u062a u0644u0644u0648u0635u0648u0644 u0625u0644u0649 u0647u0630u0627 u0627u0644u0645u0648u0631u062f');
      }
      
      return true;
    } catch (error) {
      if (error instanceof ForbiddenException) {
        throw error;
      }
      throw new ForbiddenException('u062eu0637u0623 u0641u064a u0627u0644u062au062du0642u0642 u0645u0646 u0633u064au0627u0633u0629 u0627u0644u0648u0635u0648u0644');
    }
  }
  
  /**
   * u0627u0633u062au062eu0631u0627u062c u0627u0644u0633u0645u0627u062a u0630u0627u062a u0627u0644u0635u0644u0629 u0628u0646u0627u0621u064b u0639u0644u0649 u0646u0648u0639 u0627u0644u0645u0648u0631u062f
   */
  private extractAttributes(request: any, resourceType: ResourceType): Record<string, any> {
    const attributes: Record<string, any> = {};
    
    switch (resourceType) {
      case ResourceType.USER:
        // u0627u0633u062au062eu0631u0627u062c u0633u0645u0627u062a u0627u0644u0645u0633u062au062eu062fu0645u060c u0645u062bu0644 u0627u0644u0642u0633u0645
        if (request.body?.departmentId) {
          attributes['departmentId'] = request.body.departmentId;
        }
        break;
        
      case ResourceType.PROFILE:
        // u0627u0633u062au062eu0631u0627u062c u0633u0645u0627u062a u0627u0644u0645u0644u0641 u0627u0644u0634u062eu0635u064a
        if (request.user?.userId) {
          attributes['userId'] = request.user.userId;
        }
        break;
        
      // u064au0645u0643u0646 u0625u0636u0627u0641u0629 u0627u0644u0645u0632u064au062f u0645u0646 u0627u0644u062du0627u0644u0627u062a u062du0633u0628 u0627u0644u0636u0631u0648u0631u0629
    }
    
    return attributes;
  }
}