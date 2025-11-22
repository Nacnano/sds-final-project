import React, { useState } from 'react';
import ratingService from '../services/ratingService';
import type { CreateRatingRequest } from '../types';

interface RatingModalProps {
  shrineId: string;
  shrineName: string;
  userId: string;
  existingRating?: {
    id: string;
    rating: number;
    review?: string;
    isAnonymous: boolean;
  };
  onClose: () => void;
  onSuccess: () => void;
}

const RatingModal: React.FC<RatingModalProps> = ({
  shrineId,
  shrineName,
  userId,
  existingRating,
  onClose,
  onSuccess,
}) => {
  const [rating, setRating] = useState(existingRating?.rating || 0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [review, setReview] = useState(existingRating?.review || '');
  const [isAnonymous, setIsAnonymous] = useState(existingRating?.isAnonymous || false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0) {
      setError('Please select a rating');
      return;
    }

    if (review.length > 500) {
      setError('Review must be 500 characters or less');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const data: CreateRatingRequest = {
        userId,
        shrineId,
        rating,
        review: review.trim() || undefined,
        isAnonymous,
      };

      await ratingService.createOrUpdateRating(data);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit rating');
    } finally {
      setLoading(false);
    }
  };

  const renderStars = () => {
    const displayRating = hoveredRating || rating;

    return (
      <div className="flex gap-2 justify-center mb-6">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            onMouseEnter={() => setHoveredRating(star)}
            onMouseLeave={() => setHoveredRating(0)}
            className="focus:outline-none transition-transform hover:scale-110"
          >
            <svg
              className={`w-12 h-12 ${
                star <= displayRating ? 'text-yellow-400' : 'text-gray-300'
              }`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </button>
        ))}
      </div>
    );
  };

  const getRatingLabel = () => {
    const labels = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];
    return labels[hoveredRating || rating] || 'Select a rating';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold">Rate {shrineName}</h2>
              <p className="text-gray-600 mt-1">
                {existingRating ? 'Update your rating' : 'Share your experience'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            {/* Star Rating */}
            <div className="mb-6">
              {renderStars()}
              <p className="text-center text-lg font-medium text-gray-700">
                {getRatingLabel()}
              </p>
            </div>

            {/* Review Text */}
            <div className="mb-6">
              <label htmlFor="review" className="block text-sm font-medium text-gray-700 mb-2">
                Write a Review (Optional)
              </label>
              <textarea
                id="review"
                value={review}
                onChange={(e) => setReview(e.target.value)}
                placeholder="Share your thoughts about this shrine..."
                rows={6}
                maxLength={500}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
              <div className="flex justify-between mt-2">
                <p className="text-sm text-gray-500">Maximum 500 characters</p>
                <p className={`text-sm ${review.length > 500 ? 'text-red-600' : 'text-gray-500'}`}>
                  {review.length}/500
                </p>
              </div>
            </div>

            {/* Anonymous Checkbox */}
            <div className="mb-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Post anonymously</span>
              </label>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading || rating === 0}
              >
                {loading ? 'Submitting...' : existingRating ? 'Update Rating' : 'Submit Rating'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RatingModal;
