/**
 * Advanced Inter-Module Data Sharing System
 * Cross-module state synchronization and data consistency
 */

import { EventEmitter } from 'events';
import { UnifiedLogger } from '../../shared/utils/logger';
import { moduleManager } from './ModuleManager';
import { communicationBus } from './CommunicationBus';

export interface SharedDataSchema {
  namespace: string;
  version: string;
  schema: any;
  permissions: {
    read: string[];    // Module IDs that can read
    write: string[];   // Module IDs that can write
    subscribe: string[]; // Module IDs that can subscribe to changes
  };
}

export interface DataSyncEvent {
  namespace: string;
  key: string;
  oldValue?: any;
  newValue: any;
  source: string;
  timestamp: number;
  changeType: 'create' | 'update' | 'delete';
}

export interface SharedDataStore {
  [namespace: string]: {
    [key: string]: {
      value: any;
      version: number;
      lastModified: number;
      modifiedBy: string;
      subscribers: Set<string>;
    };
  };
}

class DataSyncManager extends EventEmitter {
  private static instance: DataSyncManager;
  private logger = UnifiedLogger.getInstance('data-sync');
  private dataStore: SharedDataStore = {};
  private schemas: Map<string, SharedDataSchema> = new Map();
  private syncQueue: DataSyncEvent[] = [];
  private isProcessingQueue = false;

  static getInstance(): DataSyncManager {
    if (!DataSyncManager.instance) {
      DataSyncManager.instance = new DataSyncManager();
    }
    return DataSyncManager.instance;
  }

  // Register shared data schema
  registerSchema(schema: SharedDataSchema): void {
    this.schemas.set(schema.namespace, schema);
    this.logger.info('Data schema registered', { namespace: schema.namespace, version: schema.version });

    // Initialize namespace in data store
    if (!this.dataStore[schema.namespace]) {
      this.dataStore[schema.namespace] = {};
    }
  }

  // Set shared data with validation and permission checking
  async setSharedData(
    namespace: string,
    key: string,
    value: any,
    sourceModule: string
  ): Promise<void> {
    const schema = this.schemas.get(namespace);
    if (!schema) {
      throw new Error(`Schema not found for namespace: ${namespace}`);
    }

    // Check write permissions
    if (!schema.permissions.write.includes(sourceModule) && !schema.permissions.write.includes('*')) {
      throw new Error(`Module ${sourceModule} does not have write permission for namespace ${namespace}`);
    }

    // Validate data against schema
    const isValid = await this.validateData(value, schema.schema);
    if (!isValid) {
      throw new Error('Data validation failed against schema');
    }

    const oldValue = this.dataStore[namespace][key]?.value;
    const now = Date.now();

    // Update data store
    if (!this.dataStore[namespace][key]) {
      this.dataStore[namespace][key] = {
        value,
        version: 1,
        lastModified: now,
        modifiedBy: sourceModule,
        subscribers: new Set()
      };
    } else {
      this.dataStore[namespace][key] = {
        ...this.dataStore[namespace][key],
        value,
        version: this.dataStore[namespace][key].version + 1,
        lastModified: now,
        modifiedBy: sourceModule
      };
    }

    // Queue sync event
    const syncEvent: DataSyncEvent = {
      namespace,
      key,
      oldValue,
      newValue: value,
      source: sourceModule,
      timestamp: now,
      changeType: oldValue === undefined ? 'create' : 'update'
    };

    this.syncQueue.push(syncEvent);
    this.processSyncQueue();

    this.logger.debug('Shared data updated', { namespace, key, source: sourceModule });
  }

  // Get shared data with permission checking
  getSharedData<T>(namespace: string, key: string, requestingModule: string): T | null {
    const schema = this.schemas.get(namespace);
    if (!schema) {
      this.logger.warn('Schema not found', { namespace, requestingModule });
      return null;
    }

    // Check read permissions
    if (!schema.permissions.read.includes(requestingModule) && !schema.permissions.read.includes('*')) {
      this.logger.warn('Read permission denied', { namespace, requestingModule });
      return null;
    }

    const data = this.dataStore[namespace]?.[key];
    return data ? data.value : null;
  }

  // Subscribe to data changes
  subscribeToData(
    namespace: string,
    key: string,
    subscriberModule: string,
    callback: (event: DataSyncEvent) => void
  ): () => void {
    const schema = this.schemas.get(namespace);
    if (!schema) {
      throw new Error(`Schema not found for namespace: ${namespace}`);
    }

    // Check subscribe permissions
    if (!schema.permissions.subscribe.includes(subscriberModule) && !schema.permissions.subscribe.includes('*')) {
      throw new Error(`Module ${subscriberModule} does not have subscribe permission`);
    }

    // Add to subscribers
    if (!this.dataStore[namespace]) {
      this.dataStore[namespace] = {};
    }
    if (!this.dataStore[namespace][key]) {
      this.dataStore[namespace][key] = {
        value: null,
        version: 0,
        lastModified: Date.now(),
        modifiedBy: 'system',
        subscribers: new Set()
      };
    }

    this.dataStore[namespace][key].subscribers.add(subscriberModule);

    // Register event listener
    const eventName = `${namespace}:${key}`;
    this.on(eventName, callback);

    this.logger.debug('Data subscription registered', { namespace, key, subscriber: subscriberModule });

    // Return unsubscribe function
    return () => {
      this.dataStore[namespace][key].subscribers.delete(subscriberModule);
      this.off(eventName, callback);
      this.logger.debug('Data subscription removed', { namespace, key, subscriber: subscriberModule });
    };
  }

  // Batch data operations for performance
  async batchUpdate(
    updates: Array<{
      namespace: string;
      key: string;
      value: any;
      sourceModule: string;
    }>
  ): Promise<void> {
    const validatedUpdates: Array<DataSyncEvent> = [];

    // Validate all updates first
    for (const update of updates) {
      const schema = this.schemas.get(update.namespace);
      if (!schema) {
        throw new Error(`Schema not found: ${update.namespace}`);
      }

      if (!schema.permissions.write.includes(update.sourceModule) && !schema.permissions.write.includes('*')) {
        throw new Error(`Write permission denied: ${update.namespace}`);
      }

      const isValid = await this.validateData(update.value, schema.schema);
      if (!isValid) {
        throw new Error(`Validation failed for ${update.namespace}:${update.key}`);
      }

      validatedUpdates.push({
        namespace: update.namespace,
        key: update.key,
        oldValue: this.dataStore[update.namespace]?.[update.key]?.value,
        newValue: update.value,
        source: update.sourceModule,
        timestamp: Date.now(),
        changeType: this.dataStore[update.namespace]?.[update.key] ? 'update' : 'create'
      });
    }

    // Apply all updates atomically
    for (const update of validatedUpdates) {
      const { namespace, key, newValue, source, timestamp } = update;

      if (!this.dataStore[namespace]) {
        this.dataStore[namespace] = {};
      }

      if (!this.dataStore[namespace][key]) {
        this.dataStore[namespace][key] = {
          value: newValue,
          version: 1,
          lastModified: timestamp,
          modifiedBy: source,
          subscribers: new Set()
        };
      } else {
        this.dataStore[namespace][key] = {
          ...this.dataStore[namespace][key],
          value: newValue,
          version: this.dataStore[namespace][key].version + 1,
          lastModified: timestamp,
          modifiedBy: source
        };
      }
    }

    // Queue all sync events
    this.syncQueue.push(...validatedUpdates);
    this.processSyncQueue();
  }

  // Real-time data synchronization
  private async processSyncQueue(): Promise<void> {
    if (this.isProcessingQueue || this.syncQueue.length === 0) {
      return;
    }

    this.isProcessingQueue = true;

    try {
      while (this.syncQueue.length > 0) {
        const event = this.syncQueue.shift()!;
        await this.processSyncEvent(event);
      }
    } catch (error) {
      this.logger.error('Sync queue processing failed', { error: (error as Error).message });
    } finally {
      this.isProcessingQueue = false;
    }
  }

  private async processSyncEvent(event: DataSyncEvent): Promise<void> {
    const { namespace, key } = event;
    const subscribers = this.dataStore[namespace]?.[key]?.subscribers;

    if (subscribers && subscribers.size > 0) {
      // Notify subscribers
      const eventName = `${namespace}:${key}`;
      this.emit(eventName, event);

      // Send via communication bus for cross-module updates
      await communicationBus.send({
        type: 'broadcast',
        source: 'data-sync-manager',
        action: 'data-changed',
        payload: event
      });
    }

    this.logger.debug('Sync event processed', { namespace, key, subscribers: subscribers?.size || 0 });
  }

  private async validateData(data: any, schema: any): Promise<boolean> {
    try {
      // Basic validation - in production would use JSON Schema or Joi
      return typeof data !== 'undefined';
    } catch (error) {
      return false;
    }
  }

  // Data consistency and conflict resolution
  async resolveDataConflict(
    namespace: string,
    key: string,
    conflictingValues: Array<{ value: any; source: string; timestamp: number }>
  ): Promise<any> {
    // Implement conflict resolution strategy
    // For now, use timestamp-based last-write-wins
    const latest = conflictingValues.reduce((latest, current) => 
      current.timestamp > latest.timestamp ? current : latest
    );

    this.logger.info('Data conflict resolved', {
      namespace,
      key,
      winner: latest.source,
      conflicts: conflictingValues.length
    });

    return latest.value;
  }

  // Data synchronization with external systems
  async syncWithExternalSystem(
    namespace: string,
    externalSystemId: string,
    syncConfig: any
  ): Promise<void> {
    this.logger.info('External sync started', { namespace, system: externalSystemId });
    
    // Implementation for syncing with databases, APIs, etc.
    // This would handle Supabase real-time sync, external API sync, etc.
  }

  // Get synchronization statistics
  getSyncStats(): {
    totalNamespaces: number;
    totalKeys: number;
    totalSubscriptions: number;
    queueLength: number;
    lastSyncTime: number;
  } {
    const totalKeys = Object.values(this.dataStore).reduce(
      (acc, namespace) => acc + Object.keys(namespace).length,
      0
    );

    const totalSubscriptions = Object.values(this.dataStore).reduce(
      (acc, namespace) => acc + Object.values(namespace).reduce(
        (nsAcc, data) => nsAcc + data.subscribers.size,
        0
      ),
      0
    );

    return {
      totalNamespaces: Object.keys(this.dataStore).length,
      totalKeys,
      totalSubscriptions,
      queueLength: this.syncQueue.length,
      lastSyncTime: Date.now()
    };
  }
}

export const dataSyncManager = DataSyncManager.getInstance();