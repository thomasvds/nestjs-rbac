import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request as ExpressRequest } from 'express';

import { GetResourceIdFn, REQUIRED_PERMISSION, RequiredPermission } from '../decorators/permissions.decorator';
import { PermissionEffect, PermissionResourceTarget, PermissionRole } from '../enums';
import { getPermittedResourcesIds, grantedMatchRequired } from '../permissions.helpers';
import { PermissionsService } from '../permissions.service';
import { Permission } from '../types/permission.type';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private readonly permissionsService: PermissionsService, private readonly reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest() as ExpressRequest;

    const requiredPermission = this.getRequiredPermission(context);

    const { role, permissions: grantedPermissions } = await this.permissionsService.getMany(request.user.id);

    if (!grantedPermissions.length) {
      return false;
    }

    const permitted = grantedMatchRequired(grantedPermissions, requiredPermission);

    if (!permitted) {
      return false;
    }

    let allowedResourcesIds: string[] = null;
    let deniedResourcesIds: string[] = null;

    if (requiredPermission.resourceTarget === PermissionResourceTarget.SOME) {
      if ([PermissionRole.GUEST, PermissionRole.CONTRIBUTOR].includes(role)) {
        allowedResourcesIds = getPermittedResourcesIds(grantedPermissions, requiredPermission, PermissionEffect.ALLOW);
      } else if (PermissionRole.ADMIN === role) {
        deniedResourcesIds = getPermittedResourcesIds(grantedPermissions, requiredPermission, PermissionEffect.DENY);
      }
    }

    request.permissionsContext = { allowedResourcesIds, deniedResourcesIds, grantedPermissions };

    return true;
  }

  /**
   * Computes permission required to access controller action, based on
   * controller permissions decorator. If resource target is dynamic (based on
   * incoming request), evaluate it.
   * @param context request context
   * @returns computed required permission
   */
  private getRequiredPermission(context: ExecutionContext): Permission {
    const permission = this.reflector.get<RequiredPermission>(REQUIRED_PERMISSION, context.getHandler());

    const request = context.switchToHttp().getRequest() as ExpressRequest;

    if (!permission) {
      throw new Error(`missing permissions definition for ${request.method} ${request.url}`);
    }

    if (permission.resourceTarget instanceof Function) {
      return {
        ...permission,
        resourceTarget: (permission.resourceTarget as GetResourceIdFn)(request),
      };
    }

    return permission as Permission;
  }
}
