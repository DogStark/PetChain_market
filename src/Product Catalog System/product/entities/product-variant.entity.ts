import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Product } from './product.entity';

@Entity('product_variants')
export class ProductVariant {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Product, product => product.variants)
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column()
  size: string;

  @Column()
  color: string;

  @Column({ unique: true })
  sku: string;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  priceAdjustment: number;

  @Column({ default: 0 })
  stockQuantity: number;

  @Column({ default: true })
  isActive: boolean;
}
