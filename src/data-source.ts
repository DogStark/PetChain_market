import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { User } from './user/entities/user.entity';
import { Review } from './review/entities/review.entity';
import { Auth } from './auth/entities/auth.entity';
import { Customer } from './customer-pet/entities/customer-pet.entity';
import { LoyaltyPoint } from './loyalty/entities/loyalty.entity';
import { TimeSlot } from './scheduling/entities/time-slot.entity';
import { Staff } from './veterinarian/staff/entities/staff.entity';
import { Subscription } from './subscription/entities/subscription.entity';
import { Cart } from './Shopping Cart Module/cart.entity';
import { Category } from './Product Catalog System/category/entities/category.entity';
import { Inventory } from './Product Catalog System/inventory/entities/inventory.entity';
import { Product } from './Product Catalog System/product/entities/product.entity';
import { ProductVariant } from './Product Catalog System/product/entities/product-variant.entity';
import { ProductImage } from './Product Catalog System/product/entities/product-image.entity';
import { Prescription } from './prescription/entities/prescription.entity';
import { PrescriptionRefill } from './prescription/entities/prescription-refill.entity';
import { CartItem } from './Shopping Cart Module/cart-item.entity';
import { Pet } from './customer-pet/entities/pet.entity';
import { Payment } from './payment/entities/payment.entity';
import { SubscriptionPlan } from './subscription/entities/subscription-plan.entity';
import { MedicalHistory } from './medical/entities/medical.entity';
import { InventoryItem } from './inventory/entities/inventory-item.entity';
import { InsuranceClaim } from './insurance/entities/insurance-claim.entity';
import { InsuranceProvider } from './insurance/entities/insurance-provider.entity';
import { InsurancePolicy } from './insurance/entities/insurance-policy.entity';
import { ClaimDocument } from './insurance/entities/claim-document.entity';
import { GroomingAppointment } from './grooming/entities/grooming-appointment.entity';
import { GroomingPackage } from './grooming/entities/grooming-package.entity';
import { EmergencyAppointment } from './emergency-booking/entities/emergency-appointment.entity';
import { Activity } from './boarding/entities/activity.entity';
import { Order } from './order/entities/order.entity';
import { BoardingFacility } from './boarding/entities/boarding-facility.entity';
import { Booking } from './boarding/entities/booking.entity';
import { PricingPackage } from './boarding/entities/pricing-package.entity';
import { AuditLog } from './admin/entities/audit-log.entity';
import { ConfigEntity } from './admin/entities/config.entity';
import { ReviewResponse } from './review/entities/response-review.dto';
import { Photo } from './boarding/entities/photo.entity';
import { Address } from './customer-pet/entities/address.entity';
import { AvailabilitySchedule } from './Veterinarian and Staff Module/entities/availability-schedule.entity';
import { Veterinarian } from './Veterinarian and Staff Module/entities/veterinarian.entity';
import { Credential } from './Veterinarian and Staff Module/entities/credential.entity';
import { Specialization } from './Veterinarian and Staff Module/entities/specialization.entity';
import { StockMovement } from './inventory/entities/stock-movement.entity';
import { StockAlert } from './inventory/entities/stock-alert.entity';
import { PreAuthorization } from './insurance/entities/pre-authorization.entity';

const isTest = process.env['NODE_ENV'] === 'test' ? true : false;
const envFile = isTest ? '.env.test' : '.env';
dotenv.config({ path: envFile });

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env['DB_HOST'] || 'localhost',
  port: parseInt(process.env['DB_PORT'] || '5432', 10),
  username: process.env['DB_USERNAME'] || 'postgres',
  password: process.env['DB_PASSWORD'] || 'postgres',
  database: process.env['DB_NAME'] || 'postgres',
  entities: [
    User,
    Auth,
    Review,
    ReviewResponse,
    LoyaltyPoint,
    Customer,
    Staff,
    Specialization,
    TimeSlot,
    Subscription,
    Cart,
    Category,
    Inventory,
    AvailabilitySchedule,
    Product,
    ProductVariant,
    ProductImage,
    Prescription,
    PrescriptionRefill,
    CartItem,
    Address,
    Photo,
    Pet,
    StockMovement,
    Credential,
    Payment,
    Order,
    MedicalHistory,
    Inventory,
    InventoryItem,
    InsuranceClaim,
    InsurancePolicy,
    InsuranceProvider,
    StockAlert,
    ClaimDocument,
    GroomingAppointment,
    GroomingPackage,
    EmergencyAppointment,
    Activity,
    PreAuthorization,
    BoardingFacility,
    Booking,
    PricingPackage,
    AuditLog,
    Veterinarian,
    ConfigEntity,
    SubscriptionPlan,
  ],
  migrations: [isTest ? 'src/migrations/test/*.ts' : 'src/migrations/*.ts'],
  synchronize: false,
});
