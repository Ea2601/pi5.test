// Network Topology Management Types

export interface TopologyNode {
  id: string;
  node_name: string;
  node_type: 'wan_gateway' | 'router' | 'switch' | 'access_point' | 'server' | 'client' | 'iot_device' | 'gaming_device';
  device_category: 'infrastructure' | 'server' | 'client' | 'iot' | 'network' | 'security' | 'unknown';
  
  // Physical properties
  mac_address?: string;
  ip_address?: string;
  hostname?: string;
  vendor?: string;
  model?: string;
  
  // Topology properties
  position_x: number;
  position_y: number;
  parent_node_id?: string;
  vlan_id?: number;
  network_segment?: string;
  
  // Status and metrics
  is_online: boolean;
  last_seen?: string;
  ping_latency_ms: number;
  bandwidth_usage_mbps: number;
  port_count: number;
  
  // Configuration
  management_ip?: string;
  snmp_community?: string;
  config_backup?: string;
  firmware_version?: string;
  
  // Visual representation
  icon_type: string;
  color_code: string;
  size_scale: number;
  
  // Metadata
  description?: string;
  location?: string;
  purchase_date?: string;
  warranty_expires?: string;
  notes?: string;
  
  created_at: string;
  updated_at: string;
}

export interface NetworkConnection {
  id: string;
  source_node_id: string;
  target_node_id: string;
  
  // Connection properties
  connection_type: 'ethernet' | 'wifi' | 'fiber' | 'vpn' | 'logical';
  interface_name_source?: string;
  interface_name_target?: string;
  
  // Performance metrics
  bandwidth_mbps: number;
  latency_ms: number;
  packet_loss_percent: number;
  duplex_mode: 'full' | 'half' | 'auto';
  
  // Status
  is_active: boolean;
  link_status: 'up' | 'down' | 'testing' | 'unknown';
  
  // VLAN and routing
  vlan_tags: number[];
  trunk_mode: boolean;
  native_vlan: number;
  
  // Quality metrics
  utilization_percent: number;
  error_count: number;
  last_error?: string;
  
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface VLANConfiguration {
  id: string;
  vlan_id: number;
  vlan_name: string;
  description?: string;
  
  // Network configuration
  network_cidr: string;
  gateway_ip: string;
  dhcp_enabled: boolean;
  dhcp_pool_id?: string;
  
  // Security and access
  security_level: 'low' | 'medium' | 'high' | 'critical';
  isolation_enabled: boolean;
  inter_vlan_routing: boolean;
  internet_access: boolean;
  
  // Traffic management
  bandwidth_limit_mbps?: number;
  traffic_priority: 'low' | 'normal' | 'high' | 'critical';
  qos_profile: string;
  
  // DNS and DHCP
  dns_profile_id?: string;
  custom_dns_servers: string[];
  domain_suffix: string;
  
  // Device restrictions
  max_devices: number;
  device_restrictions: Record<string, any>;
  time_restrictions: Record<string, any>;
  
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface TrafficFlow {
  id: string;
  flow_name: string;
  source_vlan_id?: number;
  destination_type: 'internet' | 'local' | 'vpn' | 'specific_host';
  
  // Routing configuration
  gateway_override?: string;
  route_via: string; // 'wan', 'vpn_germany', 'vpn_turkey', etc.
  load_balancing: boolean;
  failover_enabled: boolean;
  
  // Traffic classification
  traffic_type: 'web' | 'gaming' | 'voip' | 'streaming' | 'iot' | 'admin' | 'backup';
  protocol_filters: string[];
  port_ranges: string[];
  domain_patterns: string[];
  
  // Performance requirements
  max_latency_ms?: number;
  min_bandwidth_mbps?: number;
  jitter_tolerance_ms?: number;
  
  // Policy and security
  priority: number;
  security_inspection: boolean;
  logging_enabled: boolean;
  
  // Status and metrics
  is_active: boolean;
  packet_count: number;
  byte_count: number;
  last_used?: string;
  
  created_at: string;
  updated_at: string;
}

export interface NetworkSegment {
  id: string;
  segment_name: string;
  segment_type: 'dmz' | 'internal' | 'guest' | 'management' | 'storage' | 'lab';
  
  // Network configuration
  network_range: string;
  vlan_ids: number[];
  gateway_device_id?: string;
  
  // Security configuration
  firewall_zone?: string;
  access_control_list: any[];
  security_policies: Record<string, any>;
  
  // Monitoring
  monitoring_enabled: boolean;
  alerting_enabled: boolean;
  backup_enabled: boolean;
  
  // Status
  is_active: boolean;
  device_count: number;
  utilization_percent: number;
  
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface TopologySnapshot {
  id: string;
  snapshot_name: string;
  snapshot_type: 'manual' | 'scheduled' | 'pre_change' | 'post_change';
  
  // Snapshot data
  nodes_data: TopologyNode[];
  connections_data: NetworkConnection[];
  vlans_data: VLANConfiguration[];
  
  // Metadata
  description?: string;
  triggered_by?: string;
  change_reason?: string;
  
  // Statistics
  total_nodes: number;
  total_connections: number;
  total_vlans: number;
  
  created_at: string;
}

export interface NetworkAlertRule {
  id: string;
  rule_name: string;
  rule_type: 'device_offline' | 'high_latency' | 'bandwidth_exceeded' | 'new_device' | 'topology_change';
  
  // Trigger conditions
  trigger_conditions: Record<string, any>;
  threshold_value?: number;
  threshold_unit?: string;
  time_window_minutes: number;
  
  // Target configuration
  apply_to_nodes: string[];
  apply_to_vlans: number[];
  apply_to_segments: string[];
  
  // Actions
  alert_actions: any[];
  notification_channels: string[];
  escalation_rules: Record<string, any>;
  
  // Rule management
  is_active: boolean;
  priority: number;
  cooldown_minutes: number;
  
  // Statistics
  trigger_count: number;
  last_triggered?: string;
  false_positive_count: number;
  
  created_at: string;
  updated_at: string;
}

// Topology visualization types
export interface TopologyPosition {
  x: number;
  y: number;
}

export interface TopologyLayoutConfig {
  width: number;
  height: number;
  nodeSpacing: number;
  levelSpacing: number;
  centerX: number;
  centerY: number;
}

export interface TopologyTheme {
  nodeColors: Record<string, string>;
  connectionColors: Record<string, string>;
  vlanColors: Record<number, string>;
  backgroundPattern: string;
}

// Device templates for quick topology creation
export interface DeviceTemplate {
  id: string;
  name: string;
  node_type: TopologyNode['node_type'];
  device_category: TopologyNode['device_category'];
  default_icon: string;
  default_color: string;
  suggested_vlans: number[];
  default_config: Partial<TopologyNode>;
}

// Network statistics and analytics
export interface TopologyStats {
  total_nodes: number;
  online_nodes: number;
  total_connections: number;
  active_connections: number;
  total_vlans: number;
  active_vlans: number;
  avg_latency: number;
  total_bandwidth: number;
  device_distribution: Record<string, number>;
  vlan_utilization: Array<{
    vlan_id: number;
    vlan_name: string;
    device_count: number;
    utilization_percent: number;
  }>;
}

// Real-time topology updates
export interface TopologyUpdate {
  type: 'node_added' | 'node_removed' | 'node_updated' | 'connection_changed' | 'status_changed';
  node_id?: string;
  connection_id?: string;
  data: any;
  timestamp: string;
}

// Topology search and filtering
export interface TopologyFilter {
  node_types?: TopologyNode['node_type'][];
  vlans?: number[];
  online_only?: boolean;
  segments?: string[];
  search_term?: string;
}

// Auto-discovery results
export interface DiscoveryResult {
  discovered_nodes: TopologyNode[];
  discovered_connections: NetworkConnection[];
  confidence_score: number;
  discovery_method: 'nmap' | 'arp' | 'snmp' | 'lldp';
  scan_duration_ms: number;
}