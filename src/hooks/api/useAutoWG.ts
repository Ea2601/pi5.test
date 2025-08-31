import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { autoWGService, AutoWGInstallRequest, AutoWGInstallResult } from '../../services/autoWGService';
import { logger } from '../../utils/logger';

export const useAutoWGInstall = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (request: AutoWGInstallRequest): Promise<AutoWGInstallResult> => {
      const result = await autoWGService.installWireGuard(request);
      
      // Save installation record for history
      await autoWGService.saveInstallationRecord(request, result);
      
      return result;
    },
    onSuccess: () => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['wireguard-servers'] });
      queryClient.invalidateQueries({ queryKey: ['auto-wg-history'] });
    },
    onError: (error) => {
      logger.error('Auto WG installation error:', error);
    }
  });
};

export const useValidateSSH = () => {
  return useMutation({
    mutationFn: ({ 
      username, 
      ipAddress, 
      password, 
      port 
    }: { 
      username: string; 
      ipAddress: string; 
      password: string; 
      port?: number; 
    }) => autoWGService.validateSSHConnection(username, ipAddress, password, port),
    onError: (error) => {
      logger.error('SSH validation error:', error);
    }
  });
};

export const useAutoWGHistory = () => {
  return useQuery({
    queryKey: ['auto-wg-history'],
    queryFn: () => autoWGService.getInstallationHistory(),
    refetchInterval: 30000,
    staleTime: 15000
  });
};