import { Module } from '@nestjs/common';
import { MetricsController } from './metrics.controller';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';

@Module({
  imports: [
    PrometheusModule.register({
      defaultMetrics: {
        enabled: true,
        config: { 
          prefix: 'nestjs_',
        }
      }
    })
  ],
  controllers: [MetricsController]
})
export class MetricsModule {}