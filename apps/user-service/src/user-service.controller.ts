import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { UserService } from './user-service.service';
import type {
  CreateUserRequest,
  FindUserByIdRequest,
  UserResponse,
  UsersResponse,
  LoginRequest,
  LoginResponse,
  UpdateUserByIdRequest,
  DeleteUserByIdRequest,
} from '@app/shared/interfaces/user';

@Controller()
export class UserServiceController {
  constructor(private readonly userService: UserService) {}

  @GrpcMethod('UserService', 'HealthCheck')
  async healthCheck(): Promise<void> {
    return; // Indicate service is healthy 
  }

  @GrpcMethod('UserService', 'CreateUser')
  async createUser(data: CreateUserRequest): Promise<UserResponse> {
    return this.userService.createUser(data);
  }

  @GrpcMethod('UserService', 'Login')
  async login(data: LoginRequest): Promise<LoginResponse> {
    return this.userService.login(data);
  }

  @GrpcMethod('UserService', 'FindUserById')
  async findUserById(data: FindUserByIdRequest): Promise<UserResponse> {
    return this.userService.findById(data.id);
  }

  @GrpcMethod('UserService', 'FindAllUsers')
  async findAllUsers(): Promise<UsersResponse> {
    const users = await this.userService.findAllUsers();
    return { users };
  }

  @GrpcMethod('UserService', 'UpdateUserById')
  async updateUserById(data: UpdateUserByIdRequest): Promise<UserResponse> {
    return this.userService.updateUserById(data);
  }

  @GrpcMethod('UserService', 'DeleteUserById')
  async deleteUserById(data: DeleteUserByIdRequest): Promise<UserResponse> {
    return this.userService.deleteUserById(data.id);
  }
}
