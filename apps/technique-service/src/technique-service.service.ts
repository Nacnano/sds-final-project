import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TechniqueEntity, TechniqueDocument } from './schemas/technique.schema';
import {
  CreateTechniqueDto,
  UpdateTechniqueDto,
  Technique,
  TechniqueResponseDto,
  TechniquesResponseDto,
} from './dto/technique.dto';

@Injectable()
export class TechniqueService {
  constructor(
    @InjectModel(TechniqueEntity.name)
    private techniqueModel: Model<TechniqueDocument>,
  ) {}

  async createTechnique(
    request: CreateTechniqueDto,
  ): Promise<TechniqueResponseDto> {
    try {
      const technique = new this.techniqueModel({
        shrineId: request.shrineId,
        userId: request.userId,
        title: request.title,
        description: request.description,
        ingredients: request.ingredients,
      });

      const savedTechnique = await technique.save();

      return {
        technique: this.mapToTechnique(savedTechnique),
      };
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to create technique: ${error.message}`,
      );
    }
  }

  async updateTechnique(
    id: string,
    request: UpdateTechniqueDto,
  ): Promise<TechniqueResponseDto> {
    try {
      const updatedTechnique = await this.techniqueModel.findByIdAndUpdate(
        id,
        {
          title: request.title,
          description: request.description,
          ingredients: request.ingredients,
        },
        { new: true },
      );

      if (!updatedTechnique) {
        throw new NotFoundException(`Technique with id ${id} not found`);
      }

      return {
        technique: this.mapToTechnique(updatedTechnique),
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Failed to update technique: ${error.message}`,
      );
    }
  }

  async deleteTechnique(id: string): Promise<TechniqueResponseDto> {
    try {
      const deletedTechnique = await this.techniqueModel.findByIdAndDelete(id);

      if (!deletedTechnique) {
        throw new NotFoundException(`Technique with id ${id} not found`);
      }

      return {
        technique: this.mapToTechnique(deletedTechnique),
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Failed to delete technique: ${error.message}`,
      );
    }
  }

  async findTechniqueById(id: string): Promise<TechniqueResponseDto> {
    try {
      const technique = await this.techniqueModel.findById(id);

      if (!technique) {
        throw new NotFoundException(`Technique with id ${id} not found`);
      }

      return {
        technique: this.mapToTechnique(technique),
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Failed to find technique: ${error.message}`,
      );
    }
  }

  async listTechniques(): Promise<TechniquesResponseDto> {
    try {
      const techniques = await this.techniqueModel.find().exec();

      return {
        techniques: techniques.map((tech) => this.mapToTechnique(tech)),
      };
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to list techniques: ${error.message}`,
      );
    }
  }

  private mapToTechnique(doc: TechniqueDocument): Technique {
    return {
      id: doc._id.toString(),
      shrineId: doc.shrineId,
      userId: doc.userId,
      title: doc.title,
      description: doc.description,
      ingredients: doc.ingredients,
    };
  }
}
