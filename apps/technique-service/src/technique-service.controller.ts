import { Controller, Get, Post, Patch, Delete, Body, Param } from '@nestjs/common';
import { TechniqueService } from './technique-service.service';
import {
  CreateTechniqueDto,
  UpdateTechniqueDto,
  TechniqueResponseDto,
  TechniquesResponseDto,
} from './dto/technique.dto';

@Controller('techniques')
export class TechniqueController {
  constructor(private readonly techniqueService: TechniqueService) {}

  @Post()
  async createTechnique(
    @Body() data: CreateTechniqueDto,
  ): Promise<TechniqueResponseDto> {
    return this.techniqueService.createTechnique(data);
  }

  @Patch(':id')
  async updateTechnique(
    @Param('id') id: string,
    @Body() data: UpdateTechniqueDto,
  ): Promise<TechniqueResponseDto> {
    return this.techniqueService.updateTechnique(id, data);
  }

  @Get(':id')
  async findTechniqueById(
    @Param('id') id: string,
  ): Promise<TechniqueResponseDto> {
    return this.techniqueService.findTechniqueById(id);
  }

  @Delete(':id')
  async deleteTechnique(
    @Param('id') id: string,
  ): Promise<TechniqueResponseDto> {
    return this.techniqueService.deleteTechnique(id);
  }

  @Get()
  async listTechniques(): Promise<TechniquesResponseDto> {
    return this.techniqueService.listTechniques();
  }
}
