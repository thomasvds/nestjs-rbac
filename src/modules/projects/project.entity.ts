import { AbstractEntity } from '../../abstract.entity';
import { Column, Entity, JoinTable, ManyToMany } from 'typeorm';
import { User } from '../users/user.entity';

@Entity({ name: 'projects'})
export class Project extends AbstractEntity {
  @Column()
  name: string;

  @ManyToMany(() => User, (user) => user.projects)
  @JoinTable()
  users: User[];
}
