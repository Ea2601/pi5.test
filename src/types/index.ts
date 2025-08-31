export interface NavigationItem {
  id: string;
  label: string;
  icon: string;
  badge?: string;
}

export interface CardSpec {
  id: string;
  type: string;
  title: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  data?: any;
}

export interface SystemMetrics {
  cpu: number;
  memory: number;
  disk: number;
  network: {
    upload: number;
    download: number;
  };
  temperature: number;
}

export interface WireGuardPeer {
  id: string;
  name: string;
  publicKey: string;
  allowedIPs: string;
  endpoint?: string;
  lastHandshake?: Date;
  transferRx: number;
  transferTx: number;
  status: 'connected' | 'disconnected' | 'connecting';
}

export interface AutomationRule {
  id: string;
  name: string;
  enabled: boolean;
  triggers: string[];
  actions: string[];
  lastExecuted?: Date;
}

export interface UIControl {
  id: string;
  type: 'toggle' | 'slider' | 'select' | 'input' | 'button';
  label: string;
  value?: any;
  min?: number;
  max?: number;
  step?: number;
  options?: Array<{ value: string; label: string }>;
  action?: (value: any) => void;
  icon?: string;
}

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