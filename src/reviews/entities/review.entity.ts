import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Product } from '../../products/entities/product.entity';

@Entity('reviews')
@Index(['productId', 'rating'])
export class Review {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  productId: string;

  @Column()
  userId: string;

  @Column()
  userName: string;

  @Column('int', { width: 1 })
  rating: number; // 1-5

  @Column()
  title: string;

  @Column('text')
  comment: string;

  @Column({ default: false })
  verified: boolean;

  @Column({ default: 0 })
  helpfulCount: number;

  @Column('simple-array', { nullable: true })
  images: string[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Product, product => product.reviews)
  @JoinColumn({ name: 'productId' })
  product: Product;
}
