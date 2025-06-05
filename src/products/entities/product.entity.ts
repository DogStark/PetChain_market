import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  OneToOne,
  Index,
} from 'typeorm';
import { Review } from '../../reviews/entities/review.entity';
import { Inventory } from '../../inventory/entities/inventory.entity';

@Entity('products')
@Index(['category', 'isActive'])
@Index(['name'])
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  name: string;

  @Column('text')
  description: string;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Column({ length: 100 })
  category: string;

  @Column({ length: 100 })
  brand: string;

  @Column('simple-array', { nullable: true })
  tags: string[];

  @Column('json', { nullable: true })
  specifications: Record<string, any>;

  @Column('simple-array', { nullable: true })
  images: string[];

  @Column({ default: true })
  isActive: boolean;

  @Column('decimal', { precision: 3, scale: 2, default: 0 })
  averageRating: number;

  @Column({ default: 0 })
  reviewCount: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Review, review => review.product)
  reviews: Review[];

  @OneToOne(() => Inventory, inventory => inventory.product)
  inventory: Inventory;
}
