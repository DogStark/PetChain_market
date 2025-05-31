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

@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

}
