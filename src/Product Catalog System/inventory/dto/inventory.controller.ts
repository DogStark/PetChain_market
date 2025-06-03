import { Controller, Get, Put, Body, Param, ParseIntPipe, Post } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { UpdateInventoryDto } from './dto/update-inventory.dto';

@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get()
  getAllInventory() {
    return this.inventoryService.getAllInventory();
  }

  @Get('low-stock')
  getLowStockProducts() {
    return this.inventoryService.getLowStockProducts();
  }

  @Get('product/:productId')
  getInventory(@Param('productId', ParseIntPipe) productId: number) {
    return this.inventoryService.getInventory(productId);
  }

  @Put('product/:productId')
  updateInventory(
    @Param('productId', ParseIntPipe) productId: number,
    @Body() updateDto: UpdateInventoryDto,
  ) {
    return this.inventoryService.updateInventory(productId, updateDto);
  }

  @Post('product/:productId/adjust')
  adjustStock(
    @Param('productId', ParseIntPipe) productId: number,
    @Body('quantity', ParseIntPipe) quantity: number,
  ) {
    return this.inventoryService.adjustStock(productId, quantity);
  }
}