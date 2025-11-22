import { PrimaryColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ObjectId } from 'bson';

export abstract class BaseEntity {
  @PrimaryColumn({ type: 'char', length: 24 })
  id: string = new ObjectId().toHexString();

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
