import React, { useState, useEffect } from 'react';
import ratingService from '../services/ratingService';
import type { ShrineStats, RatingItem } from '../types';

interface RatingDisplayProps {
  shrineId: string;
  onRateClick?: () => void;
}

const RatingDisplay: React.FC<RatingDisplayProps> = ({ shrineId, onRateClick }) => {
  const [stats, setStats] = useState<ShrineStats | null>(null);
  const [ratings, setRatings] = useState<RatingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'recent' | 'highest' | 'lowest'>('recent');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;

  useEffect(() => {
    loadStats();
    loadRatings();
  }, [shrineId, sortBy, page]);

  const loadStats = async () => {
    try {
      const data = await ratingService.getShrineStats(shrineId);
      setStats(data);
    } catch (error) {
      console.error('Failed to load rating stats:', error);
      setStats(null);
    }
  };

  const loadRatings = async () => {
    try {
      setLoading(true);
      const data = await ratingService.getShrineRatings(shrineId, {
        page,
        limit,
        sortBy,
      });
      setRatings(data?.ratings || []);
      setTotal(data?.total || 0);
    } catch (error) {
      console.error('Failed to load ratings:', error);
      setRatings([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating: number, size: 'sm' | 'md' | 'lg' = 'md') => {
    const sizeClasses = {
      sm: 'w-4 h-4',
      md: 'w-5 h-5',
      lg: 'w-6 h-6',
    };

    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`${sizeClasses[size]} ${
              star <= rating ? 'text-yellow-400' : 'text-gray-300'
            }`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    );
  };

  const renderStarDistribution = () => {
    if (!stats || !stats.distribution) return null;

    const maxCount = Math.max(...(stats.distribution?.map((d) => d.count) || [0]), 1);

    return (
      <div className="space-y-2">
        {[5, 4, 3, 2, 1].map((star) => {
          const dist = stats.distribution?.find((d) => d.star === star);
          const count = dist?.count || 0;
          const percentage = stats.totalRatings > 0 ? (count / stats.totalRatings) * 100 : 0;
          const barWidth = maxCount > 0 ? (count / maxCount) * 100 : 0;

          return (
            <div key={star} className="flex items-center gap-2">
              <span className="text-sm font-medium w-8">{star} ★</span>
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${barWidth}%` }}
                />
              </div>
              <span className="text-sm text-gray-600 w-12 text-right">
                {count} ({percentage.toFixed(0)}%)
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading && ratings.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-20 bg-gray-200 rounded mb-4"></div>
          <div className="h-40 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {/* Header with overall rating */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-2xl font-bold mb-2">Ratings & Reviews</h3>
          {stats && (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-4xl font-bold">{stats.averageRating.toFixed(1)}</span>
                {renderStars(Math.round(stats.averageRating), 'lg')}
              </div>
              <span className="text-gray-600">
                {stats.totalRatings} {stats.totalRatings === 1 ? 'rating' : 'ratings'}
              </span>
            </div>
          )}
        </div>
        {onRateClick && (
          <button
            onClick={onRateClick}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Rate This Shrine
          </button>
        )}
      </div>

      {/* Star distribution */}
      {stats && stats.totalRatings > 0 && (
        <div className="mb-8 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-semibold mb-4">Rating Distribution</h4>
          {renderStarDistribution()}
        </div>
      )}

      {/* Reviews list */}
      {ratings && ratings.length > 0 ? (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold">Reviews ({total})</h4>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'recent' | 'highest' | 'lowest')}
              className="border border-gray-300 rounded-lg px-3 py-1 text-sm"
            >
              <option value="recent">Most Recent</option>
              <option value="highest">Highest Rating</option>
              <option value="lowest">Lowest Rating</option>
            </select>
          </div>

          <div className="space-y-4">
            {ratings && ratings.length > 0 && ratings.map((rating) => (
              <div key={rating.id} className="border-b border-gray-200 pb-4 last:border-0">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      {renderStars(rating.rating, 'sm')}
                      <span className="text-sm text-gray-500">
                        {formatDate(rating.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      {rating.isAnonymous ? 'Anonymous' : (rating.userName || 'Unknown User')}
                    </p>
                  </div>
                </div>
                {rating.review && (
                  <p className="text-gray-700 mt-2">{rating.review}</p>
                )}
              </div>
            ))}
          </div>

          {/* Pagination */}
          {total > limit && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Previous
              </button>
              <span className="text-gray-600">
                Page {page} of {Math.ceil(total / limit)}
              </span>
              <button
                onClick={() => setPage(Math.min(Math.ceil(total / limit), page + 1))}
                disabled={page >= Math.ceil(total / limit)}
                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <p>No reviews yet. Be the first to rate this shrine!</p>
        </div>
      )}
    </div>
  );
};

export default RatingDisplay;
