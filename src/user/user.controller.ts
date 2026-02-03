import {
  Controller,
  Get,
  Put,
  Body,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { UsersService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { GetUser } from '../common/decorators/get-user.decorator';
import { User } from './entities/user.entity';

@Controller('user')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private usersService: UsersService) {}

  @Get('profile')
  async getProfile(@GetUser() user: User) {
    const userData = await this.usersService.findById(user.id);
    return {
      success: true,
      data: userData,
    };
  }

  @Put('profile')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async updateProfile(
    @GetUser() user: User,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    const updatedUser = await this.usersService.update(user.id, updateUserDto);
    
    return {
      success: true,
      message: 'Profile updated successfully',
      data: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        role: updatedUser.role,
        profileCompleted: updatedUser.profileCompleted,
      },
    };
  }
}