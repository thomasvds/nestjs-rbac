import { Body, Controller, Delete, Get, Inject, Param, ParseUUIDPipe, Post, UseGuards } from '@nestjs/common';
import { RequiresPermission, PermissionResource, PermissionResourceTarget, PermissionAction, GetResourceIdFromParams } from '../permissions/decorators/permissions.decorator';
import { PERMISSIONS, Permissions } from '../permissions/factories/permissions';
import { PermissionsGuard } from '../permissions/guards/permissions.guard';
import { ProjectDto } from './dto/project.dto';
import { Project } from './project.entity';
import { ProjectsService } from './projects.service';

@Controller('projects')
@UseGuards(PermissionsGuard)
export class ProjectsController {
  constructor(
    @Inject(PERMISSIONS) private readonly permissions: Permissions,
    private readonly projectsService: ProjectsService
  ) {}

  @RequiresPermission(PermissionResource.PROJECTS, PermissionAction.CREATE, PermissionResourceTarget.ANY)
  @Post()
  create(@Body() dto: ProjectDto): Promise<Project> {
    return this.projectsService.createOne(dto);
  }

  @RequiresPermission(PermissionResource.PROJECTS, PermissionAction.GET, GetResourceIdFromParams)
  @Get(':id')
  getOne(@Param('id', ParseUUIDPipe) id: string): Promise<Project> {
    return this.projectsService.getOne(id);
  }

  @RequiresPermission(PermissionResource.PROJECTS, PermissionAction.DELETE, GetResourceIdFromParams)
  @Delete(':id')
  async deleteOne(@Param('id', ParseUUIDPipe) id: string): Promise<null> {
    await this.projectsService.deleteOne(id);
    return null;
  }

  @Get()
  @RequiresPermission(PermissionResource.PROJECTS, PermissionAction.GET, PermissionResourceTarget.SOME)
  getMany(): Promise<Project[]> {
    return this.projectsService.getMany({
      includedIds: this.permissions.allowedResourcesIds,
      excludedIds: this.permissions.deniedResourcesIds,
    });
  }
}
