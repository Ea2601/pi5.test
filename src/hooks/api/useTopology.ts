import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { topologyService } from '../../services/topologyService';
import { 
  TopologyNode, 
  NetworkConnection, 
  VLANConfiguration, 
  TrafficFlow, 
  NetworkSegment,
  TopologySnapshot,
  NetworkAlertRule,
  TopologyFilter
} from '../../types/topology';
import { logger } from '../../utils/logger';

// Topology Nodes Hooks
export const useTopologyNodes = (filter?: TopologyFilter) => {
  return useQuery({
    queryKey: ['topology-nodes', filter],
    queryFn: () => topologyService.getTopologyNodes(filter),
    refetchInterval: 30000,
    staleTime: 15000
  });
};

export const useCreateTopologyNode = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (node: Partial<TopologyNode>) => topologyService.createTopologyNode(node),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['topology-nodes'] });
      queryClient.invalidateQueries({ queryKey: ['topology-stats'] });
    },
    onError: (error) => {
      logger.error('Create topology node error:', error);
    }
  });
};

export const useUpdateTopologyNode = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<TopologyNode> }) => 
      topologyService.updateTopologyNode(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['topology-nodes'] });
    },
    onError: (error) => {
      logger.error('Update topology node error:', error);
    }
  });
};

export const useDeleteTopologyNode = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => topologyService.deleteTopologyNode(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['topology-nodes'] });
      queryClient.invalidateQueries({ queryKey: ['network-connections'] });
      queryClient.invalidateQueries({ queryKey: ['topology-stats'] });
    },
    onError: (error) => {
      logger.error('Delete topology node error:', error);
    }
  });
};

// Network Connections Hooks
export const useNetworkConnections = () => {
  return useQuery({
    queryKey: ['network-connections'],
    queryFn: () => topologyService.getNetworkConnections(),
    refetchInterval: 30000,
    staleTime: 15000
  });
};

export const useCreateConnection = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (connection: Partial<NetworkConnection>) => topologyService.createConnection(connection),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['network-connections'] });
    },
    onError: (error) => {
      logger.error('Create connection error:', error);
    }
  });
};

export const useUpdateConnection = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<NetworkConnection> }) => 
      topologyService.updateConnection(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['network-connections'] });
    },
    onError: (error) => {
      logger.error('Update connection error:', error);
    }
  });
};

export const useDeleteConnection = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => topologyService.deleteConnection(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['network-connections'] });
    },
    onError: (error) => {
      logger.error('Delete connection error:', error);
    }
  });
};

// VLAN Configuration Hooks
export const useVLANConfigurations = () => {
  return useQuery({
    queryKey: ['vlan-configurations'],
    queryFn: () => topologyService.getVLANConfigurations(),
    staleTime: 300000 // 5 minutes
  });
};

export const useCreateVLAN = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (vlan: Partial<VLANConfiguration>) => topologyService.createVLAN(vlan),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vlan-configurations'] });
      queryClient.invalidateQueries({ queryKey: ['topology-stats'] });
    },
    onError: (error) => {
      logger.error('Create VLAN error:', error);
    }
  });
};

export const useUpdateVLAN = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<VLANConfiguration> }) => 
      topologyService.updateVLAN(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vlan-configurations'] });
    },
    onError: (error) => {
      logger.error('Update VLAN error:', error);
    }
  });
};

// Traffic Flow Hooks
export const useTrafficFlows = () => {
  return useQuery({
    queryKey: ['traffic-flows'],
    queryFn: () => topologyService.getTrafficFlows(),
    refetchInterval: 60000,
    staleTime: 30000
  });
};

export const useCreateTrafficFlow = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (flow: Partial<TrafficFlow>) => topologyService.createTrafficFlow(flow),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['traffic-flows'] });
    },
    onError: (error) => {
      logger.error('Create traffic flow error:', error);
    }
  });
};

// Network Segments Hooks
export const useNetworkSegments = () => {
  return useQuery({
    queryKey: ['network-segments'],
    queryFn: () => topologyService.getNetworkSegments(),
    staleTime: 300000
  });
};

// Topology Snapshots Hooks
export const useTopologySnapshots = () => {
  return useQuery({
    queryKey: ['topology-snapshots'],
    queryFn: () => topologyService.getSnapshots(),
    staleTime: 60000
  });
};

export const useCreateTopologySnapshot = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ name, description }: { name: string; description?: string }) => 
      topologyService.createSnapshot(name, description),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['topology-snapshots'] });
    },
    onError: (error) => {
      logger.error('Create topology snapshot error:', error);
    }
  });
};

export const useRestoreTopologySnapshot = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => topologyService.restoreSnapshot(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['topology-nodes'] });
      queryClient.invalidateQueries({ queryKey: ['network-connections'] });
      queryClient.invalidateQueries({ queryKey: ['vlan-configurations'] });
    },
    onError: (error) => {
      logger.error('Restore topology snapshot error:', error);
    }
  });
};

// Discovery Hooks
export const useDiscoverTopology = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => topologyService.discoverTopology(),
    onSuccess: (result) => {
      // Create discovered nodes and connections
      result.discovered_nodes.forEach(async (node) => {
        await topologyService.createTopologyNode(node);
      });
      
      result.discovered_connections.forEach(async (connection) => {
        await topologyService.createConnection(connection);
      });

      queryClient.invalidateQueries({ queryKey: ['topology-nodes'] });
      queryClient.invalidateQueries({ queryKey: ['network-connections'] });
    },
    onError: (error) => {
      logger.error('Discover topology error:', error);
    }
  });
};

// Statistics Hooks
export const useTopologyStats = () => {
  return useQuery({
    queryKey: ['topology-stats'],
    queryFn: () => topologyService.getTopologyStats(),
    refetchInterval: 60000,
    staleTime: 30000
  });
};

// Health Monitoring Hooks
export const useNetworkHealthCheck = () => {
  return useQuery({
    queryKey: ['network-health'],
    queryFn: () => topologyService.performHealthCheck(),
    refetchInterval: 30000,
    staleTime: 15000
  });
};

// Auto Layout Hook
export const useAutoLayoutTopology = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => topologyService.autoLayoutTopology(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['topology-nodes'] });
    },
    onError: (error) => {
      logger.error('Auto layout topology error:', error);
    }
  });
};

// Sync with Network Devices Hook
export const useSyncWithNetworkDevices = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => topologyService.syncWithNetworkDevices(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['topology-nodes'] });
      queryClient.invalidateQueries({ queryKey: ['topology-stats'] });
    },
    onError: (error) => {
      logger.error('Sync with network devices error:', error);
    }
  });
};

// Alert Rules Hooks
export const useNetworkAlertRules = () => {
  return useQuery({
    queryKey: ['network-alert-rules'],
    queryFn: () => topologyService.getAlertRules(),
    staleTime: 300000
  });
};

export const useCreateAlertRule = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (rule: Partial<NetworkAlertRule>) => topologyService.createAlertRule(rule),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['network-alert-rules'] });
    },
    onError: (error) => {
      logger.error('Create alert rule error:', error);
    }
  });
};

// Traffic Analysis Hook
export const useTrafficAnalysis = (timeRange: '1h' | '24h' | '7d' = '24h') => {
  return useQuery({
    queryKey: ['traffic-analysis', timeRange],
    queryFn: () => topologyService.analyzeTrafficPatterns(timeRange),
    refetchInterval: 60000,
    staleTime: 30000
  });
};

// Real-time monitoring hook
export const useTopologyRealTime = () => {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ['topology-realtime'],
    queryFn: () => {
      // In production, this would set up WebSocket or SSE connection
      // for real-time topology updates
      return Promise.resolve(true);
    },
    refetchInterval: 5000, // Check every 5 seconds
    refetchOnWindowFocus: false
  });
};