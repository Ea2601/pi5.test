// Centralized Environment Configuration
// Single source of truth for all environment variables

export interface EnvironmentConfig {
  // Application
  NODE_ENV: 'development' | 'production' | 'test';
  APP_VERSION: string;
  APP_NAME: string;
  
  // Database
  DATABASE_URL: string;
  POSTGRES_PASSWORD: string;
  REDIS_URL: string;
  
  // API Services
  API_GATEWAY_PORT: number;
  NETWORK_SERVICE_PORT: number;
  VPN_SERVICE_PORT: number;
  AUTOMATION_SERVICE_PORT: number;
  
  // Authentication
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
  
  // Frontend
  FRONTEND_URL: string;
  VITE_SUPABASE_URL?: string;
  VITE_SUPABASE_ANON_KEY?: string;
  VITE_API_BASE_URL?: string;
  
  // External Integrations
  TELEGRAM_BOT_TOKEN?: string;
  WEBHOOK_BASE_URL?: string;
  
  // Monitoring
  GRAFANA_PASSWORD: string;
  LOG_LEVEL: 'debug' | 'info' | 'warn' | 'error';
  LOG_DIR: string;
  
  // SSL/Security
  SSL_CERT_PATH?: string;
  SSL_KEY_PATH?: string;
  
  // Database Pool
  DB_POOL_MAX: number;
  DB_IDLE_TIMEOUT: number;
  DB_CONNECTION_TIMEOUT: number;
}

// Environment variable definitions with defaults and validation
export const ENV_DEFINITIONS = {
  // Required variables
  DATABASE_URL: {
    required: true,
    description: 'PostgreSQL connection string',
    example: 'postgresql://postgres:password@localhost:5432/pi5_supernode'
  },
  JWT_SECRET: {
    required: true,
    description: 'JWT signing secret (min 32 characters)',
    example: 'your-super-secret-jwt-key-change-this-in-production'
  },
  POSTGRES_PASSWORD: {
    required: true,
    description: 'PostgreSQL database password',
    example: 'your-secure-password'
  },
  
  // Optional with defaults
  NODE_ENV: {
    required: false,
    default: 'development',
    description: 'Application environment',
    options: ['development', 'production', 'test']
  },
  APP_VERSION: {
    required: false,
    default: '2.1.4',
    description: 'Application version'
  },
  APP_NAME: {
    required: false,
    default: 'Pi5 Supernode',
    description: 'Application display name'
  },
  
  // Service Ports
  API_GATEWAY_PORT: {
    required: false,
    default: 3000,
    description: 'API Gateway port',
    type: 'number'
  },
  NETWORK_SERVICE_PORT: {
    required: false,
    default: 3001,
    description: 'Network service port',
    type: 'number'
  },
  VPN_SERVICE_PORT: {
    required: false,
    default: 3002,
    description: 'VPN service port',
    type: 'number'
  },
  AUTOMATION_SERVICE_PORT: {
    required: false,
    default: 3003,
    description: 'Automation service port',
    type: 'number'
  },
  
  // Authentication
  JWT_EXPIRES_IN: {
    required: false,
    default: '24h',
    description: 'JWT token expiration time'
  },
  
  // Frontend
  FRONTEND_URL: {
    required: false,
    default: 'http://localhost:5173',
    description: 'Frontend application URL'
  },
  
  // Monitoring
  GRAFANA_PASSWORD: {
    required: false,
    default: 'admin',
    description: 'Grafana admin password'
  },
  LOG_LEVEL: {
    required: false,
    default: 'info',
    description: 'Application log level',
    options: ['debug', 'info', 'warn', 'error']
  },
  LOG_DIR: {
    required: false,
    default: 'logs',
    description: 'Log files directory'
  },
  
  // Database Pool
  DB_POOL_MAX: {
    required: false,
    default: 20,
    description: 'Maximum database connections',
    type: 'number'
  },
  DB_IDLE_TIMEOUT: {
    required: false,
    default: 30000,
    description: 'Database idle timeout (ms)',
    type: 'number'
  },
  DB_CONNECTION_TIMEOUT: {
    required: false,
    default: 2000,
    description: 'Database connection timeout (ms)',
    type: 'number'
  },
  
  // Redis
  REDIS_URL: {
    required: false,
    default: 'redis://localhost:6379',
    description: 'Redis connection URL'
  }
} as const;

// Environment validation and loading
export class EnvironmentManager {
  private static instance: EnvironmentManager;
  private config: EnvironmentConfig;

  private constructor() {
    this.config = this.loadAndValidateEnvironment();
  }

  public static getInstance(): EnvironmentManager {
    if (!EnvironmentManager.instance) {
      EnvironmentManager.instance = new EnvironmentManager();
    }
    return EnvironmentManager.instance;
  }

  public getConfig(): EnvironmentConfig {
    return this.config;
  }

  public get<K extends keyof EnvironmentConfig>(key: K): EnvironmentConfig[K] {
    return this.config[key];
  }

  private loadAndValidateEnvironment(): EnvironmentConfig {
    const errors: string[] = [];
    const warnings: string[] = [];
    const config: Partial<EnvironmentConfig> = {};

    // Load and validate each environment variable
    Object.entries(ENV_DEFINITIONS).forEach(([key, definition]) => {
      const envValue = process.env[key];
      
      if (definition.required && !envValue) {
        errors.push(`Required environment variable ${key} is not set`);
        return;
      }

      let value: any = envValue || definition.default;

      // Type conversion
      if (definition.type === 'number' && typeof value === 'string') {
        value = parseInt(value, 10);
        if (isNaN(value)) {
          errors.push(`Environment variable ${key} must be a valid number`);
          return;
        }
      }

      // Options validation
      if (definition.options && !definition.options.includes(value)) {
        errors.push(`Environment variable ${key} must be one of: ${definition.options.join(', ')}`);
        return;
      }

      // Set the value
      (config as any)[key] = value;

      // Warnings for defaults
      if (!envValue && definition.default) {
        warnings.push(`Using default value for ${key}: ${definition.default}`);
      }
    });

    // Throw errors if any required variables are missing
    if (errors.length > 0) {
      throw new Error(`Environment validation failed:\n${errors.join('\n')}`);
    }

    // Log warnings in development
    if (warnings.length > 0 && config.NODE_ENV === 'development') {
      console.warn('Environment warnings:', warnings);
    }

    return config as EnvironmentConfig;
  }

  // Generate .env template
  public generateEnvTemplate(): string {
    let template = `# Pi5 Supernode Environment Configuration
# Generated: ${new Date().toISOString()}
# Version: ${this.config.APP_VERSION}

`;

    Object.entries(ENV_DEFINITIONS).forEach(([key, definition]) => {
      template += `# ${definition.description}\n`;
      if (definition.example) {
        template += `# Example: ${definition.example}\n`;
      }
      if (definition.options) {
        template += `# Options: ${definition.options.join(', ')}\n`;
      }
      
      const value = definition.required ? '' : definition.default || '';
      template += `${key}=${value}\n\n`;
    });

    return template;
  }

  // Validate current environment
  public validateEnvironment(): { valid: boolean; errors: string[]; warnings: string[] } {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      this.loadAndValidateEnvironment();
      return { valid: true, errors: [], warnings: [] };
    } catch (error) {
      return { 
        valid: false, 
        errors: [error instanceof Error ? error.message : 'Validation failed'], 
        warnings: [] 
      };
    }
  }
}

// Export singleton instance
export const env = EnvironmentManager.getInstance();
export const config = env.getConfig();