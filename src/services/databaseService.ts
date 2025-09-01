import { supabase } from './supabase';
import { 
  NetworkDevice, 
  TrafficRule, 
  ClientGroup, 
  TunnelPool,
  DatabaseResponse,
  FilterOptions,
  PaginationOptions 
} from '../types/database';
import { logger } from '../utils/logger';

export class DatabaseService {
  // Network Devices
  async getNetworkDevices(filters?: FilterOptions, pagination?: PaginationOptions): Promise<DatabaseResponse<NetworkDevice[]>> {
    try {
      let query = supabase
        .from('network_devices')
        .select('*', { count: 'exact' });

      // Apply filters
      if (filters?.active !== undefined) {
        query = query.eq('is_active', filters.active);
      }

      if (filters?.type) {
        query = query.eq('device_type', filters.type);
      }

      if (filters?.search) {
        query = query.or(`device_name.ilike.%${filters.search}%,device_brand.ilike.%${filters.search}%,ip_address.ilike.%${filters.search}%`);
      }

      // Apply pagination
      if (pagination?.offset) {
        query = query.range(pagination.offset, pagination.offset + (pagination.limit || 50) - 1);
      }

      // Order by last seen
      query = query.order('last_seen', { ascending: false });

      const { data, error, count } = await query;

      if (error) {
        logger.error('Database error fetching devices:', error);
        return { data: null, error, count: 0 };
      }

      return { data: data || [], error: null, count: count || 0 };
    } catch (error) {
      logger.error('Service error fetching devices:', error);
      return { data: null, error, count: 0 };
    }
  }

  async getNetworkDevice(macAddress: string): Promise<DatabaseResponse<NetworkDevice>> {
    try {
      const { data, error } = await supabase
        .from('network_devices')
        .select('*')
        .eq('mac_address', macAddress)
        .single();

      if (error) {
        logger.error('Database error fetching device:', error);
        return { data: null, error };
      }

      return { data, error: null };
    } catch (error) {
      logger.error('Service error fetching device:', error);
      return { data: null, error };
    }
  }

  async createNetworkDevice(device: Partial<NetworkDevice>): Promise<DatabaseResponse<NetworkDevice>> {
    try {
      const { data, error } = await supabase
        .from('network_devices')
        .insert([{
          ...device,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) {
        logger.error('Database error creating device:', error);
        return { data: null, error };
      }

      return { data, error: null };
    } catch (error) {
      logger.error('Service error creating device:', error);
      return { data: null, error };
    }
  }

  async updateNetworkDevice(macAddress: string, updates: Partial<NetworkDevice>): Promise<DatabaseResponse<NetworkDevice>> {
    try {
      const { data, error } = await supabase
        .from('network_devices')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('mac_address', macAddress)
        .select()
        .single();

      if (error) {
        logger.error('Database error updating device:', error);
        return { data: null, error };
      }

      return { data, error: null };
    } catch (error) {
      logger.error('Service error updating device:', error);
      return { data: null, error };
    }
  }

  async deleteNetworkDevice(macAddress: string): Promise<DatabaseResponse<boolean>> {
    try {
      const { error } = await supabase
        .from('network_devices')
        .delete()
        .eq('mac_address', macAddress);

      if (error) {
        logger.error('Database error deleting device:', error);
        return { data: false, error };
      }

      return { data: true, error: null };
    } catch (error) {
      logger.error('Service error deleting device:', error);
      return { data: false, error };
    }
  }

  // Traffic Rules
  async getTrafficRules(filters?: FilterOptions): Promise<DatabaseResponse<TrafficRule[]>> {
    try {
      let query = supabase
        .from('traffic_rules')
        .select(`
          *,
          client_group:client_groups(name),
          tunnel_pool:tunnel_pools(name)
        `);

      if (filters?.search) {
        query = query.ilike('name', `%${filters.search}%`);
      }

      query = query.order('priority', { ascending: false });

      const { data, error } = await query;

      if (error) {
        logger.error('Database error fetching traffic rules:', error);
        return { data: null, error };
      }

      return { data: data || [], error: null };
    } catch (error) {
      logger.error('Service error fetching traffic rules:', error);
      return { data: null, error };
    }
  }

  async createTrafficRule(rule: Partial<TrafficRule>): Promise<DatabaseResponse<TrafficRule>> {
    try {
      const { data, error } = await supabase
        .from('traffic_rules')
        .insert([{
          ...rule,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) {
        logger.error('Database error creating traffic rule:', error);
        return { data: null, error };
      }

      return { data, error: null };
    } catch (error) {
      logger.error('Service error creating traffic rule:', error);
      return { data: null, error };
    }
  }

  // Client Groups
  async getClientGroups(): Promise<DatabaseResponse<ClientGroup[]>> {
    try {
      const { data, error } = await supabase
        .from('client_groups')
        .select('*')
        .order('name');

      if (error) {
        logger.error('Database error fetching client groups:', error);
        return { data: null, error };
      }

      return { data: data || [], error: null };
    } catch (error) {
      logger.error('Service error fetching client groups:', error);
      return { data: null, error };
    }
  }

  async createClientGroup(group: Partial<ClientGroup>): Promise<DatabaseResponse<ClientGroup>> {
    try {
      const { data, error } = await supabase
        .from('client_groups')
        .insert([{
          ...group,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) {
        logger.error('Database error creating client group:', error);
        return { data: null, error };
      }

      return { data, error: null };
    } catch (error) {
      logger.error('Service error creating client group:', error);
      return { data: null, error };
    }
  }

  // Tunnel Pools
  async getTunnelPools(): Promise<DatabaseResponse<TunnelPool[]>> {
    try {
      const { data, error } = await supabase
        .from('tunnel_pools')
        .select('*')
        .order('name');

      if (error) {
        logger.error('Database error fetching tunnel pools:', error);
        return { data: null, error };
      }

      return { data: data || [], error: null };
    } catch (error) {
      logger.error('Service error fetching tunnel pools:', error);
      return { data: null, error };
    }
  }

  async createTunnelPool(pool: Partial<TunnelPool>): Promise<DatabaseResponse<TunnelPool>> {
    try {
      const { data, error } = await supabase
        .from('tunnel_pools')
        .insert([{
          ...pool,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) {
        logger.error('Database error creating tunnel pool:', error);
        return { data: null, error };
      }

      return { data, error: null };
    } catch (error) {
      logger.error('Service error creating tunnel pool:', error);
      return { data: null, error };
    }
  }

  // Analytics and Reporting
  async getRoutingHistory(filters?: {
    startDate?: string;
    endDate?: string;
    sourceIp?: string;
    limit?: number;
  }): Promise<DatabaseResponse<any[]>> {
    try {
      let query = supabase
        .from('routing_history')
        .select(`
          *,
          traffic_rule:traffic_rules(name)
        `);

      if (filters?.startDate) {
        query = query.gte('timestamp', filters.startDate);
      }

      if (filters?.endDate) {
        query = query.lte('timestamp', filters.endDate);
      }

      if (filters?.sourceIp) {
        query = query.eq('source_ip', filters.sourceIp);
      }

      query = query
        .order('timestamp', { ascending: false })
        .limit(filters?.limit || 100);

      const { data, error } = await query;

      if (error) {
        logger.error('Database error fetching routing history:', error);
        return { data: null, error };
      }

      return { data: data || [], error: null };
    } catch (error) {
      logger.error('Service error fetching routing history:', error);
      return { data: null, error };
    }
  }

  async getTunnelPerformance(tunnelId?: string): Promise<DatabaseResponse<any[]>> {
    try {
      let query = supabase
        .from('tunnel_performance')
        .select('*');

      if (tunnelId) {
        query = query.eq('tunnel_id', tunnelId);
      }

      query = query
        .order('timestamp', { ascending: false })
        .limit(100);

      const { data, error } = await query;

      if (error) {
        logger.error('Database error fetching tunnel performance:', error);
        return { data: null, error };
      }

      return { data: data || [], error: null };
    } catch (error) {
      logger.error('Service error fetching tunnel performance:', error);
      return { data: null, error };
    }
  }

  // Real-time subscriptions
  subscribeToDeviceChanges(callback: (payload: any) => void) {
    const subscription = supabase
      .channel('device_changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'network_devices' 
        }, 
        callback
      )
      .subscribe();

    return subscription;
  }

  subscribeToTrafficRules(callback: (payload: any) => void) {
    const subscription = supabase
      .channel('traffic_rule_changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'traffic_rules' 
        }, 
        callback
      )
      .subscribe();

    return subscription;
  }

  // Database health check
  async checkDatabaseHealth(): Promise<{ healthy: boolean; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('network_devices')
        .select('count(*)')
        .limit(1);

      if (error) {
        return { healthy: false, error: error.message };
      }

      return { healthy: true };
    } catch (error) {
      return { 
        healthy: false, 
        error: error instanceof Error ? error.message : 'Database connection failed' 
      };
    }
  }
}

export const databaseService = new DatabaseService();