import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Connection } from 'typeorm';
import * as os from 'os';
import * as process from 'process';

interface PerformanceMetric {
  timestamp: Date;
  type: 'database' | 'memory' | 'cpu' | 'api' | 'cache';
  name: string;
  value: number;
  unit: string;
  metadata?: Record<string, any> | undefined;
}

@Injectable()
export class PerformanceService {
  private readonly logger = new Logger(PerformanceService.name);
  private metrics: PerformanceMetric[] = [];
  private readonly maxMetrics = 10000;

  constructor(private connection: Connection) {}

  recordMetric(
    type: PerformanceMetric['type'],
    name: string,
    value: number,
    unit: string,
    metadata?: Record<string, any>
  ): void {
    const metric: PerformanceMetric = {
      timestamp: new Date(),
      type,
      name,
      value,
      unit,
      metadata
    };

    this.metrics.push(metric);

    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }

    if (this.isCriticalValue(type, name, value)) {
      this.logger.warn(`Critical metric: ${name} = ${value}${unit}`, metadata);
    }
  }


  getMetrics(options: {
    type?: PerformanceMetric['type'];
    name?: string;
    since?: Date;
    limit?: number;
  } = {}): PerformanceMetric[] {
    let filtered = this.metrics;

    if (options.type) {
      filtered = filtered.filter(m => m.type === options.type);
    }

    if (options.name) {
      filtered = filtered.filter(m => m.name && m.name.includes(options.name as string));
    }

    if (options.since) {
      filtered = filtered.filter(m => m.timestamp >= options.since!);
    }

    if (options.limit) {
      filtered = filtered.slice(-options.limit);
    }

    return filtered;
  }

  getAggregatedMetrics(
    type: PerformanceMetric['type'],
    name: string,
    period: 'hour' | 'day' = 'hour'
  ): {
    average: number;
    min: number;
    max: number;
    count: number;
    p95: number;
    p99: number;
  } {
    const since = new Date();
    since.setHours(since.getHours() - (period === 'hour' ? 1 : 24));

    const relevantMetrics = this.getMetrics({ type, name, since });
    const values = relevantMetrics.map(m => m.value).sort((a, b) => a - b);

    if (values.length === 0) {
      return { average: 0, min: 0, max: 0, count: 0, p95: 0, p99: 0 };
    }

    const sum = values.reduce((acc, val) => acc + val, 0);
    const p95Index = Math.floor(values.length * 0.95);
    const p99Index = Math.floor(values.length * 0.99);

    return {
      average: sum / values.length,
      min: values[0] ?? 0,
      max: values[values.length - 1] ?? 0,
      count: values.length,
      p95: values[p95Index] || 0,
      p99: values[p99Index] || 0
    };
  }


  @Cron(CronExpression.EVERY_MINUTE)
  async monitorDatabase(): Promise<void> {
    try {
 
      const pool = (this.connection.driver as any).master;
      if (pool) {
        this.recordMetric('database', 'connection_pool_total', pool.totalCount, 'connections');
        this.recordMetric('database', 'connection_pool_idle', pool.idleCount, 'connections');
        this.recordMetric('database', 'connection_pool_waiting', pool.waitingCount, 'connections');
      }


      const slowQueries = await this.connection.manager.query(`
        SELECT 
          COUNT(*) as slow_query_count,
          AVG(mean_time) as avg_execution_time
        FROM pg_stat_statements 
        WHERE mean_time > 1000
      `);

      if (slowQueries[0]) {
        this.recordMetric('database', 'slow_queries', slowQueries[0].slow_query_count, 'count');
        this.recordMetric('database', 'avg_query_time', slowQueries[0].avg_execution_time || 0, 'ms');
      }

      const dbSize = await this.connection.manager.query(`
        SELECT pg_database_size(current_database()) as size_bytes
      `);

      if (dbSize[0]) {
        this.recordMetric('database', 'size', Math.round(dbSize[0].size_bytes / 1024 / 1024), 'MB');
      }

    } catch (error) {
      this.logger.error('Database monitoring failed:', error);
    }
  }

  @Cron(CronExpression.EVERY_30_SECONDS)
  monitorSystemResources(): void {

    const memUsage = process.memoryUsage();
    this.recordMetric('memory', 'heap_used', Math.round(memUsage.heapUsed / 1024 / 1024), 'MB');
    this.recordMetric('memory', 'heap_total', Math.round(memUsage.heapTotal / 1024 / 1024), 'MB');
    this.recordMetric('memory', 'rss', Math.round(memUsage.rss / 1024 / 1024), 'MB');

    const cpuUsage = process.cpuUsage();
    this.recordMetric('cpu', 'user_time', cpuUsage.user / 1000, 'ms');
    this.recordMetric('cpu', 'system_time', cpuUsage.system / 1000, 'ms');

    const loadAvg = os.loadavg();
    this.recordMetric('cpu', 'load_1min', loadAvg[0] ?? 0, 'ratio');
    this.recordMetric('cpu', 'load_5min', loadAvg[1] ?? 0, 'ratio');
    this.recordMetric('cpu', 'load_15min', loadAvg[2] ?? 0, 'ratio');

    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    this.recordMetric('memory', 'system_used', Math.round(usedMem / 1024 / 1024), 'MB');
    this.recordMetric('memory', 'system_free', Math.round(freeMem / 1024 / 1024), 'MB');
    this.recordMetric('memory', 'system_usage_percent', Math.round((usedMem / totalMem) * 100), '%');
  }


  generateReport(): {
    database: any;
    memory: any;
    cpu: any;
    api: any;
    cache: any;
    alerts: string[];
  } {
    const report = {
      database: this.getAggregatedMetrics('database', 'avg_query_time'),
      memory: this.getAggregatedMetrics('memory', 'heap_used'),
      cpu: this.getAggregatedMetrics('cpu', 'load_1min'),
      api: this.getAggregatedMetrics('api', 'response_time'),
      cache: this.getAggregatedMetrics('cache', 'hit_rate'),
      alerts: this.generateAlerts()
    };

    return report;
  }

  private isCriticalValue(type: string, name: string, value: number): boolean {
    const thresholds: Record<string, number> = {
      'memory.heap_used': 512, 
      'cpu.load_1min': 2.0,
      'database.slow_queries': 10,
      'api.response_time': 2000, 
      'cache.hit_rate': 70 
    };

    const key = `${type}.${name}`;
    const threshold = thresholds[key];

    if (!threshold) return false;

    if (name === 'hit_rate') {
      return value < threshold;
    }

    return value > threshold;
  }

  private generateAlerts(): string[] {
    const alerts: string[] = [];
    const recentMetrics = this.getMetrics({
      since: new Date(Date.now() - 5 * 60 * 1000)
    });

    const groupedMetrics = recentMetrics.reduce((acc, metric) => {
      const key = `${metric.type}.${metric.name}`;
      if (!acc[key]) acc[key] = [];
      acc[key].push(metric.value);
      return acc;
    }, {} as Record<string, number[]>);

    Object.entries(groupedMetrics).forEach(([key, values]) => {
      const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
      const [type, name] = key.split('.');
      
      if (type && name && this.isCriticalValue(type, name, avg)) {
        alerts.push(`${key}: ${avg.toFixed(2)} (${values.length} samples)`);
      }
    });

    return alerts;
  }
}