import { DatabaseService } from '../utils/database';
import { logger } from '../utils/logger';

export interface NetworkDevice {
  mac_address: string;
  ip_address?: string;
  device_name?: string;
  device_type?: 'Mobile' | 'PC' | 'IoT' | 'Game Console';
  device_brand?: string;
  last_seen?: Date;
  is_active?: boolean;
  first_discovered?: Date;
  dhcp_lease_expires?: Date;
  vendor_info?: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface DeviceFilters {
  active?: boolean;
  type?: string;
  search?: string;
}

export class DeviceService {
  private db: DatabaseService;

  constructor() {
    this.db = new DatabaseService();
  }

  async getDevices(filters: DeviceFilters = {}): Promise<NetworkDevice[]> {
    try {
      let query = 'SELECT * FROM network_devices WHERE 1=1';
      const params: any[] = [];

      if (filters.active !== undefined) {
        query += ' AND is_active = $' + (params.length + 1);
        params.push(filters.active);
      }

      if (filters.type) {
        query += ' AND device_type = $' + (params.length + 1);
        params.push(filters.type);
      }

      if (filters.search) {
        query += ' AND (device_name ILIKE $' + (params.length + 1) + ' OR device_brand ILIKE $' + (params.length + 2) + ')';
        params.push(`%${filters.search}%`, `%${filters.search}%`);
      }

      query += ' ORDER BY last_seen DESC';

      const result = await this.db.query(query, params);
      return result.rows;
    } catch (error) {
      logger.error('Error fetching devices:', error);
      throw new Error('Failed to fetch devices');
    }
  }

  async getDeviceByMac(macAddress: string): Promise<NetworkDevice | null> {
    try {
      const result = await this.db.query(
        'SELECT * FROM network_devices WHERE mac_address = $1',
        [macAddress]
      );
      return result.rows[0] || null;
    } catch (error) {
      logger.error('Error fetching device:', error);
      throw new Error('Failed to fetch device');
    }
  }

  async createDevice(deviceData: NetworkDevice): Promise<NetworkDevice> {
    try {
      const result = await this.db.query(`
        INSERT INTO network_devices (
          mac_address, ip_address, device_name, device_type, device_brand,
          is_active, first_discovered, last_seen, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW(), NOW(), NOW())
        ON CONFLICT (mac_address) 
        DO UPDATE SET 
          ip_address = EXCLUDED.ip_address,
          device_name = EXCLUDED.device_name,
          device_type = EXCLUDED.device_type,
          device_brand = EXCLUDED.device_brand,
          is_active = EXCLUDED.is_active,
          last_seen = NOW(),
          updated_at = NOW()
        RETURNING *
      `, [
        deviceData.mac_address,
        deviceData.ip_address,
        deviceData.device_name || 'Unknown',
        deviceData.device_type || 'PC',
        deviceData.device_brand || 'Unknown',
        deviceData.is_active !== undefined ? deviceData.is_active : true
      ]);

      return result.rows[0];
    } catch (error) {
      logger.error('Error creating device:', error);
      throw new Error('Failed to create device');
    }
  }

  async updateDevice(macAddress: string, updates: Partial<NetworkDevice>): Promise<NetworkDevice | null> {
    try {
      const setClauses: string[] = [];
      const params: any[] = [];
      let paramIndex = 1;

      Object.entries(updates).forEach(([key, value]) => {
        if (value !== undefined && key !== 'mac_address') {
          setClauses.push(`${key} = $${paramIndex}`);
          params.push(value);
          paramIndex++;
        }
      });

      if (setClauses.length === 0) {
        return await this.getDeviceByMac(macAddress);
      }

      setClauses.push(`updated_at = NOW()`);
      params.push(macAddress);

      const result = await this.db.query(`
        UPDATE network_devices 
        SET ${setClauses.join(', ')}
        WHERE mac_address = $${paramIndex}
        RETURNING *
      `, params);

      return result.rows[0] || null;
    } catch (error) {
      logger.error('Error updating device:', error);
      throw new Error('Failed to update device');
    }
  }

  async deleteDevice(macAddress: string): Promise<boolean> {
    try {
      const result = await this.db.query(
        'DELETE FROM network_devices WHERE mac_address = $1',
        [macAddress]
      );
      return result.rowCount > 0;
    } catch (error) {
      logger.error('Error deleting device:', error);
      throw new Error('Failed to delete device');
    }
  }

  async wakeDevice(macAddress: string): Promise<void> {
    try {
      // Implement Wake-on-LAN functionality here
      logger.info(`Wake on LAN sent to device: ${macAddress}`);
      
      // Update last activity
      await this.updateDevice(macAddress, { 
        last_seen: new Date(),
        is_active: true 
      });
    } catch (error) {
      logger.error('Error waking device:', error);
      throw new Error('Failed to wake device');
    }
  }

  async discoverDevices(): Promise<NetworkDevice[]> {
    try {
      // Implement network discovery logic here
      // This would typically involve ARP scanning, DHCP lease parsing, etc.
      logger.info('Network device discovery started');
      
      // Return discovered devices
      return [];
    } catch (error) {
      logger.error('Error during device discovery:', error);
      throw new Error('Failed to discover devices');
    }
  }
}