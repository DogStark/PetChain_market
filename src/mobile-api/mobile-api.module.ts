import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApiVersionGuard } from './versioning/api-version.guard';
import { OfflineSyncService } from './offline-sync/offline-sync.service';
import { SyncEntity } from './offline-sync/sync.entity';
import { PushNotificationService } from './push-notifications/push-notification.service';
import { DeviceToken } from './push-notifications/device-token.entity';
import { ResponseOptimizerService } from './optimization/response-optimizer.service';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([SyncEntity, DeviceToken]),
  ],
  providers: [
    ApiVersionGuard,
    OfflineSyncService,
    PushNotificationService,
    ResponseOptimizerService,
  ],
  exports: [
    ApiVersionGuard,
    OfflineSyncService,
    PushNotificationService,
    ResponseOptimizerService,
  ],
})
export class MobileApiModule {} 