export interface DHCPPool {
  id: string;
  name: string;
  description?: string;
  vlan_id: number;
  network_cidr: string;
  start_ip: string;
  end_ip: string;
  gateway_ip: string;
  subnet_mask: string;
  dns_servers: string[];
  lease_time: string; // PostgreSQL interval
  max_lease_time: string;
  is_active: boolean;
  allow_unknown_clients: boolean;
  require_authorization: boolean;
  created_at: string;
  updated_at: string;
}

export interface DHCPReservation {
  id: string;
  mac_address: string;
  ip_address: string;
  hostname?: string;
  device_group_id?: string;
  dhcp_pool_id?: string;
  custom_dns_servers?: string[];
  custom_options?: Record<string, any>;
  lease_time_override?: string;
  is_active: boolean;
  description?: string;
  expires_at?: string;
  created_at: string;
  updated_at: string;
}

export interface DHCPDeviceGroup {
  id: string;
  name: string;
  description?: string;
  group_type: 'admin' | 'iot' | 'guest' | 'gaming' | 'voip' | 'custom';
  default_vlan_id?: number;
  default_lease_time: string;
  mac_filtering_enabled: boolean;
  allowed_mac_patterns?: string[];
  custom_dhcp_options?: Record<string, any>;
  bandwidth_limit_mbps?: number;
  priority: number;
  time_restrictions?: Record<string, any>;
  dns_profile_override?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DHCPLease {
  id: string;
  mac_address: string;
  ip_address: string;
  hostname?: string;
  dhcp_pool_id?: string;
  device_group_id?: string;
  lease_start: string;
  lease_end: string;
  client_identifier?: string;
  vendor_class?: string;
  user_class?: string;
  fingerprint?: string;
  state: 'active' | 'expired' | 'declined' | 'released';
  renewal_count: number;
  last_renewal?: string;
  created_at: string;
  updated_at: string;
}

export interface DHCPSecurityPolicy {
  id: string;
  name: string;
  description?: string;
  policy_type: 'mac_filter' | 'time_restriction' | 'vendor_filter' | 'custom';
  conditions: Record<string, any>;
  actions: Record<string, any>;
  apply_to_groups?: string[];
  apply_to_vlans?: number[];
  priority: number;
  is_active: boolean;
  violation_count: number;
  last_violation?: string;
  created_at: string;
  updated_at: string;
}

export interface DHCPOption {
  id: string;
  name: string;
  option_code: number;
  option_type: 'string' | 'ip' | 'integer' | 'boolean' | 'hex';
  option_value: string;
  description?: string;
  apply_to_pools?: string[];
  apply_to_groups?: string[];
  apply_to_devices?: string[];
  is_vendor_specific: boolean;
  vendor_class?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DHCPLog {
  id: string;
  event_type: 'discover' | 'offer' | 'request' | 'ack' | 'nak' | 'decline' | 'release' | 'inform';
  mac_address: string;
  ip_address?: string;
  hostname?: string;
  dhcp_pool_id?: string;
  transaction_id?: string;
  client_identifier?: string;
  vendor_class?: string;
  requested_options?: number[];
  lease_time?: string;
  server_response_time_ms?: number;
  success: boolean;
  error_message?: string;
  timestamp: string;
}

export interface DHCPStats {
  total_pools: number;
  active_pools: number;
  total_leases: number;
  active_leases: number;
  expired_leases: number;
  total_reservations: number;
  active_reservations: number;
  pool_utilization: Array<{
    pool_name: string;
    vlan_id: number;
    total_ips: number;
    used_ips: number;
    utilization_percent: number;
  }>;
  recent_activity: DHCPLog[];
}

export interface DHCPConfiguration {
  global_lease_time: string;
  max_lease_time: string;
  authoritative: boolean;
  ping_check: boolean;
  ping_timeout: number;
  conflict_detection: boolean;
  log_facility: string;
  ddns_updates: boolean;
  ddns_domainname?: string;
  ddns_rev_domainname?: string;
}

export interface VLANConfig {
  vlan_id: number;
  name: string;
  description?: string;
  network: string;
  gateway: string;
  dhcp_enabled: boolean;
  dhcp_pool_id?: string;
}