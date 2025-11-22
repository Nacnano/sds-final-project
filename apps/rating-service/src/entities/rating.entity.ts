import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  Unique,
} from 'typeorm';

@Entity('ratings')
@Unique(['userId', 'shrineId']) // One rating per user per shrine
export class RatingEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  @Index()
  userId: string;

  @Column({ name: 'shrine_id', type: 'char', length: 24 })
  @Index()
  shrineId: string;

  @Column({ type: 'int' })
  @Index()
  rating: number; // 1-5

  @Column({ type: 'text', nullable: true })
  review?: string;

  @Column({ name: 'is_anonymous', type: 'boolean', default: false })
  isAnonymous: boolean;

  @CreateDateColumn({ name: 'created_at' })
  @Index()
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
