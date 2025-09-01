import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { databaseService } from '../../services/databaseService';
import { logger } from '../../utils/logger';

interface RealtimeDeviceData {
  mac_address: string;
  device_name: string;
  is_active: boolean;
  last_seen: string;
  ip_address?: string;
}

interface RealtimeTrafficData {
  rule_id: string;
  name: string;
  enabled: boolean;
  priority: number;
}

export const useRealTimeDevices = () => {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    const subscription = databaseService.subscribeToDeviceChanges((payload) => {
      logger.info('Real-time device change received:', payload);
      
      // Update the cache with new data
      queryClient.setQueryData(['network-devices'], (oldData: any) => {
        if (!oldData?.data) return oldData;
        
        const { eventType, new: newRecord, old: oldRecord } = payload;
        
        switch (eventType) {
          case 'INSERT':
            return {
              ...oldData,
              data: [...oldData.data, newRecord],
              count: oldData.count + 1
            };
          case 'UPDATE':
            return {
              ...oldData,
              data: oldData.data.map((device: any) => 
                device.mac_address === newRecord.mac_address ? newRecord : device
              )
            };
          case 'DELETE':
            return {
              ...oldData,
              data: oldData.data.filter((device: any) => 
                device.mac_address !== oldRecord.mac_address
              ),
              count: oldData.count - 1
            };
          default:
            return oldData;
        }
      });

      // Invalidate related queries to ensure consistency
      queryClient.invalidateQueries({ queryKey: ['network-devices'] });
    });

    if (subscription) {
      setIsSubscribed(true);
    }

    return () => {
      if (subscription) {
        subscription.unsubscribe();
        setIsSubscribed(false);
      }
    };
  }, [queryClient]);

  return { isSubscribed };
};

export const useRealTimeTrafficRules = () => {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    const subscription = databaseService.subscribeToTrafficRules((payload) => {
      logger.info('Real-time traffic rule change received:', payload);
      
      // Update traffic rules cache
      queryClient.setQueryData(['traffic-rules'], (oldData: any) => {
        if (!oldData?.data) return oldData;
        
        const { eventType, new: newRecord, old: oldRecord } = payload;
        
        switch (eventType) {
          case 'INSERT':
            return {
              ...oldData,
              data: [...oldData.data, newRecord]
            };
          case 'UPDATE':
            return {
              ...oldData,
              data: oldData.data.map((rule: any) => 
                rule.id === newRecord.id ? newRecord : rule
              )
            };
          case 'DELETE':
            return {
              ...oldData,
              data: oldData.data.filter((rule: any) => rule.id !== oldRecord.id)
            };
          default:
            return oldData;
        }
      });

      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['traffic-rules'] });
    });

    if (subscription) {
      setIsSubscribed(true);
    }

    return () => {
      if (subscription) {
        subscription.unsubscribe();
        setIsSubscribed(false);
      }
    };
  }, [queryClient]);

  return { isSubscribed };
};

// Connection status hook
export const useDatabaseConnectionStatus = () => {
  const [connectionStatus, setConnectionStatus] = useState({
    connected: false,
    poolSize: 0,
    lastCheck: new Date()
  });

  useEffect(() => {
    const checkConnection = () => {
      const status = databaseService.checkDatabaseHealth();
      status.then((health) => {
        setConnectionStatus(prev => ({
          connected: health.healthy,
          poolSize: prev.poolSize, // Would need to expose this from service
          lastCheck: new Date()
        }));
      }).catch(() => {
        setConnectionStatus(prev => ({
          connected: false,
          poolSize: 0,
          lastCheck: new Date()
        }));
      });
    };

    // Check immediately
    checkConnection();

    // Set up periodic checks
    const interval = setInterval(checkConnection, 30000); // Every 30 seconds

    return () => clearInterval(interval);
  }, []);

  return connectionStatus;
};

// Analytics helpers
export const useNetworkAnalytics = (timeRange: '1h' | '24h' | '7d' | '30d' = '24h') => {
  return useQuery({
    queryKey: ['network-analytics', timeRange],
    queryFn: async () => {
      const endDate = new Date().toISOString();
      const startDate = new Date();
      
      switch (timeRange) {
        case '1h':
          startDate.setHours(startDate.getHours() - 1);
          break;
        case '24h':
          startDate.setDate(startDate.getDate() - 1);
          break;
        case '7d':
          startDate.setDate(startDate.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(startDate.getDate() - 30);
          break;
      }

      const { data } = await databaseService.getRoutingHistory({
        startDate: startDate.toISOString(),
        endDate,
        limit: 1000
      });

      // Process analytics data
      const analytics = {
        totalRequests: data?.length || 0,
        successRate: data ? (data.filter(r => r.success).length / data.length) * 100 : 0,
        averageLatency: data?.reduce((acc, r) => acc + (r.latency_ms || 0), 0) / (data?.length || 1),
        topDestinations: data ? [...new Set(data.map(r => r.destination_domain).filter(Boolean))] : [],
        trafficByHour: data ? groupTrafficByHour(data) : []
      };

      return analytics;
    },
    refetchInterval: 60000,
    staleTime: 30000
  });
};

// Helper function for traffic grouping
function groupTrafficByHour(data: any[]): Array<{ hour: string; requests: number; bandwidth: number }> {
  const hourlyData: Record<string, { requests: number; bandwidth: number }> = {};

  data.forEach(record => {
    if (!record.timestamp) return;
    
    const hour = new Date(record.timestamp).getHours().toString().padStart(2, '0') + ':00';
    
    if (!hourlyData[hour]) {
      hourlyData[hour] = { requests: 0, bandwidth: 0 };
    }
    
    hourlyData[hour].requests++;
    hourlyData[hour].bandwidth += record.bandwidth_used || 0;
  });

  return Object.entries(hourlyData).map(([hour, stats]) => ({
    hour,
    requests: stats.requests,
    bandwidth: stats.bandwidth
  }));
}