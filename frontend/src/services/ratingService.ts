import api from './api';

export interface CreateRatingRequest {
  userId: string;
  shrineId: string;
  rating: number;
  review?: string;
  isAnonymous?: boolean;
}

export interface RatingItem {
  id: string;
  userId: string;
  shrineId: string;
  rating: number;
  review?: string;
  isAnonymous: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ShrineRatingsResponse {
  ratings: RatingItem[];
  total: number;
  page: number;
  limit: number;
}

export interface RatingDistribution {
  star: number;
  count: number;
}

export interface ShrineStats {
  shrineId: string;
  averageRating: number;
  totalRatings: number;
  distribution: RatingDistribution[];
}

const ratingService = {
  /**
   * Create or update a rating for a shrine
   * @param data Rating data
   * @returns Created/updated rating
   */
  async createOrUpdateRating(data: CreateRatingRequest): Promise<RatingItem> {
    const response = await api.post('/ratings', data);
    return response.data;
  },

  /**
   * Get all ratings for a specific shrine
   * @param shrineId Shrine ID
   * @param params Query parameters (page, limit, sortBy)
   * @returns Paginated ratings
   */
  async getShrineRatings(
    shrineId: string,
    params?: {
      page?: number;
      limit?: number;
      sortBy?: 'recent' | 'highest' | 'lowest';
    }
  ): Promise<ShrineRatingsResponse> {
    const response = await api.get(`/ratings/shrine/${shrineId}`, { params });
    return response.data;
  },

  /**
   * Get all ratings by a specific user
   * @param userId User ID
   * @param params Query parameters (page, limit)
   * @returns Paginated ratings
   */
  async getUserRatings(
    userId: string,
    params?: {
      page?: number;
      limit?: number;
    }
  ): Promise<ShrineRatingsResponse> {
    const response = await api.get(`/ratings/user/${userId}`, { params });
    return response.data;
  },

  /**
   * Get statistics for a specific shrine
   * @param shrineId Shrine ID
   * @returns Rating statistics
   */
  async getShrineStats(shrineId: string): Promise<ShrineStats> {
    const response = await api.get(`/ratings/shrine/${shrineId}/stats`);
    return response.data;
  },

  /**
   * Delete a rating
   * @param ratingId Rating ID
   */
  async deleteRating(ratingId: string): Promise<void> {
    await api.delete(`/ratings/${ratingId}`);
  },
};

export default ratingService;
