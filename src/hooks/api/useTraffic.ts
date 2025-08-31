import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { TrafficPolicy, DraftChange } from '../../types/traffic';
import { logger } from '../../utils/logger';

// Mock data for traffic management
const mockPolicies: TrafficPolicy[] = [];
const mockDraftChanges: DraftChange[] = [];

// Mock service
const mockTrafficService = {
  getPolicies: async () => {
    await new Promise(resolve => setTimeout(resolve, 200));
    return mockPolicies;
  },
  
  createPolicy: async (policy: Partial<TrafficPolicy>) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const newPolicy: TrafficPolicy = {
      id: `policy-${Date.now()}`,
      groupId: policy.groupId || '',
      vlanId: policy.vlanId || '',
      egressId: policy.egressId || '',
      dnsProfileId: policy.dnsProfileId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    mockPolicies.push(newPolicy);
    return newPolicy;
  },
  
  updatePolicy: async (id: string, updates: Partial<TrafficPolicy>) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const index = mockPolicies.findIndex(p => p.id === id);
    if (index >= 0) {
      mockPolicies[index] = { ...mockPolicies[index], ...updates, updatedAt: new Date().toISOString() };
      return mockPolicies[index];
    }
    throw new Error('Policy not found');
  },
  
  deletePolicy: async (id: string) => {
    await new Promise(resolve => setTimeout(resolve, 200));
    const index = mockPolicies.findIndex(p => p.id === id);
    if (index >= 0) {
      mockPolicies.splice(index, 1);
      return true;
    }
    return false;
  },
  
  getUserGroups: async () => {
    await new Promise(resolve => setTimeout(resolve, 100));
    return [
      { id: 'local-1', name: 'Lokal 1', type: 'local' as const, memberCount: 8 },
      { id: 'local-2', name: 'Lokal 2', type: 'local' as const, memberCount: 5 },
      { id: 'local-3', name: 'Lokal 3', type: 'local' as const, memberCount: 12 },
      { id: 'wg-client-1', name: 'WG Client 1', type: 'wg' as const, memberCount: 3 },
      { id: 'wg-client-2', name: 'WG Client 2', type: 'wg' as const, memberCount: 7 }
    ];
  },
  
  getVLANGroups: async () => {
    await new Promise(resolve => setTimeout(resolve, 100));
    return [
      { id: 'vlan-10', name: 'Admin', vlanId: 10, subnet: '192.168.10.0/24' },
      { id: 'vlan-20', name: 'Trusted', vlanId: 20, subnet: '192.168.20.0/24' },
      { id: 'vlan-30', name: 'IoT', vlanId: 30, subnet: '192.168.30.0/24' },
      { id: 'vlan-40', name: 'Guest', vlanId: 40, subnet: '192.168.40.0/24' },
      { id: 'vlan-50', name: 'Gaming', vlanId: 50, subnet: '192.168.50.0/24' },
      { id: 'vlan-60', name: 'VoIP/Work', vlanId: 60, subnet: '192.168.60.0/24' },
      { id: 'vlan-70', name: 'Security', vlanId: 70, subnet: '192.168.70.0/24' },
      { id: 'vlan-80', name: 'Kids', vlanId: 80, subnet: '192.168.80.0/24' },
      { id: 'vlan-90', name: 'Media', vlanId: 90, subnet: '192.168.90.0/24' },
      { id: 'vlan-100', name: 'Lab/Test', vlanId: 100, subnet: '192.168.100.0/24' }
    ];
  },
  
  getEgressTargets: async () => {
    await new Promise(resolve => setTimeout(resolve, 100));
    return [
      { id: 'local', name: 'Lokal Ağ', type: 'local' as const, isActive: true },
      { id: 'wg-server-1', name: 'WG Server 1', type: 'wg' as const, isActive: true },
      { id: 'wg-server-2', name: 'WG Server 2', type: 'wg' as const, isActive: false }
    ];
  },
  
  getDNSProfiles: async () => {
    await new Promise(resolve => setTimeout(resolve, 100));
    return [
      { id: 'default', name: 'Varsayılan', resolvers: ['1.1.1.1', '8.8.8.8'], blocklists: [] },
      { id: 'family', name: 'Aile Güvenli', resolvers: ['1.1.1.3', '1.0.0.3'], blocklists: ['adult', 'gambling'] },
      { id: 'business', name: 'İş Ağı', resolvers: ['208.67.222.222', '208.67.220.220'], blocklists: ['social', 'games'] }
    ];
  },
  
  getDraftChanges: async () => {
    await new Promise(resolve => setTimeout(resolve, 100));
    return mockDraftChanges;
  },
  
  saveDraftChanges: async (changes: DraftChange[]) => {
    await new Promise(resolve => setTimeout(resolve, 200));
    mockDraftChanges.push(...changes);
  },
  
  clearDraftChanges: async () => {
    await new Promise(resolve => setTimeout(resolve, 100));
    mockDraftChanges.length = 0;
  },
  
  validateChanges: async (changes: DraftChange[]) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { valid: true, errors: [] };
  },
  
  applyChanges: async (changes: DraftChange[]) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return { success: true, errors: [] };
  },
  
  createSnapshot: async (name: string) => {
    await new Promise(resolve => setTimeout(resolve, 300));
  },
  
  getSnapshots: async () => {
    await new Promise(resolve => setTimeout(resolve, 200));
    return [];
  },
  
  restoreSnapshot: async (id: string) => {
    await new Promise(resolve => setTimeout(resolve, 500));
  }
};

// Policy Hooks
export const useTrafficPolicies = () => {
  return useQuery({
    queryKey: ['traffic-policies'],
    queryFn: () => mockTrafficService.getPolicies(),
    refetchInterval: 30000,
    staleTime: 15000
  });
};

export const useCreatePolicy = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (policy: Partial<TrafficPolicy>) => mockTrafficService.createPolicy(policy),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['traffic-policies'] });
    },
    onError: (error) => {
      logger.error('Create policy error:', error);
    }
  });
};

export const useUpdatePolicy = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<TrafficPolicy> }) => 
      mockTrafficService.updatePolicy(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['traffic-policies'] });
    },
    onError: (error) => {
      logger.error('Update policy error:', error);
    }
  });
};

export const useDeletePolicy = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => mockTrafficService.deletePolicy(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['traffic-policies'] });
    },
    onError: (error) => {
      logger.error('Delete policy error:', error);
    }
  });
};

// Configuration Data Hooks
export const useUserGroups = () => {
  return useQuery({
    queryKey: ['user-groups'],
    queryFn: () => mockTrafficService.getUserGroups(),
    staleTime: 60000
  });
};

export const useVLANGroups = () => {
  return useQuery({
    queryKey: ['vlan-groups'],
    queryFn: () => mockTrafficService.getVLANGroups(),
    staleTime: 60000
  });
};

export const useEgressTargets = () => {
  return useQuery({
    queryKey: ['egress-targets'],
    queryFn: () => mockTrafficService.getEgressTargets(),
    refetchInterval: 30000,
    staleTime: 15000
  });
};

export const useDNSProfiles = () => {
  return useQuery({
    queryKey: ['dns-profiles'],
    queryFn: () => mockTrafficService.getDNSProfiles(),
    staleTime: 60000
  });
};

// Draft System Hooks
export const useDraftChanges = () => {
  return useQuery({
    queryKey: ['draft-changes'],
    queryFn: () => mockTrafficService.getDraftChanges(),
    refetchInterval: 5000,
    staleTime: 2000
  });
};

export const useSaveDraftChanges = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (changes: DraftChange[]) => mockTrafficService.saveDraftChanges(changes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['draft-changes'] });
    },
    onError: (error) => {
      logger.error('Save draft changes error:', error);
    }
  });
};

export const useClearDraftChanges = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => mockTrafficService.clearDraftChanges(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['draft-changes'] });
    },
    onError: (error) => {
      logger.error('Clear draft changes error:', error);
    }
  });
};

// Validation and Apply Hooks
export const useValidateChanges = () => {
  return useMutation({
    mutationFn: (changes: DraftChange[]) => mockTrafficService.validateChanges(changes),
    onError: (error) => {
      logger.error('Validate changes error:', error);
    }
  });
};

export const useApplyChanges = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (changes: DraftChange[]) => mockTrafficService.applyChanges(changes),
    onSuccess: () => {
      // Invalidate all related queries
      queryClient.invalidateQueries({ queryKey: ['traffic-policies'] });
      queryClient.invalidateQueries({ queryKey: ['draft-changes'] });
      queryClient.invalidateQueries({ queryKey: ['user-groups'] });
      queryClient.invalidateQueries({ queryKey: ['vlan-groups'] });
      queryClient.invalidateQueries({ queryKey: ['egress-targets'] });
    },
    onError: (error) => {
      logger.error('Apply changes error:', error);
    }
  });
};

// Snapshot Hooks
export const useCreateSnapshot = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (name: string) => mockTrafficService.createSnapshot(name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['network-snapshots'] });
    },
    onError: (error) => {
      logger.error('Create snapshot error:', error);
    }
  });
};

export const useNetworkSnapshots = () => {
  return useQuery({
    queryKey: ['network-snapshots'],
    queryFn: () => mockTrafficService.getSnapshots(),
    staleTime: 30000
  });
};

export const useRestoreSnapshot = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => mockTrafficService.restoreSnapshot(id),
    onSuccess: () => {
      // Invalidate all traffic-related queries
      queryClient.invalidateQueries({ queryKey: ['traffic-policies'] });
      queryClient.invalidateQueries({ queryKey: ['draft-changes'] });
      queryClient.invalidateQueries({ queryKey: ['user-groups'] });
      queryClient.invalidateQueries({ queryKey: ['vlan-groups'] });
    },
    onError: (error) => {
      logger.error('Restore snapshot error:', error);
    }
  });
};