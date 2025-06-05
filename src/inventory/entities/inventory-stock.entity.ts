import {
  Entity, PrimaryGeneratedColumn, Column, ManyToOne
} from 'typeorm';
import { Location } from 'src/location/entities/location.entity';

@Entity()
export class InventoryStock {
  @PrimaryGeneratedColumn()
     id!: number;

  @Column()
     itemName!: string;

  @Column({ nullable: true })
     itemSKU!: string;

  @Column('int')
     quantity!: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
     price!: number;

  @ManyToOne(() => Location, location => location.inventoryStock, { eager: true })
     location!: Location;
}
