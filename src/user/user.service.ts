import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entity/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  // CREATE
  async create(body: any) {
    const user = this.userRepo.create(body);
    if(user){
      return  `${body.email} email already exits `
    }
    return this.userRepo.save(user);
  }

  // GET ALL
  async findAll() {
    return this.userRepo.find();
  }

  // GET ONE
  async findOne(id: string) {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  // UPDATE
  async update(id: string, body: any) {
    const user = await this.findOne(id);
    Object.assign(user, body);
    return this.userRepo.save(user);
  }

  // DELETE
  async remove(id: string) {
    const result = await this.userRepo.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('User not found');
    }
    return { message: 'User deleted successfully' };
  }
}
