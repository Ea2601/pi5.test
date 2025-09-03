import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { logger } from '../../utils/logger';

const mockServers = [
  {
    id: 'server-1',
    name: 'Main VPN Server',
    interface_name: 'wg0',
    listen_port: 51820,
    network_cidr: '10.0.0.0/24',
    is_active: true
  }
];

export const useWireGuardServers = () => {
  return useQuery({
    queryKey: ['wireguard-servers'],
    queryFn: async () => mockServers,
    refetchInterval: 30000
  });
};

export const useCreateServer = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (serverData: any) => {
      await new Promise(resolve => setTimeout(resolve, 500));
      return { ...serverData, id: `server-${Date.now()}` };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wireguard-servers'] });
    },
    onError: (error) => {
      logger.error('Create server error:', error);
    }
  });
};