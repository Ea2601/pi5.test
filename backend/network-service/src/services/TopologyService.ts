import { SharedDatabaseService } from '../../shared/database';
import { createServiceLogger } from '../../shared/utils/logger';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const logger = createServiceLogger('topology-service');

export interface TopologyNode {
  id: string;
  node_name: string;
  node_type: 'wan_gateway' | 'router' | 'switch' | 'access_point' | 'server' | 'client' | 'iot_device' | 'gaming_device';
  device_category: 'infrastructure' | 'server' | 'client' | 'iot' | 'network' | 'security' | 'unknown';
  mac_address?: string;
  ip_address?: string;
  hostname?: string;
  vendor?: string;
  position_x: number;
  position_y: number;
  vlan_id?: number;
  is_online: boolean;
  ping_latency_ms: number;
  bandwidth_usage_mbps: number;
  port_count: number;
  icon_type: string;
  color_code: string;
  size_scale: number;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface NetworkConnection {
  id: string;
  source_node_id: string;
  target_node_id: string;
  connection_type: 'ethernet' | 'wifi' | 'fiber' | 'vpn' | 'logical';
  bandwidth_mbps: number;
  latency_ms: number;
  is_active: boolean;
  link_status: 'up' | 'down' | 'testing' | 'unknown';
  vlan_tags: number[];
  trunk_mode: boolean;
  utilization_percent: number;
  created_at: string;
  updated_at: string;
}

export class TopologyService {
  private db: SharedDatabaseService;

  constructor() {
    this.db = SharedDatabaseService.getInstance({
      connectionString: process.env.DATABASE_URL!
    });
  }

  async getNodes(filter?: any): Promise<TopologyNode[]> {
    try {
      let query = 'SELECT * FROM network_topology_nodes WHERE 1=1';
      const params: any[] = [];

      if (filter?.node_types && filter.node_types.length > 0) {
        query += ' AND node_type = ANY($' + (params.length + 1) + ')';
        params.push(filter.node_types);
      }

      if (filter?.vlans && filter.vlans.length > 0) {
        query += ' AND vlan_id = ANY($' + (params.length + 1) + ')';
        params.push(filter.vlans);
      }

      if (filter?.online_only) {
        query += ' AND is_online = true';
      }

      if (filter?.search_term) {
        query += ' AND (node_name ILIKE $' + (params.length + 1) + ' OR hostname ILIKE $' + (params.length + 2) + ' OR vendor ILIKE $' + (params.length + 3) + ')';
        params.push(`%${filter.search_term}%`, `%${filter.search_term}%`, `%${filter.search_term}%`);
      }

      query += ' ORDER BY node_type, node_name';

      const result = await this.db.query(query, params);
      return result.rows;
    } catch (error) {
      logger.error('Error fetching topology nodes:', error);
      throw new Error('Failed to fetch topology nodes');
    }
  }

  async createNode(nodeData: Partial<TopologyNode>): Promise<TopologyNode> {
    try {
      const result = await this.db.query(`
        INSERT INTO network_topology_nodes (
          node_name, node_type, device_category, mac_address, ip_address,
          hostname, vendor, position_x, position_y, vlan_id,
          is_online, ping_latency_ms, bandwidth_usage_mbps, port_count,
          icon_type, color_code, size_scale, description
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
        RETURNING *
      `, [
        nodeData.node_name,
        nodeData.node_type,
        nodeData.device_category || 'unknown',
        nodeData.mac_address,
        nodeData.ip_address,
        nodeData.hostname,
        nodeData.vendor || 'Unknown',
        nodeData.position_x || Math.floor(Math.random() * 800) + 100,
        nodeData.position_y || Math.floor(Math.random() * 600) + 100,
        nodeData.vlan_id,
        nodeData.is_online !== undefined ? nodeData.is_online : true,
        nodeData.ping_latency_ms || 0,
        nodeData.bandwidth_usage_mbps || 0,
        nodeData.port_count || 0,
        nodeData.icon_type || 'device',
        nodeData.color_code || this.getDefaultColorForType(nodeData.node_type || 'client'),
        nodeData.size_scale || 1.0,
        nodeData.description
      ]);

      const node = result.rows[0];
      logger.info(`Created topology node: ${node.node_name}`);
      return node;
    } catch (error) {
      logger.error('Error creating topology node:', error);
      throw new Error('Failed to create topology node');
    }
  }

  async updateNode(id: string, updates: Partial<TopologyNode>): Promise<TopologyNode | null> {
    try {
      const setClauses: string[] = [];
      const params: any[] = [];
      let paramIndex = 1;

      Object.entries(updates).forEach(([key, value]) => {
        if (value !== undefined && key !== 'id' && key !== 'created_at') {
          setClauses.push(`${key} = $${paramIndex}`);
          params.push(value);
          paramIndex++;
        }
      });

      if (setClauses.length === 0) {
        const result = await this.db.query('SELECT * FROM network_topology_nodes WHERE id = $1', [id]);
        return result.rows[0] || null;
      }

      setClauses.push(`updated_at = NOW()`);
      params.push(id);

      const result = await this.db.query(`
        UPDATE network_topology_nodes 
        SET ${setClauses.join(', ')}
        WHERE id = $${paramIndex}
        RETURNING *
      `, params);

      const node = result.rows[0];
      if (node) {
        logger.info(`Updated topology node: ${node.node_name}`);
      }

      return node || null;
    } catch (error) {
      logger.error('Error updating topology node:', error);
      throw new Error('Failed to update topology node');
    }
  }

  async deleteNode(id: string): Promise<boolean> {
    try {
      const result = await this.db.query(
        'DELETE FROM network_topology_nodes WHERE id = $1',
        [id]
      );

      if (result.rowCount && result.rowCount > 0) {
        logger.info(`Deleted topology node: ${id}`);
        return true;
      }

      return false;
    } catch (error) {
      logger.error('Error deleting topology node:', error);
      throw new Error('Failed to delete topology node');
    }
  }

  async getConnections(): Promise<NetworkConnection[]> {
    try {
      const result = await this.db.query(`
        SELECT 
          c.*,
          s.node_name as source_name,
          t.node_name as target_name
        FROM network_connections c
        LEFT JOIN network_topology_nodes s ON c.source_node_id = s.id
        LEFT JOIN network_topology_nodes t ON c.target_node_id = t.id
        ORDER BY c.created_at
      `);
      
      return result.rows;
    } catch (error) {
      logger.error('Error fetching connections:', error);
      throw new Error('Failed to fetch network connections');
    }
  }

  async createConnection(connectionData: Partial<NetworkConnection>): Promise<NetworkConnection> {
    try {
      const result = await this.db.query(`
        INSERT INTO network_connections (
          source_node_id, target_node_id, connection_type, bandwidth_mbps,
          interface_name_source, interface_name_target, vlan_tags, trunk_mode,
          is_active, link_status, description
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING *
      `, [
        connectionData.source_node_id,
        connectionData.target_node_id,
        connectionData.connection_type,
        connectionData.bandwidth_mbps || 1000,
        connectionData.interface_name_source,
        connectionData.interface_name_target,
        connectionData.vlan_tags || [],
        connectionData.trunk_mode || false,
        connectionData.is_active !== undefined ? connectionData.is_active : true,
        connectionData.link_status || 'up',
        connectionData.description
      ]);

      const connection = result.rows[0];
      logger.info(`Created network connection: ${connection.source_node_id} -> ${connection.target_node_id}`);
      return connection;
    } catch (error) {
      logger.error('Error creating connection:', error);
      throw new Error('Failed to create network connection');
    }
  }

  async getVLANs(): Promise<any[]> {
    try {
      const result = await this.db.query(`
        SELECT 
          v.*,
          COUNT(n.id) as device_count
        FROM vlan_configurations v
        LEFT JOIN network_topology_nodes n ON v.vlan_id = n.vlan_id
        GROUP BY v.id
        ORDER BY v.vlan_id
      `);
      
      return result.rows;
    } catch (error) {
      logger.error('Error fetching VLANs:', error);
      throw new Error('Failed to fetch VLAN configurations');
    }
  }

  async createVLAN(vlanData: any): Promise<any> {
    try {
      const result = await this.db.query(`
        INSERT INTO vlan_configurations (
          vlan_id, vlan_name, description, network_cidr, gateway_ip,
          security_level, traffic_priority, isolation_enabled, inter_vlan_routing,
          internet_access, bandwidth_limit_mbps, max_devices, domain_suffix,
          dhcp_enabled, custom_dns_servers, device_restrictions, time_restrictions
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
        RETURNING *
      `, [
        vlanData.vlan_id,
        vlanData.vlan_name,
        vlanData.description,
        vlanData.network_cidr,
        vlanData.gateway_ip,
        vlanData.security_level || 'medium',
        vlanData.traffic_priority || 'normal',
        vlanData.isolation_enabled || false,
        vlanData.inter_vlan_routing !== undefined ? vlanData.inter_vlan_routing : true,
        vlanData.internet_access !== undefined ? vlanData.internet_access : true,
        vlanData.bandwidth_limit_mbps,
        vlanData.max_devices || 253,
        vlanData.domain_suffix || 'local',
        vlanData.dhcp_enabled !== undefined ? vlanData.dhcp_enabled : true,
        JSON.stringify(vlanData.custom_dns_servers || []),
        JSON.stringify(vlanData.device_restrictions || {}),
        JSON.stringify(vlanData.time_restrictions || {})
      ]);

      const vlan = result.rows[0];
      logger.info(`Created VLAN: ${vlan.vlan_id} - ${vlan.vlan_name}`);
      return vlan;
    } catch (error) {
      logger.error('Error creating VLAN:', error);
      throw new Error('Failed to create VLAN configuration');
    }
  }

  async getStats(): Promise<any> {
    try {
      // Get basic statistics
      const [nodesResult, connectionsResult, vlansResult] = await Promise.all([
        this.db.query('SELECT COUNT(*) as total, COUNT(*) FILTER (WHERE is_online = true) as online FROM network_topology_nodes'),
        this.db.query('SELECT COUNT(*) as total, COUNT(*) FILTER (WHERE is_active = true) as active FROM network_connections'),
        this.db.query('SELECT COUNT(*) as total, COUNT(*) FILTER (WHERE is_active = true) as active FROM vlan_configurations')
      ]);

      // Get device distribution
      const deviceDistResult = await this.db.query(`
        SELECT node_type, COUNT(*) as count
        FROM network_topology_nodes
        GROUP BY node_type
        ORDER BY count DESC
      `);

      // Get VLAN utilization
      const vlanUtilResult = await this.db.query(`
        SELECT 
          v.vlan_id,
          v.vlan_name,
          v.max_devices,
          COUNT(n.id) as device_count
        FROM vlan_configurations v
        LEFT JOIN network_topology_nodes n ON v.vlan_id = n.vlan_id
        WHERE v.is_active = true
        GROUP BY v.id, v.vlan_id, v.vlan_name, v.max_devices
        ORDER BY v.vlan_id
      `);

      // Calculate metrics
      const nodesStats = nodesResult.rows[0];
      const connectionsStats = connectionsResult.rows[0];
      const vlansStats = vlansResult.rows[0];

      const deviceDistribution: Record<string, number> = {};
      deviceDistResult.rows.forEach(row => {
        deviceDistribution[row.node_type] = parseInt(row.count);
      });

      const vlanUtilization = vlanUtilResult.rows.map(row => ({
        vlan_id: row.vlan_id,
        vlan_name: row.vlan_name,
        device_count: parseInt(row.device_count),
        utilization_percent: Math.round((parseInt(row.device_count) / row.max_devices) * 100)
      }));

      // Get average latency and bandwidth
      const perfResult = await this.db.query(`
        SELECT 
          AVG(ping_latency_ms) as avg_latency,
          SUM(bandwidth_usage_mbps) as total_bandwidth
        FROM network_topology_nodes 
        WHERE is_online = true
      `);

      const perf = perfResult.rows[0];

      return {
        total_nodes: parseInt(nodesStats.total),
        online_nodes: parseInt(nodesStats.online),
        total_connections: parseInt(connectionsStats.total),
        active_connections: parseInt(connectionsStats.active),
        total_vlans: parseInt(vlansStats.total),
        active_vlans: parseInt(vlansStats.active),
        avg_latency: Math.round(parseFloat(perf.avg_latency) || 0),
        total_bandwidth: Math.round((parseFloat(perf.total_bandwidth) || 0) * 100) / 100,
        device_distribution: deviceDistribution,
        vlan_utilization: vlanUtilization
      };
    } catch (error) {
      logger.error('Error fetching topology stats:', error);
      throw new Error('Failed to fetch topology statistics');
    }
  }

  async discoverTopology(): Promise<any> {
    try {
      logger.info('Starting network topology discovery');
      
      // In production, this would:
      // 1. Scan network with nmap
      // 2. Query SNMP for switch port information
      // 3. Use LLDP for neighbor discovery
      // 4. Analyze ARP tables
      // 5. Check routing tables
      
      // Simulate discovery process
      await new Promise(resolve => setTimeout(resolve, 2000));

      const discoveredNodes = [
        {
          node_name: 'ISP Gateway',
          node_type: 'wan_gateway' as const,
          device_category: 'infrastructure' as const,
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
          size_scale: 1.2
        },
        {
          node_name: 'Main Switch',
          node_type: 'switch' as const,
          device_category: 'infrastructure' as const,
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
          size_scale: 1.0
        }
      ];

      // Create discovered nodes
      const createdNodes = [];
      for (const nodeData of discoveredNodes) {
        try {
          const node = await this.createNode(nodeData);
          createdNodes.push(node);
        } catch (error) {
          logger.warn('Failed to create discovered node:', error);
        }
      }

      return {
        discovered_nodes: createdNodes,
        discovered_connections: [],
        confidence_score: 0.95,
        discovery_method: 'nmap',
        scan_duration_ms: 2000
      };
    } catch (error) {
      logger.error('Error discovering topology:', error);
      throw new Error('Failed to discover network topology');
    }
  }

  async autoLayout(): Promise<{ nodes: TopologyNode[]; connections: NetworkConnection[] }> {
    try {
      const nodes = await this.getNodes();
      const connections = await this.getConnections();

      // Implement hierarchical layout algorithm
      const layoutNodes = this.calculateHierarchicalLayout(nodes, connections);

      // Update node positions
      for (const node of layoutNodes) {
        await this.updateNode(node.id, {
          position_x: node.position_x,
          position_y: node.position_y
        });
      }

      logger.info('Applied automatic layout to topology');
      return { nodes: layoutNodes, connections };
    } catch (error) {
      logger.error('Error applying auto layout:', error);
      throw new Error('Failed to apply automatic layout');
    }
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
    const centerX = 500;

    // Position nodes by hierarchy
    Object.entries(levels).forEach(([type, levelNodes]) => {
      if (levelNodes.length === 0) return;

      const nodeSpacing = Math.max(120, 1000 / (levelNodes.length + 1));
      levelNodes.forEach((node, index) => {
        node.position_x = centerX - ((levelNodes.length - 1) * nodeSpacing) / 2 + (index * nodeSpacing);
        node.position_y = currentY;
      });

      currentY += levelSpacing;
    });

    return nodes;
  }

  async syncWithNetworkDevices(): Promise<void> {
    try {
      // Sync topology nodes with network_devices table
      const result = await this.db.query(`
        SELECT * FROM network_devices 
        WHERE is_active = true
      `);

      const devices = result.rows;

      for (const device of devices) {
        // Check if topology node already exists
        const existingResult = await this.db.query(
          'SELECT id FROM network_topology_nodes WHERE mac_address = $1',
          [device.mac_address]
        );

        if (existingResult.rows.length === 0) {
          // Create new topology node
          await this.createNode({
            node_name: device.device_name || 'Unknown Device',
            node_type: this.mapDeviceTypeToNodeType(device.device_type),
            device_category: this.mapDeviceTypeToCategory(device.device_type),
            mac_address: device.mac_address,
            ip_address: device.ip_address,
            hostname: device.device_name,
            vendor: device.device_brand || 'Unknown',
            is_online: device.is_active,
            vlan_id: this.inferVLANFromDeviceType(device.device_type)
          });
        } else {
          // Update existing node
          await this.updateNode(existingResult.rows[0].id, {
            is_online: device.is_active,
            ip_address: device.ip_address,
            hostname: device.device_name
          });
        }
      }

      logger.info(`Synced ${devices.length} devices with topology`);
    } catch (error) {
      logger.error('Error syncing with network devices:', error);
      throw new Error('Failed to sync with network devices');
    }
  }

  async createSnapshot(name: string, description?: string): Promise<any> {
    try {
      const [nodes, connections, vlans] = await Promise.all([
        this.getNodes(),
        this.getConnections(),
        this.getVLANs()
      ]);

      const result = await this.db.query(`
        INSERT INTO topology_snapshots (
          snapshot_name, description, nodes_data, connections_data, vlans_data,
          total_nodes, total_connections, total_vlans
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
      `, [
        name,
        description,
        JSON.stringify(nodes),
        JSON.stringify(connections),
        JSON.stringify(vlans),
        nodes.length,
        connections.length,
        vlans.length
      ]);

      const snapshot = result.rows[0];
      logger.info(`Created topology snapshot: ${snapshot.snapshot_name}`);
      return snapshot;
    } catch (error) {
      logger.error('Error creating snapshot:', error);
      throw new Error('Failed to create topology snapshot');
    }
  }

  async getSnapshots(): Promise<any[]> {
    try {
      const result = await this.db.query(`
        SELECT * FROM topology_snapshots 
        ORDER BY created_at DESC
      `);
      
      return result.rows;
    } catch (error) {
      logger.error('Error fetching snapshots:', error);
      throw new Error('Failed to fetch topology snapshots');
    }
  }

  async restoreSnapshot(id: string): Promise<boolean> {
    try {
      const result = await this.db.query(
        'SELECT * FROM topology_snapshots WHERE id = $1',
        [id]
      );

      if (result.rows.length === 0) {
        return false;
      }

      const snapshot = result.rows[0];
      
      // In production, this would restore the actual network configuration
      logger.info(`Restoring topology snapshot: ${snapshot.snapshot_name}`);
      
      return true;
    } catch (error) {
      logger.error('Error restoring snapshot:', error);
      throw new Error('Failed to restore topology snapshot');
    }
  }

  async performHealthCheck(): Promise<any> {
    try {
      const [nodes, connections] = await Promise.all([
        this.getNodes(),
        this.getConnections()
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

      const overall_health = issues.some(i => i.severity === 'critical') ? 'critical' :
                           issues.some(i => i.severity === 'warning') ? 'warning' : 'healthy';

      return { overall_health, issues, recommendations };
    } catch (error) {
      logger.error('Error performing health check:', error);
      throw new Error('Failed to perform network health check');
    }
  }

  async analyzeTrafficPatterns(timeRange: string = '24h'): Promise<any> {
    try {
      // In production, this would analyze actual traffic data
      // For now, return mock analytics
      return {
        top_talkers: [
          { node_id: '1', node_name: 'Media Server', bytes_transferred: 15000000000 },
          { node_id: '2', node_name: 'Gaming PC', bytes_transferred: 8500000000 },
          { node_id: '3', node_name: 'Work Laptop', bytes_transferred: 3200000000 }
        ],
        vlan_usage: [
          { vlan_id: 20, vlan_name: 'Trusted', traffic_percent: 45 },
          { vlan_id: 50, vlan_name: 'Gaming', traffic_percent: 30 },
          { vlan_id: 30, vlan_name: 'IoT', traffic_percent: 15 },
          { vlan_id: 10, vlan_name: 'Admin', traffic_percent: 10 }
        ],
        protocol_distribution: {
          'HTTP/HTTPS': 65,
          'Gaming': 20,
          'VoIP': 8,
          'Other': 7
        }
      };
    } catch (error) {
      logger.error('Error analyzing traffic patterns:', error);
      throw new Error('Failed to analyze traffic patterns');
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
}