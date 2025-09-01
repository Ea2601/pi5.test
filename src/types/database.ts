// Database type definitions based on Supabase schema
export interface NetworkDevice {
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
  created_at?: string | null;
  updated_at?: string | null;
}

export interface TrafficRule {
  id: string;
  name: string;
  description?: string | null;
  priority: number;
  enabled?: boolean | null;
  conditions: Record<string, any>;
  actions: Record<string, any>;
  client_group_id?: string | null;
  tunnel_pool_id?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface ClientGroup {
  id: string;
  name: string;
  description?: string | null;
  criteria: Record<string, any>;
  bandwidth_limit?: number | null;
  priority?: number | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface TunnelPool {
  id: string;
  name: string;
  description?: string | null;
  tunnel_type: string;
  endpoints: Record<string, any>[];
  load_balance_method?: string | null;
  health_check_enabled?: boolean | null;
  failover_enabled?: boolean | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface TrafficClassification {
  id: string;
  name: string;
  category: string;
  protocols?: string[] | null;
  ports?: number[] | null;
  domains?: string[] | null;
  signatures?: string[] | null;
  enabled?: boolean | null;
  created_at?: string | null;
  updated_at?: string | null;
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

// Database utility types
export type DeviceTypeEnum = 'Mobile' | 'PC' | 'IoT' | 'Game Console';

export interface DatabaseResponse<T> {
  data: T[] | T | null;
  error: any;
  count?: number;
}

export interface PaginationOptions {
  page?: number;
  limit?: number;
  offset?: number;
}

export interface FilterOptions {
  search?: string;
  active?: boolean;
  type?: DeviceTypeEnum;
  group_id?: string;
}