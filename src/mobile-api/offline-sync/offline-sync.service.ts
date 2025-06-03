import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SyncEntity } from './sync.entity';

@Injectable()
export class OfflineSyncService {
  constructor(
    @InjectRepository(SyncEntity)
    private syncRepository: Repository<SyncEntity>,
  ) {}

  async handleSyncRequest(
    userId: string,
    lastSyncTimestamp: number,
    changes: any[],
  ): Promise<{ conflicts: any[]; updates: any[] }> {
    // Get local changes since last sync
    const localChanges = await this.getLocalChanges(userId, lastSyncTimestamp);

    // Detect conflicts
    const conflicts = this.detectConflicts(localChanges, changes);

    // Merge non-conflicting changes
    const updates = this.mergeChanges(localChanges, changes);

    // Update sync timestamp
    await this.updateSyncTimestamp(userId);

    return { conflicts, updates };
  }

  private async getLocalChanges(
    userId: string,
    lastSyncTimestamp: number,
  ): Promise<any[]> {
    return this.syncRepository.find({
      where: {
        userId,
        timestamp: { $gt: lastSyncTimestamp },
      },
    });
  }

  private detectConflicts(localChanges: any[], serverChanges: any[]): any[] {
    const conflicts = [];
    const localMap = new Map(localChanges.map(change => [change.id, change]));
    const serverMap = new Map(serverChanges.map(change => [change.id, change]));

    for (const [id, localChange] of localMap) {
      const serverChange = serverMap.get(id);
      if (serverChange && this.hasConflict(localChange, serverChange)) {
        conflicts.push({
          id,
          local: localChange,
          server: serverChange,
        });
      }
    }

    return conflicts;
  }

  private hasConflict(localChange: any, serverChange: any): boolean {
    return (
      localChange.version !== serverChange.version ||
      localChange.timestamp > serverChange.timestamp
    );
  }

  private mergeChanges(localChanges: any[], serverChanges: any[]): any[] {
    const merged = new Map();
    const allChanges = [...localChanges, ...serverChanges];

    for (const change of allChanges) {
      const existing = merged.get(change.id);
      if (!existing || change.timestamp > existing.timestamp) {
        merged.set(change.id, change);
      }
    }

    return Array.from(merged.values());
  }

  private async updateSyncTimestamp(userId: string): Promise<void> {
    await this.syncRepository.update(
      { userId },
      { lastSyncTimestamp: Date.now() },
    );
  }
} 