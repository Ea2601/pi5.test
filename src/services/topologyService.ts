import { apiClient } from './apiClient';
import { 
  TopologyNode, 
  NetworkConnection, 
  VLANConfiguration, 
  TrafficFlow, 
  NetworkSegment,
  TopologySnapshot,
  NetworkAlertRule,
  TopologyStats,
  DiscoveryResult,
  TopologyFilter
} from '../types/topology';

class TopologyService {
  // Topology Nodes Management
  async getTopologyNodes(filter?: TopologyFilter): Promise<TopologyNode[]> {
    try {
      const params = new URLSearchParams();
      
      if (filter?.node_types && filter.node_types.length > 0) {
        params.append('node_types', filter.node_types.join(','));
      }
      
      if (filter?.vlans && filter.vlans.length > 0) {
        params.append('vlans', filter.vlans.join(','));
      }
      
      if (filter?.online_only) {
        params.append('online_only', 'true');
      }
      
      if (filter?.search_term) {
        params.append('search', filter.search_term);
      }

      const response = await apiClient.get(`/topology/nodes?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching topology nodes:', error);
      return [];
    }
  }

  async createTopologyNode(node: Partial<TopologyNode>): Promise<TopologyNode> {
    const response = await apiClient.post('/topology/nodes', {
      ...node,
      position_x: node.position_x || Math.floor(Math.random() * 800) + 100,
      position_y: node.position_y || Math.floor(Math.random() * 600) + 100,
      color_code: node.color_code || this.getDefaultColorForType(node.node_type || 'client')
    });
    return response.data;
  }

  async updateTopologyNode(id: string, updates: Partial<TopologyNode>): Promise<TopologyNode> {
    const response = await apiClient.put(`/topology/nodes/${id}`, updates);
    return response.data;
  }

  async deleteTopologyNode(id: string): Promise<boolean> {
    await apiClient.delete(`/topology/nodes/${id}`);
    return true;
  }

  // Network Connections Management
  async getNetworkConnections(): Promise<NetworkConnection[]> {
    try {
      const response = await apiClient.get('/topology/connections');
      return response.data;
    } catch (error) {
      console.error('Error fetching network connections:', error);
      return [];
    }
  }

  async createConnection(connection: Partial<NetworkConnection>): Promise<NetworkConnection> {
    const response = await apiClient.post('/topology/connections', connection);
    return response.data;
  }

  async updateConnection(id: string, updates: Partial<NetworkConnection>): Promise<NetworkConnection> {
    const response = await apiClient.put(`/topology/connections/${id}`, updates);
    return response.data;
  }

  async deleteConnection(id: string): Promise<boolean> {
    await apiClient.delete(`/topology/connections/${id}`);
    return true;
  }

  // VLAN Configuration Management
  async getVLANConfigurations(): Promise<VLANConfiguration[]> {
    try {
      const response = await apiClient.get('/topology/vlans');
      return response.data;
    } catch (error) {
      console.error('Error fetching VLAN configurations:', error);
      return [];
    }
  }

  async createVLAN(vlan: Partial<VLANConfiguration>): Promise<VLANConfiguration> {
    const response = await apiClient.post('/topology/vlans', vlan);
    return response.data;
  }

  async updateVLAN(id: string, updates: Partial<VLANConfiguration>): Promise<VLANConfiguration> {
    const response = await apiClient.put(`/topology/vlans/${id}`, updates);
    return response.data;
  }

  // Traffic Flow Management
  async getTrafficFlows(): Promise<TrafficFlow[]> {
    try {
      const response = await apiClient.get('/topology/traffic-flows');
      return response.data;
    } catch (error) {
      console.error('Error fetching traffic flows:', error);
      return [];
    }
  }

  async createTrafficFlow(flow: Partial<TrafficFlow>): Promise<TrafficFlow> {
    const response = await apiClient.post('/topology/traffic-flows', flow);
    return response.data;
  }

  // Network Segments Management
  async getNetworkSegments(): Promise<NetworkSegment[]> {
    try {
      const response = await apiClient.get('/topology/segments');
      return response.data;
    } catch (error) {
      console.error('Error fetching network segments:', error);
      return [];
    }
  }

  // Topology Snapshots
  async createSnapshot(name: string, description?: string): Promise<TopologySnapshot> {
    const response = await apiClient.post('/topology/snapshots', {
      snapshot_name: name,
      description
    });
    return response.data;
  }

  async getSnapshots(): Promise<TopologySnapshot[]> {
    try {
      const response = await apiClient.get('/topology/snapshots');
      return response.data;
    } catch (error) {
      console.error('Error fetching snapshots:', error);
      return [];
    }
  }

  async restoreSnapshot(id: string): Promise<boolean> {
    try {
      await apiClient.post(`/topology/snapshots/${id}/restore`);
      return true;
    } catch (error) {
      console.error('Error restoring snapshot:', error);
      throw error;
    }
  }

  // Network Discovery
  async discoverTopology(): Promise<DiscoveryResult> {
    try {
      const response = await apiClient.post('/topology/discover');
      return response.data;
    } catch (error) {
      console.error('Error during network discovery:', error);
      throw error;
    }
  }

  // Topology Statistics
  async getTopologyStats(): Promise<TopologyStats> {
    try {
      const response = await apiClient.get('/topology/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching topology stats:', error);
      // Return default stats in case of error
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

  // Alert Rules Management
  async getAlertRules(): Promise<NetworkAlertRule[]> {
    try {
      const response = await apiClient.get('/topology/alert-rules');
      return response.data;
    } catch (error) {
      console.error('Error fetching alert rules:', error);
      return [];
    }
  }

  async createAlertRule(rule: Partial<NetworkAlertRule>): Promise<NetworkAlertRule> {
    const response = await apiClient.post('/topology/alert-rules', rule);
    return response.data;
  }

  // Network Health Monitoring
  async performHealthCheck(): Promise<{
    overall_health: 'healthy' | 'warning' | 'critical';
    issues: Array<{ type: string; message: string; severity: string }>;
    recommendations: string[];
  }> {
    try {
      const response = await apiClient.get('/topology/health-check');
      return response.data;
    } catch (error) {
      console.error('Error performing health check:', error);
      return {
        overall_health: 'warning',
        issues: [{ type: 'connection_error', message: 'Ağ durumu kontrol edilemiyor', severity: 'warning' }],
        recommendations: ['Ağ bağlantısını kontrol edin']
      };
    }
  }

  // Auto Layout Algorithm
  async autoLayoutTopology(): Promise<{ nodes: TopologyNode[]; connections: NetworkConnection[] }> {
    try {
      const response = await apiClient.post('/topology/auto-layout');
      return response.data;
    } catch (error) {
      console.error('Error auto-layouting topology:', error);
      const nodes = await this.getTopologyNodes();
      const connections = await this.getNetworkConnections();
      return { nodes, connections };
    }
  }

  // Performance Monitoring
  async updateNodeMetrics(nodeId: string, metrics: {
    ping_latency_ms?: number;
    bandwidth_usage_mbps?: number;
    is_online?: boolean;
  }): Promise<void> {
    try {
      await apiClient.patch(`/topology/nodes/${nodeId}/metrics`, metrics);
    } catch (error) {
      console.error('Error updating node metrics:', error);
    }
  }

  // Traffic Analysis
  async analyzeTrafficPatterns(timeRange: '1h' | '24h' | '7d' = '24h'): Promise<{
    top_talkers: Array<{ node_id: string; node_name: string; bytes_transferred: number }>;
    vlan_usage: Array<{ vlan_id: number; vlan_name: string; traffic_percent: number }>;
    protocol_distribution: Record<string, number>;
  }> {
    try {
      const response = await apiClient.request({
        method: 'GET',
        url: `/topology/traffic-analysis?range=${timeRange}`
      });
      return response.data;
    } catch (error) {
      console.error('Error analyzing traffic patterns:', error);
      return {
        top_talkers: [],
        vlan_usage: [],
        protocol_distribution: {}
      };
    }
  }

  // System Integration Methods
  async syncWithNetworkDevices(): Promise<void> {
    try {
      await apiClient.post('/topology/sync-devices');
    } catch (error) {
      console.error('Error syncing with network devices:', error);
    }
  }

  private getDefaultColorForType(nodeType: TopologyNode['node_type']): string {
    const colorMap: Record<TopologyNode['node_type'], string> = {
      'wan_gateway': '#FF6B6B',
      'router': '#4ECDC4',
      'switch': '#45B7D1',
      'access_point': '#96CEB4',
      'server': '#FECA57',
      'client': '#48CAE4',
      'iot_device': '#FF9FF3',
      'gaming_device': '#54A0FF'
    };
    return colorMap[nodeType] || '#48CAE4';
  }
}

export const topologyService = new TopologyService();