import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { Address } from "./entities/address.entity"
import { Pet } from "../pet/entities/pet.entity"
import { CustomerController } from "./controllers/customer-pet.controller"
import { Customer } from "./entities/customer-pet.entity"
import { CustomerService } from "./providers/customer-pet.service"

@Module({
  imports: [TypeOrmModule.forFeature([Customer, Address, Pet])],
  controllers: [CustomerController],
  providers: [CustomerService],
  exports: [CustomerService, TypeOrmModule],
})
export class CustomerModule {}
