export interface UserGroup {
  id: string;
  name: string;
  type: 'local' | 'wg' | 'custom';
  description?: string;
  memberCount: number;
}

export interface VLANGroup {
  id: string;
  name: string;
  vlanId: number;
  subnet: string;
  description?: string;
}

export interface EgressTarget {
  id: string;
  name: string;
  type: 'local' | 'wg';
  description?: string;
  isActive: boolean;
}

export interface DNSProfile {
  id: string;
  name: string;
  resolvers: string[];
  blocklists: string[];
  description?: string;
}

export interface TrafficPolicy {
  id: string;
  groupId: string;
  vlanId: string;
  egressId: string;
  dnsProfileId?: string;
  scheduleConfig?: {
    enabled: boolean;
    allowedHours: string[];
    allowedDays: string[];
  };
  qosConfig?: {
    enabled: boolean;
    maxBandwidth?: number;
    priority: 'low' | 'normal' | 'high';
  };
  createdAt: string;
  updatedAt: string;
}

export interface DraftChange {
  id: string;
  type: 'policy' | 'device' | 'reservation';
  action: 'create' | 'update' | 'delete';
  target: string;
  data: any;
  timestamp: string;
}

export interface PolicyMatrixCell {
  groupId: string;
  vlanId: string;
  policy?: TrafficPolicy;
  hasChanges: boolean;
}