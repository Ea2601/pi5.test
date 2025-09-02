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
    }),

    // DHCP schemas
    dhcpPool: Joi.object({
      name: Joi.string().min(1).max(100).required(),
      vlan_id: UnifiedValidator.schemas.vlanId,
      network_cidr: UnifiedValidator.schemas.cidr,
      start_ip: UnifiedValidator.schemas.ipAddress,
      end_ip: UnifiedValidator.schemas.ipAddress,
      gateway_ip: UnifiedValidator.schemas.ipAddress,
      dns_servers: Joi.array().items(UnifiedValidator.schemas.ipAddress).min(1).required(),
      lease_time: Joi.string().pattern(/^\d+\s+(hours?|days?)$/).required(),
      is_active: Joi.boolean().default(true)
    }),

    dhcpReservation: Joi.object({
      mac_address: UnifiedValidator.schemas.macAddress,
      ip_address: UnifiedValidator.schemas.ipAddress,
      hostname: UnifiedValidator.schemas.hostname.optional(),
      is_active: Joi.boolean().default(true)
    }),

    // DNS schemas
    dnsServer: Joi.object({
      name: Joi.string().min(1).max(100).required(),
      ip_address: UnifiedValidator.schemas.ipAddress,
      port: UnifiedValidator.schemas.port.default(53),
      type: Joi.string().valid('standard', 'doh', 'dot', 'dnssec').default('standard'),
      is_active: Joi.boolean().default(true)
    }),

    // Wi-Fi schemas
    wifiNetwork: Joi.object({
      ssid: Joi.string().min(1).max(32).required(),
      vlan_id: UnifiedValidator.schemas.vlanId.optional(),
      encryption_type: Joi.string().valid('open', 'wpa2', 'wpa3', 'wpa2_enterprise', 'wpa3_enterprise').default('wpa3'),
      passphrase: Joi.string().min(8).max(63).when('encryption_type', {
        is: 'open',
        then: Joi.optional(),
        otherwise: Joi.required()
      }),
      frequency_band: Joi.string().valid('2.4ghz', '5ghz', '6ghz').required(),
      max_clients: Joi.number().integer().min(1).max(200).default(50),
      is_enabled: Joi.boolean().default(true)
    }),

    // VPN schemas
    wireGuardServer: Joi.object({
      name: Joi.string().min(1).max(100).required(),
      interface_name: Joi.string().pattern(/^wg\d+$/).required(),
      listen_port: UnifiedValidator.schemas.port,
      network_cidr: UnifiedValidator.schemas.cidr,
      endpoint: Joi.string().pattern(/^.+:\d+$/).optional(),
      max_clients: Joi.number().integer().min(1).max(1000).default(100),
      dns_servers: Joi.array().items(UnifiedValidator.schemas.ipAddress).min(1).required()
    }),

    wireGuardClient: Joi.object({
      name: Joi.string().min(1).max(100).required(),
      server_id: Joi.string().uuid().required(),
      allowed_ips: Joi.string().default('0.0.0.0/0'),
      persistent_keepalive: Joi.number().integer().min(0).max(3600).default(25),
      is_enabled: Joi.boolean().default(true)
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

  // Validate DHCP pool
  static validateDHCPPool(data: any): ValidationResult {
    const result = UnifiedValidator.validate(data, UnifiedValidator.schemas.dhcpPool);
    
    // Additional business logic validation
    if (result.valid && data.start_ip && data.end_ip) {
      const startNum = UnifiedValidator.ipToNumber(data.start_ip);
      const endNum = UnifiedValidator.ipToNumber(data.end_ip);
      
      if (startNum >= endNum) {
        result.valid = false;
        result.errors.push({
          field: 'ip_range',
          message: 'Start IP must be less than end IP',
          code: 'INVALID_IP_RANGE'
        });
      }
    }

    return result;
  }

  // Validate Wi-Fi network
  static validateWiFiNetwork(data: any): ValidationResult {
    const result = UnifiedValidator.validate(data, UnifiedValidator.schemas.wifiNetwork);
    
    // Additional Wi-Fi specific validation
    if (result.valid) {
      // Check SSID uniqueness would be done at service level
      if (data.channel && data.frequency_band === '2.4ghz' && (data.channel < 1 || data.channel > 13)) {
        result.warnings.push({
          field: 'channel',
          message: 'Channel not optimal for 2.4GHz band',
          code: 'SUBOPTIMAL_CHANNEL'
        });
      }
    }

    return result;
  }

  // Validate WireGuard configuration
  static validateWireGuardServer(data: any): ValidationResult {
    return UnifiedValidator.validate(data, UnifiedValidator.schemas.wireGuardServer);
  }

  static validateWireGuardClient(data: any): ValidationResult {
    return UnifiedValidator.validate(data, UnifiedValidator.schemas.wireGuardClient);
  }

  // Utility methods
  private static ipToNumber(ip: string): number {
    return ip.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet), 0) >>> 0;
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
    },
    
    ssid: (ssid: string): string => {
      return ssid.replace(/[^\x20-\x7E]/g, '').slice(0, 32);
    }
  };
}

export const validator = UnifiedValidator;