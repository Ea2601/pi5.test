import { useQuery } from '@tanstack/react-query';
import { unifiedApiClient } from '../../services/unifiedApiClient';

export interface SystemInfo {
  version: string;
  platform: string;
  node_version: string;
  uptime: number;
  memory_usage: {
    rss: number;
    heapTotal: number;
    heapUsed: number;
    external: number;
  };
  environment: string;
  services: {
    api_gateway: { status: string; port: number };
    database: { status: string; type: string };
    cache: { status: string; type: string };
  };
}

export interface SystemConfig {
  database_configured: boolean;
  services_running: string[];
  required_env_vars: string[];
  optional_env_vars: string[];
}

export const useSystemInfo = () => {
  return useQuery({
    queryKey: ['system-info'],
    queryFn: async () => {
      try {
        const response = await unifiedApiClient.get<SystemInfo>('/api/v1/system/info');
        return response.data;
      } catch (error) {
        console.error('Get system info error:', error);
        return null;
      }
    },
    refetchInterval: 30000,
    staleTime: 15000
  });
};

export const useSystemConfig = () => {
  return useQuery({
    queryKey: ['system-config'],
    queryFn: async () => {
      try {
        const response = await unifiedApiClient.get<SystemConfig>('/api/v1/system/config');
        return response.data;
      } catch (error) {
        console.error('Get system config error:', error);
        return null;
      }
    },
    staleTime: 300000 // 5 minutes
  });
};

export const useSystemHealth = () => {
  return useQuery({
    queryKey: ['system-health'],
    queryFn: async () => {
      try {
        const response = await unifiedApiClient.get('/health/services');
        return response.data;
      } catch (error) {
        console.error('Get system health error:', error);
        return {
          overall_health: false,
          services: [],
          errors: ['API bağlantısı kurulamadı']
        };
      }
    },
    refetchInterval: 10000,
    staleTime: 5000
  });
};