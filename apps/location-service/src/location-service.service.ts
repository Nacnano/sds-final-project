import { Injectable, Logger } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { status } from '@grpc/grpc-js';
import {
  findLocationByName,
  calculateDistance,
  formatDistance,
  estimateDuration,
  MOCK_LOCATIONS,
} from './mock-location.database';

@Injectable()
export class LocationService {
  private readonly logger = new Logger(LocationService.name);

  constructor() {
    this.logger.log(
      `Location Service initialized with ${MOCK_LOCATIONS.length} mock locations`,
    );
  }

  async getCoordinates(address: string) {
    this.logger.log(`Searching for coordinates of: "${address}"`);

    const location = findLocationByName(address);

    if (!location) {
      this.logger.warn(`No coordinates found for address: ${address}`);
      throw new RpcException({
        code: status.NOT_FOUND,
        message: `No coordinates found for "${address}". Available locations: ${MOCK_LOCATIONS.slice(
          0,
          5,
        )
          .map((l) => l.name)
          .join(', ')}...`,
      });
    }

    // Log if the matched location name differs from input (fuzzy match)
    const normalizedInput = address.toLowerCase().trim();
    const normalizedMatch = location.name.toLowerCase();
    const isExactMatch = normalizedInput === normalizedMatch;

    if (!isExactMatch) {
      const isAliasMatch = location.aliases?.some(
        (alias) => alias.toLowerCase() === normalizedInput,
      );

      if (!isAliasMatch) {
        this.logger.log(
          `Fuzzy matched "${address}" to "${location.name}" (possible misspelling corrected)`,
        );
      }
    }

    this.logger.log(
      `Found coordinates for "${address}" -> ${location.name}: lat: ${location.lat}, lng: ${location.lng}`,
    );
    return {
      lat: location.lat,
      lng: location.lng,
    };
  }

  async getDistance(origin: string, destination: string) {
    this.logger.log(
      `Calculating distance from "${origin}" to "${destination}"`,
    );

    const originLocation = findLocationByName(origin);
    const destLocation = findLocationByName(destination);

    if (!originLocation) {
      this.logger.warn(`Origin location not found: ${origin}`);
      throw new RpcException({
        code: status.NOT_FOUND,
        message: `Origin location "${origin}" not found in database`,
      });
    }

    if (!destLocation) {
      this.logger.warn(`Destination location not found: ${destination}`);
      throw new RpcException({
        code: status.NOT_FOUND,
        message: `Destination location "${destination}" not found in database`,
      });
    }

    // Log fuzzy matches
    if (origin.toLowerCase().trim() !== originLocation.name.toLowerCase()) {
      const isAliasMatch = originLocation.aliases?.some(
        (alias) => alias.toLowerCase() === origin.toLowerCase().trim(),
      );
      if (!isAliasMatch) {
        this.logger.log(
          `Fuzzy matched origin "${origin}" to "${originLocation.name}"`,
        );
      }
    }

    if (destination.toLowerCase().trim() !== destLocation.name.toLowerCase()) {
      const isAliasMatch = destLocation.aliases?.some(
        (alias) => alias.toLowerCase() === destination.toLowerCase().trim(),
      );
      if (!isAliasMatch) {
        this.logger.log(
          `Fuzzy matched destination "${destination}" to "${destLocation.name}"`,
        );
      }
    }

    // Calculate distance using Haversine formula
    const distanceInMeters = calculateDistance(
      originLocation.lat,
      originLocation.lng,
      destLocation.lat,
      destLocation.lng,
    );

    const distanceText = formatDistance(distanceInMeters);
    const duration = estimateDuration(distanceInMeters);

    const result = {
      distanceText: distanceText,
      distanceValue: Math.round(distanceInMeters),
      durationText: duration.text,
      durationValue: duration.value,
    };

    this.logger.log(
      `Distance calculated: ${originLocation.name} -> ${destLocation.name} = ${distanceText} (${duration.text})`,
    );

    return result;
  }
}
