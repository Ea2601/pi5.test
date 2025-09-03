import { unifiedApiClient } from '../unifiedApiClient';
import { NetworkDevice } from '../../types/network';

export const deviceService = {
  async getDevices(): Promise<NetworkDevice[]> {
    const response = await unifiedApiClient.getDevices();
    return response.data || [];
  },

  async discoverDevices(): Promise<any> {
    return unifiedApiClient.discoverDevices();
  },

  async wakeDevice(macAddress: string): Promise<any> {
    return unifiedApiClient.wakeDevice(macAddress);
  }
};