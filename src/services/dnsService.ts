import { apiClient } from './apiClient';
import { 
  DNSServer, 
  DNSProfile, 
  DNSZoneConfig, 
  DNSDeviceAssignment, 
  DNSQueryLog, 
  DNSBlocklist, 
  DNSCacheSettings,
  DNSStats
} from '../types/dns';

class DNSService {
  // DNS Servers Management
  async getDNSServers(): Promise<DNSServer[]> {
    try {
      const response = await apiClient.request({
        method: 'GET',
        url: '/api/v1/network/dns/servers'
      });
      return response.data || [];
    } catch (error) {
      console.error('Error fetching DNS servers:', error);
      return [];
    }
  }

  async createDNSServer(server: Partial<DNSServer>): Promise<DNSServer> {
    const response = await apiClient.request({
      method: 'POST',
      url: '/api/v1/network/dns/servers',
      data: server
    });
    return response.data;
  }

  async updateDNSServer(id: string, updates: Partial<DNSServer>): Promise<DNSServer> {
    const response = await apiClient.request({
      method: 'PUT',
      url: `/api/v1/network/dns/servers/${id}`,
      data: updates
    });
    return response.data;
  }

  async deleteDNSServer(id: string): Promise<boolean> {
    await apiClient.request({
      method: 'DELETE',
      url: `/api/v1/network/dns/servers/${id}`
    });
    return true;
  }

  async testDNSServer(ipAddress: string): Promise<{ success: boolean; response_time: number; error?: string }> {
    try {
      const response = await apiClient.request({
        method: 'POST',
        url: '/api/v1/network/dns/test-server',
        data: { ip_address: ipAddress }
      });
      return response.data;
    } catch (error) {
      return { 
        success: false, 
        response_time: 0,
        error: error instanceof Error ? error.message : 'DNS test failed' 
      };
    }
  }

  // DNS Profiles Management
  async getDNSProfiles(): Promise<DNSProfile[]> {
    try {
      const response = await apiClient.request({
        method: 'GET',
        url: '/api/v1/network/dns/profiles'
      });
      return response.data || [];
    } catch (error) {
      console.error('Error fetching DNS profiles:', error);
      return [];
    }
  }

  async createDNSProfile(profile: Partial<DNSProfile>): Promise<DNSProfile> {
    const response = await apiClient.request({
      method: 'POST',
      url: '/api/v1/network/dns/profiles',
      data: profile
    });
    return response.data;
  }

  async updateDNSProfile(id: string, updates: Partial<DNSProfile>): Promise<DNSProfile> {
    const response = await apiClient.request({
      method: 'PUT',
      url: `/api/v1/network/dns/profiles/${id}`,
      data: updates
    });
    return response.data;
  }

  // Zone Management
  async getDNSZones(): Promise<DNSZoneConfig[]> {
    try {
      const response = await apiClient.request({
        method: 'GET',
        url: '/api/v1/network/dns/zones'
      });
      return response.data || [];
    } catch (error) {
      console.error('Error fetching DNS zones:', error);
      return [];
    }
  }

  async createDNSZone(zone: Partial<DNSZoneConfig>): Promise<DNSZoneConfig> {
    const response = await apiClient.request({
      method: 'POST',
      url: '/api/v1/network/dns/zones',
      data: zone
    });
    return response.data;
  }

  // Device Assignments
  async getDeviceAssignments(): Promise<DNSDeviceAssignment[]> {
    try {
      const response = await apiClient.request({
        method: 'GET',
        url: '/api/v1/network/dns/device-assignments'
      });
      return response.data || [];
    } catch (error) {
      console.error('Error fetching device assignments:', error);
      return [];
    }
  }

  async assignDNSToDevice(assignment: Partial<DNSDeviceAssignment>): Promise<DNSDeviceAssignment> {
    const response = await apiClient.request({
      method: 'POST',
      url: '/api/v1/network/dns/device-assignments',
      data: assignment
    });
    return response.data;
  }

  // Query Logs
  async getDNSQueryLogs(filters?: {
    device_mac?: string;
    domain?: string;
    blocked_only?: boolean;
    start_date?: string;
    end_date?: string;
    limit?: number;
  }): Promise<DNSQueryLog[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.device_mac) params.append('device_mac', filters.device_mac);
      if (filters?.domain) params.append('domain', filters.domain);
      if (filters?.blocked_only) params.append('blocked_only', 'true');
      if (filters?.start_date) params.append('start_date', filters.start_date);
      if (filters?.end_date) params.append('end_date', filters.end_date);
      if (filters?.limit) params.append('limit', filters.limit.toString());

      const response = await apiClient.request({
        method: 'GET',
        url: `/api/v1/network/dns/query-logs?${params.toString()}`
      });
      return response.data || [];
    } catch (error) {
      console.error('Error fetching DNS query logs:', error);
      return [];
    }
  }

  // Blocklist Management
  async getBlocklists(): Promise<DNSBlocklist[]> {
    try {
      const response = await apiClient.request({
        method: 'GET',
        url: '/api/v1/network/dns/blocklists'
      });
      return response.data || [];
    } catch (error) {
      console.error('Error fetching blocklists:', error);
      return [];
    }
  }

  async createBlocklist(blocklist: Partial<DNSBlocklist>): Promise<DNSBlocklist> {
    const response = await apiClient.request({
      method: 'POST',
      url: '/api/v1/network/dns/blocklists',
      data: blocklist
    });
    return response.data;
  }

  async updateBlocklist(id: string, updates: Partial<DNSBlocklist>): Promise<DNSBlocklist> {
    const response = await apiClient.request({
      method: 'PUT',
      url: `/api/v1/network/dns/blocklists/${id}`,
      data: updates
    });
    return response.data;
  }

  // Cache Settings
  async getCacheSettings(): Promise<DNSCacheSettings[]> {
    try {
      const response = await apiClient.request({
        method: 'GET',
        url: '/api/v1/network/dns/cache-settings'
      });
      return response.data || [];
    } catch (error) {
      console.error('Error fetching cache settings:', error);
      return [];
    }
  }

  async updateCacheSettings(id: string, settings: Partial<DNSCacheSettings>): Promise<DNSCacheSettings> {
    const response = await apiClient.request({
      method: 'PUT',
      url: `/api/v1/network/dns/cache-settings/${id}`,
      data: settings
    });
    return response.data;
  }

  // Analytics and Statistics
  async getDNSStats(timeRange: '1h' | '24h' | '7d' | '30d' = '24h'): Promise<DNSStats> {
    try {
      const response = await apiClient.request({
        method: 'GET',
        url: `/api/v1/network/dns/stats?range=${timeRange}`
      });
      return response.data || {
        total_queries: 0,
        blocked_queries: 0,
        cache_hit_ratio: 0,
        average_response_time: 0,
        top_domains: [],
        top_blocked_domains: [],
        queries_by_type: {},
        queries_by_device: {}
      };
    } catch (error) {
      console.error('Error fetching DNS stats:', error);
      return {
        total_queries: 0,
        blocked_queries: 0,
        cache_hit_ratio: 0,
        average_response_time: 0,
        top_domains: [],
        top_blocked_domains: [],
        queries_by_type: {},
        queries_by_device: {}
      };
    }
  }

  // System Integration
  async applyDNSConfiguration(): Promise<{ success: boolean; errors: string[] }> {
    try {
      const response = await apiClient.request({
        method: 'POST',
        url: '/api/v1/network/dns/apply-configuration'
      });
      return response.data;
    } catch (error) {
      return { 
        success: false, 
        errors: [error instanceof Error ? error.message : 'Configuration failed'] 
      };
    }
  }

  async flushDNSCache(): Promise<boolean> {
    try {
      const response = await apiClient.request({
        method: 'POST',
        url: '/api/v1/network/dns/flush-cache'
      });
      return response.data.success || false;
    } catch (error) {
      console.error('Error flushing DNS cache:', error);
      return false;
    }
  }

  async validateDNSConfiguration(): Promise<{ valid: boolean; issues: string[] }> {
    try {
      const response = await apiClient.request({
        method: 'POST',
        url: '/api/v1/network/dns/validate-configuration'
      });
      return response.data;
    } catch (error) {
      return { 
        valid: false, 
        issues: [error instanceof Error ? error.message : 'Validation failed'] 
      };
    }
  }
}

export const dnsService = new DNSService();