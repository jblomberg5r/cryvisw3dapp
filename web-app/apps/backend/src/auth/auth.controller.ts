import { Controller, Post, Body, HttpCode, HttpStatus, HttpException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RequestOtpDto, VerifyOtpDto } from './dto/auth.dto';

@Controller('auth/email')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('request-otp')
  @HttpCode(HttpStatus.OK)
  async requestOtp(@Body() requestOtpDto: RequestOtpDto): Promise<{ message: string }> {
    try {
      await this.authService.requestOtp(requestOtpDto.email);
      return { message: 'OTP sent successfully.' };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('verify-otp')
  @HttpCode(HttpStatus.OK)
  async verifyOtp(@Body() verifyOtpDto: VerifyOtpDto): Promise<{ token: string } | { message: string }> {
    try {
      const token = await this.authService.verifyOtp(verifyOtpDto.email, verifyOtpDto.otp);
      if (token) {
        return { token };
      } else {
        throw new HttpException('Invalid or expired OTP.', HttpStatus.BAD_REQUEST);
      }
    } catch (error)
    {
      throw new HttpException(error.message || 'Error verifying OTP.', error.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
