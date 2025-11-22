import { Injectable, Inject, OnModuleInit, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, QueryFailedError } from 'typeorm';
import { RpcException, ClientProxy } from '@nestjs/microservices';
import type { ClientGrpc } from '@nestjs/microservices';
import { lastValueFrom, Observable } from 'rxjs';
import { status } from '@grpc/grpc-js';
import { Shrine } from './entities/shrine.entity';
// ioredis is provided optionally; import types only if available at build time
// to avoid hard dependency in environments without Redis.
// Use `any` type at runtime if ioredis types are missing.
// Avoid importing ioredis types at build time to keep installs optional.
type Redis = any;
import {
  CreateShrineRequest,
  UpdateShrineByIdRequest,
  ShrineResponse,
} from '@app/shared/interfaces/shrine';
import { isObjectId } from '@app/shared/utils/validators/object-id.validator';
import { CoordinatesResponse, LocationServiceClient } from '@app/shared/interfaces/location';

@Injectable()
export class ShrineService {

  private locationService: LocationServiceClient;
  private readonly logger = new Logger(ShrineService.name);
  constructor(
    @InjectRepository(Shrine)
    private readonly shrineRepository: Repository<Shrine>,

    @Inject('SHRINE_SERVICE')
    private readonly shrineClient: ClientProxy,
    @Inject('LOCATION_SERVICE') private locationClient: ClientGrpc,
    @Inject('REDIS') private readonly redisClient?: Redis,
 
  ) {}

  // Do not store per-request state on the service instance. Use local variables to avoid races
  // when multiple requests are handled concurrently.

  onModuleInit() {
    this.locationService = 
          this.locationClient.getService<LocationServiceClient>('LocationService');
  }

  async createShrine(data: CreateShrineRequest): Promise<ShrineResponse> {
    // Measure timing to help diagnose latency hotspots when scaling
    const startTs = Date.now();
    let coords: CoordinatesResponse | undefined;

    try {
      // If a location is provided, validate/resolve it via location-service
      if (data.location && this.locationService) {
        const t0 = Date.now();
        try {
          coords = await lastValueFrom(
            this.locationService.getCoordinates({ location: data.location }),
          );
        } catch (err) {
          this.logger.error(`Location resolution failed for "${data.location}":`, err);
          throw new RpcException({
            code: status.INVALID_ARGUMENT,
            message: `Unable to resolve location: ${data.location}`,
          });
        }
        this.logger.log(`location-service lookup for "${data.location}" took ${Date.now() - t0}ms`);
      }

      this.logger.log('createShrine input', { data, coords });
      const shrine = this.shrineRepository.create({
        name: data.name,
        description: data.description,
        location: data.location,
        imageUrl: data.imageUrl ?? undefined,
        category: data.category ?? undefined,
      });

      const tDb = Date.now();
      const savedShrine = await this.shrineRepository.save(shrine);
      this.logger.log(`DB save took ${Date.now() - tDb}ms`);
      const response = this.mapToResponse(savedShrine);

      // Emit event including coordinates when available
      const emitted = coords ? { ...response, coordinates: coords } : response;
      this.logger.log(`createShrine total took ${Date.now() - startTs}ms`);
      this.shrineClient.emit('shrine_created', emitted);
      return response;
    } catch (err) {
      console.error('❌ Shrine creation failed:', err);
      throw new RpcException({
        code: status.INTERNAL,
        message: 'Failed to create shrine',
      });
    }
  }

  async findShrineById(id: string): Promise<ShrineResponse> {
    if (!isObjectId(id)) {
      throw new RpcException({
        code: status.INVALID_ARGUMENT,
        message: `Invalid ID format: ${id}`,
      });
    }

    try {
      const shrine = await this.shrineRepository.findOne({ where: { id } });
      if (!shrine) {
        throw new RpcException({
          code: status.NOT_FOUND,
          message: `Shrine with ID ${id} not found`,
        });
      }
      return this.mapToResponse(shrine);
    } catch (err) {
      if (err instanceof QueryFailedError) {
        throw new RpcException({
          code: status.INVALID_ARGUMENT,
          message: `Invalid ID format: ${id}`,
        });
      }
      throw new RpcException({
        code: status.INTERNAL,
        message: 'Internal server error',
      });
    }
  }

  async findAllShrines(): Promise<ShrineResponse[]> {
    const cacheKey = 'shrines:list:all';
    try {
      // Check Redis cache first
      if (this.redisClient) {
        try {
          const cached = await this.redisClient.get(cacheKey);
          if (cached) {
            this.logger.log('Cache hit for findAllShrines');
            const parsed = JSON.parse(cached) as Shrine[];
            return parsed.map(this.mapToResponse);
          }
        } catch (e) {
          this.logger.warn(`Redis read failed: ${e?.message ?? e}`);
        }
      }

      // Fetch from database with performance tracking
      const t0 = Date.now();
      const shrines = await this.shrineRepository.find({ 
        select: ['id','name','description','location','lat','lng','imageUrl','category','createdAt','updatedAt'] 
      });
      this.logger.log(`DB findAllShrines took ${Date.now() - t0}ms; count=${shrines.length}`);
      
      // Debug: Log first shrine to check imageUrl
      if (shrines.length > 0) {
        this.logger.debug('First shrine raw data:', JSON.stringify({
          id: shrines[0].id,
          name: shrines[0].name,
          imageUrl: shrines[0].imageUrl,
          hasImageUrl: !!shrines[0].imageUrl,
        }));
      }

      // Cache the results in Redis
      try {
        if (this.redisClient) await this.redisClient.setex(cacheKey, 60, JSON.stringify(shrines));
      } catch (e) {
        this.logger.warn(`Redis write failed: ${e?.message ?? e}`);
      }

      const mapped = shrines.map((shrine) => this.mapToResponse(shrine));
      
      // Debug: Log first mapped response
      if (mapped.length > 0) {
        this.logger.debug('First shrine mapped response:', JSON.stringify({
          id: mapped[0].id,
          name: mapped[0].name,
          imageUrl: mapped[0].imageUrl,
          hasImageUrl: !!mapped[0].imageUrl,
        }));
      }

      return mapped;
    } catch (err) {
      this.logger.error('Failed to fetch shrines', err);
      throw new RpcException({
        code: status.INTERNAL,
        message: 'Failed to fetch shrines',
      });
    }
  }

  async updateShrineById(
    data: UpdateShrineByIdRequest,
  ): Promise<ShrineResponse> {
    if (!isObjectId(data.id)) {
      throw new RpcException({
        code: status.INVALID_ARGUMENT,
        message: `Invalid ID format: ${data.id}`,
      });
    }

    const shrine = await this.shrineRepository.findOne({
      where: { id: data.id },
    });
    if (!shrine) {
      throw new RpcException({
        code: status.NOT_FOUND,
        message: `Shrine with ID ${data.id} not found`,
      });
    }

    shrine.name = data.name ?? shrine.name;
    shrine.description = data.description ?? shrine.description;
    shrine.location = data.location ?? shrine.location;
    shrine.imageUrl = data.imageUrl ?? shrine.imageUrl;
    shrine.category = data.category ?? shrine.category;

    // If a new location is provided, validate/resolve it via location service and update coords
    if (data.location && this.locationService) {
      const t0 = Date.now();
      try {
        const newCoords = await lastValueFrom(
          this.locationService.getCoordinates({ location: data.location }),
        );
        shrine.lat = newCoords.lat ?? shrine.lat;
        shrine.lng = newCoords.lng ?? shrine.lng;
        this.logger.log(`location-service lookup for update ${data.location} took ${Date.now() - t0}ms`);
      } catch (err) {
        throw new RpcException({
          code: status.INVALID_ARGUMENT,
          message: `Unable to resolve location: ${data.location}`,
        });
      }
    }

    try {
      const tDb = Date.now();
      const updatedShrine = await this.shrineRepository.save(shrine);
      this.logger.log(`updateShrineById DB save took ${Date.now() - tDb}ms`);
      // invalidate cache on update
      try {
        if (this.redisClient) await this.redisClient.del('shrines:list:all');
      } catch (e) {
        this.logger.warn(`Redis del failed: ${e?.message ?? e}`);
      }
      return this.mapToResponse(updatedShrine);
    } catch (err) {
      throw new RpcException({
        code: status.INTERNAL,
        message: `Failed to update shrine with ID ${data.id}`,
      });
    }
  }

  async deleteShrineById(id: string): Promise<ShrineResponse> {
    if (!isObjectId(id)) {
      throw new RpcException({
        code: status.INVALID_ARGUMENT,
        message: `Invalid ID format: ${id}`,
      });
    }

    const shrine = await this.shrineRepository.findOne({ where: { id } });
    if (!shrine) {
      throw new RpcException({
        code: status.NOT_FOUND,
        message: `Shrine with ID ${id} not found`,
      });
    }

    try {
      await this.shrineRepository.remove(shrine);
      try {
        if (this.redisClient) await this.redisClient.del('shrines:list:all');
      } catch (e) {
        this.logger.warn(`Redis del failed: ${e?.message ?? e}`);
      }
      return this.mapToResponse(shrine);
    } catch (err) {
      throw new RpcException({
        code: status.INTERNAL,
        message: `Failed to delete shrine with ID ${id}`,
      });
    }
  }

  private mapToResponse(shrine: Shrine): ShrineResponse {
    return {
      id: shrine.id,
      name: shrine.name,
      description: shrine.description,
      location: shrine.location,
      lat: shrine.lat,
      lng: shrine.lng,
      createdAt: shrine.createdAt.toISOString(),
      updatedAt: shrine.updatedAt.toISOString(),
      imageUrl: shrine.imageUrl,
      category: shrine.category,
    };
  }
}
