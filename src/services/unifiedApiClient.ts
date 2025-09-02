// Unified Frontend API Client - Replaces All Individual API Clients
import { UnifiedApiClient, ApiResponse } from '../../shared/utils/apiClient';

interface NetworkDevice {
  mac_address: string;
  ip_address?: string;
  device_name: string;
  device_type: 'Mobile' | 'PC' | 'IoT' | 'Game Console';
  device_brand?: string;
  is_active: boolean;
  last_seen: string;
  first_discovered: string;
  dhcp_lease_expires?: string;
  vendor_info?: string;
  created_at: string;
  updated_at: string;
}

interface DeviceInput {
  mac_address: string;
  ip_address?: string;
  device_name: string;
  device_type: 'Mobile' | 'PC' | 'IoT' | 'Game Console';
  device_brand?: string;
}

interface DeviceUpdate {
  device_name?: string;
  device_type?: 'Mobile' | 'PC' | 'IoT' | 'Game Console';
  device_brand?: string;
  is_active?: boolean;
}

interface DevicesResponse extends ApiResponse<NetworkDevice[]> {
  total: number;
  active: number;
}

class Pi5SupernodeAPIClient extends UnifiedApiClient {
  constructor() {
    super('frontend');
    // Override base URL for frontend to use relative paths with Vite proxy
    this.axiosInstance.defaults.baseURL = '/';
  }

  // Network Device Management
  async getDevices(filters?: {
    active?: boolean;
    type?: string;
    search?: string;
  }): Promise<DevicesResponse> {
    const params = new URLSearchParams();
    if (filters?.active !== undefined) params.append('active', String(filters.active));
    if (filters?.type) params.append('type', filters.type);
    if (filters?.search) params.append('search', filters.search);

    const response = await this.get<NetworkDevice[]>(`/api/v1/network/devices?${params.toString()}`);
    
    return {
      ...response,
      total: response.data?.length || 0,
      active: response.data?.filter(d => d.is_active).length || 0
    } as DevicesResponse;
  }

  async getDevice(macAddress: string): Promise<ApiResponse<NetworkDevice>> {
    return this.get<NetworkDevice>(`/api/v1/network/devices/${macAddress}`);
  }

  async createDevice(device: DeviceInput): Promise<ApiResponse<NetworkDevice>> {
    return this.post<NetworkDevice>('/api/v1/network/devices', device);
  }

  async updateDevice(macAddress: string, updates: DeviceUpdate): Promise<ApiResponse<NetworkDevice>> {
    return this.put<NetworkDevice>(`/api/v1/network/devices/${macAddress}`, updates);
  }

  async deleteDevice(macAddress: string): Promise<ApiResponse<void>> {
    return this.delete(`/api/v1/network/devices/${macAddress}`);
  }

  async wakeDevice(macAddress: string): Promise<ApiResponse<{ message: string }>> {
    return this.post(`/api/v1/network/devices/${macAddress}/wake`);
  }

  // System Operations
  async getSystemMetrics(): Promise<ApiResponse<{
    cpu: number;
    memory: number;
    disk: number;
    network: { upload: number; download: number };
    temperature: number;
    uptime: number;
  }>> {
    return this.get('/api/v1/system/metrics');
  }

  async discoverDevices(): Promise<ApiResponse<{ discovered: number; devices: NetworkDevice[] }>> {
    return this.post('/api/v1/network/discover');
  }

  // Real-time updates
  subscribeToDeviceUpdates(callback: (device: NetworkDevice) => void): () => void {
    if (typeof EventSource === 'undefined') {
      console.warn('EventSource not available');
      return () => {};
    }

    const eventSource = new EventSource('/api/v1/network/devices/stream');
    
    eventSource.onmessage = (event) => {
      try {
        const device = JSON.parse(event.data) as NetworkDevice;
        callback(device);
      } catch (error) {
        console.error('Error parsing device update:', error);
      }
    };

    eventSource.onerror = (error) => {
      console.error('Device updates stream error:', error);
    };

    return () => {
      eventSource.close();
    };
  }
}

// Export singleton instance
export const unifiedApiClient = new Pi5SupernodeAPIClient();