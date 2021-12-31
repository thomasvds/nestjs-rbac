import { SetMetadata } from '@nestjs/common';
import { CustomDecorator } from '@nestjs/common/decorators/core/set-metadata.decorator';
import { Request as ExpressRequest } from 'express';

import { PermissionAction, PermissionResource, PermissionResourceTarget, PermissionEffect } from '../enums';

// Re-export imported enums, so that controllers that use the decorator can
// easily import all the required permission elements from one single import.
export { PermissionResource, PermissionAction, PermissionResourceTarget };

// eslint-disable-next-line @typescript-eslint/type-annotation-spacing
export type GetResourceIdFn = (req: ExpressRequest) => string;

/**
 * Extract resource id from request route parameter :id
 * @param req incoming request
 * @returns resource id
 */
export function GetResourceIdFromParams(req: ExpressRequest): string {
  const { id } = req.params;

  if (!id) {
    throw new Error('missing resource id in params');
  }

  return id;
}

export const REQUIRED_PERMISSION = Symbol('REQUIRED_PERMISSION');

/**
 * The definition to generate a required permission, including potential dynamic
 * generation of resource target from inspection of the incoming request.
 */
export type RequiredPermission = {
  resourceType: PermissionResource;
  action: PermissionAction;
  resourceTarget: PermissionResourceTarget | GetResourceIdFn;
  effect: PermissionEffect.ALLOW;
};

/**
 * Decorates action so that it will be forbidden unless user associated with
 * incoming request has the required permissions. Must be used together with
 * PermissionsGuard, which computes user permissions and matches them against
 * the required ones.
 * @param resourceType the type of resource targeted (user, project...)
 * @param action the action targeted (edit, create...)
 * @param resourceTarget the static or dynamic target resource id
 * @returns decorated action
 */
export const RequiresPermission = (
  resourceType: PermissionResource,
  action: PermissionAction,
  resourceTarget: PermissionResourceTarget | GetResourceIdFn,
): CustomDecorator<typeof REQUIRED_PERMISSION> =>
  SetMetadata(REQUIRED_PERMISSION, { resourceType, action, resourceTarget, effect: PermissionEffect.ALLOW });
