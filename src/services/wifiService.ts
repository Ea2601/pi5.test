import { apiClient } from './apiClient';
import { 
  WiFiAccessPoint, 
  WiFiNetwork, 
  WiFiClient, 
  WiFiSecurityPolicy, 
  WiFiPerformanceLog,
  WiFiMeshNode,
  WiFiSchedule,
  WiFiChannelAnalysis,
  WiFiStats
} from '../types/wifi';

class WiFiService {
  // Access Point Management
  async getAccessPoints(): Promise<WiFiAccessPoint[]> {
    try {
      const response = await apiClient.request({
        method: 'GET',
        url: '/api/v1/network/wifi/access-points'
      });
      return response.data || [];
    } catch (error) {
      console.error('Error fetching WiFi access points:', error);
      return [];
    }
  }

  async createAccessPoint(ap: Partial<WiFiAccessPoint>): Promise<WiFiAccessPoint> {
    const response = await apiClient.request({
      method: 'POST',
      url: '/api/v1/network/wifi/access-points',
      data: ap
    });
    return response.data;
  }

  async updateAccessPoint(id: string, updates: Partial<WiFiAccessPoint>): Promise<WiFiAccessPoint> {
    const response = await apiClient.request({
      method: 'PUT',
      url: `/api/v1/network/wifi/access-points/${id}`,
      data: updates
    });
    return response.data;
  }

  async deleteAccessPoint(id: string): Promise<boolean> {
    await apiClient.request({
      method: 'DELETE',
      url: `/api/v1/network/wifi/access-points/${id}`
    });
    return true;
  }

  // Wi-Fi Network (SSID) Management
  async getWiFiNetworks(apId?: string): Promise<WiFiNetwork[]> {
    try {
      const params = apId ? `?ap_id=${apId}` : '';
      const response = await apiClient.request({
        method: 'GET',
        url: `/api/v1/network/wifi/networks${params}`
      });
      return response.data || [];
    } catch (error) {
      console.error('Error fetching WiFi networks:', error);
      return [];
    }
  }

  async createWiFiNetwork(network: Partial<WiFiNetwork>): Promise<WiFiNetwork> {
    const response = await apiClient.request({
      method: 'POST',
      url: '/api/v1/network/wifi/networks',
      data: network
    });
    return response.data;
  }

  async updateWiFiNetwork(id: string, updates: Partial<WiFiNetwork>): Promise<WiFiNetwork> {
    const response = await apiClient.request({
      method: 'PUT',
      url: `/api/v1/network/wifi/networks/${id}`,
      data: updates
    });
    return response.data;
  }

  async deleteWiFiNetwork(id: string): Promise<boolean> {
    await apiClient.request({
      method: 'DELETE',
      url: `/api/v1/network/wifi/networks/${id}`
    });
    return true;
  }

  async toggleWiFiNetwork(id: string): Promise<WiFiNetwork> {
    const response = await apiClient.request({
      method: 'POST',
      url: `/api/v1/network/wifi/networks/${id}/toggle`
    });
    return response.data;
  }

  // Wi-Fi Client Management
  async getWiFiClients(filters?: {
    network_id?: string;
    ap_id?: string;
    status?: string;
    limit?: number;
  }): Promise<WiFiClient[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.network_id) params.append('network_id', filters.network_id);
      if (filters?.ap_id) params.append('ap_id', filters.ap_id);
      if (filters?.status) params.append('status', filters.status);
      if (filters?.limit) params.append('limit', filters.limit.toString());

      const response = await apiClient.request({
        method: 'GET',
        url: `/api/v1/network/wifi/clients?${params.toString()}`
      });
      return response.data || [];
    } catch (error) {
      console.error('Error fetching WiFi clients:', error);
      return [];
    }
  }

  async disconnectClient(id: string): Promise<boolean> {
    try {
      await apiClient.request({
        method: 'POST',
        url: `/api/v1/network/wifi/clients/${id}/disconnect`
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  async blockClient(macAddress: string): Promise<boolean> {
    try {
      await apiClient.request({
        method: 'POST',
        url: `/api/v1/network/wifi/clients/block`,
        data: { mac_address: macAddress }
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  async unblockClient(macAddress: string): Promise<boolean> {
    try {
      await apiClient.request({
        method: 'POST',
        url: `/api/v1/network/wifi/clients/unblock`,
        data: { mac_address: macAddress }
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  // Security Policy Management
  async getSecurityPolicies(): Promise<WiFiSecurityPolicy[]> {
    try {
      const response = await apiClient.request({
        method: 'GET',
        url: '/api/v1/network/wifi/security-policies'
      });
      return response.data || [];
    } catch (error) {
      console.error('Error fetching security policies:', error);
      return [];
    }
  }

  async createSecurityPolicy(policy: Partial<WiFiSecurityPolicy>): Promise<WiFiSecurityPolicy> {
    const response = await apiClient.request({
      method: 'POST',
      url: '/api/v1/network/wifi/security-policies',
      data: policy
    });
    return response.data;
  }

  async updateSecurityPolicy(id: string, updates: Partial<WiFiSecurityPolicy>): Promise<WiFiSecurityPolicy> {
    const response = await apiClient.request({
      method: 'PUT',
      url: `/api/v1/network/wifi/security-policies/${id}`,
      data: updates
    });
    return response.data;
  }

  // Performance Monitoring
  async getPerformanceLogs(filters?: {
    ap_id?: string;
    hours?: number;
  }): Promise<WiFiPerformanceLog[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.ap_id) params.append('ap_id', filters.ap_id);
      if (filters?.hours) params.append('hours', filters.hours.toString());

      const response = await apiClient.request({
        method: 'GET',
        url: `/api/v1/network/wifi/performance?${params.toString()}`
      });
      return response.data || [];
    } catch (error) {
      console.error('Error fetching performance logs:', error);
      return [];
    }
  }

  // Channel Analysis and Optimization
  async analyzeChannels(apId: string): Promise<WiFiChannelAnalysis[]> {
    try {
      const response = await apiClient.request({
        method: 'POST',
        url: `/api/v1/network/wifi/access-points/${apId}/analyze-channels`
      });
      return response.data || [];
    } catch (error) {
      console.error('Error analyzing channels:', error);
      return [];
    }
  }

  async getChannelAnalysis(apId: string): Promise<WiFiChannelAnalysis[]> {
    try {
      const response = await apiClient.request({
        method: 'GET',
        url: `/api/v1/network/wifi/access-points/${apId}/channel-analysis`
      });
      return response.data || [];
    } catch (error) {
      console.error('Error fetching channel analysis:', error);
      return [];
    }
  }

  // Mesh Network Management
  async getMeshNodes(): Promise<WiFiMeshNode[]> {
    try {
      const response = await apiClient.request({
        method: 'GET',
        url: '/api/v1/network/wifi/mesh-nodes'
      });
      return response.data || [];
    } catch (error) {
      console.error('Error fetching mesh nodes:', error);
      return [];
    }
  }

  async createMeshConnection(parentApId: string, childApId: string, config?: Partial<WiFiMeshNode>): Promise<WiFiMeshNode> {
    const response = await apiClient.request({
      method: 'POST',
      url: '/api/v1/network/wifi/mesh-nodes',
      data: {
        parent_ap_id: parentApId,
        child_ap_id: childApId,
        ...config
      }
    });
    return response.data;
  }

  // Schedule Management
  async getWiFiSchedules(networkId?: string): Promise<WiFiSchedule[]> {
    try {
      const params = networkId ? `?network_id=${networkId}` : '';
      const response = await apiClient.request({
        method: 'GET',
        url: `/api/v1/network/wifi/schedules${params}`
      });
      return response.data || [];
    } catch (error) {
      console.error('Error fetching WiFi schedules:', error);
      return [];
    }
  }

  async createWiFiSchedule(schedule: Partial<WiFiSchedule>): Promise<WiFiSchedule> {
    const response = await apiClient.request({
      method: 'POST',
      url: '/api/v1/network/wifi/schedules',
      data: schedule
    });
    return response.data;
  }

  // Statistics and Analytics
  async getWiFiStats(): Promise<WiFiStats> {
    try {
      const response = await apiClient.request({
        method: 'GET',
        url: '/api/v1/network/wifi/stats'
      });
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
      console.error('Error fetching WiFi stats:', error);
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

  // Channel Optimization
  async optimizeChannels(apId: string): Promise<{ success: boolean; recommendations: Array<{ band: string; channel: number; reason: string }> }> {
    try {
      const response = await apiClient.request({
        method: 'POST',
        url: `/api/v1/network/wifi/access-points/${apId}/optimize-channels`
      });
      return response.data;
    } catch (error) {
      console.error('Error optimizing channels:', error);
      return { success: false, recommendations: [] };
    }
  }

  // Security Operations
  async scanForRogueAPs(): Promise<Array<{ ssid: string; mac: string; security: string; signal: number; channel: number }>> {
    try {
      const response = await apiClient.request({
        method: 'POST',
        url: '/api/v1/network/wifi/scan-rogue-aps'
      });
      return response.data || [];
    } catch (error) {
      console.error('Error scanning for rogue APs:', error);
      return [];
    }
  }

  async updateClientBandwidth(clientId: string, limitMbps: number): Promise<boolean> {
    try {
      await apiClient.request({
        method: 'PUT',
        url: `/api/v1/network/wifi/clients/${clientId}/bandwidth`,
        data: { limit_mbps: limitMbps }
      });
      return true;
    } catch (error) {
      console.error('Error updating client bandwidth:', error);
      return false;
    }
  }

  // System Integration
  async applyWiFiConfiguration(): Promise<{ success: boolean; errors: string[] }> {
    try {
      const response = await apiClient.request({
        method: 'POST',
        url: '/api/v1/network/wifi/apply-configuration'
      });
      return response.data;
    } catch (error) {
      console.error('Error applying WiFi configuration:', error);
      return { 
        success: false, 
        errors: [error instanceof Error ? error.message : 'Configuration failed'] 
      };
    }
  }

  async restartWiFiService(apId?: string): Promise<boolean> {
    try {
      const url = apId 
        ? `/api/v1/network/wifi/access-points/${apId}/restart`
        : '/api/v1/network/wifi/restart';
      
      await apiClient.request({
        method: 'POST',
        url
      });
      return true;
    } catch (error) {
      console.error('Error restarting WiFi service:', error);
      return false;
    }
  }

  // Real-time monitoring
  async getClientSignalStrengths(): Promise<Array<{ mac: string; signal: number; noise: number; snr: number }>> {
    try {
      const response = await apiClient.request({
        method: 'GET',
        url: '/api/v1/network/wifi/client-signals'
      });
      return response.data || [];
    } catch (error) {
      console.error('Error fetching client signal strengths:', error);
      return [];
    }
  }

  // Wi-Fi Health Check
  async performWiFiHealthCheck(): Promise<{
    overall_health: 'healthy' | 'warning' | 'critical';
    issues: Array<{ type: string; message: string; severity: string }>;
    recommendations: string[];
  }> {
    try {
      const response = await apiClient.request({
        method: 'GET',
        url: '/api/v1/network/wifi/health-check'
      });
      return response.data;
    } catch (error) {
      console.error('Error performing WiFi health check:', error);
      return {
        overall_health: 'critical',
        issues: [{ type: 'system_error', message: 'Wi-Fi sistem durumu kontrol edilemiyor', severity: 'critical' }],
        recommendations: ['Sistem bağlantısını kontrol edin']
      };
    }
  }

  // Guest Network Management
  async createGuestNetwork(apId: string, config: {
    ssid: string;
    password: string;
    duration_hours?: number;
    bandwidth_limit_mbps?: number;
  }): Promise<WiFiNetwork> {
    const response = await apiClient.request({
      method: 'POST',
      url: '/api/v1/network/wifi/guest-networks',
      data: {
        ap_id: apId,
        ...config
      }
    });
    return response.data;
  }

  // Bandwidth Management
  async setClientBandwidthLimit(clientId: string, limitMbps: number): Promise<boolean> {
    try {
      await apiClient.request({
        method: 'PUT',
        url: `/api/v1/network/wifi/clients/${clientId}/bandwidth`,
        data: { limit_mbps: limitMbps }
      });
      return true;
    } catch (error) {
      console.error('Error setting client bandwidth limit:', error);
      return false;
    }
  }

  async setNetworkBandwidthLimit(networkId: string, limitMbps: number): Promise<WiFiNetwork> {
    const response = await apiClient.request({
      method: 'PUT',
      url: `/api/v1/network/wifi/networks/${networkId}/bandwidth`,
      data: { limit_mbps: limitMbps }
    });
    return response.data;
  }
}

export const wifiService = new WiFiService();