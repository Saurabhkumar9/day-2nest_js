import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { Otp } from './entities/otp.entity';
import * as crypto from 'crypto';

@Injectable()
export class OtpService {
  constructor(
    @InjectRepository(Otp)
    private otpRepository: Repository<Otp>,
  ) {}

  async generateOtp(email: string, type: 'VERIFY_EMAIL' | 'RESET_PASSWORD'): Promise<string> {
    // Delete previous OTPs
    await this.deleteOtp(email, type);

    // Generate OTP
    const otp = crypto.randomInt(100000, 999999).toString();

    // Create OTP record
    const otpRecord = this.otpRepository.create({
      email: email.toLowerCase(),
      otp,
      type,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
    });

    await this.otpRepository.save(otpRecord);
    return otp;
  }

  async verifyOtp(email: string, otp: string, type: string): Promise<boolean> {
    const otpRecord = await this.otpRepository.findOne({
      where: {
        email: email.toLowerCase(),
        otp,
        type,
      },
    });

    if (!otpRecord || otpRecord.isExpired()) {
      return false;
    }

    // Delete OTP after verification
    await this.otpRepository.delete(otpRecord.id);
    return true;
  }

  async deleteOtp(email: string, type: string): Promise<void> {
    await this.otpRepository.delete({
      email: email.toLowerCase(),
      type,
    });
  }

  async cleanupExpiredOtps(): Promise<void> {
    await this.otpRepository.delete({
      expiresAt: LessThan(new Date()),
    });
  }
}