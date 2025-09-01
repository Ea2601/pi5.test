import { supabase } from './supabase';
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
    let query = supabase
      .from('network_topology_nodes')
      .select('*');

    if (filter?.node_types && filter.node_types.length > 0) {
      query = query.in('node_type', filter.node_types);
    }

    if (filter?.vlans && filter.vlans.length > 0) {
      query = query.in('vlan_id', filter.vlans);
    }

    if (filter?.online_only) {
      query = query.eq('is_online', true);
    }

    if (filter?.search_term) {
      query = query.or(`node_name.ilike.%${filter.search_term}%,hostname.ilike.%${filter.search_term}%,vendor.ilike.%${filter.search_term}%`);
    }

    query = query.order('node_type').order('node_name');

    const { data, error } = await query;
    
    if (error) throw error;
    return data || [];
  }

  async createTopologyNode(node: Partial<TopologyNode>): Promise<TopologyNode> {
    const { data, error } = await supabase
      .from('network_topology_nodes')
      .insert([{
        ...node,
        position_x: node.position_x || Math.floor(Math.random() * 800) + 100,
        position_y: node.position_y || Math.floor(Math.random() * 600) + 100,
        color_code: node.color_code || this.getDefaultColorForType(node.node_type || 'client')
      }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async updateTopologyNode(id: string, updates: Partial<TopologyNode>): Promise<TopologyNode> {
    const { data, error } = await supabase
      .from('network_topology_nodes')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async deleteTopologyNode(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('network_topology_nodes')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  }

  // Network Connections Management
  async getNetworkConnections(): Promise<NetworkConnection[]> {
    const { data, error } = await supabase
      .from('network_connections')
      .select(`
        *,
        source_node:network_topology_nodes!source_node_id(node_name, node_type),
        target_node:network_topology_nodes!target_node_id(node_name, node_type)
      `)
      .order('created_at');
    
    if (error) throw error;
    return data || [];
  }

  async createConnection(connection: Partial<NetworkConnection>): Promise<NetworkConnection> {
    const { data, error } = await supabase
      .from('network_connections')
      .insert([connection])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async updateConnection(id: string, updates: Partial<NetworkConnection>): Promise<NetworkConnection> {
    const { data, error } = await supabase
      .from('network_connections')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async deleteConnection(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('network_connections')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  }

  // VLAN Configuration Management
  async getVLANConfigurations(): Promise<VLANConfiguration[]> {
    const { data, error } = await supabase
      .from('vlan_configurations')
      .select(`
        *,
        dhcp_pool:dhcp_pools(name, start_ip, end_ip),
        dns_profile:dns_profiles(name, profile_type)
      `)
      .order('vlan_id');
    
    if (error) throw error;
    return data || [];
  }

  async createVLAN(vlan: Partial<VLANConfiguration>): Promise<VLANConfiguration> {
    const { data, error } = await supabase
      .from('vlan_configurations')
      .insert([vlan])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async updateVLAN(id: string, updates: Partial<VLANConfiguration>): Promise<VLANConfiguration> {
    const { data, error } = await supabase
      .from('vlan_configurations')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  // Traffic Flow Management
  async getTrafficFlows(): Promise<TrafficFlow[]> {
    const { data, error } = await supabase
      .from('traffic_flows')
      .select(`
        *,
        source_vlan:vlan_configurations(vlan_name, network_cidr)
      `)
      .order('priority', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }

  async createTrafficFlow(flow: Partial<TrafficFlow>): Promise<TrafficFlow> {
    const { data, error } = await supabase
      .from('traffic_flows')
      .insert([flow])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  // Network Segments Management
  async getNetworkSegments(): Promise<NetworkSegment[]> {
    const { data, error } = await supabase
      .from('network_segments')
      .select(`
        *,
        gateway_device:network_topology_nodes(node_name, ip_address)
      `)
      .order('segment_name');
    
    if (error) throw error;
    return data || [];
  }

  // Topology Snapshots
  async createSnapshot(name: string, description?: string): Promise<TopologySnapshot> {
    const nodes = await this.getTopologyNodes();
    const connections = await this.getNetworkConnections();
    const vlans = await this.getVLANConfigurations();

    const { data, error } = await supabase
      .from('topology_snapshots')
      .insert([{
        snapshot_name: name,
        description,
        nodes_data: nodes,
        connections_data: connections,
        vlans_data: vlans,
        total_nodes: nodes.length,
        total_connections: connections.length,
        total_vlans: vlans.length
      }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async getSnapshots(): Promise<TopologySnapshot[]> {
    const { data, error } = await supabase
      .from('topology_snapshots')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }

  async restoreSnapshot(id: string): Promise<boolean> {
    try {
      const { data: snapshot, error } = await supabase
        .from('topology_snapshots')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      // In production, this would restore the network configuration
      // For now, just log the restore action
      console.log(`Restoring topology snapshot: ${snapshot.snapshot_name}`);
      return true;
    } catch (error) {
      throw error;
    }
  }

  // Network Discovery
  async discoverTopology(): Promise<DiscoveryResult> {
    try {
      // Simulate network discovery
      await new Promise(resolve => setTimeout(resolve, 2000));

      const discoveredNodes: TopologyNode[] = [
        {
          id: `discovered-${Date.now()}-1`,
          node_name: 'ISP Gateway',
          node_type: 'wan_gateway',
          device_category: 'infrastructure',
          ip_address: '192.168.1.1',
          mac_address: '00:1A:2B:3C:4D:5E',
          vendor: 'TP-Link',
          position_x: 400,
          position_y: 50,
          is_online: true,
          ping_latency_ms: 5,
          bandwidth_usage_mbps: 150.5,
          port_count: 4,
          icon_type: 'router',
          color_code: '#FF6B6B',
          size_scale: 1.2,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: `discovered-${Date.now()}-2`,
          node_name: 'Main Switch',
          node_type: 'switch',
          device_category: 'infrastructure',
          ip_address: '192.168.1.2',
          mac_address: '00:1A:2B:3C:4D:5F',
          vendor: 'Netgear',
          position_x: 400,
          position_y: 200,
          is_online: true,
          ping_latency_ms: 2,
          bandwidth_usage_mbps: 89.2,
          port_count: 24,
          icon_type: 'switch',
          color_code: '#4ECDC4',
          size_scale: 1.0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];

      const discoveredConnections: NetworkConnection[] = [
        {
          id: `connection-${Date.now()}-1`,
          source_node_id: discoveredNodes[0].id,
          target_node_id: discoveredNodes[1].id,
          connection_type: 'ethernet',
          bandwidth_mbps: 1000,
          latency_ms: 1,
          packet_loss_percent: 0,
          duplex_mode: 'full',
          is_active: true,
          link_status: 'up',
          vlan_tags: [1],
          trunk_mode: false,
          native_vlan: 1,
          utilization_percent: 45.2,
          error_count: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];

      return {
        discovered_nodes: discoveredNodes,
        discovered_connections: discoveredConnections,
        confidence_score: 0.95,
        discovery_method: 'nmap',
        scan_duration_ms: 2000
      };
    } catch (error) {
      throw error;
    }
  }

  // Topology Statistics
  async getTopologyStats(): Promise<TopologyStats> {
    try {
      const [nodes, connections, vlans] = await Promise.all([
        this.getTopologyNodes(),
        this.getNetworkConnections(),
        this.getVLANConfigurations()
      ]);

      const onlineNodes = nodes.filter(n => n.is_online);
      const activeConnections = connections.filter(c => c.is_active);
      const activeVlans = vlans.filter(v => v.is_active);

      // Calculate device distribution
      const deviceDistribution: Record<string, number> = {};
      nodes.forEach(node => {
        deviceDistribution[node.node_type] = (deviceDistribution[node.node_type] || 0) + 1;
      });

      // Calculate VLAN utilization
      const vlanUtilization = activeVlans.map(vlan => {
        const vlanDevices = nodes.filter(n => n.vlan_id === vlan.vlan_id);
        return {
          vlan_id: vlan.vlan_id,
          vlan_name: vlan.vlan_name,
          device_count: vlanDevices.length,
          utilization_percent: Math.min(100, (vlanDevices.length / vlan.max_devices) * 100)
        };
      });

      // Calculate average latency
      const avgLatency = onlineNodes.length > 0 
        ? onlineNodes.reduce((acc, node) => acc + node.ping_latency_ms, 0) / onlineNodes.length 
        : 0;

      // Calculate total bandwidth
      const totalBandwidth = nodes.reduce((acc, node) => acc + node.bandwidth_usage_mbps, 0);

      return {
        total_nodes: nodes.length,
        online_nodes: onlineNodes.length,
        total_connections: connections.length,
        active_connections: activeConnections.length,
        total_vlans: vlans.length,
        active_vlans: activeVlans.length,
        avg_latency: Math.round(avgLatency),
        total_bandwidth: Math.round(totalBandwidth * 100) / 100,
        device_distribution: deviceDistribution,
        vlan_utilization: vlanUtilization
      };
    } catch (error) {
      throw error;
    }
  }

  // Alert Rules Management
  async getAlertRules(): Promise<NetworkAlertRule[]> {
    const { data, error } = await supabase
      .from('network_alert_rules')
      .select('*')
      .order('priority', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }

  async createAlertRule(rule: Partial<NetworkAlertRule>): Promise<NetworkAlertRule> {
    const { data, error } = await supabase
      .from('network_alert_rules')
      .insert([rule])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  // Network Health Monitoring
  async performHealthCheck(): Promise<{
    overall_health: 'healthy' | 'warning' | 'critical';
    issues: Array<{ type: string; message: string; severity: string }>;
    recommendations: string[];
  }> {
    try {
      const [nodes, connections, vlans] = await Promise.all([
        this.getTopologyNodes(),
        this.getNetworkConnections(),
        this.getVLANConfigurations()
      ]);

      const issues: Array<{ type: string; message: string; severity: string }> = [];
      const recommendations: string[] = [];

      // Check for offline devices
      const offlineNodes = nodes.filter(n => !n.is_online);
      if (offlineNodes.length > 0) {
        issues.push({
          type: 'device_offline',
          message: `${offlineNodes.length} cihaz çevrimdışı`,
          severity: 'warning'
        });
        recommendations.push('Çevrimdışı cihazların bağlantılarını kontrol edin');
      }

      // Check for high latency
      const highLatencyNodes = nodes.filter(n => n.ping_latency_ms > 100);
      if (highLatencyNodes.length > 0) {
        issues.push({
          type: 'high_latency',
          message: `${highLatencyNodes.length} cihazda yüksek gecikme`,
          severity: 'warning'
        });
        recommendations.push('Ağ performansını optimize edin');
      }

      // Check for broken connections
      const brokenConnections = connections.filter(c => c.link_status === 'down');
      if (brokenConnections.length > 0) {
        issues.push({
          type: 'broken_connection',
          message: `${brokenConnections.length} bağlantı kopuk`,
          severity: 'critical'
        });
        recommendations.push('Kopuk bağlantıları onarın');
      }

      // Check VLAN utilization
      const overutilizedVlans = vlans.filter(v => {
        const deviceCount = nodes.filter(n => n.vlan_id === v.vlan_id).length;
        return (deviceCount / v.max_devices) > 0.9;
      });

      if (overutilizedVlans.length > 0) {
        issues.push({
          type: 'vlan_overutilized',
          message: `${overutilizedVlans.length} VLAN'da kapasite sorunu`,
          severity: 'warning'
        });
        recommendations.push('VLAN kapasitelerini artırın');
      }

      const overall_health = issues.some(i => i.severity === 'critical') ? 'critical' :
                           issues.some(i => i.severity === 'warning') ? 'warning' : 'healthy';

      return { overall_health, issues, recommendations };
    } catch (error) {
      throw error;
    }
  }

  // Auto Layout Algorithm
  async autoLayoutTopology(): Promise<{ nodes: TopologyNode[]; connections: NetworkConnection[] }> {
    const nodes = await this.getTopologyNodes();
    const connections = await this.getNetworkConnections();

    // Implement hierarchical layout
    const layoutNodes = this.calculateHierarchicalLayout(nodes, connections);

    // Update node positions in database
    for (const node of layoutNodes) {
      await this.updateTopologyNode(node.id, {
        position_x: node.position_x,
        position_y: node.position_y
      });
    }

    return { nodes: layoutNodes, connections };
  }

  private calculateHierarchicalLayout(nodes: TopologyNode[], connections: NetworkConnection[]): TopologyNode[] {
    const levels: Record<string, TopologyNode[]> = {
      'wan_gateway': [],
      'router': [],
      'switch': [],
      'access_point': [],
      'server': [],
      'client': [],
      'iot_device': [],
      'gaming_device': []
    };

    // Group nodes by type
    nodes.forEach(node => {
      levels[node.node_type].push(node);
    });

    let currentY = 50;
    const levelSpacing = 120;
    const centerX = 400;

    // Position nodes by hierarchy
    Object.entries(levels).forEach(([type, levelNodes]) => {
      if (levelNodes.length === 0) return;

      const nodeSpacing = Math.max(120, 800 / (levelNodes.length + 1));
      levelNodes.forEach((node, index) => {
        node.position_x = centerX - ((levelNodes.length - 1) * nodeSpacing) / 2 + (index * nodeSpacing);
        node.position_y = currentY;
      });

      currentY += levelSpacing;
    });

    return nodes;
  }

  // System Integration Methods
  async syncWithNetworkDevices(): Promise<void> {
    try {
      // Sync topology nodes with network_devices table
      const { data: devices } = await supabase
        .from('network_devices')
        .select('*')
        .eq('is_active', true);

      if (devices) {
        for (const device of devices) {
          // Check if node already exists
          const { data: existingNode } = await supabase
            .from('network_topology_nodes')
            .select('id')
            .eq('mac_address', device.mac_address)
            .single();

          if (!existingNode) {
            // Create new topology node
            await this.createTopologyNode({
              node_name: device.device_name || 'Unknown Device',
              node_type: this.mapDeviceTypeToNodeType(device.device_type),
              device_category: this.mapDeviceTypeToCategory(device.device_type),
              mac_address: device.mac_address,
              ip_address: device.ip_address,
              hostname: device.device_name,
              vendor: device.device_brand || 'Unknown',
              is_online: device.is_active,
              last_seen: device.last_seen,
              vlan_id: this.inferVLANFromDeviceType(device.device_type)
            });
          }
        }
      }
    } catch (error) {
      console.error('Error syncing with network devices:', error);
    }
  }

  private mapDeviceTypeToNodeType(deviceType?: string): TopologyNode['node_type'] {
    switch (deviceType) {
      case 'PC': return 'client';
      case 'Mobile': return 'client';
      case 'IoT': return 'iot_device';
      case 'Game Console': return 'gaming_device';
      default: return 'client';
    }
  }

  private mapDeviceTypeToCategory(deviceType?: string): TopologyNode['device_category'] {
    switch (deviceType) {
      case 'PC': return 'client';
      case 'Mobile': return 'client';
      case 'IoT': return 'iot';
      case 'Game Console': return 'client';
      default: return 'unknown';
    }
  }

  private inferVLANFromDeviceType(deviceType?: string): number {
    switch (deviceType) {
      case 'PC': return 20; // Trusted
      case 'Mobile': return 20; // Trusted
      case 'IoT': return 30; // IoT
      case 'Game Console': return 50; // Gaming
      default: return 20; // Trusted
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

  // Performance Monitoring
  async updateNodeMetrics(nodeId: string, metrics: {
    ping_latency_ms?: number;
    bandwidth_usage_mbps?: number;
    is_online?: boolean;
  }): Promise<void> {
    await this.updateTopologyNode(nodeId, {
      ...metrics,
      last_seen: new Date().toISOString()
    });
  }

  // Traffic Analysis
  async analyzeTrafficPatterns(timeRange: '1h' | '24h' | '7d' = '24h'): Promise<{
    top_talkers: Array<{ node_id: string; node_name: string; bytes_transferred: number }>;
    vlan_usage: Array<{ vlan_id: number; vlan_name: string; traffic_percent: number }>;
    protocol_distribution: Record<string, number>;
  }> {
    try {
      // In production, this would analyze actual traffic data
      // For now, return mock analytics data
      const stats = await this.getTopologyStats();
      
      return {
        top_talkers: [
          { node_id: '1', node_name: 'Media Server', bytes_transferred: 15000000000 },
          { node_id: '2', node_name: 'Gaming PC', bytes_transferred: 8500000000 },
          { node_id: '3', node_name: 'Work Laptop', bytes_transferred: 3200000000 }
        ],
        vlan_usage: stats.vlan_utilization.map(v => ({
          vlan_id: v.vlan_id,
          vlan_name: v.vlan_name,
          traffic_percent: Math.random() * 100
        })),
        protocol_distribution: {
          'HTTP/HTTPS': 65,
          'Gaming': 20,
          'VoIP': 8,
          'Other': 7
        }
      };
    } catch (error) {
      throw error;
    }
  }
}

export const topologyService = new TopologyService();