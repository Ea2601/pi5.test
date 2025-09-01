import { apiClient } from './apiClient';
import { 
  SpeedTestProfile, 
  SpeedTestServer, 
  SpeedTestResult, 
  SpeedTestSchedule,
  DNSPingMonitor,
  DNSPingResult,
  NetworkInterface,
  SpeedTestAlert,
  SpeedTestStats,
  SpeedTestConfig,
  SpeedTestProgress,
  BufferbloatAnalysis
} from '../types/speedTest';

class SpeedTestService {
  // Speed Test Profiles Management
  async getProfiles(): Promise<SpeedTestProfile[]> {
    try {
      const response = await apiClient.request({
        method: 'GET',
        url: '/api/v1/network/speed-test/profiles'
      });
      return response.data || [];
    } catch (error) {
      console.error('Error fetching speed test profiles:', error);
      return [];
    }
  }

  async createProfile(profile: Partial<SpeedTestProfile>): Promise<SpeedTestProfile> {
    const response = await apiClient.request({
      method: 'POST',
      url: '/api/v1/network/speed-test/profiles',
      data: profile
    });
    return response.data;
  }

  async updateProfile(id: string, updates: Partial<SpeedTestProfile>): Promise<SpeedTestProfile> {
    const response = await apiClient.request({
      method: 'PUT',
      url: `/api/v1/network/speed-test/profiles/${id}`,
      data: updates
    });
    return response.data;
  }

  async deleteProfile(id: string): Promise<boolean> {
    await apiClient.request({
      method: 'DELETE',
      url: `/api/v1/network/speed-test/profiles/${id}`
    });
    return true;
  }

  // Speed Test Servers Management
  async getServers(): Promise<SpeedTestServer[]> {
    try {
      const response = await apiClient.request({
        method: 'GET',
        url: '/api/v1/network/speed-test/servers'
      });
      return response.data || [];
    } catch (error) {
      console.error('Error fetching speed test servers:', error);
      return [];
    }
  }

  async createServer(server: Partial<SpeedTestServer>): Promise<SpeedTestServer> {
    const response = await apiClient.request({
      method: 'POST',
      url: '/api/v1/network/speed-test/servers',
      data: server
    });
    return response.data;
  }

  async updateServer(id: string, updates: Partial<SpeedTestServer>): Promise<SpeedTestServer> {
    const response = await apiClient.request({
      method: 'PUT',
      url: `/api/v1/network/speed-test/servers/${id}`,
      data: updates
    });
    return response.data;
  }

  async deleteServer(id: string): Promise<boolean> {
    await apiClient.request({
      method: 'DELETE',
      url: `/api/v1/network/speed-test/servers/${id}`
    });
    return true;
  }

  // Speed Test Execution
  async runSpeedTest(config: SpeedTestConfig): Promise<{ test_id: string; progress_url: string }> {
    const response = await apiClient.request({
      method: 'POST',
      url: '/api/v1/network/speed-test/run',
      data: config
    });
    return response.data;
  }

  async getTestResults(filters?: {
    profile_id?: string;
    server_id?: string;
    interface?: string;
    start_date?: string;
    end_date?: string;
    limit?: number;
  }): Promise<SpeedTestResult[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.profile_id) params.append('profile_id', filters.profile_id);
      if (filters?.server_id) params.append('server_id', filters.server_id);
      if (filters?.interface) params.append('interface', filters.interface);
      if (filters?.start_date) params.append('start_date', filters.start_date);
      if (filters?.end_date) params.append('end_date', filters.end_date);
      if (filters?.limit) params.append('limit', filters.limit.toString());

      const response = await apiClient.request({
        method: 'GET',
        url: `/api/v1/network/speed-test/results?${params.toString()}`
      });
      return response.data || [];
    } catch (error) {
      console.error('Error fetching speed test results:', error);
      return [];
    }
  }

  // DNS Ping Monitoring
  async getDNSMonitors(): Promise<DNSPingMonitor[]> {
    try {
      const response = await apiClient.request({
        method: 'GET',
        url: '/api/v1/network/speed-test/dns-monitors'
      });
      return response.data || [];
    } catch (error) {
      console.error('Error fetching DNS monitors:', error);
      return [];
    }
  }

  async createDNSMonitor(monitor: Partial<DNSPingMonitor>): Promise<DNSPingMonitor> {
    const response = await apiClient.request({
      method: 'POST',
      url: '/api/v1/network/speed-test/dns-monitors',
      data: monitor
    });
    return response.data;
  }

  async updateDNSMonitor(id: string, updates: Partial<DNSPingMonitor>): Promise<DNSPingMonitor> {
    const response = await apiClient.request({
      method: 'PUT',
      url: `/api/v1/network/speed-test/dns-monitors/${id}`,
      data: updates
    });
    return response.data;
  }

  async getDNSPingResults(monitorId: string, hours: number = 1): Promise<DNSPingResult[]> {
    try {
      const response = await apiClient.request({
        method: 'GET',
        url: `/api/v1/network/speed-test/dns-monitors/${monitorId}/results?hours=${hours}`
      });
      return response.data || [];
    } catch (error) {
      console.error('Error fetching DNS ping results:', error);
      return [];
    }
  }

  async startDNSPingMonitor(monitorId: string): Promise<boolean> {
    try {
      await apiClient.request({
        method: 'POST',
        url: `/api/v1/network/speed-test/dns-monitors/${monitorId}/start`
      });
      return true;
    } catch (error) {
      console.error('Error starting DNS monitor:', error);
      return false;
    }
  }

  async stopDNSPingMonitor(monitorId: string): Promise<boolean> {
    try {
      await apiClient.request({
        method: 'POST',
        url: `/api/v1/network/speed-test/dns-monitors/${monitorId}/stop`
      });
      return true;
    } catch (error) {
      console.error('Error stopping DNS monitor:', error);
      return false;
    }
  }

  // Network Interfaces
  async getNetworkInterfaces(): Promise<NetworkInterface[]> {
    try {
      const response = await apiClient.request({
        method: 'GET',
        url: '/api/v1/network/speed-test/interfaces'
      });
      return response.data || [];
    } catch (error) {
      console.error('Error fetching network interfaces:', error);
      return [];
    }
  }

  async discoverNetworkInterfaces(): Promise<NetworkInterface[]> {
    try {
      const response = await apiClient.request({
        method: 'POST',
        url: '/api/v1/network/speed-test/interfaces/discover'
      });
      return response.data || [];
    } catch (error) {
      console.error('Error discovering network interfaces:', error);
      return [];
    }
  }

  // Speed Test Schedules
  async getSchedules(): Promise<SpeedTestSchedule[]> {
    try {
      const response = await apiClient.request({
        method: 'GET',
        url: '/api/v1/network/speed-test/schedules'
      });
      return response.data || [];
    } catch (error) {
      console.error('Error fetching speed test schedules:', error);
      return [];
    }
  }

  async createSchedule(schedule: Partial<SpeedTestSchedule>): Promise<SpeedTestSchedule> {
    const response = await apiClient.request({
      method: 'POST',
      url: '/api/v1/network/speed-test/schedules',
      data: schedule
    });
    return response.data;
  }

  // Speed Test Alerts
  async getAlerts(): Promise<SpeedTestAlert[]> {
    try {
      const response = await apiClient.request({
        method: 'GET',
        url: '/api/v1/network/speed-test/alerts'
      });
      return response.data || [];
    } catch (error) {
      console.error('Error fetching speed test alerts:', error);
      return [];
    }
  }

  async createAlert(alert: Partial<SpeedTestAlert>): Promise<SpeedTestAlert> {
    const response = await apiClient.request({
      method: 'POST',
      url: '/api/v1/network/speed-test/alerts',
      data: alert
    });
    return response.data;
  }

  // Server Selection Logic
  async selectOptimalServer(criteria?: {
    country_preference?: string[];
    max_latency_ms?: number;
    exclude_countries?: string[];
  }): Promise<SpeedTestServer | null> {
    try {
      const response = await apiClient.request({
        method: 'POST',
        url: '/api/v1/network/speed-test/servers/select-optimal',
        data: criteria || {}
      });
      return response.data;
    } catch (error) {
      console.error('Error selecting optimal server:', error);
      return null;
    }
  }

  async discoverOoklaServers(): Promise<SpeedTestServer[]> {
    try {
      const response = await apiClient.request({
        method: 'POST',
        url: '/api/v1/network/speed-test/servers/discover'
      });
      return response.data || [];
    } catch (error) {
      console.error('Error discovering Ookla servers:', error);
      return [];
    }
  }

  async testServerLatency(serverId: string): Promise<{ latency_ms: number; success: boolean }> {
    try {
      const response = await apiClient.request({
        method: 'POST',
        url: `/api/v1/network/speed-test/servers/${serverId}/test-latency`
      });
      return response.data;
    } catch (error) {
      return { latency_ms: 0, success: false };
    }
  }

  // Analytics and Statistics
  async getSpeedTestStats(timeRange: '24h' | '7d' | '30d' = '24h'): Promise<SpeedTestStats> {
    try {
      const response = await apiClient.request({
        method: 'GET',
        url: `/api/v1/network/speed-test/stats?range=${timeRange}`
      });
      return response.data || {
        total_tests: 0,
        successful_tests: 0,
        failed_tests: 0,
        avg_download_mbps: 0,
        avg_upload_mbps: 0,
        avg_ping_ms: 0,
        last_test_date: undefined,
        popular_servers: [],
        performance_trends: []
      };
    } catch (error) {
      console.error('Error fetching speed test stats:', error);
      return {
        total_tests: 0,
        successful_tests: 0,
        failed_tests: 0,
        avg_download_mbps: 0,
        avg_upload_mbps: 0,
        avg_ping_ms: 0,
        last_test_date: undefined,
        popular_servers: [],
        performance_trends: []
      };
    }
  }

  // Quality of Experience (QoE) Analysis
  async calculateQoEScore(result: SpeedTestResult): Promise<{
    overall_score: number;
    web_browsing: string;
    video_streaming: string;
    gaming: string;
    voip: string;
    recommendations: string[];
  }> {
    try {
      const response = await apiClient.request({
        method: 'POST',
        url: '/api/v1/network/speed-test/calculate-qoe',
        data: result
      });
      return response.data;
    } catch (error) {
      console.error('Error calculating QoE score:', error);
      return {
        overall_score: 0,
        web_browsing: 'poor',
        video_streaming: 'poor',
        gaming: 'poor',
        voip: 'poor',
        recommendations: ['Test sonucu analiz edilemiyor']
      };
    }
  }

  // Bufferbloat Analysis
  async analyzeBufferbloat(testResultId: string): Promise<BufferbloatAnalysis> {
    try {
      const response = await apiClient.request({
        method: 'POST',
        url: `/api/v1/network/speed-test/analyze-bufferbloat/${testResultId}`
      });
      return response.data;
    } catch (error) {
      console.error('Error analyzing bufferbloat:', error);
      return {
        score: 'F',
        idle_ping_ms: 0,
        loaded_ping_ms: 0,
        bloat_ms: 0,
        recommendation: 'Analiz başarısız',
        qoe_impact: 'severe'
      };
    }
  }

  // Real-time monitoring
  async getTestProgress(testId: string): Promise<SpeedTestProgress | null> {
    try {
      const response = await apiClient.request({
        method: 'GET',
        url: `/api/v1/network/speed-test/progress/${testId}`
      });
      return response.data;
    } catch (error) {
      console.error('Error getting test progress:', error);
      return null;
    }
  }

  // Wi-Fi Integration Methods (using the API client)
  async getAccessPoints(): Promise<any[]> {
    try {
      const response = await apiClient.request({
        method: 'GET',
        url: '/api/v1/network/wifi/access-points'
      });
      return response.data || [];
    } catch (error) {
      console.error('Error fetching access points:', error);
      return [];
    }
  }

  async getWiFiNetworks(apId?: string): Promise<any[]> {
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

  async getWiFiClients(filters?: {
    network_id?: string;
    ap_id?: string;
    status?: string;
    limit?: number;
  }): Promise<any[]> {
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
}

export const speedTestService = new SpeedTestService();