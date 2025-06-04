import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { Product } from '../../product/entities/product.entity';

@Entity('inventory')
export class Inventory {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => Product, product => product.inventory)
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column({ default: 0 })
  stockQuantity: number;

  @Column({ default: 0 })
  reservedQuantity: number;

  @Column({ default: 0 })
  reorderLevel: number;

  @Column({ default: 0 })
  maxStockLevel: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  lastUpdated: Date;
}
