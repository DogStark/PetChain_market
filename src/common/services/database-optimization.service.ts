import { Injectable, Logger } from '@nestjs/common';
import { Connection } from 'typeorm';

@Injectable()
export class DatabaseOptimizationService {
  private readonly logger = new Logger(DatabaseOptimizationService.name);

  constructor(private connection: Connection) {}


  async analyzeQuery(query: string, params?: any[]): Promise<{
    executionPlan: any[];
    suggestions: string[];
    estimatedCost: number;
  }> {
    const manager = this.connection.manager;
    
    try {
      const explainQuery = `EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) ${query}`;
      const result = await manager.query(explainQuery, params);
      const plan = result[0]['QUERY PLAN'][0];

      const suggestions = this.generateOptimizationSuggestions(plan);
      const estimatedCost = plan['Total Cost'] || 0;

      return {
        executionPlan: result,
        suggestions,
        estimatedCost
      };
    } catch (error) {
      this.logger.error('Query analysis failed:', error);
      return {
        executionPlan: [],
        suggestions: ['Query analysis failed. Check query syntax.'],
        estimatedCost: 0
      };
    }
  }


  async monitorSlowQueries(thresholdMs: number = 1000): Promise<void> {
    const slowQueries = await this.connection.manager.query(`
      SELECT query, mean_time, calls, total_time
      FROM pg_stat_statements
      WHERE mean_time > $1
      ORDER BY mean_time DESC
      LIMIT 10
    `, [thresholdMs]);

    if (slowQueries.length > 0) {
      this.logger.warn(`Found ${slowQueries.length} slow queries:`);
      slowQueries.forEach((query: any) => {
        this.logger.warn(`Query: ${query.query.substring(0, 100)}...`);
        this.logger.warn(`Mean time: ${query.mean_time}ms, Calls: ${query.calls}`);
      });
    }
  }


  async suggestIndexes(tableName: string): Promise<string[]> {
    const suggestions: string[] = [];

    try {
      const tableStats = await this.connection.manager.query(`
        SELECT 
          schemaname,
          tablename,
          seq_scan,
          seq_tup_read,
          idx_scan,
          idx_tup_fetch
        FROM pg_stat_user_tables 
        WHERE tablename = $1
      `, [tableName]);

      if (tableStats.length > 0) {
        const stats = tableStats[0];
        
        const seqScanRatio = stats.seq_scan / (stats.seq_scan + (stats.idx_scan || 1));
        if (seqScanRatio > 0.7) {
          suggestions.push(`Consider adding indexes to ${tableName} - high sequential scan ratio: ${(seqScanRatio * 100).toFixed(1)}%`);
        }

        const columnUsage = await this.analyzeColumnUsage(tableName);
        columnUsage.forEach(column => {
          suggestions.push(`CREATE INDEX idx_${tableName}_${column} ON ${tableName} (${column});`);
        });
      }
    } catch (error) {
      this.logger.error('Index suggestion failed:', error);
    }

    return suggestions;
  }


  async updateTableStatistics(tableName?: string): Promise<void> {
    try {
      if (tableName) {
        await this.connection.manager.query(`ANALYZE ${tableName}`);
        this.logger.log(`Updated statistics for table: ${tableName}`);
      } else {
        await this.connection.manager.query('ANALYZE');
        this.logger.log('Updated statistics for all tables');
      }
    } catch (error) {
      this.logger.error('Statistics update failed:', error);
    }
  }

 
  async findUnusedIndexes(): Promise<Array<{
    schemaname: string;
    tablename: string;
    indexname: string;
    idx_scan: number;
  }>> {
    return this.connection.manager.query(`
      SELECT 
        schemaname,
        tablename,
        indexname,
        idx_scan
      FROM pg_stat_user_indexes
      WHERE idx_scan < 10
      AND schemaname = 'public'
      ORDER BY idx_scan ASC
    `);
  }

  private generateOptimizationSuggestions(plan: any): string[] {
    const suggestions: string[] = [];

    if (this.hasSequentialScan(plan)) {
      suggestions.push('Consider adding indexes to reduce sequential scans');
    }

    if (plan['Total Cost'] > 10000) {
      suggestions.push('Query has high cost - review joins and WHERE conditions');
    }

    if (this.hasNestedLoop(plan)) {
      suggestions.push('Nested loop detected - ensure proper indexing on join columns');
    }

    if (plan['Actual Rows'] && plan['Plan Rows']) {
      const estimationError = Math.abs(plan['Actual Rows'] - plan['Plan Rows']) / plan['Actual Rows'];
      if (estimationError > 0.5) {
        suggestions.push('Large estimation error - run ANALYZE to update table statistics');
      }
    }

    return suggestions;
  }

  private hasSequentialScan(plan: any): boolean {
    if (plan['Node Type'] === 'Seq Scan') return true;
    if (plan['Plans']) {
      return plan['Plans'].some((subPlan: any) => this.hasSequentialScan(subPlan));
    }
    return false;
  }

  private hasNestedLoop(plan: any): boolean {
    if (plan['Node Type'] === 'Nested Loop') return true;
    if (plan['Plans']) {
      return plan['Plans'].some((subPlan: any) => this.hasNestedLoop(subPlan));
    }
    return false;
  }

  private async analyzeColumnUsage(tableName: string): Promise<string[]> {
    const commonIndexColumns = ['id', 'created_at', 'updated_at', 'status'];
    return commonIndexColumns;
  }
}