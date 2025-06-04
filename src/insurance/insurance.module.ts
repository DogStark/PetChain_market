import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';

// Controllers
import { InsuranceController } from './controllers/insurance.controller';

// Services
import { InsuranceProvidersService } from './services/insurance-providers.service';
import { ClaimsService } from './services/claims.service';
import { PreAuthorizationService } from './services/pre-authorization.service';
import { BillingService } from './services/billing.service';

// Entities
import { InsuranceProvider } from './entities/insurance-provider.entity';
import { InsurancePolicy } from './entities/insurance-policy.entity';
import { InsuranceClaim } from './entities/insurance-claim.entity';
import { ClaimDocument } from './entities/claim-document.entity';
import { PreAuthorization } from './entities/pre-authorization.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      InsuranceProvider,
      InsurancePolicy,
      InsuranceClaim,
      ClaimDocument,
      PreAuthorization,
    ]),
    HttpModule.register({
      timeout: 30000, 
      maxRedirects: 5,
    }),
    ConfigModule,
  ],
  controllers: [InsuranceController],
  providers: [
    InsuranceProvidersService,
    ClaimsService,
    PreAuthorizationService,
    BillingService,
  ],
  exports: [
    InsuranceProvidersService,
    ClaimsService,
    PreAuthorizationService,
    BillingService,
  ],
})
export class InsuranceModule {}
