import { 
  Controller, 
  Post, 
  Get, 
  Put, 
  Patch,
  Body, 
  Param, 
  Query,
  UseGuards,
  Request,
  HttpStatus
} from '@nestjs/common';
import { OrderService } from '../services/order.service';
import { CreateOrderDto } from '../dto/create-order.dto';
import { UpdateOrderStatusDto } from '../dto/update-order-status.dto';
import { CancelOrderDto } from '../dto/cancel-order.dto';
import { OrderQueryDto } from '../dto/order-query.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { AdminGuard } from '../guards/admin.guard';

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  async createOrder(@Body() createOrderDto: CreateOrderDto, @Request() req) {
    const order = await this.orderService.createOrderFromCart(createOrderDto, req.user.id);
    return {
      status: HttpStatus.CREATED,
      message: 'Order created successfully',
      data: order
    };
  }

  @Get()
  async getOrderHistory(@Query() query: OrderQueryDto, @Request() req) {
    const result = await this.orderService.getOrderHistory(req.user.id, query);
    return {
      status: HttpStatus.OK,
      message: 'Order history retrieved successfully',
      data: result.orders,
      pagination: {
        page: query.page,
        limit: query.limit,
        total: result.total,
        totalPages: Math.ceil(result.total / query.limit)
      }
    };
  }

  @Get(':id')
  async getOrder(@Param('id') id: string, @Request() req) {
    const order = await this.orderService.getOrderById(id, req.user.id);
    return {
      status: HttpStatus.OK,
      message: 'Order retrieved successfully',
      data: order
    };
  }

  @Get(':id/history')
  async getOrderStatusHistory(@Param('id') id: string, @Request() req) {
    const history = await this.orderService.getOrderStatusHistory(id, req.user.id);
    return {
      status: HttpStatus.OK,
      message: 'Order status history retrieved successfully',
      data: history
    };
  }

  @Patch(':id/cancel')
  async cancelOrder(
    @Param('id') id: string,
    @Body() cancelDto: CancelOrderDto,
    @Request() req
  ) {
    const order = await this.orderService.cancelOrder(id, cancelDto, req.user.id);
    return {
      status: HttpStatus.OK,
      message: 'Order cancelled successfully',
      data: order
    };
  }

  // Admin endpoints
  @Get('admin/all')
  @UseGuards(AdminGuard)
  async getAllOrders(@Query() query: OrderQueryDto) {
    const result = await this.orderService.getAllOrders(query);
    return {
      status: HttpStatus.OK,
      message: 'All orders retrieved successfully',
      data: result.orders,
      pagination: {
        page: query.page,
        limit: query.limit,
        total: result.total,
        totalPages: Math.ceil(result.total / query.limit)
      }
    };
  }

  @Put('admin/:id/status')
  @UseGuards(AdminGuard)
  async updateOrderStatus(
    @Param('id') id: string,
    @Body() updateDto: UpdateOrderStatusDto,
    @Request() req
  ) {
    const order = await this.orderService.updateOrderStatus(id, updateDto, req.user.id);
    return {
      status: HttpStatus.OK,
      message: 'Order status updated successfully',
      data: order
    };
  }

  @Post('admin/:id/fulfill')
  @UseGuards(AdminGuard)
  async fulfillOrder(@Param('id') id: string) {
    const order = await this.orderService.fulfillOrder(id);
    return {
      status: HttpStatus.OK,
      message: 'Order fulfillment initiated',
      data: order
    };
  }
}
