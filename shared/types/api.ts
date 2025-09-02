// Unified API Types - Single Source of Truth for All API Contracts
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
  requestId?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  timestamp: string;
}

export interface HealthCheck {
  healthy: boolean;
  latency: number;
  error?: string;
  timestamp: string;
}

export interface ServiceHealth extends HealthCheck {
  service: string;
  version: string;
  uptime: number;
  memoryUsage?: number;
  cpuUsage?: number;
}

// Standard error codes across all services
export enum ErrorCode {
  // Authentication errors
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  
  // Validation errors
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INVALID_INPUT = 'INVALID_INPUT',
  MISSING_REQUIRED_FIELD = 'MISSING_REQUIRED_FIELD',
  
  // Resource errors
  NOT_FOUND = 'NOT_FOUND',
  ALREADY_EXISTS = 'ALREADY_EXISTS',
  CONFLICT = 'CONFLICT',
  
  // Network errors
  NETWORK_ERROR = 'NETWORK_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  EXTERNAL_SERVICE_ERROR = 'EXTERNAL_SERVICE_ERROR',
  
  // Rate limiting
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  
  // System errors
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  CONFIGURATION_ERROR = 'CONFIGURATION_ERROR'
}

export interface ApiError {
  code: ErrorCode;
  message: string;
  details?: any;
  field?: string;
  timestamp: string;
  requestId?: string;
}

// Request/Response interfaces for each service
export namespace NetworkAPI {
  export interface Device {
    mac_address: string;
    ip_address?: string;
    device_name: string;
    device_type: 'Mobile' | 'PC' | 'IoT' | 'Game Console';
    device_brand?: string;
    is_active: boolean;
    last_seen: string;
    first_discovered: string;
    dhcp_lease_expires?: string;
    vendor_info?: string;
    created_at: string;
    updated_at: string;
  }

  export interface DeviceInput {
    mac_address: string;
    ip_address?: string;
    device_name: string;
    device_type: 'Mobile' | 'PC' | 'IoT' | 'Game Console';
    device_brand?: string;
  }

  export interface DeviceUpdate {
    device_name?: string;
    device_type?: 'Mobile' | 'PC' | 'IoT' | 'Game Console';
    device_brand?: string;
    is_active?: boolean;
  }

  export interface DevicesResponse extends ApiResponse<Device[]> {
    total: number;
    active: number;
  }
}

export namespace DHCPAPI {
  export interface Pool {
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
    lease_time: string;
    max_lease_time: string;
    is_active: boolean;
    allow_unknown_clients: boolean;
    require_authorization: boolean;
    created_at: string;
    updated_at: string;
  }

  export interface PoolInput {
    name: string;
    description?: string;
    vlan_id: number;
    network_cidr: string;
    start_ip: string;
    end_ip: string;
    gateway_ip: string;
    subnet_mask?: string;
    dns_servers: string[];
    lease_time?: string;
    max_lease_time?: string;
    allow_unknown_clients?: boolean;
    require_authorization?: boolean;
  }

  export interface Reservation {
    id: string;
    mac_address: string;
    ip_address: string;
    hostname?: string;
    device_group_id?: string;
    dhcp_pool_id?: string;
    custom_dns_servers?: string[];
    is_active: boolean;
    description?: string;
    created_at: string;
    updated_at: string;
  }

  export interface Lease {
    id: string;
    mac_address: string;
    ip_address: string;
    hostname?: string;
    dhcp_pool_id?: string;
    lease_start: string;
    lease_end: string;
    state: 'active' | 'expired' | 'declined' | 'released';
    renewal_count: number;
    created_at: string;
    updated_at: string;
  }
}

export namespace DNSAPI {
  export interface Server {
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

  export interface Profile {
    id: string;
    name: string;
    description?: string;
    profile_type: 'standard' | 'family' | 'business' | 'gaming';
    ad_blocking_enabled: boolean;
    malware_blocking_enabled: boolean;
    adult_content_blocking: boolean;
    safe_search_enabled: boolean;
    logging_enabled: boolean;
    upstream_dns_servers: string[];
    is_default: boolean;
    created_at: string;
    updated_at: string;
  }
}

export namespace WiFiAPI {
  export interface AccessPoint {
    id: string;
    ap_name: string;
    description?: string;
    mac_address: string;
    ip_address?: string;
    location?: string;
    vendor: string;
    model?: string;
    is_online: boolean;
    max_clients: number;
    supported_bands: ('2.4ghz' | '5ghz' | '6ghz')[];
    temperature: number;
    uptime_seconds: number;
    created_at: string;
    updated_at: string;
  }

  export interface Network {
    id: string;
    ap_id: string;
    ssid: string;
    description?: string;
    vlan_id?: number;
    network_type: 'standard' | 'guest' | 'iot' | 'admin';
    encryption_type: 'open' | 'wep' | 'wpa2' | 'wpa3' | 'wpa2_enterprise' | 'wpa3_enterprise';
    passphrase?: string;
    frequency_band: '2.4ghz' | '5ghz' | '6ghz';
    channel?: number;
    max_clients: number;
    client_count: number;
    is_enabled: boolean;
    created_at: string;
    updated_at: string;
  }

  export interface Client {
    id: string;
    network_id: string;
    ap_id: string;
    mac_address: string;
    ip_address?: string;
    hostname?: string;
    device_name?: string;
    vendor: string;
    connected_ssid: string;
    signal_strength_dbm?: number;
    connection_status: 'connected' | 'disconnected' | 'blocked' | 'idle';
    bytes_sent: number;
    bytes_received: number;
    connected_at: string;
    last_seen?: string;
    created_at: string;
    updated_at: string;
  }
}

export namespace VPNAPI {
  export interface Server {
    id: string;
    name: string;
    description?: string;
    interface_name: string;
    listen_port: number;
    public_key: string;
    network_cidr: string;
    endpoint?: string;
    dns_servers: string[];
    is_active: boolean;
    max_clients: number;
    created_at: string;
    updated_at: string;
  }

  export interface Client {
    id: string;
    server_id: string;
    name: string;
    description?: string;
    public_key: string;
    allowed_ips: string;
    assigned_ip: string;
    persistent_keepalive: number;
    is_enabled: boolean;
    connection_status: 'connected' | 'disconnected' | 'connecting' | 'error';
    last_handshake?: string;
    rx_bytes: number;
    tx_bytes: number;
    created_at: string;
    updated_at: string;
  }

  export interface ClientConfig {
    config: string;
    qr_code: string;
  }
}

// Event system types for real-time updates
export namespace EventAPI {
  export interface SystemEvent {
    type: string;
    source: string;
    data: any;
    timestamp: string;
    severity: 'info' | 'warning' | 'error' | 'critical';
  }

  export interface DeviceEvent extends SystemEvent {
    type: 'device:connected' | 'device:disconnected' | 'device:updated';
    data: {
      device: NetworkAPI.Device;
      previousState?: Partial<NetworkAPI.Device>;
    };
  }

  export interface VPNEvent extends SystemEvent {
    type: 'vpn:client_connected' | 'vpn:client_disconnected' | 'vpn:server_status_changed';
    data: {
      client?: VPNAPI.Client;
      server?: VPNAPI.Server;
      metrics?: {
        latency: number;
        bandwidth: number;
      };
    };
  }

  export interface NetworkEvent extends SystemEvent {
    type: 'network:rule_applied' | 'network:policy_updated' | 'network:alert_triggered';
    data: {
      rule?: any;
      policy?: any;
      alert?: any;
      affected_devices?: string[];
    };
  }
}

// WebSocket message types
export interface WSMessage<T = any> {
  type: string;
  payload: T;
  timestamp: string;
  requestId?: string;
}