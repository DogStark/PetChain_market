import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { InventoryStock } from '@/inventory/entities/inventory-stock.entity';
import { Appointment } from '@/appointment/entities/appointment.entity';

@Entity()
export class Location {
  @PrimaryGeneratedColumn()
     id!: number;

  @Column()
     name!: string;

  @Column()
     address!: string;

  @Column()
     city!: string;

  @Column()
     country!: string;

  @OneToMany(() => InventoryStock, InventoryStock => InventoryStock.location)
     inventoryStock: InventoryStock[] = [];

  @OneToMany(() => Appointment, appointment => appointment.location)
     appointments: Appointment[] = [];
}

