import { Injectable, Inject, OnModuleInit, Logger } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { JwtService } from '@nestjs/jwt';
import { lastValueFrom } from 'rxjs';
import type { UserServiceClient, CreateUserRequest } from '@app/shared/interfaces/user';

@Injectable()
export class AuthService implements OnModuleInit {
  private readonly logger = new Logger(AuthService.name);
  private userService: UserServiceClient;

  constructor(
    @Inject('USER_PACKAGE') private client: ClientGrpc,
    private jwtService: JwtService,
  ) {}

  onModuleInit() {
    this.userService = this.client.getService<UserServiceClient>('UserService');
  }

  async googleLogin(googleUser: any) {
    try {
      this.logger.log('Processing Google login', { email: googleUser.email });

      // Try to find existing user by email
      const usersResponse = await lastValueFrom(
        this.userService.findAllUsers({})
      );

      let existingUser = usersResponse.users?.find(
        (u) => u.email === googleUser.email
      );

      if (!existingUser) {
        // Create new user
        this.logger.log('Creating new user from Google profile', { email: googleUser.email });
        
        const createUserRequest: CreateUserRequest = {
          email: googleUser.email,
          password: Math.random().toString(36).slice(-8), // Random password (won't be used for OAuth users)
          role: 'user',
        };

        const newUser = await lastValueFrom(
          this.userService.createUser(createUserRequest)
        );
        
        existingUser = newUser;
      }

      // Generate JWT token
      const payload = {
        sub: existingUser.id,
        email: existingUser.email,
        role: existingUser.role,
        provider: 'google',
      };

      const accessToken = this.jwtService.sign(payload);

      this.logger.log('Google login successful', { userId: existingUser.id });

      return {
        accessToken,
        user: {
          id: existingUser.id,
          email: existingUser.email,
          role: existingUser.role,
        },
      };
    } catch (error) {
      this.logger.error('Error during Google login', error);
      throw error;
    }
  }
}
