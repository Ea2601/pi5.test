// WiFi Service API Client  
import { unifiedApiClient } from './unifiedApiClient';

export class WiFiService {
  async getAccessPoints() {
    try {
      const response = await unifiedApiClient.get('/api/v1/network/wifi/access-points');
      return response.data || [];
    } catch (error) {
      console.error('Get access points error:', error);
      return [];
    }
  }

  async createAccessPoint(data: any) {
    try {
      const response = await unifiedApiClient.post('/api/v1/network/wifi/access-points', data);
      return response.data;
    } catch (error) {
      console.error('Create access point error:', error);
      throw error;
    }
  }

  async updateAccessPoint(id: string, updates: any) {
    try {
      const response = await unifiedApiClient.put(`/api/v1/network/wifi/access-points/${id}`, updates);
      return response.data;
    } catch (error) {
      console.error('Update access point error:', error);
      throw error;
    }
  }

  async deleteAccessPoint(id: string) {
    try {
      await unifiedApiClient.delete(`/api/v1/network/wifi/access-points/${id}`);
      return true;
    } catch (error) {
      console.error('Delete access point error:', error);
      throw error;
    }
  }

  async getWiFiNetworks(apId?: string) {
    try {
      const url = apId ? `/api/v1/network/wifi/networks?ap_id=${apId}` : '/api/v1/network/wifi/networks';
      const response = await unifiedApiClient.get(url);
      return response.data || [];
    } catch (error) {
      console.error('Get WiFi networks error:', error);
      return [];
    }
  }

  async createWiFiNetwork(data: any) {
    try {
      const response = await unifiedApiClient.post('/api/v1/network/wifi/networks', data);
      return response.data;
    } catch (error) {
      console.error('Create WiFi network error:', error);
      throw error;
    }
  }

  async updateWiFiNetwork(id: string, updates: any) {
    try {
      const response = await unifiedApiClient.put(`/api/v1/network/wifi/networks/${id}`, updates);
      return response.data;
    } catch (error) {
      console.error('Update WiFi network error:', error);
      throw error;
    }
  }

  async deleteWiFiNetwork(id: string) {
    try {
      await unifiedApiClient.delete(`/api/v1/network/wifi/networks/${id}`);
      return true;
    } catch (error) {
      console.error('Delete WiFi network error:', error);
      throw error;
    }
  }

  async toggleWiFiNetwork(id: string) {
    try {
      const response = await unifiedApiClient.post(`/api/v1/network/wifi/networks/${id}/toggle`);
      return response.data;
    } catch (error) {
      console.error('Toggle WiFi network error:', error);
      throw error;
    }
  }

  async getWiFiClients(filters?: any) {
    try {
      const response = await unifiedApiClient.get('/api/v1/network/wifi/clients', { params: filters });
      return response.data || [];
    } catch (error) {
      console.error('Get WiFi clients error:', error);
      return [];
    }
  }

  async disconnectClient(id: string) {
    try {
      const response = await unifiedApiClient.post(`/api/v1/network/wifi/clients/${id}/disconnect`);
      return response.data;
    } catch (error) {
      console.error('Disconnect client error:', error);
      throw error;
    }
  }

  async blockClient(macAddress: string) {
    try {
      const response = await unifiedApiClient.post('/api/v1/network/wifi/clients/block', { mac_address: macAddress });
      return response.data;
    } catch (error) {
      console.error('Block client error:', error);
      throw error;
    }
  }

  async unblockClient(macAddress: string) {
    try {
      const response = await unifiedApiClient.post('/api/v1/network/wifi/clients/unblock', { mac_address: macAddress });
      return response.data;
    } catch (error) {
      console.error('Unblock client error:', error);
      throw error;
    }
  }

  async getSecurityPolicies() {
    try {
      const response = await unifiedApiClient.get('/api/v1/network/wifi/security-policies');
      return response.data || [];
    } catch (error) {
      console.error('Get security policies error:', error);
      return [];
    }
  }

  async createSecurityPolicy(data: any) {
    try {
      const response = await unifiedApiClient.post('/api/v1/network/wifi/security-policies', data);
      return response.data;
    } catch (error) {
      console.error('Create security policy error:', error);
      throw error;
    }
  }

  async updateSecurityPolicy(id: string, updates: any) {
    try {
      const response = await unifiedApiClient.put(`/api/v1/network/wifi/security-policies/${id}`, updates);
      return response.data;
    } catch (error) {
      console.error('Update security policy error:', error);
      throw error;
    }
  }

  async getPerformanceLogs(filters?: any) {
    try {
      const response = await unifiedApiClient.get('/api/v1/network/wifi/performance-logs', { params: filters });
      return response.data || [];
    } catch (error) {
      console.error('Get performance logs error:', error);
      return [];
    }
  }

  async analyzeChannels(apId: string) {
    try {
      const response = await unifiedApiClient.post(`/api/v1/network/wifi/access-points/${apId}/analyze-channels`);
      return response.data;
    } catch (error) {
      console.error('Analyze channels error:', error);
      throw error;
    }
  }

  async optimizeChannels(apId: string) {
    try {
      const response = await unifiedApiClient.post(`/api/v1/network/wifi/access-points/${apId}/optimize-channels`);
      return response.data;
    } catch (error) {
      console.error('Optimize channels error:', error);
      throw error;
    }
  }

  async getMeshNodes() {
    try {
      const response = await unifiedApiClient.get('/api/v1/network/wifi/mesh-nodes');
      return response.data || [];
    } catch (error) {
      console.error('Get mesh nodes error:', error);
      return [];
    }
  }

  async getWiFiSchedules(networkId?: string) {
    try {
      const url = networkId ? `/api/v1/network/wifi/schedules?network_id=${networkId}` : '/api/v1/network/wifi/schedules';
      const response = await unifiedApiClient.get(url);
      return response.data || [];
    } catch (error) {
      console.error('Get WiFi schedules error:', error);
      return [];
    }
  }

  async createWiFiSchedule(data: any) {
    try {
      const response = await unifiedApiClient.post('/api/v1/network/wifi/schedules', data);
      return response.data;
    } catch (error) {
      console.error('Create WiFi schedule error:', error);
      throw error;
    }
  }

  async getWiFiStats() {
    try {
      const response = await unifiedApiClient.get('/api/v1/network/wifi/stats');
      return response.data || {
        total_access_points: 0,
        online_access_points: 0,
        total_networks: 0,
        active_networks: 0,
        total_clients: 0,
        connected_clients: 0,
        total_bandwidth_mbps: 0,
        average_signal_strength: -70,
        channel_utilization: [],
        client_distribution: []
      };
    } catch (error) {
      console.error('Get WiFi stats error:', error);
      return {
        total_access_points: 0,
        online_access_points: 0,
        total_networks: 0,
        active_networks: 0,
        total_clients: 0,
        connected_clients: 0,
        total_bandwidth_mbps: 0,
        average_signal_strength: -70,
        channel_utilization: [],
        client_distribution: []
      };
    }
  }

  async scanForRogueAPs() {
    try {
      const response = await unifiedApiClient.post('/api/v1/network/wifi/scan-rogue-aps');
      return response.data || [];
    } catch (error) {
      console.error('Scan rogue APs error:', error);
      return [];
    }
  }

  async applyWiFiConfiguration() {
    try {
      const response = await unifiedApiClient.post('/api/v1/network/wifi/apply-config');
      return response.data;
    } catch (error) {
      console.error('Apply WiFi configuration error:', error);
      throw error;
    }
  }

  async restartWiFiService(apId?: string) {
    try {
      const url = apId ? `/api/v1/network/wifi/restart?ap_id=${apId}` : '/api/v1/network/wifi/restart';
      const response = await unifiedApiClient.post(url);
      return response.data;
    } catch (error) {
      console.error('Restart WiFi service error:', error);
      throw error;
    }
  }

  async createGuestNetwork(apId: string, config: any) {
    try {
      const response = await unifiedApiClient.post(`/api/v1/network/wifi/access-points/${apId}/guest-network`, config);
      return response.data;
    } catch (error) {
      console.error('Create guest network error:', error);
      throw error;
    }
  }

  async getClientSignalStrengths() {
    try {
      const response = await unifiedApiClient.get('/api/v1/network/wifi/client-signals');
      return response.data || [];
    } catch (error) {
      console.error('Get client signals error:', error);
      return [];
    }
  }

  async performWiFiHealthCheck() {
    try {
      const response = await unifiedApiClient.get('/api/v1/network/wifi/health');
      return response.data || {
        overall_health: 'healthy',
        issues: [],
        recommendations: []
      };
    } catch (error) {
      console.error('WiFi health check error:', error);
      return {
        overall_health: 'healthy',
        issues: [],
        recommendations: []
      };
    }
  }

  async setClientBandwidthLimit(clientId: string, limitMbps: number) {
    try {
      const response = await unifiedApiClient.post(`/api/v1/network/wifi/clients/${clientId}/bandwidth`, {
        limit_mbps: limitMbps
      });
      return response.data;
    } catch (error) {
      console.error('Set client bandwidth error:', error);
      throw error;
    }
  }

  async setNetworkBandwidthLimit(networkId: string, limitMbps: number) {
    try {
      const response = await unifiedApiClient.post(`/api/v1/network/wifi/networks/${networkId}/bandwidth`, {
        limit_mbps: limitMbps
      });
      return response.data;
    } catch (error) {
      console.error('Set network bandwidth error:', error);
      throw error;
    }
  }
}

export const wifiService = new WiFiService();