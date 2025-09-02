// Unified Frontend API Client - Replaces All Individual API Clients
import { UnifiedApiClient, ApiResponse } from '../../shared/utils/apiClient';
import { NetworkAPI, DHCPAPI, DNSAPI, WiFiAPI, VPNAPI } from '../../shared/types/api';
import { config } from '../../shared/config/environment';

class Pi5SupernodeAPIClient extends UnifiedApiClient {
  constructor() {
    super('frontend', config.FRONTEND_URL);
  }

  // Network Device Management
  async getDevices(filters?: {
    active?: boolean;
    type?: string;
    search?: string;
  }): Promise<NetworkAPI.DevicesResponse> {
    const params = new URLSearchParams();
    if (filters?.active !== undefined) params.append('active', String(filters.active));
    if (filters?.type) params.append('type', filters.type);
    if (filters?.search) params.append('search', filters.search);

    const response = await this.get<NetworkAPI.Device[]>(`/api/v1/network/devices?${params.toString()}`);
    
    return {
      ...response,
      total: response.data?.length || 0,
      active: response.data?.filter(d => d.is_active).length || 0
    } as NetworkAPI.DevicesResponse;
  }

  async getDevice(macAddress: string): Promise<ApiResponse<NetworkAPI.Device>> {
    return this.get<NetworkAPI.Device>(`/api/v1/network/devices/${macAddress}`);
  }

  async createDevice(device: NetworkAPI.DeviceInput): Promise<ApiResponse<NetworkAPI.Device>> {
    return this.post<NetworkAPI.Device>('/api/v1/network/devices', device);
  }

  async updateDevice(macAddress: string, updates: NetworkAPI.DeviceUpdate): Promise<ApiResponse<NetworkAPI.Device>> {
    return this.put<NetworkAPI.Device>(`/api/v1/network/devices/${macAddress}`, updates);
  }

  async deleteDevice(macAddress: string): Promise<ApiResponse<void>> {
    return this.delete(`/api/v1/network/devices/${macAddress}`);
  }

  async wakeDevice(macAddress: string): Promise<ApiResponse<{ message: string }>> {
    return this.post(`/api/v1/network/devices/${macAddress}/wake`);
  }

  // DHCP Management
  async getDHCPPools(): Promise<ApiResponse<DHCPAPI.Pool[]>> {
    return this.get<DHCPAPI.Pool[]>('/api/v1/network/dhcp/pools');
  }

  async createDHCPPool(pool: DHCPAPI.PoolInput): Promise<ApiResponse<DHCPAPI.Pool>> {
    return this.post<DHCPAPI.Pool>('/api/v1/network/dhcp/pools', pool);
  }

  async updateDHCPPool(id: string, updates: Partial<DHCPAPI.PoolInput>): Promise<ApiResponse<DHCPAPI.Pool>> {
    return this.put<DHCPAPI.Pool>(`/api/v1/network/dhcp/pools/${id}`, updates);
  }

  async deleteDHCPPool(id: string): Promise<ApiResponse<void>> {
    return this.delete(`/api/v1/network/dhcp/pools/${id}`);
  }

  async getDHCPReservations(filters?: {
    pool_id?: string;
    group_id?: string;
  }): Promise<ApiResponse<DHCPAPI.Reservation[]>> {
    const params = new URLSearchParams();
    if (filters?.pool_id) params.append('pool_id', filters.pool_id);
    if (filters?.group_id) params.append('group_id', filters.group_id);

    return this.get<DHCPAPI.Reservation[]>(`/api/v1/network/dhcp/reservations?${params.toString()}`);
  }

  async createDHCPReservation(reservation: Partial<DHCPAPI.Reservation>): Promise<ApiResponse<DHCPAPI.Reservation>> {
    return this.post<DHCPAPI.Reservation>('/api/v1/network/dhcp/reservations', reservation);
  }

  async getActiveDHCPLeases(): Promise<ApiResponse<DHCPAPI.Lease[]>> {
    return this.get<DHCPAPI.Lease[]>('/api/v1/network/dhcp/leases');
  }

  // DNS Management
  async getDNSServers(): Promise<ApiResponse<DNSAPI.Server[]>> {
    return this.get<DNSAPI.Server[]>('/api/v1/network/dns/servers');
  }

  async createDNSServer(server: Partial<DNSAPI.Server>): Promise<ApiResponse<DNSAPI.Server>> {
    return this.post<DNSAPI.Server>('/api/v1/network/dns/servers', server);
  }

  async testDNSServer(ipAddress: string): Promise<ApiResponse<{
    success: boolean;
    response_time: number;
    error?: string;
  }>> {
    return this.post('/api/v1/network/dns/test-server', { ip_address: ipAddress });
  }

  async getDNSProfiles(): Promise<ApiResponse<DNSAPI.Profile[]>> {
    return this.get<DNSAPI.Profile[]>('/api/v1/network/dns/profiles');
  }

  async createDNSProfile(profile: Partial<DNSAPI.Profile>): Promise<ApiResponse<DNSAPI.Profile>> {
    return this.post<DNSAPI.Profile>('/api/v1/network/dns/profiles', profile);
  }

  // Wi-Fi Management
  async getWiFiAccessPoints(): Promise<ApiResponse<WiFiAPI.AccessPoint[]>> {
    return this.get<WiFiAPI.AccessPoint[]>('/api/v1/network/wifi/access-points');
  }

  async getWiFiNetworks(apId?: string): Promise<ApiResponse<WiFiAPI.Network[]>> {
    const params = apId ? `?ap_id=${apId}` : '';
    return this.get<WiFiAPI.Network[]>(`/api/v1/network/wifi/networks${params}`);
  }

  async createWiFiNetwork(network: Partial<WiFiAPI.Network>): Promise<ApiResponse<WiFiAPI.Network>> {
    return this.post<WiFiAPI.Network>('/api/v1/network/wifi/networks', network);
  }

  async getWiFiClients(filters?: {
    network_id?: string;
    ap_id?: string;
    status?: string;
  }): Promise<ApiResponse<WiFiAPI.Client[]>> {
    const params = new URLSearchParams();
    if (filters?.network_id) params.append('network_id', filters.network_id);
    if (filters?.ap_id) params.append('ap_id', filters.ap_id);
    if (filters?.status) params.append('status', filters.status);

    return this.get<WiFiAPI.Client[]>(`/api/v1/network/wifi/clients?${params.toString()}`);
  }

  // VPN Management
  async getVPNServers(): Promise<ApiResponse<VPNAPI.Server[]>> {
    return this.get<VPNAPI.Server[]>('/api/v1/vpn/servers');
  }

  async createVPNServer(server: Partial<VPNAPI.Server>): Promise<ApiResponse<VPNAPI.Server>> {
    return this.post<VPNAPI.Server>('/api/v1/vpn/servers', server);
  }

  async getVPNClients(serverId?: string): Promise<ApiResponse<VPNAPI.Client[]>> {
    const params = serverId ? `?server_id=${serverId}` : '';
    return this.get<VPNAPI.Client[]>(`/api/v1/vpn/clients${params}`);
  }

  async createVPNClient(client: Partial<VPNAPI.Client>): Promise<ApiResponse<VPNAPI.Client>> {
    return this.post<VPNAPI.Client>('/api/v1/vpn/clients', client);
  }

  async generateVPNClientConfig(clientId: string): Promise<ApiResponse<VPNAPI.ClientConfig>> {
    return this.post<VPNAPI.ClientConfig>(`/api/v1/vpn/clients/${clientId}/config`);
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

  async discoverDevices(): Promise<ApiResponse<{ discovered: number; devices: NetworkAPI.Device[] }>> {
    return this.post('/api/v1/network/discover');
  }

  async exportConfiguration(): Promise<ApiResponse<{ config: any; backup_id: string }>> {
    return this.get('/api/v1/system/export-config');
  }

  async importConfiguration(config: any): Promise<ApiResponse<{ imported: string[]; errors: string[] }>> {
    return this.post('/api/v1/system/import-config', { config });
  }

  // Real-time updates
  subscribeToDeviceUpdates(callback: (device: NetworkAPI.Device) => void): () => void {
    if (typeof EventSource === 'undefined') {
      console.warn('EventSource not available');
      return () => {};
    }

    const eventSource = new EventSource('/api/v1/network/devices/stream');
    
    eventSource.onmessage = (event) => {
      try {
        const device = JSON.parse(event.data) as NetworkAPI.Device;
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