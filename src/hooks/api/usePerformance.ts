import { useQuery } from '@tanstack/react-query';
import { fetchSystemMetrics, fetchNetworkMetrics, MockSystemMetrics, MockNetworkMetrics } from '../../mocks/queries';

export const useSystemMetrics = () => {
  return useQuery({
    queryKey: ['system-metrics'],
    queryFn: fetchSystemMetrics,
    refetchInterval: 5000, // Update every 5 seconds
    staleTime: 2000,
    cacheTime: 10000,
    retry: 1
  });
};

export const useNetworkMetrics = () => {
  return useQuery({
    queryKey: ['network-metrics'],
    queryFn: fetchNetworkMetrics,
    refetchInterval: 10000,
    staleTime: 5000,
    retry: 1
  });
};