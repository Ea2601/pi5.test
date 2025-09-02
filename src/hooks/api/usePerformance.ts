import { useQuery } from '@tanstack/react-query';
import { unifiedApiClient } from '../../services/unifiedApiClient';

export const useSystemMetrics = () => {
  return useQuery({
    queryKey: ['system-metrics'],
    queryFn: async () => {
      const response = await unifiedApiClient.getSystemMetrics();
      return response.data;
    },
    refetchInterval: 5000, // Update every 5 seconds
    staleTime: 2000,
    retry: 1
  });
};

export const useNetworkMetrics = () => {
  return useQuery({
    queryKey: ['network-metrics'],
    queryFn: async () => {
      const devicesResponse = await unifiedApiClient.getDevices();
      const devices = devicesResponse.data || [];
      
      return {
        totalDevices: devices.length,
        activeDevices: devices.filter(d => d.is_active).length,
        bandwidth: Math.floor(Math.random() * 200) + 50, // Mock until real metrics
        latency: Math.floor(Math.random() * 30) + 8
      };
    },
    refetchInterval: 10000,
    staleTime: 5000,
    retry: 1
  });
};
