import { supabase } from './supabase';
import { 
  DHCPPool, 
  DHCPReservation, 
  DHCPDeviceGroup, 
  DHCPLease, 
  DHCPSecurityPolicy, 
  DHCPOption,
  DHCPLog,
  DHCPStats,
  DHCPConfiguration
} from '../types/dhcp';

class DHCPService {
  // DHCP Pool Management
  async getDHCPPools(): Promise<DHCPPool[]> {
    const { data, error } = await supabase
      .from('dhcp_pools')
      .select('*')
      .order('vlan_id');
    
    if (error) throw error;
    return data || [];
  }

  async createDHCPPool(pool: Partial<DHCPPool>): Promise<DHCPPool> {
    const { data, error } = await supabase
      .from('dhcp_pools')
      .insert([pool])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async updateDHCPPool(id: string, updates: Partial<DHCPPool>): Promise<DHCPPool> {
    const { data, error } = await supabase
      .from('dhcp_pools')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async deleteDHCPPool(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('dhcp_pools')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  }

  // DHCP Reservations (Static IP Management)
  async getDHCPReservations(filters?: { group_id?: string; pool_id?: string }): Promise<DHCPReservation[]> {
    let query = supabase
      .from('dhcp_reservations')
      .select(`
        *,
        device_group:dhcp_device_groups(name, group_type),
        dhcp_pool:dhcp_pools(name, vlan_id)
      `);

    if (filters?.group_id) {
      query = query.eq('device_group_id', filters.group_id);
    }

    if (filters?.pool_id) {
      query = query.eq('dhcp_pool_id', filters.pool_id);
    }

    query = query.order('ip_address');

    const { data, error } = await query;
    
    if (error) throw error;
    return data || [];
  }

  async createDHCPReservation(reservation: Partial<DHCPReservation>): Promise<DHCPReservation> {
    const { data, error } = await supabase
      .from('dhcp_reservations')
      .insert([reservation])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async updateDHCPReservation(id: string, updates: Partial<DHCPReservation>): Promise<DHCPReservation> {
    const { data, error } = await supabase
      .from('dhcp_reservations')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async deleteDHCPReservation(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('dhcp_reservations')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  }

  // Device Groups Management
  async getDeviceGroups(): Promise<DHCPDeviceGroup[]> {
    const { data, error } = await supabase
      .from('dhcp_device_groups')
      .select('*')
      .order('name');
    
    if (error) throw error;
    return data || [];
  }

  async createDeviceGroup(group: Partial<DHCPDeviceGroup>): Promise<DHCPDeviceGroup> {
    const { data, error } = await supabase
      .from('dhcp_device_groups')
      .insert([group])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  // Active Leases Management
  async getActiveLeases(): Promise<DHCPLease[]> {
    const { data, error } = await supabase
      .from('dhcp_leases')
      .select(`
        *,
        dhcp_pool:dhcp_pools(name, vlan_id),
        device_group:dhcp_device_groups(name, group_type)
      `)
      .eq('state', 'active')
      .gte('lease_end', new Date().toISOString())
      .order('lease_end');
    
    if (error) throw error;
    return data || [];
  }

  async releaseIP(macAddress: string): Promise<boolean> {
    const { error } = await supabase
      .from('dhcp_leases')
      .update({ 
        state: 'released',
        updated_at: new Date().toISOString()
      })
      .eq('mac_address', macAddress)
      .eq('state', 'active');
    
    if (error) throw error;
    return true;
  }

  async renewLease(id: string, newLeaseTime?: string): Promise<DHCPLease> {
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

    const { data, error } = await supabase
      .from('dhcp_leases')
      .update({
        lease_end: newLeaseEnd.toISOString(),
        renewal_count: supabase.raw('renewal_count + 1'),
        last_renewal: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  // Security Policies
  async getSecurityPolicies(): Promise<DHCPSecurityPolicy[]> {
    const { data, error } = await supabase
      .from('dhcp_security_policies')
      .select('*')
      .order('priority');
    
    if (error) throw error;
    return data || [];
  }

  async createSecurityPolicy(policy: Partial<DHCPSecurityPolicy>): Promise<DHCPSecurityPolicy> {
    const { data, error } = await supabase
      .from('dhcp_security_policies')
      .insert([policy])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  // DHCP Options Management
  async getDHCPOptions(): Promise<DHCPOption[]> {
    const { data, error } = await supabase
      .from('dhcp_options')
      .select('*')
      .order('option_code');
    
    if (error) throw error;
    return data || [];
  }

  async createDHCPOption(option: Partial<DHCPOption>): Promise<DHCPOption> {
    const { data, error } = await supabase
      .from('dhcp_options')
      .insert([option])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  // DHCP Logs and Monitoring
  async getDHCPLogs(filters?: {
    mac_address?: string;
    event_type?: string;
    start_date?: string;
    end_date?: string;
    limit?: number;
  }): Promise<DHCPLog[]> {
    let query = supabase
      .from('dhcp_logs')
      .select('*');

    if (filters?.mac_address) {
      query = query.eq('mac_address', filters.mac_address);
    }

    if (filters?.event_type) {
      query = query.eq('event_type', filters.event_type);
    }

    if (filters?.start_date) {
      query = query.gte('timestamp', filters.start_date);
    }

    if (filters?.end_date) {
      query = query.lte('timestamp', filters.end_date);
    }

    query = query
      .order('timestamp', { ascending: false })
      .limit(filters?.limit || 100);

    const { data, error } = await query;
    
    if (error) throw error;
    return data || [];
  }

  // Analytics and Statistics
  async getDHCPStats(): Promise<DHCPStats> {
    try {
      // Get pools statistics
      const { data: pools, error: poolsError } = await supabase
        .from('dhcp_pools')
        .select('*');

      if (poolsError) throw poolsError;

      // Get leases statistics
      const { data: leases, error: leasesError } = await supabase
        .from('dhcp_leases')
        .select('*');

      if (leasesError) throw leasesError;

      // Get reservations count
      const { data: reservations, error: reservationsError } = await supabase
        .from('dhcp_reservations')
        .select('id, is_active');

      if (reservationsError) throw reservationsError;

      // Get recent logs
      const { data: recentLogs, error: logsError } = await supabase
        .from('dhcp_logs')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(20);

      if (logsError) throw logsError;

      const activePools = pools?.filter(p => p.is_active) || [];
      const activeLeases = leases?.filter(l => l.state === 'active' && new Date(l.lease_end) > new Date()) || [];
      const expiredLeases = leases?.filter(l => l.state === 'expired' || new Date(l.lease_end) <= new Date()) || [];
      const activeReservations = reservations?.filter(r => r.is_active) || [];

      // Calculate pool utilization
      const poolUtilization = activePools.map(pool => {
        const poolLeases = activeLeases.filter(lease => lease.dhcp_pool_id === pool.id);
        const startIP = this.ipToNumber(pool.start_ip);
        const endIP = this.ipToNumber(pool.end_ip);
        const totalIPs = endIP - startIP + 1;
        const usedIPs = poolLeases.length;

        return {
          pool_name: pool.name,
          vlan_id: pool.vlan_id,
          total_ips: totalIPs,
          used_ips: usedIPs,
          utilization_percent: Math.round((usedIPs / totalIPs) * 100)
        };
      });

      return {
        total_pools: pools?.length || 0,
        active_pools: activePools.length,
        total_leases: leases?.length || 0,
        active_leases: activeLeases.length,
        expired_leases: expiredLeases.length,
        total_reservations: reservations?.length || 0,
        active_reservations: activeReservations.length,
        pool_utilization: poolUtilization,
        recent_activity: recentLogs || []
      };
    } catch (error) {
      throw error;
    }
  }

  // Utility Functions
  private ipToNumber(ip: string): number {
    return ip.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet), 0) >>> 0;
  }

  private numberToIP(num: number): string {
    return [
      (num >>> 24) & 255,
      (num >>> 16) & 255,
      (num >>> 8) & 255,
      num & 255
    ].join('.');
  }

  // Network Discovery Integration
  async discoverDHCPServers(): Promise<Array<{ ip: string; hostname?: string; vendor?: string }>> {
    try {
      // In production, this would scan for DHCP servers on the network
      // For now, return mock data
      return [
        { ip: '192.168.1.1', hostname: 'router.local', vendor: 'TP-Link' },
        { ip: '192.168.1.2', hostname: 'pi5-supernode', vendor: 'Raspberry Pi Foundation' }
      ];
    } catch (error) {
      throw error;
    }
  }

  // Configuration Generation
  async generateKeaConfig(): Promise<string> {
    try {
      const pools = await this.getDHCPPools();
      const reservations = await this.getDHCPReservations();
      const options = await this.getDHCPOptions();

      const config = {
        "Dhcp4": {
          "interfaces-config": {
            "interfaces": ["*"]
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
            "password": process.env.POSTGRES_PASSWORD
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
          "subnet4": pools.filter(p => p.is_active).map(pool => ({
            "subnet": pool.network_cidr,
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
          ]
        }
      };

      return JSON.stringify(config, null, 2);
    } catch (error) {
      throw error;
    }
  }

  private parseInterval(interval: string): number {
    // Convert PostgreSQL interval to seconds
    if (interval.includes('hour')) {
      return parseInt(interval) * 3600;
    } else if (interval.includes('day')) {
      return parseInt(interval) * 86400;
    } else if (interval.includes('minute')) {
      return parseInt(interval) * 60;
    }
    return 86400; // Default 24 hours
  }

  // System Integration
  async applyDHCPConfiguration(): Promise<{ success: boolean; errors: string[] }> {
    try {
      // In production, this would:
      // 1. Generate Kea DHCP configuration
      // 2. Validate configuration syntax
      // 3. Apply configuration to Kea server
      // 4. Restart DHCP service
      // 5. Update iptables for DHCP relay if needed

      const errors: string[] = [];
      
      // Validate pools
      const pools = await this.getDHCPPools();
      const activePools = pools.filter(p => p.is_active);
      
      if (activePools.length === 0) {
        errors.push('En az bir aktif DHCP pool gerekli');
      }

      // Check for overlapping IP ranges
      for (let i = 0; i < activePools.length; i++) {
        for (let j = i + 1; j < activePools.length; j++) {
          const pool1 = activePools[i];
          const pool2 = activePools[j];
          
          if (this.isOverlapping(pool1.start_ip, pool1.end_ip, pool2.start_ip, pool2.end_ip)) {
            errors.push(`IP aralığı çakışması: ${pool1.name} ve ${pool2.name}`);
          }
        }
      }

      // Simulate configuration application
      await new Promise(resolve => setTimeout(resolve, 1000));

      return { success: errors.length === 0, errors };
    } catch (error) {
      return { 
        success: false, 
        errors: [error instanceof Error ? error.message : 'DHCP configuration failed'] 
      };
    }
  }

  private isOverlapping(start1: string, end1: string, start2: string, end2: string): boolean {
    const s1 = this.ipToNumber(start1);
    const e1 = this.ipToNumber(end1);
    const s2 = this.ipToNumber(start2);
    const e2 = this.ipToNumber(end2);
    
    return !(e1 < s2 || e2 < s1);
  }

  // IP Assignment Logic
  async getNextAvailableIP(poolId: string): Promise<string | null> {
    try {
      const { data: pool, error: poolError } = await supabase
        .from('dhcp_pools')
        .select('*')
        .eq('id', poolId)
        .single();

      if (poolError) throw poolError;
      if (!pool) return null;

      const { data: leases, error: leasesError } = await supabase
        .from('dhcp_leases')
        .select('ip_address')
        .eq('dhcp_pool_id', poolId)
        .eq('state', 'active')
        .gte('lease_end', new Date().toISOString());

      if (leasesError) throw leasesError;

      const { data: reservations, error: reservationsError } = await supabase
        .from('dhcp_reservations')
        .select('ip_address')
        .eq('dhcp_pool_id', poolId)
        .eq('is_active', true);

      if (reservationsError) throw reservationsError;

      const usedIPs = new Set([
        ...(leases?.map(l => l.ip_address) || []),
        ...(reservations?.map(r => r.ip_address) || [])
      ]);

      const startNum = this.ipToNumber(pool.start_ip);
      const endNum = this.ipToNumber(pool.end_ip);

      for (let i = startNum; i <= endNum; i++) {
        const ip = this.numberToIP(i);
        if (!usedIPs.has(ip)) {
          return ip;
        }
      }

      return null; // Pool is full
    } catch (error) {
      throw error;
    }
  }

  // Bulk Operations
  async bulkCreateReservations(reservations: Array<Partial<DHCPReservation>>): Promise<DHCPReservation[]> {
    const { data, error } = await supabase
      .from('dhcp_reservations')
      .insert(reservations)
      .select();
    
    if (error) throw error;
    return data || [];
  }

  async cleanupExpiredLeases(): Promise<number> {
    const { data, error } = await supabase
      .from('dhcp_leases')
      .update({ state: 'expired' })
      .lt('lease_end', new Date().toISOString())
      .eq('state', 'active')
      .select('id');

    if (error) throw error;
    return data?.length || 0;
  }

  // Network Integration
  async syncWithNetworkDevices(): Promise<void> {
    try {
      // Sync DHCP leases with network_devices table
      const { data: leases } = await supabase
        .from('dhcp_leases')
        .select('*')
        .eq('state', 'active');

      if (leases) {
        for (const lease of leases) {
          await supabase
            .from('network_devices')
            .upsert({
              mac_address: lease.mac_address,
              ip_address: lease.ip_address,
              device_name: lease.hostname || 'DHCP Device',
              last_seen: new Date().toISOString(),
              is_active: true,
              dhcp_lease_expires: lease.lease_end
            });
        }
      }
    } catch (error) {
      console.error('Error syncing with network devices:', error);
    }
  }
}

export const dhcpService = new DHCPService();