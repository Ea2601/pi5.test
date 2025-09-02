// DNS Service API Client
import { unifiedApiClient } from './unifiedApiClient';

export class DNSService {
  async getDNSServers() {
    try {
      const response = await unifiedApiClient.get<any[]>('/api/v1/network/dns/servers');
      return response.data || [];
    } catch (error) {
      console.error('Get DNS servers error:', error);
      return [];
    }
  }

  async createDNSServer(data: any) {
    try {
      const response = await unifiedApiClient.post('/api/v1/network/dns/servers', data);
      return response.data;
    } catch (error) {
      console.error('Create DNS server error:', error);
      throw error;
    }
  }

  async updateDNSServer(id: string, updates: any) {
    try {
      const response = await unifiedApiClient.put(`/api/v1/network/dns/servers/${id}`, updates);
      return response.data;
    } catch (error) {
      console.error('Update DNS server error:', error);
      throw error;
    }
  }

  async deleteDNSServer(id: string) {
    try {
      await unifiedApiClient.delete(`/api/v1/network/dns/servers/${id}`);
      return true;
    } catch (error) {
      console.error('Delete DNS server error:', error);
      throw error;
    }
  }

  async testDNSServer(ipAddress: string) {
    try {
      const response = await unifiedApiClient.post('/api/v1/network/dns/test', { ip_address: ipAddress });
      return response.data;
    } catch (error) {
      console.error('Test DNS server error:', error);
      throw error;
    }
  }

  async getDNSProfiles() {
    try {
      const response = await unifiedApiClient.get('/api/v1/network/dns/profiles');
      return response.data || [];
    } catch (error) {
      console.error('Get DNS profiles error:', error);
      return [];
    }
  }

  async createDNSProfile(data: any) {
    try {
      const response = await unifiedApiClient.post('/api/v1/network/dns/profiles', data);
      return response.data;
    } catch (error) {
      console.error('Create DNS profile error:', error);
      throw error;
    }
  }

  async updateDNSProfile(id: string, updates: any) {
    try {
      const response = await unifiedApiClient.put(`/api/v1/network/dns/profiles/${id}`, updates);
      return response.data;
    } catch (error) {
      console.error('Update DNS profile error:', error);
      throw error;
    }
  }

  async getDNSZones() {
    try {
      const response = await unifiedApiClient.get('/api/v1/network/dns/zones');
      return response.data || [];
    } catch (error) {
      console.error('Get DNS zones error:', error);
      return [];
    }
  }

  async createDNSZone(data: any) {
    try {
      const response = await unifiedApiClient.post('/api/v1/network/dns/zones', data);
      return response.data;
    } catch (error) {
      console.error('Create DNS zone error:', error);
      throw error;
    }
  }

  async getDeviceAssignments() {
    try {
      const response = await unifiedApiClient.get('/api/v1/network/dns/device-assignments');
      return response.data || [];
    } catch (error) {
      console.error('Get device assignments error:', error);
      return [];
    }
  }

  async assignDNSToDevice(data: any) {
    try {
      const response = await unifiedApiClient.post('/api/v1/network/dns/device-assignments', data);
      return response.data;
    } catch (error) {
      console.error('Assign DNS to device error:', error);
      throw error;
    }
  }

  async getDNSQueryLogs(filters?: any) {
    try {
      const response = await unifiedApiClient.get('/api/v1/network/dns/query-logs', { params: filters });
      return response.data || [];
    } catch (error) {
      console.error('Get DNS query logs error:', error);
      return [];
    }
  }

  async getBlocklists() {
    try {
      const response = await unifiedApiClient.get('/api/v1/network/dns/blocklists');
      return response.data || [];
    } catch (error) {
      console.error('Get blocklists error:', error);
      return [];
    }
  }

  async createBlocklist(data: any) {
    try {
      const response = await unifiedApiClient.post('/api/v1/network/dns/blocklists', data);
      return response.data;
    } catch (error) {
      console.error('Create blocklist error:', error);
      throw error;
    }
  }

  async applyDNSConfiguration() {
    try {
      const response = await unifiedApiClient.post('/api/v1/network/dns/apply-config');
      return response.data;
    } catch (error) {
      console.error('Apply DNS configuration error:', error);
      throw error;
    }
  }

  async flushDNSCache() {
    try {
      const response = await unifiedApiClient.post('/api/v1/network/dns/flush-cache');
      return response.data.success;
    } catch (error) {
      console.error('Flush DNS cache error:', error);
      return false;
    }
  }

  async validateDNSConfiguration() {
    try {
      const response = await unifiedApiClient.post('/api/v1/network/dns/validate');
      return response.data;
    } catch (error) {
      console.error('Validate DNS configuration error:', error);
      throw error;
    }
  }

  async getDNSStats(timeRange: string) {
    try {
      const response = await unifiedApiClient.get<any>(`/api/v1/network/dns/stats?range=${timeRange}`);
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
      console.error('Get DNS stats error:', error);
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
}

export const dnsService = new DNSService();