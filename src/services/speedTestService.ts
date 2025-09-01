import { supabase } from './supabase';
import { 
  SpeedTestProfile, 
  SpeedTestServer, 
  SpeedTestResult, 
  SpeedTestSchedule,
  DNSPingMonitor,
  DNSPingResult,
  NetworkInterface,
  SpeedTestAlert,
  SpeedTestStats,
  SpeedTestConfig,
  SpeedTestProgress,
  BufferbloatAnalysis
} from '../types/speedTest';

class SpeedTestService {
  // Speed Test Profiles Management
  async getProfiles(): Promise<SpeedTestProfile[]> {
    const { data, error } = await supabase
      .from('speed_test_profiles')
      .select('*')
      .order('profile_name');
    
    if (error) throw error;
    return data || [];
  }

  async createProfile(profile: Partial<SpeedTestProfile>): Promise<SpeedTestProfile> {
    const { data, error } = await supabase
      .from('speed_test_profiles')
      .insert([profile])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async updateProfile(id: string, updates: Partial<SpeedTestProfile>): Promise<SpeedTestProfile> {
    const { data, error } = await supabase
      .from('speed_test_profiles')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async deleteProfile(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('speed_test_profiles')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  }

  // Speed Test Servers Management
  async getServers(): Promise<SpeedTestServer[]> {
    const { data, error } = await supabase
      .from('speed_test_servers')
      .select('*')
      .order('priority_score', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }

  async createServer(server: Partial<SpeedTestServer>): Promise<SpeedTestServer> {
    const { data, error } = await supabase
      .from('speed_test_servers')
      .insert([server])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async updateServer(id: string, updates: Partial<SpeedTestServer>): Promise<SpeedTestServer> {
    const { data, error } = await supabase
      .from('speed_test_servers')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async deleteServer(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('speed_test_servers')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  }

  // Speed Test Execution
  async runSpeedTest(config: SpeedTestConfig): Promise<{ test_id: string; progress_url: string }> {
    try {
      // In production, this would trigger the actual speed test
      const testId = `test-${Date.now()}`;
      
      // Store test initiation
      const { data, error } = await supabase
        .from('speed_test_results')
        .insert([{
          profile_id: config.profile.id,
          server_id: config.server?.id,
          test_engine: config.profile.preferred_engine,
          interface_used: config.interface || 'auto',
          ip_version: config.ip_version || 'ipv4',
          test_duration_seconds: config.profile.test_duration_seconds,
          success: false, // Will be updated when test completes
          test_started_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;

      return {
        test_id: data.id,
        progress_url: `/api/v1/speed-test/progress/${data.id}`
      };
    } catch (error) {
      throw error;
    }
  }

  async getTestResults(filters?: {
    profile_id?: string;
    server_id?: string;
    interface?: string;
    start_date?: string;
    end_date?: string;
    limit?: number;
  }): Promise<SpeedTestResult[]> {
    let query = supabase
      .from('speed_test_results')
      .select(`
        *,
        profile:speed_test_profiles(profile_name, profile_type),
        server:speed_test_servers(server_name, country_code, city)
      `);

    if (filters?.profile_id) {
      query = query.eq('profile_id', filters.profile_id);
    }

    if (filters?.server_id) {
      query = query.eq('server_id', filters.server_id);
    }

    if (filters?.interface) {
      query = query.eq('interface_used', filters.interface);
    }

    if (filters?.start_date) {
      query = query.gte('test_started_at', filters.start_date);
    }

    if (filters?.end_date) {
      query = query.lte('test_started_at', filters.end_date);
    }

    query = query
      .order('test_started_at', { ascending: false })
      .limit(filters?.limit || 50);

    const { data, error } = await query;
    
    if (error) throw error;
    return data || [];
  }

  // DNS Ping Monitoring
  async getDNSMonitors(): Promise<DNSPingMonitor[]> {
    const { data, error } = await supabase
      .from('dns_ping_monitors')
      .select('*')
      .order('monitor_name');
    
    if (error) throw error;
    return data || [];
  }

  async createDNSMonitor(monitor: Partial<DNSPingMonitor>): Promise<DNSPingMonitor> {
    const { data, error } = await supabase
      .from('dns_ping_monitors')
      .insert([monitor])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async updateDNSMonitor(id: string, updates: Partial<DNSPingMonitor>): Promise<DNSPingMonitor> {
    const { data, error } = await supabase
      .from('dns_ping_monitors')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async getDNSPingResults(monitorId: string, hours: number = 1): Promise<DNSPingResult[]> {
    const startTime = new Date();
    startTime.setHours(startTime.getHours() - hours);

    const { data, error } = await supabase
      .from('dns_ping_results')
      .select('*')
      .eq('monitor_id', monitorId)
      .gte('timestamp', startTime.toISOString())
      .order('timestamp', { ascending: false })
      .limit(1000);
    
    if (error) throw error;
    return data || [];
  }

  // Network Interfaces
  async getNetworkInterfaces(): Promise<NetworkInterface[]> {
    const { data, error } = await supabase
      .from('network_interfaces')
      .select('*')
      .order('interface_name');
    
    if (error) throw error;
    return data || [];
  }

  async createNetworkInterface(iface: Partial<NetworkInterface>): Promise<NetworkInterface> {
    const { data, error } = await supabase
      .from('network_interfaces')
      .insert([iface])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  // Speed Test Schedules
  async getSchedules(): Promise<SpeedTestSchedule[]> {
    const { data, error } = await supabase
      .from('speed_test_schedules')
      .select(`
        *,
        profile:speed_test_profiles(profile_name, profile_type)
      `)
      .order('schedule_name');
    
    if (error) throw error;
    return data || [];
  }

  async createSchedule(schedule: Partial<SpeedTestSchedule>): Promise<SpeedTestSchedule> {
    const { data, error } = await supabase
      .from('speed_test_schedules')
      .insert([schedule])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  // Speed Test Alerts
  async getAlerts(): Promise<SpeedTestAlert[]> {
    const { data, error } = await supabase
      .from('speed_test_alerts')
      .select('*')
      .order('alert_name');
    
    if (error) throw error;
    return data || [];
  }

  async createAlert(alert: Partial<SpeedTestAlert>): Promise<SpeedTestAlert> {
    const { data, error } = await supabase
      .from('speed_test_alerts')
      .insert([alert])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  // Server Selection Logic
  async selectOptimalServer(criteria?: {
    country_preference?: string[];
    max_latency_ms?: number;
    exclude_countries?: string[];
  }): Promise<SpeedTestServer | null> {
    try {
      let query = supabase
        .from('speed_test_servers')
        .select('*')
        .eq('is_whitelisted', true)
        .eq('is_blacklisted', false);

      if (criteria?.country_preference && criteria.country_preference.length > 0) {
        query = query.in('country_code', criteria.country_preference);
      }

      if (criteria?.exclude_countries && criteria.exclude_countries.length > 0) {
        query = query.not('country_code', 'in', `(${criteria.exclude_countries.join(',')})`);
      }

      if (criteria?.max_latency_ms) {
        query = query.lte('avg_latency_ms', criteria.max_latency_ms);
      }

      query = query.order('priority_score', { ascending: false }).limit(1);

      const { data, error } = await query;
      
      if (error) throw error;
      return data?.[0] || null;
    } catch (error) {
      return null;
    }
  }

  // Analytics and Statistics
  async getSpeedTestStats(timeRange: '24h' | '7d' | '30d' = '24h'): Promise<SpeedTestStats> {
    try {
      const endDate = new Date();
      const startDate = new Date();
      
      switch (timeRange) {
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

      const { data: results, error } = await supabase
        .from('speed_test_results')
        .select(`
          *,
          server:speed_test_servers(server_name, country_code)
        `)
        .gte('test_started_at', startDate.toISOString())
        .lte('test_started_at', endDate.toISOString());

      if (error) throw error;

      const tests = results || [];
      const successfulTests = tests.filter(t => t.success);

      const stats: SpeedTestStats = {
        total_tests: tests.length,
        successful_tests: successfulTests.length,
        failed_tests: tests.length - successfulTests.length,
        avg_download_mbps: successfulTests.length > 0 
          ? successfulTests.reduce((acc, t) => acc + (t.download_mbps || 0), 0) / successfulTests.length
          : 0,
        avg_upload_mbps: successfulTests.length > 0 
          ? successfulTests.reduce((acc, t) => acc + (t.upload_mbps || 0), 0) / successfulTests.length
          : 0,
        avg_ping_ms: successfulTests.length > 0 
          ? successfulTests.reduce((acc, t) => acc + (t.ping_ms || 0), 0) / successfulTests.length
          : 0,
        last_test_date: tests.length > 0 ? tests[0].test_started_at : undefined,
        popular_servers: [],
        performance_trends: []
      };

      return stats;
    } catch (error) {
      throw error;
    }
  }

  // Test Engine Integration
  async executeOoklaTest(config: SpeedTestConfig): Promise<SpeedTestResult> {
    try {
      // In production, this would execute actual Ookla speedtest-cli
      // For demo, simulate test execution
      
      await new Promise(resolve => setTimeout(resolve, config.profile.test_duration_seconds * 1000));
      
      const result: Partial<SpeedTestResult> = {
        test_engine: 'ookla',
        interface_used: config.interface || 'auto',
        ip_version: config.ip_version || 'ipv4',
        download_mbps: Math.random() * 200 + 50,
        upload_mbps: Math.random() * 100 + 20,
        ping_ms: Math.random() * 50 + 10,
        jitter_ms: Math.random() * 10 + 2,
        packet_loss_percent: Math.random() * 2,
        idle_ping_ms: Math.random() * 20 + 5,
        loaded_ping_ms: Math.random() * 30 + 15,
        bufferbloat_score: ['A', 'B', 'C', 'D', 'F'][Math.floor(Math.random() * 5)],
        mos_score: Math.random() * 2 + 3, // 3-5 range
        success: true,
        test_completed_at: new Date().toISOString()
      };

      // Store result
      const { data, error } = await supabase
        .from('speed_test_results')
        .insert([result])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw error;
    }
  }

  async executeIperf3Test(config: SpeedTestConfig, targetServer: string): Promise<SpeedTestResult> {
    try {
      // In production, this would execute iperf3 against VPS servers
      await new Promise(resolve => setTimeout(resolve, config.profile.test_duration_seconds * 1000));
      
      const result: Partial<SpeedTestResult> = {
        test_engine: 'iperf3',
        interface_used: config.interface || 'auto',
        ip_version: config.ip_version || 'ipv4',
        download_mbps: Math.random() * 150 + 30,
        upload_mbps: Math.random() * 80 + 15,
        ping_ms: Math.random() * 40 + 8,
        retransmission_rate: Math.random() * 0.5,
        success: true,
        test_completed_at: new Date().toISOString(),
        server_info: { target: targetServer, protocol: 'TCP' }
      };

      const { data, error } = await supabase
        .from('speed_test_results')
        .insert([result])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw error;
    }
  }

  // DNS Ping Monitoring
  async startDNSPingMonitor(monitorId: string): Promise<boolean> {
    try {
      // In production, this would start actual ping monitoring
      console.log(`Starting DNS ping monitor: ${monitorId}`);
      return true;
    } catch (error) {
      return false;
    }
  }

  async stopDNSPingMonitor(monitorId: string): Promise<boolean> {
    try {
      console.log(`Stopping DNS ping monitor: ${monitorId}`);
      return true;
    } catch (error) {
      return false;
    }
  }

  // Network Interface Discovery
  async discoverNetworkInterfaces(): Promise<NetworkInterface[]> {
    try {
      // In production, this would scan system interfaces
      const mockInterfaces: Partial<NetworkInterface>[] = [
        {
          interface_name: 'eth0',
          interface_type: 'ethernet',
          description: 'Ana Ethernet Bağlantısı',
          ip_address: '192.168.1.100',
          is_up: true,
          is_running: true,
          speed_mbps: 1000,
          mtu: 1500
        },
        {
          interface_name: 'wlan0',
          interface_type: 'wifi',
          description: 'Wi-Fi Bağlantısı',
          ip_address: '192.168.1.101',
          is_up: true,
          is_running: true,
          speed_mbps: 867,
          mtu: 1500
        },
        {
          interface_name: 'wg0',
          interface_type: 'vpn',
          description: 'WireGuard VPN Tüneli',
          ip_address: '10.0.0.2',
          is_up: true,
          is_running: true,
          vpn_type: 'wireguard',
          tunnel_endpoint: 'vpn.example.com:51820',
          mtu: 1420
        }
      ];

      const results = [];
      for (const ifaceData of mockInterfaces) {
        const { data, error } = await supabase
          .from('network_interfaces')
          .upsert([ifaceData])
          .select()
          .single();
        
        if (!error && data) {
          results.push(data);
        }
      }

      return results;
    } catch (error) {
      throw error;
    }
  }

  // Bufferbloat Analysis
  async analyzeBufferbloat(testResultId: string): Promise<BufferbloatAnalysis> {
    try {
      const { data: result, error } = await supabase
        .from('speed_test_results')
        .select('idle_ping_ms, loaded_ping_ms, bufferbloat_score')
        .eq('id', testResultId)
        .single();

      if (error) throw error;

      const idlePing = result.idle_ping_ms || 0;
      const loadedPing = result.loaded_ping_ms || 0;
      const bloatMs = loadedPing - idlePing;

      let score: 'A' | 'B' | 'C' | 'D' | 'F' = 'A';
      let qoeImpact: 'none' | 'low' | 'medium' | 'high' | 'severe' = 'none';
      let recommendation = '';

      if (bloatMs < 20) {
        score = 'A';
        qoeImpact = 'none';
        recommendation = 'Mükemmel - bufferbloat problemi yok';
      } else if (bloatMs < 50) {
        score = 'B';
        qoeImpact = 'low';
        recommendation = 'İyi - hafif bufferbloat, VoIP etkilenmez';
      } else if (bloatMs < 100) {
        score = 'C';
        qoeImpact = 'medium';
        recommendation = 'Orta - VoIP ve gaming etkilenebilir';
      } else if (bloatMs < 200) {
        score = 'D';
        qoeImpact = 'high';
        recommendation = 'Kötü - QoS optimizasyonu gerekli';
      } else {
        score = 'F';
        qoeImpact = 'severe';
        recommendation = 'Çok kötü - acil ağ optimizasyonu gerekli';
      }

      return {
        score,
        idle_ping_ms: idlePing,
        loaded_ping_ms: loadedPing,
        bloat_ms: bloatMs,
        recommendation,
        qoe_impact: qoeImpact
      };
    } catch (error) {
      throw error;
    }
  }

  // Server Discovery and Testing
  async discoverOoklaServers(): Promise<SpeedTestServer[]> {
    try {
      // In production, this would query Ookla's server list API
      const mockServers: Partial<SpeedTestServer>[] = [
        {
          server_name: 'Türkiye - İstanbul (Türk Telekom)',
          server_url: 'http://speedtest.istanbul.net.tr',
          country_code: 'TR',
          city: 'İstanbul',
          sponsor: 'Türk Telekom',
          priority_score: 95
        },
        {
          server_name: 'UAE - Dubai (Etisalat)',
          server_url: 'http://speedtest.etisalat.ae',
          country_code: 'AE',
          city: 'Dubai',
          sponsor: 'Etisalat',
          priority_score: 90
        },
        {
          server_name: 'Germany - Frankfurt (Deutsche Telekom)',
          server_url: 'http://speedtest-fra.telekom.de',
          country_code: 'DE',
          city: 'Frankfurt',
          sponsor: 'Deutsche Telekom',
          priority_score: 85
        }
      ];

      const results = [];
      for (const serverData of mockServers) {
        const { data, error } = await supabase
          .from('speed_test_servers')
          .upsert([serverData])
          .select()
          .single();
        
        if (!error && data) {
          results.push(data);
        }
      }

      return results;
    } catch (error) {
      throw error;
    }
  }

  async testServerLatency(serverId: string): Promise<{ latency_ms: number; success: boolean }> {
    try {
      // In production, this would ping the actual server
      const latency = Math.random() * 100 + 10;
      
      await supabase
        .from('speed_test_servers')
        .update({ 
          avg_latency_ms: latency,
          last_tested: new Date().toISOString()
        })
        .eq('id', serverId);

      return { latency_ms: latency, success: true };
    } catch (error) {
      return { latency_ms: 0, success: false };
    }
  }

  // Quality of Experience (QoE) Analysis
  async calculateQoEScore(result: SpeedTestResult): Promise<{
    overall_score: number;
    web_browsing: string;
    video_streaming: string;
    gaming: string;
    voip: string;
    recommendations: string[];
  }> {
    const download = result.download_mbps || 0;
    const upload = result.upload_mbps || 0;
    const ping = result.ping_ms || 100;
    const jitter = result.jitter_ms || 50;

    // Calculate individual scores
    const downloadScore = Math.min(100, (download / 100) * 100);
    const uploadScore = Math.min(100, (upload / 50) * 100);
    const latencyScore = Math.max(0, 100 - ping);
    const jitterScore = Math.max(0, 100 - (jitter * 5));

    const overallScore = (downloadScore + uploadScore + latencyScore + jitterScore) / 4;

    // Determine use case ratings
    const getQualityRating = (score: number): string => {
      if (score >= 90) return 'excellent';
      if (score >= 75) return 'good';
      if (score >= 60) return 'fair';
      return 'poor';
    };

    const recommendations: string[] = [];
    
    if (download < 25) recommendations.push('Video streaming için daha yüksek download hızı önerilir');
    if (upload < 10) recommendations.push('Video conferencing için upload hızını artırın');
    if (ping > 50) recommendations.push('Gaming ve VoIP için ping değerini düşürün');
    if (jitter > 20) recommendations.push('VoIP kalitesi için jitter değerini optimize edin');

    return {
      overall_score: Math.round(overallScore),
      web_browsing: getQualityRating(downloadScore),
      video_streaming: getQualityRating((downloadScore + latencyScore) / 2),
      gaming: getQualityRating((latencyScore + jitterScore) / 2),
      voip: getQualityRating((uploadScore + latencyScore + jitterScore) / 3),
      recommendations
    };
  }

  // Real-time monitoring
  async getTestProgress(testId: string): Promise<SpeedTestProgress | null> {
    try {
      // In production, this would return real-time test progress
      return {
        test_id: testId,
        status: 'running',
        progress_percent: Math.floor(Math.random() * 100),
        current_phase: 'download',
        elapsed_seconds: Math.floor(Math.random() * 30),
        current_download_mbps: Math.random() * 100 + 50,
        current_ping_ms: Math.random() * 30 + 10
      };
    } catch (error) {
      return null;
    }
  }

  // Wi-Fi Integration Methods
  async getAccessPoints(): Promise<WiFiAccessPoint[]> {
    const { data, error } = await supabase
      .from('wifi_access_points')
      .select('*')
      .order('ap_name');
    
    if (error) throw error;
    return data || [];
  }

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
}

export const speedTestService = new SpeedTestService();