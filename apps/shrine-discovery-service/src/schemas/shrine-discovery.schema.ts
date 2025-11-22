import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ShrineDiscoveryDocument = ShrineDiscoveryEntity &
  Document<Types.ObjectId>;

@Schema({ collection: 'shrine_discoveries', timestamps: true })
export class ShrineDiscoveryEntity {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  category: string;

  @Prop({ type: [{ shrineId: String, matchScore: Number }], required: true })
  recommendations: { shrineId: string; matchScore: number }[];

  @Prop({ default: Date.now })
  createdAt: Date;
}

export const ShrineDiscoverySchema = SchemaFactory.createForClass(
  ShrineDiscoveryEntity,
);
