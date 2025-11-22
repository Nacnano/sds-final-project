import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  UseGuards,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { TechniqueService as TechniqueOrchestrationService } from './technique.service';
import type {
  CreateTechniqueRequest,
  UpdateTechniqueRequest,
  TechniqueResponse,
  TechniquesResponse,
} from '@app/shared/interfaces/technique';
import { JwtAuthGuard } from '@app/shared/auth/jwt-auth.guard';
import { CurrentUser } from '@app/shared/auth/current-user.decorator';

@Controller('techniques')
export class TechniqueController {
  constructor(
    private readonly techniqueService: TechniqueOrchestrationService,
  ) {}

  @Post()
  create(
    @Body() createTechniqueRequest: Omit<CreateTechniqueRequest, 'userId'>,
  ): Observable<TechniqueResponse> {
    return this.techniqueService.createTechnique(createTechniqueRequest);
  }

  @Get(':id')
  findTechniqueById(@Param('id') id: string): Observable<TechniqueResponse> {
    return this.techniqueService.findTechniqueById(id);
  }

  @Get()
  findAllTechniques(): Observable<TechniquesResponse> {
    return this.techniqueService.listTechniques();
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateTechniqueRequest: Omit<UpdateTechniqueRequest, 'id'>,
    @CurrentUser() currentUser?: any,
  ): Observable<TechniqueResponse> {
    if (!currentUser) {
      throw new UnauthorizedException('You must be logged in');
    }

    if (currentUser.role !== 'admin' && currentUser.id !== id) {
      throw new ForbiddenException(
        'You do not have permission to update this technique',
      );
    }

    return this.techniqueService.updateTechnique(id, updateTechniqueRequest);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  delete(@Param('id') id: string, @CurrentUser() currentUser?: any): Observable<TechniqueResponse> {
    if (!currentUser) {
      throw new UnauthorizedException('You must be logged in');
    }

    if (currentUser.role !== 'admin' && currentUser.id !== id) {
      throw new ForbiddenException(
        'You do not have permission to delete this technique',
      );
    }
    return this.techniqueService.deleteTechnique(id);
  }
}
