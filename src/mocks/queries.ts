// Mock data for all API calls - no backend required

export interface MockNetworkDevice {
  mac_address: string;
  ip_address: string;
  device_name: string;
  device_type: 'Mobile' | 'PC' | 'IoT' | 'Game Console';
  device_brand: string;
  last_seen: string;
  is_active: boolean;
  first_discovered: string;
  dhcp_lease_expires?: string;
  vendor_info?: string;
}

export interface MockSystemMetrics {
  cpu: number;
  memory: number;
  disk: number;
  network: {
    upload: number;
    download: number;
  };
  temperature: number;
  uptime: number;
}

export interface MockNetworkMetrics {
  totalDevices: number;
  activeDevices: number;
  bandwidth: number;
  latency: number;
}

// Mock network devices
export const mockDevices: MockNetworkDevice[] = [
  {
    mac_address: '00:1A:2B:3C:4D:5E',
    ip_address: '192.168.1.101',
    device_name: 'iPhone 14 Pro',
    device_type: 'Mobile',
    device_brand: 'Apple',
    last_seen: '2 dakika önce',
    is_active: true,
    first_discovered: '2024-01-15T10:30:00Z',
    dhcp_lease_expires: '23 saat 45 dakika',
    vendor_info: 'Apple Inc.'
  },
  {
    mac_address: '00:1A:2B:3C:4D:5F',
    ip_address: '192.168.1.102',
    device_name: 'MacBook Pro M2',
    device_type: 'PC',
    device_brand: 'Apple',
    last_seen: '5 dakika önce',
    is_active: true,
    first_discovered: '2024-01-10T14:20:00Z',
    dhcp_lease_expires: '23 saat 30 dakika',
    vendor_info: 'Apple Inc.'
  },
  {
    mac_address: '00:1A:2B:3C:4D:60',
    ip_address: '192.168.1.103',
    device_name: 'Samsung Smart TV',
    device_type: 'IoT',
    device_brand: 'Samsung',
    last_seen: '1 saat önce',
    is_active: false,
    first_discovered: '2024-01-08T09:15:00Z',
    dhcp_lease_expires: '22 saat 15 dakika',
    vendor_info: 'Samsung Electronics'
  },
  {
    mac_address: '00:1A:2B:3C:4D:61',
    ip_address: '192.168.1.104',
    device_name: 'Xbox Series X',
    device_type: 'Game Console',
    device_brand: 'Microsoft',
    last_seen: '30 dakika önce',
    is_active: true,
    first_discovered: '2024-01-12T16:45:00Z',
    dhcp_lease_expires: '23 saat 00 dakika',
    vendor_info: 'Microsoft Corporation'
  },
  {
    mac_address: '00:1A:2B:3C:4D:62',
    ip_address: '192.168.1.105',
    device_name: 'HP LaserJet Pro',
    device_type: 'IoT',
    device_brand: 'HP',
    last_seen: '2 saat önce',
    is_active: false,
    first_discovered: '2024-01-05T11:00:00Z',
    dhcp_lease_expires: '22 saat 30 dakika',
    vendor_info: 'HP Inc.'
  }
];

// Mock API functions
export async function fetchDevices(filters?: { active?: boolean; type?: string; search?: string }): Promise<{ success: boolean; data: MockNetworkDevice[]; total: number; active: number }> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, Math.random() * 500 + 200));
  
  let filteredDevices = [...mockDevices];
  
  if (filters?.active !== undefined) {
    filteredDevices = filteredDevices.filter(d => d.is_active === filters.active);
  }
  
  if (filters?.type) {
    filteredDevices = filteredDevices.filter(d => d.device_type === filters.type);
  }
  
  if (filters?.search) {
    const searchLower = filters.search.toLowerCase();
    filteredDevices = filteredDevices.filter(d => 
      d.device_name.toLowerCase().includes(searchLower) ||
      d.device_brand.toLowerCase().includes(searchLower) ||
      d.ip_address.includes(searchLower)
    );
  }
  
  return {
    success: true,
    data: filteredDevices,
    total: filteredDevices.length,
    active: filteredDevices.filter(d => d.is_active).length
  };
}

export async function fetchDevice(macAddress: string): Promise<{ success: boolean; data: MockNetworkDevice | null }> {
  await new Promise(resolve => setTimeout(resolve, Math.random() * 300 + 100));
  
  const device = mockDevices.find(d => d.mac_address === macAddress);
  return {
    success: !!device,
    data: device ?? null
  };
}

export async function fetchSystemMetrics(): Promise<MockSystemMetrics> {
  await new Promise(resolve => setTimeout(resolve, Math.random() * 200 + 100));
  
  return {
    cpu: Math.floor(Math.random() * 60) + 20,
    memory: Math.floor(Math.random() * 40) + 30,
    disk: Math.floor(Math.random() * 30) + 50,
    network: {
      upload: Math.floor(Math.random() * 100) + 10,
      download: Math.floor(Math.random() * 200) + 50
    },
    temperature: Math.floor(Math.random() * 20) + 45,
    uptime: Date.now() - (Math.random() * 7 * 24 * 60 * 60 * 1000)
  };
}

export async function fetchNetworkMetrics(): Promise<MockNetworkMetrics> {
  await new Promise(resolve => setTimeout(resolve, Math.random() * 300 + 150));
  
  return {
    totalDevices: mockDevices.length,
    activeDevices: mockDevices.filter(d => d.is_active).length,
    bandwidth: Math.floor(Math.random() * 100) + 120,
    latency: Math.floor(Math.random() * 30) + 8
  };
}

export async function createDevice(deviceData: Partial<MockNetworkDevice>): Promise<{ success: boolean; data: MockNetworkDevice }> {
  await new Promise(resolve => setTimeout(resolve, Math.random() * 500 + 200));
  
  const newDevice: MockNetworkDevice = {
    mac_address: deviceData.mac_address ?? '00:00:00:00:00:00',
    ip_address: deviceData.ip_address ?? '192.168.1.200',
    device_name: deviceData.device_name ?? 'Unknown Device',
    device_type: deviceData.device_type ?? 'PC',
    device_brand: deviceData.device_brand ?? 'Unknown',
    last_seen: 'Şimdi',
    is_active: true,
    first_discovered: new Date().toISOString(),
    vendor_info: 'Mock Vendor'
  };
  
  return {
    success: true,
    data: newDevice
  };
}

export async function updateDevice(macAddress: string, updates: Partial<MockNetworkDevice>): Promise<{ success: boolean; data: MockNetworkDevice | null }> {
  await new Promise(resolve => setTimeout(resolve, Math.random() * 400 + 150));
  
  const deviceIndex = mockDevices.findIndex(d => d.mac_address === macAddress);
  if (deviceIndex === -1) {
    return { success: false, data: null };
  }
  
  const updatedDevice = { ...mockDevices[deviceIndex], ...updates };
  return {
    success: true,
    data: updatedDevice
  };
}

export async function deleteDevice(macAddress: string): Promise<{ success: boolean }> {
  await new Promise(resolve => setTimeout(resolve, Math.random() * 300 + 100));
  
  const exists = mockDevices.some(d => d.mac_address === macAddress);
  return { success: exists };
}

export async function wakeDevice(macAddress: string): Promise<{ success: boolean; message: string }> {
  await new Promise(resolve => setTimeout(resolve, Math.random() * 200 + 100));
  
  return {
    success: true,
    message: 'Wake on LAN packet sent'
  };
}