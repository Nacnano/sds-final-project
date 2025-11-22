import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { discoveryService } from '../services/discoveryService';
import type { ShrineRecommendation } from '../types';
import { getShrineImageUrl } from '../utils/imageUtils';

const Discover: React.FC = () => {
  const navigate = useNavigate();
  
  // Filter state
  const [filters, setFilters] = useState({
    latitude: 13.7563,
    longitude: 100.5018,
    radius: 10,
    category: 'all',
    minRating: 0,
    sortBy: 'recommended',
  });

  const [results, setResults] = useState<ShrineRecommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [locationEnabled, setLocationEnabled] = useState(false);
  const [locationChecked, setLocationChecked] = useState(false);

  // Auto-detect user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFilters(prev => ({
            ...prev,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          }));
          setLocationEnabled(true);
          setLocationChecked(true);
        },
        (error) => {
          console.warn('Location access denied:', error);
          setLocationEnabled(false);
          setLocationChecked(true); // Still set to true, just with default location
        }
      );
    } else {
      // Geolocation not supported
      setLocationChecked(true);
    }
  }, []);

  const handleSearch = async () => {
    setLoading(true);
    try {
      // Use unified search endpoint with all filters
      const data = await discoveryService.search({
        category: filters.category === 'all' ? undefined : filters.category,
        latitude: filters.latitude,
        longitude: filters.longitude,
        maxDistance: filters.radius,
        minRating: filters.minRating > 0 ? filters.minRating : undefined,
        sortBy: filters.sortBy,
        limit: 100,
      });
      
      setResults(data.shrines || []);
    } catch (error) {
      console.error('Error searching shrines:', error);
      alert('Failed to search shrines. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Initial search on mount - wait for location check first
  useEffect(() => {
    if (locationChecked) {
      handleSearch();
    }
  }, [locationChecked]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">🔍 Discover Shrines</h1>
          <p className="text-gray-600 mt-2">
            Find shrines and temples near you based on location, ratings, and your spiritual needs
          </p>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <div className="card sticky top-8 space-y-6">
              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-4">Search Filters</h2>
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  📍 Location
                  {locationEnabled && <span className="text-green-600 text-xs ml-2">✓ Auto-detected</span>}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    step="0.0001"
                    value={filters.latitude}
                    onChange={(e) => setFilters({ ...filters, latitude: parseFloat(e.target.value) || 0 })}
                    className="input-field text-sm"
                    placeholder="Latitude"
                  />
                  <input
                    type="number"
                    step="0.0001"
                    value={filters.longitude}
                    onChange={(e) => setFilters({ ...filters, longitude: parseFloat(e.target.value) || 0 })}
                    className="input-field text-sm"
                    placeholder="Longitude"
                  />
                </div>
              </div>

              {/* Radius */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  📏 Search Radius: {filters.radius} km
                </label>
                <div className="flex gap-2 mb-2">
                  {[5, 10, 20, 50].map(km => (
                    <button
                      key={km}
                      onClick={() => setFilters({ ...filters, radius: km })}
                      className={`flex-1 px-2 py-1 text-xs rounded ${
                        filters.radius === km
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {km}km
                    </button>
                  ))}
                </div>
                <input
                  type="range"
                  min="1"
                  max="100"
                  value={filters.radius}
                  onChange={(e) => setFilters({ ...filters, radius: parseInt(e.target.value) })}
                  className="w-full"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">🎯 Wish Type</label>
                <select
                  value={filters.category}
                  onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                  className="input-field"
                >
                  <option value="all">All Categories</option>
                  <option value="love">💝 Love & Relationships</option>
                  <option value="career">💼 Career & Success</option>
                  <option value="wealth">💰 Wealth & Prosperity</option>
                  <option value="health">🏥 Health & Wellness</option>
                  <option value="education">📚 Education & Knowledge</option>
                </select>
              </div>

              {/* Minimum Rating */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">⭐ Minimum Rating</label>
                <div className="flex gap-2">
                  {[0, 3, 4, 5].map(rating => (
                    <button
                      key={rating}
                      onClick={() => setFilters({ ...filters, minRating: rating })}
                      className={`flex-1 px-2 py-1 text-xs rounded ${
                        filters.minRating === rating
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {rating === 0 ? 'Any' : `${rating}+`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sort By */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">📊 Sort By</label>
                <select
                  value={filters.sortBy}
                  onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
                  className="input-field"
                >
                  <option value="recommended">🌟 Recommended</option>
                  <option value="distance">📍 Distance</option>
                  <option value="rating">⭐ Rating</option>
                  <option value="popularity">🔥 Popularity</option>
                </select>
              </div>

              {/* Search Button */}
              <button
                onClick={handleSearch}
                disabled={loading}
                className="w-full btn-primary"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Searching...
                  </span>
                ) : (
                  '🔍 Search Shrines'
                )}
              </button>
            </div>
          </div>

          {/* Results */}
          <div className="lg:col-span-3">
            {/* Results Header */}
            <div className="mb-4 flex justify-between items-center">
              <p className="text-sm text-gray-600">
                {results.length > 0 ? (
                  <>Found <span className="font-semibold text-gray-900">{results.length}</span> shrines</>
                ) : (
                  loading ? 'Searching...' : 'No shrines found'
                )}
              </p>
            </div>

            {/* Results Grid */}
            {results.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-6">
                {results.map((shrine, index) => (
                  <div
                    key={index}
                    onClick={() => navigate(`/shrines/${shrine.shrineId}`)}
                    className="card hover:shadow-lg transition-all cursor-pointer group"
                  >
                    <div className="relative mb-4">
                      <img
                        src={getShrineImageUrl(shrine.shrineId, 400, 250, shrine.imageUrl)}
                        alt={shrine.shrineName}
                        className="w-full h-48 object-cover rounded-lg group-hover:scale-105 transition-transform"
                      />
                      {shrine.matchScore && shrine.matchScore > 70 && (
                        <span className="absolute top-2 right-2 px-3 py-1 bg-green-500 text-white rounded-full text-xs font-bold shadow-lg">
                          {shrine.matchScore.toFixed(0)}% Match
                        </span>
                      )}
                    </div>

                    <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
                      {shrine.shrineName}
                    </h3>
                    
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {shrine.description}
                    </p>

                    <div className="flex flex-wrap gap-3 text-xs text-gray-500 mb-3">
                      <span className="flex items-center">
                        📍 {shrine.distanceKm.toFixed(1)} km away
                      </span>
                      <span className="flex items-center">
                        ⭐ {shrine.rating.toFixed(1)}
                      </span>
                      <span className="flex items-center">
                        🏷️ {shrine.category}
                      </span>
                    </div>

                    {shrine.reason && (
                      <p className="text-xs text-primary-600 italic border-t pt-2">
                        💡 {shrine.reason}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="card text-center py-16">
                {loading ? (
                  <div className="flex flex-col items-center">
                    <svg className="animate-spin h-12 w-12 text-primary-600 mb-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <p className="text-gray-500">Searching for shrines...</p>
                  </div>
                ) : (
                  <div>
                    <p className="text-gray-500 text-lg mb-2">No shrines found</p>
                    <p className="text-gray-400 text-sm">
                      Try adjusting your filters or increasing the search radius
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Discover;
