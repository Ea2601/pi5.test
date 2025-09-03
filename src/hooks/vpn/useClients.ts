import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { logger } from '../../utils/logger';

const mockClients = [
  {
    id: 'client-1',
    name: 'Mobile Device',
    server_id: 'server-1',
    assigned_ip: '10.0.0.2',
    connection_status: 'connected',
    is_enabled: true
  }
];

export const useWireGuardClients = () => {
  return useQuery({
    queryKey: ['wireguard-clients'],
    queryFn: async () => mockClients,
    refetchInterval: 30000
  });
};

export const useCreateClient = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (clientData: any) => {
      await new Promise(resolve => setTimeout(resolve, 500));
      return { ...clientData, id: `client-${Date.now()}` };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wireguard-clients'] });
    },
    onError: (error) => {
      logger.error('Create client error:', error);
    }
  });
};