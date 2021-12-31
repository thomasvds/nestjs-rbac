import { Injectable, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Project } from '../projects/project.entity';
import { User } from '../users/user.entity';

import { PermissionRole, PermissionEffect, PermissionResource, PermissionAction } from './enums';
import { generatePermission, generateGlobalPermissions } from './permissions.helpers';
import { Permission } from './types/permission.type';

@Injectable()
export class PermissionsService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(Project)
    private readonly projectsRepository: Repository<Project>
  ){}

  async getMany(
    userId: string
  ): Promise<{ role: PermissionRole; permissions: Permission[] }> {
    const permissions = [];

    const user = await this.usersRepository.findOne({
      where: { id: userId },
      relations: ['projects']
    });

    if (!user) {
      throw new ForbiddenException();
    }

    permissions.push(...generateGlobalPermissions(user.role));

    if (user.role === PermissionRole.ADMIN) {
      const restrictedProjects = await this.projectsRepository.find(
        { where: { restricted: true }, relations: ['users'] }
      );

      const deniedProjects = restrictedProjects.filter(
        p => !user.projects.some(up => up.id === p.id)
      );

      deniedProjects.forEach((project) => {
        permissions.push(
          generatePermission(
            PermissionResource.PROJECTS,
            PermissionAction.ANY,
            project.id,
            PermissionEffect.DENY
          ));
      });
    } else if (user.role === PermissionRole.CONTRIBUTOR) {
      user.projects.forEach((project) =>
        permissions.push(
          ...[
            generatePermission(PermissionResource.PROJECTS, PermissionAction.GET, project.id),
            generatePermission(PermissionResource.PROJECTS, PermissionAction.EDIT, project.id)
          ]
        ),
      );
    } else if (user.role === PermissionRole.GUEST) {
      user.projects.forEach((project) =>
        permissions.push(
          ...[
            generatePermission(PermissionResource.PROJECTS, PermissionAction.GET, project.id),
          ]
        ),
      );
    }

    return { role: user.role, permissions };
  }
}
