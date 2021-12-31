import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { UserDto } from './dto/user.dto';
import { User } from './user.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>
  ) {}

  createOne(dto: UserDto): Promise<User> {
    const user = new User();
    user.username = dto.name;

    return this.usersRepository.save(user);
  }

  async getMany(): Promise<User[]> {
    return this.usersRepository.find();
  }
}
