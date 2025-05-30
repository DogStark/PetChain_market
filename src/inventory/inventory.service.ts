import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, QueryRunner } from 'typeorm';
import { InventoryItem } from './entities/inventory-item.entity';
import { StockMovement, MovementType } from './entities/stock-movement.entity';
import { StockAlert, AlertType, AlertStatus } from './entities/stock-alert.entity';
import { CreateInventoryItemDto } from './dto/create-inventory-item.dto';
import { UpdateInventoryItemDto } from './dto/update-inventory-item.dto';
import { StockAdjustmentDto } from './dto/stock-adjustment.dto';
import { InventoryFilterDto } from './dto/inventory-filter.dto';
import { StockMovementFilterDto } from './dto/stock-movement-filter.dto';

@Injectable()
export class InventoryService {
  private readonly logger = new Logger(InventoryService.name);

  constructor(
    @InjectRepository(InventoryItem)
    private inventoryRepository: Repository<InventoryItem>,
    @InjectRepository(StockMovement)
    private stockMovementRepository: Repository<StockMovement>,
    @InjectRepository(StockAlert)
    private stockAlertRepository: Repository<StockAlert>,
    private dataSource: DataSource,
  ) {}

  // CRUD Operations for Inventory Items

  async create(createInventoryItemDto: CreateInventoryItemDto): Promise<InventoryItem> {
    try {
      const existingItem = await this.inventoryRepository.findOne({
        where: { sku: createInventoryItemDto.sku }
      });

      if (existingItem) {
        throw new BadRequestException(`Item with SKU ${createInventoryItemDto.sku} already exists`);
      }

      const inventoryItem = this.inventoryRepository.create(createInventoryItemDto);
      const savedItem = await this.inventoryRepository.save(inventoryItem);

      // Create initial stock movement if is stock greater than zero

      if (createInventoryItemDto.currentStock > 0) {
        await this.createStockMovement({
          inventoryItemId: savedItem.id,
          movementType: MovementType.ADJUSTMENT,
          quantity: createInventoryItemDto.currentStock,
          notes: 'Initial stock entry'
        });
      }

      // Set up default low stock alert

      if (createInventoryItemDto.reorderPoint) {
        await this.createStockAlert({
          inventoryItemId: savedItem.id,
          alertType: AlertType.LOW_STOCK,
          thresholdValue: createInventoryItemDto.reorderPoint
        });
      }

      return savedItem;
    } catch (error) {
      this.logger.error(`Error creating inventory item: ${error.message}`);
      throw error;
    }
  }

  async findAll(filterDto: InventoryFilterDto): Promise<{ items: InventoryItem[], total: number }> {
    const queryBuilder = this.inventoryRepository.createQueryBuilder('item');

    // filters

    if (filterDto.search) {
      queryBuilder.where(
        '(item.name ILIKE :search OR item.sku ILIKE :search OR item.description ILIKE :search)',
        { search: `%${filterDto.search}%` }
      );
    }

    if (filterDto.categoryId) {
      queryBuilder.andWhere('item.categoryId = :categoryId', { categoryId: filterDto.categoryId });
    }

    if (filterDto.supplierId) {
      queryBuilder.andWhere('item.supplierId = :supplierId', { supplierId: filterDto.supplierId });
    }

    if (filterDto.lowStock) {
      queryBuilder.andWhere('item.currentStock <= item.reorderPoint');
    }

    if (filterDto.outOfStock) {
      queryBuilder.andWhere('item.currentStock <= 0');
    }

    queryBuilder.andWhere('item.isActive = :isActive', { isActive: true });

    //sorting

    queryBuilder.orderBy(`item.${filterDto.sortBy}`, filterDto.sortOrder);

    // pagination

    const total = await queryBuilder.getCount();
    const items = await queryBuilder
      .skip((filterDto.page - 1) * filterDto.limit)
      .take(filterDto.limit)
      .getMany();

    return { items, total };
  }

  async findOne(id: string): Promise<InventoryItem> {
    const item = await this.inventoryRepository.findOne({
      where: { id, isActive: true },
      relations: ['stockMovements', 'stockAlerts']
    });

    if (!item) {
      throw new NotFoundException(`Inventory item with ID ${id} not found`);
    }

    return item;
  }

  async update(id: string, updateInventoryItemDto: UpdateInventoryItemDto): Promise<InventoryItem> {
    const item = await this.findOne(id);
    
    // Check if SKU is being changed and if it already exists

    if (updateInventoryItemDto.sku && updateInventoryItemDto.sku !== item.sku) {
      const existingItem = await this.inventoryRepository.findOne({
        where: { sku: updateInventoryItemDto.sku }
      });

      if (existingItem) {
        throw new BadRequestException(`Item with SKU ${updateInventoryItemDto.sku} already exists`);
      }
    }

    Object.assign(item, updateInventoryItemDto);
    return await this.inventoryRepository.save(item);
  }

  async remove(id: string): Promise<void> {
    const item = await this.findOne(id);
    item.isActive = false;
    await this.inventoryRepository.save(item);
  }

  // Stock Management 

  async adjustStock(adjustmentDto: StockAdjustmentDto, userId: string, ipAddress?: string): Promise<InventoryItem> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const item = await queryRunner.manager.findOne(InventoryItem, {
        where: { id: adjustmentDto.inventoryItemId, isActive: true },
        lock: { mode: 'pessimistic_write' }
      });

      if (!item) {
        throw new NotFoundException(`Inventory item with ID ${adjustmentDto.inventoryItemId} not found`);
      }

      const previousStock = item.currentStock;
      let newStock: number;

      // Calculate new stock 

      switch (adjustmentDto.movementType) {
        case MovementType.RECEIPT:
        case MovementType.RETURN:
        case MovementType.TRANSFER_IN:
          newStock = previousStock + Math.abs(adjustmentDto.quantity);
          break;
        case MovementType.ISSUE:
        case MovementType.DAMAGE:
        case MovementType.EXPIRED:
        case MovementType.TRANSFER_OUT:
          newStock = previousStock - Math.abs(adjustmentDto.quantity);
          if (newStock < 0) {
            throw new BadRequestException('Insufficient stock for this operation');
          }
          break;
        case MovementType.ADJUSTMENT:
          newStock = adjustmentDto.quantity; // Direct adjustment to specific quantity
          break;
        default:
          throw new BadRequestException('Invalid movement type');
      }

      // Update stock

      item.currentStock = newStock;
      await queryRunner.manager.save(item);

      // stock movement record

      const stockMovement = queryRunner.manager.create(StockMovement, {
        inventoryItemId: item.id,
        movementType: adjustmentDto.movementType,
        quantity: adjustmentDto.quantity,
        previousStock,
        newStock,
        referenceNumber: adjustmentDto.referenceNumber,
        notes: adjustmentDto.notes,
        userId,
        ipAddress
      });

      await queryRunner.manager.save(stockMovement);

      // Check and trigger alerts
        if (adjustmentDto.movementType !== MovementType.ADJUSTMENT) {
            await this.createStockMovement({
              inventoryItemId: item.id,
              movementType: adjustmentDto.movementType,
              quantity: adjustmentDto.quantity,
              previousStock,
              newStock,
              referenceNumber: adjustmentDto.referenceNumber ?? '', // Provide a default empty string if undefined
              notes: adjustmentDto.notes ?? '', // Provide a default empty string if undefined
              userId,
              ipAddress
            });
        }
      await this.checkAndTriggerAlerts(item, queryRunner);

      await queryRunner.commitTransaction();

      this.logger.log(`Stock adjusted for item ${item.sku}: ${previousStock} -> ${newStock}`);
      return item;

    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(`Error adjusting stock: ${error.message}`);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async getCurrentStock(itemId: string): Promise<{ currentStock: number, availableStock: number, reservedStock: number }> {
    const item = await this.findOne(itemId);
    return {
      currentStock: item.currentStock,
      availableStock: item.availableStock,
      reservedStock: item.reservedStock
    };
  }

  async reserveStock(itemId: string, quantity: number): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const item = await queryRunner.manager.findOne(InventoryItem, {
        where: { id: itemId, isActive: true },
        lock: { mode: 'pessimistic_write' }
      });

      if (!item) {
        throw new NotFoundException(`Inventory item with ID ${itemId} not found`);
      }

      if (item.availableStock < quantity) {
        throw new BadRequestException('Insufficient available stock for reservation');
      }

      item.reservedStock += quantity;
      await queryRunner.manager.save(item);

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async releaseReservedStock(itemId: string, quantity: number): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const item = await queryRunner.manager.findOne(InventoryItem, {
        where: { id: itemId, isActive: true },
        lock: { mode: 'pessimistic_write' }
      });

      if (!item) {
        throw new NotFoundException(`Inventory item with ID ${itemId} not found`);
      }

      item.reservedStock = Math.max(0, item.reservedStock - quantity);
      await queryRunner.manager.save(item);

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  // Stock Movement History

  async getStockMovements(filterDto: StockMovementFilterDto): Promise<StockMovement[]> {
    const queryBuilder = this.stockMovementRepository.createQueryBuilder('movement')
      .leftJoinAndSelect('movement.inventoryItem', 'item');

    if (filterDto.inventoryItemId) {
      queryBuilder.where('movement.inventoryItemId = :inventoryItemId', { 
        inventoryItemId: filterDto.inventoryItemId 
      });
    }

    if (filterDto.movementType) {
      queryBuilder.andWhere('movement.movementType = :movementType', { 
        movementType: filterDto.movementType 
      });
    }

    if (filterDto.userId) {
      queryBuilder.andWhere('movement.userId = :userId', { userId: filterDto.userId });
    }

    if (filterDto.startDate) {
      queryBuilder.andWhere('movement.createdAt >= :startDate', { startDate: filterDto.startDate });
    }

    if (filterDto.endDate) {
      queryBuilder.andWhere('movement.createdAt <= :endDate', { endDate: filterDto.endDate });
    }

    if (filterDto.referenceNumber) {
      queryBuilder.andWhere('movement.referenceNumber ILIKE :referenceNumber', { 
        referenceNumber: `%${filterDto.referenceNumber}%` 
      });
    }

    return await queryBuilder
      .orderBy('movement.createdAt', 'DESC')
      .getMany();
  }

  private async createStockMovement(data: Partial<StockMovement>): Promise<StockMovement> {
    const movement = this.stockMovementRepository.create(data);
    return await this.stockMovementRepository.save(movement);
  }

  // Alert Mgt

  async createStockAlert(alertData: Partial<StockAlert>): Promise<StockAlert> {
    const alert = this.stockAlertRepository.create(alertData);
    return await this.stockAlertRepository.save(alert);
  }

  async getActiveAlerts(): Promise<StockAlert[]> {
    return await this.stockAlertRepository.find({
      where: { 
        isActive: true,
        status: AlertStatus.ACTIVE
      },
      relations: ['inventoryItem'],
      order: { createdAt: 'DESC' }
    });
  }

  async acknowledgeAlert(alertId: string, userId: string): Promise<StockAlert> {
    const alert = await this.stockAlertRepository.findOne({ where: { id: alertId } });
    
    if (!alert) {
      throw new NotFoundException(`Alert with ID ${alertId} not found`);
    }

    alert.status = AlertStatus.ACKNOWLEDGED;
    alert.acknowledgedBy = userId;
    alert.acknowledgedAt = new Date();

    return await this.stockAlertRepository.save(alert);
  }

  private async checkAndTriggerAlerts(item: InventoryItem, queryRunner: QueryRunner): Promise<void> {
    // Check for low stock alert
    if (item.reorderPoint && item.currentStock <= item.reorderPoint) {
      const existingAlert = await queryRunner.manager.findOne(StockAlert, {
        where: {
          inventoryItemId: item.id,
          alertType: AlertType.LOW_STOCK,
          status: AlertStatus.ACTIVE
        }
      });

      if (!existingAlert) {
        const alert = queryRunner.manager.create(StockAlert, {
          inventoryItemId: item.id,
          alertType: AlertType.LOW_STOCK,
          thresholdValue: item.reorderPoint,
          lastTriggered: new Date()
        });

        await queryRunner.manager.save(alert);
        this.logger.warn(`Low stock alert triggered for item ${item.sku}`);
      }
    }

    // Check out of stock alert

    if (item.currentStock <= 0) {
      const existingAlert = await queryRunner.manager.findOne(StockAlert, {
        where: {
          inventoryItemId: item.id,
          alertType: AlertType.OUT_OF_STOCK,
          status: AlertStatus.ACTIVE
        }
      });

      if (!existingAlert) {
        const alert = queryRunner.manager.create(StockAlert, {
          inventoryItemId: item.id,
          alertType: AlertType.OUT_OF_STOCK,
          thresholdValue: 0,
          lastTriggered: new Date()
        });

        await queryRunner.manager.save(alert);
        this.logger.error(`Out of stock alert triggered for item ${item.sku}`);
      }
    }
  }

  // Low Stock Items

  async getLowStockItems(): Promise<InventoryItem[]> {
    return await this.inventoryRepository
      .createQueryBuilder('item')
      .where('item.currentStock <= item.reorderPoint')
      .andWhere('item.reorderPoint IS NOT NULL')
      .andWhere('item.isActive = :isActive', { isActive: true })
      .orderBy('item.currentStock', 'ASC')
      .getMany();
  }

  // Inventory Valuation
  
  async getInventoryValuation(): Promise<{ totalValue: number, totalItems: number, itemsCount: number }> {
    const result = await this.inventoryRepository
      .createQueryBuilder('item')
      .select([
        'SUM(item.currentStock * item.unitCost) as totalValue',
        'SUM(item.currentStock) as totalItems',
        'COUNT(*) as itemsCount'
      ])
      .where('item.isActive = :isActive', { isActive: true })
      .andWhere('item.unitCost IS NOT NULL')
      .getRawOne();

    return {
      totalValue: parseFloat(result.totalValue) || 0,
      totalItems: parseInt(result.totalItems) || 0,
      itemsCount: parseInt(result.itemsCount) || 0
    };
  }
}