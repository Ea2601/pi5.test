import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { unifiedApiClient } from '../../services/unifiedApiClient';
import { logger } from '../../utils/logger';

export const useDevices = () => {
  return useQuery({
    queryKey: ['devices'],
    queryFn: () => unifiedApiClient.getDevices(),
    refetchInterval: 30000,
    staleTime: 15000,
    retry: 1
  });
};

export const useDiscoverDevices = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => unifiedApiClient.discoverDevices(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['devices'] });
    },
    onError: (error) => {
      logger.error('Device discovery error:', error);
    }
  });
};

export const useWakeDevice = () => {
  return useMutation({
    mutationFn: (macAddress: string) => unifiedApiClient.wakeDevice(macAddress),
    onError: (error) => {
      logger.error('Wake device error:', error);
    }
  });
};