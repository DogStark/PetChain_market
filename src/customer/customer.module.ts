import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Customer } from './entities/customer.entity';
import { CustomerService } from './services/customer.service';
import { CustomerController } from './controllers/customer.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Customer])],
  providers: [CustomerService],
  controllers: [CustomerController],
  exports: [CustomerService],
})
export class CustomerModule {}
