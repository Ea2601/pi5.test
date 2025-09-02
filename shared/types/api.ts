// Unified API Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
  requestId?: string;
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
}

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

  export interface DevicesResponse extends ApiResponse<Device[]> {
    total: number;
    active: number;
  }
}