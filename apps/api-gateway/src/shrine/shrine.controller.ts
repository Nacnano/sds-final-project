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
} from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { Observable } from 'rxjs';
import type {
  CreateShrineRequest,
  UpdateShrineByIdRequest,
  ShrineResponse,
  ShrinesResponse,
  ShrineServiceClient,
} from '@app/shared/interfaces/shrine';

@Controller('shrines')
export class ShrineController implements OnModuleInit {
  private shrineService: ShrineServiceClient;

  constructor(@Inject('SHRINE_PACKAGE') private client: ClientGrpc) {}

  onModuleInit() {
    this.shrineService =
      this.client.getService<ShrineServiceClient>('ShrineService');
  }

  @Post()
  createShrine(
    @Body() createShrineDto: CreateShrineRequest,
  ): Observable<ShrineResponse> {
    return this.shrineService.createShrine(createShrineDto);
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
