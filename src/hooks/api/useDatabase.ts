import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { databaseService } from '../../services/databaseService';
import { FilterOptions, PaginationOptions, NetworkDevice, TrafficRule, ClientGroup, TunnelPool } from '../../types/database';
import { logger } from '../../utils/logger';

// Network Devices Hooks
export const useNetworkDevices = (filters?: FilterOptions, pagination?: PaginationOptions) => {
  return useQuery({
    queryKey: ['network-devices', filters, pagination],
    queryFn: () => databaseService.getNetworkDevices(filters, pagination),
    refetchInterval: 30000,
    staleTime: 15000,
    retry: 2,
    retryDelay: 1000
  });
};

export const useNetworkDevice = (macAddress: string) => {
  return useQuery({
    queryKey: ['network-device', macAddress],
    queryFn: () => databaseService.getNetworkDevice(macAddress),
    enabled: !!macAddress,
    retry: 1
  });
};

export const useCreateNetworkDevice = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (device: Partial<NetworkDevice>) => databaseService.createNetworkDevice(device),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['network-devices'] });
      logger.info('Network device created successfully');
    },
    onError: (error) => {
      logger.error('Failed to create network device:', error);
    }
  });
};

export const useUpdateNetworkDevice = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ macAddress, updates }: { macAddress: string; updates: Partial<NetworkDevice> }) => 
      databaseService.updateNetworkDevice(macAddress, updates),
    onSuccess: (result, variables) => {
      queryClient.invalidateQueries({ queryKey: ['network-devices'] });
      queryClient.invalidateQueries({ queryKey: ['network-device', variables.macAddress] });
      logger.info('Network device updated successfully');
    },
    onError: (error) => {
      logger.error('Failed to update network device:', error);
    }
  });
};

export const useDeleteNetworkDevice = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (macAddress: string) => databaseService.deleteNetworkDevice(macAddress),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['network-devices'] });
      logger.info('Network device deleted successfully');
    },
    onError: (error) => {
      logger.error('Failed to delete network device:', error);
    }
  });
};

// Traffic Rules Hooks
export const useTrafficRules = (filters?: FilterOptions) => {
  return useQuery({
    queryKey: ['traffic-rules', filters],
    queryFn: () => databaseService.getTrafficRules(filters),
    refetchInterval: 60000,
    staleTime: 30000,
    retry: 2
  });
};

export const useCreateTrafficRule = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (rule: Partial<TrafficRule>) => databaseService.createTrafficRule(rule),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['traffic-rules'] });
      logger.info('Traffic rule created successfully');
    },
    onError: (error) => {
      logger.error('Failed to create traffic rule:', error);
    }
  });
};

// Client Groups Hooks
export const useClientGroups = () => {
  return useQuery({
    queryKey: ['client-groups'],
    queryFn: () => databaseService.getClientGroups(),
    staleTime: 300000, // 5 minutes - groups don't change often
    retry: 2
  });
};

export const useCreateClientGroup = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (group: Partial<ClientGroup>) => databaseService.createClientGroup(group),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client-groups'] });
      logger.info('Client group created successfully');
    },
    onError: (error) => {
      logger.error('Failed to create client group:', error);
    }
  });
};

// Tunnel Pools Hooks
export const useTunnelPools = () => {
  return useQuery({
    queryKey: ['tunnel-pools'],
    queryFn: () => databaseService.getTunnelPools(),
    refetchInterval: 60000,
    staleTime: 30000,
    retry: 2
  });
};

export const useCreateTunnelPool = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (pool: Partial<TunnelPool>) => databaseService.createTunnelPool(pool),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tunnel-pools'] });
      logger.info('Tunnel pool created successfully');
    },
    onError: (error) => {
      logger.error('Failed to create tunnel pool:', error);
    }
  });
};

// Analytics Hooks
export const useRoutingHistory = (filters?: {
  startDate?: string;
  endDate?: string;
  sourceIp?: string;
  limit?: number;
}) => {
  return useQuery({
    queryKey: ['routing-history', filters],
    queryFn: () => databaseService.getRoutingHistory(filters),
    refetchInterval: 30000,
    staleTime: 15000,
    retry: 1
  });
};

export const useTunnelPerformance = (tunnelId?: string) => {
  return useQuery({
    queryKey: ['tunnel-performance', tunnelId],
    queryFn: () => databaseService.getTunnelPerformance(tunnelId),
    refetchInterval: 10000, // More frequent for performance data
    staleTime: 5000,
    retry: 1
  });
};

// Database Health Hook
export const useDatabaseHealth = () => {
  return useQuery({
    queryKey: ['database-health'],
    queryFn: () => databaseService.checkDatabaseHealth(),
    refetchInterval: 60000,
    staleTime: 30000,
    retry: 3,
    retryDelay: 2000
  });
};

// Real-time hooks
export const useDeviceSubscription = (callback: (payload: any) => void) => {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ['device-subscription'],
    queryFn: () => {
      const subscription = databaseService.subscribeToDeviceChanges((payload) => {
        callback(payload);
        // Invalidate device queries on changes
        queryClient.invalidateQueries({ queryKey: ['network-devices'] });
      });
      return subscription;
    },
    refetchOnWindowFocus: false,
    refetchInterval: false,
    staleTime: Infinity
  });
};

export const useTrafficRuleSubscription = (callback: (payload: any) => void) => {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ['traffic-rule-subscription'],
    queryFn: () => {
      const subscription = databaseService.subscribeToTrafficRules((payload) => {
        callback(payload);
        // Invalidate traffic rule queries on changes
        queryClient.invalidateQueries({ queryKey: ['traffic-rules'] });
      });
      return subscription;
    },
    refetchOnWindowFocus: false,
    refetchInterval: false,
    staleTime: Infinity
  });
};