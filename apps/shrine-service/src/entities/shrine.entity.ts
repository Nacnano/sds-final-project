import { Entity, Column } from 'typeorm';
import { BaseEntity } from '@app/shared/database/base.entity';

@Entity('shrines')
export class Shrine extends BaseEntity {
  @Column()
  name: string;

  @Column()
  description: string;

  @Column()
  location: string;

  @Column({ type: 'float', nullable: true })
  lat: number;

  @Column({ type: 'float', nullable: true })
  lng: number;

  @Column({ nullable: true })
  category: string;

  @Column({ name: 'image_url', nullable: true })
  imageUrl: string;
}
