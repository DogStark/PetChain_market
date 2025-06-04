import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Inventory } from './entities/inventory.entity';
import { UpdateInventoryDto } from './dto/update-inventory.dto';

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(Inventory)
    private inventoryRepository: Repository<Inventory>,
  ) {}

  async createInventory(productId: number, initialStock: number = 0): Promise<Inventory> {
    const inventory = this.inventoryRepository.create({
      product: { id: productId },
      stockQuantity: initialStock,
    });

    return this.inventoryRepository.save(inventory);
  }

  async updateInventory(productId: number, updateDto: UpdateInventoryDto): Promise<Inventory> {
    const inventory = await this.inventoryRepository.findOne({
      where: { product: { id: productId } },
    });

    if (!inventory) {
      throw new NotFoundException('Inventory record not found');
    }

    Object.assign(inventory, updateDto);
    inventory.lastUpdated = new Date();

    return this.inventoryRepository.save(inventory);
  }

  async getInventory(productId: number): Promise<Inventory> {
    const inventory = await this.inventoryRepository.findOne({
      where: { product: { id: productId } },
      relations: ['product'],
    });

    if (!inventory) {
      throw new NotFoundException('Inventory record not found');
    }

    return inventory;
  }

  async getAllInventory(): Promise<Inventory[]> {
    return this.inventoryRepository.find({
      relations: ['product'],
    });
  }

  async getLowStockProducts(): Promise<Inventory[]> {
    return this.inventoryRepository
      .createQueryBuilder('inventory')
      .leftJoinAndSelect('inventory.product', 'product')
      .where('inventory.stockQuantity <= inventory.reorderLevel')
      .andWhere('inventory.reorderLevel > 0')
      .getMany();
  }

  async adjustStock(productId: number, quantity: number): Promise<Inventory> {
    const inventory = await this.getInventory(productId);
    inventory.stockQuantity += quantity;
    inventory.lastUpdated = new Date();

    return this.inventoryRepository.save(inventory);
  }
}
