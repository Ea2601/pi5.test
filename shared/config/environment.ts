// Unified Environment Configuration - Single Source of Truth

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
    // Get environment variables (browser or Node.js)
    const getEnv = (key: string, fallback?: string): string => {
      // Browser environment (Vite)
      if (typeof window !== 'undefined' && import.meta?.env) {
        return import.meta.env[`VITE_${key}`] || import.meta.env[key] || fallback || '';
      }
      // Node.js environment
      if (typeof process !== 'undefined' && process.env) {
        return process.env[key] || fallback || '';
      }
      return fallback || '';
    };

    return {
      // Application
      NODE_ENV: (getEnv('NODE_ENV') as any) || 'development',
      APP_VERSION: getEnv('APP_VERSION', '2.1.4'),
      APP_NAME: getEnv('APP_NAME', 'Pi5 Supernode'),
      
      // Database
      DATABASE_URL: getEnv('DATABASE_URL'),
      POSTGRES_PASSWORD: getEnv('POSTGRES_PASSWORD', 'postgres'),
      REDIS_URL: getEnv('REDIS_URL', 'redis://localhost:6379'),
      SUPABASE_URL: getEnv('SUPABASE_URL'),
      SUPABASE_KEY: getEnv('SUPABASE_ANON_KEY'),
      
      // API Services
      API_GATEWAY_PORT: parseInt(getEnv('API_GATEWAY_PORT', '3000')),
      NETWORK_SERVICE_PORT: parseInt(getEnv('NETWORK_SERVICE_PORT', '3001')),
      VPN_SERVICE_PORT: parseInt(getEnv('VPN_SERVICE_PORT', '3002')),
      AUTOMATION_SERVICE_PORT: parseInt(getEnv('AUTOMATION_SERVICE_PORT', '3003')),
      API_TIMEOUT: parseInt(getEnv('API_TIMEOUT', '10000')),
      
      // Authentication
      JWT_SECRET: getEnv('JWT_SECRET'),
      JWT_EXPIRES_IN: getEnv('JWT_EXPIRES_IN', '24h'),
      SESSION_SECRET: getEnv('SESSION_SECRET'),
      
      // External Services
      TELEGRAM_BOT_TOKEN: getEnv('TELEGRAM_BOT_TOKEN'),
      WEBHOOK_BASE_URL: getEnv('WEBHOOK_BASE_URL'),
      
      // Monitoring
      GRAFANA_PASSWORD: getEnv('GRAFANA_PASSWORD', 'admin'),
      LOG_LEVEL: (getEnv('LOG_LEVEL', 'info') as any),
      LOG_DIR: getEnv('LOG_DIR', './logs'),
      PROMETHEUS_PORT: parseInt(getEnv('PROMETHEUS_PORT', '9090')),
      
      // Frontend
      FRONTEND_URL: getEnv('FRONTEND_URL', 'http://localhost:5173'),
      
      // SSL/Security
      SSL_CERT_PATH: getEnv('SSL_CERT_PATH'),
      SSL_KEY_PATH: getEnv('SSL_KEY_PATH'),
      ENABLE_HTTPS: getEnv('ENABLE_HTTPS') === 'true',
      
      // Performance
      CACHE_TTL: parseInt(getEnv('CACHE_TTL', '300')),
      MAX_CONNECTIONS: parseInt(getEnv('MAX_CONNECTIONS', '100')),
      RATE_LIMIT_WINDOW: parseInt(getEnv('RATE_LIMIT_WINDOW', '900000')), // 15 minutes
      RATE_LIMIT_MAX_REQUESTS: parseInt(getEnv('RATE_LIMIT_MAX_REQUESTS', '100')),
      
      // WireGuard
      WG_INTERFACE_PREFIX: getEnv('WG_INTERFACE_PREFIX', 'wg'),
      WG_DEFAULT_PORT: parseInt(getEnv('WG_DEFAULT_PORT', '51820')),
      WG_KEY_ROTATION_DAYS: parseInt(getEnv('WG_KEY_ROTATION_DAYS', '90')),
      
      // Network
      DEFAULT_VLAN: parseInt(getEnv('DEFAULT_VLAN', '20')),
      MANAGEMENT_VLAN: parseInt(getEnv('MANAGEMENT_VLAN', '10')),
      DNS_CACHE_SIZE: parseInt(getEnv('DNS_CACHE_SIZE', '100')),
      DHCP_LEASE_TIME: getEnv('DHCP_LEASE_TIME', '24 hours'),
      
      // Backup
      BACKUP_ENABLED: getEnv('BACKUP_ENABLED') === 'true',
      BACKUP_SCHEDULE: getEnv('BACKUP_SCHEDULE', '0 2 * * *'), // Daily at 2 AM
      BACKUP_RETENTION_DAYS: parseInt(getEnv('BACKUP_RETENTION_DAYS', '30'))
    };
  }

  // Environment validation
  static validate(): { valid: boolean; errors: string[] } {
    // Skip validation in browser environment
    if (typeof window !== 'undefined') {
      return { valid: true, errors: [] };
    }

    try {
      const errors: string[] = [];
      const config = EnvironmentManager.config;

      // Validate database URL format
      if (config.DATABASE_URL && !config.DATABASE_URL.startsWith('postgresql://')) {
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
      if (config.JWT_SECRET && config.JWT_SECRET.length < 32) {
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
    } catch (error) {
      return { valid: false, errors: ['Environment validation failed'] };
    }
  }

  // Get service-specific environment
  static getServiceConfig(serviceName: string): Partial<EnvironmentConfig> {
    // Skip service config in browser environment
    if (typeof window !== 'undefined') {
      return {};
    }

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