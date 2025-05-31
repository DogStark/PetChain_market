import { Injectable } from '@nestjs/common';
import { PerformanceService } from './performance.service';

export interface PerformanceMetric {
  value: number;
  metadata: Record<string, any>;
  name: string;
  [key: string]: any;
}

@Injectable()
export class MetricsService {
  constructor(private performanceService: PerformanceService) {}

  getPrometheusMetrics(): string {
    const metrics = this.performanceService.getMetrics({
      since: new Date(Date.now() - 60000) 
    });

    const prometheusLines: string[] = [];
    const metricGroups = this.groupMetricsByName(metrics) as Record<string, Array<{ value: number; metadata: Record<string, any> }>>;

    Object.entries(metricGroups).forEach(([name, metricList]) => {
      const sanitizedName = name.replace(/[^a-zA-Z0-9_]/g, '_');
      prometheusLines.push(`# TYPE ${sanitizedName} gauge`);
      
      metricList.forEach(metric => {
        const labels = this.formatLabels(metric.metadata);
        prometheusLines.push(`${sanitizedName}${labels} ${metric.value}`);
      });
    });

    return prometheusLines.join('\n');
  }
    formatLabels(metadata: Record<string, any>) {
        const keys = Object.keys(metadata || {});
        if (keys.length === 0) return '';
        const labelString = keys
            .map(key => `${key}="${String(metadata[key]).replace(/"/g, '\\"')}"`)
            .join(',');
        return `{${labelString}}`;
    }
    groupMetricsByName(metrics: PerformanceMetric[]): Record<string, { value: number; metadata: Record<string, any>; }[]> {
        const groups: Record<string, { value: number; metadata: Record<string, any>; }[]> = {};
        metrics.forEach(metric => {
            const name = metric.name;
            if (!groups[name]) groups[name] = [];
            groups[name].push({
                value: metric.value,
                metadata: metric.metadata ?? {},
            });
        });
        return groups;
    }

  getHealthMetrics(): {
    status: 'healthy' | 'degraded' | 'unhealthy';
    checks: Record<string, boolean>;
    metrics: any;
  } {
    const report = this.performanceService.generateReport();
    const checks = {
      database: report.database.average < 1000, 
      memory: report.memory.average < 512, 
      cpu: report.cpu.average < 2.0, 
    };

    let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
    if (!checks.database || !checks.memory || !checks.cpu) {
      status = 'unhealthy';
    } else if (!checks.database || !checks.memory || !checks.cpu) {
      status = 'degraded';
    }

    return {
      status,
      checks,
      metrics: report
    };
  }
}