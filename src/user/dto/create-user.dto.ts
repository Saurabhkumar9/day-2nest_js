// users/dto/create-user.dto.ts
import { IsEmail, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsString()
  firstName: string;

  @IsEmail({}, { message: 'Invalid email' })
  email: string;

  @MinLength(6, { message: 'Password must be 6 chars' })
  password: string;
}
