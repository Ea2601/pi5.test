/**
 * Pi5 Supernode - Core Module Manager
 * Handles module lifecycle, communication, and standardized interfaces
 */

import { EventEmitter } from 'eventemitter3';
import { UnifiedLogger } from '../../shared/utils/logger';

export interface ModuleManifest {
  id: string;
  name: string;
  version: string;
  description: string;
  category: 'network' | 'security' | 'automation' | 'monitoring' | 'storage' | 'system';
  dependencies: string[];
  requiredPorts?: number[];
  requiredServices?: string[];
  configSchema: any;
  entryPoint: string;
  tabConfig?: {
    label: string;
    icon: string;
    order: number;
  };
}

export interface ModuleInterface {
  manifest: ModuleManifest;
  initialize(): Promise<void>;
  start(): Promise<void>;
  stop(): Promise<void>;
  getStatus(): ModuleStatus;
  getComponent(): React.ComponentType<any>;
  handleAction(action: string, payload?: any): Promise<any>;
  registerEventHandler(event: string, handler: Function): void;
}

export interface ModuleStatus {
  id: string;
  status: 'loading' | 'ready' | 'running' | 'error' | 'stopped';
  health: 'healthy' | 'degraded' | 'unhealthy';
  lastError?: string;
  metrics?: Record<string, any>;
}

export interface ModuleCommunication {
  type: 'request' | 'response' | 'event' | 'broadcast';
  source: string;
  target?: string;
  action: string;
  payload?: any;
  timestamp: number;
  requestId?: string;
}

class ModuleManager extends EventEmitter {
  private static instance: ModuleManager;
  private modules: Map<string, ModuleInterface> = new Map();
  private moduleStates: Map<string, ModuleStatus> = new Map();
  private communicationBus: ModuleCommunication[] = [];
  private logger = UnifiedLogger.getInstance('module-manager');

  static getInstance(): ModuleManager {
    if (!ModuleManager.instance) {
      ModuleManager.instance = new ModuleManager();
    }
    return ModuleManager.instance;
  }

  async loadModule(moduleId: string, moduleData: any): Promise<ModuleInterface> {
    try {
      this.logger.info(`Loading module: ${moduleId}`);
      
      // Create module instance from data
      const module = await this.createModuleInstance(moduleData);
      
      // Validate dependencies
      await this.validateDependencies(module.manifest);
      
      // Initialize module
      await module.initialize();
      
      // Register module
      this.modules.set(moduleId, module);
      this.moduleStates.set(moduleId, {
        id: moduleId,
        status: 'ready',
        health: 'healthy'
      });

      this.emit('moduleLoaded', moduleId);
      return module;
    } catch (error) {
      this.logger.error(`Failed to load module ${moduleId}`, { error: (error as Error).message });
      throw error;
    }
  }

  async unloadModule(moduleId: string): Promise<void> {
    const module = this.modules.get(moduleId);
    if (module) {
      await module.stop();
      this.modules.delete(moduleId);
      this.moduleStates.delete(moduleId);
      this.emit('moduleUnloaded', moduleId);
    }
  }

  async startModule(moduleId: string): Promise<void> {
    const module = this.modules.get(moduleId);
    if (module) {
      await module.start();
      this.updateModuleStatus(moduleId, { status: 'running' });
      this.emit('moduleStarted', moduleId);
    }
  }

  async stopModule(moduleId: string): Promise<void> {
    const module = this.modules.get(moduleId);
    if (module) {
      await module.stop();
      this.updateModuleStatus(moduleId, { status: 'stopped' });
      this.emit('moduleStopped', moduleId);
    }
  }

  // Inter-module communication
  async sendMessage(message: Omit<ModuleCommunication, 'timestamp'>): Promise<any> {
    const fullMessage: ModuleCommunication = {
      ...message,
      timestamp: Date.now(),
      requestId: Math.random().toString(36).substring(7)
    };

    this.communicationBus.push(fullMessage);
    
    if (message.type === 'request' && message.target) {
      const targetModule = this.modules.get(message.target);
      if (targetModule) {
        return await targetModule.handleAction(message.action, message.payload);
      }
    }

    this.emit('message', fullMessage);
  }

  // Module discovery and installation
  async discoverAvailableModules(): Promise<ModuleManifest[]> {
    // In production, this would fetch from module registry
    return this.getBuiltInModules();
  }

  async installModule(moduleId: string): Promise<void> {
    this.logger.info(`Installing module: ${moduleId}`);
    
    // Download module package
    const modulePackage = await this.downloadModule(moduleId);
    
    // Validate module
    const manifest = await this.validateModule(modulePackage);
    
    // Install dependencies
    await this.installDependencies(manifest.dependencies);
    
    // Load and start module
    await this.loadModule(moduleId, modulePackage);
    await this.startModule(moduleId);
  }

  getModule(moduleId: string): ModuleInterface | undefined {
    return this.modules.get(moduleId);
  }

  getAllModules(): ModuleInterface[] {
    return Array.from(this.modules.values());
  }

  getModuleStatus(moduleId: string): ModuleStatus | undefined {
    return this.moduleStates.get(moduleId);
  }

  // Initialize core modules
  async initializeCoreModules(): Promise<void> {
    const coreModules = [
      'device-management',
      'network-management',
      'vpn-management',
      'automation-engine',
      'storage-management',
      'monitoring-dashboard',
      'system-settings'
    ];

    for (const moduleId of coreModules) {
      try {
        // Load module if not already loaded
        if (!this.modules.has(moduleId)) {
          const ModuleClass = await this.loadModuleClass(moduleId);
          const manifest = this.getModuleManifest(moduleId);
          const moduleInstance = new ModuleClass(manifest);
          
          await this.loadModule(moduleId, moduleInstance);
          await this.startModule(moduleId);
        }
      } catch (error) {
        this.logger.warn(`Failed to load core module: ${moduleId}`, { error: (error as Error).message });
      }
    }
  }

  private async loadModuleClass(moduleId: string): Promise<any> {
    switch (moduleId) {
      case 'device-management':
        const DeviceModule = await import('../modules/DeviceModule');
        return DeviceModule.default;
      case 'network-management':
        const NetworkModule = await import('../modules/NetworkModule');
        return NetworkModule.default;
      case 'vpn-management':
        const VPNModule = await import('../modules/VPNModule');
        return VPNModule.default;
      case 'automation-engine':
        const AutomationModule = await import('../modules/AutomationModule');
        return AutomationModule.default;
      case 'storage-management':
        const StorageModule = await import('../modules/StorageModule');
        return StorageModule.default;
      case 'monitoring-dashboard':
        const MonitoringModule = await import('../modules/MonitoringModule');
        return MonitoringModule.default;
      case 'system-settings':
        const SettingsModule = await import('../modules/SystemSettingsModule');
        return SettingsModule.default;
      default:
        throw new Error(`Unknown module: ${moduleId}`);
    }
  }

  private getModuleManifest(moduleId: string): ModuleManifest {
    const manifests: Record<string, ModuleManifest> = {
      'device-management': {
        id: 'device-management',
        name: 'Device Management',
        version: '1.0.0',
        description: 'Network device discovery and management',
        category: 'network',
        dependencies: [],
        configSchema: {},
        entryPoint: 'DeviceModule.tsx',
        tabConfig: {
          label: 'Cihazlar',
          icon: 'Router',
          order: 1
        }
      },
      'network-management': {
        id: 'network-management',
        name: 'Network Management',
        version: '1.0.0',
        description: 'DNS, DHCP, WiFi configuration',
        category: 'network',
        dependencies: [],
        configSchema: {},
        entryPoint: 'NetworkModule.tsx',
        tabConfig: {
          label: 'Ağ',
          icon: 'Network',
          order: 2
        }
      },
      'vpn-management': {
        id: 'vpn-management',
        name: 'VPN Management',
        version: '1.0.0',
        description: 'WireGuard VPN management',
        category: 'security',
        dependencies: [],
        configSchema: {},
        entryPoint: 'VPNModule.tsx',
        tabConfig: {
          label: 'VPN',
          icon: 'Shield',
          order: 4
        }
      },
      'automation-engine': {
        id: 'automation-engine',
        name: 'Automation Engine',
        version: '1.0.0',
        description: 'Rule engine and integrations',
        category: 'automation',
        dependencies: [],
        configSchema: {},
        entryPoint: 'AutomationModule.tsx',
        tabConfig: {
          label: 'Otomasyon',
          icon: 'Zap',
          order: 5
        }
      },
      'storage-management': {
        id: 'storage-management',
        name: 'Storage Management',
        version: '1.0.0',
        description: 'USB and network storage',
        category: 'storage',
        dependencies: [],
        configSchema: {},
        entryPoint: 'StorageModule.tsx',
        tabConfig: {
          label: 'Depolama',
          icon: 'HardDrive',
          order: 7
        }
      },
      'monitoring-dashboard': {
        id: 'monitoring-dashboard',
        name: 'Monitoring Dashboard',
        version: '1.0.0',
        description: 'System monitoring',
        category: 'monitoring',
        dependencies: [],
        configSchema: {},
        entryPoint: 'MonitoringModule.tsx',
        tabConfig: {
          label: 'İzleme',
          icon: 'Activity',
          order: 6
        }
      },
      'system-settings': {
        id: 'system-settings',
        name: 'System Settings',
        version: '1.0.0',
        description: 'System configuration',
        category: 'system',
        dependencies: [],
        configSchema: {},
        entryPoint: 'SystemSettingsModule.tsx',
        tabConfig: {
          label: 'Ayarlar',
          icon: 'Settings',
          order: 10
        }
      }
    };

    return manifests[moduleId] || {
      id: moduleId,
      name: moduleId,
      version: '1.0.0',
      description: 'Unknown module',
      category: 'unknown',
      dependencies: [],
      configSchema: {},
      entryPoint: 'UnknownModule.tsx'
    };
  }
  private async createModuleInstance(moduleData: any): Promise<ModuleInterface> {
    // Module factory - creates module instances based on type
    const ModuleClass = await import(`../modules/${moduleData.manifest.id}/${moduleData.manifest.entryPoint}`);
    return new ModuleClass.default(moduleData.manifest);
  }

  private async validateDependencies(manifest: ModuleManifest): Promise<void> {
    for (const dep of manifest.dependencies) {
      if (!this.modules.has(dep)) {
        throw new Error(`Missing dependency: ${dep}`);
      }
    }
  }

  private updateModuleStatus(moduleId: string, updates: Partial<ModuleStatus>): void {
    const current = this.moduleStates.get(moduleId);
    if (current) {
      this.moduleStates.set(moduleId, { ...current, ...updates });
    }
  }

  private async downloadModule(moduleId: string): Promise<any> {
    // Mock implementation - in production would download from registry
    return this.getBuiltInModules().find(m => m.id === moduleId);
  }

  private async validateModule(modulePackage: any): Promise<ModuleManifest> {
    // Validate module structure and manifest
    if (!modulePackage.manifest) {
      throw new Error('Invalid module: Missing manifest');
    }
    return modulePackage.manifest;
  }

  private async installDependencies(dependencies: string[]): Promise<void> {
    // Install required dependencies
    for (const dep of dependencies) {
      this.logger.info(`Installing dependency: ${dep}`);
    }
  }

  private getBuiltInModules(): ModuleManifest[] {
    return [
      {
        id: 'network-management',
        name: 'Network Management',
        version: '1.0.0',
        description: 'Comprehensive network device and traffic management',
        category: 'network',
        dependencies: [],
        configSchema: {},
        entryPoint: 'NetworkModule.tsx',
        tabConfig: {
          label: 'Ağ',
          icon: 'Network',
          order: 2
        }
      },
      {
        id: 'vpn-management',
        name: 'VPN Management',
        version: '1.0.0',
        description: 'WireGuard VPN server and client management',
        category: 'security',
        dependencies: [],
        requiredPorts: [51820],
        configSchema: {},
        entryPoint: 'VPNModule.tsx',
        tabConfig: {
          label: 'VPN',
          icon: 'Shield',
          order: 4
        }
      },
      {
        id: 'automation-engine',
        name: 'Automation Engine',
        version: '1.0.0',
        description: 'Rule-based automation and integrations',
        category: 'automation',
        dependencies: [],
        configSchema: {},
        entryPoint: 'AutomationModule.tsx',
        tabConfig: {
          label: 'Otomasyon',
          icon: 'Zap',
          order: 5
        }
      },
      {
        id: 'monitoring-dashboard',
        name: 'Monitoring Dashboard',
        version: '1.0.0',
        description: 'System monitoring and observability',
        category: 'monitoring',
        dependencies: [],
        configSchema: {},
        entryPoint: 'MonitoringModule.tsx',
        tabConfig: {
          label: 'İzleme',
          icon: 'Activity',
          order: 6
        }
      },
      {
        id: 'storage-management',
        name: 'Storage Management',
        version: '1.0.0',
        description: 'USB devices and network storage management',
        category: 'storage',
        dependencies: [],
        configSchema: {},
        entryPoint: 'StorageModule.tsx',
        tabConfig: {
          label: 'Depolama',
          icon: 'HardDrive',
          order: 7
        }
      }
    ];
  }
}

export const moduleManager = ModuleManager.getInstance();