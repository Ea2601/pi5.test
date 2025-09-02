// Network Configuration Types - Unified Schema
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

export type WANConnectionType = 
  | 'pppoe' 
  | 'dhcp' 
  | 'static' 
  | 'lte_5g' 
  | 'docsis' 
  | 'ont' 
  | 'starlink';

export interface DeviceConfiguration {
  id?: string;
  device_name: string;
  device_role: DeviceRole[];
  management_ip?: string;
  management_vlan: number;
  timezone: string;
  ntp_servers: string[];
  rf_regulatory_domain: string;
  firmware_version?: string;
  auto_firmware_update: boolean;
  logging_enabled: boolean;
  telemetry_enabled: boolean;
  ping_monitoring: boolean;
  port_statistics: boolean;
  ssid_statistics: boolean;
  alert_notifications: boolean;
  router_config?: RouterConfig;
  edge_router_config?: EdgeRouterConfig;
  bridge_config?: BridgeConfig;
  l3_switch_config?: L3SwitchConfig;
  ap_config?: APConfig;
  mesh_config?: MeshConfig;
  modem_config?: ModemConfig;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface RouterConfig {
  nat_enabled: boolean;
  dhcp_server_enabled: boolean;
  dns_mode: 'pihole_unbound' | 'forward_only' | 'authoritative';
  qos_enabled: boolean;
  upnp_enabled: boolean;
  sip_alg_enabled: boolean;
  hairpin_nat: boolean;
  dhcp_pools: any[];
  dhcp_reservations: any[];
  dhcp_options: any[];
  dns_forwarders: string[];
  conditional_forwarding: any[];
  ipv6_enabled: boolean;
  dhcpv6_pd_enabled: boolean;
  ra_enabled: boolean;
  dns64_nat64_enabled: boolean;
  dscp_marking: boolean;
  gaming_acceleration: boolean;
  voip_priority: boolean;
  ddns_enabled: boolean;
  ddns_provider: string;
  ddns_hostname: string;
  cgnat_detection: boolean;
  iptv_enabled: boolean;
  igmp_proxy: boolean;
  igmp_snooping: boolean;
}

export interface EdgeRouterConfig {
  multi_wan_enabled: boolean;
  load_balancing_method: 'round_robin' | 'weighted' | 'failover';
  policy_routing_enabled: boolean;
  pbr_rules: any[];
  dpi_enabled: boolean;
  intrusion_detection: boolean;
  bandwidth_monitoring: boolean;
  bgp_enabled: boolean;
  ospf_enabled: boolean;
  vrf_configs: any[];
  firewall_zones: any[];
  nat_policies: any[];
  qos_profiles: any[];
}

export interface BridgeConfig {
  stp_enabled: boolean;
  rstp_enabled: boolean;
  bridge_priority: number;
  ageing_time: number;
  forward_delay: number;
  hello_time: number;
  max_age: number;
  lacp_enabled: boolean;
  lacp_mode: 'active' | 'passive';
  vlan_filtering: boolean;
  igmp_snooping: boolean;
  port_profiles: any[];
}

export interface L3SwitchConfig {
  inter_vlan_routing: boolean;
  svi_interfaces: any[];
  static_routes: any[];
  acl_rules: any[];
  port_security: boolean;
  dhcp_snooping: boolean;
  arp_inspection: boolean;
  port_mirroring: any[];
  link_aggregation: any[];
}

export interface APConfig {
  radio_2_4ghz_enabled: boolean;
  radio_5ghz_enabled: boolean;
  radio_6ghz_enabled: boolean;
  country_code: string;
  power_management: 'auto' | 'high' | 'medium' | 'low';
  channel_optimization: boolean;
  band_steering: boolean;
  load_balancing: boolean;
  fast_roaming_11r: boolean;
  fast_roaming_11k: boolean;
  fast_roaming_11v: boolean;
  captive_portal: boolean;
  guest_isolation: boolean;
  ssid_configs: any[];
}

export interface MeshConfig {
  mesh_enabled: boolean;
  mesh_id: string;
  mesh_protocol: '802.11s' | 'proprietary';
  backhaul_optimization: boolean;
  self_healing: boolean;
  mesh_nodes: any[];
}

export interface ModemConfig {
  connection_monitoring: boolean;
  auto_reconnect: boolean;
  signal_monitoring: boolean;
  data_usage_tracking: boolean;
  roaming_control: boolean;
  pin_management: boolean;
  sms_notifications: boolean;
}

export interface WANProfile {
  id?: string;
  profile_name: string;
  profile_id: string;
  connection_type: WANConnectionType;
  description?: string;
  pppoe_username?: string;
  pppoe_password?: string;
  static_ip?: string;
  static_gateway?: string;
  static_dns?: string[];
  wan_vlan_tag?: number;
  mtu: number;
  mss_clamp: boolean;
  mac_clone?: string;
  apn?: string;
  pin?: string;
  lte_bands?: string[];
  latency_ms: number;
  bandwidth_mbps: number;
  reliability_score: number;
  is_active: boolean;
  is_default: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface VLANCatalogEntry {
  id?: string;
  vlan_id: number;
  vlan_name: string;
  description: string;
  network_cidr: string;
  gateway_ip: string;
  purpose: string;
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
  created_at?: string;
  updated_at?: string;
}

export interface WiFiSSIDConfig {
  id?: string;
  ssid_name: string;
  vlan_id?: number;
  encryption_type: 'open' | 'wpa2' | 'wpa3' | 'wpa2_enterprise' | 'wpa3_enterprise';
  passphrase?: string;
  frequency_band: '2.4ghz' | '5ghz' | '6ghz' | 'dual_band';
  hide_ssid: boolean;
  client_isolation: boolean;
  captive_portal_enabled: boolean;
  guest_network: boolean;
  bandwidth_limit_mbps?: number;
  max_clients: number;
  schedule_enabled: boolean;
  schedule_config: any;
  is_enabled: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface EgressCatalogEntry {
  id: string;
  name: string;
  egress_type: 'local_internet' | 'wan_profile' | 'wireguard';
  description: string;
  latency_ms: number;
  bandwidth_mbps: number;
  reliability_score: number;
  is_active: boolean;
}

export interface UIConfigForRole {
  show_advanced_networking: boolean;
  show_port_management: boolean;
  show_vlan_config: boolean;
  show_routing_config: boolean;
  show_wireless_config: boolean;
  show_mesh_config: boolean;
  show_security_config: boolean;
  show_monitoring_config: boolean;
  max_vlans: number;
  max_ssids: number;
  max_wan_profiles: number;
}

// Device role presets
export const devicePresets = [
  {
    name: 'Standard Router',
    description: 'Evde kullanım için temel router işlevleri',
    device_role: ['router'] as DeviceRole[],
    use_cases: ['Home network', 'Small office', 'Basic routing'],
    complexity: 'Başlangıç',
    default_config: {
      device_name: 'Pi5-Home-Router',
      management_vlan: 10,
      router_config: {
        nat_enabled: true,
        dhcp_server_enabled: true,
        dns_mode: 'pihole_unbound',
        qos_enabled: true,
        upnp_enabled: true,
        gaming_acceleration: true,
        voip_priority: false,
        ipv6_enabled: false
      }
    }
  },
  {
    name: 'Edge Router',
    description: 'Çoklu WAN, politika bazlı routing, DPI',
    device_role: ['edge_router'] as DeviceRole[],
    use_cases: ['Enterprise network', 'Multi-WAN', 'Policy routing'],
    complexity: 'Gelişmiş',
    default_config: {
      device_name: 'Pi5-Edge-Router',
      management_vlan: 10,
      edge_router_config: {
        multi_wan_enabled: true,
        load_balancing_method: 'weighted',
        policy_routing_enabled: true,
        dpi_enabled: true,
        intrusion_detection: true,
        bgp_enabled: false,
        ospf_enabled: false
      }
    }
  },
  {
    name: 'Wi-Fi Access Point',
    description: 'Çoklu SSID, VLAN eşleştirme, mesh desteği',
    device_role: ['ap'] as DeviceRole[],
    use_cases: ['Wi-Fi coverage', 'Guest networks', 'IoT segregation'],
    complexity: 'Orta',
    default_config: {
      device_name: 'Pi5-Access-Point',
      management_vlan: 10,
      ap_config: {
        radio_2_4ghz_enabled: true,
        radio_5ghz_enabled: true,
        radio_6ghz_enabled: false,
        country_code: 'TR',
        power_management: 'auto',
        channel_optimization: true,
        band_steering: true,
        fast_roaming_11r: true
      }
    }
  },
  {
    name: 'Mesh Controller',
    description: 'Mesh ağ kontrolcüsü, çoklu AP yönetimi',
    device_role: ['mesh_ap'] as DeviceRole[],
    use_cases: ['Large area coverage', 'Seamless roaming', 'Mesh network'],
    complexity: 'Gelişmiş',
    default_config: {
      device_name: 'Pi5-Mesh-Controller',
      management_vlan: 10,
      mesh_config: {
        mesh_enabled: true,
        mesh_protocol: '802.11s',
        backhaul_optimization: true,
        self_healing: true
      }
    }
  },
  {
    name: 'L3 Switch',
    description: 'VLAN arası routing, SVI, ACL kuralları',
    device_role: ['l3_switch'] as DeviceRole[],
    use_cases: ['Inter-VLAN routing', 'Access control', 'Network segmentation'],
    complexity: 'Gelişmiş',
    default_config: {
      device_name: 'Pi5-L3-Switch',
      management_vlan: 10,
      l3_switch_config: {
        inter_vlan_routing: true,
        port_security: true,
        dhcp_snooping: true,
        arp_inspection: true
      }
    }
  },
  {
    name: 'Bridge Mode',
    description: 'Köprü modu, STP/RSTP, port profilleri',
    device_role: ['bridge'] as DeviceRole[],
    use_cases: ['Network bridging', 'VLAN trunking', 'Layer 2 switching'],
    complexity: 'Orta',
    default_config: {
      device_name: 'Pi5-Bridge',
      management_vlan: 10,
      bridge_config: {
        stp_enabled: true,
        rstp_enabled: true,
        vlan_filtering: true,
        igmp_snooping: true
      }
    }
  }
];