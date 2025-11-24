import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { ShrineService } from './shrine-service.service';
import type {
  CreateShrineRequest,
  FindShrineByIdRequest,
  UpdateShrineByIdRequest,
  DeleteShrineByIdRequest,
  ShrineResponse,
  ShrinesResponse,
  FindNearbyRequest,
} from '@app/shared/interfaces/shrine';

@Controller()
export class ShrineServiceController {
  constructor(private readonly shrineService: ShrineService) {}

  @GrpcMethod('ShrineService', 'CreateShrine')
  async createShrine(data: CreateShrineRequest): Promise<ShrineResponse> {
    return this.shrineService.createShrine(data);
  }

  @GrpcMethod('ShrineService', 'FindShrineById')
  async findShrineById(data: FindShrineByIdRequest): Promise<ShrineResponse> {
    return this.shrineService.findShrineById(data.id);
  }

  @GrpcMethod('ShrineService', 'FindAllShrines')
  async findAllShrines(): Promise<ShrinesResponse> {
    const shrines = await this.shrineService.findAllShrines();
    return { shrines };
  }

  @GrpcMethod('ShrineService', 'UpdateShrineById')
  async updateShrineById(
    data: UpdateShrineByIdRequest,
  ): Promise<ShrineResponse> {
    return this.shrineService.updateShrineById(data);
  }

  @GrpcMethod('ShrineService', 'DeleteShrineById')
  async deleteShrineById(
    data: DeleteShrineByIdRequest,
  ): Promise<ShrineResponse> {
    return this.shrineService.deleteShrineById(data.id);
  }

  @GrpcMethod('ShrineService', 'FindNearby')
  async findNearby(data: FindNearbyRequest): Promise<ShrinesResponse> {
    const shrines = await this.shrineService.findNearby(
      data.lat,
      data.lng,
      data.radius,
    );
    return { shrines };
  }
}
