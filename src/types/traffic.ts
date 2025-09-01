// Enhanced Traffic Rules System Types

export interface TrafficMatcher {
  id: string;
  name: string;
  description?: string;
  
  // Protocol matching
  protocols: ('tcp' | 'udp' | 'http' | 'https' | 'sip' | 'rtp' | 'stun' | 'quic')[];
  
  // Application matching
  applications: ('whatsapp' | 'telegram' | 'facetime' | 'zoom' | 'edge' | 'chrome' | 'psn' | 'xbox' | 'steam' | 'netflix' | 'youtube')[];
  
  // Port matching
  ports: string[]; // ["443", "3478-3480", "27015-27050"]
  
  // Domain matching
  domains: string[]; // ["login.live.com", "*.voip.example"]
  
  // Additional filters
  source_ips?: string[];
  destination_ips?: string[];
  packet_size_range?: { min: number; max: number };
  
  created_at: string;
  updated_at: string;
}

export interface ClientGroup {
  id: string;
  name: string;
  type: 'vlan' | 'wireguard' | 'custom';
  
  // VLAN based groups
  vlan_id?: number; // 10=Admin, 20=Trusted, 30=IoT, 40=Guest, 50=Gaming, 60=VoIP/Work, 100=Lab/Test
  
  // WireGuard based groups
  wg_client_ids?: string[]; // Dynamic WG client list
  
  // Custom groups
  mac_addresses?: string[];
  ip_ranges?: string[];
  
  description?: string;
  member_count: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DNSPolicy {
  id: string;
  name: string;
  policy_type: 'pihole_unbound' | 'bypass' | 'custom' | 'default';
  
  // Pi-hole + Unbound configuration
  pihole_enabled?: boolean;
  unbound_enabled?: boolean;
  ad_blocking?: boolean;
  malware_blocking?: boolean;
  logging_enabled?: boolean;
  
  // Custom DNS resolvers
  custom_resolvers?: string[]; // ["8.8.8.8", "1.1.1.1"]
  doh_enabled?: boolean;
  dot_enabled?: boolean;
  doh_url?: string;
  dot_hostname?: string;
  
  // Bypass configuration
  use_egress_dns?: boolean; // Use DNS from selected egress point
  
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface EgressPoint {
  id: string;
  name: string;
  type: 'local_internet' | 'wireguard';
  
  // Local internet
  isp_name?: string;
  
  // WireGuard tunnel
  wg_connection_name?: string; // "de_vps", "tr_vps", "ae_vps"
  wg_server_id?: string;
  wg_endpoint?: string;
  
  // Status and metrics
  is_active: boolean;
  is_default: boolean;
  latency_ms?: number;
  bandwidth_mbps?: number;
  reliability_score?: number;
  
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface EnhancedTrafficRule {
  id: string;
  name: string;
  description?: string;
  
  // Rule configuration
  priority: number; // Lower number = higher priority
  is_enabled: boolean;
  
  // Matching criteria
  client_groups: string[]; // Client group IDs
  traffic_matchers: string[]; // Traffic matcher IDs
  
  // Actions
  dns_policy_id?: string;
  egress_point_id: string;
  
  // QoS settings
  qos_enabled?: boolean;
  bandwidth_limit_mbps?: number;
  latency_priority?: 'low' | 'normal' | 'high' | 'critical';
  
  // Security settings
  dpi_inspection?: boolean;
  logging_enabled?: boolean;
  
  // Schedule settings
  schedule_enabled?: boolean;
  allowed_hours?: string[]; // ["09:00-17:00"]
  allowed_days?: number[]; // [1,2,3,4,5] = Mon-Fri
  
  // Statistics
  match_count: number;
  bytes_processed: number;
  last_matched?: string;
  
  created_at: string;
  updated_at: string;
}

export interface TrafficRuleMatch {
  id: string;
  rule_id: string;
  client_mac?: string;
  client_ip: string;
  
  // Matched criteria
  matched_protocol?: string;
  matched_application?: string;
  matched_port?: number;
  matched_domain?: string;
  
  // Applied actions
  applied_dns_policy?: string;
  applied_egress_point: string;
  exit_tunnel?: string;
  
  // Performance metrics
  latency_ms?: number;
  bandwidth_used_mbps?: number;
  
  timestamp: string;
}

export interface DefaultPolicy {
  id: string;
  name: string;
  description: string;
  
  // Default actions for unmatched traffic
  default_egress_point_id: string;
  default_dns_policy_id?: string;
  
  // Fallback settings
  fallback_dns_servers: string[];
  fallback_bandwidth_limit?: number;
  
  logging_enabled: boolean;
  is_active: boolean;
  
  created_at: string;
  updated_at: string;
}

// Live monitoring types
export interface LiveTrafficView {
  active_rules: Array<{
    rule_id: string;
    rule_name: string;
    matches_per_minute: number;
    egress_point: string;
    dns_policy: string;
  }>;
  
  client_activity: Array<{
    client_ip: string;
    client_name?: string;
    active_rule?: string;
    current_egress: string;
    bytes_per_second: number;
  }>;
  
  egress_distribution: Array<{
    egress_name: string;
    percentage: number;
    bytes_per_second: number;
    active_clients: number;
  }>;
  
  dns_distribution: Array<{
    dns_policy: string;
    queries_per_minute: number;
    blocked_queries: number;
  }>;
}

// Rule builder types
export interface RuleBuilder {
  step: 'clients' | 'traffic' | 'dns' | 'egress' | 'review';
  selectedClients: string[];
  selectedMatchers: string[];
  selectedDNSPolicy?: string;
  selectedEgress: string;
  ruleName: string;
  priority: number;
  schedule?: {
    enabled: boolean;
    hours: string[];
    days: number[];
  };
  qos?: {
    enabled: boolean;
    bandwidth_limit?: number;
    priority: 'low' | 'normal' | 'high' | 'critical';
  };
}

// Statistics and analytics
export interface TrafficAnalytics {
  total_rules: number;
  active_rules: number;
  total_matches_today: number;
  top_triggered_rules: Array<{
    rule_name: string;
    match_count: number;
    percentage: number;
  }>;
  egress_usage: Array<{
    egress_name: string;
    bytes_today: number;
    percentage: number;
  }>;
  protocol_distribution: Record<string, number>;
  application_distribution: Record<string, number>;
  hourly_traffic: Array<{
    hour: string;
    total_bytes: number;
    rule_matches: number;
  }>;
}

// Preset configurations
export interface TrafficRulePreset {
  name: string;
  description: string;
  category: 'gaming' | 'voip' | 'streaming' | 'business' | 'security' | 'family';
  rules: Array<{
    name: string;
    clients: string[];
    matchers: Array<{
      protocols?: string[];
      applications?: string[];
      ports?: string[];
      domains?: string[];
    }>;
    dns_policy: string;
    egress: string;
    priority: number;
  }>;
}

export const trafficRulePresets: TrafficRulePreset[] = [
  {
    name: 'Gaming Optimization',
    description: 'Gaming trafiği için düşük gecikme optimizasyonu',
    category: 'gaming',
    rules: [
      {
        name: 'Steam Gaming',
        clients: ['Gaming'],
        matchers: [{ applications: ['steam'], ports: ['27015-27050'] }],
        dns_policy: 'bypass',
        egress: 'wg::de_vps',
        priority: 10
      },
      {
        name: 'Xbox Live',
        clients: ['Gaming'],
        matchers: [{ applications: ['xbox'], ports: ['88', '3074', '53', '500', '3544', '4500'] }],
        dns_policy: 'bypass',
        egress: 'wg::de_vps',
        priority: 11
      }
    ]
  },
  {
    name: 'VoIP Quality',
    description: 'VoIP trafiği için ses kalitesi optimizasyonu',
    category: 'voip',
    rules: [
      {
        name: 'SIP Traffic',
        clients: ['VoIP/Work'],
        matchers: [{ protocols: ['sip', 'rtp'], ports: ['5060', '5061', '10000-20000'] }],
        dns_policy: 'custom',
        egress: 'wg::tr_vps',
        priority: 5
      }
    ]
  },
  {
    name: 'Business Security',
    description: 'İş ağı için güvenlik odaklı kurallar',
    category: 'business',
    rules: [
      {
        name: 'Admin Traffic',
        clients: ['Admin'],
        matchers: [{ protocols: ['https'], ports: ['443', '22', '3389'] }],
        dns_policy: 'pihole_unbound',
        egress: 'local_internet',
        priority: 1
      }
    ]
  }
];