import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { ProjectDto } from './dto/project.dto';
import { Project } from './project.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { querySafeAndWhereInIds, querySafeAndWhereNotInIds } from 'src/typeorm.helpers';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private readonly projectsRepository: Repository<Project>
  ) {}

  createOne(dto: ProjectDto): Promise<Project> {
    const project = new Project();
    project.name = dto.name;

    return this.projectsRepository.save(project);
  }

  async getOne(id: string): Promise<Project> {
    return this.projectsRepository.findOne({ id });
  }

  async deleteOne(id: string): Promise<void> {
    const project = await this.getOne(id);
    await this.projectsRepository.remove(project);
  }
  
  /**
   * @param includedIds if provided, only projects matching these ids will be returned
   * @param excludedIds if provided, projects matching these ids will be excluded from result
   * @returns a list of projects
   */
  getMany({
    includedIds,
    excludedIds,
  }: {
    includedIds?: string[];
    excludedIds?: string[];
  }): Promise<Project[]> {
    let query = this.projectsRepository
      .createQueryBuilder('p')
      .select(['p']);

    if (includedIds) {
      query = querySafeAndWhereInIds(query, 'p', includedIds);
    }

    if (excludedIds) {
      query = querySafeAndWhereNotInIds(query, 'p', excludedIds);
    }

    return query.getMany();
  }
}
