import * as jwt from 'jsonwebtoken';
import * as crypto from 'crypto';
import { RequestOtpDto, VerifyOtpDto } from './dto/auth.dto'; // Keep DTOs for structure

interface OtpStoreEntry {
  otp: string;
  email: string;
  expiresAt: number;
}

// Configuration
const JWT_SECRET = process.env.JWT_SECRET || 'yourFallbackSecretKey'; // Fallback, should be in .env
const OTP_EXPIRY_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

class AuthService {
  private readonly otpStore: Map<string, OtpStoreEntry> = new Map();

  private generateOtp(): string {
    return crypto.randomInt(100000, 999999).toString();
  }

  async requestOtp(email: string): Promise<void> {
    const otp = this.generateOtp();
    const expiresAt = Date.now() + OTP_EXPIRY_DURATION;
    this.otpStore.set(email, { otp, email, expiresAt });

    console.log(`OTP for ${email}: ${otp}`); // Simulate sending OTP
  }

  async verifyOtp(email: string, otp: string): Promise<string | null> {
    const storedEntry = this.otpStore.get(email);

    if (!storedEntry) {
      console.warn(`No OTP found for email: ${email}`);
      return null;
    }

    if (Date.now() > storedEntry.expiresAt) {
      console.warn(`OTP expired for email: ${email}`);
      this.otpStore.delete(email); // Clean up expired OTP
      return null;
    }

    if (storedEntry.otp === otp) {
      console.log(`OTP verified for email: ${email}`);
      this.otpStore.delete(email); // OTP used, remove from store

      const payload = { email: storedEntry.email, sub: storedEntry.email };
      return jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
    } else {
      console.warn(`Invalid OTP for email: ${email}`);
      return null;
    }
  }
}

// Export an instance of the service
export const authService = new AuthService();
