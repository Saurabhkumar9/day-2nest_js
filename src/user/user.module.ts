import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entity/user.entity';
import { UsersService } from './user.service';
import { UsersController } from './user.controller';

@Module({
  imports: [TypeOrmModule.forFeature([User])], 
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService], 
})
export class UserModule {}