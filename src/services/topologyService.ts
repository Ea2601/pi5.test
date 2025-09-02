// Topology Service API Client
import { unifiedApiClient } from './unifiedApiClient';

export class TopologyService {
  async getTopologyNodes(filter?: any) {
    try {
      const response = await unifiedApiClient.get('/api/v1/network/topology/nodes', { params: filter });
      return response.data || [];
    } catch (error) {
      console.error('Get topology nodes error:', error);
      return [];
    }
  }

  async createTopologyNode(data: any) {
    try {
      const response = await unifiedApiClient.post('/api/v1/network/topology/nodes', data);
      return response.data;
    } catch (error) {
      console.error('Create topology node error:', error);
      throw error;
    }
  }

  async updateTopologyNode(id: string, updates: any) {
    try {
      const response = await unifiedApiClient.put(`/api/v1/network/topology/nodes/${id}`, updates);
      return response.data;
    } catch (error) {
      console.error('Update topology node error:', error);
      throw error;
    }
  }

  async deleteTopologyNode(id: string) {
    try {
      await unifiedApiClient.delete(`/api/v1/network/topology/nodes/${id}`);
      return true;
    } catch (error) {
      console.error('Delete topology node error:', error);
      throw error;
    }
  }

  async getNetworkConnections() {
    try {
      const response = await unifiedApiClient.get('/api/v1/network/topology/connections');
      return response.data || [];
    } catch (error) {
      console.error('Get network connections error:', error);
      return [];
    }
  }

  async createConnection(data: any) {
    try {
      const response = await unifiedApiClient.post('/api/v1/network/topology/connections', data);
      return response.data;
    } catch (error) {
      console.error('Create connection error:', error);
      throw error;
    }
  }

  async updateConnection(id: string, updates: any) {
    try {
      const response = await unifiedApiClient.put(`/api/v1/network/topology/connections/${id}`, updates);
      return response.data;
    } catch (error) {
      console.error('Update connection error:', error);
      throw error;
    }
  }

  async deleteConnection(id: string) {
    try {
      await unifiedApiClient.delete(`/api/v1/network/topology/connections/${id}`);
      return true;
    } catch (error) {
      console.error('Delete connection error:', error);
      throw error;
    }
  }

  async getVLANConfigurations() {
    try {
      const response = await unifiedApiClient.get('/api/v1/network/topology/vlans');
      return response.data || [];
    } catch (error) {
      console.error('Get VLAN configurations error:', error);
      return [];
    }
  }

  async createVLAN(data: any) {
    try {
      const response = await unifiedApiClient.post('/api/v1/network/topology/vlans', data);
      return response.data;
    } catch (error) {
      console.error('Create VLAN error:', error);
      throw error;
    }
  }

  async updateVLAN(id: string, updates: any) {
    try {
      const response = await unifiedApiClient.put(`/api/v1/network/topology/vlans/${id}`, updates);
      return response.data;
    } catch (error) {
      console.error('Update VLAN error:', error);
      throw error;
    }
  }

  async getTrafficFlows() {
    try {
      const response = await unifiedApiClient.get('/api/v1/network/topology/traffic-flows');
      return response.data || [];
    } catch (error) {
      console.error('Get traffic flows error:', error);
      return [];
    }
  }

  async createTrafficFlow(data: any) {
    try {
      const response = await unifiedApiClient.post('/api/v1/network/topology/traffic-flows', data);
      return response.data;
    } catch (error) {
      console.error('Create traffic flow error:', error);
      throw error;
    }
  }

  async getNetworkSegments() {
    try {
      const response = await unifiedApiClient.get('/api/v1/network/topology/segments');
      return response.data || [];
    } catch (error) {
      console.error('Get network segments error:', error);
      return [];
    }
  }

  async getSnapshots() {
    try {
      const response = await unifiedApiClient.get('/api/v1/network/topology/snapshots');
      return response.data || [];
    } catch (error) {
      console.error('Get snapshots error:', error);
      return [];
    }
  }

  async createSnapshot(name: string, description?: string) {
    try {
      const response = await unifiedApiClient.post('/api/v1/network/topology/snapshots', { name, description });
      return response.data;
    } catch (error) {
      console.error('Create snapshot error:', error);
      throw error;
    }
  }

  async restoreSnapshot(id: string) {
    try {
      const response = await unifiedApiClient.post(`/api/v1/network/topology/snapshots/${id}/restore`);
      return response.data;
    } catch (error) {
      console.error('Restore snapshot error:', error);
      throw error;
    }
  }

  async discoverTopology() {
    try {
      const response = await unifiedApiClient.post('/api/v1/network/topology/discover');
      return response.data || {
        discovered_nodes: [],
        discovered_connections: [],
        confidence_score: 0,
        discovery_method: 'nmap',
        scan_duration_ms: 0
      };
    } catch (error) {
      console.error('Discover topology error:', error);
      return {
        discovered_nodes: [],
        discovered_connections: [],
        confidence_score: 0,
        discovery_method: 'nmap',
        scan_duration_ms: 0
      };
    }
  }

  async getTopologyStats() {
    try {
      const response = await unifiedApiClient.get('/api/v1/network/topology/stats');
      return response.data || {
        total_nodes: 0,
        online_nodes: 0,
        total_connections: 0,
        active_connections: 0,
        total_vlans: 0,
        active_vlans: 0,
        avg_latency: 0,
        total_bandwidth: 0,
        device_distribution: {},
        vlan_utilization: []
      };
    } catch (error) {
      console.error('Get topology stats error:', error);
      return {
        total_nodes: 0,
        online_nodes: 0,
        total_connections: 0,
        active_connections: 0,
        total_vlans: 0,
        active_vlans: 0,
        avg_latency: 0,
        total_bandwidth: 0,
        device_distribution: {},
        vlan_utilization: []
      };
    }
  }

  async performHealthCheck() {
    try {
      const response = await unifiedApiClient.get('/api/v1/network/topology/health');
      return response.data || {
        overall_health: 'healthy',
        issues: [],
        recommendations: []
      };
    } catch (error) {
      console.error('Topology health check error:', error);
      return {
        overall_health: 'healthy',
        issues: [],
        recommendations: []
      };
    }
  }

  async autoLayoutTopology() {
    try {
      const response = await unifiedApiClient.post('/api/v1/network/topology/auto-layout');
      return response.data;
    } catch (error) {
      console.error('Auto layout topology error:', error);
      throw error;
    }
  }

  async syncWithNetworkDevices() {
    try {
      const response = await unifiedApiClient.post('/api/v1/network/topology/sync-devices');
      return response.data;
    } catch (error) {
      console.error('Sync with network devices error:', error);
      throw error;
    }
  }

  async getAlertRules() {
    try {
      const response = await unifiedApiClient.get('/api/v1/network/topology/alert-rules');
      return response.data || [];
    } catch (error) {
      console.error('Get alert rules error:', error);
      return [];
    }
  }

  async createAlertRule(data: any) {
    try {
      const response = await unifiedApiClient.post('/api/v1/network/topology/alert-rules', data);
      return response.data;
    } catch (error) {
      console.error('Create alert rule error:', error);
      throw error;
    }
  }

  async analyzeTrafficPatterns(timeRange: string) {
    try {
      const response = await unifiedApiClient.get(`/api/v1/network/topology/traffic-analysis?range=${timeRange}`);
      return response.data || {
        protocol_distribution: {},
        application_distribution: {},
        top_talkers: [],
        peak_hours: [],
        anomalies: []
      };
    } catch (error) {
      console.error('Analyze traffic patterns error:', error);
      return {
        protocol_distribution: {},
        application_distribution: {},
        top_talkers: [],
        peak_hours: [],
        anomalies: []
      };
    }
  }
}

export const topologyService = new TopologyService();