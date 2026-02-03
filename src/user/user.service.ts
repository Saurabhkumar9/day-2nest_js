import {
  Injectable,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entity/user.entity';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private repo: Repository<User>,
    
  ) {}

 async create(dto: CreateUserDto) {
  const exists = await this.repo.findOne({
    where: { email: dto.email },
  });

  if (exists) {
    throw new ConflictException('Email already exists');
  }

  const hashedPassword = await bcrypt.hash(dto.password, 10);

  const user = this.repo.create({
    ...dto,
    password: hashedPassword,
  });

  await this.repo.save(user);

  
  return {
    id: user.id,          // string
    email: user.email,
    role: user.role,
  };
}


  async findByEmail(email: string) {
    return this.repo.findOne({
      where: { email },
      select: ['id', 'email', 'password', 'role'],
    });
  }

 
  async findById(id: string) {
    return this.repo.findOne({
      where: { id },
      select: ['id', 'email', 'role'],
    });
  }
}