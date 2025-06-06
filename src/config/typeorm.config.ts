import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import * as dotenv from 'dotenv';
import { Review } from '../review/entities/review.entity';
import { Auth } from '../auth/entities/auth.entity';
import { Customer } from '../customer/entities/customer.entity';
import { LoyaltyPoint } from '../loyalty/entities/loyalty.entity';
import { TimeSlot } from '../scheduling/entities/time-slot.entity';
import { Staff } from '../veterinarian/staff/entities/staff.entity';
import { Subscription } from '../subscription/entities/subscription.entity';
import { Cart } from '../Shopping Cart Module/cart.entity';
import { Category } from '../Product Catalog System/category/entities/category.entity';
import { Inventory } from '../Product Catalog System/inventory/entities/inventory.entity';
import { Product } from '../Product Catalog System/product/entities/product.entity';
import { ProductVariant } from '../Product Catalog System/product/entities/product-variant.entity';
import { ProductImage } from '../Product Catalog System/product/entities/product-image.entity';
import { Prescription } from '../prescription/entities/prescription.entity';
import { PrescriptionRefill } from '../prescription/entities/prescription-refill.entity';
import { CartItem } from '../Shopping Cart Module/cart-item.entity';
import { Photo } from '../photo/entities/photo.entity';
import { Pet } from '../pet/entities/pet.entity';
import { Payment } from '../payment/entities/payment.entity';
import { Order } from '../Order Management System/entities/order.entity';
import { MedicalHistory } from '../medical/entities/medical.entity';
import { InventoryItem } from '../inventory/entities/inventory-item.entity';
import { InsuranceClaim } from '../insurance/entities/insurance-claim.entity';
import { InsuranceProvider } from '../insurance/entities/insurance-provider.entity';
import { InsurancePolicy } from '../insurance/entities/insurance-policy.entity';
import { ClaimDocument } from '../insurance/entities/claim-document.entity';
import { GroomingAppointment } from '../grooming/entities/grooming-appointment.entity';
import { GroomingPackage } from '../grooming/entities/grooming-package.entity';
import { EmergencyAppointment } from '../emergency-booking/entities/emergency-appointment.entity';
import { Activity } from '../boarding/entities/activity.entity';
import { BoardingFacility } from '../boarding/entities/boarding-facility.entity';
import { Booking } from '../boarding/entities/booking.entity';
import { PricingPackage } from '../boarding/entities/pricing-package.entity';
import { AuditLog } from '../admin/entities/audit-log.entity';
import { ConfigEntity } from '../admin/entities/config.entity';

dotenv.config();

export const typeOrmConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: process.env['DB_HOST'] || 'localhost',
  port: parseInt(process.env['DB_PORT'] || '5432'),
  username: process.env['DB_USERNAME'] || 'postgres',
  password: process.env['DB_PASSWORD'] || 'postgres',
  database: process.env['DB_NAME'] || 'petchain',
  entities: [
    User,
    Auth,
    Review,
    LoyaltyPoint,
    Customer,
    Staff,
    TimeSlot,
    Subscription,
    Cart,
    Category,
    Inventory,
    Product,
    ProductVariant,
    ProductImage,
    Prescription,
    PrescriptionRefill,
    CartItem,
    Photo,
    Pet,
    Payment,
    Order,
    MedicalHistory,
    Inventory,
    InventoryItem,
    InsuranceClaim,
    InsurancePolicy,
    InsuranceProvider,
    ClaimDocument,
    GroomingAppointment,
    GroomingPackage,
    EmergencyAppointment,
    Activity,
    BoardingFacility,
    Booking,
    PricingPackage,
    AuditLog,
    ConfigEntity,
  ],
  synchronize: process.env['NODE_ENV'] !== 'production',
  logging: process.env['NODE_ENV'] === 'development',
};
