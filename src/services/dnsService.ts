import { supabase } from './supabase';
import { 
  DNSServer, 
  DNSProfile, 
  DNSZoneConfig, 
  DNSDeviceAssignment, 
  DNSQueryLog, 
  DNSBlocklist, 
  DNSCacheSettings,
  DNSStats
} from '../types/dns';

class DNSService {
  // DNS Servers Management
  async getDNSServers(): Promise<DNSServer[]> {
    const { data, error } = await supabase
      .from('dns_servers')
      .select('*')
      .order('priority');
    
    if (error) throw error;
    return data || [];
  }

  async createDNSServer(server: Partial<DNSServer>): Promise<DNSServer> {
    const { data, error } = await supabase
      .from('dns_servers')
      .insert([server])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async updateDNSServer(id: string, updates: Partial<DNSServer>): Promise<DNSServer> {
    const { data, error } = await supabase
      .from('dns_servers')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async deleteDNSServer(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('dns_servers')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  }

  async testDNSServer(ipAddress: string): Promise<{ success: boolean; response_time: number; error?: string }> {
    try {
      // In production, this would test actual DNS resolution
      const start = Date.now();
      await new Promise(resolve => setTimeout(resolve, Math.random() * 100 + 50));
      const response_time = Date.now() - start;
      
      return { success: true, response_time };
    } catch (error) {
      return { 
        success: false, 
        response_time: 0,
        error: error instanceof Error ? error.message : 'DNS test failed' 
      };
    }
  }

  // DNS Profiles Management
  async getDNSProfiles(): Promise<DNSProfile[]> {
    const { data, error } = await supabase
      .from('dns_profiles')
      .select('*')
      .order('name');
    
    if (error) throw error;
    return data || [];
  }

  async createDNSProfile(profile: Partial<DNSProfile>): Promise<DNSProfile> {
    const { data, error } = await supabase
      .from('dns_profiles')
      .insert([profile])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async updateDNSProfile(id: string, updates: Partial<DNSProfile>): Promise<DNSProfile> {
    const { data, error } = await supabase
      .from('dns_profiles')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  // Zone Management
  async getDNSZones(): Promise<DNSZoneConfig[]> {
    const { data, error } = await supabase
      .from('dns_zone_configs')
      .select('*')
      .order('zone_name');
    
    if (error) throw error;
    return data || [];
  }

  async createDNSZone(zone: Partial<DNSZoneConfig>): Promise<DNSZoneConfig> {
    const { data, error } = await supabase
      .from('dns_zone_configs')
      .insert([zone])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  // Device Assignments
  async getDeviceAssignments(): Promise<DNSDeviceAssignment[]> {
    const { data, error } = await supabase
      .from('dns_device_assignments')
      .select(`
        *,
        device:network_devices(device_name, ip_address),
        profile:dns_profiles(name, profile_type)
      `)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }

  async assignDNSToDevice(assignment: Partial<DNSDeviceAssignment>): Promise<DNSDeviceAssignment> {
    const { data, error } = await supabase
      .from('dns_device_assignments')
      .upsert([assignment])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  // Query Logs
  async getDNSQueryLogs(filters?: {
    device_mac?: string;
    domain?: string;
    blocked_only?: boolean;
    start_date?: string;
    end_date?: string;
    limit?: number;
  }): Promise<DNSQueryLog[]> {
    let query = supabase
      .from('dns_query_logs')
      .select(`
        *,
        device:network_devices(device_name)
      `);

    if (filters?.device_mac) {
      query = query.eq('device_mac', filters.device_mac);
    }

    if (filters?.domain) {
      query = query.ilike('query_domain', `%${filters.domain}%`);
    }

    if (filters?.blocked_only) {
      query = query.eq('blocked', true);
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

  // Blocklist Management
  async getBlocklists(): Promise<DNSBlocklist[]> {
    const { data, error } = await supabase
      .from('dns_blocklists')
      .select('*')
      .order('category', { ascending: true })
      .order('name', { ascending: true });
    
    if (error) throw error;
    return data || [];
  }

  async createBlocklist(blocklist: Partial<DNSBlocklist>): Promise<DNSBlocklist> {
    const { data, error } = await supabase
      .from('dns_blocklists')
      .insert([{
        ...blocklist,
        entry_count: blocklist.domains?.length || 0
      }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async updateBlocklist(id: string, updates: Partial<DNSBlocklist>): Promise<DNSBlocklist> {
    const updatesWithCount = {
      ...updates,
      entry_count: updates.domains?.length || 0
    };

    const { data, error } = await supabase
      .from('dns_blocklists')
      .update(updatesWithCount)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  // Cache Settings
  async getCacheSettings(): Promise<DNSCacheSettings[]> {
    const { data, error } = await supabase
      .from('dns_cache_settings')
      .select('*');
    
    if (error) throw error;
    return data || [];
  }

  async updateCacheSettings(id: string, settings: Partial<DNSCacheSettings>): Promise<DNSCacheSettings> {
    const { data, error } = await supabase
      .from('dns_cache_settings')
      .update(settings)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  // Analytics and Statistics
  async getDNSStats(timeRange: '1h' | '24h' | '7d' | '30d' = '24h'): Promise<DNSStats> {
    const endDate = new Date().toISOString();
    const startDate = new Date();
    
    switch (timeRange) {
      case '1h':
        startDate.setHours(startDate.getHours() - 1);
        break;
      case '24h':
        startDate.setDate(startDate.getDate() - 1);
        break;
      case '7d':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(startDate.getDate() - 30);
        break;
    }

    try {
      // Get query statistics
      const { data: queryStats, error: queryError } = await supabase
        .from('dns_query_logs')
        .select('*')
        .gte('timestamp', startDate.toISOString())
        .lte('timestamp', endDate);

      if (queryError) throw queryError;

      const logs = queryStats || [];
      
      // Calculate statistics
      const total_queries = logs.length;
      const blocked_queries = logs.filter(q => q.blocked).length;
      const avg_response = logs.reduce((acc, q) => acc + (q.response_time_ms || 0), 0) / total_queries || 0;

      // Top domains
      const domainCounts: Record<string, number> = {};
      const blockedDomainCounts: Record<string, number> = {};

      logs.forEach(log => {
        domainCounts[log.query_domain] = (domainCounts[log.query_domain] || 0) + 1;
        if (log.blocked) {
          blockedDomainCounts[log.query_domain] = (blockedDomainCounts[log.query_domain] || 0) + 1;
        }
      });

      const top_domains = Object.entries(domainCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .map(([domain, count]) => ({ domain, count }));

      const top_blocked_domains = Object.entries(blockedDomainCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .map(([domain, count]) => ({ domain, count }));

      // Query types
      const typesCounts: Record<string, number> = {};
      logs.forEach(log => {
        typesCounts[log.query_type] = (typesCounts[log.query_type] || 0) + 1;
      });

      // Device queries
      const deviceCounts: Record<string, number> = {};
      logs.forEach(log => {
        deviceCounts[log.device_mac] = (deviceCounts[log.device_mac] || 0) + 1;
      });

      return {
        total_queries,
        blocked_queries,
        cache_hit_ratio: Math.random() * 0.3 + 0.7, // Mock cache hit ratio
        average_response_time: avg_response,
        top_domains,
        top_blocked_domains,
        queries_by_type: typesCounts,
        queries_by_device: deviceCounts
      };
    } catch (error) {
      throw error;
    }
  }

  // System Integration
  async applyDNSConfiguration(): Promise<{ success: boolean; errors: string[] }> {
    try {
      // In production, this would:
      // 1. Generate Unbound/BIND configuration
      // 2. Update dnsmasq settings
      // 3. Restart DNS services
      // 4. Update iptables for DNS redirection
      
      return { success: true, errors: [] };
    } catch (error) {
      return { 
        success: false, 
        errors: [error instanceof Error ? error.message : 'Configuration failed'] 
      };
    }
  }

  async flushDNSCache(): Promise<boolean> {
    try {
      // In production, this would flush system DNS cache
      return true;
    } catch (error) {
      return false;
    }
  }

  async validateDNSConfiguration(): Promise<{ valid: boolean; issues: string[] }> {
    try {
      const issues: string[] = [];
      
      // Check for DNS servers
      const servers = await this.getDNSServers();
      const activeServers = servers.filter(s => s.is_active);
      
      if (activeServers.length === 0) {
        issues.push('En az bir aktif DNS sunucusu gerekli');
      }

      // Check for default profile
      const profiles = await this.getDNSProfiles();
      const defaultProfiles = profiles.filter(p => p.is_default);
      
      if (defaultProfiles.length === 0) {
        issues.push('Varsayılan DNS profili bulunamadı');
      }

      if (defaultProfiles.length > 1) {
        issues.push('Birden fazla varsayılan DNS profili tanımlı');
      }

      return { valid: issues.length === 0, issues };
    } catch (error) {
      return { 
        valid: false, 
        issues: [error instanceof Error ? error.message : 'Validation failed'] 
      };
    }
  }
}

export const dnsService = new DNSService();