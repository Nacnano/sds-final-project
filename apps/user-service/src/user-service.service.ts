import { Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { status } from '@grpc/grpc-js';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';

// DTOs
interface CreateUserRequest {
  email: string;
  role: string;
  password?: string;
}

interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  accessToken: string;
  user: UserResponse;
}

interface UserResponse {
  id: string;
  email: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

interface UsersResponse {
  users: UserResponse[];
}

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async createUser(data: CreateUserRequest): Promise<UserResponse> {
    const { email, role, password } = data;

    if (!password) {
      throw new RpcException({
        code: status.INVALID_ARGUMENT,
        message: 'Password is required for registration',
      });
    }

    const existing = await this.userRepository.findOne({ where: { email } });
    if (existing) {
      throw new RpcException({
        code: status.ALREADY_EXISTS,
        message: `User with email ${email} already exists`,
      });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const user = this.userRepository.create({ email, role, password_hash });
    const savedUser = await this.userRepository.save(user);

    return this.mapToResponse(savedUser);
  }

  async login(data: LoginRequest): Promise<LoginResponse> {
    const { email, password } = data;

    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new RpcException({
        code: status.UNAUTHENTICATED,
        message: 'Invalid email or password',
      });
    }

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      throw new RpcException({
        code: status.UNAUTHENTICATED,
        message: 'Invalid email or password',
      });
    }

    const payload = { sub: user.id, email: user.email, role: user.role };
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET is not set in environment variables');
    }

    const accessToken = jwt.sign(payload, secret, { expiresIn: '1h' });

    return {
      accessToken,
      user: this.mapToResponse(user),
    };
  }

  async findById(id: string): Promise<UserResponse> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new RpcException({
        code: status.NOT_FOUND,
        message: `User with ID ${id} not found`,
      });
    }
    return this.mapToResponse(user);
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    return await this.userRepository.findOne({ where: { email } });
  }

  async findAllUsers(): Promise<UserResponse[]> {
    const users = await this.userRepository.find();
    return users.map(this.mapToResponse);
  }

  async updateUserById(data: { id: string; email?: string; password?: string; role?: string }): Promise<UserResponse> {
    const user = await this.userRepository.findOne({ where: { id: data.id } });
    if (!user) {
      throw new RpcException({
        code: status.NOT_FOUND,
        message: `User with ID ${data.id} not found`,
      });
    }

    if (data.email) {
      const existingUser = await this.userRepository.findOne({ where: { email: data.email } });
      if (existingUser && existingUser.id !== data.id) {
        throw new RpcException({
          code: status.ALREADY_EXISTS,
          message: `User with email ${data.email} already exists`,
        });
      }
      user.email = data.email;
    }

    if (data.password) {
      const salt = await bcrypt.genSalt(10);
      user.password_hash = await bcrypt.hash(data.password, salt);
    }

    if (data.role) {
      // Role can be updated (admin permission check is done at gateway level)
      user.role = data.role;
    }

    const updatedUser = await this.userRepository.save(user);
    return this.mapToResponse(updatedUser);
  }

  async deleteUserById(id: string): Promise<UserResponse> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new RpcException({
        code: status.NOT_FOUND,
        message: `User with ID ${id} not found`,
      });
    }

    await this.userRepository.remove(user);
    return this.mapToResponse(user);
  }

  private mapToResponse(user: UserEntity): UserResponse {
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };
  }
}
