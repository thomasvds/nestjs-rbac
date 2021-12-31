import { isUuid } from 'lodash-uuid';

import { PermissionAction, PermissionEffect, PermissionResourceTarget, PermissionResource, PermissionRole } from './enums';
import { Permission } from './types/permission.type';

export function generateGlobalPermissions(role: PermissionRole): Permission[] {
  switch (role) {
    case PermissionRole.ADMIN:
      return [
        generatePermission(PermissionResource.ANY, PermissionAction.ANY, PermissionResourceTarget.ANY)
      ]
    case PermissionRole.CONTRIBUTOR:
      return [
        generatePermission(PermissionResource.USERS, PermissionAction.GET, PermissionResourceTarget.ANY),
        generatePermission(PermissionResource.USERS, PermissionAction.EDIT, PermissionResourceTarget.SOME),
        generatePermission(PermissionResource.PROJECTS, PermissionAction.GET, PermissionResourceTarget.SOME),
        generatePermission(PermissionResource.PROJECTS, PermissionAction.EDIT, PermissionResourceTarget.SOME)
      ]
    case PermissionRole.GUEST:
      return [
        generatePermission(PermissionResource.PROJECTS, PermissionAction.GET, PermissionResourceTarget.SOME)
      ];
    default:
      throw new Error(`unsupported workspace role - ${role}`);
  }
}

export function generatePermission(
  resourceType: PermissionResource,
  action: PermissionAction,
  target: PermissionResourceTarget | string,
  effect = PermissionEffect.ALLOW,
): Permission {
  return {
    resourceTarget: target,
    action,
    resourceType,
    effect,
  };
}

/**
 * Check whether required permission is included in granted permissions,
 * either explicitly or as an element of a permission set. Denied permissions
 * always prevail on allowed permissions.
 * @param grantedPermissions list of granted permissions
 * @param requiredPermission permission to be checked against
 * @returns true if required permission is included in granted permissions.
 */
export function grantedMatchRequired(grantedPermissions: Permission[], requiredPermission: Permission): boolean {
  if (requiredPermission.effect !== PermissionEffect.ALLOW) {
    throw new Error('should only be used with ALLOW effect permissions');
  }

  const matchingPermissions = grantedPermissions.filter(
    (p) =>
      (p.resourceType === requiredPermission.resourceType || p.resourceType === PermissionResource.ANY) &&
      (p.action === requiredPermission.action || p.action === PermissionAction.ANY) &&
      (p.resourceTarget === requiredPermission.resourceTarget || p.resourceTarget === PermissionResourceTarget.ANY),
  );

  if (!matchingPermissions.length) {
    return false;
  }

  return !matchingPermissions.some((p) => p.effect === PermissionEffect.DENY);
}

/**
 * Extract all ids of resources matching the resource type in the required
 * permission.
 * @param grantedPermissions list of granted permissions
 * @param requiredPermission permission required
 * @param effect permission effect
 * @returns an array of the ids of all the resources included in granted
 * permissions that match the required permission resource type, effect, and
 * action.
 */
export function getPermittedResourcesIds(
  grantedPermissions: Permission[],
  requiredPermission: Permission,
  effect: PermissionEffect,
): string[] {
  return grantedPermissions
    .filter(
      (p) =>
        p.effect === effect &&
        [PermissionResource.ANY, requiredPermission.resourceType].includes(p.resourceType) &&
        [PermissionAction.ANY, requiredPermission.action].includes(p.action) &&
        isUuid(p.resourceTarget),
    )
    .map((p) => p.resourceTarget);
}
