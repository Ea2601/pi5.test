export interface DNSServer {
  id: string;
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
  created_at: string;
  updated_at: string;
}

export interface DNSProfile {
  id: string;
  name: string;
  description?: string;
  profile_type: 'standard' | 'family' | 'business' | 'gaming';
  ad_blocking_enabled: boolean;
  malware_blocking_enabled: boolean;
  adult_content_blocking: boolean;
  social_media_blocking: boolean;
  gaming_blocking: boolean;
  custom_blocklist_urls: string[];
  whitelist_domains: string[];
  blacklist_domains: string[];
  safe_search_enabled: boolean;
  logging_enabled: boolean;
  cache_ttl_override?: number;
  upstream_dns_servers: string[];
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface DNSZoneConfig {
  id: string;
  zone_name: string;
  zone_type: 'forward' | 'reverse';
  authoritative: boolean;
  soa_record: any;
  ns_records: any[];
  a_records: any[];
  aaaa_records: any[];
  cname_records: any[];
  mx_records: any[];
  txt_records: any[];
  srv_records: any[];
  auto_reverse_zone: boolean;
  ttl_default: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DNSDeviceAssignment {
  id: string;
  device_mac: string;
  dns_profile_id?: string;
  custom_dns_servers: string[];
  override_global_settings: boolean;
  schedule_config?: any;
  parental_controls?: any;
  bandwidth_priority: number;
  bypass_filtering: boolean;
  force_safe_search: boolean;
  block_adult_content: boolean;
  log_queries: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DNSQueryLog {
  id: string;
  device_mac: string;
  client_ip: string;
  query_domain: string;
  query_type: string;
  response_code?: number;
  response_ip?: string;
  response_time_ms?: number;
  blocked: boolean;
  block_reason?: string;
  dns_server_used?: string;
  profile_applied?: string;
  timestamp: string;
}

export interface DNSBlocklist {
  id: string;
  name: string;
  description?: string;
  category: 'ads' | 'malware' | 'adult' | 'social' | 'gaming' | 'custom';
  source_url?: string;
  domains: string[];
  regex_patterns: string[];
  last_updated?: string;
  update_frequency: string;
  auto_update: boolean;
  is_active: boolean;
  entry_count: number;
  created_at: string;
  updated_at: string;
}

export interface DNSCacheSettings {
  id: string;
  setting_name: string;
  cache_size_mb: number;
  default_ttl: number;
  min_ttl: number;
  max_ttl: number;
  negative_cache_ttl: number;
  prefetch_enabled: boolean;
  serve_stale_enabled: boolean;
  serve_stale_ttl: number;
  compression_enabled: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DNSStats {
  total_queries: number;
  blocked_queries: number;
  cache_hit_ratio: number;
  average_response_time: number;
  top_domains: Array<{ domain: string; count: number }>;
  top_blocked_domains: Array<{ domain: string; count: number }>;
  queries_by_type: Record<string, number>;
  queries_by_device: Record<string, number>;
}

export interface GeoDNSConfig {
  id: string;
  domain: string;
  geo_rules: Array<{
    country_code: string;
    region?: string;
    target_ip: string;
    priority: number;
  }>;
  default_target: string;
  enabled: boolean;
}

export interface DDNSConfig {
  id: string;
  hostname: string;
  provider: 'duckdns' | 'noip' | 'dynv6' | 'custom';
  api_key: string;
  update_interval: number;
  last_update: string;
  current_ip: string;
  enabled: boolean;
}