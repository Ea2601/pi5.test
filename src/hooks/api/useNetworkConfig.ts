import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { unifiedApiClient } from '../../services/unifiedApiClient';
import { 
  DeviceConfiguration, 
  WANProfile, 
  VLANCatalogEntry, 
  WiFiSSIDConfig,
  EgressCatalogEntry,
  UIConfigForRole,
  DeviceRole
} from '../../types/networkConfig';
import { UnifiedLogger } from '../../../shared/utils/logger';

const logger = UnifiedLogger.getInstance('network-config-hook');

// Device Configuration Hooks
export const useDeviceConfiguration = () => {
  return useQuery({
    queryKey: ['device-configuration'],
    queryFn: async () => {
      const response = await unifiedApiClient.get<DeviceConfiguration>('/api/v1/network/config/device');
      return response.data;
    },
    staleTime: 300000 // 5 minutes
  });
};

export const useCreateDeviceConfiguration = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (config: DeviceConfiguration) => {
      const response = await unifiedApiClient.post<DeviceConfiguration>('/api/v1/network/config/device', config);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['device-configuration'] });
      logger.info('Device configuration created successfully');
    },
    onError: (error) => {
      logger.error('Failed to create device configuration', { error: (error as Error).message });
    }
  });
};

export const useUpdateDeviceConfiguration = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (config: DeviceConfiguration) => {
      const response = await unifiedApiClient.put<DeviceConfiguration>('/api/v1/network/config/device', config);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['device-configuration'] });
      logger.info('Device configuration updated successfully');
    },
    onError: (error) => {
      logger.error('Failed to update device configuration', { error: (error as Error).message });
    }
  });
};

// WAN Profile Hooks
export const useWANProfiles = () => {
  return useQuery({
    queryKey: ['wan-profiles'],
    queryFn: async () => {
      const response = await unifiedApiClient.get<WANProfile[]>('/api/v1/network/config/wan-profiles');
      return response.data || [];
    },
    staleTime: 300000
  });
};

export const useCreateWANProfile = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (profile: Partial<WANProfile>) => {
      const response = await unifiedApiClient.post<WANProfile>('/api/v1/network/config/wan-profiles', profile);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wan-profiles'] });
      logger.info('WAN profile created successfully');
    },
    onError: (error) => {
      logger.error('Failed to create WAN profile', { error: (error as Error).message });
    }
  });
};

// VLAN Catalog Hooks
export const useVLANCatalog = () => {
  return useQuery({
    queryKey: ['vlan-catalog'],
    queryFn: async () => {
      const response = await unifiedApiClient.get<VLANCatalogEntry[]>('/api/v1/network/config/vlan-catalog');
      return response.data || [];
    },
    staleTime: 300000
  });
};

// Wi-Fi SSID Configuration Hooks
export const useWiFiSSIDConfigs = () => {
  return useQuery({
    queryKey: ['wifi-ssid-configs'],
    queryFn: async () => {
      const response = await unifiedApiClient.get<WiFiSSIDConfig[]>('/api/v1/network/config/wifi-ssids');
      return response.data || [];
    },
    staleTime: 300000
  });
};

// Egress Catalog Hooks
export const useEgressCatalog = () => {
  return useQuery({
    queryKey: ['egress-catalog'],
    queryFn: async () => {
      const response = await unifiedApiClient.get<EgressCatalogEntry[]>('/api/v1/network/config/egress-catalog');
      return response.data || [];
    },
    refetchInterval: 60000,
    staleTime: 30000
  });
};

// UI Configuration Hook
export const useUIConfigForRole = (roles: DeviceRole[]) => {
  return useQuery({
    queryKey: ['ui-config', roles],
    queryFn: async () => {
      const response = await unifiedApiClient.post<UIConfigForRole>('/api/v1/network/config/ui-config', { roles });
      return response.data;
    },
    enabled: roles.length > 0,
    staleTime: 300000
  });
};

// Configuration Validation Hook
export const useValidateConfiguration = () => {
  return useMutation({
    mutationFn: async (config: DeviceConfiguration) => {
      const response = await unifiedApiClient.post<{
        valid: boolean;
        errors: Array<{ field: string; message: string; code: string }>;
        warnings: Array<{ field: string; message: string; code: string }>;
      }>('/api/v1/network/config/validate', config);
      return response.data!;
    },
    onError: (error) => {
      logger.error('Configuration validation failed', { error: (error as Error).message });
    }
  });
};

// Configuration Apply Hook
export const useApplyConfiguration = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (config: DeviceConfiguration) => {
      const response = await unifiedApiClient.post<{
        success: boolean;
        applied_features: string[];
        errors: string[];
      }>('/api/v1/network/config/apply', config);
      return response.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['device-configuration'] });
      logger.info('Configuration applied successfully');
    },
    onError: (error) => {
      logger.error('Failed to apply configuration', { error: (error as Error).message });
    }
  });
};