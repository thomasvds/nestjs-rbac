import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Project } from '../projects/project.entity';
import { User } from '../users/user.entity';

import { Permissions, PERMISSIONS } from './factories/permissions';
import { PermissionsFactory } from './factories/permissions.factory';
import { PermissionsController } from './permissions.controller';
import { PermissionsService } from './permissions.service';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([Project, User])],
  providers: [PermissionsService, Permissions, PermissionsFactory],
  controllers: [PermissionsController],
  exports: [PermissionsService, PERMISSIONS],
})
export class PermissionsModule {}
