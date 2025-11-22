import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type TechniqueDocument = TechniqueEntity & Document<Types.ObjectId>;

@Schema({ collection: 'techniques', timestamps: true })
export class TechniqueEntity {
  @Prop({ required: true })
  shrineId: string;

  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ type: [String], required: true })
  ingredients: string[];
}

export const TechniqueSchema = SchemaFactory.createForClass(TechniqueEntity);
