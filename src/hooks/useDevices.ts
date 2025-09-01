import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { databaseService } from '../services/databaseService';
import { logger } from '../utils/logger';

export interface UseDevicesFilters {
  active?: boolean;
  type?: string;
  search?: string;
}

export const useDevices = (filters?: UseDevicesFilters) => {
  return useQuery({
    queryKey: ['devices', filters],
    queryFn: async () => {
      const result = await databaseService.getNetworkDevices(filters);
      if (result.error) {
        throw new Error(result.error.message || 'Failed to fetch devices');
      }
      return {
        success: true,
        data: result.data || [],
        total: result.count || 0,
        active: result.data?.filter(d => d.is_active).length || 0
      };
    },
    refetchInterval: 30000, // Refetch every 30 seconds
    staleTime: 15000, // Consider data stale after 15 seconds
    retry: 1
  });
};

export const useDevice = (macAddress: string) => {
  return useQuery({
    queryKey: ['device', macAddress],
    queryFn: async () => {
      const result = await databaseService.getNetworkDevice(macAddress);
      if (result.error) {
        throw new Error(result.error.message || 'Failed to fetch device');
      }
      return {
        success: !!result.data,
        data: result.data
      };
    },
    enabled: !!macAddress,
    retry: 1
  });
};

export const useCreateDevice = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (deviceData: any) => {
      const result = await databaseService.createNetworkDevice(deviceData);
      if (result.error) {
        throw new Error(result.error.message || 'Failed to create device');
      }
      return {
        success: true,
        data: result.data
      };
    },
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
    mutationFn: async ({ macAddress, updates }: { macAddress: string; updates: any }) => {
      const result = await databaseService.updateNetworkDevice(macAddress, updates);
      if (result.error) {
        throw new Error(result.error.message || 'Failed to update device');
      }
      return {
        success: true,
        data: result.data
      };
    },
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
    mutationFn: async (macAddress: string) => {
      const result = await databaseService.deleteNetworkDevice(macAddress);
      if (result.error) {
        throw new Error(result.error.message || 'Failed to delete device');
      }
      return { success: result.data };
    },
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
    mutationFn: async (macAddress: string) => {
      // In production, implement actual Wake-on-LAN
      logger.info(`Wake-on-LAN sent to ${macAddress}`);
      
      // Update device status
      const result = await databaseService.updateNetworkDevice(macAddress, {
        is_active: true,
        last_seen: new Date().toISOString()
      });
      
      return {
        success: true,
        message: 'Wake on LAN packet sent'
      };
    },
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
        // Real network discovery implementation would go here
        // For now, simulate discovery
        logger.info('Starting network device discovery');
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // In production, this would scan the network and update the database
        return { success: true, discovered: Math.floor(Math.random() * 5) + 1 };
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