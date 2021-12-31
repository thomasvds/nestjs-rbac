import { Controller, Get, Request } from '@nestjs/common';
import { Request as ExpressRequest } from 'express';
import { PermissionsService } from './permissions.service';
import { Permission } from './types/permission.type';

@Controller('permissions')
export class PermissionsController {
  constructor(
    private readonly permissionsService: PermissionsService,
  ) {}

  @Get('/me')
  async getManyForCurrentUser(@Request() { user }: ExpressRequest): Promise<Permission[]> {
    const { permissions } = await this.permissionsService.getMany(user.id);

    return permissions;
  }
}
