import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from '../user/user.module';
import { OtpModule } from '../otp/otp.module';
import { JwtStrategy } from './jwt.strategy';
import { User } from '../user/entities/user.entity';
import { Otp } from '../otp/entities/otp.entity';

@Module({
  imports: [
    // ✅ Step 1: ConfigModule import (if not global)
    ConfigModule,
    
    PassportModule.register({ defaultStrategy: 'jwt' }),
    
    // ✅ Step 2: Correct JwtModule Async Configuration
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        // ✅ Debugging: Check if configService is working
        console.log('JWT Config loading...');
        
        const secret = configService.get('JWT_SECRET');
        if (!secret) {
          throw new Error('JWT_SECRET not found in environment variables');
        }
        
        return {
          secret: secret,
          signOptions: { 
            expiresIn: configService.get('JWT_EXPIRES_IN') || '7d'
          },
        };
      },
      inject: [ConfigService],
    }),
    
    TypeOrmModule.forFeature([User, Otp]),
    UsersModule,
    OtpModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [JwtStrategy, PassportModule],
})
export class AuthModule {}