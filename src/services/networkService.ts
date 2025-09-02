// Network Service API Client
import { unifiedApiClient } from './unifiedApiClient';

export interface NetworkServiceResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

export class NetworkService {
  
  // DNS Operations
  async getDNSServers(): Promise<NetworkServiceResponse> {
    try {
      const response = await unifiedApiClient.get('/api/v1/network/dns/servers');
      return response;
    } catch (error) {
      console.error('Get DNS servers error:', error);
      return { success: false, error: 'Failed to get DNS servers' };
    }
  }

  async createDNSServer(data: any): Promise<NetworkServiceResponse> {
    try {
      const response = await unifiedApiClient.post('/api/v1/network/dns/servers', data);
      return response;
    } catch (error) {
      console.error('Create DNS server error:', error);
      return { success: false, error: 'Failed to create DNS server' };
    }
  }

  // DHCP Operations
  async getDHCPPools(): Promise<NetworkServiceResponse> {
    try {
      const response = await unifiedApiClient.get('/api/v1/network/dhcp/pools');
      return response;
    } catch (error) {
      console.error('Get DHCP pools error:', error);
      return { success: false, error: 'Failed to get DHCP pools' };
    }
  }

  async createDHCPPool(data: any): Promise<NetworkServiceResponse> {
    try {
      const response = await unifiedApiClient.post('/api/v1/network/dhcp/pools', data);
      return response;
    } catch (error) {
      console.error('Create DHCP pool error:', error);
      return { success: false, error: 'Failed to create DHCP pool' };
    }
  }

  // WiFi Operations
  async getWiFiNetworks(): Promise<NetworkServiceResponse> {
    try {
      const response = await unifiedApiClient.get('/api/v1/network/wifi/networks');
      return response;
    } catch (error) {
      console.error('Get WiFi networks error:', error);
      return { success: false, error: 'Failed to get WiFi networks' };
    }
  }

  async createWiFiNetwork(data: any): Promise<NetworkServiceResponse> {
    try {
      const response = await unifiedApiClient.post('/api/v1/network/wifi/networks', data);
      return response;
    } catch (error) {
      console.error('Create WiFi network error:', error);
      return { success: false, error: 'Failed to create WiFi network' };
    }
  }

  // Traffic Rules
  async getTrafficRules(): Promise<NetworkServiceResponse> {
    try {
      const response = await unifiedApiClient.get('/api/v1/network/traffic/rules');
      return response;
    } catch (error) {
      console.error('Get traffic rules error:', error);
      return { success: false, error: 'Failed to get traffic rules' };
    }
  }

  async createTrafficRule(data: any): Promise<NetworkServiceResponse> {
    try {
      const response = await unifiedApiClient.post('/api/v1/network/traffic/rules', data);
      return response;
    } catch (error) {
      console.error('Create traffic rule error:', error);
      return { success: false, error: 'Failed to create traffic rule' };
    }
  }

  // Speed Test
  async runSpeedTest(): Promise<NetworkServiceResponse> {
    try {
      const response = await unifiedApiClient.post('/api/v1/network/speed-test');
      return response;
    } catch (error) {
      console.error('Run speed test error:', error);
      return { success: false, error: 'Failed to run speed test' };
    }
  }
}

export const networkService = new NetworkService();