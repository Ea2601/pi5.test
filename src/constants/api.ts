export const API_ENDPOINTS = {
  HEALTH: '/health',
  SYSTEM_METRICS: '/api/v1/system/metrics',
  DEVICES: '/api/v1/network/devices',
  DISCOVER: '/api/v1/network/discover',
  DNS_SERVERS: '/api/v1/network/dns/servers',
  DHCP_POOLS: '/api/v1/network/dhcp/pools',
  WIFI_NETWORKS: '/api/v1/network/wifi/networks',
  VPN_SERVERS: '/api/v1/vpn/servers',
  VPN_CLIENTS: '/api/v1/vpn/clients'
} as const;

export const API_TIMEOUTS = {
  DEFAULT: 10000,
  HEALTH_CHECK: 5000,
  DEVICE_DISCOVERY: 30000,
  VPN_OPERATION: 15000
} as const;