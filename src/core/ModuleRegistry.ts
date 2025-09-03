/**
 * Module Registry - Auto-Discovery and Management
 * Handles module registration, dependency resolution, and lifecycle
 */

import { moduleManager, ModuleManifest, ModuleInterface } from './ModuleManager';
import { UnifiedLogger } from '../../shared/utils/logger';

export interface ModuleRegistryEntry {
  manifest: ModuleManifest;
  moduleClass: any;
  isBuiltIn: boolean;
  installationStatus: 'available' | 'downloading' | 'installed' | 'error';
  lastUpdated: string;
}

class ModuleRegistry {
  private static instance: ModuleRegistry;
  private registry: Map<string, ModuleRegistryEntry> = new Map();
  private logger = UnifiedLogger.getInstance('module-registry');

  static getInstance(): ModuleRegistry {
    if (!ModuleRegistry.instance) {
      ModuleRegistry.instance = new ModuleRegistry();
    }
    return ModuleRegistry.instance;
  }

  async initialize(): Promise<void> {
    this.logger.info('Initializing module registry...');
    
    // Register built-in modules
    await this.registerBuiltInModules();
    
    // Auto-load essential modules
    await this.autoLoadEssentialModules();
    
    this.logger.info('Module registry initialized');
  }

  private async registerBuiltInModules(): Promise<void> {
    const builtInModules = [
      {
        manifest: {
          id: 'network-management',
          name: 'Network Management',
          version: '1.0.0',
          description: 'DNS, DHCP, WiFi, and network configuration',
          category: 'network' as const,
          dependencies: [],
          configSchema: {},
          entryPoint: 'NetworkModule',
          tabConfig: {
            label: 'Ağ',
            icon: 'Network',
            order: 2
          }
        },
        moduleClass: () => import('../modules/NetworkModule'),
        isBuiltIn: true
      },
      {
        manifest: {
          id: 'device-management',
          name: 'Device Management',
          version: '1.0.0',
          description: 'Network device discovery and management',
          category: 'network' as const,
          dependencies: [],
          configSchema: {},
          entryPoint: 'DeviceModule',
          tabConfig: {
            label: 'Cihazlar',
            icon: 'Router',
            order: 1
          }
        },
        moduleClass: () => import('../modules/DeviceModule'),
        isBuiltIn: true
      },
      {
        manifest: {
          id: 'vpn-management',
          name: 'VPN Management',
          version: '1.0.0',
          description: 'WireGuard VPN server and client management',
          category: 'security' as const,
          dependencies: [],
          requiredPorts: [51820],
          configSchema: {},
          entryPoint: 'VPNModule',
          tabConfig: {
            label: 'VPN',
            icon: 'Shield',
            order: 4
          }
        },
        moduleClass: () => import('../modules/VPNModule'),
        isBuiltIn: true
      },
      {
        manifest: {
          id: 'automation-engine',
          name: 'Automation Engine',
          version: '1.0.0',
          description: 'Rule engine and external integrations',
          category: 'automation' as const,
          dependencies: [],
          configSchema: {},
          entryPoint: 'AutomationModule',
          tabConfig: {
            label: 'Otomasyon',
            icon: 'Zap',
            order: 5
          }
        },
        moduleClass: () => import('../modules/AutomationModule'),
        isBuiltIn: true
      },
      {
        manifest: {
          id: 'monitoring-dashboard',
          name: 'Monitoring Dashboard',
          version: '1.0.0',
          description: 'System monitoring and observability',
          category: 'monitoring' as const,
          dependencies: [],
          configSchema: {},
          entryPoint: 'MonitoringModule',
          tabConfig: {
            label: 'İzleme',
            icon: 'Activity',
            order: 6
          }
        },
        moduleClass: () => import('../modules/MonitoringModule'),
        isBuiltIn: true
      },
      {
        manifest: {
          id: 'storage-management',
          name: 'Storage Management',
          version: '1.0.0',
          description: 'USB devices and network storage',
          category: 'storage' as const,
          dependencies: [],
          configSchema: {},
          entryPoint: 'StorageModule',
          tabConfig: {
            label: 'Depolama',
            icon: 'HardDrive',
            order: 7
          }
        },
        moduleClass: () => import('../modules/StorageModule'),
        isBuiltIn: true
      }
    ];

    for (const module of builtInModules) {
      this.registry.set(module.manifest.id, {
        ...module,
        installationStatus: 'installed',
        lastUpdated: new Date().toISOString()
      });
    }
  }

  private async autoLoadEssentialModules(): Promise<void> {
    const essentialModules = ['device-management', 'network-management'];
    
    for (const moduleId of essentialModules) {
      try {
        await this.loadModule(moduleId);
        this.logger.info(`Auto-loaded essential module: ${moduleId}`);
      } catch (error) {
        this.logger.error(`Failed to auto-load module: ${moduleId}`, { error: (error as Error).message });
      }
    }
  }

  async loadModule(moduleId: string): Promise<ModuleInterface> {
    const registryEntry = this.registry.get(moduleId);
    if (!registryEntry) {
      throw new Error(`Module not found in registry: ${moduleId}`);
    }

    try {
      // Import module class
      const ModuleImport = await registryEntry.moduleClass();
      const ModuleClass = ModuleImport.default || ModuleImport;
      const moduleInstance = new ModuleClass.default(registryEntry.manifest);
      
      // Load into module manager
      await moduleManager.loadModule(moduleId, moduleInstance);
      
      // Start module if it's essential
      if (['device-management', 'network-management'].includes(moduleId)) {
        await moduleManager.startModule(moduleId);
      }

      return moduleInstance;
    } catch (error) {
      this.logger.error(`Failed to load module: ${moduleId}`, { error: (error as Error).message });
      throw error;
    }
  }

  getAvailableModules(): ModuleRegistryEntry[] {
    return Array.from(this.registry.values());
  }

  getLoadedModules(): ModuleInterface[] {
    return moduleManager.getAllModules();
  }

  async downloadAndInstallModule(moduleId: string, downloadUrl?: string): Promise<void> {
    this.logger.info(`Installing module: ${moduleId}`);
    
    try {
      // Update status
      const entry = this.registry.get(moduleId);
      if (entry) {
        entry.installationStatus = 'downloading';
      }

      // Download module (if external)
      if (downloadUrl) {
        await this.downloadExternalModule(moduleId, downloadUrl);
      }

      // Load and start module
      await this.loadModule(moduleId);
      
      // Update status
      if (entry) {
        entry.installationStatus = 'installed';
        entry.lastUpdated = new Date().toISOString();
      }

      this.logger.info(`Module installed successfully: ${moduleId}`);
    } catch (error) {
      const entry = this.registry.get(moduleId);
      if (entry) {
        entry.installationStatus = 'error';
      }
      
      this.logger.error(`Module installation failed: ${moduleId}`, { error: (error as Error).message });
      throw error;
    }
  }

  private async downloadExternalModule(moduleId: string, downloadUrl: string): Promise<void> {
    // Implementation for downloading external modules
    // This would handle module package download, validation, and extraction
    this.logger.info(`Downloading module from: ${downloadUrl}`);
    
    // Mock implementation
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // Module communication helpers
  async callModuleAction(moduleId: string, action: string, payload?: any): Promise<any> {
    const module = moduleManager.getModule(moduleId);
    if (!module) {
      throw new Error(`Module not loaded: ${moduleId}`);
    }
    
    return await module.handleAction(action, payload);
  }

  // Get modules by category
  getModulesByCategory(category: string): ModuleRegistryEntry[] {
    return Array.from(this.registry.values()).filter(
      entry => entry.manifest.category === category
    );
  }

  // Health check for all modules
  async performHealthCheck(): Promise<Record<string, boolean>> {
    const healthStatus: Record<string, boolean> = {};
    
    for (const [moduleId, module] of moduleManager.getAllModules().entries()) {
      try {
        const status = module.getStatus();
        healthStatus[moduleId] = status.health === 'healthy';
      } catch (error) {
        healthStatus[moduleId] = false;
      }
    }

    return healthStatus;
  }
}

export const moduleRegistry = ModuleRegistry.getInstance();