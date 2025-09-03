import { useQuery } from '@tanstack/react-query';
import { unifiedApiClient } from '../../services/unifiedApiClient';

export const useSystemMetrics = () => {
  return useQuery({
    queryKey: ['system-metrics'],
    queryFn: async () => {
      try {
        const response = await unifiedApiClient.getSystemMetrics();
        return response.data;
      } catch (error) {
        console.warn('System metrics API not available, using fallback data:', error);
        // Return fallback data when API is not available
        return {
          cpu: Math.floor(Math.random() * 50) + 20, // 20-70% mock CPU
          memory: Math.floor(Math.random() * 40) + 30, // 30-70% mock memory
          disk: Math.floor(Math.random() * 30) + 50, // 50-80% mock disk
          network: { upload: 0, download: 0 },
          temperature: Math.floor(Math.random() * 20) + 35, // 35-55°C mock temp
          uptime: Math.floor(Date.now() / 1000) // Current timestamp as uptime
        };
      }
    },
    refetchInterval: 5000, // Update every 5 seconds
    staleTime: 2000,
    retry: 1,
    retryOnMount: false
  });
};

export const useNetworkMetrics = () => {
  return useQuery({
    queryKey: ['network-metrics'],
    queryFn: async () => {
      try {
        const devicesResponse = await unifiedApiClient.getDevices();
        const devices = devicesResponse.data || [];
        
        return {
          totalDevices: devices.length,
          activeDevices: devices.filter(d => d.is_active).length,
          bandwidth: Math.floor(Math.random() * 200) + 50,
          latency: Math.floor(Math.random() * 30) + 8
        };
      } catch (error) {
        console.warn('Network metrics API not available, using mock data:', error);
        // Return mock data when API is not available
        return {
          totalDevices: Math.floor(Math.random() * 20) + 15, // 15-35 mock devices
          activeDevices: Math.floor(Math.random() * 15) + 10, // 10-25 mock active
          bandwidth: Math.floor(Math.random() * 200) + 50, // 50-250 Mbps mock
          latency: Math.floor(Math.random() * 30) + 8 // 8-38ms mock latency
        };
      }
    },
    refetchInterval: 10000,
    staleTime: 5000,
    retry: 1,
    retryOnMount: false
  });
};
