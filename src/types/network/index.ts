export interface NetworkDevice {
  mac: string;
  ip: string;
  name: string;
  type: 'Mobile' | 'PC' | 'IoT' | 'Game Console';
  brand: string;
  isActive: boolean;
  lastSeen: string;
  dhcpExpires?: string;
}

export interface TopologyNode {
  id: string;
  name: string;
  type: 'router' | 'switch' | 'access_point' | 'device';
  ip?: string;
  mac?: string;
  x: number;
  y: number;
  connections: string[];
}