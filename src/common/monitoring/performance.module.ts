import { Module, Global } from '@nestjs/common';
import { PerformanceService } from './performance.service';
import { MetricsService } from './metrics.service';
import { TerminusModule } from '@nestjs/terminus';

@Global()
@Module({
  imports: [TerminusModule],
  providers: [PerformanceService, MetricsService],
  exports: [PerformanceService, MetricsService],
})
export class PerformanceMonitoringModule {}
