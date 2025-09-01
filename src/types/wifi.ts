export interface WiFiAccessPoint {
  id: string;
  ap_name: string;
  description?: string;
  mac_address: string;
  ip_address?: string;
  location?: string;
  vendor: string;
  model?: string;
  firmware_version?: string;
  
  // Physical properties
  max_clients: number;
  supported_bands: ('2.4ghz' | '5ghz' | '6ghz')[];
  max_tx_power: number;
  antenna_count: number;
  
  // Configuration
  management_url?: string;
  snmp_community?: string;
  admin_username?: string;
  
  // Status
  is_online: boolean;
  last_seen?: string;
  cpu_usage: number;
  memory_usage: number;
  temperature: number;
  uptime_seconds: number;
  
  // Mesh configuration
  is_mesh_enabled: boolean;
  mesh_role: 'standalone' | 'controller' | 'node';
  mesh_backhaul_type: 'auto' | 'ethernet' | 'wireless';
  
  created_at: string;
  updated_at: string;
}

export interface WiFiNetwork {
  id: string;
  ap_id: string;
  
  // Basic settings
  ssid: string;
  description?: string;
  vlan_id?: number;
  network_type: 'standard' | 'guest' | 'iot' | 'admin';
  
  // Security settings
  encryption_type: 'open' | 'wep' | 'wpa2' | 'wpa3' | 'wpa2_enterprise' | 'wpa3_enterprise';
  passphrase?: string;
  hide_ssid: boolean;
  mac_filtering_enabled: boolean;
  allowed_macs: string[];
  blocked_macs: string[];
  
  // Network configuration
  frequency_band: '2.4ghz' | '5ghz' | '6ghz';
  channel?: number;
  channel_width: number;
  tx_power: number;
  
  // Advanced features
  band_steering_enabled: boolean;
  fast_roaming_enabled: boolean;
  load_balancing_enabled: boolean;
  captive_portal_enabled: boolean;
  captive_portal_url?: string;
  
  // Access control
  max_clients: number;
  client_isolation: boolean;
  internet_access: boolean;
  local_access: boolean;
  
  // QoS and performance
  qos_enabled: boolean;
  bandwidth_limit_mbps?: number;
  priority_level: number;
  
  // Scheduling
  schedule_enabled: boolean;
  schedule_config: any;
  
  // Status
  is_enabled: boolean;
  client_count: number;
  last_activity?: string;
  
  created_at: string;
  updated_at: string;
}

export interface WiFiClient {
  id: string;
  network_id: string;
  ap_id: string;
  
  // Client identification
  mac_address: string;
  ip_address?: string;
  hostname?: string;
  device_name?: string;
  device_type: string;
  vendor: string;
  
  // Connection details
  connected_ssid: string;
  frequency_band?: '2.4ghz' | '5ghz' | '6ghz';
  channel?: number;
  connection_status: 'connected' | 'disconnected' | 'blocked' | 'idle';
  
  // Signal and performance
  signal_strength_dbm?: number;
  noise_level_dbm?: number;
  snr_db?: number;
  data_rate_mbps?: number;
  
  // Session tracking
  connected_at: string;
  last_seen?: string;
  session_duration?: string;
  disconnection_reason?: string;
  
  // Traffic statistics
  bytes_sent: number;
  bytes_received: number;
  packets_sent: number;
  packets_received: number;
  
  // Security
  authentication_method?: string;
  encryption_used?: string;
  is_authorized: boolean;
  failed_auth_attempts: number;
  
  created_at: string;
  updated_at: string;
}

export interface WiFiSecurityPolicy {
  id: string;
  policy_name: string;
  description?: string;
  policy_type: 'mac_filter' | 'time_restriction' | 'device_limit' | 'bandwidth_limit';
  
  // Target configuration
  apply_to_networks: string[];
  apply_to_vlans: number[];
  apply_to_device_types: string[];
  
  // Policy rules
  conditions: Record<string, any>;
  actions: Record<string, any>;
  
  // Time-based rules
  time_restrictions: Record<string, any>;
  parental_controls: Record<string, any>;
  
  // MAC filtering
  whitelist_macs: string[];
  blacklist_macs: string[];
  auto_whitelist_known_devices: boolean;
  
  // Rate limiting
  bandwidth_limit_mbps?: number;
  connection_time_limit?: number;
  daily_data_limit_mb?: number;
  
  // Captive portal
  captive_portal_config: Record<string, any>;
  
  // Status and metrics
  is_active: boolean;
  priority: number;
  violation_count: number;
  last_violation?: string;
  
  created_at: string;
  updated_at: string;
}

export interface WiFiPerformanceLog {
  id: string;
  ap_id: string;
  network_id?: string;
  
  // Performance metrics
  client_count: number;
  total_bandwidth_mbps: number;
  average_signal_strength?: number;
  channel_utilization_percent?: number;
  noise_floor_dbm?: number;
  
  // Traffic statistics
  total_bytes_sent: number;
  total_bytes_received: number;
  packets_per_second: number;
  retransmission_rate_percent: number;
  
  // Quality metrics
  average_data_rate_mbps?: number;
  connection_success_rate: number;
  roaming_success_rate: number;
  
  // Channel analysis
  channel_interference_level?: number;
  neighboring_aps_count: number;
  channel_recommendation?: number;
  
  timestamp: string;
}

export interface WiFiMeshNode {
  id: string;
  parent_ap_id: string;
  child_ap_id: string;
  
  // Mesh relationship
  hop_count: number;
  backhaul_type: 'wireless' | 'ethernet';
  backhaul_frequency?: '2.4ghz' | '5ghz' | '6ghz';
  backhaul_channel?: number;
  
  // Connection quality
  link_quality_percent: number;
  signal_strength_dbm?: number;
  bandwidth_mbps: number;
  latency_ms: number;
  
  // Status
  is_active: boolean;
  last_seen?: string;
  
  created_at: string;
  updated_at: string;
}

export interface WiFiSchedule {
  id: string;
  network_id: string;
  schedule_name: string;
  description?: string;
  
  // Schedule configuration
  schedule_type: 'daily' | 'weekly' | 'custom';
  enabled_days: number[];
  start_time: string;
  end_time: string;
  timezone: string;
  
  // Actions
  action_type: 'enable_disable' | 'bandwidth_limit' | 'client_limit';
  action_config: Record<string, any>;
  
  // Status
  is_active: boolean;
  last_executed?: string;
  next_execution?: string;
  
  created_at: string;
  updated_at: string;
}

export interface WiFiChannelAnalysis {
  id: string;
  ap_id: string;
  
  // Frequency band analysis
  frequency_band: '2.4ghz' | '5ghz' | '6ghz';
  channel: number;
  channel_width: number;
  
  // Interference analysis
  noise_floor_dbm?: number;
  interference_level?: number;
  neighboring_aps: any[];
  channel_utilization_percent?: number;
  
  // Recommendation
  recommended_channel?: number;
  recommendation_reason?: string;
  optimization_score?: number;
  
  // Scan metadata
  scan_duration_ms?: number;
  scan_method: 'active' | 'passive';
  
  timestamp: string;
}

export interface WiFiStats {
  total_access_points: number;
  online_access_points: number;
  total_networks: number;
  active_networks: number;
  total_clients: number;
  connected_clients: number;
  total_bandwidth_mbps: number;
  average_signal_strength: number;
  channel_utilization: Array<{
    band: string;
    channel: number;
    utilization_percent: number;
    ap_count: number;
  }>;
  client_distribution: Array<{
    network_type: string;
    ssid: string;
    client_count: number;
    bandwidth_mbps: number;
  }>;
}

// Wi-Fi preset configurations
export interface WiFiNetworkPreset {
  name: string;
  description: string;
  vlan_id: number;
  network_type: 'standard' | 'guest' | 'iot' | 'admin';
  encryption_type: WiFiNetwork['encryption_type'];
  frequency_band: WiFiNetwork['frequency_band'];
  security_level: 'low' | 'medium' | 'high' | 'critical';
  default_config: Partial<WiFiNetwork>;
}

export const wifiNetworkPresets: WiFiNetworkPreset[] = [
  {
    name: 'Admin Network',
    description: 'Yönetim cihazları için güvenli ağ',
    vlan_id: 10,
    network_type: 'admin',
    encryption_type: 'wpa3',
    frequency_band: '5ghz',
    security_level: 'critical',
    default_config: {
      mac_filtering_enabled: true,
      client_isolation: false,
      qos_enabled: true,
      priority_level: 90
    }
  },
  {
    name: 'Home Network',
    description: 'Ana ev ağı - güvenilir cihazlar',
    vlan_id: 20,
    network_type: 'standard',
    encryption_type: 'wpa3',
    frequency_band: '5ghz',
    security_level: 'high',
    default_config: {
      band_steering_enabled: true,
      fast_roaming_enabled: true,
      qos_enabled: true,
      priority_level: 70
    }
  },
  {
    name: 'IoT Network',
    description: 'IoT cihazları için izole ağ',
    vlan_id: 30,
    network_type: 'iot',
    encryption_type: 'wpa2',
    frequency_band: '2.4ghz',
    security_level: 'medium',
    default_config: {
      client_isolation: true,
      local_access: false,
      internet_access: true,
      bandwidth_limit_mbps: 50
    }
  },
  {
    name: 'Guest Network',
    description: 'Misafir ağı - internet only',
    vlan_id: 40,
    network_type: 'guest',
    encryption_type: 'wpa2',
    frequency_band: '2.4ghz',
    security_level: 'low',
    default_config: {
      client_isolation: true,
      local_access: false,
      internet_access: true,
      captive_portal_enabled: true,
      bandwidth_limit_mbps: 30
    }
  },
  {
    name: 'Gaming Network',
    description: 'Gaming cihazları - düşük gecikme',
    vlan_id: 50,
    network_type: 'standard',
    encryption_type: 'wpa3',
    frequency_band: '5ghz',
    security_level: 'high',
    default_config: {
      qos_enabled: true,
      priority_level: 95,
      fast_roaming_enabled: true,
      channel_width: 160
    }
  },
  {
    name: 'VoIP/Work Network',
    description: 'VoIP ve iş cihazları',
    vlan_id: 60,
    network_type: 'standard',
    encryption_type: 'wpa3',
    frequency_band: '5ghz',
    security_level: 'high',
    default_config: {
      qos_enabled: true,
      priority_level: 85,
      bandwidth_limit_mbps: 100
    }
  }
];