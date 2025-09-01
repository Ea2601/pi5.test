import { Pool, PoolClient, QueryResult } from 'pg';
import { logger } from '../utils/logger';

export interface DatabaseConfig {
  connectionString: string;
  max?: number;
  idleTimeoutMillis?: number;
  connectionTimeoutMillis?: number;
}

export class SharedDatabaseService {
  private static instance: SharedDatabaseService;
  private pool: Pool;
  private isConnected = false;

  private constructor(config: DatabaseConfig) {
    this.pool = new Pool({
      connectionString: config.connectionString,
      max: config.max || 20,
      idleTimeoutMillis: config.idleTimeoutMillis || 30000,
      connectionTimeoutMillis: config.connectionTimeoutMillis || 2000,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });

    this.pool.on('error', (err) => {
      logger.error('Unexpected error on idle database client:', err);
      this.isConnected = false;
    });

    this.pool.on('connect', () => {
      this.isConnected = true;
      logger.info('Database pool connected');
    });

    this.pool.on('remove', () => {
      logger.info('Database client removed from pool');
    });
  }

  public static getInstance(config?: DatabaseConfig): SharedDatabaseService {
    if (!SharedDatabaseService.instance) {
      if (!config) {
        throw new Error('Database configuration required for first initialization');
      }
      SharedDatabaseService.instance = new SharedDatabaseService(config);
    }
    return SharedDatabaseService.instance;
  }

  async query<T = any>(text: string, params?: any[]): Promise<QueryResult<T>> {
    const start = Date.now();
    try {
      const result = await this.pool.query<T>(text, params);
      const duration = Date.now() - start;
      
      logger.debug('Database query executed', { 
        query: text.substring(0, 100) + (text.length > 100 ? '...' : ''),
        duration,
        rows: result.rowCount 
      });
      
      return result;
    } catch (error) {
      const duration = Date.now() - start;
      logger.error('Database query error:', { 
        query: text.substring(0, 100) + (text.length > 100 ? '...' : ''),
        params: params?.slice(0, 5), // Limit logged params
        duration,
        error: error instanceof Error ? error.message : error
      });
      throw error;
    }
  }

  async getClient(): Promise<PoolClient> {
    try {
      return await this.pool.connect();
    } catch (error) {
      logger.error('Failed to get database client:', error);
      throw error;
    }
  }

  async transaction<T>(callback: (client: PoolClient) => Promise<T>): Promise<T> {
    const client = await this.getClient();
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error('Transaction rolled back:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  async healthCheck(): Promise<{ healthy: boolean; latency: number; error?: string }> {
    const start = Date.now();
    try {
      await this.query('SELECT 1');
      const latency = Date.now() - start;
      return { healthy: true, latency };
    } catch (error) {
      const latency = Date.now() - start;
      return { 
        healthy: false, 
        latency,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async getTableInfo(tableName: string): Promise<any> {
    try {
      const result = await this.query(`
        SELECT 
          column_name,
          data_type,
          is_nullable,
          column_default
        FROM information_schema.columns 
        WHERE table_name = $1 
        ORDER BY ordinal_position
      `, [tableName]);
      
      return result.rows;
    } catch (error) {
      logger.error(`Error getting table info for ${tableName}:`, error);
      throw error;
    }
  }

  async executeFunction(functionName: string, params: any[] = []): Promise<any> {
    try {
      const placeholders = params.map((_, index) => `$${index + 1}`).join(', ');
      const query = `SELECT ${functionName}(${placeholders})`;
      
      const result = await this.query(query, params);
      return result.rows[0];
    } catch (error) {
      logger.error(`Error executing function ${functionName}:`, error);
      throw error;
    }
  }

  getConnectionStatus(): { connected: boolean; poolSize: number } {
    return {
      connected: this.isConnected,
      poolSize: this.pool.totalCount
    };
  }

  async close(): Promise<void> {
    try {
      await this.pool.end();
      this.isConnected = false;
      logger.info('Database pool closed');
    } catch (error) {
      logger.error('Error closing database pool:', error);
      throw error;
    }
  }
}

// Helper function to initialize database with environment config
export const initializeDatabase = (): SharedDatabaseService => {
  const config: DatabaseConfig = {
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/pi5_supernode',
    max: parseInt(process.env.DB_POOL_MAX || '20'),
    idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT || '30000'),
    connectionTimeoutMillis: parseInt(process.env.DB_CONNECTION_TIMEOUT || '2000')
  };

  return SharedDatabaseService.getInstance(config);
};

// Export singleton instance
export const db = SharedDatabaseService.getInstance({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/pi5_supernode'
});