import { Entity, Column } from 'typeorm';
import { BaseEntity } from '@app/shared/database/base.entity';

@Entity('wishes')
export class Wish extends BaseEntity {
  @Column()
  wisherId: string;

  @Column()
  shrineId: string;

  @Column({ nullable: true })
  wisherName: string;

  @Column()
  description: string;

  @Column({ default: true })
  public: boolean;

  @Column({ nullable: true })
  category: string; // love, career, wealth, health
}
