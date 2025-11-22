import React, { useState, useEffect } from 'react';
import locationService from '../services/locationService';

interface DistanceDisplayProps {
  targetLat?: number;
  targetLng?: number;
  userLat?: number;
  userLng?: number;
  className?: string;
}

const DistanceDisplay: React.FC<DistanceDisplayProps> = ({
  targetLat,
  targetLng,
  userLat,
  userLng,
  className = '',
}) => {
  const [distance, setDistance] = useState<number | null>(null);

  useEffect(() => {
    if (targetLat && targetLng && userLat && userLng) {
      const dist = locationService.calculateDistance(userLat, userLng, targetLat, targetLng);
      setDistance(dist);
    } else {
      setDistance(null);
    }
  }, [targetLat, targetLng, userLat, userLng]);

  if (distance === null) {
    return null;
  }

  return (
    <span className={`inline-flex items-center gap-1 text-gray-600 ${className}`}>
      <svg
        className="w-4 h-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
        />
      </svg>
      <span>{distance} km away</span>
    </span>
  );
};

export default DistanceDisplay;
