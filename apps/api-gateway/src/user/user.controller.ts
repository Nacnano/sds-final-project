import { Controller, Get, Post, Patch, Delete, Body, Param, Inject, OnModuleInit, UseGuards, ForbiddenException, UnauthorizedException, Logger } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { Observable } from 'rxjs';
import type {
  CreateUserRequest,
  UpdateUserByIdRequest,
  UserResponse,
  UsersResponse,
  UserServiceClient,
  LoginRequest,
  LoginResponse,
} from '@app/shared/interfaces/user';
import { JwtAuthGuard } from '@app/shared/auth/jwt-auth.guard';
import { RolesGuard } from '@app/shared/auth/roles.guard';
import { CurrentUser } from '@app/shared/auth/current-user.decorator';
import { Roles } from '@app/shared/auth/roles.decorator';

@Controller('users')
export class UserController implements OnModuleInit {
  private readonly logger = new Logger(UserController.name);
  private userService: UserServiceClient;

  constructor(@Inject('USER_PACKAGE') private client: ClientGrpc) {}

  onModuleInit() {
    this.userService = this.client.getService<UserServiceClient>('UserService');
  }

  @Get('health')
  healthCheck(@CurrentUser() user: any) {
    this.logger.log('Health check called', { user });
    return this.userService.healthCheck({});
  }

  @UseGuards(JwtAuthGuard)
  @Get('test')
  testJwt(@CurrentUser() user: any) {
    this.logger.log('Test endpoint called', { user });
    return { ok: true, user };
  }

  @Post()
  createUser(@Body() createUserDto: CreateUserRequest): Observable<UserResponse> {
    return this.userService.createUser(createUserDto);
  }

  @Post('login')
  login(@Body() loginDto: LoginRequest): Observable<LoginResponse> {
    return this.userService.login(loginDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findUserById(
    @Param('id') id: string,
    @CurrentUser() currentUser?: any
  ): Observable<UserResponse> {
    if (!currentUser) {
      throw new UnauthorizedException('You must be logged in');
    }

    if (currentUser.role !== 'admin' && currentUser.id !== id) {
      throw new ForbiddenException('You can only access your own data');
    }

    return this.userService.findUserById({ id });
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAllUsers(@CurrentUser() currentUser?: any): Observable<UsersResponse> {
    if (!currentUser) {
      throw new UnauthorizedException('You must be logged in');
    }

    if (currentUser.role !== 'admin') {
      throw new ForbiddenException('Only admins can access all users');
    }

    return this.userService.findAllUsers({}); // Empty request for gRPC
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  updateUser(
    @Param('id') id: string,
    @Body() updateUserDto: Omit<UpdateUserByIdRequest, 'id'>,
    @CurrentUser() currentUser?: any
  ): Observable<UserResponse> {
    if (!currentUser) {
      throw new UnauthorizedException('You must be logged in');
    }

    if (currentUser.role !== 'admin' && currentUser.id !== id) {
      throw new ForbiddenException('You don\'t have permission to update this user');
    }

    // Only admins can change roles
    if (updateUserDto.role && currentUser.role !== 'admin') {
      throw new ForbiddenException('Only admins can change user roles');
    }

    return this.userService.updateUserById({ id, ...updateUserDto });
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  deleteUserById(
    @Param('id') id: string,
    @CurrentUser() currentUser?: any
  ): Observable<UserResponse> {
    if (!currentUser) {
      throw new UnauthorizedException('You must be logged in');
    }

    if (currentUser.role !== 'admin' && currentUser.id !== id) {
      throw new ForbiddenException('You don\'t have permission to delete this user');
    }

    return this.userService.deleteUserById({ id });
  }
}
