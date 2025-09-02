import { unifiedApiClient } from '../services/unifiedApiClient';
import { NetworkAPI } from '../../shared/types/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface UseDevicesFilters {
  active?: boolean;
  type?: string;
  search?: string;
}

export const useDevices = (filters?: UseDevicesFilters) => {
  return useQuery({
    queryKey: ['devices', filters],
    queryFn: async () => {
      try {
        const response = await unifiedApiClient.getDevices(filters);
        console.log('Devices fetched successfully', {
          count: response.data?.length || 0,
          filters
        });
        return response;
      } catch (error) {
        console.warn('Failed to fetch devices, using empty state:', error);
        return {
          success: false,
          data: [],
          total: 0,
          active: 0,
          error: 'Device data temporarily unavailable',
          timestamp: new Date().toISOString()
        };
      }
    },
    refetchInterval: 30000,
    staleTime: 15000,
    retry: 1,
    retryOnMount: false
  });
};

export const useDevice = (macAddress: string) => {
  return useQuery({
    queryKey: ['device', macAddress],
    queryFn: () => unifiedApiClient.getDevice(macAddress),
    enabled: !!macAddress,
    staleTime: 60000
  });
};

export const useCreateDevice = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (deviceData: any) => {
      // Validate input
      if (!deviceData.mac_address || !deviceData.device_name) {
        throw new Error('MAC address and device name are required');
      }

      return unifiedApiClient.createDevice(deviceData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['devices'] });
      console.log('Device created successfully');
    },
    onError: (error) => {
      console.error('Failed to create device', { error: (error as Error).message });
    }
  });
};

export const useUpdateDevice = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ macAddress, updates }: { macAddress: string; updates: any }) => {
      return unifiedApiClient.updateDevice(macAddress, updates);
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['devices'] });
      queryClient.invalidateQueries({ queryKey: ['device', variables.macAddress] });
      console.log('Device updated successfully', { macAddress: variables.macAddress });
    },
    onError: (error) => {
      console.error('Failed to update device', { error: (error as Error).message });
    }
  });
};

export const useDeleteDevice = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (macAddress: string) => unifiedApiClient.deleteDevice(macAddress),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['devices'] });
      console.log('Device deleted successfully');
    },
    onError: (error) => {
      console.error('Failed to delete device', { error: (error as Error).message });
    }
  });
};

export const useWakeDevice = () => {
  return useMutation({
    mutationFn: (macAddress: string) => unifiedApiClient.wakeDevice(macAddress),
    onError: (error) => {
      console.error('Failed to wake device', { error: (error as Error).message });
    }
  });
};

// Device discovery hook
export const useDiscoverDevices = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => unifiedApiClient.discoverDevices(),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['devices'] });
      console.log('Device discovery completed', {
        discovered: data.data?.discovered || 0
      });
    },
    onError: (error) => {
      console.error('Device discovery failed', { error: (error as Error).message });
    }
  });
};