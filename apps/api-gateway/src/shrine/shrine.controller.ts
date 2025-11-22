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
  UseGuards,
  UnauthorizedException,
  ForbiddenException,
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
import { Roles } from '@app/shared/auth/roles.decorator';
import { JwtAuthGuard } from '@app/shared/auth/jwt-auth.guard';
import { CurrentUser } from '@app/shared/auth/current-user.decorator';

@Controller('shrines')
export class ShrineController implements OnModuleInit {
  private shrineService: ShrineServiceClient;

  constructor(@Inject('SHRINE_PACKAGE') private client: ClientGrpc) {}

  onModuleInit() {
    this.shrineService =
      this.client.getService<ShrineServiceClient>('ShrineService');
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  createShrine(
    @Body() createShrineDto: CreateShrineRequest,
    @CurrentUser() currentUser?: any,
  ): Observable<ShrineResponse> {
    if (!currentUser) {
      throw new UnauthorizedException('You must be logged in');
    }

    if (currentUser.role !== 'admin') {
      throw new ForbiddenException(
        "You don't have permission to create a shrine",
      );
    }

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
  @UseGuards(JwtAuthGuard)
  updateShrineById(
    @Param('id') id: string,
    @Body() updateShrineDto: Omit<UpdateShrineByIdRequest, 'id'>,
    @CurrentUser() currentUser?: any,
  ): Observable<ShrineResponse> {
    if (!currentUser) {
      throw new UnauthorizedException('You must be logged in');
    }

    if (currentUser.role !== 'admin') {
      throw new ForbiddenException(
        "You don't have permission to update this shrine",
      );
    }
    return this.shrineService.updateShrineById({ id, ...updateShrineDto });
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  deleteShrineById(
    @Param('id') id: string,
    @CurrentUser() currentUser?: any,
  ): Observable<ShrineResponse> {
    if (!currentUser) {
      throw new UnauthorizedException('You must be logged in');
    }

    if (currentUser.role !== 'admin') {
      throw new ForbiddenException(
        "You don't have permission to delete this shrine",
      );
    }
    return this.shrineService.deleteShrineById({ id });
  }
}
