@@ .. @@
-import { fetchDevices, fetchDevice, createDevice, updateDevice, deleteDevice, wakeDevice } from '../mocks/queries';
+import { unifiedApiClient } from '../services/unifiedApiClient';
+import { NetworkAPI } from '../../shared/types/api';
 import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
+import { validator } from '../../shared/utils/validation';
+import { UnifiedLogger } from '../../shared/utils/logger';

+const logger = UnifiedLogger.getInstance('devices-hook');

 export interface UseDevicesFilters {
   active?: boolean;
   type?: string;
   search?: string;
 }

 export const useDevices = (filters?: UseDevicesFilters) => {
   return useQuery({
     queryKey: ['devices', filters],
-    queryFn: () => fetchDevices(filters),
+    queryFn: async () => {
+      try {
+        const response = await unifiedApiClient.getDevices(filters);
+        logger.info('Devices fetched successfully', {
+          count: response.data?.length || 0,
+          filters
+        });
+        return response;
+      } catch (error) {
+        logger.error('Failed to fetch devices', { error: (error as Error).message, filters });
+        throw error;
+      }
+    },
     refetchInterval: 30000,
     staleTime: 15000,
     retry: 1
   });
 };

 export const useDevice = (macAddress: string) => {
   return useQuery({
     queryKey: ['device', macAddress],
-    queryFn: () => fetchDevice(macAddress),
+    queryFn: () => unifiedApiClient.getDevice(macAddress),
     enabled: !!macAddress,
     staleTime: 60000
   });
 };

 export const useCreateDevice = () => {
   const queryClient = useQueryClient();
   
   return useMutation({
-    mutationFn: createDevice,
+    mutationFn: async (deviceData: NetworkAPI.DeviceInput) => {
+      // Validate input
+      const validation = validator.validateNetworkDevice(deviceData);
+      if (!validation.valid) {
+        const errorMessage = validation.errors.map(e => e.message).join(', ');
+        throw new Error(`Validation failed: ${errorMessage}`);
+      }
+
+      return unifiedApiClient.createDevice(deviceData);
+    },
     onSuccess: () => {
       queryClient.invalidateQueries({ queryKey: ['devices'] });
+      logger.info('Device created successfully');
     },
     onError: (error) => {
-      console.error('Create device error:', error);
+      logger.error('Failed to create device', { error: (error as Error).message });
     }
   });
 };

 export const useUpdateDevice = () => {
   const queryClient = useQueryClient();
   
   return useMutation({
-    mutationFn: ({ macAddress, updates }: { macAddress: string; updates: any }) => 
-      updateDevice(macAddress, updates),
+    mutationFn: ({ macAddress, updates }: { macAddress: string; updates: NetworkAPI.DeviceUpdate }) => {
+      return unifiedApiClient.updateDevice(macAddress, updates);
+    },
     onSuccess: (data, variables) => {
       queryClient.invalidateQueries({ queryKey: ['devices'] });
       queryClient.invalidateQueries({ queryKey: ['device', variables.macAddress] });
+      logger.info('Device updated successfully', { macAddress: variables.macAddress });
     },
     onError: (error) => {
-      console.error('Update device error:', error);
+      logger.error('Failed to update device', { error: (error as Error).message });
     }
   });
 };

 export const useDeleteDevice = () => {
   const queryClient = useQueryClient();
   
   return useMutation({
-    mutationFn: deleteDevice,
+    mutationFn: (macAddress: string) => unifiedApiClient.deleteDevice(macAddress),
     onSuccess: () => {
       queryClient.invalidateQueries({ queryKey: ['devices'] });
+      logger.info('Device deleted successfully');
     },
     onError: (error) => {
-      console.error('Delete device error:', error);
+      logger.error('Failed to delete device', { error: (error as Error).message });
     }
   });
 };

 export const useWakeDevice = () => {
   return useMutation({
-    mutationFn: wakeDevice,
+    mutationFn: (macAddress: string) => unifiedApiClient.wakeDevice(macAddress),
     onError: (error) => {
-      console.error('Wake device error:', error);
+      logger.error('Failed to wake device', { error: (error as Error).message });
     }
   });
 };

+// Device discovery hook
+export const useDiscoverDevices = () => {
+  const queryClient = useQueryClient();
+  
+  return useMutation({
+    mutationFn: () => unifiedApiClient.discoverDevices(),
+    onSuccess: (data) => {
+      queryClient.invalidateQueries({ queryKey: ['devices'] });
+      logger.info('Device discovery completed', {
+        discovered: data.data?.discovered || 0
+      });
+    },
+    onError: (error) => {
+      logger.error('Device discovery failed', { error: (error as Error).message });
+    }
+  });
+};