// Unified Environment Configuration - Single Source of Truth
import dotenv from 'dotenv';
import path from 'path';

// Load environment files
dotenv.config();
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

export interface EnvironmentConfig {
  // Application
  NODE_ENV: 'development' | 'production' | 'test';
  APP_VERSION: string;
  APP_NAME: string;
  
  // Database
  DATABASE_URL: string;
  POSTGRES_PASSWORD: string;
  REDIS_URL: string;
  SUPABASE_URL: string;
  SUPABASE_KEY: string;
  
  // API Services
  API_GATEWAY_PORT: number;
  NETWORK_SERVICE_PORT: number;
  VPN_SERVICE_PORT: number;
  AUTOMATION_SERVICE_PORT: number;
  API_TIMEOUT: number;
  
  // Authentication
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
  SESSION_SECRET: string;
  
  // External Services
  TELEGRAM_BOT_TOKEN?: string;
  WEBHOOK_BASE_URL?: string;
  
  // Monitoring
  GRAFANA_PASSWORD: string;
  LOG_LEVEL: 'debug' | 'info' | 'warn' | 'error';
  LOG_DIR: string;
  PROMETHEUS_PORT: number;
  
  // Frontend
  FRONTEND_URL: string;
  
  // SSL/Security
  SSL_CERT_PATH?: string;
  SSL_KEY_PATH?: string;
  ENABLE_HTTPS: boolean;
  
  // Performance
  CACHE_TTL: number;
  MAX_CONNECTIONS: number;
  RATE_LIMIT_WINDOW: number;
  RATE_LIMIT_MAX_REQUESTS: number;
  
  // WireGuard
  WG_INTERFACE_PREFIX: string;
  WG_DEFAULT_PORT: number;
  WG_KEY_ROTATION_DAYS: number;
  
  // Network
  DEFAULT_VLAN: number;
  MANAGEMENT_VLAN: number;
  DNS_CACHE_SIZE: number;
  DHCP_LEASE_TIME: string;
  
  // Backup
  BACKUP_ENABLED: boolean;
  BACKUP_SCHEDULE: string;
  BACKUP_RETENTION_DAYS: number;
}

class EnvironmentManager {
  private static _config: EnvironmentConfig | null = null;

  static get config(): EnvironmentConfig {
    if (!EnvironmentManager._config) {
      EnvironmentManager._config = EnvironmentManager.loadConfig();
    }
    return EnvironmentManager._config;
  }

  private static loadConfig(): EnvironmentConfig {
    // Validate required environment variables
    const required = [
      'DATABASE_URL',
      'JWT_SECRET',
      'SUPABASE_URL',
      'SUPABASE_KEY'
    ];

    const missing = required.filter(key => !process.env[key]);
    if (missing.length > 0) {
      throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }

    return {
      // Application
      NODE_ENV: (process.env.NODE_ENV as any) || 'development',
      APP_VERSION: process.env.APP_VERSION || '2.1.4',
      APP_NAME: process.env.APP_NAME || 'Pi5 Supernode',
      
      // Database
      DATABASE_URL: process.env.DATABASE_URL!,
      POSTGRES_PASSWORD: process.env.POSTGRES_PASSWORD || 'postgres',
      REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',
      SUPABASE_URL: process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL!,
      SUPABASE_KEY: process.env.SUPABASE_KEY || process.env.VITE_SUPABASE_ANON_KEY!,
      
      // API Services
      API_GATEWAY_PORT: parseInt(process.env.API_GATEWAY_PORT || '3000'),
      NETWORK_SERVICE_PORT: parseInt(process.env.NETWORK_SERVICE_PORT || '3001'),
      VPN_SERVICE_PORT: parseInt(process.env.VPN_SERVICE_PORT || '3002'),
      AUTOMATION_SERVICE_PORT: parseInt(process.env.AUTOMATION_SERVICE_PORT || '3003'),
      API_TIMEOUT: parseInt(process.env.API_TIMEOUT || '10000'),
      
      // Authentication
      JWT_SECRET: process.env.JWT_SECRET!,
      JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '24h',
      SESSION_SECRET: process.env.SESSION_SECRET || process.env.JWT_SECRET!,
      
      // External Services
      TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN,
      WEBHOOK_BASE_URL: process.env.WEBHOOK_BASE_URL,
      
      // Monitoring
      GRAFANA_PASSWORD: process.env.GRAFANA_PASSWORD || 'admin',
      LOG_LEVEL: (process.env.LOG_LEVEL as any) || 'info',
      LOG_DIR: process.env.LOG_DIR || './logs',
      PROMETHEUS_PORT: parseInt(process.env.PROMETHEUS_PORT || '9090'),
      
      // Frontend
      FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',
      
      // SSL/Security
      SSL_CERT_PATH: process.env.SSL_CERT_PATH,
      SSL_KEY_PATH: process.env.SSL_KEY_PATH,
      ENABLE_HTTPS: process.env.ENABLE_HTTPS === 'true',
      
      // Performance
      CACHE_TTL: parseInt(process.env.CACHE_TTL || '300'),
      MAX_CONNECTIONS: parseInt(process.env.MAX_CONNECTIONS || '100'),
      RATE_LIMIT_WINDOW: parseInt(process.env.RATE_LIMIT_WINDOW || '900000'), // 15 minutes
      RATE_LIMIT_MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
      
      // WireGuard
      WG_INTERFACE_PREFIX: process.env.WG_INTERFACE_PREFIX || 'wg',
      WG_DEFAULT_PORT: parseInt(process.env.WG_DEFAULT_PORT || '51820'),
      WG_KEY_ROTATION_DAYS: parseInt(process.env.WG_KEY_ROTATION_DAYS || '90'),
      
      // Network
      DEFAULT_VLAN: parseInt(process.env.DEFAULT_VLAN || '20'),
      MANAGEMENT_VLAN: parseInt(process.env.MANAGEMENT_VLAN || '10'),
      DNS_CACHE_SIZE: parseInt(process.env.DNS_CACHE_SIZE || '100'),
      DHCP_LEASE_TIME: process.env.DHCP_LEASE_TIME || '24 hours',
      
      // Backup
      BACKUP_ENABLED: process.env.BACKUP_ENABLED === 'true',
      BACKUP_SCHEDULE: process.env.BACKUP_SCHEDULE || '0 2 * * *', // Daily at 2 AM
      BACKUP_RETENTION_DAYS: parseInt(process.env.BACKUP_RETENTION_DAYS || '30')
    };
  }

  // Environment validation
  static validate(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    const config = EnvironmentManager.config;

    // Validate database URL format
    if (!config.DATABASE_URL.startsWith('postgresql://')) {
      errors.push('DATABASE_URL must be a valid PostgreSQL connection string');
    }

    // Validate ports
    const ports = [
      config.API_GATEWAY_PORT,
      config.NETWORK_SERVICE_PORT,
      config.VPN_SERVICE_PORT,
      config.AUTOMATION_SERVICE_PORT
    ];

    const duplicatePorts = ports.filter((port, index) => ports.indexOf(port) !== index);
    if (duplicatePorts.length > 0) {
      errors.push(`Duplicate ports detected: ${duplicatePorts.join(', ')}`);
    }

    // Validate JWT secret strength
    if (config.JWT_SECRET.length < 32) {
      errors.push('JWT_SECRET should be at least 32 characters long');
    }

    // Validate VLAN IDs
    if (config.DEFAULT_VLAN < 1 || config.DEFAULT_VLAN > 4094) {
      errors.push('DEFAULT_VLAN must be between 1 and 4094');
    }

    if (config.MANAGEMENT_VLAN < 1 || config.MANAGEMENT_VLAN > 4094) {
      errors.push('MANAGEMENT_VLAN must be between 1 and 4094');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  // Get service-specific environment
  static getServiceConfig(serviceName: string): Partial<EnvironmentConfig> {
    const config = EnvironmentManager.config;
    
    const commonConfig = {
      NODE_ENV: config.NODE_ENV,
      APP_VERSION: config.APP_VERSION,
      DATABASE_URL: config.DATABASE_URL,
      REDIS_URL: config.REDIS_URL,
      JWT_SECRET: config.JWT_SECRET,
      LOG_LEVEL: config.LOG_LEVEL,
      LOG_DIR: config.LOG_DIR
    };

    switch (serviceName) {
      case 'api-gateway':
        return {
          ...commonConfig,
          API_GATEWAY_PORT: config.API_GATEWAY_PORT,
          FRONTEND_URL: config.FRONTEND_URL,
          RATE_LIMIT_WINDOW: config.RATE_LIMIT_WINDOW,
          RATE_LIMIT_MAX_REQUESTS: config.RATE_LIMIT_MAX_REQUESTS
        };
        
      case 'network-service':
        return {
          ...commonConfig,
          NETWORK_SERVICE_PORT: config.NETWORK_SERVICE_PORT,
          DEFAULT_VLAN: config.DEFAULT_VLAN,
          MANAGEMENT_VLAN: config.MANAGEMENT_VLAN,
          DNS_CACHE_SIZE: config.DNS_CACHE_SIZE,
          DHCP_LEASE_TIME: config.DHCP_LEASE_TIME
        };
        
      case 'vpn-service':
        return {
          ...commonConfig,
          VPN_SERVICE_PORT: config.VPN_SERVICE_PORT,
          WG_INTERFACE_PREFIX: config.WG_INTERFACE_PREFIX,
          WG_DEFAULT_PORT: config.WG_DEFAULT_PORT,
          WG_KEY_ROTATION_DAYS: config.WG_KEY_ROTATION_DAYS
        };
        
      case 'automation-service':
        return {
          ...commonConfig,
          AUTOMATION_SERVICE_PORT: config.AUTOMATION_SERVICE_PORT,
          TELEGRAM_BOT_TOKEN: config.TELEGRAM_BOT_TOKEN,
          WEBHOOK_BASE_URL: config.WEBHOOK_BASE_URL
        };
        
      default:
        return commonConfig;
    }
  }
}

export const config = EnvironmentManager.config;
export const validateEnvironment = EnvironmentManager.validate;
export const getServiceConfig = EnvironmentManager.getServiceConfig;