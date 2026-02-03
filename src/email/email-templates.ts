export class EmailTemplates {
  static verify(name: string, otp: string): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Verify Your Email</h2>
        <p>Hello ${name},</p>
        <p>Your verification OTP is:</p>
        <h1 style="background: #f4f4f4; padding: 20px; text-align: center; letter-spacing: 5px;">
          ${otp}
        </h1>
        <p>This OTP will expire in 10 minutes.</p>
        <p>If you didn't request this, please ignore this email.</p>
      </div>
    `;
  }

  static welcome(name: string): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Welcome to EVE!</h2>
        <p>Hello ${name},</p>
        <p>Thank you for verifying your email. Your account is now active.</p>
        <p>We're excited to have you on board!</p>
      </div>
    `;
  }

  static reset(name: string, otp: string): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Password Reset</h2>
        <p>Hello ${name},</p>
        <p>Your password reset OTP is:</p>
        <h1 style="background: #f4f4f4; padding: 20px; text-align: center; letter-spacing: 5px;">
          ${otp}
        </h1>
        <p>This OTP will expire in 10 minutes.</p>
        <p>If you didn't request this, please ignore this email.</p>
      </div>
    `;
  }
}