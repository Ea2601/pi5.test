// Network Device Configuration Types

export interface DeviceConfiguration {
  id: string;
  device_name: string;
  device_role: DeviceRole[];
  
  // Management
  management_ip?: string;
  management_vlan: number;
  
  // System
  timezone: string;
  ntp_servers: string[];
  rf_regulatory_domain: string;
  firmware_version?: string;
  auto_firmware_update: boolean;
  
  // Logging and Telemetry
  logging_enabled: boolean;
  telemetry_enabled: boolean;
  ping_monitoring: boolean;
  port_statistics: boolean;
  ssid_statistics: boolean;
  alert_notifications: boolean;
  
  // Role-specific configurations
  router_config: RouterConfig;
  edge_router_config: EdgeRouterConfig;
  bridge_config: BridgeConfig;
  l3_switch_config: L3SwitchConfig;
  ap_config: AccessPointConfig;
  mesh_config: MeshConfig;
  modem_config: ModemConfig;
  
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type DeviceRole = 
  | 'router' 
  | 'edge_router' 
  | 'bridge' 
  | 'l3_switch' 
  | 'ap' 
  | 'mesh_ap' 
  | 'repeater' 
  | 'cpe_client' 
  | 'modem';

export interface RouterConfig {
  // WAN Configuration
  wan_profile_id?: string;
  
  // NAT Configuration
  nat_enabled: boolean;
  hairpin_nat: boolean;
  upnp_enabled: boolean;
  sip_alg_enabled: boolean;
  
  // DHCP Server
  dhcp_server_enabled: boolean;
  dhcp_pools: DHCPPoolConfig[];
  dhcp_reservations: DHCPReservationConfig[];
  dhcp_options: DHCPOptionConfig[];
  
  // DNS Configuration
  dns_mode: 'pihole_unbound' | 'forwarding' | 'custom';
  dns_forwarders: string[];
  conditional_forwarding: ConditionalForwarding[];
  
  // IPv6 Configuration
  ipv6_enabled: boolean;
  dhcpv6_pd_enabled: boolean;
  ra_enabled: boolean;
  dns64_nat64_enabled: boolean;
  
  // QoS/WMM
  qos_enabled: boolean;
  dscp_marking: boolean;
  gaming_acceleration: boolean;
  voip_priority: boolean;
  
  // DDNS
  ddns_enabled: boolean;
  ddns_provider: string;
  ddns_hostname: string;
  
  // Special Features
  cgnat_detection: boolean;
  iptv_enabled: boolean;
  igmp_proxy: boolean;
  igmp_snooping: boolean;
}

export interface EdgeRouterConfig extends RouterConfig {
  // Multi-WAN & Failover
  multi_wan_enabled: boolean;
  wan_profiles: string[];
  load_balancing_method: 'round_robin' | 'weighted' | 'failover';
  wan_weights: Record<string, number>;
  
  // Advanced Routing
  pbr_enabled: boolean;
  vrf_enabled: boolean;
  bgp_enabled: boolean;
  ospf_enabled: boolean;
  
  // DPI & Application Control
  dpi_enabled: boolean;
  application_control: boolean;
  sni_inspection: boolean;
  
  // WireGuard Integration
  wireguard_egress_enabled: boolean;
  wireguard_profiles: WireGuardEgressProfile[];
  
  // Traffic Engineering
  traffic_policies: TrafficPolicyConfig[];
  default_egress: string;
}

export interface BridgeConfig {
  // Port Configuration
  port_profiles: PortProfile[];
  
  // Spanning Tree
  stp_enabled: boolean;
  stp_mode: 'stp' | 'rstp' | 'mstp';
  stp_priority: number;
  
  // Link Aggregation
  lacp_enabled: boolean;
  lacp_groups: LACPGroup[];
  
  // Storm Control
  storm_control_enabled: boolean;
  broadcast_threshold: number;
  multicast_threshold: number;
  
  // Port Security
  port_security_enabled: boolean;
  mac_learning_limit: number;
  
  // IGMP Snooping
  igmp_snooping_enabled: boolean;
  igmp_querier: boolean;
  
  // DHCP Relay
  dhcp_relay_enabled: boolean;
  dhcp_relay_servers: string[];
}

export interface L3SwitchConfig extends BridgeConfig {
  // Switch Virtual Interfaces
  svi_configs: SVIConfig[];
  
  // Inter-VLAN Routing
  inter_vlan_routing: boolean;
  routing_protocols: ('static' | 'ospf' | 'bgp')[];
  
  // Access Control Lists
  acl_enabled: boolean;
  acl_rules: ACLRule[];
  
  // Policy-Based Routing
  pbr_enabled: boolean;
  pbr_rules: PBRRule[];
}

export interface AccessPointConfig {
  // Radio Configuration
  radio_2_4ghz_enabled: boolean;
  radio_5ghz_enabled: boolean;
  radio_6ghz_enabled: boolean;
  
  // Multi-SSID Configuration
  ssid_configs: SSIDConfig[];
  max_ssids_per_radio: number;
  
  // 802.11 Features
  roaming_features: {
    dot11r_enabled: boolean; // Fast Roaming
    dot11k_enabled: boolean; // Neighbor Reports
    dot11v_enabled: boolean; // BSS Transition
  };
  
  // Band Management
  band_steering_enabled: boolean;
  band_steering_rssi_threshold: number;
  
  // Power Management
  dynamic_power_control: boolean;
  coverage_optimization: boolean;
  
  // Client Management
  client_limit_per_ssid: number;
  client_isolation_default: boolean;
  
  // Enterprise Features
  radius_authentication: boolean;
  radius_servers: RadiusServer[];
  
  // Captive Portal
  captive_portal_templates: CaptivePortalTemplate[];
}

export interface MeshConfig extends AccessPointConfig {
  // Mesh Networking
  mesh_enabled: boolean;
  mesh_id: string;
  mesh_password: string;
  mesh_role: 'controller' | 'node' | 'repeater';
  
  // Backhaul Configuration
  backhaul_preference: 'auto' | 'ethernet' | 'wireless';
  backhaul_band: '5ghz' | '6ghz';
  backhaul_channel: number;
  
  // Mesh Optimization
  path_selection_metric: 'airtime' | 'hop_count' | 'rssi';
  mesh_ttl: number;
  auto_channel_selection: boolean;
  
  // Load Balancing
  client_steering: boolean;
  load_balancing: boolean;
  
  // Repeater Settings (for range extenders)
  repeater_ssid_suffix: string;
  signal_threshold_dbm: number;
  uplink_selection: 'auto' | 'manual';
  
  // CPE Client Settings (for connecting to upstream)
  upstream_ssid: string;
  upstream_passphrase: string;
  upstream_security: string;
  bridge_mode: boolean;
}

export interface ModemConfig {
  // Modem Type
  modem_type: 'ont' | 'dsl' | 'docsis' | 'lte_5g' | 'starlink' | 'satellite';
  
  // Connection Settings
  connection_mode: 'bridge' | 'router' | 'hybrid';
  
  // ONT/Fiber Configuration
  ont_vlan_tag?: number;
  ont_priority?: number;
  ont_auth_method?: 'none' | '802.1x' | 'pppoe';
  
  // DSL Configuration
  dsl_mode?: 'adsl' | 'vdsl' | 'adsl2+' | 'vdsl2';
  dsl_profile?: string;
  
  // DOCSIS Configuration
  docsis_version?: '3.0' | '3.1' | '4.0';
  channel_bonding?: boolean;
  
  // LTE/5G Configuration
  carrier?: string;
  apn?: string;
  pin?: string;
  preferred_bands?: string[];
  carrier_aggregation?: boolean;
  
  // Starlink Configuration
  stow_enabled?: boolean;
  sleep_schedule?: boolean;
  
  // Integration Settings
  expose_as_wan_interface: boolean;
  bridge_to_main_router: boolean;
  
  // Monitoring
  signal_monitoring: boolean;
  data_usage_monitoring: boolean;
  connection_quality_alerts: boolean;
}

// Supporting Interface Types
export interface WAN Profile {
  id: string;
  profile_name: string;
  profile_id: string; // wan::fiber_pppoe, wan::lte1, etc.
  connection_type: 'pppoe' | 'dhcp' | 'static' | 'lte_5g' | 'docsis' | 'ont' | 'starlink';
  description?: string;
  
  // Connection Settings
  pppoe_username?: string;
  pppoe_password?: string;
  static_ip?: string;
  static_gateway?: string;
  static_dns?: string[];
  wan_vlan_tag?: number;
  mtu: number;
  mss_clamp: boolean;
  mac_clone?: string;
  
  // LTE Settings
  apn?: string;
  pin?: string;
  lte_bands?: string[];
  
  // Performance
  latency_ms: number;
  bandwidth_mbps: number;
  reliability_score: number;
  
  is_active: boolean;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface VLANCatalogEntry {
  id: string;
  vlan_id: number;
  vlan_name: string;
  description: string;
  network_cidr: string;
  gateway_ip: string;
  purpose: 'admin' | 'trusted' | 'iot' | 'guest' | 'gaming' | 'voip' | 'security' | 'kids' | 'media' | 'lab';
  security_level: 'low' | 'medium' | 'high' | 'critical';
  traffic_priority: 'low' | 'normal' | 'high' | 'critical';
  isolation_enabled: boolean;
  inter_vlan_routing: boolean;
  internet_access: boolean;
  dhcp_enabled: boolean;
  dhcp_start_ip?: string;
  dhcp_end_ip?: string;
  dhcp_lease_time: string;
  custom_dns_servers?: string[];
  bandwidth_limit_mbps?: number;
  max_devices: number;
  color_code: string;
  is_standard: boolean;
  created_at: string;
  updated_at: string;
}

export interface DHCPPoolConfig {
  vlan_id: number;
  start_ip: string;
  end_ip: string;
  lease_time: string;
  enabled: boolean;
}

export interface DHCPReservationConfig {
  mac_address: string;
  ip_address: string;
  hostname: string;
  description?: string;
}

export interface DHCPOptionConfig {
  option_code: number;
  option_value: string;
  apply_to_vlans: number[];
}

export interface ConditionalForwarding {
  domain: string;
  forwarder: string;
  description?: string;
}

export interface WireGuardEgressProfile {
  profile_id: string; // wg::de_vps, wg::tr_vps
  connection_name: string;
  server_id: string;
  endpoint: string;
  public_key: string;
  allowed_ips: string[];
  latency_ms: number;
  bandwidth_mbps: number;
  is_active: boolean;
}

export interface TrafficPolicyConfig {
  name: string;
  client_groups: string[];
  traffic_matchers: string[];
  egress_point: string;
  dns_policy?: string;
  priority: number;
}

export interface PortProfile {
  port_number: number;
  profile_type: 'access' | 'trunk';
  native_vlan: number;
  allowed_vlans: number[];
  description?: string;
}

export interface LACPGroup {
  group_id: number;
  ports: number[];
  mode: 'active' | 'passive';
  load_balancing: 'src_mac' | 'dst_mac' | 'src_dst_mac' | 'src_ip' | 'dst_ip' | 'src_dst_ip';
}

export interface SVIConfig {
  vlan_id: number;
  ip_address: string;
  subnet_mask: string;
  description: string;
  enabled: boolean;
}

export interface ACLRule {
  rule_number: number;
  action: 'permit' | 'deny';
  protocol: string;
  source_network: string;
  destination_network: string;
  ports?: string;
  description?: string;
}

export interface PBRRule {
  rule_number: number;
  match_criteria: {
    source_network?: string;
    destination_network?: string;
    protocol?: string;
    ports?: string;
  };
  action: {
    next_hop?: string;
    interface?: string;
    vrf?: string;
  };
  description?: string;
}

export interface SSIDConfig {
  ssid_name: string;
  vlan_id: number;
  encryption_type: 'open' | 'wpa2' | 'wpa3' | 'wpa2_enterprise' | 'wpa3_enterprise';
  passphrase?: string;
  frequency_band: '2.4ghz' | '5ghz' | '6ghz' | 'dual_band';
  enabled: boolean;
}

export interface RadiusServer {
  server_ip: string;
  port: number;
  shared_secret: string;
  timeout: number;
  retries: number;
}

export interface CaptivePortalTemplate {
  template_name: string;
  html_content: string;
  terms_of_use?: string;
  data_retention_hours: number;
}

// UI Configuration Types
export interface NetworkSettingsUIConfig {
  device_role: DeviceRole[];
  visible_features: {
    wan_configuration: boolean;
    dhcp_server: boolean;
    nat_configuration: boolean;
    port_forwarding: boolean;
    multi_wan: boolean;
    bgp_ospf: boolean;
    dpi_features: boolean;
    svi_configuration: boolean;
    acl_management: boolean;
    ssid_management: boolean;
    mesh_features: boolean;
    modem_configuration: boolean;
  };
  available_egress_points: EgressPoint[];
  vlan_catalog: VLANCatalogEntry[];
}

export interface EgressPoint {
  id: string;
  profile_id: string; // local_internet, wan::fiber_pppoe, wg::de_vps
  name: string;
  type: 'local_internet' | 'wan_profile' | 'wireguard';
  description: string;
  latency_ms: number;
  bandwidth_mbps: number;
  reliability_score: number;
  is_active: boolean;
  is_default: boolean;
}

// Configuration Validation Types
export interface ConfigurationValidation {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  field: string;
  message: string;
  severity: 'error' | 'warning';
}

export interface ValidationWarning {
  field: string;
  message: string;
  recommendation?: string;
}

// Preset Configuration Templates
export interface DevicePreset {
  name: string;
  description: string;
  device_role: DeviceRole[];
  default_config: Partial<DeviceConfiguration>;
  recommended_vlans: number[];
  required_features: string[];
}

export const devicePresets: DevicePreset[] = [
  {
    name: 'Home Router + Wi-Fi',
    description: 'Ev kullanımı için router ve access point kombinasyonu',
    device_role: ['router', 'ap'],
    default_config: {
      device_name: 'Pi5-Home-Router',
      management_vlan: 10,
      router_config: {
        nat_enabled: true,
        dhcp_server_enabled: true,
        dns_mode: 'pihole_unbound',
        qos_enabled: true,
        upnp_enabled: false,
        sip_alg_enabled: false
      } as RouterConfig
    },
    recommended_vlans: [10, 20, 30, 40, 50],
    required_features: ['WAN Configuration', 'DHCP Server', 'Wi-Fi Management']
  },
  {
    name: 'Enterprise Edge Router',
    description: 'Kurumsal ağ için gelişmiş yönlendirme özellikleri',
    device_role: ['edge_router'],
    default_config: {
      device_name: 'Pi5-Edge-Router',
      management_vlan: 10,
      edge_router_config: {
        multi_wan_enabled: true,
        pbr_enabled: true,
        dpi_enabled: true,
        wireguard_egress_enabled: true
      } as EdgeRouterConfig
    },
    recommended_vlans: [10, 20, 30, 40, 50, 60, 70, 100],
    required_features: ['Multi-WAN', 'Policy Routing', 'DPI', 'VPN Management']
  },
  {
    name: 'L2 Bridge/Switch',
    description: 'Katman 2 köprüleme ve VLAN yönetimi',
    device_role: ['bridge'],
    default_config: {
      device_name: 'Pi5-L2-Bridge',
      management_vlan: 10,
      bridge_config: {
        stp_enabled: true,
        stp_mode: 'rstp',
        igmp_snooping_enabled: true,
        dhcp_relay_enabled: true
      } as BridgeConfig
    },
    recommended_vlans: [10, 20, 30, 40],
    required_features: ['VLAN Management', 'STP', 'IGMP Snooping']
  },
  {
    name: 'Wi-Fi Access Point',
    description: 'Sadece Wi-Fi erişim noktası',
    device_role: ['ap'],
    default_config: {
      device_name: 'Pi5-Access-Point',
      management_vlan: 10,
      ap_config: {
        radio_2_4ghz_enabled: true,
        radio_5ghz_enabled: true,
        band_steering_enabled: true,
        roaming_features: {
          dot11r_enabled: true,
          dot11k_enabled: true,
          dot11v_enabled: true
        }
      } as AccessPointConfig
    },
    recommended_vlans: [10, 20, 40],
    required_features: ['Multi-SSID', 'Fast Roaming', 'Band Steering']
  }
];

// Network Settings State Management
export interface NetworkSettingsState {
  current_config: DeviceConfiguration | null;
  selected_preset: DevicePreset | null;
  ui_config: NetworkSettingsUIConfig;
  validation_result: ConfigurationValidation | null;
  is_loading: boolean;
  is_saving: boolean;
}