// DHCP Service API Client
import { unifiedApiClient } from './unifiedApiClient';

export class DHCPService {
  async getDHCPPools() {
    try {
      const response = await unifiedApiClient.get<any[]>('/api/v1/network/dhcp/pools');
      return response.data || [];
    } catch (error) {
      console.error('Get DHCP pools error:', error);
      return [];
    }
  }

  async createDHCPPool(data: any) {
    try {
      const response = await unifiedApiClient.post('/api/v1/network/dhcp/pools', data);
      return response.data;
    } catch (error) {
      console.error('Create DHCP pool error:', error);
      throw error;
    }
  }

  async updateDHCPPool(id: string, updates: any) {
    try {
      const response = await unifiedApiClient.put(`/api/v1/network/dhcp/pools/${id}`, updates);
      return response.data;
    } catch (error) {
      console.error('Update DHCP pool error:', error);
      throw error;
    }
  }

  async deleteDHCPPool(id: string) {
    try {
      await unifiedApiClient.delete(`/api/v1/network/dhcp/pools/${id}`);
      return true;
    } catch (error) {
      console.error('Delete DHCP pool error:', error);
      throw error;
    }
  }

  async getDHCPReservations(filters?: any) {
    try {
      const response = await unifiedApiClient.get('/api/v1/network/dhcp/reservations', { params: filters });
      return response.data || [];
    } catch (error) {
      console.error('Get DHCP reservations error:', error);
      return [];
    }
  }

  async createDHCPReservation(data: any) {
    try {
      const response = await unifiedApiClient.post('/api/v1/network/dhcp/reservations', data);
      return response.data;
    } catch (error) {
      console.error('Create DHCP reservation error:', error);
      throw error;
    }
  }

  async updateDHCPReservation(id: string, updates: any) {
    try {
      const response = await unifiedApiClient.put(`/api/v1/network/dhcp/reservations/${id}`, updates);
      return response.data;
    } catch (error) {
      console.error('Update DHCP reservation error:', error);
      throw error;
    }
  }

  async deleteDHCPReservation(id: string) {
    try {
      await unifiedApiClient.delete(`/api/v1/network/dhcp/reservations/${id}`);
      return true;
    } catch (error) {
      console.error('Delete DHCP reservation error:', error);
      throw error;
    }
  }

  async getActiveLeases() {
    try {
      const response = await unifiedApiClient.get('/api/v1/network/dhcp/leases');
      return response.data || [];
    } catch (error) {
      console.error('Get active leases error:', error);
      return [];
    }
  }

  async releaseIP(macAddress: string) {
    try {
      const response = await unifiedApiClient.post('/api/v1/network/dhcp/release', { mac_address: macAddress });
      return response.data;
    } catch (error) {
      console.error('Release IP error:', error);
      throw error;
    }
  }

  async renewLease(id: string, leaseTime?: string) {
    try {
      const response = await unifiedApiClient.post('/api/v1/network/dhcp/renew', { 
        lease_id: id, 
        lease_time: leaseTime 
      });
      return response.data;
    } catch (error) {
      console.error('Renew lease error:', error);
      throw error;
    }
  }

  async getDeviceGroups() {
    try {
      const response = await unifiedApiClient.get('/api/v1/network/dhcp/device-groups');
      return response.data || [];
    } catch (error) {
      console.error('Get device groups error:', error);
      return [];
    }
  }

  async createDeviceGroup(data: any) {
    try {
      const response = await unifiedApiClient.post('/api/v1/network/dhcp/device-groups', data);
      return response.data;
    } catch (error) {
      console.error('Create device group error:', error);
      throw error;
    }
  }

  async getSecurityPolicies() {
    try {
      const response = await unifiedApiClient.get('/api/v1/network/dhcp/security-policies');
      return response.data || [];
    } catch (error) {
      console.error('Get security policies error:', error);
      return [];
    }
  }

  async createSecurityPolicy(data: any) {
    try {
      const response = await unifiedApiClient.post('/api/v1/network/dhcp/security-policies', data);
      return response.data;
    } catch (error) {
      console.error('Create security policy error:', error);
      throw error;
    }
  }

  async getDHCPOptions() {
    try {
      const response = await unifiedApiClient.get('/api/v1/network/dhcp/options');
      return response.data || [];
    } catch (error) {
      console.error('Get DHCP options error:', error);
      return [];
    }
  }

  async createDHCPOption(data: any) {
    try {
      const response = await unifiedApiClient.post('/api/v1/network/dhcp/options', data);
      return response.data;
    } catch (error) {
      console.error('Create DHCP option error:', error);
      throw error;
    }
  }

  async getDHCPLogs(filters?: any) {
    try {
      const response = await unifiedApiClient.get('/api/v1/network/dhcp/logs', { params: filters });
      return response.data || [];
    } catch (error) {
      console.error('Get DHCP logs error:', error);
      return [];
    }
  }

  async getDHCPStats() {
    try {
      const response = await unifiedApiClient.get<any>('/api/v1/network/dhcp/stats');
      return response.data || {
        total_pools: 0,
        active_pools: 0,
        total_leases: 0,
        active_leases: 0,
        expired_leases: 0,
        total_reservations: 0,
        active_reservations: 0,
        pool_utilization: [],
        recent_activity: []
      };
    } catch (error) {
      console.error('Get DHCP stats error:', error);
      return {
        total_pools: 0,
        active_pools: 0,
        total_leases: 0,
        active_leases: 0,
        expired_leases: 0,
        total_reservations: 0,
        active_reservations: 0,
        pool_utilization: [],
        recent_activity: []
      };
    }
  }

  async applyDHCPConfiguration() {
    try {
      const response = await unifiedApiClient.post('/api/v1/network/dhcp/apply-config');
      return response.data;
    } catch (error) {
      console.error('Apply DHCP configuration error:', error);
      throw error;
    }
  }

  async discoverDHCPServers() {
    try {
      const response = await unifiedApiClient.post('/api/v1/network/dhcp/discover');
      return response.data || [];
    } catch (error) {
      console.error('Discover DHCP servers error:', error);
      return [];
    }
  }

  async getNextAvailableIP(poolId: string) {
    try {
      const response = await unifiedApiClient.get(`/api/v1/network/dhcp/pools/${poolId}/next-ip`);
      return response.data;
    } catch (error) {
      console.error('Get next available IP error:', error);
      throw error;
    }
  }

  async bulkCreateReservations(reservations: any[]) {
    try {
      const response = await unifiedApiClient.post('/api/v1/network/dhcp/reservations/bulk', { reservations });
      return response.data;
    } catch (error) {
      console.error('Bulk create reservations error:', error);
      throw error;
    }
  }

  async cleanupExpiredLeases() {
    try {
      const response = await unifiedApiClient.post('/api/v1/network/dhcp/cleanup-expired');
      return response.data;
    } catch (error) {
      console.error('Cleanup expired leases error:', error);
      throw error;
    }
  }

  async syncWithNetworkDevices() {
    try {
      const response = await unifiedApiClient.post('/api/v1/network/dhcp/sync-devices');
      return response.data;
    } catch (error) {
      console.error('Sync with network devices error:', error);
      throw error;
    }
  }
}

export const dhcpService = new DHCPService();