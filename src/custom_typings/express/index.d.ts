declare namespace Express {
  interface Request {
    permissionsContext?: {
      grantedPermissions: import('../../modules/permissions/types/permission.type').Permission[];
      allowedResourcesIds: string[] | null;
      deniedResourcesIds: string[] | null;
    };
    user: {
      id: string;
    }
  }
}
