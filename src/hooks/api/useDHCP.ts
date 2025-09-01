import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dhcpService } from '../../services/dhcpService';
import { DHCPPool, DHCPReservation, DHCPDeviceGroup, DHCPLease, DHCPSecurityPolicy, DHCPOption } from '../../types/dhcp';
import { logger } from '../../utils/logger';

// DHCP Pools Hooks
export const useDHCPPools = () => {
  return useQuery({
    queryKey: ['dhcp-pools'],
    queryFn: () => dhcpService.getDHCPPools(),
    refetchInterval: 60000,
    staleTime: 30000
  });
};

export const useCreateDHCPPool = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (pool: Partial<DHCPPool>) => dhcpService.createDHCPPool(pool),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dhcp-pools'] });
      queryClient.invalidateQueries({ queryKey: ['dhcp-stats'] });
    },
    onError: (error) => {
      logger.error('Create DHCP pool error:', error);
    }
  });
};

export const useUpdateDHCPPool = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<DHCPPool> }) => 
      dhcpService.updateDHCPPool(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dhcp-pools'] });
      queryClient.invalidateQueries({ queryKey: ['dhcp-stats'] });
    },
    onError: (error) => {
      logger.error('Update DHCP pool error:', error);
    }
  });
};

export const useDeleteDHCPPool = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => dhcpService.deleteDHCPPool(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dhcp-pools'] });
      queryClient.invalidateQueries({ queryKey: ['dhcp-stats'] });
    },
    onError: (error) => {
      logger.error('Delete DHCP pool error:', error);
    }
  });
};

// DHCP Reservations Hooks
export const useDHCPReservations = (filters?: { group_id?: string; pool_id?: string }) => {
  return useQuery({
    queryKey: ['dhcp-reservations', filters],
    queryFn: () => dhcpService.getDHCPReservations(filters),
    refetchInterval: 30000,
    staleTime: 15000
  });
};

export const useCreateDHCPReservation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (reservation: Partial<DHCPReservation>) => dhcpService.createDHCPReservation(reservation),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dhcp-reservations'] });
      queryClient.invalidateQueries({ queryKey: ['dhcp-stats'] });
    },
    onError: (error) => {
      logger.error('Create DHCP reservation error:', error);
    }
  });
};

export const useUpdateDHCPReservation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<DHCPReservation> }) => 
      dhcpService.updateDHCPReservation(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dhcp-reservations'] });
    },
    onError: (error) => {
      logger.error('Update DHCP reservation error:', error);
    }
  });
};

export const useDeleteDHCPReservation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => dhcpService.deleteDHCPReservation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dhcp-reservations'] });
      queryClient.invalidateQueries({ queryKey: ['dhcp-stats'] });
    },
    onError: (error) => {
      logger.error('Delete DHCP reservation error:', error);
    }
  });
};

// Device Groups Hooks
export const useDHCPDeviceGroups = () => {
  return useQuery({
    queryKey: ['dhcp-device-groups'],
    queryFn: () => dhcpService.getDeviceGroups(),
    staleTime: 300000 // 5 minutes - groups don't change often
  });
};

export const useCreateDHCPDeviceGroup = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (group: Partial<DHCPDeviceGroup>) => dhcpService.createDeviceGroup(group),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dhcp-device-groups'] });
    },
    onError: (error) => {
      logger.error('Create device group error:', error);
    }
  });
};

// Active Leases Hooks
export const useActiveDHCPLeases = () => {
  return useQuery({
    queryKey: ['dhcp-active-leases'],
    queryFn: () => dhcpService.getActiveLeases(),
    refetchInterval: 30000,
    staleTime: 15000
  });
};

export const useReleaseIP = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (macAddress: string) => dhcpService.releaseIP(macAddress),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dhcp-active-leases'] });
      queryClient.invalidateQueries({ queryKey: ['dhcp-stats'] });
    },
    onError: (error) => {
      logger.error('Release IP error:', error);
    }
  });
};

export const useRenewLease = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, leaseTime }: { id: string; leaseTime?: string }) => 
      dhcpService.renewLease(id, leaseTime),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dhcp-active-leases'] });
    },
    onError: (error) => {
      logger.error('Renew lease error:', error);
    }
  });
};

// Security Policies Hooks
export const useDHCPSecurityPolicies = () => {
  return useQuery({
    queryKey: ['dhcp-security-policies'],
    queryFn: () => dhcpService.getSecurityPolicies(),
    staleTime: 300000
  });
};

export const useCreateDHCPSecurityPolicy = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (policy: Partial<DHCPSecurityPolicy>) => dhcpService.createSecurityPolicy(policy),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dhcp-security-policies'] });
    },
    onError: (error) => {
      logger.error('Create security policy error:', error);
    }
  });
};

// DHCP Options Hooks
export const useDHCPOptions = () => {
  return useQuery({
    queryKey: ['dhcp-options'],
    queryFn: () => dhcpService.getDHCPOptions(),
    staleTime: 300000
  });
};

export const useCreateDHCPOption = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (option: Partial<DHCPOption>) => dhcpService.createDHCPOption(option),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dhcp-options'] });
    },
    onError: (error) => {
      logger.error('Create DHCP option error:', error);
    }
  });
};

// DHCP Logs Hooks
export const useDHCPLogs = (filters?: {
  mac_address?: string;
  event_type?: string;
  start_date?: string;
  end_date?: string;
  limit?: number;
}) => {
  return useQuery({
    queryKey: ['dhcp-logs', filters],
    queryFn: () => dhcpService.getDHCPLogs(filters),
    refetchInterval: 30000,
    staleTime: 15000
  });
};

// DHCP Statistics Hooks
export const useDHCPStats = () => {
  return useQuery({
    queryKey: ['dhcp-stats'],
    queryFn: () => dhcpService.getDHCPStats(),
    refetchInterval: 60000,
    staleTime: 30000
  });
};

// System Management Hooks
export const useApplyDHCPConfiguration = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => dhcpService.applyDHCPConfiguration(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dhcp-pools'] });
      queryClient.invalidateQueries({ queryKey: ['dhcp-reservations'] });
      queryClient.invalidateQueries({ queryKey: ['dhcp-active-leases'] });
    },
    onError: (error) => {
      logger.error('Apply DHCP configuration error:', error);
    }
  });
};

export const useDiscoverDHCPServers = () => {
  return useMutation({
    mutationFn: () => dhcpService.discoverDHCPServers(),
    onError: (error) => {
      logger.error('Discover DHCP servers error:', error);
    }
  });
};

export const useGetNextAvailableIP = () => {
  return useMutation({
    mutationFn: (poolId: string) => dhcpService.getNextAvailableIP(poolId),
    onError: (error) => {
      logger.error('Get next available IP error:', error);
    }
  });
};

export const useBulkCreateReservations = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (reservations: Array<Partial<DHCPReservation>>) => 
      dhcpService.bulkCreateReservations(reservations),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dhcp-reservations'] });
      queryClient.invalidateQueries({ queryKey: ['dhcp-stats'] });
    },
    onError: (error) => {
      logger.error('Bulk create reservations error:', error);
    }
  });
};

export const useCleanupExpiredLeases = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => dhcpService.cleanupExpiredLeases(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dhcp-active-leases'] });
      queryClient.invalidateQueries({ queryKey: ['dhcp-stats'] });
    },
    onError: (error) => {
      logger.error('Cleanup expired leases error:', error);
    }
  });
};

export const useSyncWithNetworkDevices = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => dhcpService.syncWithNetworkDevices(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['devices'] });
      queryClient.invalidateQueries({ queryKey: ['dhcp-stats'] });
    },
    onError: (error) => {
      logger.error('Sync with network devices error:', error);
    }
  });
};