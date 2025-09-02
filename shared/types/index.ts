// Shared Types - Single Source of Truth
// Bu dosya tüm projede kullanılacak ortak tip tanımlarını içerir

// Base Entity Interface
export interface BaseEntity {
  id: string;
  created_at: string;
  updated_at: string;
}

// API Response Interfaces
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  timestamp: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Network Device Types
export interface NetworkDevice extends BaseEntity {
  mac_address: string;
  ip_address?: string;
  device_name?: string;
  device_type?: 'Mobile' | 'PC' | 'IoT' | 'Game Console';
  device_brand?: string;
  last_seen?: string;
  is_active?: boolean;
  first_discovered?: string;
  dhcp_lease_expires?: string;
  vendor_info?: string;
}

// VPN Types
export interface WireGuardServer extends BaseEntity {
  name: string;
  description?: string;
  interface_name: string;
  listen_port: number;
  private_key: string;
  public_key: string;
  network_cidr: string;
  dns_servers: string[];
  endpoint?: string;
  is_active: boolean;
  max_clients: number;
}

export interface WireGuardClient extends BaseEntity {
  server_id: string;
  name: string;
  description?: string;
  public_key: string;
  private_key: string;
  allowed_ips: string;
  assigned_ip: string;
  persistent_keepalive: number;
  is_enabled: boolean;
  last_handshake?: string;
  rx_bytes: number;
  tx_bytes: number;
  connection_status: 'connected' | 'disconnected' | 'connecting' | 'error';
  config_downloaded: boolean;
  download_count: number;
  last_download?: string;
}

// DNS Types
export interface DNSServer extends BaseEntity {
  name: string;
  description?: string;
  ip_address: string;
  port: number;
  type: 'standard' | 'doh' | 'dot' | 'dnssec';
  provider?: 'google' | 'cloudflare' | 'quad9' | 'custom';
  is_primary: boolean;
  is_fallback: boolean;
  supports_dnssec: boolean;
  supports_doh: boolean;
  supports_dot: boolean;
  doh_url?: string;
  dot_hostname?: string;
  response_time_ms: number;
  reliability_score: number;
  is_active: boolean;
  priority: number;
}

export interface DNSProfile extends BaseEntity {
  name: string;
  description?: string;
  profile_type: 'standard' | 'family' | 'business' | 'gaming';
  ad_blocking_enabled: boolean;
  malware_blocking_enabled: boolean;
  adult_content_blocking: boolean;
  social_media_blocking: boolean;
  gaming_blocking: boolean;
  safe_search_enabled: boolean;
  logging_enabled: boolean;
  whitelist_domains: string[];
  blacklist_domains: string[];
  is_default: boolean;
}

// DHCP Types
export interface DHCPPool extends BaseEntity {
  name: string;
  description?: string;
  vlan_id: number;
  network_cidr: string;
  start_ip: string;
  end_ip: string;
  gateway_ip: string;
  subnet_mask: string;
  dns_servers: string[];
  lease_time: string;
  max_lease_time: string;
  is_active: boolean;
  allow_unknown_clients: boolean;
  require_authorization: boolean;
}

export interface DHCPReservation extends BaseEntity {
  mac_address: string;
  ip_address: string;
  hostname?: string;
  device_group_id?: string;
  dhcp_pool_id?: string;
  custom_dns_servers?: string[];
  lease_time_override?: string;
  is_active: boolean;
  description?: string;
}

// Traffic Management Types
export interface TrafficRule extends BaseEntity {
  name: string;
  description?: string;
  priority: number;
  enabled?: boolean;
  conditions: Record<string, any>;
  actions: Record<string, any>;
  client_group_id?: string;
  tunnel_pool_id?: string;
}

export interface ClientGroup extends BaseEntity {
  name: string;
  description?: string;
  criteria: Record<string, any>;
  bandwidth_limit?: number;
  priority?: number;
}

// System Metrics Types
export interface SystemMetrics {
  cpu: number;
  memory: number;
  disk: number;
  network: {
    upload: number;
    download: number;
  };
  temperature: number;
  uptime: number;
}

// UI Types
export interface NavigationItem {
  id: string;
  label: string;
  icon: string;
  badge?: string;
}

export interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: string;
  trend?: 'up' | 'down' | 'stable';
  trendValue?: string;
  status?: 'ok' | 'warn' | 'error';
  isDragging?: boolean;
}

// Configuration Types
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

export interface DeviceConfiguration extends BaseEntity {
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
  router_config: any;
  edge_router_config: any;
  bridge_config: any;
  l3_switch_config: any;
  ap_config: any;
  mesh_config: any;
  modem_config: any;
  is_active: boolean;
}

// Database Query Types
export interface DatabaseFilter {
  field: string;
  operator: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'like' | 'ilike' | 'in' | 'not_in';
  value: any;
}

export interface DatabaseSort {
  field: string;
  direction: 'asc' | 'desc';
}

export interface QueryOptions {
  filters?: DatabaseFilter[];
  sort?: DatabaseSort[];
  pagination?: {
    page: number;
    limit: number;
  };
  select?: string[];
  include?: string[];
}

// Health Check Types
export interface HealthStatus {
  service: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  version: string;
  uptime: number;
  timestamp: string;
  dependencies: {
    database: {
      connected: boolean;
      latency: number;
    };
    external?: {
      [key: string]: {
        available: boolean;
        latency?: number;
      };
    };
  };
}

// Event Types for Real-time Updates
export interface SystemEvent {
  type: string;
  source: string;
  timestamp: string;
  data: any;
}

export interface DeviceEvent extends SystemEvent {
  type: 'device:connected' | 'device:disconnected' | 'device:updated';
  data: {
    device: NetworkDevice;
    changes?: string[];
  };
}

export interface VPNEvent extends SystemEvent {
  type: 'vpn:client_connected' | 'vpn:client_disconnected' | 'vpn:tunnel_status';
  data: {
    client?: WireGuardClient;
    server?: string;
    tunnel?: string;
    status?: string;
    metrics?: any;
  };
}

// Export all types for easy importing
export * from '../types/dns';
export * from '../types/dhcp';
export * from '../types/wifi';
export * from '../types/traffic';
export * from '../types/topology';
export * from '../types/speedTest';
export * from '../types/networkConfig';