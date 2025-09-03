/**
 * Base Module Class - Template for all modules
 * Provides standardized interfaces and communication protocols
 */

import React from 'react';
import { ModuleInterface, ModuleManifest, ModuleStatus } from './ModuleManager';
import { UnifiedLogger } from '../../shared/utils/logger';

export abstract class BaseModule implements ModuleInterface {
  protected logger: UnifiedLogger;
  protected status: ModuleStatus;
  protected eventHandlers: Map<string, Function[]> = new Map();
  
  constructor(public manifest: ModuleManifest) {
    this.logger = UnifiedLogger.getInstance(`module-${manifest.id}`);
    this.status = {
      id: manifest.id,
      status: 'loading',
      health: 'healthy'
    };
  }

  async initialize(): Promise<void> {
    this.logger.info(`Initializing module: ${this.manifest.name}`);
    
    try {
      await this.onInitialize();
      this.status.status = 'ready';
      this.logger.info(`Module initialized: ${this.manifest.name}`);
    } catch (error) {
      this.status.status = 'error';
      this.status.lastError = (error as Error).message;
      this.logger.error(`Failed to initialize module: ${this.manifest.name}`, { error: (error as Error).message });
      throw error;
    }
  }

  async start(): Promise<void> {
    this.logger.info(`Starting module: ${this.manifest.name}`);
    
    try {
      await this.onStart();
      this.status.status = 'running';
      this.emit('moduleStarted', this.manifest.id);
    } catch (error) {
      this.status.status = 'error';
      this.status.lastError = (error as Error).message;
      throw error;
    }
  }

  async stop(): Promise<void> {
    this.logger.info(`Stopping module: ${this.manifest.name}`);
    
    try {
      await this.onStop();
      this.status.status = 'stopped';
      this.emit('moduleStopped', this.manifest.id);
    } catch (error) {
      this.status.status = 'error';
      this.status.lastError = (error as Error).message;
      throw error;
    }
  }

  getStatus(): ModuleStatus {
    return { ...this.status };
  }

  async handleAction(action: string, payload?: any): Promise<any> {
    this.logger.debug(`Handling action: ${action}`, { payload });
    
    try {
      return await this.onAction(action, payload);
    } catch (error) {
      this.logger.error(`Action failed: ${action}`, { error: (error as Error).message, payload });
      throw error;
    }
  }

  registerEventHandler(event: string, handler: Function): void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, []);
    }
    this.eventHandlers.get(event)!.push(handler);
  }

  protected emit(event: string, data?: any): void {
    const handlers = this.eventHandlers.get(event) || [];
    handlers.forEach(handler => {
      try {
        handler(data);
      } catch (error) {
        this.logger.error(`Event handler error: ${event}`, { error: (error as Error).message });
      }
    });
  }

  protected async apiCall(endpoint: string, options?: RequestInit): Promise<any> {
    try {
      const response = await fetch(`/api/v1/modules/${this.manifest.id}${endpoint}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-Module-ID': this.manifest.id,
          'X-Module-Version': this.manifest.version,
        },
        ...options
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      this.logger.error(`API call failed: ${endpoint}`, { error: (error as Error).message });
      throw error;
    }
  }

  // Abstract methods that modules must implement
  protected abstract onInitialize(): Promise<void>;
  protected abstract onStart(): Promise<void>;
  protected abstract onStop(): Promise<void>;
  protected abstract onAction(action: string, payload?: any): Promise<any>;
  public abstract getComponent(): React.ComponentType<any>;

  // Health check utilities
  protected updateHealth(health: ModuleStatus['health'], error?: string): void {
    this.status.health = health;
    if (error) {
      this.status.lastError = error;
    }
  }

  protected async performHealthCheck(): Promise<boolean> {
    try {
      // Default health check - modules can override
      const isHealthy = this.status.status === 'running';
      this.updateHealth(isHealthy ? 'healthy' : 'unhealthy');
      return isHealthy;
    } catch (error) {
      this.updateHealth('unhealthy', (error as Error).message);
      return false;
    }
  }
}

export { BaseModule };