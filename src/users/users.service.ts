import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './users.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  async create(email: string, password: string) {
    const user = this.userRepository.create({ email, password });
    return await this.userRepository.save(user);
  }

  async findOne(id: number) {
    if (!id) return null;
    const result = await this.userRepository.findOneBy({
      id,
    });
    if (!result) {
      throw new NotFoundException('User not found');
    }
    return result;
  }

  async find(email: string) {
    const result = await this.userRepository.findBy({
      email,
    });
    if (!result) {
      throw new NotFoundException('User not found');
    }
    return result;
  }

  async update(id: number, data: Partial<User>) {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    Object.assign(user, data);
    return await this.userRepository.save(user);
  }

  async remove(id: number) {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return await this.userRepository.remove(user);
  }
}
