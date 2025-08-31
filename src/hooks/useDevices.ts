import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchDevices, fetchDevice, createDevice, updateDevice, deleteDevice, wakeDevice } from '../mocks/queries';
import { logger } from '../utils/logger';

export interface UseDevicesFilters {
  active?: boolean;
  type?: string;
  search?: string;
}

export const useDevices = (filters?: UseDevicesFilters) => {
  return useQuery({
    queryKey: ['devices', filters],
    queryFn: () => fetchDevices(filters),
    refetchInterval: 30000, // Refetch every 30 seconds
    staleTime: 15000, // Consider data stale after 15 seconds
    retry: 1
  });
};

export const useDevice = (macAddress: string) => {
  return useQuery({
    queryKey: ['device', macAddress],
    queryFn: () => fetchDevice(macAddress),
    enabled: !!macAddress,
    retry: 1
  });
};

export const useCreateDevice = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createDevice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['devices'] });
    },
    onError: (error) => {
      logger.error('Create device error:', error);
    }
  });
};

export const useUpdateDevice = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ macAddress, updates }: { macAddress: string; updates: any }) => 
      updateDevice(macAddress, updates),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['devices'] });
      queryClient.invalidateQueries({ queryKey: ['device', variables.macAddress] });
    },
    onError: (error) => {
      logger.error('Update device error:', error);
    }
  });
};

export const useDeleteDevice = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteDevice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['devices'] });
    },
    onError: (error) => {
      logger.error('Delete device error:', error);
    }
  });
};

export const useWakeDevice = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: wakeDevice,
    onSuccess: (data, macAddress) => {
      queryClient.invalidateQueries({ queryKey: ['devices'] });
      queryClient.invalidateQueries({ queryKey: ['device', macAddress] });
    },
    onError: (error) => {
      logger.error('Wake device error:', error);
    }
  });
};

export const useDiscoverDevices = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      try {
        // Mock device discovery
        await new Promise(resolve => setTimeout(resolve, 2000));
        return { success: true, discovered: 2 };
      } catch (error) {
        logger.error('Device discovery failed:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['devices'] });
    },
    onError: (error) => {
      logger.error('Device discovery error:', error);
    }
  });
};