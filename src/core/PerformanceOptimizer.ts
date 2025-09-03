/**
 * Performance Optimization System
 * Module lazy loading, caching, and resource management
 */

import { UnifiedLogger } from '../../shared/utils/logger';
import { moduleManager } from './ModuleManager';

export interface PerformanceMetrics {
  moduleLoadTime: Record<string, number>;
  memoryUsage: Record<string, number>;
  renderTime: Record<string, number>;
  apiResponseTime: Record<string, number>;
  bundleSize: number;
  cacheHitRatio: number;
}

export interface OptimizationConfig {
  lazyLoading: boolean;
  preloadCriticalModules: boolean;
  cacheStrategy: 'memory' | 'localStorage' | 'hybrid';
  maxCacheSize: number;
  modulePriority: Record<string, 'critical' | 'high' | 'normal' | 'low'>;
}

class PerformanceOptimizer {
  private static instance: PerformanceOptimizer;
  private logger = UnifiedLogger.getInstance('performance-optimizer');
  private moduleCache: Map<string, any> = new Map();
  private preloadQueue: string[] = [];
  private metrics: PerformanceMetrics = {
    moduleLoadTime: {},
    memoryUsage: {},
    renderTime: {},
    apiResponseTime: {},
    bundleSize: 0,
    cacheHitRatio: 0
  };

  private config: OptimizationConfig = {
    lazyLoading: true,
    preloadCriticalModules: true,
    cacheStrategy: 'hybrid',
    maxCacheSize: 50 * 1024 * 1024, // 50MB
    modulePriority: {
      'device-management': 'critical',
      'network-management': 'critical',
      'vpn-management': 'high',
      'automation-engine': 'normal',
      'storage-management': 'normal',
      'monitoring-dashboard': 'high',
      'system-settings': 'normal'
    }
  };

  static getInstance(): PerformanceOptimizer {
    if (!PerformanceOptimizer.instance) {
      PerformanceOptimizer.instance = new PerformanceOptimizer();
    }
    return PerformanceOptimizer.instance;
  }

  async initialize(): Promise<void> {
    this.logger.info('Initializing performance optimizer');

    // Start performance monitoring
    this.startPerformanceMonitoring();

    // Preload critical modules if enabled
    if (this.config.preloadCriticalModules) {
      await this.preloadCriticalModules();
    }

    // Set up cache management
    this.setupCacheManagement();

    this.logger.info('Performance optimizer initialized');
  }

  // Lazy load module with caching
  async loadModuleOnDemand(moduleId: string): Promise<any> {
    const startTime = performance.now();

    try {
      // Check cache first
      if (this.moduleCache.has(moduleId)) {
        this.recordCacheHit(moduleId);
        return this.moduleCache.get(moduleId);
      }

      this.logger.info('Loading module on demand', { moduleId });

      // Dynamic import with error handling
      let ModuleClass;
      
      try {
        switch (moduleId) {
          case 'device-management':
            ModuleClass = await import('../modules/DeviceModule');
            break;
          case 'network-management':
            ModuleClass = await import('../modules/NetworkModule');
            break;
          case 'vpn-management':
            ModuleClass = await import('../modules/VPNModule');
            break;
          case 'automation-engine':
            ModuleClass = await import('../modules/AutomationModule');
            break;
          case 'storage-management':
            ModuleClass = await import('../modules/StorageModule');
            break;
          case 'monitoring-dashboard':
            ModuleClass = await import('../modules/MonitoringModule');
            break;
          case 'system-settings':
            ModuleClass = await import('../modules/SystemSettingsModule');
            break;
          default:
            throw new Error(`Unknown module: ${moduleId}`);
        }
      } catch (importError) {
        this.logger.error('Module import failed', { moduleId, error: (importError as Error).message });
        // Return fallback component
        return this.getFallbackModule(moduleId);
      }

      const moduleInstance = ModuleClass.default;

      // Cache the module
      this.moduleCache.set(moduleId, moduleInstance);
      
      // Record metrics
      const loadTime = performance.now() - startTime;
      this.metrics.moduleLoadTime[moduleId] = loadTime;

      this.logger.info('Module loaded successfully', { moduleId, loadTime });
      return moduleInstance;

    } catch (error) {
      this.logger.error('Module loading failed', { moduleId, error: (error as Error).message });
      return this.getFallbackModule(moduleId);
    }
  }

  // Preload critical modules for better UX
  private async preloadCriticalModules(): Promise<void> {
    const criticalModules = Object.entries(this.config.modulePriority)
      .filter(([_, priority]) => priority === 'critical')
      .map(([moduleId]) => moduleId);

    this.logger.info('Preloading critical modules', { modules: criticalModules });

    const preloadPromises = criticalModules.map(async (moduleId) => {
      try {
        await this.loadModuleOnDemand(moduleId);
        this.logger.debug('Critical module preloaded', { moduleId });
      } catch (error) {
        this.logger.warn('Critical module preload failed', { moduleId, error: (error as Error).message });
      }
    });

    await Promise.allSettled(preloadPromises);
  }

  // Background module preloading based on usage patterns
  async preloadModulesInBackground(): Promise<void> {
    const highPriorityModules = Object.entries(this.config.modulePriority)
      .filter(([_, priority]) => priority === 'high')
      .map(([moduleId]) => moduleId);

    for (const moduleId of highPriorityModules) {
      if (!this.moduleCache.has(moduleId)) {
        // Use requestIdleCallback for background loading
        if (typeof requestIdleCallback !== 'undefined') {
          requestIdleCallback(() => this.loadModuleOnDemand(moduleId));
        } else {
          setTimeout(() => this.loadModuleOnDemand(moduleId), 100);
        }
      }
    }
  }

  // Module component lazy loading wrapper
  createLazyComponent(moduleId: string): React.ComponentType<any> {
    return React.lazy(async () => {
      const ModuleClass = await this.loadModuleOnDemand(moduleId);
      return { default: ModuleClass };
    });
  }

  // Cache management
  private setupCacheManagement(): void {
    // Monitor cache size
    setInterval(() => this.manageCacheSize(), 60000); // Every minute

    // Persist cache to localStorage if using hybrid strategy
    if (this.config.cacheStrategy === 'hybrid' || this.config.cacheStrategy === 'localStorage') {
      this.setupPersistentCache();
    }
  }

  private manageCacheSize(): void {
    const currentSize = this.calculateCacheSize();
    
    if (currentSize > this.config.maxCacheSize) {
      this.evictLeastUsedModules();
    }
  }

  private calculateCacheSize(): number {
    let size = 0;
    for (const [moduleId, moduleData] of this.moduleCache.entries()) {
      size += JSON.stringify(moduleData).length;
    }
    return size;
  }

  private evictLeastUsedModules(): void {
    // Implement LRU cache eviction
    const moduleUsage: Array<{ moduleId: string; lastUsed: number }> = [];
    
    for (const [moduleId] of this.moduleCache.entries()) {
      const module = moduleManager.getModule(moduleId);
      const lastUsed = module?.getStatus()?.metrics?.lastAccessed || 0;
      moduleUsage.push({ moduleId, lastUsed });
    }

    // Sort by usage and evict oldest
    moduleUsage.sort((a, b) => a.lastUsed - b.lastUsed);
    
    const toEvict = moduleUsage.slice(0, Math.ceil(moduleUsage.length * 0.3)); // Evict 30%
    
    for (const { moduleId } of toEvict) {
      if (this.config.modulePriority[moduleId] !== 'critical') {
        this.moduleCache.delete(moduleId);
        this.logger.debug('Module evicted from cache', { moduleId });
      }
    }
  }

  private setupPersistentCache(): void {
    // Load cache from localStorage on startup
    if (typeof localStorage !== 'undefined') {
      try {
        const cachedModules = localStorage.getItem('pi5-module-cache');
        if (cachedModules) {
          const parsed = JSON.parse(cachedModules);
          for (const [moduleId, data] of Object.entries(parsed)) {
            this.moduleCache.set(moduleId, data);
          }
        }
      } catch (error) {
        this.logger.warn('Failed to load persistent cache', { error: (error as Error).message });
      }
    }

    // Save cache to localStorage periodically
    setInterval(() => {
      if (typeof localStorage !== 'undefined') {
        try {
          const cacheData = Object.fromEntries(this.moduleCache.entries());
          localStorage.setItem('pi5-module-cache', JSON.stringify(cacheData));
        } catch (error) {
          this.logger.debug('Cache persistence failed', { error: (error as Error).message });
        }
      }
    }, 300000); // Every 5 minutes
  }

  // Performance monitoring
  private startPerformanceMonitoring(): void {
    // Monitor Core Web Vitals
    this.monitorWebVitals();

    // Monitor module performance
    this.monitorModulePerformance();

    // Monitor API performance
    this.monitorAPIPerformance();
  }

  private monitorWebVitals(): void {
    if (typeof window !== 'undefined') {
      // Largest Contentful Paint (LCP)
      new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        const lastEntry = entries[entries.length - 1];
        this.logger.debug('LCP measured', { value: lastEntry.startTime });
      }).observe({ entryTypes: ['largest-contentful-paint'] });

      // First Input Delay (FID)
      new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        for (const entry of entries) {
          this.logger.debug('FID measured', { value: entry.processingStart - entry.startTime });
        }
      }).observe({ entryTypes: ['first-input'] });

      // Cumulative Layout Shift (CLS)
      new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        for (const entry of entries) {
          if (!entry.hadRecentInput) {
            this.logger.debug('CLS measured', { value: entry.value });
          }
        }
      }).observe({ entryTypes: ['layout-shift'] });
    }
  }

  private monitorModulePerformance(): void {
    // Monitor module render times
    if (typeof window !== 'undefined') {
      new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        for (const entry of entries) {
          if (entry.name.includes('module-')) {
            const moduleId = entry.name.replace('module-', '');
            this.metrics.renderTime[moduleId] = entry.duration;
          }
        }
      }).observe({ entryTypes: ['measure'] });
    }
  }

  private monitorAPIPerformance(): void {
    // Monitor API response times
    const originalFetch = fetch;
    (window as any).fetch = async (...args: any[]) => {
      const startTime = performance.now();
      try {
        const response = await originalFetch(...args);
        const endTime = performance.now();
        
        const url = typeof args[0] === 'string' ? args[0] : args[0].url;
        this.metrics.apiResponseTime[url] = endTime - startTime;
        
        return response;
      } catch (error) {
        throw error;
      }
    };
  }

  private recordCacheHit(moduleId: string): void {
    // Update cache hit ratio
    const totalRequests = Object.keys(this.metrics.moduleLoadTime).length + 1;
    const cacheHits = this.moduleCache.size;
    this.metrics.cacheHitRatio = cacheHits / totalRequests;
  }

  private getFallbackModule(moduleId: string): any {
    // Return minimal fallback component for failed modules
    return class FallbackModule {
      static displayName = `Fallback_${moduleId}`;
      
      static defaultProps = {
        error: `Module ${moduleId} failed to load`
      };

      render() {
        return React.createElement('div', {
          className: 'p-8 text-center'
        }, [
          React.createElement('h3', { key: 'title' }, 'Module Loading Error'),
          React.createElement('p', { key: 'message' }, `${moduleId} could not be loaded`)
        ]);
      }
    };
  }

  // Get performance report
  getPerformanceReport(): PerformanceMetrics & {
    recommendations: string[];
    issues: string[];
  } {
    const recommendations: string[] = [];
    const issues: string[] = [];

    // Analyze metrics and generate recommendations
    if (this.metrics.cacheHitRatio < 0.7) {
      recommendations.push('Cache hit ratio is low, consider adjusting cache strategy');
    }

    const slowModules = Object.entries(this.metrics.moduleLoadTime)
      .filter(([_, time]) => time > 2000)
      .map(([moduleId]) => moduleId);

    if (slowModules.length > 0) {
      issues.push(`Slow loading modules: ${slowModules.join(', ')}`);
      recommendations.push('Consider code splitting or preloading for slow modules');
    }

    return {
      ...this.metrics,
      recommendations,
      issues
    };
  }

  // Manual cache control
  clearModuleCache(moduleId?: string): void {
    if (moduleId) {
      this.moduleCache.delete(moduleId);
      this.logger.info('Module cache cleared', { moduleId });
    } else {
      this.moduleCache.clear();
      this.logger.info('All module cache cleared');
    }
  }

  // Preload specific modules
  async preloadModules(moduleIds: string[]): Promise<void> {
    const preloadPromises = moduleIds.map(moduleId => this.loadModuleOnDemand(moduleId));
    await Promise.allSettled(preloadPromises);
  }

  // Resource cleanup for unmounted modules
  cleanupModule(moduleId: string): void {
    this.moduleCache.delete(moduleId);
    delete this.metrics.moduleLoadTime[moduleId];
    delete this.metrics.memoryUsage[moduleId];
    delete this.metrics.renderTime[moduleId];
    
    this.logger.debug('Module resources cleaned up', { moduleId });
  }
}

export const performanceOptimizer = PerformanceOptimizer.getInstance();</parameter>