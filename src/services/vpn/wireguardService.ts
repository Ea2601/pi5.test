export interface WireGuardServer {
  id: string;
  name: string;
  interface_name: string;
  listen_port: number;
  network_cidr: string;
  is_active: boolean;
}

export interface WireGuardClient {
  id: string;
  name: string;
  server_id: string;
  assigned_ip: string;
  connection_status: string;
  is_enabled: boolean;
}

export const wireguardService = {
  async getServers(): Promise<WireGuardServer[]> {
    // Mock implementation
    return [
      {
        id: 'server-1',
        name: 'Main VPN Server',
        interface_name: 'wg0',
        listen_port: 51820,
        network_cidr: '10.0.0.0/24',
        is_active: true
      }
    ];
  },

  async getClients(): Promise<WireGuardClient[]> {
    // Mock implementation  
    return [
      {
        id: 'client-1',
        name: 'Mobile Device',
        server_id: 'server-1',
        assigned_ip: '10.0.0.2',
        connection_status: 'connected',
        is_enabled: true
      }
    ];
  }
};