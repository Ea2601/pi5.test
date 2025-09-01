import { SharedDatabaseService } from '../../shared/database';
import { NetworkDevice, ApiResponse } from '../../shared/types/database';
import { createServiceLogger } from '../../shared/utils/logger';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const logger = createServiceLogger('network-service');

export interface DeviceFilters {
  active?: boolean;
  type?: string;
  search?: string;
}

export class DeviceService {
  private db: SharedDatabaseService;

  constructor() {
    this.db = SharedDatabaseService.getInstance({
      connectionString: process.env.DATABASE_URL!
    });
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
        query += ' AND (device_name ILIKE $' + (params.length + 1) + ' OR device_brand ILIKE $' + (params.length + 2) + ' OR ip_address::text ILIKE $' + (params.length + 3) + ')';
        params.push(`%${filters.search}%`, `%${filters.search}%`, `%${filters.search}%`);
      }

      query += ' ORDER BY last_seen DESC NULLS LAST';

      const result = await this.db.query(query, params);
      return result.rows;
    } catch (error) {
      logger.error('Error fetching devices:', error);
      throw new Error('Failed to fetch network devices');
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
      logger.error('Error fetching device by MAC:', error);
      throw new Error('Failed to fetch device');
    }
  }

  async createDevice(deviceData: Partial<NetworkDevice>): Promise<NetworkDevice> {
    try {
      const result = await this.db.query(`
        INSERT INTO network_devices (
          mac_address, ip_address, device_name, device_type, device_brand,
          is_active, first_discovered, last_seen, vendor_info,
          created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW(), $7, NOW(), NOW())
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
        deviceData.device_name || 'Unknown Device',
        deviceData.device_type || 'PC',
        deviceData.device_brand || 'Unknown',
        deviceData.is_active !== undefined ? deviceData.is_active : true,
        deviceData.vendor_info
      ]);

      logger.info(`Device created/updated: ${deviceData.mac_address}`);
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
        if (value !== undefined && key !== 'mac_address' && key !== 'created_at') {
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

      if (result.rows.length === 0) {
        return null;
      }

      logger.info(`Device updated: ${macAddress}`);
      return result.rows[0];
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

      if (result.rowCount && result.rowCount > 0) {
        logger.info(`Device deleted: ${macAddress}`);
        return true;
      }

      return false;
    } catch (error) {
      logger.error('Error deleting device:', error);
      throw new Error('Failed to delete device');
    }
  }

  async wakeDevice(macAddress: string): Promise<void> {
    try {
      // Send Wake-on-LAN packet
      await this.sendWakeOnLan(macAddress);
      
      // Update device as potentially active
      await this.updateDevice(macAddress, { 
        last_seen: new Date().toISOString(),
        is_active: true 
      });

      logger.info(`Wake-on-LAN sent to device: ${macAddress}`);
    } catch (error) {
      logger.error('Error waking device:', error);
      throw new Error('Failed to wake device');
    }
  }

  async discoverDevices(): Promise<NetworkDevice[]> {
    try {
      logger.info('Starting network device discovery');
      
      // Get current network range (this could be configurable)
      const networkRange = process.env.NETWORK_RANGE || '192.168.1.0/24';
      
      // Run nmap scan
      const { stdout } = await execAsync(`nmap -sn ${networkRange}`);
      
      // Parse nmap output and ARP table
      const arpTable = await this.getArpTable();
      const discoveredDevices: Partial<NetworkDevice>[] = [];

      // Process ARP entries
      for (const arpEntry of arpTable) {
        const device: Partial<NetworkDevice> = {
          mac_address: arpEntry.mac,
          ip_address: arpEntry.ip,
          device_name: arpEntry.hostname || 'Unknown Device',
          device_type: this.inferDeviceType(arpEntry.mac),
          device_brand: await this.lookupVendor(arpEntry.mac),
          is_active: true,
          vendor_info: await this.lookupVendor(arpEntry.mac)
        };

        discoveredDevices.push(device);
      }

      // Insert/Update discovered devices
      const results: NetworkDevice[] = [];
      for (const device of discoveredDevices) {
        if (device.mac_address) {
          const created = await this.createDevice(device);
          results.push(created);
        }
      }

      logger.info(`Device discovery completed. Found ${results.length} devices`);
      return results;
    } catch (error) {
      logger.error('Error during device discovery:', error);
      throw new Error('Failed to discover devices');
    }
  }

  private async getArpTable(): Promise<Array<{ ip: string; mac: string; hostname?: string }>> {
    try {
      const { stdout } = await execAsync('arp -a');
      const arpEntries: Array<{ ip: string; mac: string; hostname?: string }> = [];

      const lines = stdout.split('\n');
      for (const line of lines) {
        const match = line.match(/\((\d+\.\d+\.\d+\.\d+)\) at ([a-fA-F0-9:]{17})/);
        if (match) {
          const [, ip, mac] = match;
          const hostname = line.split(' ')[0] || undefined;
          
          arpEntries.push({
            ip: ip,
            mac: mac.toLowerCase(),
            hostname: hostname !== `(${ip})` ? hostname : undefined
          });
        }
      }

      return arpEntries;
    } catch (error) {
      logger.error('Error getting ARP table:', error);
      return [];
    }
  }

  private inferDeviceType(macAddress: string): 'Mobile' | 'PC' | 'IoT' | 'Game Console' {
    const mac = macAddress.toLowerCase();
    
    // Simple MAC-based device type inference
    // This could be enhanced with a proper OUI database
    if (mac.startsWith('00:1a:2b') || mac.startsWith('ac:de:48')) {
      return 'Mobile';
    } else if (mac.startsWith('00:1b:63') || mac.startsWith('00:15:5d')) {
      return 'PC';
    } else if (mac.startsWith('b8:27:eb') || mac.startsWith('dc:a6:32')) {
      return 'IoT';
    } else {
      return 'PC'; // Default
    }
  }

  private async lookupVendor(macAddress: string): Promise<string> {
    try {
      // In production, this would use an OUI database
      const oui = macAddress.substring(0, 8).toUpperCase();
      
      const vendorMap: Record<string, string> = {
        '00:1A:2B': 'Apple Inc.',
        'AC:DE:48': 'Apple Inc.',
        '00:1B:63': 'Apple Inc.',
        'B8:27:EB': 'Raspberry Pi Foundation',
        'DC:A6:32': 'Raspberry Pi Trading',
        '00:15:5D': 'Microsoft Corporation',
        '00:50:56': 'VMware Inc.',
        '08:00:27': 'PCS Systemtechnik GmbH'
      };

      return vendorMap[oui] || 'Unknown Vendor';
    } catch (error) {
      logger.error('Error looking up vendor:', error);
      return 'Unknown Vendor';
    }
  }

  private async sendWakeOnLan(macAddress: string): Promise<void> {
    try {
      // In production, implement actual WOL packet sending
      // For now, just log the action
      logger.info(`Wake-on-LAN packet would be sent to ${macAddress}`);
      
      // Example implementation using wakeonlan package:
      // await execAsync(`wakeonlan ${macAddress}`);
    } catch (error) {
      logger.error('Error sending Wake-on-LAN:', error);
      throw error;
    }
  }

  async getNetworkStatistics(): Promise<any> {
    try {
      const result = await this.db.query(`
        SELECT 
          COUNT(*) as total_devices,
          COUNT(*) FILTER (WHERE is_active = true) as active_devices,
          COUNT(*) FILTER (WHERE device_type = 'Mobile') as mobile_devices,
          COUNT(*) FILTER (WHERE device_type = 'PC') as pc_devices,
          COUNT(*) FILTER (WHERE device_type = 'IoT') as iot_devices,
          COUNT(*) FILTER (WHERE device_type = 'Game Console') as gaming_devices,
          COUNT(*) FILTER (WHERE last_seen > NOW() - INTERVAL '1 hour') as recently_active
        FROM network_devices
      `);

      return result.rows[0];
    } catch (error) {
      logger.error('Error fetching network statistics:', error);
      throw new Error('Failed to fetch network statistics');
    }
  }
}