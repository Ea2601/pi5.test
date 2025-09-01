import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { speedTestService } from '../../services/speedTestService';
import { 
  SpeedTestProfile, 
  SpeedTestServer, 
  SpeedTestResult, 
  SpeedTestSchedule,
  DNSPingMonitor,
  DNSPingResult,
  NetworkInterface,
  SpeedTestAlert,
  SpeedTestConfig
} from '../../types/speedTest';
import { logger } from '../../utils/logger';

// Speed Test Profile Hooks
export const useSpeedTestProfiles = () => {
  return useQuery({
    queryKey: ['speed-test-profiles'],
    queryFn: () => speedTestService.getProfiles(),
    staleTime: 300000 // 5 minutes
  });
};

export const useCreateSpeedTestProfile = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (profile: Partial<SpeedTestProfile>) => speedTestService.createProfile(profile),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['speed-test-profiles'] });
    },
    onError: (error) => {
      logger.error('Create speed test profile error:', error);
    }
  });
};

export const useUpdateSpeedTestProfile = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<SpeedTestProfile> }) => 
      speedTestService.updateProfile(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['speed-test-profiles'] });
    },
    onError: (error) => {
      logger.error('Update speed test profile error:', error);
    }
  });
};

export const useDeleteSpeedTestProfile = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => speedTestService.deleteProfile(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['speed-test-profiles'] });
    },
    onError: (error) => {
      logger.error('Delete speed test profile error:', error);
    }
  });
};

// Speed Test Server Hooks
export const useSpeedTestServers = () => {
  return useQuery({
    queryKey: ['speed-test-servers'],
    queryFn: () => speedTestService.getServers(),
    staleTime: 300000
  });
};

export const useCreateSpeedTestServer = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (server: Partial<SpeedTestServer>) => speedTestService.createServer(server),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['speed-test-servers'] });
    },
    onError: (error) => {
      logger.error('Create speed test server error:', error);
    }
  });
};

export const useDiscoverOoklaServers = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => speedTestService.discoverOoklaServers(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['speed-test-servers'] });
    },
    onError: (error) => {
      logger.error('Discover Ookla servers error:', error);
    }
  });
};

// Speed Test Execution Hooks
export const useRunSpeedTest = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (config: SpeedTestConfig) => speedTestService.runSpeedTest(config),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['speed-test-results'] });
      queryClient.invalidateQueries({ queryKey: ['speed-test-stats'] });
    },
    onError: (error) => {
      logger.error('Run speed test error:', error);
    }
  });
};

export const useSpeedTestResults = (filters?: {
  profile_id?: string;
  server_id?: string;
  interface?: string;
  start_date?: string;
  end_date?: string;
  limit?: number;
}) => {
  return useQuery({
    queryKey: ['speed-test-results', filters],
    queryFn: () => speedTestService.getTestResults(filters),
    refetchInterval: 30000,
    staleTime: 15000
  });
};

export const useTestServerLatency = () => {
  return useMutation({
    mutationFn: (serverId: string) => speedTestService.testServerLatency(serverId),
    onError: (error) => {
      logger.error('Test server latency error:', error);
    }
  });
};

// DNS Ping Monitor Hooks
export const useDNSPingMonitors = () => {
  return useQuery({
    queryKey: ['dns-ping-monitors'],
    queryFn: () => speedTestService.getDNSMonitors(),
    refetchInterval: 60000,
    staleTime: 30000
  });
};

export const useCreateDNSMonitor = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (monitor: Partial<DNSPingMonitor>) => speedTestService.createDNSMonitor(monitor),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dns-ping-monitors'] });
    },
    onError: (error) => {
      logger.error('Create DNS monitor error:', error);
    }
  });
};

export const useUpdateDNSMonitor = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<DNSPingMonitor> }) => 
      speedTestService.updateDNSMonitor(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dns-ping-monitors'] });
    },
    onError: (error) => {
      logger.error('Update DNS monitor error:', error);
    }
  });
};

export const useDNSPingResults = (monitorId: string, hours: number = 1) => {
  return useQuery({
    queryKey: ['dns-ping-results', monitorId, hours],
    queryFn: () => speedTestService.getDNSPingResults(monitorId, hours),
    refetchInterval: 5000, // Update every 5 seconds for real-time
    staleTime: 2000,
    enabled: !!monitorId
  });
};

export const useStartDNSMonitor = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (monitorId: string) => speedTestService.startDNSPingMonitor(monitorId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dns-ping-monitors'] });
    },
    onError: (error) => {
      logger.error('Start DNS monitor error:', error);
    }
  });
};

export const useStopDNSMonitor = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (monitorId: string) => speedTestService.stopDNSPingMonitor(monitorId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dns-ping-monitors'] });
    },
    onError: (error) => {
      logger.error('Stop DNS monitor error:', error);
    }
  });
};

// Network Interface Hooks
export const useNetworkInterfaces = () => {
  return useQuery({
    queryKey: ['network-interfaces'],
    queryFn: () => speedTestService.getNetworkInterfaces(),
    staleTime: 60000
  });
};

export const useDiscoverNetworkInterfaces = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => speedTestService.discoverNetworkInterfaces(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['network-interfaces'] });
    },
    onError: (error) => {
      logger.error('Discover network interfaces error:', error);
    }
  });
};

// Speed Test Schedule Hooks
export const useSpeedTestSchedules = () => {
  return useQuery({
    queryKey: ['speed-test-schedules'],
    queryFn: () => speedTestService.getSchedules(),
    staleTime: 300000
  });
};

export const useCreateSpeedTestSchedule = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (schedule: Partial<SpeedTestSchedule>) => speedTestService.createSchedule(schedule),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['speed-test-schedules'] });
    },
    onError: (error) => {
      logger.error('Create speed test schedule error:', error);
    }
  });
};

// Speed Test Alert Hooks
export const useSpeedTestAlerts = () => {
  return useQuery({
    queryKey: ['speed-test-alerts'],
    queryFn: () => speedTestService.getAlerts(),
    staleTime: 300000
  });
};

export const useCreateSpeedTestAlert = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (alert: Partial<SpeedTestAlert>) => speedTestService.createAlert(alert),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['speed-test-alerts'] });
    },
    onError: (error) => {
      logger.error('Create speed test alert error:', error);
    }
  });
};

// Statistics and Analytics Hooks
export const useSpeedTestStats = (timeRange: '24h' | '7d' | '30d' = '24h') => {
  return useQuery({
    queryKey: ['speed-test-stats', timeRange],
    queryFn: () => speedTestService.getSpeedTestStats(timeRange),
    refetchInterval: 60000,
    staleTime: 30000
  });
};

export const useOptimalServerSelection = () => {
  return useMutation({
    mutationFn: (criteria?: {
      country_preference?: string[];
      max_latency_ms?: number;
      exclude_countries?: string[];
    }) => speedTestService.selectOptimalServer(criteria),
    onError: (error) => {
      logger.error('Optimal server selection error:', error);
    }
  });
};

// Bufferbloat Analysis Hook
export const useAnalyzeBufferbloat = () => {
  return useMutation({
    mutationFn: (testResultId: string) => speedTestService.analyzeBufferbloat(testResultId),
    onError: (error) => {
      logger.error('Analyze bufferbloat error:', error);
    }
  });
};

// QoE Calculation Hook
export const useCalculateQoE = () => {
  return useMutation({
    mutationFn: (result: SpeedTestResult) => speedTestService.calculateQoEScore(result),
    onError: (error) => {
      logger.error('Calculate QoE error:', error);
    }
  });
};

// Real-time Test Progress Hook
export const useSpeedTestProgress = (testId: string) => {
  return useQuery({
    queryKey: ['speed-test-progress', testId],
    queryFn: () => speedTestService.getTestProgress(testId),
    refetchInterval: 1000, // Update every second during test
    staleTime: 500,
    enabled: !!testId
  });
};

// Wi-Fi Integration Hooks
export const useWiFiAccessPoints = () => {
  return useQuery({
    queryKey: ['wifi-access-points'],
    queryFn: () => speedTestService.getAccessPoints(),
    refetchInterval: 30000,
    staleTime: 15000
  });
};

export const useWiFiNetworks = (apId?: string) => {
  return useQuery({
    queryKey: ['wifi-networks', apId],
    queryFn: () => speedTestService.getWiFiNetworks(apId),
    refetchInterval: 30000,
    staleTime: 15000
  });
};

export const useWiFiClients = (filters?: {
  network_id?: string;
  ap_id?: string;
  status?: string;
  limit?: number;
}) => {
  return useQuery({
    queryKey: ['wifi-clients', filters],
    queryFn: () => speedTestService.getWiFiClients(filters),
    refetchInterval: 15000,
    staleTime: 10000
  });
};