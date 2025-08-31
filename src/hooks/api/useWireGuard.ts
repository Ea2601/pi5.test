import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// Mock data instead of Supabase calls for now
import { logger } from '../../utils/logger';

// Mock interfaces
export interface WireGuardServer {
  id: string;
  name: string;
  interface_name: string;
  listen_port: number;
  public_key: string;
  network_cidr: string;
  endpoint?: string;
  is_active: boolean;
  max_clients: number;
  dns_servers: string[];
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface WireGuardClient {
  id: string;
  server_id: string;
  name: string;
  public_key: string;
  private_key: string;
  allowed_ips: string;
  assigned_ip: string;
  persistent_keepalive: number;
  is_enabled: boolean;
  last_handshake?: string;
  rx_bytes: number;
  tx_bytes: number;
  connection_status: 'connected' | 'disconnected' | 'connecting' | 'error';
  client_group_id?: string;
  config_downloaded: boolean;
  download_count: number;
  last_download?: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

// Mock data
const mockServers: WireGuardServer[] = [
  {
    id: 'server-1',
    name: 'Main VPN Server',
    interface_name: 'wg0',
    listen_port: 51820,
    public_key: 'mock-server-public-key-1',
    network_cidr: '10.0.0.0/24',
    endpoint: 'vpn.example.com:51820',
    is_active: true,
    max_clients: 100,
    dns_servers: ['1.1.1.1', '8.8.8.8'],
    description: 'Primary VPN server',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

const mockClients: WireGuardClient[] = [
  {
    id: 'client-1',
    server_id: 'server-1',
    name: 'Mobile Device',
    public_key: 'mock-client-public-key-1',
    private_key: 'mock-client-private-key-1',
    allowed_ips: '0.0.0.0/0',
    assigned_ip: '10.0.0.2',
    persistent_keepalive: 25,
    is_enabled: true,
    last_handshake: new Date().toISOString(),
    rx_bytes: 1024 * 1024 * 50,
    tx_bytes: 1024 * 1024 * 25,
    connection_status: 'connected',
    config_downloaded: true,
    download_count: 1,
    description: 'Primary mobile device',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

// Mock service functions
const mockWireGuardService = {
  getServers: async (): Promise<WireGuardServer[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockServers;
  },
  
  getClients: async (serverId?: string): Promise<WireGuardClient[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return serverId ? mockClients.filter(c => c.server_id === serverId) : mockClients;
  },
  
  createServer: async (data: Partial<WireGuardServer>): Promise<WireGuardServer> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const newServer: WireGuardServer = {
      id: `server-${Date.now()}`,
      name: data.name || 'New Server',
      interface_name: data.interface_name || 'wg0',
      listen_port: data.listen_port || 51820,
      public_key: 'mock-generated-public-key',
      network_cidr: data.network_cidr || '10.0.0.0/24',
      endpoint: data.endpoint,
      is_active: false,
      max_clients: data.max_clients || 100,
      dns_servers: data.dns_servers || ['1.1.1.1', '8.8.8.8'],
      description: data.description,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    mockServers.push(newServer);
    return newServer;
  }
};

// Server Hooks
export const useWireGuardServers = () => {
  return useQuery({
    queryKey: ['wireguard-servers'],
    queryFn: () => mockWireGuardService.getServers(),
    refetchInterval: 30000, // Refetch every 30 seconds
    staleTime: 15000
  });
};

export const useWireGuardServer = (id: string) => {
  return useQuery({
    queryKey: ['wireguard-server', id],
    queryFn: async () => {
      const servers = await mockWireGuardService.getServers();
      return servers.find(s => s.id === id) || null;
    },
    enabled: !!id
  });
};

export const useCreateServer = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (serverData: Partial<WireGuardServer>) => 
      mockWireGuardService.createServer(serverData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wireguard-servers'] });
    },
    onError: (error) => {
      logger.error('Create server error:', error);
    }
  });
};

export const useUpdateServer = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<WireGuardServer> }) => 
      Promise.resolve({ ...mockServers.find(s => s.id === id)!, ...updates }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['wireguard-servers'] });
      queryClient.invalidateQueries({ queryKey: ['wireguard-server', data.id] });
    },
    onError: (error) => {
      logger.error('Update server error:', error);
    }
  });
};

export const useDeleteServer = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => Promise.resolve(true),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wireguard-servers'] });
    },
    onError: (error) => {
      logger.error('Delete server error:', error);
    }
  });
};

export const useToggleServer = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => Promise.resolve({ ...mockServers.find(s => s.id === id)!, is_active: !mockServers.find(s => s.id === id)?.is_active }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['wireguard-servers'] });
      queryClient.invalidateQueries({ queryKey: ['wireguard-server', data.id] });
    },
    onError: (error) => {
      logger.error('Toggle server error:', error);
    }
  });
};

// Client Hooks
export const useWireGuardClients = (serverId?: string) => {
  return useQuery({
    queryKey: ['wireguard-clients', serverId],
    queryFn: () => mockWireGuardService.getClients(serverId),
    refetchInterval: 30000,
    staleTime: 15000
  });
};

export const useWireGuardClient = (id: string) => {
  return useQuery({
    queryKey: ['wireguard-client', id],
    queryFn: async () => {
      const clients = await mockWireGuardService.getClients();
      return clients.find(c => c.id === id) || null;
    },
    enabled: !!id
  });
};

export const useCreateClient = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (clientData: Partial<WireGuardClient>) => 
      Promise.resolve({
        id: `client-${Date.now()}`,
        server_id: clientData.server_id || 'server-1',
        name: clientData.name || 'New Client',
        public_key: 'mock-client-public-key',
        private_key: 'mock-client-private-key',
        allowed_ips: clientData.allowed_ips || '0.0.0.0/0',
        assigned_ip: '10.0.0.3',
        persistent_keepalive: clientData.persistent_keepalive || 25,
        is_enabled: true,
        rx_bytes: 0,
        tx_bytes: 0,
        connection_status: 'disconnected' as const,
        config_downloaded: false,
        download_count: 0,
        description: clientData.description,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      } as WireGuardClient),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wireguard-clients'] });
    },
    onError: (error) => {
      logger.error('Create client error:', error);
    }
  });
};

export const useUpdateClient = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<WireGuardClient> }) => 
      Promise.resolve({ ...mockClients.find(c => c.id === id)!, ...updates }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['wireguard-clients'] });
      queryClient.invalidateQueries({ queryKey: ['wireguard-client', data.id] });
    },
    onError: (error) => {
      logger.error('Update client error:', error);
    }
  });
};

export const useDeleteClient = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => Promise.resolve(true),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wireguard-clients'] });
    },
    onError: (error) => {
      logger.error('Delete client error:', error);
    }
  });
};

export const useToggleClient = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => Promise.resolve({ ...mockClients.find(c => c.id === id)!, is_enabled: !mockClients.find(c => c.id === id)?.is_enabled }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['wireguard-clients'] });
      queryClient.invalidateQueries({ queryKey: ['wireguard-client', data.id] });
    },
    onError: (error) => {
      logger.error('Toggle client error:', error);
    }
  });
};

// Configuration and Download Hooks
export const useGenerateClientConfig = () => {
  return useMutation({
    mutationFn: async (clientId: string) => {
      await new Promise(resolve => setTimeout(resolve, 500));
      return {
        config: `[Interface]\nPrivateKey = mock-private-key\nAddress = 10.0.0.2/24\nDNS = 1.1.1.1\n\n[Peer]\nPublicKey = mock-server-public-key\nEndpoint = vpn.example.com:51820\nAllowedIPs = 0.0.0.0/0\nPersistentKeepalive = 25`,
        qr_code: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0id2hpdGUiLz48dGV4dCB4PSIxMDAiIHk9IjEwMCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iYmxhY2siPk1vY2sgUVIgQ29kZTwvdGV4dD48L3N2Zz4='
      };
    },
    onError: (error) => {
      logger.error('Generate config error:', error);
    }
  });
};

export const useGenerateKeyPair = () => {
  return useMutation({
    mutationFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 200));
      return {
        private_key: 'mock-generated-private-key',
        public_key: 'mock-generated-public-key'
      };
    },
    onError: (error) => {
      logger.error('Generate key pair error:', error);
    }
  });
};

export const useRegenerateClientKeys = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (clientId: string) => Promise.resolve({ ...mockClients.find(c => c.id === clientId)!, public_key: 'new-mock-key', private_key: 'new-mock-private-key' }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['wireguard-clients'] });
      queryClient.invalidateQueries({ queryKey: ['wireguard-client', data.id] });
    },
    onError: (error) => {
      logger.error('Regenerate keys error:', error);
    }
  });
};

// Statistics Hooks
export const useServerStats = (serverId: string) => {
  return useQuery({
    queryKey: ['wireguard-server-stats', serverId],
    queryFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 200));
      return {
        total_clients: 5,
        active_clients: 3,
        total_rx_bytes: 1024 * 1024 * 100,
        total_tx_bytes: 1024 * 1024 * 50
      };
    },
    enabled: !!serverId,
    refetchInterval: 10000
  });
};

// Bulk Operations Hooks
export const useBulkEnableClients = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (clientIds: string[]) => Promise.resolve(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wireguard-clients'] });
    },
    onError: (error) => {
      logger.error('Bulk enable error:', error);
    }
  });
};

export const useBulkDisableClients = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (clientIds: string[]) => Promise.resolve(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wireguard-clients'] });
    },
    onError: (error) => {
      logger.error('Bulk disable error:', error);
    }
  });
};