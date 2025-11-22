import { Injectable, Inject, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RpcException } from '@nestjs/microservices';
import type { ClientGrpc } from '@nestjs/microservices';
import { status } from '@grpc/grpc-js';
import { firstValueFrom } from 'rxjs';
import { Wish } from './entities/wish.entity';
import {
  CreateWishRequest,
  UpdateWishByIdRequest,
  WishResponse,
  FindAllWishesRequest,
} from '@app/shared/interfaces/wishing';
import type { ShrineServiceClient } from '@app/shared/interfaces/shrine';
import { isObjectId } from '@app/shared/utils/validators/object-id.validator';

@Injectable()
export class WishingService implements OnModuleInit {
  private shrineService: ShrineServiceClient;

  // Optional Redis client (provided by redisFactory)
  // Use `any` to avoid hard dependency on ioredis types at build time.
  constructor(
    @InjectRepository(Wish)
    private readonly wishRepository: Repository<Wish>,
    @Inject('SHRINE_PACKAGE') private shrineClient: ClientGrpc,
    @Inject('REDIS') private readonly redisClient?: any,
  ) {}

  onModuleInit() {
    this.shrineService =
      this.shrineClient.getService<ShrineServiceClient>('ShrineService');
  }

  async createWish(data: CreateWishRequest): Promise<WishResponse> {
    // Validate shrine exists
    await this.validateShrine(data.shrineId);

    try {
      const wish = this.wishRepository.create({
        wisherId: data.wisherId,
        shrineId: data.shrineId,
        wisherName: data.wisherName || '',
        description: data.description,
        public: data.public ?? true,
      });

      const savedWish = await this.wishRepository.save(wish);
      // Invalidate relevant caches
      try {
        await this.clearCacheForWish(savedWish);
      } catch (e) {
        // eslint-disable-next-line no-console
        console.warn(`Redis cache invalidation failed: ${e?.message ?? e}`);
      }
      return this.mapToResponse(savedWish);
    } catch (err) {
      throw new RpcException({
        code: status.INTERNAL,
        message: 'Failed to create wish',
      });
    }
  }

  async findWishById(id: string): Promise<WishResponse> {
    if (!isObjectId(id)) {
      throw new RpcException({
        code: status.INVALID_ARGUMENT,
        message: `Invalid ID format: ${id}`,
      });
    }

    try {
      const wish = await this.wishRepository.findOne({ where: { id } });
      if (!wish) {
        throw new RpcException({
          code: status.NOT_FOUND,
          message: `Wish with ID ${id} not found`,
        });
      }
      return this.mapToResponse(wish);
    } catch (err) {
      if (err instanceof RpcException) {
        throw err;
      }
      throw new RpcException({
        code: status.INTERNAL,
        message: 'Internal server error',
      });
    }
  }

  async findAllWishes(request: FindAllWishesRequest): Promise<WishResponse[]> {
    try {
      const { shrineId, wisherId } = request;

      // Build a cache key that includes filters
      const cacheKey = `wishes:list:${shrineId ?? 'all'}:${wisherId ?? 'all'}`;

      // Try to read from Redis first
      if (this.redisClient) {
        try {
          const cached = await this.redisClient.get(cacheKey);
          if (cached) {
            const parsed = JSON.parse(cached) as WishResponse[];
            return parsed;
          }
        } catch (e) {
          // Don't fail the request because Redis is unavailable
          // eslint-disable-next-line no-console
          console.warn(`Redis read failed: ${e?.message ?? e}`);
        }
      }

      // Build query based on filters
      const queryBuilder = this.wishRepository.createQueryBuilder('wish');

      if (shrineId && wisherId) {
        // Both filters: show all wishes by wisher at shrine (ignore public)
        queryBuilder
          .where('wish.shrineId = :shrineId', { shrineId })
          .andWhere('wish.wisherId = :wisherId', { wisherId });
      } else if (wisherId) {
        // Only wisherId: show all wishes by that wisher (ignore public)
        queryBuilder.where('wish.wisherId = :wisherId', { wisherId });
      } else if (shrineId) {
        // Only shrineId: show public wishes at that shrine
        queryBuilder
          .where('wish.shrineId = :shrineId', { shrineId })
          .andWhere('wish.public = :public', { public: true });
      } else {
        // No filters: show all public wishes
        queryBuilder.where('wish.public = :public', { public: true });
      }

      const wishes = await queryBuilder.getMany();
      const response = wishes.map(this.mapToResponse);

      // Cache the result with a short TTL
      if (this.redisClient) {
        try {
          await this.redisClient.setex(cacheKey, 60, JSON.stringify(response));
        } catch (e) {
          // eslint-disable-next-line no-console
          console.warn(`Redis write failed: ${e?.message ?? e}`);
        }
      }

      return response;
    } catch (err) {
      throw new RpcException({
        code: status.INTERNAL,
        message: 'Failed to fetch wishes',
      });
    }
  }

  async updateWishById(data: UpdateWishByIdRequest): Promise<WishResponse> {
    if (!isObjectId(data.id)) {
      throw new RpcException({
        code: status.INVALID_ARGUMENT,
        message: `Invalid ID format: ${data.id}`,
      });
    }

    const wish = await this.wishRepository.findOne({ where: { id: data.id } });
    if (!wish) {
      throw new RpcException({
        code: status.NOT_FOUND,
        message: `Wish with ID ${data.id} not found`,
      });
    }

    // Validate shrine if it's being updated
    if (data.shrineId && data.shrineId !== wish.shrineId) {
      await this.validateShrine(data.shrineId);
    }

    wish.wisherId = data.wisherId ?? wish.wisherId;
    wish.shrineId = data.shrineId ?? wish.shrineId;
    wish.wisherName = data.wisherName ?? wish.wisherName;
    wish.description = data.description ?? wish.description;
    wish.public = data.public ?? wish.public;

    try {
      const updatedWish = await this.wishRepository.save(wish);
      // Invalidate caches for updated wish
      try {
        await this.clearCacheForWish(updatedWish);
      } catch (e) {
        // eslint-disable-next-line no-console
        console.warn(`Redis cache invalidation failed: ${e?.message ?? e}`);
      }
      return this.mapToResponse(updatedWish);
    } catch (err) {
      throw new RpcException({
        code: status.INTERNAL,
        message: `Failed to update wish with ID ${data.id}`,
      });
    }
  }

  async deleteWishById(id: string): Promise<WishResponse> {
    if (!isObjectId(id)) {
      throw new RpcException({
        code: status.INVALID_ARGUMENT,
        message: `Invalid ID format: ${id}`,
      });
    }

    const wish = await this.wishRepository.findOne({ where: { id } });
    if (!wish) {
      throw new RpcException({
        code: status.NOT_FOUND,
        message: `Wish with ID ${id} not found`,
      });
    }

    try {
      // Store the response before removing to preserve the ID
      const response = this.mapToResponse(wish);
      await this.wishRepository.remove(wish);
      // Invalidate caches for removed wish
      try {
        await this.clearCacheForWish(wish);
      } catch (e) {
        // eslint-disable-next-line no-console
        console.warn(`Redis cache invalidation failed: ${e?.message ?? e}`);
      }
      return response;
    } catch (err) {
      throw new RpcException({
        code: status.INTERNAL,
        message: `Failed to delete wish with ID ${id}`,
      });
    }
  }

  private async clearCacheForWish(wish: Wish): Promise<void> {
    if (!this.redisClient) return;
    try {
      const keys = [
        `wishes:list:all:all`,
        `wishes:list:${wish.shrineId}:all`,
        `wishes:list:all:${wish.wisherId}`,
        `wishes:list:${wish.shrineId}:${wish.wisherId}`,
      ];
      // Delete the specific keys; ignore errors
      await this.redisClient.del(...keys);
    } catch (e) {
      // swallow errors, caller will log
      throw e;
    }
  }

  private async validateShrine(shrineId: string): Promise<void> {
    if (!isObjectId(shrineId)) {
      throw new RpcException({
        code: status.INVALID_ARGUMENT,
        message: `Invalid shrine ID format: ${shrineId}`,
      });
    }

    try {
      await firstValueFrom(this.shrineService.findShrineById({ id: shrineId }));
    } catch (err) {
      throw new RpcException({
        code: status.INVALID_ARGUMENT,
        message: `Shrine with ID ${shrineId} does not exist`,
      });
    }
  }

  private mapToResponse(wish: Wish): WishResponse {
    return {
      id: wish.id,
      wisherId: wish.wisherId,
      shrineId: wish.shrineId,
      wisherName: wish.wisherName,
      description: wish.description,
      public: wish.public,
      createdAt: wish.createdAt.toISOString(),
      updatedAt: wish.updatedAt.toISOString(),
    };
  }

  async getShrineWishCount(shrineId: string) {
    try {
      // Get all wishes for this shrine
      const allWishes = await this.wishRepository.find({
        where: { shrineId },
      });

      // Get recent wishes (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const recentWishes = allWishes.filter(
        (wish) => new Date(wish.createdAt) >= thirtyDaysAgo,
      );

      // Calculate popular categories
      const categoryCount: Record<string, number> = {};
      allWishes.forEach((wish) => {
        if (wish.category) {
          categoryCount[wish.category] =
            (categoryCount[wish.category] || 0) + 1;
        }
      });

      // Sort and get top 3 categories
      const popularCategories = Object.entries(categoryCount)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3)
        .map(([category, count]) => ({ category, count }));

      return {
        shrineId,
        totalWishes: allWishes.length,
        recentWishesCount: recentWishes.length,
        popularCategories,
      };
    } catch (err) {
      throw new RpcException({
        code: status.INTERNAL,
        message: 'Failed to get shrine wish count',
      });
    }
  }
}
