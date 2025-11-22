import api from './api';

export interface CoordinatesRequest {
  location: string;
}

export interface CoordinatesResponse {
  lat: number;
  lng: number;
}

export interface DistanceRequest {
  origin: string;
  destination: string;
}

export interface DistanceResponse {
  distanceText: string;
  distanceValue: number;
  durationText: string;
  durationValue: number;
}

const locationService = {
  /**
   * Get coordinates (latitude and longitude) for a given address or location
   * @param location Address or location string (e.g., "Ratchadamri Rd, Bangkok")
   * @returns Coordinates with lat and lng
   */
  async getCoordinates(location: string): Promise<CoordinatesResponse> {
    const response = await api.post<CoordinatesResponse>('/location/coordinates', {
      location,
    });
    return response.data;
  },

  /**
   * Calculate distance and duration between two locations
   * @param origin Starting location address
   * @param destination Ending location address
   * @returns Distance and duration information
   */
  async getDistance(origin: string, destination: string): Promise<DistanceResponse> {
    const response = await api.post<DistanceResponse>('/location/distance', {
      origin,
      destination,
    });
    return response.data;
  },

  /**
   * Calculate distance in kilometers from coordinates using Haversine formula
   * @param lat1 Latitude of first point
   * @param lng1 Longitude of first point
   * @param lat2 Latitude of second point
   * @param lng2 Longitude of second point
   * @returns Distance in kilometers
   */
  calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(lat2 - lat1);
    const dLng = this.toRadians(lng2 - lng1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) *
        Math.cos(this.toRadians(lat2)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return Math.round(distance * 10) / 10; // Round to 1 decimal place
  },

  /**
   * Convert degrees to radians
   */
  toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  },
};

export default locationService;
