import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { networkConfigService } from '../../services/networkConfigService';
import { DeviceConfiguration, WAN Profile, VLANCatalogEntry, DeviceRole } from '../../types/networkConfig';
import { logger } from '../../utils/logger';

// Device Configuration Hooks
export const useDeviceConfiguration = () => {
  return useQuery({
    queryKey: ['device-configuration'],
    queryFn: () => networkConfigService.getDeviceConfiguration(),
    staleTime: 300000, // 5 minutes - configuration doesn't change often
    retry: 2
  });
};

export const useUpdateDeviceConfiguration = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (config: Partial<DeviceConfiguration>) => 
      networkConfigService.updateDeviceConfiguration(config),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['device-configuration'] });
    },
    onError: (error) => {
      logger.error('Update device configuration error:', error);
    }
  });
};

export const useCreateDeviceConfiguration = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (config: Partial<DeviceConfiguration>) => 
      networkConfigService.createDeviceConfiguration(config),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['device-configuration'] });
    },
    onError: (error) => {
      logger.error('Create device configuration error:', error);
    }
  });
};

// WAN Profiles Hooks
export const useWANProfiles = () => {
  return useQuery({
    queryKey: ['wan-profiles'],
    queryFn: () => networkConfigService.getWANProfiles(),
    staleTime: 300000,
    retry: 2
  });
};

export const useCreateWANProfile = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (profile: Partial<WAN Profile>) => networkConfigService.createWANProfile(profile),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wan-profiles'] });
    },
    onError: (error) => {
      logger.error('Create WAN profile error:', error);
    }
  });
};

export const useUpdateWANProfile = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<WAN Profile> }) => 
      networkConfigService.updateWANProfile(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wan-profiles'] });
    },
    onError: (error) => {
      logger.error('Update WAN profile error:', error);
    }
  });
};

export const useDeleteWANProfile = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => networkConfigService.deleteWANProfile(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wan-profiles'] });
    },
    onError: (error) => {
      logger.error('Delete WAN profile error:', error);
    }
  });
};

// VLAN Catalog Hooks
export const useVLANCatalog = () => {
  return useQuery({
    queryKey: ['vlan-catalog'],
    queryFn: () => networkConfigService.getVLANCatalog(),
    staleTime: 600000, // 10 minutes - catalog changes rarely
    retry: 2
  });
};

export const useUpdateVLANCatalogEntry = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<VLANCatalogEntry> }) => 
      networkConfigService.updateVLANCatalogEntry(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vlan-catalog'] });
    },
    onError: (error) => {
      logger.error('Update VLAN catalog entry error:', error);
    }
  });
};

// Wi-Fi SSID Configuration Hooks
export const useWiFiSSIDConfigs = () => {
  return useQuery({
    queryKey: ['wifi-ssid-configs'],
    queryFn: () => networkConfigService.getWiFiSSIDConfigs(),
    staleTime: 300000,
    retry: 2
  });
};

export const useCreateWiFiSSIDConfig = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (config: any) => networkConfigService.createWiFiSSIDConfig(config),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wifi-ssid-configs'] });
    },
    onError: (error) => {
      logger.error('Create Wi-Fi SSID config error:', error);
    }
  });
};

// Security Policy Hooks
export const useSecurityPolicy = (deviceRole: string) => {
  return useQuery({
    queryKey: ['security-policy', deviceRole],
    queryFn: () => networkConfigService.getSecurityPolicy(deviceRole),
    enabled: !!deviceRole,
    staleTime: 300000,
    retry: 2
  });
};

export const useUpdateSecurityPolicy = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ deviceRole, policy }: { deviceRole: string; policy: any }) => 
      networkConfigService.updateSecurityPolicy(deviceRole, policy),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['security-policy', variables.deviceRole] });
    },
    onError: (error) => {
      logger.error('Update security policy error:', error);
    }
  });
};

// Configuration Validation
export const useValidateConfiguration = () => {
  return useMutation({
    mutationFn: (config: DeviceConfiguration) => networkConfigService.validateConfiguration(config),
    onError: (error) => {
      logger.error('Validate configuration error:', error);
    }
  });
};

// Configuration Application
export const useApplyConfiguration = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (config: DeviceConfiguration) => networkConfigService.applyConfiguration(config),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['device-configuration'] });
    },
    onError: (error) => {
      logger.error('Apply configuration error:', error);
    }
  });
};

// Configuration Export/Import
export const useExportConfiguration = () => {
  return useMutation({
    mutationFn: (format: 'json' | 'yaml' | 'bash') => networkConfigService.exportConfiguration(format),
    onError: (error) => {
      logger.error('Export configuration error:', error);
    }
  });
};

export const useImportConfiguration = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ configData, format }: { configData: string; format: 'json' | 'yaml' }) => 
      networkConfigService.importConfiguration(configData, format),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['device-configuration'] });
    },
    onError: (error) => {
      logger.error('Import configuration error:', error);
    }
  });
};

// Egress Points Discovery
export const useEgressCatalog = () => {
  return useQuery({
    queryKey: ['egress-catalog'],
    queryFn: () => networkConfigService.generateEgressCatalog(),
    staleTime: 60000, // 1 minute - egress points can change frequently
    retry: 2
  });
};

export const useDiscoverWireGuardConnections = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => networkConfigService.discoverWireGuardConnections(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['egress-catalog'] });
    },
    onError: (error) => {
      logger.error('Discover WireGuard connections error:', error);
    }
  });
};

// UI Configuration Helper
export const useUIConfigForRole = (roles: DeviceRole[]) => {
  return useQuery({
    queryKey: ['ui-config', roles],
    queryFn: () => networkConfigService.getUIConfigForRole(roles),
    enabled: roles.length > 0,
    staleTime: Infinity // UI config is static based on roles
  });
};