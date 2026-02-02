import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
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
    if (!body.email || !body.password || !body.firstName) {
      throw new BadRequestException('Required fields are missing');
    }

    const existingUser = await this.userRepo.findOne({
      where: { email: body.email },
    });

    if (existingUser) {
      throw new ConflictException(`${body.email} already exists`);
    }

    const user = this.userRepo.create(body);
    const savedUser = await this.userRepo.save(user);

    return {
      message: 'User created successfully',
      data: savedUser,
    };
  }

  // GET ALL
  async findAll() {
    return {
      message: 'Users fetched successfully',
      data: await this.userRepo.find(),
    };
  }

  // GET ONE
  async findOne(id: string) {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      message: 'User fetched successfully',
      data: user,
    };
  }

  // UPDATE
  async update(id: string, body: any) {
    const user = await this.findOne(id); // already checks 404

    Object.assign(user.data, body);
    const updatedUser = await this.userRepo.save(user.data);

    return {
      message: 'User updated successfully',
      data: updatedUser,
    };
  }

  // DELETE
  async remove(id: string) {
    const result = await this.userRepo.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException('User not found');
    }

    return {
      message: 'User deleted successfully',
    };
  }
}
