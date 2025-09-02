// Unified Validation - Single Schema Validation System
import Joi from 'joi';
import { UnifiedLogger } from './logger';

export interface ValidationResult {
  valid: boolean;
  errors: Array<{
    field: string;
    message: string;
    code: string;
  }>;
  warnings: Array<{
    field: string;
    message: string;
    code: string;
  }>;
}

export class UnifiedValidator {
  private static logger = UnifiedLogger.getInstance('validator');

  // Common schema patterns
  static readonly patterns = {
    macAddress: /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/,
    ipv4Address: /^(\d{1,3}\.){3}\d{1,3}$/,
    ipv6Address: /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/,
    cidr: /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\/\d{1,2}$/,
    domain: /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/,
    hostname: /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?$/,
    port: /^([1-9][0-9]{0,3}|[1-5][0-9]{4}|6[0-4][0-9]{3}|65[0-4][0-9]{2}|655[0-2][0-9]|6553[0-5])$/
  };

  // Common Joi schemas
  static readonly schemas = {
    macAddress: Joi.string().pattern(UnifiedValidator.patterns.macAddress).required(),
    ipAddress: Joi.string().pattern(UnifiedValidator.patterns.ipv4Address).required(),
    cidr: Joi.string().pattern(UnifiedValidator.patterns.cidr).required(),
    domain: Joi.string().pattern(UnifiedValidator.patterns.domain).required(),
    hostname: Joi.string().pattern(UnifiedValidator.patterns.hostname).required(),
    port: Joi.number().integer().min(1).max(65535).required(),
    vlanId: Joi.number().integer().min(1).max(4094).required(),
    
    // Device schemas
    deviceName: Joi.string().min(1).max(255).required(),
    deviceType: Joi.string().valid('Mobile', 'PC', 'IoT', 'Game Console').required(),
    
    // Network schemas
    networkDevice: Joi.object({
      mac_address: UnifiedValidator.schemas.macAddress,
      ip_address: UnifiedValidator.schemas.ipAddress.optional(),
      device_name: UnifiedValidator.schemas.deviceName,
      device_type: UnifiedValidator.schemas.deviceType,
      device_brand: Joi.string().max(100).optional(),
      is_active: Joi.boolean().default(true)
    })
  };

  // Validate data against schema
  static validate<T>(data: any, schema: Joi.Schema): ValidationResult {
    const startTime = Date.now();
    
    try {
      const { error, warning, value } = schema.validate(data, {
        abortEarly: false,
        allowUnknown: false,
        stripUnknown: true
      });

      const duration = Date.now() - startTime;
      
      const result: ValidationResult = {
        valid: !error,
        errors: error ? error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message,
          code: detail.type
        })) : [],
        warnings: warning ? warning.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message,
          code: detail.type
        })) : []
      };

      UnifiedValidator.logger.debug('Validation completed', {
        valid: result.valid,
        errorCount: result.errors.length,
        warningCount: result.warnings.length,
        duration
      });

      return result;
    } catch (error) {
      UnifiedValidator.logger.error('Validation failed', {
        error: (error as Error).message,
        schema: schema.describe()
      });

      return {
        valid: false,
        errors: [{
          field: 'validation',
          message: 'Validation system error',
          code: 'VALIDATION_ERROR'
        }],
        warnings: []
      };
    }
  }

  // Validate network device
  static validateNetworkDevice(data: any): ValidationResult {
    return UnifiedValidator.validate(data, UnifiedValidator.schemas.networkDevice);
  }

  // Sanitization methods
  static sanitize = {
    macAddress: (mac: string): string => {
      return mac.replace(/[^a-fA-F0-9:]/g, '').toLowerCase();
    },
    
    ipAddress: (ip: string): string => {
      const parts = ip.split('.');
      if (parts.length !== 4) return '';
      return parts.map(part => {
        const num = parseInt(part);
        return (num >= 0 && num <= 255) ? String(num) : '0';
      }).join('.');
    },
    
    deviceName: (name: string): string => {
      return name.replace(/[<>'"]/g, '').slice(0, 255);
    }
  };
}

export const validator = UnifiedValidator;