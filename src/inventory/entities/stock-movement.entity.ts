import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { InventoryItem } from './inventory-item.entity';

export enum MovementType {
  RECEIPT = 'RECEIPT',
  ISSUE = 'ISSUE',
  TRANSFER_IN = 'TRANSFER_IN',
  TRANSFER_OUT = 'TRANSFER_OUT',
  ADJUSTMENT = 'ADJUSTMENT',
  RETURN = 'RETURN',
  DAMAGE = 'DAMAGE',
  EXPIRED = 'EXPIRED'
}

@Entity('stock_movements')
export class StockMovement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  inventoryItemId: string;

  @ManyToOne(() => InventoryItem, item => item.stockMovements)
  @JoinColumn({ name: 'inventoryItemId' })
  inventoryItem: InventoryItem;

  @Column({
    type: 'enum',
    enum: MovementType
  })
  movementType: MovementType;

  @Column('int')
  quantity: number;

  @Column('int')
  previousStock: number;

  @Column('int')
  newStock: number;

  @Column({ length: 100, nullable: true })
  referenceNumber: string;

  @Column('text', { nullable: true })
  notes: string;

  @Column('uuid', { nullable: true })
  userId: string;

  @Column({ length: 45, nullable: true })
  ipAddress: string;

  @CreateDateColumn()
  createdAt: Date;
}
