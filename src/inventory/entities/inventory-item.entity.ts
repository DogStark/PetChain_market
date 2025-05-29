import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { StockMovement } from './stock-movement.entity';
import { StockAlert } from './stock-alert.entity';

@Entity('inventory_items')
export class InventoryItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 50 })
  sku: string;

  @Column({ length: 255 })
  name: string;

  @Column('text', { nullable: true })
  description: string;

  @Column('uuid', { nullable: true })
  categoryId: string;

  @Column({ length: 20, default: 'piece' })
  unitOfMeasure: string;

  @Column('int', { default: 0 })
  currentStock: number;

  @Column('int', { default: 0 })
  reservedStock: number;

  @Column('int', { nullable: true })
  reorderPoint: number;

  @Column('int', { nullable: true })
  maxStockLevel: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  unitCost: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  sellingPrice: number;

  @Column('uuid', { nullable: true })
  supplierId: string;

  @Column({ default: true })
  isActive: boolean;

  @OneToMany(() => StockMovement, movement => movement.inventoryItem)
  stockMovements: StockMovement[];

  @OneToMany(() => StockAlert, alert => alert.inventoryItem)
  stockAlerts: StockAlert[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Computed property for available stock
  get availableStock(): number {
    return this.currentStock - this.reservedStock;
  }

  // Check if item is low stock
  get isLowStock(): boolean {
    return this.reorderPoint ? this.currentStock <= this.reorderPoint : false;
  }
}