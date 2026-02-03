import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../user/user.service';
import { OtpService } from '../otp/otp.service';
import { EmailService } from '../email/email.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private otpService: OtpService,
    private emailService: EmailService,
  ) {}

  async register(registerDto: RegisterDto) { 
    
    const { email, name } = registerDto;
    const emailLower = email.toLowerCase().trim();

    // Check if user exists and is verified
    const existingUser = await this.usersService.findByEmail(emailLower);
    if (existingUser && existingUser.isEmailVerified) {
      throw new ConflictException('Email already registered. Please login.');
    }

    let user;
    if (existingUser) {
      // User exists but not verified - update user
      existingUser.name = name.trim();
      existingUser.password = registerDto.password;
      existingUser.phone = registerDto.phone || '';
      existingUser.role = registerDto.role || 'EXPERT';
      user = await this.usersService.updateUser(existingUser);

    } else {
      // Create new user
      user = await this.usersService.create(registerDto);
    }

    // Generate and send OTP
    const otp = await this.otpService.generateOtp(emailLower, 'VERIFY_EMAIL');
    await this.emailService.sendVerificationEmail(email, name, otp);

    return {
      success: true,
      message: existingUser ? 'OTP resent to your email. Please verify to complete registration.' : 'Registration successful. OTP sent to your email.',
      data: {
        id: user.id,
        email: user.email,
      },
    };
  }

  async verifyEmail(verifyEmailDto: VerifyEmailDto) {
    const { email, otp } = verifyEmailDto;
    const emailLower = email.toLowerCase();

    // Find user
    const user = await this.usersService.findByEmail(emailLower);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if already verified
    if (user.isEmailVerified) {
      throw new BadRequestException('Email already verified');
    }

    // Verify OTP
    const isValidOtp = await this.otpService.verifyOtp(
      emailLower,
      otp,
      'VERIFY_EMAIL',
    );

    if (!isValidOtp) {
      throw new BadRequestException('Invalid or expired OTP');
    }

    // Verify user
    await this.usersService.verifyEmail(emailLower);

    // Generate token
    const token = this.generateToken(user);

    // Update user with token
    user.tokenVersion = user.tokenVersion || 0;
    // Note: You might want to store current token in a separate field if needed

    // Send welcome email
    await this.emailService.sendWelcomeEmail(email, user.name);

    return {
      success: true,
      message: 'Email verified successfully',
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          isEmailVerified: true,
          profileCompleted: true,
        },
      },
    };
  }

  async resendVerificationOtp(email: string) {
    const emailLower = email.toLowerCase();
    const user = await this.usersService.findByEmail(emailLower);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.isEmailVerified) {
      throw new BadRequestException('Email already verified');
    }

    // Generate new OTP
    const otp = await this.otpService.generateOtp(emailLower, 'VERIFY_EMAIL');
    await this.emailService.sendResendVerificationEmail(email, user.name, otp);

    return {
      success: true,
      message: 'New OTP sent to your email',
    };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;
    const emailLower = email.toLowerCase();

    // Find user with password
    const user = await this.usersService.findByEmailWithPassword(emailLower);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if user is active
    if (!user.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    // Check email verification
    if (!user.isEmailVerified) {
      throw new UnauthorizedException('Please verify your email first');
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Update last login
    await this.usersService.updateLastLogin(user.id);

    // Generate token
    const token = this.generateToken(user);

    return {
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          isEmailVerified: user.isEmailVerified,
          profileCompleted: user.profileCompleted,
          lastLogin: user.lastLogin,
        },
      },
    };
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const { email } = forgotPasswordDto;
    const emailLower = email.toLowerCase();

    const user = await this.usersService.findByEmail(emailLower);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Generate OTP
    const otp = await this.otpService.generateOtp(emailLower, 'RESET_PASSWORD');
    await this.emailService.sendResetPasswordEmail(email, user.name, otp);

    return {
      success: true,
      message: 'OTP sent to your email',
    };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const { email, otp, newPassword } = resetPasswordDto;
    const emailLower = email.toLowerCase();

    // Validate OTP
    const isValidOtp = await this.otpService.verifyOtp(
      emailLower,
      otp,
      'RESET_PASSWORD',
    );

    if (!isValidOtp) {
      throw new BadRequestException('Invalid or expired OTP');
    }

    // Find user
    const user = await this.usersService.findByEmail(emailLower);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Update password
    await this.usersService.updatePassword(user.id, newPassword);

    // Invalidate all tokens
    await this.usersService.updateTokenVersion(user.id);

    return {
      success: true,
      message: 'Password reset successful. Please login with new password.',
    };
  }

  async logout(userId: string) {
    // Increment token version to invalidate all tokens
    await this.usersService.updateTokenVersion(userId);

    return {
      success: true,
      message: 'Logged out successfully',
    };
  }

  private generateToken(user: any): string {
    return this.jwtService.sign({
      sub: user.id,
      email: user.email,
      role: user.role,
      tokenVersion: user.tokenVersion || 0,
    });
  }
}