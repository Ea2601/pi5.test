// Speed Test Service API Client
import { unifiedApiClient } from './unifiedApiClient';

export class SpeedTestService {
  async getProfiles() {
    try {
      const response = await unifiedApiClient.get('/api/v1/network/speed-test/profiles');
      return response.data || [];
    } catch (error) {
      console.error('Get speed test profiles error:', error);
      return [];
    }
  }

  async createProfile(data: any) {
    try {
      const response = await unifiedApiClient.post('/api/v1/network/speed-test/profiles', data);
      return response.data;
    } catch (error) {
      console.error('Create speed test profile error:', error);
      throw error;
    }
  }

  async updateProfile(id: string, updates: any) {
    try {
      const response = await unifiedApiClient.put(`/api/v1/network/speed-test/profiles/${id}`, updates);
      return response.data;
    } catch (error) {
      console.error('Update speed test profile error:', error);
      throw error;
    }
  }

  async deleteProfile(id: string) {
    try {
      await unifiedApiClient.delete(`/api/v1/network/speed-test/profiles/${id}`);
      return true;
    } catch (error) {
      console.error('Delete speed test profile error:', error);
      throw error;
    }
  }

  async getServers() {
    try {
      const response = await unifiedApiClient.get('/api/v1/network/speed-test/servers');
      return response.data || [];
    } catch (error) {
      console.error('Get speed test servers error:', error);
      return [];
    }
  }

  async createServer(data: any) {
    try {
      const response = await unifiedApiClient.post('/api/v1/network/speed-test/servers', data);
      return response.data;
    } catch (error) {
      console.error('Create speed test server error:', error);
      throw error;
    }
  }

  async discoverOoklaServers() {
    try {
      const response = await unifiedApiClient.post('/api/v1/network/speed-test/discover-ookla');
      return response.data;
    } catch (error) {
      console.error('Discover Ookla servers error:', error);
      throw error;
    }
  }

  async runSpeedTest(config: any) {
    try {
      const response = await unifiedApiClient.post('/api/v1/network/speed-test/run', config);
      return response.data;
    } catch (error) {
      console.error('Run speed test error:', error);
      throw error;
    }
  }

  async getTestResults(filters?: any) {
    try {
      const response = await unifiedApiClient.get('/api/v1/network/speed-test/results', { params: filters });
      return response.data || [];
    } catch (error) {
      console.error('Get test results error:', error);
      return [];
    }
  }

  async testServerLatency(serverId: string) {
    try {
      const response = await unifiedApiClient.post(`/api/v1/network/speed-test/servers/${serverId}/test-latency`);
      return response.data;
    } catch (error) {
      console.error('Test server latency error:', error);
      throw error;
    }
  }

  async getDNSMonitors() {
    try {
      const response = await unifiedApiClient.get('/api/v1/network/speed-test/dns-monitors');
      return response.data || [];
    } catch (error) {
      console.error('Get DNS monitors error:', error);
      return [];
    }
  }

  async createDNSMonitor(data: any) {
    try {
      const response = await unifiedApiClient.post('/api/v1/network/speed-test/dns-monitors', data);
      return response.data;
    } catch (error) {
      console.error('Create DNS monitor error:', error);
      throw error;
    }
  }

  async updateDNSMonitor(id: string, updates: any) {
    try {
      const response = await unifiedApiClient.put(`/api/v1/network/speed-test/dns-monitors/${id}`, updates);
      return response.data;
    } catch (error) {
      console.error('Update DNS monitor error:', error);
      throw error;
    }
  }

  async getDNSPingResults(monitorId: string, hours: number) {
    try {
      const response = await unifiedApiClient.get(`/api/v1/network/speed-test/dns-monitors/${monitorId}/results?hours=${hours}`);
      return response.data || [];
    } catch (error) {
      console.error('Get DNS ping results error:', error);
      return [];
    }
  }

  async startDNSPingMonitor(monitorId: string) {
    try {
      const response = await unifiedApiClient.post(`/api/v1/network/speed-test/dns-monitors/${monitorId}/start`);
      return response.data;
    } catch (error) {
      console.error('Start DNS monitor error:', error);
      throw error;
    }
  }

  async stopDNSPingMonitor(monitorId: string) {
    try {
      const response = await unifiedApiClient.post(`/api/v1/network/speed-test/dns-monitors/${monitorId}/stop`);
      return response.data;
    } catch (error) {
      console.error('Stop DNS monitor error:', error);
      throw error;
    }
  }

  async getNetworkInterfaces() {
    try {
      const response = await unifiedApiClient.get('/api/v1/network/speed-test/interfaces');
      return response.data || [];
    } catch (error) {
      console.error('Get network interfaces error:', error);
      return [];
    }
  }

  async discoverNetworkInterfaces() {
    try {
      const response = await unifiedApiClient.post('/api/v1/network/speed-test/discover-interfaces');
      return response.data;
    } catch (error) {
      console.error('Discover network interfaces error:', error);
      throw error;
    }
  }

  async getSchedules() {
    try {
      const response = await unifiedApiClient.get('/api/v1/network/speed-test/schedules');
      return response.data || [];
    } catch (error) {
      console.error('Get schedules error:', error);
      return [];
    }
  }

  async createSchedule(data: any) {
    try {
      const response = await unifiedApiClient.post('/api/v1/network/speed-test/schedules', data);
      return response.data;
    } catch (error) {
      console.error('Create schedule error:', error);
      throw error;
    }
  }

  async getAlerts() {
    try {
      const response = await unifiedApiClient.get('/api/v1/network/speed-test/alerts');
      return response.data || [];
    } catch (error) {
      console.error('Get alerts error:', error);
      return [];
    }
  }

  async createAlert(data: any) {
    try {
      const response = await unifiedApiClient.post('/api/v1/network/speed-test/alerts', data);
      return response.data;
    } catch (error) {
      console.error('Create alert error:', error);
      throw error;
    }
  }

  async getSpeedTestStats(timeRange: string) {
    try {
      const response = await unifiedApiClient.get(`/api/v1/network/speed-test/stats?range=${timeRange}`);
      return response.data || {
        total_tests: 0,
        successful_tests: 0,
        failed_tests: 0,
        avg_download_mbps: 0,
        avg_upload_mbps: 0,
        avg_ping_ms: 0,
        last_test_date: null,
        popular_servers: [],
        performance_trends: []
      };
    } catch (error) {
      console.error('Get speed test stats error:', error);
      return {
        total_tests: 0,
        successful_tests: 0,
        failed_tests: 0,
        avg_download_mbps: 0,
        avg_upload_mbps: 0,
        avg_ping_ms: 0,
        last_test_date: null,
        popular_servers: [],
        performance_trends: []
      };
    }
  }

  async selectOptimalServer(criteria?: any) {
    try {
      const response = await unifiedApiClient.post('/api/v1/network/speed-test/select-optimal-server', criteria);
      return response.data;
    } catch (error) {
      console.error('Select optimal server error:', error);
      throw error;
    }
  }

  async analyzeBufferbloat(testResultId: string) {
    try {
      const response = await unifiedApiClient.post(`/api/v1/network/speed-test/results/${testResultId}/bufferbloat`);
      return response.data;
    } catch (error) {
      console.error('Analyze bufferbloat error:', error);
      throw error;
    }
  }

  async calculateQoEScore(result: any) {
    try {
      const response = await unifiedApiClient.post('/api/v1/network/speed-test/calculate-qoe', result);
      return response.data;
    } catch (error) {
      console.error('Calculate QoE error:', error);
      throw error;
    }
  }

  async getTestProgress(testId: string) {
    try {
      const response = await unifiedApiClient.get(`/api/v1/network/speed-test/progress/${testId}`);
      return response.data;
    } catch (error) {
      console.error('Get test progress error:', error);
      return null;
    }
  }

  // Additional WiFi integration methods (placeholder implementations)
  async getAccessPoints() {
    return this.getWiFiAccessPoints();
  }

  async getWiFiAccessPoints() {
    try {
      const response = await unifiedApiClient.get('/api/v1/network/wifi/access-points');
      return response.data || [];
    } catch (error) {
      console.error('Get WiFi access points error:', error);
      return [];
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

  async getWiFiClients(filters?: any) {
    try {
      const response = await unifiedApiClient.get('/api/v1/network/wifi/clients', { params: filters });
      return response.data || [];
    } catch (error) {
      console.error('Get WiFi clients error:', error);
      return [];
    }
  }
}

export const speedTestService = new SpeedTestService();