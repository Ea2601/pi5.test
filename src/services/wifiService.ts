import { supabase } from './supabase';
import { 
  WiFiAccessPoint, 
  WiFiNetwork, 
  WiFiClient, 
  WiFiSecurityPolicy, 
  WiFiPerformanceLog,
  WiFiMeshNode,
  WiFiSchedule,
  WiFiChannelAnalysis,
  WiFiStats
} from '../types/wifi';

class WiFiService {
  // Access Point Management
  async getAccessPoints(): Promise<WiFiAccessPoint[]> {
    const { data, error } = await supabase
      .from('wifi_access_points')
      .select('*')
      .order('ap_name');
    
    if (error) throw error;
    return data || [];
  }

  async createAccessPoint(ap: Partial<WiFiAccessPoint>): Promise<WiFiAccessPoint> {
    const { data, error } = await supabase
      .from('wifi_access_points')
      .insert([ap])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async updateAccessPoint(id: string, updates: Partial<WiFiAccessPoint>): Promise<WiFiAccessPoint> {
    const { data, error } = await supabase
      .from('wifi_access_points')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async deleteAccessPoint(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('wifi_access_points')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  }

  // Wi-Fi Network (SSID) Management
  async getWiFiNetworks(apId?: string): Promise<WiFiNetwork[]> {
    let query = supabase
      .from('wifi_networks')
      .select(`
        *,
        access_point:wifi_access_points(ap_name, location)
      `);

    if (apId) {
      query = query.eq('ap_id', apId);
    }

    query = query.order('vlan_id');

    const { data, error } = await query;
    
    if (error) throw error;
    return data || [];
  }

  async createWiFiNetwork(network: Partial<WiFiNetwork>): Promise<WiFiNetwork> {
    const { data, error } = await supabase
      .from('wifi_networks')
      .insert([network])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async updateWiFiNetwork(id: string, updates: Partial<WiFiNetwork>): Promise<WiFiNetwork> {
    const { data, error } = await supabase
      .from('wifi_networks')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async deleteWiFiNetwork(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('wifi_networks')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  }

  async toggleWiFiNetwork(id: string): Promise<WiFiNetwork> {
    const network = await this.getWiFiNetwork(id);
    if (!network) throw new Error('Network not found');

    const { data, error } = await supabase
      .from('wifi_networks')
      .update({ is_enabled: !network.is_enabled })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  private async getWiFiNetwork(id: string): Promise<WiFiNetwork | null> {
    const { data, error } = await supabase
      .from('wifi_networks')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) return null;
    return data;
  }

  // Wi-Fi Client Management
  async getWiFiClients(filters?: {
    network_id?: string;
    ap_id?: string;
    status?: string;
    limit?: number;
  }): Promise<WiFiClient[]> {
    let query = supabase
      .from('wifi_clients')
      .select(`
        *,
        network:wifi_networks(ssid, vlan_id),
        access_point:wifi_access_points(ap_name, location)
      `);

    if (filters?.network_id) {
      query = query.eq('network_id', filters.network_id);
    }

    if (filters?.ap_id) {
      query = query.eq('ap_id', filters.ap_id);
    }

    if (filters?.status) {
      query = query.eq('connection_status', filters.status);
    }

    query = query
      .order('connected_at', { ascending: false })
      .limit(filters?.limit || 100);

    const { data, error } = await query;
    
    if (error) throw error;
    return data || [];
  }

  async disconnectClient(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('wifi_clients')
      .update({ 
        connection_status: 'disconnected',
        disconnection_reason: 'Manually disconnected'
      })
      .eq('id', id);
    
    if (error) throw error;
    return true;
  }

  async blockClient(macAddress: string): Promise<boolean> {
    const { error } = await supabase
      .from('wifi_clients')
      .update({ 
        connection_status: 'blocked',
        is_authorized: false
      })
      .eq('mac_address', macAddress);
    
    if (error) throw error;
    return true;
  }

  async unblockClient(macAddress: string): Promise<boolean> {
    const { error } = await supabase
      .from('wifi_clients')
      .update({ 
        connection_status: 'disconnected',
        is_authorized: true
      })
      .eq('mac_address', macAddress);
    
    if (error) throw error;
    return true;
  }

  // Security Policy Management
  async getSecurityPolicies(): Promise<WiFiSecurityPolicy[]> {
    const { data, error } = await supabase
      .from('wifi_security_policies')
      .select('*')
      .order('priority', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }

  async createSecurityPolicy(policy: Partial<WiFiSecurityPolicy>): Promise<WiFiSecurityPolicy> {
    const { data, error } = await supabase
      .from('wifi_security_policies')
      .insert([policy])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async updateSecurityPolicy(id: string, updates: Partial<WiFiSecurityPolicy>): Promise<WiFiSecurityPolicy> {
    const { data, error } = await supabase
      .from('wifi_security_policies')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  // Performance Monitoring
  async getPerformanceLogs(filters?: {
    ap_id?: string;
    hours?: number;
  }): Promise<WiFiPerformanceLog[]> {
    let query = supabase
      .from('wifi_performance_logs')
      .select(`
        *,
        access_point:wifi_access_points(ap_name, location),
        network:wifi_networks(ssid, vlan_id)
      `);

    if (filters?.ap_id) {
      query = query.eq('ap_id', filters.ap_id);
    }

    if (filters?.hours) {
      const since = new Date();
      since.setHours(since.getHours() - filters.hours);
      query = query.gte('timestamp', since.toISOString());
    }

    query = query.order('timestamp', { ascending: false });

    const { data, error } = await query;
    
    if (error) throw error;
    return data || [];
  }

  // Channel Analysis and Optimization
  async analyzeChannels(apId: string): Promise<WiFiChannelAnalysis[]> {
    try {
      // In production, this would:
      // 1. Scan for neighboring APs
      // 2. Analyze channel utilization
      // 3. Recommend optimal channels
      // 4. Check for interference

      // Simulate channel analysis
      const analysis: Partial<WiFiChannelAnalysis>[] = [
        {
          frequency_band: '2.4ghz',
          channel: 1,
          channel_width: 20,
          noise_floor_dbm: -95,
          interference_level: 3,
          channel_utilization_percent: 25,
          recommended_channel: 6,
          recommendation_reason: 'Less crowded channel',
          optimization_score: 85
        },
        {
          frequency_band: '5ghz',
          channel: 36,
          channel_width: 80,
          noise_floor_dbm: -102,
          interference_level: 1,
          channel_utilization_percent: 15,
          recommended_channel: 149,
          recommendation_reason: 'DFS-free channel',
          optimization_score: 95
        }
      ];

      const results = [];
      for (const data of analysis) {
        const { data: result, error } = await supabase
          .from('wifi_channel_analysis')
          .insert([{ ...data, ap_id: apId }])
          .select()
          .single();
        
        if (!error && result) {
          results.push(result);
        }
      }

      return results;
    } catch (error) {
      throw error;
    }
  }

  async getChannelAnalysis(apId: string): Promise<WiFiChannelAnalysis[]> {
    const { data, error } = await supabase
      .from('wifi_channel_analysis')
      .select('*')
      .eq('ap_id', apId)
      .order('timestamp', { ascending: false })
      .limit(10);
    
    if (error) throw error;
    return data || [];
  }

  // Mesh Network Management
  async getMeshNodes(): Promise<WiFiMeshNode[]> {
    const { data, error } = await supabase
      .from('wifi_mesh_nodes')
      .select(`
        *,
        parent_ap:wifi_access_points!parent_ap_id(ap_name, location),
        child_ap:wifi_access_points!child_ap_id(ap_name, location)
      `)
      .order('hop_count');
    
    if (error) throw error;
    return data || [];
  }

  async createMeshConnection(parentApId: string, childApId: string, config?: Partial<WiFiMeshNode>): Promise<WiFiMeshNode> {
    const { data, error } = await supabase
      .from('wifi_mesh_nodes')
      .insert([{
        parent_ap_id: parentApId,
        child_ap_id: childApId,
        ...config
      }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  // Schedule Management
  async getWiFiSchedules(networkId?: string): Promise<WiFiSchedule[]> {
    let query = supabase
      .from('wifi_schedules')
      .select(`
        *,
        network:wifi_networks(ssid, vlan_id)
      `);

    if (networkId) {
      query = query.eq('network_id', networkId);
    }

    query = query.order('schedule_name');

    const { data, error } = await query;
    
    if (error) throw error;
    return data || [];
  }

  async createWiFiSchedule(schedule: Partial<WiFiSchedule>): Promise<WiFiSchedule> {
    const { data, error } = await supabase
      .from('wifi_schedules')
      .insert([schedule])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  // Statistics and Analytics
  async getWiFiStats(): Promise<WiFiStats> {
    try {
      const [apsResult, networksResult, clientsResult] = await Promise.all([
        supabase.from('wifi_access_points').select('id, is_online'),
        supabase.from('wifi_networks').select('id, is_enabled, network_type, ssid, client_count'),
        supabase.from('wifi_clients').select('id, connection_status, bytes_sent, bytes_received, signal_strength_dbm')
      ]);

      const aps = apsResult.data || [];
      const networks = networksResult.data || [];
      const clients = clientsResult.data || [];

      const connectedClients = clients.filter(c => c.connection_status === 'connected');
      const totalBandwidth = connectedClients.reduce((acc, client) => 
        acc + (client.bytes_sent + client.bytes_received) / (1024 * 1024), 0
      );

      const averageSignal = connectedClients.length > 0 
        ? connectedClients.reduce((acc, client) => acc + (client.signal_strength_dbm || -70), 0) / connectedClients.length
        : -70;

      const clientDistribution = networks.map(network => ({
        network_type: network.network_type,
        ssid: network.ssid,
        client_count: network.client_count,
        bandwidth_mbps: Math.random() * 100 // Mock bandwidth data
      }));

      return {
        total_access_points: aps.length,
        online_access_points: aps.filter(ap => ap.is_online).length,
        total_networks: networks.length,
        active_networks: networks.filter(n => n.is_enabled).length,
        total_clients: clients.length,
        connected_clients: connectedClients.length,
        total_bandwidth_mbps: totalBandwidth,
        average_signal_strength: averageSignal,
        channel_utilization: [
          { band: '2.4 GHz', channel: 6, utilization_percent: 35, ap_count: 2 },
          { band: '5 GHz', channel: 149, utilization_percent: 15, ap_count: 3 }
        ],
        client_distribution: clientDistribution
      };
    } catch (error) {
      throw error;
    }
  }

  // Channel Optimization
  async optimizeChannels(apId: string): Promise<{ success: boolean; recommendations: Array<{ band: string; channel: number; reason: string }> }> {
    try {
      const analysis = await this.analyzeChannels(apId);
      
      const recommendations = analysis.map(a => ({
        band: a.frequency_band,
        channel: a.recommended_channel || a.channel,
        reason: a.recommendation_reason || 'Optimal channel for current conditions'
      }));

      return { success: true, recommendations };
    } catch (error) {
      return { success: false, recommendations: [] };
    }
  }

  // Security Operations
  async scanForRogueAPs(): Promise<Array<{ ssid: string; mac: string; security: string; signal: number; channel: number }>> {
    try {
      // In production, this would scan for unauthorized access points
      // For now, return mock data
      return [
        { ssid: 'FreeWiFi', mac: '00:AA:BB:CC:DD:EE', security: 'Open', signal: -65, channel: 6 },
        { ssid: 'AndroidAP', mac: '00:BB:CC:DD:EE:FF', security: 'WPA2', signal: -78, channel: 11 }
      ];
    } catch (error) {
      throw error;
    }
  }

  async updateClientBandwidth(clientId: string, limitMbps: number): Promise<boolean> {
    try {
      // In production, this would update QoS rules for the specific client
      // For now, just log the action
      console.log(`Setting bandwidth limit for client ${clientId}: ${limitMbps} Mbps`);
      return true;
    } catch (error) {
      return false;
    }
  }

  // System Integration
  async applyWiFiConfiguration(): Promise<{ success: boolean; errors: string[] }> {
    try {
      const errors: string[] = [];
      
      // Validate configuration
      const networks = await this.getWiFiNetworks();
      const activeNetworks = networks.filter(n => n.is_enabled);
      
      if (activeNetworks.length === 0) {
        errors.push('En az bir aktif Wi-Fi ağı gerekli');
      }

      // Check for SSID conflicts
      const ssids = activeNetworks.map(n => n.ssid);
      const duplicateSSIDs = ssids.filter((ssid, index) => ssids.indexOf(ssid) !== index);
      if (duplicateSSIDs.length > 0) {
        errors.push(`Duplicate SSID detected: ${duplicateSSIDs.join(', ')}`);
      }

      // In production, this would:
      // 1. Generate hostapd configuration
      // 2. Update wpa_supplicant settings
      // 3. Configure VLAN bridges
      // 4. Restart wireless services
      // 5. Apply QoS rules

      return { success: errors.length === 0, errors };
    } catch (error) {
      return { 
        success: false, 
        errors: [error instanceof Error ? error.message : 'Configuration failed'] 
      };
    }
  }

  async restartWiFiService(apId?: string): Promise<boolean> {
    try {
      // In production, this would restart the WiFi service
      console.log(`Restarting WiFi service${apId ? ` for AP ${apId}` : ''}`);
      return true;
    } catch (error) {
      return false;
    }
  }

  // Real-time monitoring
  async getClientSignalStrengths(): Promise<Array<{ mac: string; signal: number; noise: number; snr: number }>> {
    try {
      const { data, error } = await supabase
        .from('wifi_clients')
        .select('mac_address, signal_strength_dbm, noise_level_dbm, snr_db')
        .eq('connection_status', 'connected');

      if (error) throw error;

      return (data || []).map(client => ({
        mac: client.mac_address,
        signal: client.signal_strength_dbm || -70,
        noise: client.noise_level_dbm || -95,
        snr: client.snr_db || 25
      }));
    } catch (error) {
      return [];
    }
  }

  // Wi-Fi Health Check
  async performWiFiHealthCheck(): Promise<{
    overall_health: 'healthy' | 'warning' | 'critical';
    issues: Array<{ type: string; message: string; severity: string }>;
    recommendations: string[];
  }> {
    try {
      const issues: Array<{ type: string; message: string; severity: string }> = [];
      const recommendations: string[] = [];

      const [aps, networks, clients] = await Promise.all([
        this.getAccessPoints(),
        this.getWiFiNetworks(),
        this.getWiFiClients({ status: 'connected' })
      ]);

      // Check for offline APs
      const offlineAPs = aps.filter(ap => !ap.is_online);
      if (offlineAPs.length > 0) {
        issues.push({
          type: 'ap_offline',
          message: `${offlineAPs.length} access point çevrimdışı`,
          severity: 'critical'
        });
        recommendations.push('Çevrimdışı access point\'lerin bağlantısını kontrol edin');
      }

      // Check for weak signals
      const weakSignalClients = clients.filter(c => (c.signal_strength_dbm || -30) < -80);
      if (weakSignalClients.length > 0) {
        issues.push({
          type: 'weak_signal',
          message: `${weakSignalClients.length} cihazda zayıf sinyal`,
          severity: 'warning'
        });
        recommendations.push('Access point konumlarını optimize edin');
      }

      // Check for channel congestion
      const channelAnalysis = await this.getChannelAnalysis(aps[0]?.id);
      const congestedChannels = channelAnalysis.filter(c => (c.channel_utilization_percent || 0) > 70);
      if (congestedChannels.length > 0) {
        issues.push({
          type: 'channel_congestion',
          message: 'Kanal yoğunluğu yüksek',
          severity: 'warning'
        });
        recommendations.push('Kanal optimizasyonu yapın');
      }

      const overall_health = issues.some(i => i.severity === 'critical') ? 'critical' :
                           issues.some(i => i.severity === 'warning') ? 'warning' : 'healthy';

      return { overall_health, issues, recommendations };
    } catch (error) {
      return {
        overall_health: 'critical',
        issues: [{ type: 'system_error', message: 'Wi-Fi sistem durumu kontrol edilemiyor', severity: 'critical' }],
        recommendations: ['Sistem bağlantısını kontrol edin']
      };
    }
  }

  // Guest Network Management
  async createGuestNetwork(apId: string, config: {
    ssid: string;
    password: string;
    duration_hours?: number;
    bandwidth_limit_mbps?: number;
  }): Promise<WiFiNetwork> {
    const guestNetwork: Partial<WiFiNetwork> = {
      ap_id: apId,
      ssid: config.ssid,
      vlan_id: 40, // Guest VLAN
      network_type: 'guest',
      encryption_type: 'wpa2',
      passphrase: config.password,
      frequency_band: '2.4ghz',
      client_isolation: true,
      local_access: false,
      internet_access: true,
      captive_portal_enabled: true,
      bandwidth_limit_mbps: config.bandwidth_limit_mbps || 30,
      max_clients: 20
    };

    const network = await this.createWiFiNetwork(guestNetwork);

    // Create schedule if duration is specified
    if (config.duration_hours) {
      const endTime = new Date();
      endTime.setHours(endTime.getHours() + config.duration_hours);

      await this.createWiFiSchedule({
        network_id: network.id,
        schedule_name: `Guest Network Auto-disable`,
        schedule_type: 'custom',
        enabled_days: [new Date().getDay()],
        start_time: new Date().toTimeString().slice(0, 8),
        end_time: endTime.toTimeString().slice(0, 8),
        action_type: 'enable_disable',
        action_config: { action: 'disable' }
      });
    }

    return network;
  }

  // Bandwidth Management
  async setClientBandwidthLimit(clientId: string, limitMbps: number): Promise<boolean> {
    try {
      // In production, this would update QoS rules for the client
      console.log(`Setting bandwidth limit for client ${clientId}: ${limitMbps} Mbps`);
      return true;
    } catch (error) {
      return false;
    }
  }

  async setNetworkBandwidthLimit(networkId: string, limitMbps: number): Promise<WiFiNetwork> {
    const { data, error } = await supabase
      .from('wifi_networks')
      .update({ bandwidth_limit_mbps: limitMbps })
      .eq('id', networkId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
}

export const wifiService = new WiFiService();