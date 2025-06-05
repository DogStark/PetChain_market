import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
  HttpStatus,
  HttpCode,
  ParseUUIDPipe,
  ValidationPipe,
  UsePipes,
} from '@nestjs/common';

import { InventoryService } from './inventory.service';
import { CreateInventoryItemDto } from './dto/create-inventory-item.dto';
import { UpdateInventoryItemDto } from './dto/update-inventory-item.dto';
import { StockAdjustmentDto } from './dto/stock-adjustment.dto';
import { InventoryFilterDto } from './dto/inventory-filter.dto';
import { StockMovementFilterDto } from './dto/stock-movement-filter.dto';
import { CreateStockAlertDto } from './dto/create-stock-alert.dto';
import {
  UpdateInventoryDto,
  InventoryAdjustmentDto,
} from './dto/update-inventory.dto';

@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get('product/:productId')
  @ApiOperation({ summary: 'Get inventory by product ID' })
  @ApiResponse({ status: 200, description: 'Inventory retrieved successfully' })
  findByProductId(@Param('productId', ParseUUIDPipe) productId: string) {
    return this.inventoryService.findByProductId(productId);
  }

  @Patch('product/:productId')
  @ApiOperation({ summary: 'Update inventory' })
  @ApiResponse({ status: 200, description: 'Inventory updated successfully' })
  updateInventory(
    @Param('productId', ParseUUIDPipe) productId: string,
    @Body() updateDto: UpdateInventoryDto,
  ) {
    return this.inventoryService.updateInventory(productId, updateDto);
  }

  @Post('product/:productId/adjust')
  @ApiOperation({ summary: 'Adjust stock quantity' })
  @ApiResponse({ status: 200, description: 'Stock adjusted successfully' })
  adjustStock(
    @Param('productId', ParseUUIDPipe) productId: string,
    @Body() adjustmentDto: InventoryAdjustmentDto,
  ) {
    return this.inventoryService.adjustStock(productId, adjustmentDto);
  }

  @Post('product/:productId/reserve')
  @ApiOperation({ summary: 'Reserve stock' })
  @ApiResponse({ status: 200, description: 'Stock reserved successfully' })
  reserveStock(
    @Param('productId', ParseUUIDPipe) productId: string,
    @Body() body: { quantity: number },
  ) {
    return this.inventoryService.reserveStock(productId, body.quantity);
  }

  @Post('product/:productId/release')
  @ApiOperation({ summary: 'Release reserved stock' })
  @ApiResponse({ status: 200, description: 'Stock released successfully' })
  releaseStock(
    @Param('productId', ParseUUIDPipe) productId: string,
    @Body() body: { quantity: number },
  ) {
    return this.inventoryService.releaseStock(productId, body.quantity);
  }

  @Get('alerts/low-stock')
  @ApiOperation({ summary: 'Get low stock items' })
  @ApiResponse({
    status: 200,
    description: 'Low stock items retrieved successfully',
  })
  getLowStockItems() {
    return this.inventoryService.getLowStockItems();
  }

  @Get('alerts/out-of-stock')
  @ApiOperation({ summary: 'Get out of stock items' })
  @ApiResponse({
    status: 200,
    description: 'Out of stock items retrieved successfully',
  })
  getOutOfStockItems() {
    return this.inventoryService.getOutOfStockItems();
  }
}
