import { Injectable, Inject, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RpcException } from '@nestjs/microservices';
import type { ClientGrpc } from '@nestjs/microservices';
import { RatingEntity } from './entities/rating.entity';
import { lastValueFrom } from 'rxjs';

// Temporary interfaces until proto generation works
interface UserServiceClient {
  findUserById(data: { id: string }): any;
}

interface ShrineServiceClient {
  findShrineById(data: { id: string }): any;
}

@Injectable()
export class RatingService implements OnModuleInit {
  private userService: UserServiceClient;
  private shrineService: ShrineServiceClient;

  constructor(
    @InjectRepository(RatingEntity)
    private readonly ratingRepository: Repository<RatingEntity>,
    @Inject('USER_SERVICE') private userClient: ClientGrpc,
    @Inject('SHRINE_SERVICE') private shrineClient: ClientGrpc,
  ) {}

  onModuleInit() {
    this.userService =
      this.userClient.getService<UserServiceClient>('UserService');
    this.shrineService =
      this.shrineClient.getService<ShrineServiceClient>('ShrineService');
  }

  async upsertRating(data: {
    userId: string;
    shrineId: string;
    rating: number;
    review?: string;
    isAnonymous?: boolean;
  }) {
    // Validate rating range
    if (data.rating < 1 || data.rating > 5) {
      throw new RpcException('Rating must be between 1 and 5');
    }

    // Validate review length
    if (data.review && data.review.length > 500) {
      throw new RpcException('Review must be 500 characters or less');
    }

    // Verify user exists
    try {
      await lastValueFrom(this.userService.findUserById({ id: data.userId }));
    } catch (error) {
      throw new RpcException('User not found');
    }

    // Verify shrine exists
    try {
      await lastValueFrom(
        this.shrineService.findShrineById({ id: data.shrineId }),
      );
    } catch (error) {
      throw new RpcException('Shrine not found');
    }

    // Find existing rating
    const existingRating = await this.ratingRepository.findOne({
      where: {
        userId: data.userId,
        shrineId: data.shrineId,
      },
    });

    let rating: RatingEntity;

    if (existingRating) {
      // Update existing rating
      existingRating.rating = data.rating;
      existingRating.review = data.review || undefined;
      existingRating.isAnonymous = data.isAnonymous || false;
      rating = await this.ratingRepository.save(existingRating);
    } else {
      // Create new rating
      rating = this.ratingRepository.create({
        userId: data.userId,
        shrineId: data.shrineId,
        rating: data.rating,
        review: data.review || undefined,
        isAnonymous: data.isAnonymous || false,
      });
      rating = await this.ratingRepository.save(rating);
    }

    return this.formatRatingResponse(rating);
  }

  async getShrineRatings(data: {
    shrineId: string;
    sortBy?: string;
    page?: number;
    limit?: number;
  }) {
    const page = data.page || 1;
    const limit = data.limit || 10;
    const offset = (page - 1) * limit;
    const sortBy = data.sortBy || 'recent';

    let orderBy: any = { createdAt: 'DESC' };
    if (sortBy === 'highest') {
      orderBy = { rating: 'DESC', createdAt: 'DESC' };
    } else if (sortBy === 'lowest') {
      orderBy = { rating: 'ASC', createdAt: 'DESC' };
    }

    const [ratings, total] = await this.ratingRepository.findAndCount({
      where: { shrineId: data.shrineId },
      order: orderBy,
      take: limit,
      skip: offset,
    });

    // Get user names for non-anonymous ratings
    const ratingsWithUserInfo = await Promise.all(
      ratings.map(async (rating) => {
        let userName: string = '';
        let userAvatar: string = '';

        if (!rating.isAnonymous) {
          try {
            const user: any = await lastValueFrom(
              this.userService.findUserById({ id: rating.userId }),
            );
            userName = user.email || 'Unknown User';
            userAvatar = user.avatar || '';
          } catch (error) {
            userName = 'Unknown User';
          }
        }

        return {
          id: rating.id,
          userId: rating.isAnonymous ? '' : rating.userId,
          userName,
          userAvatar,
          rating: rating.rating,
          review: rating.review || '',
          isAnonymous: rating.isAnonymous,
          createdAt: rating.createdAt.toISOString(),
        };
      }),
    );

    // Calculate average rating and total reviews
    const stats = await this.getShrineStats({ shrineId: data.shrineId });

    return {
      ratings: ratingsWithUserInfo,
      averageRating: stats.averageRating,
      totalReviews: stats.totalReviews,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getUserRatings(data: {
    userId: string;
    page?: number;
    limit?: number;
  }) {
    const page = data.page || 1;
    const limit = data.limit || 10;
    const offset = (page - 1) * limit;

    const [ratings, total] = await this.ratingRepository.findAndCount({
      where: { userId: data.userId },
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
    });

    // Get shrine information
    const ratingsWithShrineInfo = await Promise.all(
      ratings.map(async (rating) => {
        let shrineName = 'Unknown Shrine';
        let shrineProvince = '';

        try {
          const shrine: any = await lastValueFrom(
            this.shrineService.findShrineById({ id: rating.shrineId }),
          );
          shrineName = shrine.name || 'Unknown Shrine';
          shrineProvince = shrine.province || '';
        } catch (error) {
          // Shrine not found or error
        }

        return {
          id: rating.id,
          shrineId: rating.shrineId,
          shrineName,
          shrineProvince,
          rating: rating.rating,
          review: rating.review || '',
          createdAt: rating.createdAt.toISOString(),
        };
      }),
    );

    return {
      ratings: ratingsWithShrineInfo,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getShrineStats(data: { shrineId: string }) {
    const ratings = await this.ratingRepository.find({
      where: { shrineId: data.shrineId },
    });

    if (ratings.length === 0) {
      return {
        shrineId: data.shrineId,
        averageRating: 0,
        totalReviews: 0,
        ratingDistribution: {
          five: 0,
          four: 0,
          three: 0,
          two: 0,
          one: 0,
        },
      };
    }

    // Calculate average
    const sum = ratings.reduce((acc, r) => acc + r.rating, 0);
    const averageRating = Math.round((sum / ratings.length) * 10) / 10;

    // Calculate distribution
    const distribution = {
      five: ratings.filter((r) => r.rating === 5).length,
      four: ratings.filter((r) => r.rating === 4).length,
      three: ratings.filter((r) => r.rating === 3).length,
      two: ratings.filter((r) => r.rating === 2).length,
      one: ratings.filter((r) => r.rating === 1).length,
    };

    return {
      shrineId: data.shrineId,
      averageRating,
      totalReviews: ratings.length,
      ratingDistribution: distribution,
    };
  }

  async getMultipleShrineStats(data: { shrineIds: string[] }) {
    const stats = await Promise.all(
      data.shrineIds.map(async (shrineId) => {
        const stat = await this.getShrineStats({ shrineId });
        return {
          shrineId: stat.shrineId,
          averageRating: stat.averageRating,
          totalReviews: stat.totalReviews,
        };
      }),
    );

    return { stats };
  }

  async deleteRating(data: { id: string; userId: string }) {
    const rating = await this.ratingRepository.findOne({
      where: { id: data.id },
    });

    if (!rating) {
      throw new RpcException('Rating not found');
    }

    // Verify ownership
    if (rating.userId !== data.userId) {
      throw new RpcException(
        'Unauthorized: You can only delete your own ratings',
      );
    }

    await this.ratingRepository.remove(rating);

    return {
      success: true,
      message: 'Rating deleted successfully',
    };
  }

  private formatRatingResponse(rating: RatingEntity) {
    return {
      id: rating.id,
      userId: rating.userId,
      shrineId: rating.shrineId,
      rating: rating.rating,
      review: rating.review || '',
      isAnonymous: rating.isAnonymous,
      createdAt: rating.createdAt.toISOString(),
      updatedAt: rating.updatedAt.toISOString(),
    };
  }
}
