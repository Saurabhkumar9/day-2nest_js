import { Injectable, Logger, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config'; //  Add ConfigService
import * as nodemailer from 'nodemailer';
import { EmailTemplates } from './email-templates';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor(
    private configService: ConfigService, // Inject ConfigService
  ) {
    this.initializeTransporter();
  }

  private initializeTransporter(): void {
    const host = this.configService.get<string>('EMAIL_HOST');
    const user = this.configService.get<string>('EMAIL_USER');
    const pass = this.configService.get<string>('EMAIL_PASS');

    //  Validation
    if (!host || !user || !pass) {
      this.logger.error('Email configuration missing!');
      throw new Error('Email configuration is incomplete');
    }

    this.transporter = nodemailer.createTransport({
      host,
      port: this.configService.get<number>('EMAIL_PORT', 465),
      secure: this.configService.get<boolean>('EMAIL_SECURE', true),
      auth: {
        user,
        pass,
      },
      // Additional options for better reliability
      pool: true,
      maxConnections: 5,
      maxMessages: 100,
    });

    // Verify connection on startup
    this.verifyConnection();
  }

  private async verifyConnection(): Promise<void> {
    try {
      await this.transporter.verify();
      this.logger.log('Email transporter verified successfully');
    } catch (error) {
      this.logger.error('Email transporter verification failed:', error);
      // Don't throw, might be temporary issue
    }
  }

  async sendVerificationEmail(to: string, name: string, otp: string): Promise<boolean> {
    return this.sendEmail({
      to,
      subject: 'Verify Your Email',
      html: EmailTemplates.verify(name, otp),
    });
  }

  async sendWelcomeEmail(to: string, name: string): Promise<boolean> {
    return this.sendEmail({
      to,
      subject: 'Welcome to EVE!',
      html: EmailTemplates.welcome(name),
    });
  }

  async sendResetPasswordEmail(to: string, name: string, otp: string): Promise<boolean> {
    return this.sendEmail({
      to,
      subject: 'Password Reset OTP',
      html: EmailTemplates.reset(name, otp),
    });
  }

  async sendResendVerificationEmail(to: string, name: string, otp: string): Promise<boolean> {
    return this.sendEmail({
      to,
      subject: 'Verify Your Email - New OTP',
      html: EmailTemplates.verify(name, otp),
    });
  }

  private async sendEmail(mailOptions: nodemailer.SendMailOptions): Promise<boolean> {
    try {
      const from = this.configService.get<string>('EMAIL_FROM', 'noreply@example.com');
      
      const info = await this.transporter.sendMail({
        from,
        ...mailOptions,
      });

      this.logger.log(`Email sent to ${mailOptions.to} - Message ID: ${info.messageId}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send email to ${mailOptions.to}:`, error);
      // ✅ Return false instead of throwing, caller can decide
      return false;
    }
  }

  // ✅ Utility method to check if email service is configured
  isConfigured(): boolean {
    try {
      return !!this.transporter;
    } catch {
      return false;
    }
  }
}