import { SharedDatabaseService } from '../../shared/database';
import { createServiceLogger } from '../../shared/utils/logger';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs-extra';
import * as yaml from 'js-yaml';

const execAsync = promisify(exec);
const logger = createServiceLogger('network-config-service');

export interface DeviceConfiguration {
  id: string;
  device_name: string;
  device_role: string[];
  management_ip?: string;
  management_vlan: number;
  timezone: string;
  ntp_servers: string[];
  rf_regulatory_domain: string;
  firmware_version?: string;
  auto_firmware_update: boolean;
  logging_enabled: boolean;
  telemetry_enabled: boolean;
  ping_monitoring: boolean;
  port_statistics: boolean;
  ssid_statistics: boolean;
  alert_notifications: boolean;
  router_config: any;
  edge_router_config: any;
  bridge_config: any;
  l3_switch_config: any;
  ap_config: any;
  mesh_config: any;
  modem_config: any;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export class NetworkConfigService {
  private db: SharedDatabaseService;

  constructor() {
    this.db = SharedDatabaseService.getInstance({
      connectionString: process.env.DATABASE_URL!
    });
  }

  // Device Configuration Management
  async getDeviceConfiguration(): Promise<DeviceConfiguration | null> {
    try {
      const result = await this.db.query(`
        SELECT * FROM device_configurations 
        WHERE is_active = TRUE 
        ORDER BY updated_at DESC 
        LIMIT 1
      `);
      
      return result.rows[0] || null;
    } catch (error) {
      logger.error('Error fetching device configuration:', error);
      throw new Error('Failed to fetch device configuration');
    }
  }

  async createDeviceConfiguration(configData: Partial<DeviceConfiguration>): Promise<DeviceConfiguration> {
    try {
      const result = await this.db.query(`
        INSERT INTO device_configurations (
          device_name, device_role, management_ip, management_vlan,
          timezone, ntp_servers, rf_regulatory_domain, auto_firmware_update,
          logging_enabled, telemetry_enabled, ping_monitoring, port_statistics,
          ssid_statistics, alert_notifications, router_config, edge_router_config,
          bridge_config, l3_switch_config, ap_config, mesh_config, modem_config
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)
        RETURNING *
      `, [
        configData.device_name,
        configData.device_role,
        configData.management_ip,
        configData.management_vlan || 10,
        configData.timezone || 'Europe/Istanbul',
        configData.ntp_servers || ['pool.ntp.org'],
        configData.rf_regulatory_domain || 'TR',
        configData.auto_firmware_update || false,
        configData.logging_enabled !== undefined ? configData.logging_enabled : true,
        configData.telemetry_enabled !== undefined ? configData.telemetry_enabled : true,
        configData.ping_monitoring !== undefined ? configData.ping_monitoring : true,
        configData.port_statistics !== undefined ? configData.port_statistics : true,
        configData.ssid_statistics !== undefined ? configData.ssid_statistics : true,
        configData.alert_notifications !== undefined ? configData.alert_notifications : true,
        JSON.stringify(configData.router_config || {}),
        JSON.stringify(configData.edge_router_config || {}),
        JSON.stringify(configData.bridge_config || {}),
        JSON.stringify(configData.l3_switch_config || {}),
        JSON.stringify(configData.ap_config || {}),
        JSON.stringify(configData.mesh_config || {}),
        JSON.stringify(configData.modem_config || {})
      ]);

      const config = result.rows[0];
      logger.info(`Created device configuration: ${config.device_name}`);
      return config;
    } catch (error) {
      logger.error('Error creating device configuration:', error);
      throw new Error('Failed to create device configuration');
    }
  }

  async updateDeviceConfiguration(id: string, updates: Partial<DeviceConfiguration>): Promise<DeviceConfiguration | null> {
    try {
      const setClauses: string[] = [];
      const params: any[] = [];
      let paramIndex = 1;

      Object.entries(updates).forEach(([key, value]) => {
        if (value !== undefined && key !== 'id' && key !== 'created_at') {
          if (key.endsWith('_config')) {
            setClauses.push(`${key} = $${paramIndex}`);
            params.push(JSON.stringify(value));
          } else {
            setClauses.push(`${key} = $${paramIndex}`);
            params.push(value);
          }
          paramIndex++;
        }
      });

      if (setClauses.length === 0) {
        return await this.getDeviceConfigurationById(id);
      }

      setClauses.push(`updated_at = NOW()`);
      params.push(id);

      const result = await this.db.query(`
        UPDATE device_configurations 
        SET ${setClauses.join(', ')}
        WHERE id = $${paramIndex}
        RETURNING *
      `, params);

      const config = result.rows[0];
      if (config) {
        logger.info(`Updated device configuration: ${config.device_name}`);
      }

      return config || null;
    } catch (error) {
      logger.error('Error updating device configuration:', error);
      throw new Error('Failed to update device configuration');
    }
  }

  private async getDeviceConfigurationById(id: string): Promise<DeviceConfiguration | null> {
    const result = await this.db.query(
      'SELECT * FROM device_configurations WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  }

  // Configuration Validation
  async validateConfiguration(config: DeviceConfiguration): Promise<any> {
    try {
      const result = await this.db.query(
        'SELECT * FROM validate_device_configuration($1)',
        [JSON.stringify(config)]
      );

      const validation = result.rows[0];
      return {
        valid: validation.is_valid,
        errors: validation.errors?.map((error: string, index: number) => ({
          field: 'general',
          message: error,
          severity: 'error' as const
        })) || [],
        warnings: validation.warnings?.map((warning: string, index: number) => ({
          field: 'general',
          message: warning,
          severity: 'warning' as const
        })) || []
      };
    } catch (error) {
      logger.error('Error validating configuration:', error);
      return {
        valid: false,
        errors: [{ field: 'general', message: 'Validation failed', severity: 'error' }],
        warnings: []
      };
    }
  }

  // Configuration Application
  async applyConfiguration(config: DeviceConfiguration): Promise<{ success: boolean; errors: string[]; applied_features: string[] }> {
    try {
      logger.info('Applying device configuration to system');
      
      // Apply using database function
      const result = await this.db.query(
        'SELECT * FROM apply_device_configuration($1)',
        [config.id]
      );

      const application = result.rows[0];
      
      // In production, this would also:
      // 1. Generate system configuration files
      // 2. Update network interface configurations
      // 3. Restart relevant services
      // 4. Apply firewall rules
      // 5. Configure routing tables
      // 6. Update DNS/DHCP configurations
      
      await this.generateSystemConfigurations(config);
      
      return {
        success: application.success,
        errors: application.errors || [],
        applied_features: application.applied_features || []
      };
    } catch (error) {
      logger.error('Error applying configuration:', error);
      return {
        success: false,
        errors: [error instanceof Error ? error.message : 'Configuration application failed'],
        applied_features: []
      };
    }
  }

  private async generateSystemConfigurations(config: DeviceConfiguration): Promise<void> {
    try {
      const roles = config.device_role;
      
      // Generate configurations based on roles
      if (roles.includes('router') || roles.includes('edge_router')) {
        await this.generateRouterConfig(config);
      }
      
      if (roles.includes('ap') || roles.includes('mesh_ap')) {
        await this.generateWiFiConfig(config);
      }
      
      if (roles.includes('bridge') || roles.includes('l3_switch')) {
        await this.generateSwitchConfig(config);
      }
      
      logger.info('System configurations generated successfully');
    } catch (error) {
      logger.error('Error generating system configurations:', error);
      throw error;
    }
  }

  private async generateRouterConfig(config: DeviceConfiguration): Promise<void> {
    // Generate router-specific configurations
    const routerConfig = config.router_config;
    
    // Generate DHCP configuration if enabled
    if (routerConfig?.dhcp_server_enabled) {
      await this.generateDHCPConfig(config);
    }
    
    // Generate DNS configuration
    await this.generateDNSConfig(config);
    
    // Generate firewall rules
    await this.generateFirewallConfig(config);
  }

  private async generateWiFiConfig(config: DeviceConfiguration): Promise<void> {
    // Generate hostapd configuration
    const apConfig = config.ap_config;
    logger.info('Generating Wi-Fi configuration', { device: config.device_name });
  }

  private async generateSwitchConfig(config: DeviceConfiguration): Promise<void> {
    // Generate bridge/switch configuration
    const bridgeConfig = config.bridge_config;
    logger.info('Generating switch configuration', { device: config.device_name });
  }

  private async generateDHCPConfig(config: DeviceConfiguration): Promise<void> {
    // Generate Kea DHCP configuration
    logger.info('Generating DHCP configuration', { device: config.device_name });
  }

  private async generateDNSConfig(config: DeviceConfiguration): Promise<void> {
    // Generate DNS configuration (Pi-hole, Unbound, etc.)
    logger.info('Generating DNS configuration', { device: config.device_name });
  }

  private async generateFirewallConfig(config: DeviceConfiguration): Promise<void> {
    // Generate nftables/iptables rules
    logger.info('Generating firewall configuration', { device: config.device_name });
  }

  // WAN Profiles Management
  async getWANProfiles(): Promise<any[]> {
    try {
      const result = await this.db.query(`
        SELECT * FROM wan_profiles 
        ORDER BY is_default DESC, profile_name ASC
      `);
      
      return result.rows;
    } catch (error) {
      logger.error('Error fetching WAN profiles:', error);
      throw new Error('Failed to fetch WAN profiles');
    }
  }

  async createWANProfile(profileData: any): Promise<any> {
    try {
      const result = await this.db.query(`
        INSERT INTO wan_profiles (
          profile_name, profile_id, connection_type, description,
          pppoe_username, pppoe_password, static_ip, static_gateway, static_dns,
          wan_vlan_tag, mtu, mss_clamp, mac_clone, apn, pin, lte_bands,
          latency_ms, bandwidth_mbps, reliability_score
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
        RETURNING *
      `, [
        profileData.profile_name,
        profileData.profile_id,
        profileData.connection_type,
        profileData.description,
        profileData.pppoe_username,
        profileData.pppoe_password,
        profileData.static_ip,
        profileData.static_gateway,
        profileData.static_dns,
        profileData.wan_vlan_tag,
        profileData.mtu || 1500,
        profileData.mss_clamp || false,
        profileData.mac_clone,
        profileData.apn,
        profileData.pin,
        profileData.lte_bands,
        profileData.latency_ms || 0,
        profileData.bandwidth_mbps || 0,
        profileData.reliability_score || 1.0
      ]);

      const profile = result.rows[0];
      logger.info(`Created WAN profile: ${profile.profile_name}`);
      return profile;
    } catch (error) {
      logger.error('Error creating WAN profile:', error);
      throw new Error('Failed to create WAN profile');
    }
  }

  async updateWANProfile(id: string, updates: any): Promise<any> {
    try {
      const setClauses: string[] = [];
      const params: any[] = [];
      let paramIndex = 1;

      Object.entries(updates).forEach(([key, value]) => {
        if (value !== undefined && key !== 'id' && key !== 'created_at') {
          setClauses.push(`${key} = $${paramIndex}`);
          params.push(value);
          paramIndex++;
        }
      });

      if (setClauses.length === 0) {
        const result = await this.db.query('SELECT * FROM wan_profiles WHERE id = $1', [id]);
        return result.rows[0];
      }

      setClauses.push(`updated_at = NOW()`);
      params.push(id);

      const result = await this.db.query(`
        UPDATE wan_profiles 
        SET ${setClauses.join(', ')}
        WHERE id = $${paramIndex}
        RETURNING *
      `, params);

      return result.rows[0];
    } catch (error) {
      logger.error('Error updating WAN profile:', error);
      throw new Error('Failed to update WAN profile');
    }
  }

  async deleteWANProfile(id: string): Promise<boolean> {
    try {
      const result = await this.db.query(
        'DELETE FROM wan_profiles WHERE id = $1',
        [id]
      );

      return result.rowCount > 0;
    } catch (error) {
      logger.error('Error deleting WAN profile:', error);
      throw new Error('Failed to delete WAN profile');
    }
  }

  // VLAN Catalog Management
  async getVLANCatalog(): Promise<any[]> {
    try {
      const result = await this.db.query(`
        SELECT * FROM vlan_catalog 
        ORDER BY vlan_id ASC
      `);
      
      return result.rows;
    } catch (error) {
      logger.error('Error fetching VLAN catalog:', error);
      throw new Error('Failed to fetch VLAN catalog');
    }
  }

  async updateVLANCatalogEntry(id: string, updates: any): Promise<any> {
    try {
      const setClauses: string[] = [];
      const params: any[] = [];
      let paramIndex = 1;

      Object.entries(updates).forEach(([key, value]) => {
        if (value !== undefined && key !== 'id' && key !== 'created_at') {
          setClauses.push(`${key} = $${paramIndex}`);
          params.push(value);
          paramIndex++;
        }
      });

      if (setClauses.length === 0) {
        const result = await this.db.query('SELECT * FROM vlan_catalog WHERE id = $1', [id]);
        return result.rows[0];
      }

      setClauses.push(`updated_at = NOW()`);
      params.push(id);

      const result = await this.db.query(`
        UPDATE vlan_catalog 
        SET ${setClauses.join(', ')}
        WHERE id = $${paramIndex}
        RETURNING *
      `, params);

      return result.rows[0];
    } catch (error) {
      logger.error('Error updating VLAN catalog entry:', error);
      throw new Error('Failed to update VLAN catalog entry');
    }
  }

  // WiFi SSID Configuration
  async getWiFiSSIDConfigs(): Promise<any[]> {
    try {
      const result = await this.db.query(`
        SELECT 
          wsc.*,
          vc.vlan_name,
          vc.purpose,
          vc.security_level,
          vc.color_code
        FROM wifi_ssid_configs wsc
        LEFT JOIN vlan_catalog vc ON wsc.vlan_id = vc.vlan_id
        WHERE wsc.is_enabled = TRUE
        ORDER BY wsc.vlan_id ASC
      `);
      
      return result.rows;
    } catch (error) {
      logger.error('Error fetching WiFi SSID configs:', error);
      throw new Error('Failed to fetch WiFi SSID configurations');
    }
  }

  async createWiFiSSIDConfig(ssidData: any): Promise<any> {
    try {
      const result = await this.db.query(`
        INSERT INTO wifi_ssid_configs (
          ssid_name, vlan_id, encryption_type, passphrase,
          frequency_band, hide_ssid, client_isolation,
          captive_portal_enabled, guest_network, bandwidth_limit_mbps,
          max_clients, schedule_enabled, schedule_config
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        RETURNING *
      `, [
        ssidData.ssid_name,
        ssidData.vlan_id,
        ssidData.encryption_type || 'wpa3',
        ssidData.passphrase,
        ssidData.frequency_band || 'dual_band',
        ssidData.hide_ssid || false,
        ssidData.client_isolation || false,
        ssidData.captive_portal_enabled || false,
        ssidData.guest_network || false,
        ssidData.bandwidth_limit_mbps,
        ssidData.max_clients || 50,
        ssidData.schedule_enabled || false,
        JSON.stringify(ssidData.schedule_config || {})
      ]);

      const ssid = result.rows[0];
      logger.info(`Created WiFi SSID config: ${ssid.ssid_name}`);
      return ssid;
    } catch (error) {
      logger.error('Error creating WiFi SSID config:', error);
      throw new Error('Failed to create WiFi SSID configuration');
    }
  }

  // Security Policies
  async getSecurityPolicy(deviceRole: string): Promise<any> {
    try {
      const result = await this.db.query(`
        SELECT * FROM security_policies 
        WHERE device_role = $1 AND is_active = TRUE
      `, [deviceRole]);
      
      return result.rows[0] || null;
    } catch (error) {
      logger.error('Error fetching security policy:', error);
      throw new Error('Failed to fetch security policy');
    }
  }

  async updateSecurityPolicy(deviceRole: string, policyData: any): Promise<any> {
    try {
      const result = await this.db.query(`
        INSERT INTO security_policies (
          device_role, policy_name, description, firewall_zones,
          acl_rules, port_restrictions, ssh_access_enabled,
          web_admin_access, api_access_enabled, allowed_management_networks,
          dos_protection, intrusion_detection, rate_limiting
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        ON CONFLICT (device_role) 
        DO UPDATE SET
          policy_name = EXCLUDED.policy_name,
          description = EXCLUDED.description,
          firewall_zones = EXCLUDED.firewall_zones,
          acl_rules = EXCLUDED.acl_rules,
          port_restrictions = EXCLUDED.port_restrictions,
          ssh_access_enabled = EXCLUDED.ssh_access_enabled,
          web_admin_access = EXCLUDED.web_admin_access,
          api_access_enabled = EXCLUDED.api_access_enabled,
          allowed_management_networks = EXCLUDED.allowed_management_networks,
          dos_protection = EXCLUDED.dos_protection,
          intrusion_detection = EXCLUDED.intrusion_detection,
          rate_limiting = EXCLUDED.rate_limiting,
          updated_at = NOW()
        RETURNING *
      `, [
        deviceRole,
        policyData.policy_name || `${deviceRole} Security Policy`,
        policyData.description,
        JSON.stringify(policyData.firewall_zones || {}),
        JSON.stringify(policyData.acl_rules || []),
        JSON.stringify(policyData.port_restrictions || {}),
        policyData.ssh_access_enabled !== undefined ? policyData.ssh_access_enabled : true,
        policyData.web_admin_access !== undefined ? policyData.web_admin_access : true,
        policyData.api_access_enabled !== undefined ? policyData.api_access_enabled : true,
        policyData.allowed_management_networks || [],
        policyData.dos_protection !== undefined ? policyData.dos_protection : true,
        policyData.intrusion_detection || false,
        JSON.stringify(policyData.rate_limiting || {})
      ]);

      return result.rows[0];
    } catch (error) {
      logger.error('Error updating security policy:', error);
      throw new Error('Failed to update security policy');
    }
  }

  // Dynamic Egress Catalog
  async getEgressCatalog(): Promise<any[]> {
    try {
      const result = await this.db.query('SELECT * FROM get_egress_catalog()');
      return result.rows;
    } catch (error) {
      logger.error('Error fetching egress catalog:', error);
      throw new Error('Failed to fetch egress catalog');
    }
  }

  // Configuration Export/Import
  async exportConfiguration(format: 'json' | 'yaml' | 'bash' = 'json'): Promise<string> {
    try {
      const config = await this.getDeviceConfiguration();
      if (!config) throw new Error('No device configuration found');

      const vlanCatalog = await this.getVLANCatalog();
      const wanProfiles = await this.getWANProfiles();
      const ssidConfigs = await this.getWiFiSSIDConfigs();

      const exportData = {
        device_configuration: config,
        vlan_catalog: vlanCatalog,
        wan_profiles: wanProfiles,
        wifi_ssids: ssidConfigs,
        export_timestamp: new Date().toISOString(),
        export_version: '2.1.4'
      };

      switch (format) {
        case 'yaml':
          return yaml.dump(exportData, { indent: 2 });
        case 'bash':
          return this.generateBashScript(exportData);
        default:
          return JSON.stringify(exportData, null, 2);
      }
    } catch (error) {
      logger.error('Error exporting configuration:', error);
      throw new Error('Failed to export configuration');
    }
  }

  private generateBashScript(config: any): string {
    return `#!/bin/bash
# Pi5 Supernode Configuration Script
# Generated: ${new Date().toISOString()}

echo "Applying Pi5 Supernode configuration..."

# Device configuration
DEVICE_NAME="${config.device_configuration.device_name}"
MANAGEMENT_VLAN="${config.device_configuration.management_vlan}"
TIMEZONE="${config.device_configuration.timezone}"

echo "Setting device name: $DEVICE_NAME"
echo "Management VLAN: $MANAGEMENT_VLAN"
echo "Timezone: $TIMEZONE"

# Apply system settings
timedatectl set-timezone "$TIMEZONE"

# Configure network interfaces
# (Network interface configuration would be generated here)

echo "Configuration applied successfully!"
`;
  }

  async importConfiguration(configData: string, format: 'json' | 'yaml'): Promise<DeviceConfiguration> {
    try {
      let parsedConfig: any;
      
      switch (format) {
        case 'yaml':
          parsedConfig = yaml.load(configData);
          break;
        default:
          parsedConfig = JSON.parse(configData);
      }

      if (!parsedConfig.device_configuration) {
        throw new Error('Invalid configuration format');
      }

      const imported = await this.createDeviceConfiguration(parsedConfig.device_configuration);
      logger.info(`Imported device configuration: ${imported.device_name}`);
      return imported;
    } catch (error) {
      logger.error('Error importing configuration:', error);
      throw new Error('Failed to import configuration');
    }
  }

  // Utility Methods
  getUIConfigForRole(roles: string[]): any {
    const hasRole = (role: string) => roles.includes(role);
    
    return {
      device_role: roles,
      visible_features: {
        wan_configuration: hasRole('router') || hasRole('edge_router') || hasRole('modem'),
        dhcp_server: hasRole('router') || hasRole('edge_router') || hasRole('l3_switch'),
        nat_configuration: hasRole('router') || hasRole('edge_router'),
        port_forwarding: hasRole('router') || hasRole('edge_router'),
        multi_wan: hasRole('edge_router'),
        bgp_ospf: hasRole('edge_router') || hasRole('l3_switch'),
        dpi_features: hasRole('edge_router'),
        svi_configuration: hasRole('l3_switch'),
        acl_management: hasRole('l3_switch') || hasRole('edge_router'),
        ssid_management: hasRole('ap') || hasRole('mesh_ap') || hasRole('repeater'),
        mesh_features: hasRole('mesh_ap') || hasRole('repeater'),
        modem_configuration: hasRole('modem')
      }
    };
  }

  async discoverWANConnections(): Promise<any[]> {
    try {
      // In production, this would detect available WAN connections
      logger.info('Discovering WAN connections');
      
      const discovered = [
        {
          profile_name: 'Detected Fiber PPPoE',
          profile_id: 'wan::auto_fiber_pppoe',
          connection_type: 'pppoe',
          description: 'Otomatik tespit edilen fiber PPPoE bağlantısı',
          wan_vlan_tag: 20,
          mtu: 1492,
          mss_clamp: true
        }
      ];

      return discovered;
    } catch (error) {
      logger.error('Error discovering WAN connections:', error);
      throw new Error('Failed to discover WAN connections');
    }
  }

  async generateSampleConfiguration(roles: string[]): Promise<DeviceConfiguration> {
    try {
      const sampleConfig = {
        device_name: 'Pi5-Sample-Device',
        device_role: roles,
        management_vlan: 10,
        timezone: 'Europe/Istanbul',
        ntp_servers: ['pool.ntp.org', 'time.cloudflare.com'],
        rf_regulatory_domain: 'TR',
        logging_enabled: true,
        telemetry_enabled: true,
        ping_monitoring: true,
        port_statistics: true,
        ssid_statistics: true,
        alert_notifications: true,
        router_config: roles.includes('router') ? {
          nat_enabled: true,
          dhcp_server_enabled: true,
          dns_mode: 'pihole_unbound',
          qos_enabled: true
        } : {},
        edge_router_config: roles.includes('edge_router') ? {
          multi_wan_enabled: true,
          pbr_enabled: true,
          dpi_enabled: true
        } : {},
        ap_config: roles.includes('ap') ? {
          radio_2_4ghz_enabled: true,
          radio_5ghz_enabled: true,
          band_steering_enabled: true
        } : {}
      };

      return sampleConfig as DeviceConfiguration;
    } catch (error) {
      logger.error('Error generating sample configuration:', error);
      throw new Error('Failed to generate sample configuration');
    }
  }
}