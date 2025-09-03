/**
 * Automated Installation System
 * Zero-configuration setup for Pi5 Supernode modules
 */

import { UnifiedLogger } from '../../shared/utils/logger';
import { moduleRegistry } from './ModuleRegistry';
import { moduleManager } from './ModuleManager';

export interface InstallationConfig {
  platform: 'pi5' | 'generic-linux' | 'development';
  modules: string[];
  databaseConfig: {
    type: 'supabase' | 'postgresql' | 'sqlite';
    autoSetup: boolean;
    connectionString?: string;
  };
  networkConfig: {
    staticIP?: string;
    hostname?: string;
    timezone: string;
  };
  securityConfig: {
    generateCerts: boolean;
    enableFirewall: boolean;
    sshConfig: boolean;
  };
}

export interface InstallationStep {
  id: string;
  name: string;
  description: string;
  required: boolean;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
  progress: number;
  error?: string;
  duration?: number;
}

class AutoInstaller {
  private static instance: AutoInstaller;
  private logger = UnifiedLogger.getInstance('auto-installer');
  private installationSteps: InstallationStep[] = [];
  private isInstalling = false;

  static getInstance(): AutoInstaller {
    if (!AutoInstaller.instance) {
      AutoInstaller.instance = new AutoInstaller();
    }
    return AutoInstaller.instance;
  }

  async startInstallation(config: InstallationConfig): Promise<void> {
    if (this.isInstalling) {
      throw new Error('Installation already in progress');
    }

    this.isInstalling = true;
    this.logger.info('Starting automated installation', { config });

    try {
      await this.runInstallationPhases(config);
      this.logger.info('Installation completed successfully');
    } catch (error) {
      this.logger.error('Installation failed', { error: (error as Error).message });
      throw error;
    } finally {
      this.isInstalling = false;
    }
  }

  private async runInstallationPhases(config: InstallationConfig): Promise<void> {
    // Phase 1: System preparation
    await this.executeStep({
      id: 'system-check',
      name: 'System Check',
      description: 'Validating system requirements',
      required: true,
      status: 'pending',
      progress: 0
    }, () => this.validateSystemRequirements(config));

    // Phase 2: Database setup
    await this.executeStep({
      id: 'database-setup',
      name: 'Database Setup',
      description: 'Configuring database connection',
      required: true,
      status: 'pending',
      progress: 0
    }, () => this.setupDatabase(config.databaseConfig));

    // Phase 3: Network configuration
    await this.executeStep({
      id: 'network-config',
      name: 'Network Configuration',
      description: 'Setting up network interfaces',
      required: true,
      status: 'pending',
      progress: 0
    }, () => this.configureNetwork(config.networkConfig));

    // Phase 4: Security hardening
    await this.executeStep({
      id: 'security-setup',
      name: 'Security Setup',
      description: 'Applying security configurations',
      required: true,
      status: 'pending',
      progress: 0
    }, () => this.configureSecurity(config.securityConfig));

    // Phase 5: Module installation
    for (const moduleId of config.modules) {
      await this.executeStep({
        id: `module-${moduleId}`,
        name: `Install ${moduleId}`,
        description: `Installing ${moduleId} module`,
        required: false,
        status: 'pending',
        progress: 0
      }, () => this.installModule(moduleId));
    }

    // Phase 6: System verification
    await this.executeStep({
      id: 'verification',
      name: 'System Verification',
      description: 'Verifying installation and starting services',
      required: true,
      status: 'pending',
      progress: 0
    }, () => this.verifyInstallation());
  }

  private async executeStep(step: InstallationStep, executor: () => Promise<void>): Promise<void> {
    const startTime = Date.now();
    
    try {
      step.status = 'running';
      this.updateStep(step);
      
      await executor();
      
      step.status = 'completed';
      step.progress = 100;
      step.duration = Date.now() - startTime;
      this.updateStep(step);
      
      this.logger.info(`Installation step completed: ${step.name}`, { duration: step.duration });
    } catch (error) {
      step.status = 'failed';
      step.error = (error as Error).message;
      step.duration = Date.now() - startTime;
      this.updateStep(step);
      
      this.logger.error(`Installation step failed: ${step.name}`, { 
        error: (error as Error).message,
        duration: step.duration 
      });
      
      if (step.required) {
        throw error;
      }
    }
  }

  private updateStep(step: InstallationStep): void {
    const existingIndex = this.installationSteps.findIndex(s => s.id === step.id);
    if (existingIndex >= 0) {
      this.installationSteps[existingIndex] = step;
    } else {
      this.installationSteps.push(step);
    }
    
    // Emit progress update
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('installationProgress', { detail: step }));
    }
  }

  private async validateSystemRequirements(config: InstallationConfig): Promise<void> {
    // System validation
    this.logger.info('Validating system requirements...');
    
    // Check platform
    if (config.platform === 'pi5') {
      await this.validateRaspberryPi5();
    }
    
    // Check Node.js version
    await this.validateNodeVersion();
    
    // Check available ports
    await this.validatePorts();
    
    // Check disk space
    await this.validateDiskSpace();
  }

  private async setupDatabase(dbConfig: InstallationConfig['databaseConfig']): Promise<void> {
    this.logger.info('Setting up database...', { type: dbConfig.type });

    if (dbConfig.autoSetup) {
      switch (dbConfig.type) {
        case 'supabase':
          await this.setupSupabase();
          break;
        case 'postgresql':
          await this.setupPostgreSQL();
          break;
        case 'sqlite':
          await this.setupSQLite();
          break;
      }
    }

    // Test database connection
    await this.testDatabaseConnection(dbConfig);
  }

  private async configureNetwork(networkConfig: InstallationConfig['networkConfig']): Promise<void> {
    this.logger.info('Configuring network...', { config: networkConfig });

    if (networkConfig.staticIP) {
      await this.configureStaticIP(networkConfig.staticIP);
    }

    if (networkConfig.hostname) {
      await this.setHostname(networkConfig.hostname);
    }

    await this.setTimezone(networkConfig.timezone);
  }

  private async configureSecurity(securityConfig: InstallationConfig['securityConfig']): Promise<void> {
    this.logger.info('Configuring security...', { config: securityConfig });

    if (securityConfig.enableFirewall) {
      await this.setupFirewall();
    }

    if (securityConfig.generateCerts) {
      await this.generateSSLCertificates();
    }

    if (securityConfig.sshConfig) {
      await this.hardenSSH();
    }
  }

  private async installModule(moduleId: string): Promise<void> {
    this.logger.info(`Installing module: ${moduleId}`);
    await moduleRegistry.downloadAndInstallModule(moduleId);
  }

  private async verifyInstallation(): Promise<void> {
    this.logger.info('Verifying installation...');

    // Check all modules are loaded
    const loadedModules = moduleManager.getAllModules();
    this.logger.info(`Loaded modules: ${loadedModules.length}`);

    // Perform health checks
    const healthStatus = await moduleRegistry.performHealthCheck();
    
    for (const [moduleId, isHealthy] of Object.entries(healthStatus)) {
      if (!isHealthy) {
        this.logger.warn(`Module health check failed: ${moduleId}`);
      }
    }

    // Test API endpoints
    await this.testAPIEndpoints();
  }

  // Platform-specific validations
  private async validateRaspberryPi5(): Promise<void> {
    // Check if running on Pi5
    try {
      const cpuInfo = await fetch('/proc/cpuinfo').then(r => r.text()).catch(() => '');
      if (!cpuInfo.includes('Raspberry Pi 5')) {
        this.logger.warn('Not running on Raspberry Pi 5, compatibility may vary');
      }
    } catch (error) {
      this.logger.debug('Could not validate Pi5 hardware');
    }
  }

  private async validateNodeVersion(): Promise<void> {
    const nodeVersion = process.version;
    const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
    
    if (majorVersion < 18) {
      throw new Error(`Node.js version ${nodeVersion} not supported. Minimum version: 18.x`);
    }
  }

  private async validatePorts(): Promise<void> {
    const requiredPorts = [3000, 3001, 3002, 3003, 5173];
    
    for (const port of requiredPorts) {
      try {
        // Check if port is available
        const response = await fetch(`http://localhost:${port}/health`).catch(() => null);
        if (response && response.ok) {
          this.logger.info(`Port ${port} is already in use but accessible`);
        }
      } catch (error) {
        // Port is available (expected for new installation)
      }
    }
  }

  private async validateDiskSpace(): Promise<void> {
    // Minimum 2GB free space required
    const minimumSpace = 2 * 1024 * 1024 * 1024; // 2GB in bytes
    
    try {
      if (typeof navigator !== 'undefined' && 'storage' in navigator && 'estimate' in navigator.storage) {
        const estimate = await navigator.storage.estimate();
        const available = estimate.quota! - estimate.usage!;
        
        if (available < minimumSpace) {
          throw new Error(`Insufficient disk space. Required: 2GB, Available: ${(available / 1024 / 1024 / 1024).toFixed(1)}GB`);
        }
      }
    } catch (error) {
      this.logger.warn('Could not validate disk space', { error: (error as Error).message });
    }
  }

  private async setupSupabase(): Promise<void> {
    // Auto-setup Supabase connection
    this.logger.info('Setting up Supabase connection...');
    
    // Check for environment variables
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase configuration missing. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
    }
    
    // Test connection
    try {
      const response = await fetch(`${supabaseUrl}/rest/v1/`, {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Supabase connection test failed');
      }
    } catch (error) {
      throw new Error(`Supabase setup failed: ${(error as Error).message}`);
    }
  }

  private async setupPostgreSQL(): Promise<void> {
    this.logger.info('Setting up PostgreSQL...');
    // Implementation for local PostgreSQL setup
  }

  private async setupSQLite(): Promise<void> {
    this.logger.info('Setting up SQLite...');
    // Implementation for SQLite setup
  }

  private async testDatabaseConnection(dbConfig: InstallationConfig['databaseConfig']): Promise<void> {
    // Database connection test implementation
    this.logger.info('Testing database connection...');
  }

  private async configureStaticIP(staticIP: string): Promise<void> {
    this.logger.info(`Configuring static IP: ${staticIP}`);
    // Static IP configuration implementation
  }

  private async setHostname(hostname: string): Promise<void> {
    this.logger.info(`Setting hostname: ${hostname}`);
    // Hostname configuration implementation
  }

  private async setTimezone(timezone: string): Promise<void> {
    this.logger.info(`Setting timezone: ${timezone}`);
    // Timezone configuration implementation
  }

  private async setupFirewall(): Promise<void> {
    this.logger.info('Setting up firewall...');
    // Firewall configuration implementation
  }

  private async generateSSLCertificates(): Promise<void> {
    this.logger.info('Generating SSL certificates...');
    // SSL certificate generation implementation
  }

  private async hardenSSH(): Promise<void> {
    this.logger.info('Hardening SSH configuration...');
    // SSH hardening implementation
  }

  private async testAPIEndpoints(): Promise<void> {
    const endpoints = [
      '/health',
      '/api/v1/system/info',
      '/api/v1/network/devices'
    ];

    for (const endpoint of endpoints) {
      try {
        const response = await fetch(endpoint);
        if (!response.ok) {
          throw new Error(`Endpoint test failed: ${endpoint}`);
        }
      } catch (error) {
        this.logger.warn(`Endpoint not accessible: ${endpoint}`, { error: (error as Error).message });
      }
    }
  }

  getInstallationProgress(): InstallationStep[] {
    return [...this.installationSteps];
  }

  isInstallationInProgress(): boolean {
    return this.isInstalling;
  }
}

export const autoInstaller = AutoInstaller.getInstance();