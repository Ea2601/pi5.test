// Shared database types for all backend services

export interface BaseEntity {
  id: string;
  created_at: string;
  updated_at: string;
}

export interface NetworkDevice extends BaseEntity {
  mac_address: string;
  ip_address?: string | null;
  device_name?: string | null;
  device_type?: 'Mobile' | 'PC' | 'IoT' | 'Game Console' | null;
  device_brand?: string | null;
  last_seen?: string | null;
  is_active?: boolean | null;
  first_discovered?: string | null;
  dhcp_lease_expires?: string | null;
  vendor_info?: string | null;
}

export interface TrafficRule extends BaseEntity {
  name: string;
  description?: string | null;
  priority: number;
  enabled?: boolean | null;
  conditions: Record<string, any>;
  actions: Record<string, any>;
  client_group_id?: string | null;
  tunnel_pool_id?: string | null;
}

export interface ClientGroup extends BaseEntity {
  name: string;
  description?: string | null;
  criteria: Record<string, any>;
  bandwidth_limit?: number | null;
  priority?: number | null;
}

export interface TunnelPool extends BaseEntity {
  name: string;
  description?: string | null;
  tunnel_type: string;
  endpoints: Record<string, any>[];
  load_balance_method?: string | null;
  health_check_enabled?: boolean | null;
  failover_enabled?: boolean | null;
}

export interface TrafficClassification extends BaseEntity {
  name: string;
  category: string;
  protocols?: string[] | null;
  ports?: number[] | null;
  domains?: string[] | null;
  signatures?: string[] | null;
  enabled?: boolean | null;
}

export interface RoutingHistory {
  id: string;
  source_ip: string;
  destination_ip?: string | null;
  destination_domain?: string | null;
  traffic_type?: string | null;
  rule_id?: string | null;
  tunnel_id?: string | null;
  client_group_id?: string | null;
  bandwidth_used?: number | null;
  latency_ms?: number | null;
  success?: boolean | null;
  timestamp?: string | null;
}

export interface TunnelPerformance {
  id: string;
  tunnel_id: string;
  tunnel_name: string;
  endpoint: string;
  latency_ms?: number | null;
  packet_loss_percent?: number | null;
  bandwidth_mbps?: number | null;
  active_connections?: number | null;
  is_healthy?: boolean | null;
  timestamp?: string | null;
}

// WireGuard specific types
export interface WireGuardServer extends BaseEntity {
  name: string;
  description?: string | null;
  interface_name: string;
  listen_port: number;
  private_key: string;
  public_key: string;
  network_cidr: string;
  dns_servers: string[];
  endpoint?: string | null;
  is_active: boolean;
  config_path?: string | null;
  pre_up?: string | null;
  post_up?: string | null;
  pre_down?: string | null;
  post_down?: string | null;
  max_clients: number;
}

export interface WireGuardClient extends BaseEntity {
  server_id: string;
  name: string;
  description?: string | null;
  public_key: string;
  private_key: string;
  allowed_ips: string;
  assigned_ip: string;
  persistent_keepalive: number;
  is_enabled: boolean;
  last_handshake?: string | null;
  rx_bytes: number;
  tx_bytes: number;
  connection_status: 'connected' | 'disconnected' | 'connecting' | 'error';
  client_group_id?: string | null;
  config_downloaded: boolean;
  download_count: number;
  last_download?: string | null;
}

// API Response types
export interface ApiResponse<T> {
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

// Service configuration types
export interface ServiceConfig {
  port: number;
  name: string;
  version: string;
  database: {
    url: string;
    poolSize: number;
    timeout: number;
  };
  auth: {
    jwtSecret: string;
    tokenExpiry: string;
  };
  logging: {
    level: string;
    file: string;
  };
}

// Health check types
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