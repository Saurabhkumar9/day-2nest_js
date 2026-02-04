import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  /* ================= CREATE USER ================= */

  
  async create(createUserDto: CreateUserDto): Promise<User> {
    const emailLower = createUserDto.email.toLowerCase().trim();

    const existingUser = await this.userRepository.findOne({
      where: { email: emailLower },
    });

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(
      createUserDto.password,
      10,
    );

    const user = this.userRepository.create({
      ...createUserDto,
      email: emailLower,
      password: hashedPassword,
      role: createUserDto.role || 'EXPERT',
      isEmailVerified: false,
      profileCompleted: false,
      isActive: true,
      tokenVersion: 0,
    });

    return this.userRepository.save(user);
  }

  /* ================= FIND METHODS ================= */

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email: email.toLowerCase() },
    });
  }

  async findByEmailWithPassword(
    email: string,
  ): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email: email.toLowerCase() },
      select: [
        'id',
        'email',
        'password',
        'name',
        'role',
        'isEmailVerified',
        'isActive',
        'tokenVersion',
        'profileCompleted',
        'lastLogin',
      ],
    });
  }

  async findById(id: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { id },
    });
  }

  /* ================= UPDATE USER ================= */

  async updateUser(user: User): Promise<User> {
    return this.userRepository.save(user);
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<User> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    Object.assign(user, updateUserDto);
    user.profileCompleted = true;

    return this.userRepository.save(user);
  }

  /* ================= VERIFY EMAIL ================= */

  async verifyEmail(email: string): Promise<User> {
    const user = await this.findByEmail(email);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.isEmailVerified = true;
    user.profileCompleted = true;

    return this.userRepository.save(user);
  }

  /* ================= PASSWORD ================= */

  async updatePassword(
    id: string,
    newPassword: string,
  ): Promise<void> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await this.userRepository.save(user);
  }

  /* ================= TOKEN VERSION ================= */

  async updateTokenVersion(id: string): Promise<void> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.tokenVersion = (user.tokenVersion || 0) + 1;
    await this.userRepository.save(user);
  }

  /* ================= LAST LOGIN ================= */

  async updateLastLogin(id: string): Promise<void> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.lastLogin = new Date();
    await this.userRepository.save(user);
  }
}
