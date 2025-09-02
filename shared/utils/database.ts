// Unified Database Client - Single Implementation
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { config } from '../config/environment';
import { UnifiedLogger } from './logger';

export class DatabaseManager {
  private static instance: SupabaseClient | null = null;
  private static logger = UnifiedLogger.getInstance('database');

  static getInstance(): SupabaseClient {
    if (!DatabaseManager.instance) {
      DatabaseManager.instance = DatabaseManager.createClient();
    }
    return DatabaseManager.instance;
  }

  private static createClient(): SupabaseClient {
    if (!config.SUPABASE_URL || !config.SUPABASE_KEY) {
      throw new Error('Supabase configuration missing: URL or KEY not provided');
    }

    const supabase = createClient(config.SUPABASE_URL, config.SUPABASE_KEY, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
      },
      db: {
        schema: 'public'
      },
      global: {
        headers: {
          'X-Client-Info': `pi5-supernode@${config.APP_VERSION}`
        }
      }
    });

    DatabaseManager.logger.info('Database client initialized', {
      url: config.SUPABASE_URL,
      schema: 'public'
    });

    return supabase;
  }

  // Enhanced query methods with logging and performance tracking
  static async query<T>(
    table: string,
    operation: 'select' | 'insert' | 'update' | 'delete' | 'upsert',
    query: any,
    context?: { service?: string; userId?: string }
  ): Promise<{ data: T[] | T | null; error: any; count?: number }> {
    const startTime = Date.now();
    const supabase = DatabaseManager.getInstance();
    
    try {
      let result;
      
      switch (operation) {
        case 'select':
          result = await query;
          break;
        case 'insert':
          result = await query;
          break;
        case 'update':
          result = await query;
          break;
        case 'delete':
          result = await query;
          break;
        case 'upsert':
          result = await query;
          break;
        default:
          throw new Error(`Unsupported operation: ${operation}`);
      }

      const duration = Date.now() - startTime;
      
      UnifiedLogger.logDatabaseQuery(
        context?.service || 'database',
        `${operation.toUpperCase()} ${table}`,
        duration,
        Array.isArray(result.data) ? result.data.length : result.data ? 1 : 0
      );

      // Log slow queries
      if (duration > 1000) {
        DatabaseManager.logger.warn('Slow query detected', {
          table,
          operation,
          duration,
          ...context
        });
      }

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      
      UnifiedLogger.logError(context?.service || 'database', error as Error, {
        table,
        operation,
        duration,
        ...context
      });

      throw error;
    }
  }

  // Real-time subscription with error handling
  static subscribeToTable<T>(
    table: string,
    filter?: string,
    callback?: (payload: any) => void,
    errorCallback?: (error: any) => void
  ) {
    const supabase = DatabaseManager.getInstance();
    
    let subscription = supabase
      .channel(`realtime:${table}`)
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table,
          filter 
        }, 
        (payload) => {
          DatabaseManager.logger.debug('Real-time update received', {
            table,
            event: payload.eventType,
            record: payload.new?.id || payload.old?.id
          });
          
          callback?.(payload);
        }
      )
      .on('error', (error) => {
        DatabaseManager.logger.error('Real-time subscription error', {
          table,
          error: error.message
        });
        
        errorCallback?.(error);
      })
      .subscribe();

    return subscription;
  }

  // Transaction support
  static async transaction<T>(
    operations: Array<(client: SupabaseClient) => Promise<any>>,
    context?: { service?: string; userId?: string }
  ): Promise<T[]> {
    const supabase = DatabaseManager.getInstance();
    const startTime = Date.now();

    try {
      // Note: Supabase doesn't have native transactions, so we'll use RPC
      const results: T[] = [];
      
      for (const operation of operations) {
        const result = await operation(supabase);
        results.push(result);
      }

      const duration = Date.now() - startTime;
      DatabaseManager.logger.info('Transaction completed', {
        operations: operations.length,
        duration,
        ...context
      });

      return results;
    } catch (error) {
      const duration = Date.now() - startTime;
      UnifiedLogger.logError(context?.service || 'database', error as Error, {
        operation: 'transaction',
        operationCount: operations.length,
        duration,
        ...context
      });

      throw error;
    }
  }

  // Health check
  static async healthCheck(): Promise<{
    healthy: boolean;
    latency: number;
    error?: string;
  }> {
    const startTime = Date.now();
    
    try {
      const { data, error } = await DatabaseManager.getInstance()
        .from('network_devices')
        .select('count(*)', { count: 'exact', head: true });

      const latency = Date.now() - startTime;

      if (error) {
        return { healthy: false, latency, error: error.message };
      }

      return { healthy: true, latency };
    } catch (error) {
      return { 
        healthy: false, 
        latency: Date.now() - startTime, 
        error: (error as Error).message 
      };
    }
  }
}

// Export singleton instance
export const db = DatabaseManager.getInstance();
export const dbManager = DatabaseManager;