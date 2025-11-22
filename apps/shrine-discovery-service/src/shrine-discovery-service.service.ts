import { Injectable, Inject, OnModuleInit, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RpcException } from '@nestjs/microservices';
import type { ClientGrpc } from '@nestjs/microservices';
import {
  RecommendShrineRequest,
  RecommendShrineResponse,
  GetNearbyShrineRequest,
  SearchByCategoryRequest,
  ShrinesListResponse,
  ShrineRecommendation,
  ShrineDiscoveryServiceController,
} from '@app/shared/interfaces/shrine-discovery';
import { ShrineServiceClient } from '@app/shared/interfaces/shrine';
import {
  ShrineDiscoveryEntity,
  ShrineDiscoveryDocument,
} from './schemas/shrine-discovery.schema';
import { status } from '@grpc/grpc-js';
import { lastValueFrom } from 'rxjs';
import { LocationServiceClient } from '@app/shared/interfaces/location';

@Injectable()
export class ShrineDiscoveryService
  implements ShrineDiscoveryServiceController, OnModuleInit
{
  private shrineService: ShrineServiceClient;
  private ratingService: any;
  private wishingService: any;

  private locationService: LocationServiceClient;
  private readonly logger = new Logger(ShrineDiscoveryService.name);
  constructor(
    @InjectModel(ShrineDiscoveryEntity.name)
    private shrineDiscoveryModel: Model<ShrineDiscoveryDocument>,
    @Inject('SHRINE_SERVICE') private shrineClient: ClientGrpc,
    @Inject('RATING_SERVICE') private ratingClient: ClientGrpc,
    @Inject('WISHING_SERVICE') private wishingClient: ClientGrpc,
    @Inject('LOCATION_SERVICE') private locationClient: ClientGrpc,
  ) {}

  onModuleInit() {
    this.shrineService =
      this.shrineClient.getService<ShrineServiceClient>('ShrineService');
    this.ratingService = this.ratingClient.getService('RatingService');
    this.wishingService = this.wishingClient.getService('WishingService');
    this.locationService = 
      this.locationClient.getService<LocationServiceClient>('LocationService');
  }

  async recommendShrine(
    request: RecommendShrineRequest,
  ): Promise<RecommendShrineResponse> {
    try {
      // Categorize the wish using simple keyword matching (can be replaced with AI)
      const categorizedWish = this.categorizeWish(
        request.wishText,
        request.wishCategory,
      );

      // Get all shrines from shrine service
      const shrinesResponse = await lastValueFrom(
        this.shrineService.findAllShrines({}),
      );

      if (!shrinesResponse || !shrinesResponse.shrines) {
        return {
          recommendations: [],
          categorizedWish,
        };
      }

      // Filter and score shrines based on category and location
      const recommendations = await this.scoreAndRankShrines(
        shrinesResponse.shrines,
        categorizedWish,
        request.latitude,
        request.longitude,
        request.maxDistanceKm || 10,
      );

      // Save recommendation history
      await this.saveRecommendationHistory(
        request.userId,
        categorizedWish,
        recommendations,
      );

      return {
        recommendations: recommendations.slice(0, 5), // Return top 5
        categorizedWish,
      };
    } catch (error) {
      throw new RpcException({
        code: status.INTERNAL,
        message: `Failed to recommend shrine: ${error.message}`,
      });
    }
  }

  async getNearbyShrine(
    request: GetNearbyShrineRequest,
  ): Promise<ShrinesListResponse> {
    try {
      // Default radius to 10km if not provided
      const radiusKm = request.radiusKm || 10;
      
      // Get all shrines
      const shrinesResponse = await lastValueFrom(
        this.shrineService.findAllShrines({}),
      );

      if (!shrinesResponse || !shrinesResponse.shrines) {
        return { shrines: [] };
      }

      const nearbyShrines: any[] = [];
      // Filter by distance and sort
      for (const shrine of shrinesResponse.shrines) {
        if(!shrine.location) continue;
        try {
          const distanceResult = await lastValueFrom( this.locationService.getDistance({
            origin: request.location,
            destination: shrine.location,
          }));
          
          const distanceKm = distanceResult.distanceValue / 1000;
          
          if(distanceResult.distanceValue > radiusKm * 1000) {
            this.logger.debug(`Shrine ${shrine.name} is too far (${distanceKm}km > ${radiusKm}km), skipping`);
            continue;
          }
          nearbyShrines.push({
            ...shrine,
            distanceKm: distanceKm,
            durationText: distanceResult.durationText,
            durationValue: distanceResult.durationValue,
          });
        } catch (err) {
          this.logger.error(`Failed to get distance for shrine ${shrine.name}:`, err.message || err);
          continue;
        }
      }

      // Fetch ratings for all nearby shrines to enhance sorting and display
      const shrineIds = nearbyShrines.map(s => s.id);
      let ratingsMap: Record<string, any> = {};
      
      if (shrineIds.length > 0) {
        try {
          ratingsMap = await this.getRatingsForShrines(shrineIds);
        } catch (error) {
          this.logger.warn('Failed to fetch ratings, continuing without them:', error.message);
        }
      }
      
      // Enrich shrines with rating data
      const enrichedShrines = nearbyShrines.map(shrine => ({
        ...shrine,
        rating: ratingsMap[shrine.id]?.averageRating || 0,
        totalRatings: ratingsMap[shrine.id]?.totalReviews || 0,
      }));

      // Sort based on criteria
      const sortedShrines = this.sortShrines(
        enrichedShrines,
        request.sortBy || 'distance',
      );

      return {
        shrines: sortedShrines.map((shrine) =>
          this.mapToShrineRecommendation(shrine),
        ),
      };
    } catch (error) {
      throw new RpcException({
        code: status.INTERNAL,
        message: `Failed to get nearby shrines: ${error.message}`,
      });
    }
  }

  async searchShrinesByCategory(
    request: SearchByCategoryRequest,
  ): Promise<ShrinesListResponse> {
    try {
      // Get all shrines
      const shrinesResponse = await lastValueFrom(
        this.shrineService.findAllShrines({}),
      );

      if (!shrinesResponse || !shrinesResponse.shrines) {
        return { shrines: [] };
      }

      // Filter by category and location
      let filteredShrines = this.filterByCategory(
        shrinesResponse.shrines,
        request.category,
      );

      if (request.latitude && request.longitude) {
        filteredShrines = await this.filterByDistance(
          filteredShrines,
          request.latitude,
          request.longitude,
          50, // Default 50km for category search
        );
      }

      // Fetch ratings for filtered shrines
      const shrineIds = filteredShrines.map(s => s.id);
      let ratingsMap: Record<string, any> = {};
      
      if (shrineIds.length > 0) {
        try {
          ratingsMap = await this.getRatingsForShrines(shrineIds);
        } catch (error) {
          this.logger.warn('Failed to fetch ratings for category search:', error.message);
        }
      }
      
      // Enrich shrines with rating data
      const enrichedShrines = filteredShrines.map(shrine => ({
        ...shrine,
        rating: ratingsMap[shrine.id]?.averageRating || 0,
        totalRatings: ratingsMap[shrine.id]?.totalReviews || 0,
      }));

      return {
        shrines: enrichedShrines.map((shrine) =>
          this.mapToShrineRecommendation(shrine),
        ),
      };
    } catch (error) {
      throw new RpcException({
        code: status.INTERNAL,
        message: `Failed to search shrines by category: ${error.message}`,
      });
    }
  }

  // Helper methods
  private categorizeWish(wishText: string, providedCategory?: string): string {
    if (providedCategory) {
      return providedCategory;
    }

    const text = wishText.toLowerCase();

    // Simple keyword-based categorization (can be enhanced with AI/ML)
    if (
      text.includes('love') ||
      text.includes('relationship') ||
      text.includes('marriage')
    ) {
      return 'love';
    }
    if (
      text.includes('money') ||
      text.includes('wealth') ||
      text.includes('rich') ||
      text.includes('财')
    ) {
      return 'wealth';
    }
    if (
      text.includes('job') ||
      text.includes('career') ||
      text.includes('work') ||
      text.includes('business')
    ) {
      return 'career';
    }
    if (
      text.includes('health') ||
      text.includes('heal') ||
      text.includes('sick')
    ) {
      return 'health';
    }

    return 'general';
  }

  private async scoreAndRankShrines(
    shrines: any[],
    category: string,
    latitude?: number,
    longitude?: number,
    maxDistance?: number,
  ): Promise<ShrineRecommendation[]> {
    const recommendations: ShrineRecommendation[] = [];

    for (const shrine of shrines) {
      let score = 50; // Base score
      let reason = 'General recommendation';

      // Category matching (simplified - in real implementation, this would come from shrine data)
      const shrineCategories = this.getShrineCategories(shrine);
      if (shrineCategories.includes(category)) {
        score += 30;
        reason = `Specializes in ${category} wishes`;
      }

      // Distance calculation
      let distance = 0;
      if (latitude && longitude) {
        distance = await this.calculateDistance(latitude, longitude, shrine.location);
        if (distance <= maxDistance!) {
          score += Math.max(0, 20 - distance * 2); // Closer = higher score
        } else {
          continue; // Skip if too far
        }
      }

      // Rating (mock - would come from rating service)
      const rating = Math.random() * 5; // Mock rating

      recommendations.push({
        shrineId: shrine.id,
        shrineName: shrine.name,
        description: shrine.description,
        location: shrine.location,
        rating,
        distanceKm: distance,
        durationText: shrine.durationText,
        category,
        matchScore: Math.min(100, score),
        reason,
      });
    }

    // Sort by match score
    return recommendations.sort((a, b) => b.matchScore - a.matchScore);
  }

  private getShrineCategories(shrine: any): string[] {
    const categories: string[] = [];
    
    // Priority 1: Use the actual category field from shrine if available
    if (shrine.category && shrine.category.trim() !== '') {
      categories.push(shrine.category.toLowerCase().trim());
    }
    
    // Priority 2: Derive additional categories from shrine name and description
    const text = `${shrine.name || ''} ${shrine.description || ''}`.toLowerCase();
    
    // Category keyword mapping
    const categoryKeywords = {
      love: ['love', 'romance', 'relationship', 'marriage', 'dating', 'partner', 'soulmate'],
      wealth: ['wealth', 'money', 'prosperity', 'fortune', 'rich', 'financial', 'business'],
      career: ['career', 'job', 'work', 'employment', 'promotion', 'professional'],
      health: ['health', 'healing', 'wellness', 'medical', 'disease', 'longevity', 'vitality'],
      education: ['study', 'learning', 'knowledge', 'exam', 'academic', 'wisdom', 'school'],
    };
    
    // Check for category keywords in text (only if not already added)
    for (const [category, keywords] of Object.entries(categoryKeywords)) {
      if (!categories.includes(category) && keywords.some(keyword => text.includes(keyword))) {
        categories.push(category);
      }
    }
    
    // If no specific category found, assign 'general'
    if (categories.length === 0) {
      categories.push('general');
    }
    
    return categories;
  }

  private async calculateDistance(
    lat1: number,
    lon1: number,
    location: string,
  ): Promise<number> {
    this.logger.debug(`Checking shrine location: `);
    this.logger.debug(location);
    
    // Check if the shrine has lat/lng coordinates already
    if (!location) {
      this.logger.warn('Shrine has no location, cannot calculate distance');
      return 999; // Return large distance for shrines without location
    }

    try {
      // Use location service to get distance
      const origin = `${lat1},${lon1}`;
      const destination = location;
      
      this.logger.debug(`Calculating distance from ${origin} to ${destination}`);
      
      const distanceResponse = await lastValueFrom(
        this.locationService.getDistance({ origin, destination }),
      );
      
      this.logger.debug(`Distance result: ${distanceResponse.distanceText} (${distanceResponse.distanceValue}m)`);
      
      // Convert meters to kilometers
      const distanceKm = distanceResponse.distanceValue / 1000;
      return distanceKm;
    } catch (error) {
      this.logger.error(`Failed to calculate distance for location "${location}":`, error.message);
      return 999; // Return large distance on error
    }
  }

  private async filterByDistance(
    shrines: any[],
    lat: number,
    lon: number,
    radiusKm: number,
  ): Promise<any[]> {
    const filtered: any[] = [];
    for (const shrine of shrines) {
      const distance = await this.calculateDistance(lat, lon, shrine.location);
      if (distance <= radiusKm) {
        filtered.push(shrine);
      }
    }
    return filtered;
  }

  private filterByCategory(shrines: any[], category: string): any[] {
    return shrines.filter((shrine) => {
      const categories = this.getShrineCategories(shrine);
      return categories.includes(category);
    });
  }

  private sortShrines(shrines: any[], sortBy: string): any[] {
    const sorted = [...shrines];
    
    switch (sortBy?.toLowerCase()) {
      case 'distance':
        sorted.sort((a, b) => (a.distanceKm || 0) - (b.distanceKm || 0));
        break;
      case 'rating':
        sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'popularity':
        // Sort by combination of ratings count and wishes count
        sorted.sort((a, b) => {
          const aPopularity = (a.totalRatings || 0) + (a.totalWishes || 0);
          const bPopularity = (b.totalRatings || 0) + (b.totalWishes || 0);
          return bPopularity - aPopularity;
        });
        break;
      default:
        // Default: sort by distance if available, otherwise keep original order
        sorted.sort((a, b) => (a.distanceKm || 999) - (b.distanceKm || 999));
        break;
    }
    
    return sorted;
  }

  private mapToShrineRecommendation(shrine: any): ShrineRecommendation {
    // Extract categories from shrine data or use default
    const categories = this.getShrineCategories(shrine);
    const primaryCategory = categories.length > 0 ? categories[0] : 'general';
    
    // Use actual rating if available, otherwise use 0
    const rating = shrine.rating || shrine.averageRating || 0;
    
    // Calculate match score based on available data
    let matchScore = 50; // Base score
    if (rating >= 4.5) matchScore += 30;
    else if (rating >= 4.0) matchScore += 20;
    else if (rating >= 3.5) matchScore += 10;
    
    if (shrine.distanceKm && shrine.distanceKm <= 5) matchScore += 20;
    else if (shrine.distanceKm && shrine.distanceKm <= 10) matchScore += 10;
    
    // Generate reason based on shrine attributes
    let reason = 'Available shrine in your area';
    if (rating >= 4.5 && shrine.distanceKm && shrine.distanceKm <= 10) {
      reason = `Highly rated shrine (${rating.toFixed(1)}★) nearby`;
    } else if (rating >= 4.0) {
      reason = `Well-rated shrine for ${primaryCategory} wishes`;
    } else if (shrine.distanceKm && shrine.distanceKm <= 5) {
      reason = 'Very close to your location';
    }
    
    return {
      shrineId: shrine.id,
      shrineName: shrine.name,
      description: shrine.description,
      location: shrine.location,
      rating: rating,
      distanceKm: shrine.distanceKm || 0,
      durationText: shrine.durationText || '',
      category: primaryCategory,
      matchScore: Math.min(matchScore, 100),
      reason: reason,
    };
  }

  private async saveRecommendationHistory(
    userId: string,
    category: string,
    recommendations: ShrineRecommendation[],
  ): Promise<void> {
    try {
      const history = new this.shrineDiscoveryModel({
        userId,
        category,
        recommendations: recommendations.map((r) => ({
          shrineId: r.shrineId,
          matchScore: r.matchScore,
        })),
        createdAt: new Date(),
      });
      await history.save();
    } catch (error) {
      // Log error but don't fail the request
      console.error('Failed to save recommendation history:', error);
    }
  }

  // ========== NEW METHODS FOR ENHANCED FEATURES ==========

  async searchShrines(request: any): Promise<any> {
    try {
      const {
        query,
        category = [],
        shrineType,
        latitude,
        longitude,
        maxDistance = 50,
        minRating = 0,
        sortBy = 'name',
        sortOrder = 'asc',
        page = 1,
        limit = 20,
      } = request;

      // Get all shrines from shrine service
      const shrinesResponse = await lastValueFrom(
        this.shrineService.findAllShrines({}),
      );

      if (!shrinesResponse || !shrinesResponse.shrines) {
        return {
          shrines: [],
          total: 0,
          page,
          totalPages: 0,
        };
      }

      this.logger.debug(`Received ${shrinesResponse.shrines.length} shrines from shrine service`);
      
      // Debug: Check first shrine
      if (shrinesResponse.shrines.length > 0) {
        const firstShrine = shrinesResponse.shrines[0];
        this.logger.debug('First shrine from service:', JSON.stringify({
          id: firstShrine.id,
          name: firstShrine.name,
          imageUrl: firstShrine.imageUrl,
          hasImageUrl: !!firstShrine.imageUrl,
        }));
      }

      let filteredShrines: any[] = shrinesResponse.shrines as any[];

      // Text search filter
      if (query) {
        const lowerQuery = query.toLowerCase();
        filteredShrines = filteredShrines.filter(
          (shrine) =>
            shrine.name.toLowerCase().includes(lowerQuery) ||
            shrine.description?.toLowerCase().includes(lowerQuery),
        );
      }

      // Category filter
      if (category && category.length > 0) {
        filteredShrines = filteredShrines.filter((shrine) => {
          const shrineCategories = this.getShrineCategories(shrine);
          return category.some((cat) => shrineCategories.includes(cat));
        });
      }

      // Shrine type filter
      if (shrineType) {
        filteredShrines = filteredShrines.filter(
          (shrine) =>
            shrine.shrineType?.toLowerCase() === shrineType.toLowerCase(),
        );
      }

      // Get ratings and wishes for all shrines
      const shrineIds = filteredShrines.map((s) => s.id);
      const ratingsMap = await this.getRatingsForShrines(shrineIds);
      const wishesMap = await this.getWishesForShrines(shrineIds);

      // Add stats to shrines and apply filters
      let shrinesWithStats = filteredShrines.map((shrine) => {
        const ratingStats = ratingsMap[shrine.id] || {
          averageRating: 0,
          totalReviews: 0,
        };
        const wishStats = wishesMap[shrine.id] || { totalWishes: 0 };

        // Debug: Log first shrine to see what fields are available
        if (shrine.id === filteredShrines[0].id) {
          this.logger.debug('First filtered shrine keys:', Object.keys(shrine));
          this.logger.debug('First filtered shrine imageUrl:', shrine.imageUrl);
          this.logger.debug('Has imageUrl:', !!shrine.imageUrl);
        }

        const mapped = {
          id: shrine.id,
          name: shrine.name,
          description: shrine.description || '',
          category: this.getShrineCategories(shrine),
          shrineType: shrine.shrineType || '',
          latitude: shrine.lat || 0,
          longitude: shrine.lng || 0,
          distance: 0,
          averageRating: ratingStats.averageRating,
          totalReviews: ratingStats.totalReviews,
          totalWishes: wishStats.totalWishes,
          photoUrl: shrine.imageUrl || '',  // Proto uses photoUrl, shrine service uses imageUrl
        };
        
        // Debug: Log mapped result for first shrine
        if (shrine.id === filteredShrines[0].id) {
          this.logger.debug('First shrine after mapping:', JSON.stringify({
            id: mapped.id,
            name: mapped.name,
            photoUrl: mapped.photoUrl,
            hasPhotoUrl: !!mapped.photoUrl,
          }));
        }
        
        return mapped;
      });

      // Distance filter and calculation
      if (latitude && longitude) {
        shrinesWithStats = shrinesWithStats.map((shrine) => ({
          ...shrine,
          distance: this.calculateDistanceWithHaversine(
            latitude,
            longitude,
            shrine.latitude,
            shrine.longitude,
          ),
        }));

        // Filter by max distance
        shrinesWithStats = shrinesWithStats.filter(
          (shrine) => shrine.distance <= maxDistance,
        );
      }

      // Rating filter
      shrinesWithStats = shrinesWithStats.filter(
        (shrine) => shrine.averageRating >= minRating,
      );

      // Sorting
      shrinesWithStats = this.sortShrinesEnhanced(
        shrinesWithStats,
        sortBy,
        sortOrder,
      );

      // Pagination
      const total = shrinesWithStats.length;
      const totalPages = Math.ceil(total / limit);
      const offset = (page - 1) * limit;
      const paginatedShrines = shrinesWithStats.slice(offset, offset + limit);

      // Debug: Log final paginated result
      if (paginatedShrines.length > 0) {
        this.logger.debug('First paginated shrine:', JSON.stringify({
          id: paginatedShrines[0].id,
          name: paginatedShrines[0].name,
          photoUrl: paginatedShrines[0].photoUrl,
          hasPhotoUrl: !!paginatedShrines[0].photoUrl,
        }));
      }

      return {
        shrines: paginatedShrines,
        total,
        page,
        totalPages,
      };
    } catch (error) {
      throw new RpcException({
        code: status.INTERNAL,
        message: `Failed to search shrines: ${error.message}`,
      });
    }
  }

  async recommendShrines(request: any): Promise<any> {
    try {
      const {
        userId,
        category,
        latitude,
        longitude,
        maxDistance = 30,
        limit = 10,
      } = request;

      // Get all shrines
      const shrinesResponse = await lastValueFrom(
        this.shrineService.findAllShrines({}),
      );

      if (!shrinesResponse || !shrinesResponse.shrines) {
        return { recommendations: [] };
      }

      let shrines: any[] = shrinesResponse.shrines as any[];

      // Filter by category
      shrines = shrines.filter((shrine) => {
        const categories = this.getShrineCategories(shrine);
        return categories.includes(category);
      });

      // Get ratings and wishes for shrines
      const shrineIds = shrines.map((s) => s.id);
      const ratingsMap = await this.getRatingsForShrines(shrineIds);
      const wishesMap = await this.getWishesForShrines(shrineIds);

      // Calculate match scores
      const recommendations = shrines.map((shrine) => {
        const ratingStats = ratingsMap[shrine.id] || {
          averageRating: 0,
          totalReviews: 0,
        };
        const wishStats = wishesMap[shrine.id] || { totalWishes: 0 };

        // Rule-based scoring
        let matchScore = 0;
        const scoringDetails: string[] = [];

        // Category Match (40 points)
        const shrineCategories = this.getShrineCategories(shrine);
        if (shrineCategories.includes(category)) {
          matchScore += 40;
          scoringDetails.push('category match');
        }

        // Rating Score (30 points)
        const avgRating = ratingStats.averageRating;
        if (avgRating >= 4.5) {
          matchScore += 30;
          scoringDetails.push('excellent rating');
        } else if (avgRating >= 4.0) {
          matchScore += 25;
          scoringDetails.push('high rating');
        } else if (avgRating >= 3.5) {
          matchScore += 20;
          scoringDetails.push('good rating');
        } else if (avgRating >= 3.0) {
          matchScore += 15;
        } else if (avgRating > 0) {
          matchScore += 10;
        } else {
          matchScore += 5; // No ratings yet
        }

        // Popularity Score (20 points)
        const totalActivity = ratingStats.totalReviews + wishStats.totalWishes;
        if (totalActivity >= 100) {
          matchScore += 20;
          scoringDetails.push('very popular');
        } else if (totalActivity >= 50) {
          matchScore += 15;
          scoringDetails.push('popular');
        } else if (totalActivity >= 20) {
          matchScore += 10;
        } else if (totalActivity >= 10) {
          matchScore += 5;
        } else {
          matchScore += 2;
        }

        // Distance Score (10 points)
        let distance = 0;
        if (latitude && longitude) {
          distance = this.calculateDistanceWithHaversine(
            latitude,
            longitude,
            shrine.latitude || 0,
            shrine.longitude || 0,
          );

          if (distance <= 5) {
            matchScore += 10;
            scoringDetails.push('very close');
          } else if (distance <= 10) {
            matchScore += 8;
            scoringDetails.push('nearby');
          } else if (distance <= 20) {
            matchScore += 5;
          } else if (distance <= 30) {
            matchScore += 3;
          }
        }

        // Generate reason string
        let reason = `Popular shrine for ${category} wishes`;
        if (avgRating >= 4.5) {
          reason = `High rated shrine (${avgRating.toFixed(1)}★) specializing in ${category} blessings`;
        } else if (avgRating >= 4.0) {
          reason = `Highly rated (${avgRating.toFixed(1)}★) for ${category} wishes`;
        } else if (totalActivity >= 100) {
          reason = `Most popular for ${category} wishes (${totalActivity}+ wishes)`;
        } else if (distance > 0 && distance <= 5) {
          reason = `Nearby shrine (${distance.toFixed(1)}km) with excellent ${category} blessings`;
        } else if (scoringDetails.length > 0) {
          reason = `${scoringDetails.join(', ')} - great for ${category}`;
        }

        return {
          id: shrine.id,
          name: shrine.name,
          description: shrine.description || '',
          category: shrineCategories,
          matchScore,
          averageRating: avgRating,
          totalReviews: ratingStats.totalReviews,
          totalWishes: wishStats.totalWishes,
          distance: distance || undefined,
          reason,
        };
      });

      // Filter by distance if provided
      let filteredRecommendations = recommendations;
      if (latitude && longitude) {
        filteredRecommendations = recommendations.filter(
          (r) => r.distance! <= maxDistance,
        );
      }

      // Sort by match score
      filteredRecommendations.sort((a, b) => b.matchScore - a.matchScore);

      // Return top N
      return {
        recommendations: filteredRecommendations.slice(0, limit),
      };
    } catch (error) {
      throw new RpcException({
        code: status.INTERNAL,
        message: `Failed to recommend shrines: ${error.message}`,
      });
    }
  }

  async getShrineAggregatedStats(request: any): Promise<any> {
    try {
      const { shrineId } = request;

      // Get rating stats
      const ratingStats: any = await lastValueFrom(
        this.ratingService.getShrineStats({ shrineId }),
      );

      // Get wish stats
      const wishStats: any = await lastValueFrom(
        this.wishingService.getShrineWishCount({ shrineId }),
      );

      return {
        id: shrineId,
        averageRating: ratingStats.averageRating || 0,
        totalReviews: ratingStats.totalReviews || 0,
        ratingDistribution: ratingStats.ratingDistribution || {
          five: 0,
          four: 0,
          three: 0,
          two: 0,
          one: 0,
        },
        totalWishes: wishStats.totalWishes || 0,
        recentWishesCount: wishStats.recentWishesCount || 0,
        popularCategories: wishStats.popularCategories || [],
      };
    } catch (error) {
      throw new RpcException({
        code: status.INTERNAL,
        message: `Failed to get shrine stats: ${error.message}`,
      });
    }
  }

  // Helper methods for new features
  private async getRatingsForShrines(
    shrineIds: string[],
  ): Promise<Record<string, any>> {
    try {
      const response: any = await lastValueFrom(
        this.ratingService.getMultipleShrineStats({ shrineIds }),
      );

      const ratingsMap: Record<string, any> = {};
      if (response && response.stats) {
        response.stats.forEach((stat: any) => {
          ratingsMap[stat.shrineId] = {
            averageRating: stat.averageRating,
            totalReviews: stat.totalReviews,
          };
        });
      }
      return ratingsMap;
    } catch (error) {
      console.error('Failed to get ratings:', error);
      return {};
    }
  }

  private async getWishesForShrines(
    shrineIds: string[],
  ): Promise<Record<string, any>> {
    try {
      const wishesMap: Record<string, any> = {};

      // Get wish counts for each shrine (in parallel)
      const promises = shrineIds.map(async (shrineId) => {
        try {
          const wishStats: any = await lastValueFrom(
            this.wishingService.getShrineWishCount({ shrineId }),
          );
          wishesMap[shrineId] = {
            totalWishes: wishStats.totalWishes || 0,
          };
        } catch (error) {
          wishesMap[shrineId] = { totalWishes: 0 };
        }
      });

      await Promise.all(promises);
      return wishesMap;
    } catch (error) {
      console.error('Failed to get wishes:', error);
      return {};
    }
  }

  private calculateDistanceWithHaversine(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number {
    const R = 6371; // Earth's radius in km
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) *
        Math.cos(this.toRadians(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return Math.round(distance * 10) / 10; // Round to 1 decimal
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  private sortShrinesEnhanced(
    shrines: any[],
    sortBy: string,
    sortOrder: string,
  ): any[] {
    const multiplier = sortOrder === 'desc' ? -1 : 1;

    return shrines.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'distance':
          comparison = (a.distance || 0) - (b.distance || 0);
          break;
        case 'rating':
          comparison = a.averageRating - b.averageRating;
          break;
        case 'popularity':
          const popA = a.totalWishes + a.totalReviews;
          const popB = b.totalWishes + b.totalReviews;
          comparison = popA - popB;
          break;
        case 'name':
        default:
          comparison = a.name.localeCompare(b.name);
          break;
      }

      return comparison * multiplier;
    });
  }
}
