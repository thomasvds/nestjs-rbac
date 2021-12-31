import { Inject, Injectable } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request as ExpressRequest } from 'express';

import { PermissionAction, PermissionResourceTarget, PermissionResource } from '../enums';
import { generatePermission, grantedMatchRequired } from '../permissions.helpers';

export const PERMISSIONS = Symbol('PERMISSIONS');

@Injectable()
export class Permissions {
  constructor(@Inject(REQUEST) private readonly request: ExpressRequest) {}

  /**
   * In-controller helper for permissions checks after the initial
   * decorator-based permission has been evaluated
   * @param requiredPermission the permission to evaluate against
   * @returns true if the current user has the required permission
   */
  canActivate(
    resourceType: PermissionResource,
    action: PermissionAction,
    target: PermissionResourceTarget | string,
  ): boolean {
    const requiredPermission = generatePermission(resourceType, action, target);
    return grantedMatchRequired(this.context.grantedPermissions, requiredPermission);
  }

  get allowedResourcesIds(): string[] {
    return this.context.allowedResourcesIds;
  }

  get deniedResourcesIds(): string[] {
    return this.context.deniedResourcesIds;
  }

  private get context(): ExpressRequest['permissionsContext'] {
    return this.request.permissionsContext;
  }
}
