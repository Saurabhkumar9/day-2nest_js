import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './user.controller';
import { UsersService } from './user.service';
import { User } from './entity/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]), // 👈 THIS WAS MISSING
  ],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UserModule {}
