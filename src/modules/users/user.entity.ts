import { AbstractEntity } from '../../abstract.entity';
import { Column, Entity, ManyToMany } from 'typeorm';
import { PermissionRole } from '../permissions/enums';
import { Project } from '../projects/project.entity';

@Entity({ name: 'users'})
export class User extends AbstractEntity {
  @Column()
  username: string;

  @Column()
  role: PermissionRole;

  @ManyToMany(() => Project, (project) => project.users)
  projects: Project[];
}
