// Speed Test System Types

export interface SpeedTestProfile {
  id: string;
  profile_name: string;
  description?: string;
  profile_type: 'fast' | 'balanced' | 'deep_analysis';
  
  // Test engine configuration
  preferred_engine: 'ookla' | 'iperf3' | 'flent' | 'irtt';
  parallel_threads: number;
  test_duration_seconds: number;
  warmup_seconds: number;
  
  // Network configuration
  default_interface: string;
  ip_version: 'ipv4' | 'ipv6' | 'dual_stack';
  mss_override?: number;
  mtu_discovery: boolean;
  
  // Measurement settings
  sampling_method: 'minimum' | 'average' | 'p90' | 'p95' | 'p99';
  exclude_first_seconds: number;
  latency_under_load: boolean;
  qos_dscp_marking: boolean;
  
  // Performance thresholds
  min_download_mbps?: number;
  min_upload_mbps?: number;
  max_latency_ms?: number;
  max_jitter_ms?: number;
  max_packet_loss_percent?: number;
  
  is_default: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SpeedTestServer {
  id: string;
  server_name: string;
  server_url: string;
  server_type: 'ookla' | 'iperf3' | 'custom';
  
  // Geographic information
  country_code: string;
  city?: string;
  asn?: number;
  sponsor?: string;
  
  // Performance metrics
  avg_latency_ms: number;
  reliability_score: number;
  last_tested?: string;
  
  // Configuration
  port: number;
  protocol: string;
  auth_token?: string;
  preshared_key?: string;
  
  // Filtering and selection
  is_preferred: boolean;
  is_whitelisted: boolean;
  is_blacklisted: boolean;
  priority_score: number;
  
  created_at: string;
  updated_at: string;
}

export interface SpeedTestResult {
  id: string;
  profile_id?: string;
  server_id?: string;
  
  // Test metadata
  test_engine: 'ookla' | 'iperf3' | 'flent' | 'irtt';
  interface_used: string;
  ip_version: string;
  test_duration_seconds?: number;
  
  // Performance results
  download_mbps?: number;
  upload_mbps?: number;
  ping_ms?: number;
  jitter_ms?: number;
  packet_loss_percent?: number;
  
  // Advanced metrics
  idle_ping_ms?: number;
  loaded_ping_ms?: number;
  bufferbloat_score?: string; // A, B, C, D, F
  mos_score?: number; // Mean Opinion Score for VoIP
  
  // Network details
  server_info?: Record<string, any>;
  network_interface_info?: Record<string, any>;
  tcp_info?: Record<string, any>;
  error_details?: string;
  
  // Quality metrics
  download_consistency?: number;
  upload_consistency?: number;
  retransmission_rate?: number;
  
  // Test context
  vlan_id?: number;
  vpn_tunnel?: string;
  traffic_policy?: string;
  concurrent_users?: number;
  cpu_usage_percent?: number;
  
  success: boolean;
  test_started_at: string;
  test_completed_at?: string;
  created_at: string;
}

export interface DNSPingMonitor {
  id: string;
  monitor_name: string;
  target_type: 'dns_server' | 'custom_host';
  
  // Target configuration
  target_ip: string;
  target_hostname?: string;
  target_description?: string;
  
  // Ping configuration
  interval_ms: number;
  packet_size_bytes: number;
  timeout_ms: number;
  packet_count: number;
  
  // Thresholds
  warning_rtt_ms: number;
  critical_rtt_ms: number;
  warning_jitter_ms: number;
  critical_jitter_ms: number;
  warning_loss_percent: number;
  critical_loss_percent: number;
  
  // Status
  is_active: boolean;
  last_ping_at?: string;
  last_rtt_ms?: number;
  last_status: string;
  
  created_at: string;
  updated_at: string;
}

export interface DNSPingResult {
  id: string;
  monitor_id: string;
  
  // Ping results
  rtt_ms?: number;
  packet_loss_percent?: number;
  jitter_ms?: number;
  packets_sent: number;
  packets_received: number;
  
  // Additional metrics
  min_rtt_ms?: number;
  max_rtt_ms?: number;
  avg_rtt_ms?: number;
  stddev_rtt_ms?: number;
  
  timestamp: string;
}

export interface NetworkInterface {
  id: string;
  interface_name: string;
  interface_type: 'ethernet' | 'wifi' | 'vpn' | 'vlan' | 'loopback';
  description?: string;
  
  // Interface properties
  mac_address?: string;
  ip_address?: string;
  netmask?: string;
  gateway_ip?: string;
  mtu: number;
  
  // Status
  is_up: boolean;
  is_running: boolean;
  speed_mbps?: number;
  duplex_mode?: 'full' | 'half' | 'auto';
  
  // Statistics
  rx_bytes: number;
  tx_bytes: number;
  rx_packets: number;
  tx_packets: number;
  rx_errors: number;
  tx_errors: number;
  
  // VLAN information
  parent_interface?: string;
  vlan_id?: number;
  
  // VPN information
  vpn_type?: 'wireguard' | 'openvpn';
  tunnel_endpoint?: string;
  
  is_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface SpeedTestSchedule {
  id: string;
  schedule_name: string;
  description?: string;
  profile_id?: string;
  
  // Schedule configuration
  schedule_type: 'interval' | 'cron' | 'manual';
  interval_minutes?: number;
  cron_expression?: string;
  timezone: string;
  
  // Execution settings
  random_delay_minutes: number;
  max_execution_time_minutes: number;
  
  // Conditions
  cpu_threshold_percent: number;
  active_voip_check: boolean;
  active_gaming_check: boolean;
  disk_io_threshold: number;
  
  // Status
  is_active: boolean;
  last_execution?: string;
  next_execution?: string;
  execution_count: number;
  failure_count: number;
  
  created_at: string;
  updated_at: string;
}

export interface SpeedTestAlert {
  id: string;
  alert_name: string;
  description?: string;
  
  // Alert conditions
  metric_type: 'download' | 'upload' | 'ping' | 'jitter' | 'packet_loss' | 'bufferbloat';
  threshold_value: number;
  comparison_operator: 'less_than' | 'greater_than' | 'equals';
  consecutive_failures: number;
  
  // Notification settings
  notification_channels: string[];
  webhook_url?: string;
  telegram_chat_id?: string;
  email_recipients?: string[];
  
  // Auto-actions
  auto_actions: Record<string, any>;
  
  // Status
  is_active: boolean;
  trigger_count: number;
  last_triggered?: string;
  
  created_at: string;
  updated_at: string;
}

export interface SpeedTestStats {
  total_tests: number;
  successful_tests: number;
  failed_tests: number;
  avg_download_mbps: number;
  avg_upload_mbps: number;
  avg_ping_ms: number;
  last_test_date?: string;
  popular_servers: Array<{
    server_name: string;
    test_count: number;
    avg_download: number;
  }>;
  performance_trends: Array<{
    date: string;
    download_mbps: number;
    upload_mbps: number;
    ping_ms: number;
  }>;
}

// Test execution configuration
export interface SpeedTestConfig {
  profile: SpeedTestProfile;
  server?: SpeedTestServer;
  interface?: string;
  ip_version?: 'ipv4' | 'ipv6' | 'dual_stack';
  custom_settings?: Record<string, any>;
}

// Real-time test progress
export interface SpeedTestProgress {
  test_id: string;
  status: 'initializing' | 'running' | 'completed' | 'failed';
  progress_percent: number;
  current_phase: 'latency' | 'download' | 'upload' | 'finished';
  elapsed_seconds: number;
  current_download_mbps?: number;
  current_upload_mbps?: number;
  current_ping_ms?: number;
  error_message?: string;
}

// Speed test comparison
export interface SpeedTestComparison {
  before: SpeedTestResult;
  after: SpeedTestResult;
  improvements: {
    download_change_percent: number;
    upload_change_percent: number;
    ping_change_percent: number;
    overall_score_change: number;
  };
}

// Bufferbloat analysis
export interface BufferbloatAnalysis {
  score: 'A' | 'B' | 'C' | 'D' | 'F';
  idle_ping_ms: number;
  loaded_ping_ms: number;
  bloat_ms: number;
  recommendation: string;
  qoe_impact: 'none' | 'low' | 'medium' | 'high' | 'severe';
}

// Network quality assessment
export interface NetworkQualityAssessment {
  overall_score: number; // 0-100
  download_score: number;
  upload_score: number;
  latency_score: number;
  consistency_score: number;
  
  use_cases: {
    web_browsing: 'excellent' | 'good' | 'fair' | 'poor';
    video_streaming: 'excellent' | 'good' | 'fair' | 'poor';
    gaming: 'excellent' | 'good' | 'fair' | 'poor';
    voip: 'excellent' | 'good' | 'fair' | 'poor';
    video_conferencing: 'excellent' | 'good' | 'fair' | 'poor';
  };
  
  recommendations: string[];
}

// Wi-Fi Types (imported from wifi.ts to avoid duplication)
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
  max_clients: number;
  supported_bands: ('2.4ghz' | '5ghz' | '6ghz')[];
  max_tx_power: number;
  antenna_count: number;
  management_url?: string;
  snmp_community?: string;
  admin_username?: string;
  is_online: boolean;
  last_seen?: string;
  cpu_usage: number;
  memory_usage: number;
  temperature: number;
  uptime_seconds: number;
  is_mesh_enabled: boolean;
  mesh_role: 'standalone' | 'controller' | 'node';
  mesh_backhaul_type: 'auto' | 'ethernet' | 'wireless';
  created_at: string;
  updated_at: string;
}

export interface WiFiNetwork {
  id: string;
  ap_id: string;
  ssid: string;
  description?: string;
  vlan_id?: number;
  network_type: 'standard' | 'guest' | 'iot' | 'admin';
  encryption_type: 'open' | 'wep' | 'wpa2' | 'wpa3' | 'wpa2_enterprise' | 'wpa3_enterprise';
  passphrase?: string;
  hide_ssid: boolean;
  mac_filtering_enabled: boolean;
  allowed_macs: string[];
  blocked_macs: string[];
  frequency_band: '2.4ghz' | '5ghz' | '6ghz';
  channel?: number;
  channel_width: number;
  tx_power: number;
  band_steering_enabled: boolean;
  fast_roaming_enabled: boolean;
  load_balancing_enabled: boolean;
  captive_portal_enabled: boolean;
  captive_portal_url?: string;
  max_clients: number;
  client_isolation: boolean;
  internet_access: boolean;
  local_access: boolean;
  qos_enabled: boolean;
  bandwidth_limit_mbps?: number;
  priority_level: number;
  schedule_enabled: boolean;
  schedule_config: any;
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
  mac_address: string;
  ip_address?: string;
  hostname?: string;
  device_name?: string;
  device_type: string;
  vendor: string;
  connected_ssid: string;
  frequency_band?: '2.4ghz' | '5ghz' | '6ghz';
  channel?: number;
  connection_status: 'connected' | 'disconnected' | 'blocked' | 'idle';
  signal_strength_dbm?: number;
  noise_level_dbm?: number;
  snr_db?: number;
  data_rate_mbps?: number;
  connected_at: string;
  last_seen?: string;
  session_duration?: string;
  disconnection_reason?: string;
  bytes_sent: number;
  bytes_received: number;
  packets_sent: number;
  packets_received: number;
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
  apply_to_networks: string[];
  apply_to_vlans: number[];
  apply_to_device_types: string[];
  conditions: Record<string, any>;
  actions: Record<string, any>;
  time_restrictions: Record<string, any>;
  parental_controls: Record<string, any>;
  whitelist_macs: string[];
  blacklist_macs: string[];
  auto_whitelist_known_devices: boolean;
  bandwidth_limit_mbps?: number;
  connection_time_limit?: number;
  daily_data_limit_mb?: number;
  captive_portal_config: Record<string, any>;
  is_active: boolean;
  priority: number;
  violation_count: number;
  last_violation?: string;
  created_at: string;
  updated_at: string;
}