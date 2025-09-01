import { supabase } from './supabase';
import { apiClient } from './apiClient';
import { 
  DeviceConfiguration, 
  WAN Profile, 
  VLANCatalogEntry, 
  DeviceRole,
  NetworkSettingsUIConfig,
  ConfigurationValidation
} from '../types/networkConfig';

class NetworkConfigService {
  // Device Configuration Management
  async getDeviceConfiguration(): Promise<DeviceConfiguration | null> {
    try {
      const { data, error } = await supabase
        .from('device_configurations')
        .select('*')
        .eq('is_active', true)
        .single();

      if (error && error.code !== 'PGRST116') { // Not found is OK
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error fetching device configuration:', error);
      return null;
    }
  }

  async updateDeviceConfiguration(config: Partial<DeviceConfiguration>): Promise<DeviceConfiguration> {
    try {
      const { data, error } = await supabase
        .from('device_configurations')
        .upsert([{
          ...config,
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating device configuration:', error);
      throw error;
    }
  }

  async createDeviceConfiguration(config: Partial<DeviceConfiguration>): Promise<DeviceConfiguration> {
    try {
      const { data, error } = await supabase
        .from('device_configurations')
        .insert([{
          ...config,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating device configuration:', error);
      throw error;
    }
  }

  // WAN Profiles Management
  async getWANProfiles(): Promise<WAN Profile[]> {
    try {
      const { data, error } = await supabase
        .from('wan_profiles')
        .select('*')
        .order('is_default', { ascending: false })
        .order('profile_name');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching WAN profiles:', error);
      return [];
    }
  }

  async createWANProfile(profile: Partial<WAN Profile>): Promise<WAN Profile> {
    try {
      const { data, error } = await supabase
        .from('wan_profiles')
        .insert([profile])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating WAN profile:', error);
      throw error;
    }
  }

  async updateWANProfile(id: string, updates: Partial<WAN Profile>): Promise<WAN Profile> {
    try {
      const { data, error } = await supabase
        .from('wan_profiles')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating WAN profile:', error);
      throw error;
    }
  }

  async deleteWANProfile(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('wan_profiles')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting WAN profile:', error);
      return false;
    }
  }

  // VLAN Catalog Management
  async getVLANCatalog(): Promise<VLANCatalogEntry[]> {
    try {
      const { data, error } = await supabase
        .from('vlan_catalog')
        .select('*')
        .order('vlan_id');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching VLAN catalog:', error);
      return [];
    }
  }

  async updateVLANCatalogEntry(id: string, updates: Partial<VLANCatalogEntry>): Promise<VLANCatalogEntry> {
    try {
      const { data, error } = await supabase
        .from('vlan_catalog')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating VLAN catalog entry:', error);
      throw error;
    }
  }

  // Wi-Fi SSID Configuration
  async getWiFiSSIDConfigs(): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('wifi_ssid_configs')
        .select(`
          *,
          vlan_catalog(vlan_name, purpose, security_level)
        `)
        .order('vlan_id');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching Wi-Fi SSID configs:', error);
      return [];
    }
  }

  async createWiFiSSIDConfig(config: any): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('wifi_ssid_configs')
        .insert([config])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating Wi-Fi SSID config:', error);
      throw error;
    }
  }

  // Security Policies
  async getSecurityPolicy(deviceRole: string): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('security_policies')
        .select('*')
        .eq('device_role', deviceRole)
        .eq('is_active', true)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error fetching security policy:', error);
      return null;
    }
  }

  async updateSecurityPolicy(deviceRole: string, policy: any): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('security_policies')
        .upsert([{
          device_role: deviceRole,
          ...policy,
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating security policy:', error);
      throw error;
    }
  }

  // UI Configuration
  getUIConfigForRole(roles: DeviceRole[]): NetworkSettingsUIConfig {
    const hasRole = (role: DeviceRole) => roles.includes(role);
    
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
      },
      available_egress_points: [],
      vlan_catalog: []
    };
  }

  // Configuration Validation
  async validateConfiguration(config: DeviceConfiguration): Promise<ConfigurationValidation> {
    try {
      const response = await apiClient.request({
        method: 'POST',
        url: '/api/v1/network/config/validate',
        data: config
      });
      
      return response.data;
    } catch (error) {
      console.error('Error validating configuration:', error);
      return {
        valid: false,
        errors: [{ field: 'general', message: 'Validation failed', severity: 'error' }],
        warnings: []
      };
    }
  }

  // Configuration Application
  async applyConfiguration(config: DeviceConfiguration): Promise<{ success: boolean; errors: string[] }> {
    try {
      const response = await apiClient.request({
        method: 'POST',
        url: '/api/v1/network/config/apply',
        data: config
      });
      
      return response.data;
    } catch (error) {
      console.error('Error applying configuration:', error);
      return {
        success: false,
        errors: [error instanceof Error ? error.message : 'Configuration failed']
      };
    }
  }

  // Generate Configuration Export
  async exportConfiguration(format: 'json' | 'yaml' | 'bash'): Promise<string> {
    try {
      const response = await apiClient.request({
        method: 'GET',
        url: `/api/v1/network/config/export?format=${format}`
      });
      
      return response.data.config;
    } catch (error) {
      console.error('Error exporting configuration:', error);
      throw error;
    }
  }

  // Import Configuration
  async importConfiguration(configData: string, format: 'json' | 'yaml'): Promise<DeviceConfiguration> {
    try {
      const response = await apiClient.request({
        method: 'POST',
        url: '/api/v1/network/config/import',
        data: { config: configData, format }
      });
      
      return response.data;
    } catch (error) {
      console.error('Error importing configuration:', error);
      throw error;
    }
  }

  // Generate Egress Point Catalog
  async generateEgressCatalog(): Promise<EgressPoint[]> {
    try {
      const response = await apiClient.request({
        method: 'GET',
        url: '/api/v1/network/config/egress-catalog'
      });
      
      return response.data || [];
    } catch (error) {
      console.error('Error generating egress catalog:', error);
      return [];
    }
  }

  // Discover Available WireGuard Connections
  async discoverWireGuardConnections(): Promise<any[]> {
    try {
      const response = await apiClient.request({
        method: 'GET',
        url: '/api/v1/vpn/servers?for_egress=true'
      });
      
      return response.data || [];
    } catch (error) {
      console.error('Error discovering WireGuard connections:', error);
      return [];
    }
  }
}

export const networkConfigService = new NetworkConfigService();