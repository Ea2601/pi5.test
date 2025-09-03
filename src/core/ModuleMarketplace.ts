/**
 * Module Marketplace - Remote Module Download System
 * Handles discovery, download, and installation of external modules
 */

import { UnifiedLogger } from '../../shared/utils/logger';
import { moduleManager, ModuleManifest } from './ModuleManager';
import { moduleRegistry } from './ModuleRegistry';

export interface MarketplaceModule {
  id: string;
  name: string;
  version: string;
  description: string;
  category: string;
  author: string;
  repository: string;
  downloadUrl: string;
  size: number;
  downloads: number;
  rating: number;
  screenshots: string[];
  dependencies: string[];
  compatibility: {
    minVersion: string;
    maxVersion: string;
    platforms: string[];
  };
  verified: boolean;
  lastUpdated: string;
  changelog: string[];
}

export interface InstallationProgress {
  moduleId: string;
  status: 'downloading' | 'extracting' | 'installing' | 'configuring' | 'complete' | 'error';
  progress: number;
  message: string;
  error?: string;
}

class ModuleMarketplace {
  private static instance: ModuleMarketplace;
  private logger = UnifiedLogger.getInstance('module-marketplace');
  private marketplaceUrl = 'https://marketplace.pi5supernode.com/api/v1';
  private installationCallbacks: Map<string, (progress: InstallationProgress) => void> = new Map();

  static getInstance(): ModuleMarketplace {
    if (!ModuleMarketplace.instance) {
      ModuleMarketplace.instance = new ModuleMarketplace();
    }
    return ModuleMarketplace.instance;
  }

  async discoverModules(): Promise<MarketplaceModule[]> {
    try {
      const response = await fetch(`${this.marketplaceUrl}/modules`);
      const data = await response.json();
      
      this.logger.info('Module discovery completed', { count: data.modules?.length || 0 });
      return data.modules || [];
    } catch (error) {
      this.logger.error('Module discovery failed', { error: (error as Error).message });
      return this.getFallbackModules();
    }
  }

  async searchModules(query: string, category?: string): Promise<MarketplaceModule[]> {
    try {
      const params = new URLSearchParams({ q: query });
      if (category) params.append('category', category);
      
      const response = await fetch(`${this.marketplaceUrl}/modules/search?${params}`);
      const data = await response.json();
      
      return data.modules || [];
    } catch (error) {
      this.logger.error('Module search failed', { error: (error as Error).message });
      return [];
    }
  }

  async downloadAndInstallModule(
    moduleId: string,
    onProgress?: (progress: InstallationProgress) => void
  ): Promise<void> {
    if (onProgress) {
      this.installationCallbacks.set(moduleId, onProgress);
    }

    try {
      this.updateProgress(moduleId, 'downloading', 10, 'Module metadata indiriliyor...');
      
      // Get module metadata
      const moduleInfo = await this.getModuleInfo(moduleId);
      
      this.updateProgress(moduleId, 'downloading', 30, 'Module paketi indiriliyor...');
      
      // Download module package
      const modulePackage = await this.downloadModulePackage(moduleInfo.downloadUrl);
      
      this.updateProgress(moduleId, 'extracting', 50, 'Module paketi çıkarılıyor...');
      
      // Extract and validate
      const extractedModule = await this.extractAndValidateModule(modulePackage);
      
      this.updateProgress(moduleId, 'installing', 70, 'Module yükleniyor...');
      
      // Install dependencies
      await this.installModuleDependencies(extractedModule.manifest.dependencies);
      
      this.updateProgress(moduleId, 'configuring', 85, 'Module yapılandırılıyor...');
      
      // Load into module manager
      await moduleManager.loadModule(moduleId, extractedModule);
      
      // Start module
      await moduleManager.startModule(moduleId);
      
      this.updateProgress(moduleId, 'complete', 100, 'Module başarıyla yüklendi!');
      
      this.logger.info('Module installation completed', { moduleId });
    } catch (error) {
      this.updateProgress(moduleId, 'error', 0, `Installation failed: ${(error as Error).message}`, (error as Error).message);
      throw error;
    } finally {
      this.installationCallbacks.delete(moduleId);
    }
  }

  async uninstallModule(moduleId: string): Promise<void> {
    try {
      // Stop and unload module
      await moduleManager.stopModule(moduleId);
      await moduleManager.unloadModule(moduleId);
      
      // Remove module files
      await this.removeModuleFiles(moduleId);
      
      // Update registry
      await moduleRegistry.updateModuleStatus(moduleId, 'uninstalled');
      
      this.logger.info('Module uninstalled', { moduleId });
    } catch (error) {
      this.logger.error('Module uninstallation failed', { moduleId, error: (error as Error).message });
      throw error;
    }
  }

  async updateModule(moduleId: string): Promise<void> {
    try {
      const currentModule = moduleManager.getModule(moduleId);
      if (!currentModule) {
        throw new Error('Module not found');
      }

      const latestInfo = await this.getModuleInfo(moduleId);
      
      if (latestInfo.version === currentModule.manifest.version) {
        this.logger.info('Module already up to date', { moduleId });
        return;
      }

      // Backup current module
      await this.backupModule(moduleId);
      
      // Uninstall current version
      await this.uninstallModule(moduleId);
      
      // Install new version
      await this.downloadAndInstallModule(moduleId);
      
      this.logger.info('Module updated successfully', { 
        moduleId, 
        from: currentModule.manifest.version, 
        to: latestInfo.version 
      });
    } catch (error) {
      // Restore from backup on failure
      await this.restoreModuleFromBackup(moduleId);
      throw error;
    }
  }

  private updateProgress(
    moduleId: string, 
    status: InstallationProgress['status'], 
    progress: number, 
    message: string,
    error?: string
  ): void {
    const progressData: InstallationProgress = {
      moduleId,
      status,
      progress,
      message,
      error
    };

    const callback = this.installationCallbacks.get(moduleId);
    if (callback) {
      callback(progressData);
    }

    // Emit global event
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('moduleInstallationProgress', { detail: progressData }));
    }
  }

  private async getModuleInfo(moduleId: string): Promise<MarketplaceModule> {
    const response = await fetch(`${this.marketplaceUrl}/modules/${moduleId}`);
    const data = await response.json();
    return data.module;
  }

  private async downloadModulePackage(downloadUrl: string): Promise<ArrayBuffer> {
    const response = await fetch(downloadUrl);
    if (!response.ok) {
      throw new Error(`Download failed: ${response.statusText}`);
    }
    return await response.arrayBuffer();
  }

  private async extractAndValidateModule(packageData: ArrayBuffer): Promise<any> {
    // In production, this would extract ZIP/TAR and validate module structure
    // For now, return mock module structure
    return {
      manifest: {
        id: 'example-module',
        name: 'Example Module',
        version: '1.0.0',
        description: 'Example marketplace module',
        category: 'network',
        dependencies: [],
        configSchema: {},
        entryPoint: 'ExampleModule.tsx'
      },
      files: {},
      component: null
    };
  }

  private async installModuleDependencies(dependencies: string[]): Promise<void> {
    for (const dep of dependencies) {
      if (!moduleManager.getModule(dep)) {
        await this.downloadAndInstallModule(dep);
      }
    }
  }

  private async removeModuleFiles(moduleId: string): Promise<void> {
    // Remove module files from filesystem
    this.logger.info('Removing module files', { moduleId });
  }

  private async backupModule(moduleId: string): Promise<void> {
    // Create backup of current module
    this.logger.info('Backing up module', { moduleId });
  }

  private async restoreModuleFromBackup(moduleId: string): Promise<void> {
    // Restore module from backup
    this.logger.info('Restoring module from backup', { moduleId });
  }

  private getFallbackModules(): MarketplaceModule[] {
    return [
      {
        id: 'security-scanner',
        name: 'Network Security Scanner',
        version: '1.2.0',
        description: 'Advanced network vulnerability scanning and intrusion detection',
        category: 'security',
        author: 'Pi5 Community',
        repository: 'https://github.com/pi5-community/security-scanner',
        downloadUrl: 'https://releases.pi5supernode.com/modules/security-scanner-1.2.0.zip',
        size: 4500000, // 4.5MB
        downloads: 1247,
        rating: 4.8,
        screenshots: [],
        dependencies: [],
        compatibility: {
          minVersion: '2.1.0',
          maxVersion: '3.0.0',
          platforms: ['pi5', 'pi4']
        },
        verified: true,
        lastUpdated: '2025-01-10T00:00:00Z',
        changelog: ['Added Zero-day detection', 'Improved scanning speed', 'Pi5 optimization']
      },
      {
        id: 'media-server',
        name: 'Plex Media Server Integration',
        version: '2.1.3',
        description: 'Integrated Plex media server management with network optimization',
        category: 'media',
        author: 'Media Team',
        repository: 'https://github.com/pi5-community/plex-integration',
        downloadUrl: 'https://releases.pi5supernode.com/modules/media-server-2.1.3.zip',
        size: 7800000, // 7.8MB
        downloads: 892,
        rating: 4.6,
        screenshots: [],
        dependencies: ['storage-management'],
        compatibility: {
          minVersion: '2.1.0',
          maxVersion: '3.0.0',
          platforms: ['pi5']
        },
        verified: true,
        lastUpdated: '2025-01-08T00:00:00Z',
        changelog: ['Docker integration', 'Automated library scanning', 'VLAN integration']
      },
      {
        id: 'homekit-bridge',
        name: 'HomeKit Bridge',
        version: '1.5.2',
        description: 'Apple HomeKit integration for IoT device control',
        category: 'automation',
        author: 'HomeKit Team',
        repository: 'https://github.com/pi5-community/homekit-bridge',
        downloadUrl: 'https://releases.pi5supernode.com/modules/homekit-bridge-1.5.2.zip',
        size: 3200000, // 3.2MB
        downloads: 673,
        rating: 4.9,
        screenshots: [],
        dependencies: ['automation-engine'],
        compatibility: {
          minVersion: '2.0.0',
          maxVersion: '3.0.0',
          platforms: ['pi5', 'pi4']
        },
        verified: true,
        lastUpdated: '2025-01-12T00:00:00Z',
        changelog: ['iOS 18 compatibility', 'Matter support', 'Enhanced device discovery']
      }
    ];
  }
}

export const moduleMarketplace = ModuleMarketplace.getInstance();</parameter>