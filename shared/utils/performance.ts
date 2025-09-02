// Unified Performance Monitoring and Optimization
import { UnifiedLogger } from './logger';

export interface PerformanceMetrics {
  operation: string;
  duration: number;
  memory?: number;
  cpuUsage?: number;
  timestamp: string;
  service: string;
}

export interface CacheConfig {
  ttl: number;
  maxSize: number;
  strategy: 'lru' | 'lfu' | 'fifo';
}

export class PerformanceMonitor {
  private static metrics: Map<string, PerformanceMetrics[]> = new Map();
  private static logger = UnifiedLogger.getInstance('performance');

  // Measure function execution time
  static async measure<T>(
    operation: string,
    fn: () => Promise<T> | T,
    service: string = 'unknown'
  ): Promise<T> {
    const startTime = performance.now();
    const startMemory = typeof process !== 'undefined' ? process.memoryUsage().heapUsed : 0;

    try {
      const result = await fn();
      const duration = performance.now() - startTime;
      const endMemory = typeof process !== 'undefined' ? process.memoryUsage().heapUsed : 0;

      const metric: PerformanceMetrics = {
        operation,
        duration,
        memory: endMemory - startMemory,
        timestamp: new Date().toISOString(),
        service
      };

      PerformanceMonitor.recordMetric(metric);

      // Log slow operations
      if (duration > 1000) {
        PerformanceMonitor.logger.warn('Slow operation detected', {
          operation,
          duration,
          memoryDelta: endMemory - startMemory,
          service
        });
      }

      return result;
    } catch (error) {
      const duration = performance.now() - startTime;
      
      PerformanceMonitor.logger.error('Operation failed', {
        operation,
        duration,
        error: (error as Error).message,
        service
      });

      throw error;
    }
  }

  // Record performance metric
  private static recordMetric(metric: PerformanceMetrics) {
    const serviceMetrics = PerformanceMonitor.metrics.get(metric.service) || [];
    serviceMetrics.push(metric);

    // Keep only last 1000 metrics per service
    if (serviceMetrics.length > 1000) {
      serviceMetrics.splice(0, serviceMetrics.length - 1000);
    }

    PerformanceMonitor.metrics.set(metric.service, serviceMetrics);
  }

  // Get performance statistics
  static getStats(service?: string): {
    averageDuration: number;
    slowestOperations: PerformanceMetrics[];
    totalOperations: number;
    memoryTrend: number;
  } {
    let allMetrics: PerformanceMetrics[] = [];

    if (service) {
      allMetrics = PerformanceMonitor.metrics.get(service) || [];
    } else {
      PerformanceMonitor.metrics.forEach(metrics => {
        allMetrics.push(...metrics);
      });
    }

    if (allMetrics.length === 0) {
      return {
        averageDuration: 0,
        slowestOperations: [],
        totalOperations: 0,
        memoryTrend: 0
      };
    }

    const averageDuration = allMetrics.reduce((sum, metric) => sum + metric.duration, 0) / allMetrics.length;
    const slowestOperations = allMetrics
      .sort((a, b) => b.duration - a.duration)
      .slice(0, 10);

    const memoryMetrics = allMetrics.filter(m => m.memory !== undefined);
    const memoryTrend = memoryMetrics.length > 1 
      ? memoryMetrics[memoryMetrics.length - 1].memory! - memoryMetrics[0].memory!
      : 0;

    return {
      averageDuration,
      slowestOperations,
      totalOperations: allMetrics.length,
      memoryTrend
    };
  }

  // Clear metrics
  static clearMetrics(service?: string) {
    if (service) {
      PerformanceMonitor.metrics.delete(service);
    } else {
      PerformanceMonitor.metrics.clear();
    }
  }
}

export class CacheManager {
  private static caches: Map<string, Map<string, { value: any; expires: number }>> = new Map();
  private static logger = UnifiedLogger.getInstance('cache');

  // Set cache value
  static set(
    namespace: string,
    key: string,
    value: any,
    ttl: number = 300 // 5 minutes default
  ): void {
    if (!CacheManager.caches.has(namespace)) {
      CacheManager.caches.set(namespace, new Map());
    }

    const cache = CacheManager.caches.get(namespace)!;
    const expires = Date.now() + (ttl * 1000);

    cache.set(key, { value, expires });

    CacheManager.logger.debug('Cache set', {
      namespace,
      key,
      ttl,
      expires: new Date(expires).toISOString()
    });
  }

  // Get cache value
  static get<T>(namespace: string, key: string): T | null {
    const cache = CacheManager.caches.get(namespace);
    if (!cache) return null;

    const entry = cache.get(key);
    if (!entry) return null;

    // Check if expired
    if (Date.now() > entry.expires) {
      cache.delete(key);
      CacheManager.logger.debug('Cache expired', { namespace, key });
      return null;
    }

    CacheManager.logger.debug('Cache hit', { namespace, key });
    return entry.value;
  }

  // Check if key exists and is valid
  static has(namespace: string, key: string): boolean {
    const cache = CacheManager.caches.get(namespace);
    if (!cache) return false;

    const entry = cache.get(key);
    if (!entry) return false;

    if (Date.now() > entry.expires) {
      cache.delete(key);
      return false;
    }

    return true;
  }

  // Delete cache entry
  static delete(namespace: string, key?: string): void {
    if (key) {
      const cache = CacheManager.caches.get(namespace);
      if (cache) {
        cache.delete(key);
        CacheManager.logger.debug('Cache deleted', { namespace, key });
      }
    } else {
      CacheManager.caches.delete(namespace);
      CacheManager.logger.debug('Cache namespace cleared', { namespace });
    }
  }

  // Clear expired entries
  static cleanup(): void {
    const now = Date.now();
    let totalCleared = 0;

    CacheManager.caches.forEach((cache, namespace) => {
      const keysToDelete: string[] = [];
      
      cache.forEach((entry, key) => {
        if (now > entry.expires) {
          keysToDelete.push(key);
        }
      });

      keysToDelete.forEach(key => cache.delete(key));
      totalCleared += keysToDelete.length;
    });

    if (totalCleared > 0) {
      CacheManager.logger.info('Cache cleanup completed', {
        clearedEntries: totalCleared
      });
    }
  }

  // Get cache statistics
  static getStats(): Record<string, {
    size: number;
    hitRate: number;
    memoryUsage: number;
  }> {
    const stats: Record<string, any> = {};

    CacheManager.caches.forEach((cache, namespace) => {
      stats[namespace] = {
        size: cache.size,
        hitRate: 0, // Would need hit/miss tracking
        memoryUsage: JSON.stringify([...cache.entries()]).length
      };
    });

    return stats;
  }
}

// Export performance monitoring utilities
export const performance = {
  measure: PerformanceMonitor.measure,
  getStats: PerformanceMonitor.getStats,
  clearMetrics: PerformanceMonitor.clearMetrics
};

export const cache = {
  set: CacheManager.set,
  get: CacheManager.get,
  has: CacheManager.has,
  delete: CacheManager.delete,
  cleanup: CacheManager.cleanup,
  getStats: CacheManager.getStats
};

// Auto cleanup cache every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    CacheManager.cleanup();
  }, 5 * 60 * 1000);
}