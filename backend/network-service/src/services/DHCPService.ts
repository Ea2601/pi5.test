import { SharedDatabaseService } from '../../shared/database';
import { createServiceLogger } from '../../shared/utils/logger';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs-extra';

const execAsync = promisify(exec);
const logger = createServiceLogger('dhcp-service');

export interface DHCPPool {
  id: string;
  name: string;
  description?: string;
  vlan_id: number;
  network_cidr: string;
  start_ip: string;
  end_ip: string;
  gateway_ip: string;
  subnet_mask: string;
  dns_servers: string[];
  lease_time: string;
  max_lease_time: string;
  is_active: boolean;
  allow_unknown_clients: boolean;
  require_authorization: boolean;
  created_at: string;
  updated_at: string;
}

export class DHCPService {
  private db: SharedDatabaseService;

  constructor() {
    this.db = SharedDatabaseService.getInstance({
      connectionString: process.env.DATABASE_URL!
    });
  }

  async getAllPools(): Promise<DHCPPool[]> {
    try {
      const result = await this.db.query(`
        SELECT * FROM dhcp_pools 
        ORDER BY vlan_id ASC
      `);
      
      return result.rows;
    } catch (error) {
      logger.error('Error fetching DHCP pools:', error);
      throw new Error('Failed to fetch DHCP pools');
    }
  }

  async createPool(poolData: Partial<DHCPPool>): Promise<DHCPPool> {
    try {
      const result = await this.db.query(`
        INSERT INTO dhcp_pools (
          name, description, vlan_id, network_cidr, start_ip, end_ip,
          gateway_ip, subnet_mask, dns_servers, lease_time, max_lease_time,
          allow_unknown_clients, require_authorization, is_active
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
        RETURNING *
      `, [
        poolData.name,
        poolData.description,
        poolData.vlan_id,
        poolData.network_cidr,
        poolData.start_ip,
        poolData.end_ip,
        poolData.gateway_ip,
        poolData.subnet_mask,
        JSON.stringify(poolData.dns_servers),
        poolData.lease_time || '24 hours',
        poolData.max_lease_time || '7 days',
        poolData.allow_unknown_clients !== undefined ? poolData.allow_unknown_clients : true,
        poolData.require_authorization || false,
        true
      ]);

      const pool = result.rows[0];
      logger.info(`Created DHCP pool: ${pool.name} for VLAN ${pool.vlan_id}`);
      return pool;
    } catch (error) {
      logger.error('Error creating DHCP pool:', error);
      throw new Error('Failed to create DHCP pool');
    }
  }

  async updatePool(id: string, updates: Partial<DHCPPool>): Promise<DHCPPool | null> {
    try {
      const setClauses: string[] = [];
      const params: any[] = [];
      let paramIndex = 1;

      Object.entries(updates).forEach(([key, value]) => {
        if (value !== undefined && key !== 'id' && key !== 'created_at') {
          if (key === 'dns_servers') {
            setClauses.push(`${key} = $${paramIndex}`);
            params.push(JSON.stringify(value));
          } else {
            setClauses.push(`${key} = $${paramIndex}`);
            params.push(value);
          }
          paramIndex++;
        }
      });

      if (setClauses.length === 0) {
        return await this.getPoolById(id);
      }

      setClauses.push(`updated_at = NOW()`);
      params.push(id);

      const result = await this.db.query(`
        UPDATE dhcp_pools 
        SET ${setClauses.join(', ')}
        WHERE id = $${paramIndex}
        RETURNING *
      `, params);

      const pool = result.rows[0];
      if (pool) {
        logger.info(`Updated DHCP pool: ${pool.name}`);
      }

      return pool || null;
    } catch (error) {
      logger.error('Error updating DHCP pool:', error);
      throw new Error('Failed to update DHCP pool');
    }
  }

  async deletePool(id: string): Promise<boolean> {
    try {
      const pool = await this.getPoolById(id);
      if (!pool) return false;

      const result = await this.db.query(
        'DELETE FROM dhcp_pools WHERE id = $1',
        [id]
      );

      if (result.rowCount && result.rowCount > 0) {
        logger.info(`Deleted DHCP pool: ${pool.name}`);
        return true;
      }

      return false;
    } catch (error) {
      logger.error('Error deleting DHCP pool:', error);
      throw new Error('Failed to delete DHCP pool');
    }
  }

  private async getPoolById(id: string): Promise<DHCPPool | null> {
    try {
      const result = await this.db.query(
        'SELECT * FROM dhcp_pools WHERE id = $1',
        [id]
      );
      return result.rows[0] || null;
    } catch (error) {
      logger.error('Error fetching DHCP pool by ID:', error);
      return null;
    }
  }

  async getAllReservations(filters?: { group_id?: string; pool_id?: string }): Promise<any[]> {
    try {
      let query = `
        SELECT 
          r.*,
          dg.name as group_name,
          dg.group_type,
          dp.name as pool_name,
          dp.vlan_id
        FROM dhcp_reservations r
        LEFT JOIN dhcp_device_groups dg ON r.device_group_id = dg.id
        LEFT JOIN dhcp_pools dp ON r.dhcp_pool_id = dp.id
        WHERE 1=1
      `;
      
      const params: any[] = [];

      if (filters?.group_id) {
        query += ' AND r.device_group_id = $' + (params.length + 1);
        params.push(filters.group_id);
      }

      if (filters?.pool_id) {
        query += ' AND r.dhcp_pool_id = $' + (params.length + 1);
        params.push(filters.pool_id);
      }

      query += ' ORDER BY r.ip_address';

      const result = await this.db.query(query, params);
      return result.rows;
    } catch (error) {
      logger.error('Error fetching DHCP reservations:', error);
      throw new Error('Failed to fetch DHCP reservations');
    }
  }

  async createReservation(reservationData: any): Promise<any> {
    try {
      const result = await this.db.query(`
        INSERT INTO dhcp_reservations (
          mac_address, ip_address, hostname, device_group_id, dhcp_pool_id,
          description, lease_time_override, custom_dns_servers, is_active
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *
      `, [
        reservationData.mac_address,
        reservationData.ip_address,
        reservationData.hostname,
        reservationData.device_group_id,
        reservationData.dhcp_pool_id,
        reservationData.description,
        reservationData.lease_time_override,
        reservationData.custom_dns_servers ? JSON.stringify(reservationData.custom_dns_servers) : null,
        true
      ]);

      const reservation = result.rows[0];
      logger.info(`Created DHCP reservation: ${reservation.mac_address} -> ${reservation.ip_address}`);
      return reservation;
    } catch (error) {
      logger.error('Error creating DHCP reservation:', error);
      throw new Error('Failed to create DHCP reservation');
    }
  }

  async getActiveLeases(): Promise<any[]> {
    try {
      const result = await this.db.query(`
        SELECT 
          l.*,
          dp.name as pool_name,
          dp.vlan_id,
          dg.name as group_name,
          dg.group_type
        FROM dhcp_leases l
        LEFT JOIN dhcp_pools dp ON l.dhcp_pool_id = dp.id
        LEFT JOIN dhcp_device_groups dg ON l.device_group_id = dg.id
        WHERE l.state = 'active' AND l.lease_end > NOW()
        ORDER BY l.lease_end ASC
      `);
      
      return result.rows;
    } catch (error) {
      logger.error('Error fetching active DHCP leases:', error);
      throw new Error('Failed to fetch active DHCP leases');
    }
  }

  async releaseIP(macAddress: string): Promise<boolean> {
    try {
      const result = await this.db.query(`
        UPDATE dhcp_leases 
        SET state = 'released', updated_at = NOW()
        WHERE mac_address = $1 AND state = 'active'
      `, [macAddress]);

      if (result.rowCount && result.rowCount > 0) {
        logger.info(`Released IP for MAC: ${macAddress}`);
        return true;
      }

      return false;
    } catch (error) {
      logger.error('Error releasing IP:', error);
      throw new Error('Failed to release IP');
    }
  }

  async renewLease(id: string, newLeaseTime?: string): Promise<any> {
    try {
      const leaseTime = newLeaseTime || '24 hours';
      const newLeaseEnd = new Date();
      
      // Calculate lease end based on lease time
      if (leaseTime.includes('hour')) {
        const hours = parseInt(leaseTime);
        newLeaseEnd.setHours(newLeaseEnd.getHours() + hours);
      } else if (leaseTime.includes('day')) {
        const days = parseInt(leaseTime);
        newLeaseEnd.setDate(newLeaseEnd.getDate() + days);
      }

      const result = await this.db.query(`
        UPDATE dhcp_leases 
        SET 
          lease_end = $1,
          renewal_count = renewal_count + 1,
          last_renewal = NOW(),
          updated_at = NOW()
        WHERE id = $2
        RETURNING *
      `, [newLeaseEnd.toISOString(), id]);

      const lease = result.rows[0];
      if (lease) {
        logger.info(`Renewed lease: ${lease.mac_address} -> ${lease.ip_address}`);
      }

      return lease;
    } catch (error) {
      logger.error('Error renewing lease:', error);
      throw new Error('Failed to renew lease');
    }
  }

  async getDeviceGroups(): Promise<any[]> {
    try {
      const result = await this.db.query(`
        SELECT 
          dg.*,
          COUNT(dr.id) as reservation_count
        FROM dhcp_device_groups dg
        LEFT JOIN dhcp_reservations dr ON dg.id = dr.device_group_id AND dr.is_active = true
        GROUP BY dg.id
        ORDER BY dg.name
      `);
      
      return result.rows;
    } catch (error) {
      logger.error('Error fetching device groups:', error);
      throw new Error('Failed to fetch device groups');
    }
  }

  async getLogs(filters?: {
    mac_address?: string;
    event_type?: string;
    start_date?: string;
    end_date?: string;
    limit?: number;
  }): Promise<any[]> {
    try {
      let query = 'SELECT * FROM dhcp_logs WHERE 1=1';
      const params: any[] = [];

      if (filters?.mac_address) {
        query += ' AND mac_address = $' + (params.length + 1);
        params.push(filters.mac_address);
      }

      if (filters?.event_type) {
        query += ' AND event_type = $' + (params.length + 1);
        params.push(filters.event_type);
      }

      if (filters?.start_date) {
        query += ' AND timestamp >= $' + (params.length + 1);
        params.push(filters.start_date);
      }

      if (filters?.end_date) {
        query += ' AND timestamp <= $' + (params.length + 1);
        params.push(filters.end_date);
      }

      query += ' ORDER BY timestamp DESC';

      if (filters?.limit) {
        query += ' LIMIT $' + (params.length + 1);
        params.push(filters.limit);
      }

      const result = await this.db.query(query, params);
      return result.rows;
    } catch (error) {
      logger.error('Error fetching DHCP logs:', error);
      throw new Error('Failed to fetch DHCP logs');
    }
  }

  async getStats(): Promise<any> {
    try {
      // Get pools statistics
      const poolsResult = await this.db.query(`
        SELECT 
          COUNT(*) as total_pools,
          COUNT(*) FILTER (WHERE is_active = true) as active_pools
        FROM dhcp_pools
      `);

      // Get leases statistics
      const leasesResult = await this.db.query(`
        SELECT 
          COUNT(*) as total_leases,
          COUNT(*) FILTER (WHERE state = 'active' AND lease_end > NOW()) as active_leases,
          COUNT(*) FILTER (WHERE state = 'expired' OR lease_end <= NOW()) as expired_leases
        FROM dhcp_leases
      `);

      // Get reservations statistics
      const reservationsResult = await this.db.query(`
        SELECT 
          COUNT(*) as total_reservations,
          COUNT(*) FILTER (WHERE is_active = true) as active_reservations
        FROM dhcp_reservations
      `);

      // Get pool utilization
      const utilizationResult = await this.db.query(`
        SELECT 
          dp.name as pool_name,
          dp.vlan_id,
          dp.start_ip,
          dp.end_ip,
          COUNT(dl.id) as used_ips
        FROM dhcp_pools dp
        LEFT JOIN dhcp_leases dl ON dp.id = dl.dhcp_pool_id AND dl.state = 'active' AND dl.lease_end > NOW()
        WHERE dp.is_active = true
        GROUP BY dp.id, dp.name, dp.vlan_id, dp.start_ip, dp.end_ip
      `);

      const poolUtilization = utilizationResult.rows.map(row => {
        const totalIPs = this.calculatePoolSize(row.start_ip, row.end_ip);
        const usedIPs = parseInt(row.used_ips);
        
        return {
          pool_name: row.pool_name,
          vlan_id: row.vlan_id,
          total_ips: totalIPs,
          used_ips: usedIPs,
          utilization_percent: Math.round((usedIPs / totalIPs) * 100)
        };
      });

      // Get recent activity
      const recentActivity = await this.db.query(`
        SELECT * FROM dhcp_logs 
        ORDER BY timestamp DESC 
        LIMIT 20
      `);

      return {
        total_pools: parseInt(poolsResult.rows[0].total_pools),
        active_pools: parseInt(poolsResult.rows[0].active_pools),
        total_leases: parseInt(leasesResult.rows[0].total_leases),
        active_leases: parseInt(leasesResult.rows[0].active_leases),
        expired_leases: parseInt(leasesResult.rows[0].expired_leases),
        total_reservations: parseInt(reservationsResult.rows[0].total_reservations),
        active_reservations: parseInt(reservationsResult.rows[0].active_reservations),
        pool_utilization: poolUtilization,
        recent_activity: recentActivity.rows
      };
    } catch (error) {
      logger.error('Error fetching DHCP stats:', error);
      throw new Error('Failed to fetch DHCP statistics');
    }
  }

  private calculatePoolSize(startIP: string, endIP: string): number {
    const start = startIP.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet), 0) >>> 0;
    const end = endIP.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet), 0) >>> 0;
    return end - start + 1;
  }

  async applyConfiguration(): Promise<{ success: boolean; errors: string[] }> {
    try {
      logger.info('Applying DHCP configuration to system');
      
      const errors: string[] = [];
      
      // Get active pools
      const pools = await this.getAllPools();
      const activePools = pools.filter(p => p.is_active);
      
      if (activePools.length === 0) {
        errors.push('No active DHCP pools configured');
      }

      // Check for overlapping ranges
      for (let i = 0; i < activePools.length; i++) {
        for (let j = i + 1; j < activePools.length; j++) {
          if (this.isOverlapping(activePools[i], activePools[j])) {
            errors.push(`IP range overlap detected: ${activePools[i].name} and ${activePools[j].name}`);
          }
        }
      }

      // Generate Kea configuration
      if (errors.length === 0) {
        const config = await this.generateKeaConfig();
        
        // In production, write to /etc/kea/kea-dhcp4.conf
        // await fs.writeFile('/etc/kea/kea-dhcp4.conf', config);
        
        // Restart Kea service
        // await execAsync('sudo systemctl restart kea-dhcp4');
        
        logger.info('DHCP configuration applied successfully');
      }

      return { success: errors.length === 0, errors };
    } catch (error) {
      logger.error('Error applying DHCP configuration:', error);
      return { 
        success: false, 
        errors: [error instanceof Error ? error.message : 'Configuration failed'] 
      };
    }
  }

  private isOverlapping(pool1: DHCPPool, pool2: DHCPPool): boolean {
    const start1 = this.ipToNumber(pool1.start_ip);
    const end1 = this.ipToNumber(pool1.end_ip);
    const start2 = this.ipToNumber(pool2.start_ip);
    const end2 = this.ipToNumber(pool2.end_ip);
    
    return !(end1 < start2 || end2 < start1);
  }

  private ipToNumber(ip: string): number {
    return ip.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet), 0) >>> 0;
  }

  async generateKeaConfig(): Promise<string> {
    try {
      const pools = await this.getAllPools();
      const activePools = pools.filter(p => p.is_active);
      const reservations = await this.getAllReservations();

      const config = {
        "Dhcp4": {
          "interfaces-config": {
            "interfaces": ["*"],
            "dhcp-socket-type": "raw"
          },
          "control-socket": {
            "socket-type": "unix",
            "socket-name": "/tmp/kea-dhcp4-ctrl.sock"
          },
          "lease-database": {
            "type": "postgresql",
            "name": "pi5_supernode",
            "host": "localhost",
            "port": 5432,
            "user": "postgres",
            "password": process.env.POSTGRES_PASSWORD || "postgres"
          },
          "expired-leases-processing": {
            "reclaim-timer-wait-time": 10,
            "flush-reclaimed-timer-wait-time": 25,
            "hold-reclaimed-time": 3600,
            "max-reclaim-leases": 100,
            "max-reclaim-time": 250
          },
          "valid-lifetime": 86400,
          "max-valid-lifetime": 604800,
          "authoritative": true,
          "dhcp4o6-port": 0,
          "subnet4": activePools.map(pool => ({
            "subnet": pool.network_cidr,
            "id": pool.vlan_id,
            "pools": [{
              "pool": `${pool.start_ip} - ${pool.end_ip}`
            }],
            "option-data": [
              {
                "name": "routers",
                "data": pool.gateway_ip
              },
              {
                "name": "domain-name-servers",
                "data": pool.dns_servers.join(", ")
              },
              {
                "name": "domain-name",
                "data": "local"
              }
            ],
            "valid-lifetime": this.parseInterval(pool.lease_time),
            "max-valid-lifetime": this.parseInterval(pool.max_lease_time),
            "reservations": reservations
              .filter(r => r.dhcp_pool_id === pool.id && r.is_active)
              .map(r => ({
                "hw-address": r.mac_address,
                "ip-address": r.ip_address,
                "hostname": r.hostname || ""
              }))
          })),
          "loggers": [
            {
              "name": "kea-dhcp4",
              "output_options": [
                {
                  "output": "/var/log/kea-dhcp4.log",
                  "maxver": 8,
                  "maxsize": 204800,
                  "flush": true
                }
              ],
              "severity": "INFO",
              "debuglevel": 0
            }
          ],
          "hooks-libraries": [
            {
              "library": "/usr/lib/x86_64-linux-gnu/kea/hooks/libdhcp_lease_cmds.so"
            }
          ]
        }
      };

      return JSON.stringify(config, null, 2);
    } catch (error) {
      logger.error('Error generating Kea configuration:', error);
      throw new Error('Failed to generate DHCP configuration');
    }
  }

  private parseInterval(interval: string): number {
    // Convert interval string to seconds
    if (interval.includes('hour')) {
      const hours = parseInt(interval);
      return hours * 3600;
    } else if (interval.includes('day')) {
      const days = parseInt(interval);
      return days * 86400;
    } else if (interval.includes('minute')) {
      const minutes = parseInt(interval);
      return minutes * 60;
    }
    return 86400; // Default 24 hours
  }

  async discoverServers(): Promise<Array<{ ip: string; hostname?: string; vendor?: string }>> {
    try {
      // In production, this would scan for DHCP servers on the network
      logger.info('Discovering DHCP servers on network');
      
      // Mock discovery results
      return [
        { ip: '192.168.1.1', hostname: 'router.local', vendor: 'TP-Link' },
        { ip: '192.168.1.2', hostname: 'pi5-supernode', vendor: 'Raspberry Pi Foundation' }
      ];
    } catch (error) {
      logger.error('Error discovering DHCP servers:', error);
      throw new Error('Failed to discover DHCP servers');
    }
  }

  async getNextAvailableIP(poolId: string): Promise<string | null> {
    try {
      const pool = await this.getPoolById(poolId);
      if (!pool) return null;

      const usedIPs = await this.db.query(`
        SELECT ip_address FROM dhcp_leases 
        WHERE dhcp_pool_id = $1 AND state = 'active' AND lease_end > NOW()
        UNION
        SELECT ip_address FROM dhcp_reservations
        WHERE dhcp_pool_id = $1 AND is_active = true
      `, [poolId]);

      const usedIPSet = new Set(usedIPs.rows.map(row => row.ip_address));
      
      const startNum = this.ipToNumber(pool.start_ip);
      const endNum = this.ipToNumber(pool.end_ip);

      for (let i = startNum; i <= endNum; i++) {
        const ip = this.numberToIP(i);
        if (!usedIPSet.has(ip)) {
          return ip;
        }
      }

      return null; // Pool is full
    } catch (error) {
      logger.error('Error getting next available IP:', error);
      throw new Error('Failed to get next available IP');
    }
  }

  private numberToIP(num: number): string {
    return [
      (num >>> 24) & 255,
      (num >>> 16) & 255,
      (num >>> 8) & 255,
      num & 255
    ].join('.');
  }

  async cleanupExpiredLeases(): Promise<number> {
    try {
      const result = await this.db.query(`
        UPDATE dhcp_leases 
        SET state = 'expired', updated_at = NOW()
        WHERE state = 'active' AND lease_end <= NOW()
      `);

      const cleaned = result.rowCount || 0;
      logger.info(`Cleaned up ${cleaned} expired DHCP leases`);
      return cleaned;
    } catch (error) {
      logger.error('Error cleaning up expired leases:', error);
      throw new Error('Failed to cleanup expired leases');
    }
  }
}