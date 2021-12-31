import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { RequiresPermission, PermissionResource, PermissionAction, PermissionResourceTarget } from '../permissions/decorators/permissions.decorator';
import { PermissionsGuard } from '../permissions/guards/permissions.guard';
import { UserDto } from './dto/user.dto';
import { User } from './user.entity';
import { UsersService } from './users.service';

@Controller('users')
@UseGuards(PermissionsGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @RequiresPermission(PermissionResource.USERS, PermissionAction.CREATE, PermissionResourceTarget.ANY)
  @Post()
  createOne(@Body() dto: UserDto): Promise<User> {
    return this.usersService.createOne(dto);
  }

  @RequiresPermission(PermissionResource.USERS, PermissionAction.GET, PermissionResourceTarget.SOME)
  @Get()
  getMany(): Promise<User[]> {
    return this.usersService.getMany();
  }
}
