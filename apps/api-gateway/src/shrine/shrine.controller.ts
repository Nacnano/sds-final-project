import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Inject,
  OnModuleInit,
  Patch,
  Delete,
  Query,
} from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { Observable, lastValueFrom } from 'rxjs';
import type {
  CreateShrineRequest,
  UpdateShrineByIdRequest,
  ShrineResponse,
  ShrinesResponse,
  ShrineServiceClient,
} from '@app/shared/interfaces/shrine';
import { LocationServiceClient } from '@app/shared/interfaces/location';

@Controller('shrines')
export class ShrineController implements OnModuleInit {
  private shrineService: ShrineServiceClient;
  private locationService: LocationServiceClient;

  constructor(
    @Inject('SHRINE_PACKAGE') private shrineClient: ClientGrpc,
    @Inject('LOCATION_PACKAGE') private locationClient: ClientGrpc,
  ) {}

  onModuleInit() {
    this.shrineService =
      this.shrineClient.getService<ShrineServiceClient>('ShrineService');
    this.locationService =
      this.locationClient.getService<LocationServiceClient>('LocationService');
  }

  @Post()
  createShrine(
    @Body() createShrineDto: CreateShrineRequest,
  ): Observable<ShrineResponse> {
    return this.shrineService.createShrine(createShrineDto);
  }

  @Get('nearby/search')
  async findNearby(
    @Query('location') location: string,
    @Query('radius') radius: string,
  ): Promise<ShrinesResponse> {
    const coords = await lastValueFrom(
      this.locationService.getCoordinates({ location }),
    );

    return lastValueFrom(
      this.shrineService.findNearby({
        lat: coords.lat,
        lng: coords.lng,
        radius: parseFloat(radius) || 5,
      }),
    );
  }

  @Get(':id')
  findShrineById(@Param('id') id: string): Observable<ShrineResponse> {
    return this.shrineService.findShrineById({ id });
  }

  @Get()
  findAllShrines(): Observable<ShrinesResponse> {
    return this.shrineService.findAllShrines({});
  }

  @Patch(':id')
  updateShrineById(
    @Param('id') id: string,
    @Body() updateShrineDto: Omit<UpdateShrineByIdRequest, 'id'>,
  ): Observable<ShrineResponse> {
    return this.shrineService.updateShrineById({ id, ...updateShrineDto });
  }

  @Delete(':id')
  deleteShrineById(@Param('id') id: string): Observable<ShrineResponse> {
    return this.shrineService.deleteShrineById({ id });
  }
}
