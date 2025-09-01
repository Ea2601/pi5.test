import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dnsService } from '../../services/dnsService';
import { DNSServer, DNSProfile, DNSZoneConfig, DNSDeviceAssignment, DNSBlocklist } from '../../types/dns';
import { logger } from '../../utils/logger';

// DNS Servers Hooks
export const useDNSServers = () => {
  return useQuery({
    queryKey: ['dns-servers'],
    queryFn: () => dnsService.getDNSServers(),
    refetchInterval: 60000,
    staleTime: 30000
  });
};

export const useCreateDNSServer = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (server: Partial<DNSServer>) => dnsService.createDNSServer(server),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dns-servers'] });
    },
    onError: (error) => {
      logger.error('Create DNS server error:', error);
    }
  });
};

export const useUpdateDNSServer = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<DNSServer> }) => 
      dnsService.updateDNSServer(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dns-servers'] });
    },
    onError: (error) => {
      logger.error('Update DNS server error:', error);
    }
  });
};

export const useDeleteDNSServer = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => dnsService.deleteDNSServer(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dns-servers'] });
    },
    onError: (error) => {
      logger.error('Delete DNS server error:', error);
    }
  });
};

export const useTestDNSServer = () => {
  return useMutation({
    mutationFn: (ipAddress: string) => dnsService.testDNSServer(ipAddress),
    onError: (error) => {
      logger.error('Test DNS server error:', error);
    }
  });
};

// DNS Profiles Hooks
export const useDNSProfiles = () => {
  return useQuery({
    queryKey: ['dns-profiles'],
    queryFn: () => dnsService.getDNSProfiles(),
    staleTime: 300000 // 5 minutes - profiles don't change often
  });
};

export const useCreateDNSProfile = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (profile: Partial<DNSProfile>) => dnsService.createDNSProfile(profile),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dns-profiles'] });
    },
    onError: (error) => {
      logger.error('Create DNS profile error:', error);
    }
  });
};

export const useUpdateDNSProfile = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<DNSProfile> }) => 
      dnsService.updateDNSProfile(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dns-profiles'] });
    },
    onError: (error) => {
      logger.error('Update DNS profile error:', error);
    }
  });
};

// Zone Management Hooks
export const useDNSZones = () => {
  return useQuery({
    queryKey: ['dns-zones'],
    queryFn: () => dnsService.getDNSZones(),
    staleTime: 300000
  });
};

export const useCreateDNSZone = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (zone: Partial<DNSZoneConfig>) => dnsService.createDNSZone(zone),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dns-zones'] });
    },
    onError: (error) => {
      logger.error('Create DNS zone error:', error);
    }
  });
};

// Device Assignments Hooks
export const useDNSDeviceAssignments = () => {
  return useQuery({
    queryKey: ['dns-device-assignments'],
    queryFn: () => dnsService.getDeviceAssignments(),
    refetchInterval: 60000,
    staleTime: 30000
  });
};

export const useAssignDNSToDevice = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (assignment: Partial<DNSDeviceAssignment>) => dnsService.assignDNSToDevice(assignment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dns-device-assignments'] });
    },
    onError: (error) => {
      logger.error('Assign DNS to device error:', error);
    }
  });
};

// Query Logs Hooks
export const useDNSQueryLogs = (filters?: {
  device_mac?: string;
  domain?: string;
  blocked_only?: boolean;
  start_date?: string;
  end_date?: string;
  limit?: number;
}) => {
  return useQuery({
    queryKey: ['dns-query-logs', filters],
    queryFn: () => dnsService.getDNSQueryLogs(filters),
    refetchInterval: 30000,
    staleTime: 15000
  });
};

// Blocklist Hooks
export const useDNSBlocklists = () => {
  return useQuery({
    queryKey: ['dns-blocklists'],
    queryFn: () => dnsService.getBlocklists(),
    staleTime: 300000
  });
};

export const useCreateBlocklist = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (blocklist: Partial<DNSBlocklist>) => dnsService.createBlocklist(blocklist),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dns-blocklists'] });
    },
    onError: (error) => {
      logger.error('Create blocklist error:', error);
    }
  });
};

// System Management Hooks
export const useApplyDNSConfiguration = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => dnsService.applyDNSConfiguration(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dns-servers'] });
      queryClient.invalidateQueries({ queryKey: ['dns-profiles'] });
    },
    onError: (error) => {
      logger.error('Apply DNS configuration error:', error);
    }
  });
};

export const useFlushDNSCache = () => {
  return useMutation({
    mutationFn: () => dnsService.flushDNSCache(),
    onError: (error) => {
      logger.error('Flush DNS cache error:', error);
    }
  });
};

export const useValidateDNSConfiguration = () => {
  return useMutation({
    mutationFn: () => dnsService.validateDNSConfiguration(),
    onError: (error) => {
      logger.error('Validate DNS configuration error:', error);
    }
  });
};

// Analytics Hooks
export const useDNSStats = (timeRange: '1h' | '24h' | '7d' | '30d' = '24h') => {
  return useQuery({
    queryKey: ['dns-stats', timeRange],
    queryFn: () => dnsService.getDNSStats(timeRange),
    refetchInterval: 60000,
    staleTime: 30000
  });
};

export const useDNSHealthCheck = () => {
  return useQuery({
    queryKey: ['dns-health'],
    queryFn: async () => {
      const servers = await dnsService.getDNSServers();
      const activeServers = servers.filter(s => s.is_active);
      
      const healthChecks = await Promise.all(
        activeServers.map(async (server) => {
          const result = await dnsService.testDNSServer(server.ip_address);
          return {
            server: server.name,
            healthy: result.success,
            response_time: result.response_time,
            error: result.error
          };
        })
      );

      return {
        overall_health: healthChecks.every(h => h.healthy),
        server_health: healthChecks,
        total_servers: servers.length,
        active_servers: activeServers.length
      };
    },
    refetchInterval: 30000,
    staleTime: 15000
  });
};