import React from 'react';

export interface ModuleManifest {
  id: string;
  name: string;
  version: string;
  description: string;
  category: 'network' | 'security' | 'automation' | 'monitoring' | 'storage' | 'system';
  dependencies: string[];
  configSchema: any;
  entryPoint: string;
}

export interface ModuleStatus {
  id: string;
  status: 'loading' | 'ready' | 'running' | 'error' | 'stopped';
  health: 'healthy' | 'degraded' | 'unhealthy';
  lastError?: string;
}

export interface ModuleInterface {
  manifest: ModuleManifest;
  initialize(): Promise<void>;
  start(): Promise<void>;
  stop(): Promise<void>;
  getStatus(): ModuleStatus;
  getComponent(): React.ComponentType<any>;
  handleAction(action: string, payload?: any): Promise<any>;
}