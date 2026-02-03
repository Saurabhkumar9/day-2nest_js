import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { UsersService } from './user.service';
import { AuthService } from '../auth/auth.service';
import { CreateUserDto } from './dto/create-user.dto';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
  ) { }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() dto: CreateUserDto) {
    // 1️⃣ user create
    const user = await this.usersService.create(dto);

    // 2️⃣ auto login (token)
 const token = this.authService.generateToken({
  id: user.id,     // ✅ string
  role: user.role,
});

return {
  message: 'User registered and logged in',
  user,
  token,
};


  }
}
