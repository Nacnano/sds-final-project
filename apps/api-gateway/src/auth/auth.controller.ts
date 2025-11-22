import { Controller, Get, UseGuards, Req, Res, Logger } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Response } from 'express';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) {}

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {
    // Initiates the Google OAuth2 login flow
    this.logger.log('Initiating Google OAuth login');
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthCallback(@Req() req: any, @Res() res: Response) {
    try {
      this.logger.log('Google OAuth callback received', { user: req.user });
      
      // Get or create user and generate JWT token
      const result = await this.authService.googleLogin(req.user);
      
      // Redirect to frontend with token
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      res.redirect(`${frontendUrl}/auth/callback?token=${result.accessToken}`);
    } catch (error) {
      this.logger.error('Google OAuth callback error', error);
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      res.redirect(`${frontendUrl}/login?error=oauth_failed`);
    }
  }

  @Get('google/status')
  getGoogleAuthStatus() {
    return {
      enabled: true,
      provider: 'google',
      loginUrl: '/auth/google',
    };
  }
}
