import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { wifiService } from '../../services/wifiService';
import { 
  WiFiAccessPoint, 
  WiFiNetwork, 
  WiFiClient, 
  WiFiSecurityPolicy, 
  WiFiPerformanceLog,
  WiFiMeshNode,
  WiFiSchedule 
} from '../../types/wifi';
import { logger } from '../../utils/logger';

// Access Point Hooks
export const useWiFiAccessPoints = () => {
  return useQuery({
    queryKey: ['wifi-access-points'],
    queryFn: () => wifiService.getAccessPoints(),
    refetchInterval: 30000,
    staleTime: 15000
  });
};

export const useCreateAccessPoint = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (ap: Partial<WiFiAccessPoint>) => wifiService.createAccessPoint(ap),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wifi-access-points'] });
      queryClient.invalidateQueries({ queryKey: ['wifi-stats'] });
    },
    onError: (error) => {
      logger.error('Create access point error:', error);
    }
  });
};

export const useUpdateAccessPoint = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<WiFiAccessPoint> }) => 
      wifiService.updateAccessPoint(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wifi-access-points'] });
    },
    onError: (error) => {
      logger.error('Update access point error:', error);
    }
  });
};

export const useDeleteAccessPoint = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => wifiService.deleteAccessPoint(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wifi-access-points'] });
      queryClient.invalidateQueries({ queryKey: ['wifi-networks'] });
    },
    onError: (error) => {
      logger.error('Delete access point error:', error);
    }
  });
};

// Wi-Fi Network Hooks
export const useWiFiNetworks = (apId?: string) => {
  return useQuery({
    queryKey: ['wifi-networks', apId],
    queryFn: () => wifiService.getWiFiNetworks(apId),
    refetchInterval: 30000,
    staleTime: 15000
  });
};

export const useCreateWiFiNetwork = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (network: Partial<WiFiNetwork>) => wifiService.createWiFiNetwork(network),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wifi-networks'] });
      queryClient.invalidateQueries({ queryKey: ['wifi-stats'] });
    },
    onError: (error) => {
      logger.error('Create WiFi network error:', error);
    }
  });
};

export const useUpdateWiFiNetwork = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<WiFiNetwork> }) => 
      wifiService.updateWiFiNetwork(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wifi-networks'] });
    },
    onError: (error) => {
      logger.error('Update WiFi network error:', error);
    }
  });
};

export const useDeleteWiFiNetwork = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => wifiService.deleteWiFiNetwork(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wifi-networks'] });
      queryClient.invalidateQueries({ queryKey: ['wifi-stats'] });
    },
    onError: (error) => {
      logger.error('Delete WiFi network error:', error);
    }
  });
};

export const useToggleWiFiNetwork = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => wifiService.toggleWiFiNetwork(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wifi-networks'] });
    },
    onError: (error) => {
      logger.error('Toggle WiFi network error:', error);
    }
  });
};

// Wi-Fi Client Hooks
export const useWiFiClients = (filters?: {
  network_id?: string;
  ap_id?: string;
  status?: string;
  limit?: number;
}) => {
  return useQuery({
    queryKey: ['wifi-clients', filters],
    queryFn: () => wifiService.getWiFiClients(filters),
    refetchInterval: 15000,
    staleTime: 10000
  });
};

export const useDisconnectWiFiClient = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => wifiService.disconnectClient(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wifi-clients'] });
    },
    onError: (error) => {
      logger.error('Disconnect WiFi client error:', error);
    }
  });
};

export const useBlockWiFiClient = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (macAddress: string) => wifiService.blockClient(macAddress),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wifi-clients'] });
    },
    onError: (error) => {
      logger.error('Block WiFi client error:', error);
    }
  });
};

export const useUnblockWiFiClient = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (macAddress: string) => wifiService.unblockClient(macAddress),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wifi-clients'] });
    },
    onError: (error) => {
      logger.error('Unblock WiFi client error:', error);
    }
  });
};

// Security Policy Hooks
export const useWiFiSecurityPolicies = () => {
  return useQuery({
    queryKey: ['wifi-security-policies'],
    queryFn: () => wifiService.getSecurityPolicies(),
    staleTime: 300000
  });
};

export const useCreateWiFiSecurityPolicy = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (policy: Partial<WiFiSecurityPolicy>) => wifiService.createSecurityPolicy(policy),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wifi-security-policies'] });
    },
    onError: (error) => {
      logger.error('Create WiFi security policy error:', error);
    }
  });
};

export const useUpdateWiFiSecurityPolicy = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<WiFiSecurityPolicy> }) => 
      wifiService.updateSecurityPolicy(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wifi-security-policies'] });
    },
    onError: (error) => {
      logger.error('Update WiFi security policy error:', error);
    }
  });
};

// Performance Monitoring Hooks
export const useWiFiPerformanceLogs = (filters?: {
  ap_id?: string;
  hours?: number;
}) => {
  return useQuery({
    queryKey: ['wifi-performance-logs', filters],
    queryFn: () => wifiService.getPerformanceLogs(filters),
    refetchInterval: 60000,
    staleTime: 30000
  });
};

// Channel Analysis Hooks
export const useAnalyzeChannels = () => {
  return useMutation({
    mutationFn: (apId: string) => wifiService.analyzeChannels(apId),
    onError: (error) => {
      logger.error('Analyze channels error:', error);
    }
  });
};

export const useOptimizeChannels = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (apId: string) => wifiService.optimizeChannels(apId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wifi-access-points'] });
      queryClient.invalidateQueries({ queryKey: ['wifi-performance-logs'] });
    },
    onError: (error) => {
      logger.error('Optimize channels error:', error);
    }
  });
};

// Mesh Network Hooks
export const useWiFiMeshNodes = () => {
  return useQuery({
    queryKey: ['wifi-mesh-nodes'],
    queryFn: () => wifiService.getMeshNodes(),
    refetchInterval: 30000,
    staleTime: 15000
  });
};

// Schedule Hooks
export const useWiFiSchedules = (networkId?: string) => {
  return useQuery({
    queryKey: ['wifi-schedules', networkId],
    queryFn: () => wifiService.getWiFiSchedules(networkId),
    staleTime: 300000
  });
};

export const useCreateWiFiSchedule = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (schedule: Partial<WiFiSchedule>) => wifiService.createWiFiSchedule(schedule),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wifi-schedules'] });
    },
    onError: (error) => {
      logger.error('Create WiFi schedule error:', error);
    }
  });
};

// Statistics Hooks
export const useWiFiStats = () => {
  return useQuery({
    queryKey: ['wifi-stats'],
    queryFn: () => wifiService.getWiFiStats(),
    refetchInterval: 30000,
    staleTime: 15000
  });
};

// Security Operations Hooks
export const useScanRogueAPs = () => {
  return useMutation({
    mutationFn: () => wifiService.scanForRogueAPs(),
    onError: (error) => {
      logger.error('Scan rogue APs error:', error);
    }
  });
};

// System Management Hooks
export const useApplyWiFiConfiguration = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => wifiService.applyWiFiConfiguration(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wifi-networks'] });
      queryClient.invalidateQueries({ queryKey: ['wifi-access-points'] });
    },
    onError: (error) => {
      logger.error('Apply WiFi configuration error:', error);
    }
  });
};

export const useRestartWiFiService = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (apId?: string) => wifiService.restartWiFiService(apId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wifi-access-points'] });
      queryClient.invalidateQueries({ queryKey: ['wifi-clients'] });
    },
    onError: (error) => {
      logger.error('Restart WiFi service error:', error);
    }
  });
};

// Guest Network Hook
export const useCreateGuestNetwork = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ apId, config }: { 
      apId: string; 
      config: {
        ssid: string;
        password: string;
        duration_hours?: number;
        bandwidth_limit_mbps?: number;
      }
    }) => wifiService.createGuestNetwork(apId, config),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wifi-networks'] });
      queryClient.invalidateQueries({ queryKey: ['wifi-schedules'] });
    },
    onError: (error) => {
      logger.error('Create guest network error:', error);
    }
  });
};

// Real-time Monitoring Hooks
export const useWiFiClientSignals = () => {
  return useQuery({
    queryKey: ['wifi-client-signals'],
    queryFn: () => wifiService.getClientSignalStrengths(),
    refetchInterval: 10000,
    staleTime: 5000
  });
};

export const useWiFiHealthCheck = () => {
  return useQuery({
    queryKey: ['wifi-health'],
    queryFn: () => wifiService.performWiFiHealthCheck(),
    refetchInterval: 60000,
    staleTime: 30000
  });
};

// Bandwidth Management Hooks
export const useSetClientBandwidth = () => {
  return useMutation({
    mutationFn: ({ clientId, limitMbps }: { clientId: string; limitMbps: number }) => 
      wifiService.setClientBandwidthLimit(clientId, limitMbps),
    onError: (error) => {
      logger.error('Set client bandwidth error:', error);
    }
  });
};

export const useSetNetworkBandwidth = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ networkId, limitMbps }: { networkId: string; limitMbps: number }) => 
      wifiService.setNetworkBandwidthLimit(networkId, limitMbps),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wifi-networks'] });
    },
    onError: (error) => {
      logger.error('Set network bandwidth error:', error);
    }
  });
};