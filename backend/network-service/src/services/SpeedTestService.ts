import { SharedDatabaseService } from '../../shared/database';
import { createServiceLogger } from '../../shared/utils/logger';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const logger = createServiceLogger('speed-test-service');

export interface SpeedTestProfile {
  id: string;
  profile_name: string;
  description?: string;
  profile_type: 'fast' | 'balanced' | 'deep_analysis';
  preferred_engine: 'ookla' | 'iperf3' | 'flent' | 'irtt';
  parallel_threads: number;
  test_duration_seconds: number;
  warmup_seconds: number;
  default_interface: string;
  ip_version: 'ipv4' | 'ipv6' | 'dual_stack';
  sampling_method: 'minimum' | 'average' | 'p90' | 'p95' | 'p99';
  is_default: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SpeedTestResult {
  id: string;
  profile_id?: string;
  server_id?: string;
  test_engine: 'ookla' | 'iperf3' | 'flent' | 'irtt';
  interface_used: string;
  ip_version: string;
  download_mbps?: number;
  upload_mbps?: number;
  ping_ms?: number;
  jitter_ms?: number;
  packet_loss_percent?: number;
  idle_ping_ms?: number;
  loaded_ping_ms?: number;
  bufferbloat_score?: string;
  mos_score?: number;
  success: boolean;
  test_started_at: string;
  test_completed_at?: string;
  created_at: string;
}

export class SpeedTestService {
  private db: SharedDatabaseService;

  constructor() {
    this.db = SharedDatabaseService.getInstance({
      connectionString: process.env.DATABASE_URL!
    });
  }

  async getProfiles(): Promise<SpeedTestProfile[]> {
    try {
      const result = await this.db.query(`
        SELECT * FROM speed_test_profiles 
        WHERE is_active = true
        ORDER BY profile_name
      `);
      
      return result.rows;
    } catch (error) {
      logger.error('Error fetching speed test profiles:', error);
      throw new Error('Failed to fetch speed test profiles');
    }
  }

  async createProfile(profileData: Partial<SpeedTestProfile>): Promise<SpeedTestProfile> {
    try {
      const result = await this.db.query(`
        INSERT INTO speed_test_profiles (
          profile_name, description, profile_type, preferred_engine,
          parallel_threads, test_duration_seconds, warmup_seconds,
          default_interface, ip_version, sampling_method,
          min_download_mbps, min_upload_mbps, max_latency_ms,
          is_default, is_active
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
        RETURNING *
      `, [
        profileData.profile_name,
        profileData.description,
        profileData.profile_type || 'balanced',
        profileData.preferred_engine || 'ookla',
        profileData.parallel_threads || 4,
        profileData.test_duration_seconds || 30,
        profileData.warmup_seconds || 5,
        profileData.default_interface || 'auto',
        profileData.ip_version || 'ipv4',
        profileData.sampling_method || 'average',
        profileData.min_download_mbps,
        profileData.min_upload_mbps,
        profileData.max_latency_ms,
        profileData.is_default || false,
        true
      ]);

      const profile = result.rows[0];
      logger.info(`Created speed test profile: ${profile.profile_name}`);
      return profile;
    } catch (error) {
      logger.error('Error creating speed test profile:', error);
      throw new Error('Failed to create speed test profile');
    }
  }

  async getServers(): Promise<any[]> {
    try {
      const result = await this.db.query(`
        SELECT * FROM speed_test_servers 
        WHERE is_whitelisted = true AND is_blacklisted = false
        ORDER BY priority_score DESC, avg_latency_ms ASC
      `);
      
      return result.rows;
    } catch (error) {
      logger.error('Error fetching speed test servers:', error);
      throw new Error('Failed to fetch speed test servers');
    }
  }

  async createServer(serverData: any): Promise<any> {
    try {
      const result = await this.db.query(`
        INSERT INTO speed_test_servers (
          server_name, server_url, server_type, country_code, city,
          sponsor, port, protocol, priority_score, is_whitelisted
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING *
      `, [
        serverData.server_name,
        serverData.server_url,
        serverData.server_type || 'ookla',
        serverData.country_code,
        serverData.city,
        serverData.sponsor,
        serverData.port || 80,
        serverData.protocol || 'https',
        serverData.priority_score || 50,
        true
      ]);

      const server = result.rows[0];
      logger.info(`Created speed test server: ${server.server_name}`);
      return server;
    } catch (error) {
      logger.error('Error creating speed test server:', error);
      throw new Error('Failed to create speed test server');
    }
  }

  async runSpeedTest(config: {
    profile_id: string;
    server_id?: string;
    interface?: string;
    ip_version?: string;
    custom_settings?: any;
  }): Promise<SpeedTestResult> {
    try {
      logger.info('Starting speed test execution', config);
      
      // Get profile details
      const profileResult = await this.db.query(
        'SELECT * FROM speed_test_profiles WHERE id = $1',
        [config.profile_id]
      );
      
      if (profileResult.rows.length === 0) {
        throw new Error('Speed test profile not found');
      }

      const profile = profileResult.rows[0];
      
      // Get server details if specified
      let server = null;
      if (config.server_id) {
        const serverResult = await this.db.query(
          'SELECT * FROM speed_test_servers WHERE id = $1',
          [config.server_id]
        );
        server = serverResult.rows[0];
      }

      // Create initial test record
      const testResult = await this.db.query(`
        INSERT INTO speed_test_results (
          profile_id, server_id, test_engine, interface_used, ip_version,
          test_duration_seconds, success, test_started_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
      `, [
        config.profile_id,
        config.server_id,
        profile.preferred_engine,
        config.interface || profile.default_interface,
        config.ip_version || profile.ip_version,
        profile.test_duration_seconds,
        false, // Will be updated when test completes
        new Date().toISOString()
      ]);

      const testRecord = testResult.rows[0];

      // Execute speed test based on engine type
      let result;
      switch (profile.preferred_engine) {
        case 'ookla':
          result = await this.executeOoklaTest(profile, server, config);
          break;
        case 'iperf3':
          result = await this.executeIperf3Test(profile, server, config);
          break;
        default:
          result = await this.executeOoklaTest(profile, server, config);
      }

      // Update test record with results
      const updatedResult = await this.db.query(`
        UPDATE speed_test_results 
        SET 
          download_mbps = $1,
          upload_mbps = $2,
          ping_ms = $3,
          jitter_ms = $4,
          packet_loss_percent = $5,
          idle_ping_ms = $6,
          loaded_ping_ms = $7,
          bufferbloat_score = $8,
          mos_score = $9,
          success = $10,
          test_completed_at = $11,
          server_info = $12
        WHERE id = $13
        RETURNING *
      `, [
        result.download_mbps,
        result.upload_mbps,
        result.ping_ms,
        result.jitter_ms,
        result.packet_loss_percent,
        result.idle_ping_ms,
        result.loaded_ping_ms,
        result.bufferbloat_score,
        result.mos_score,
        true,
        new Date().toISOString(),
        JSON.stringify(result.server_info || {}),
        testRecord.id
      ]);

      logger.info(`Speed test completed: ${testRecord.id}`);
      return updatedResult.rows[0];
    } catch (error) {
      logger.error('Error running speed test:', error);
      throw new Error('Failed to run speed test');
    }
  }

  private async executeOoklaTest(profile: SpeedTestProfile, server: any, config: any): Promise<any> {
    try {
      // In production, this would execute actual Ookla speedtest-cli
      logger.info('Executing Ookla speed test');
      
      // Simulate test execution
      await new Promise(resolve => setTimeout(resolve, profile.test_duration_seconds * 100)); // Shortened for demo
      
      // Generate realistic test results
      const download = Math.random() * 200 + 50; // 50-250 Mbps
      const upload = Math.random() * 100 + 20;   // 20-120 Mbps
      const ping = Math.random() * 50 + 10;      // 10-60 ms
      const jitter = Math.random() * 15 + 2;     // 2-17 ms
      const loss = Math.random() * 2;            // 0-2% loss

      const idlePing = ping;
      const loadedPing = ping + (Math.random() * 50 + 10); // Add bloat
      const bloatMs = loadedPing - idlePing;

      let bufferbloatScore = 'A';
      if (bloatMs > 100) bufferbloatScore = 'F';
      else if (bloatMs > 50) bufferbloatScore = 'D';
      else if (bloatMs > 20) bufferbloatScore = 'C';
      else if (bloatMs > 10) bufferbloatScore = 'B';

      return {
        download_mbps: download,
        upload_mbps: upload,
        ping_ms: ping,
        jitter_ms: jitter,
        packet_loss_percent: loss,
        idle_ping_ms: idlePing,
        loaded_ping_ms: loadedPing,
        bufferbloat_score: bufferbloatScore,
        mos_score: Math.max(1, 5 - (jitter / 10) - (loss * 0.5)), // Simple MOS calculation
        server_info: {
          server_name: server?.server_name || 'Auto-selected',
          country: server?.country_code || 'TR',
          engine: 'ookla'
        }
      };
    } catch (error) {
      logger.error('Error executing Ookla test:', error);
      throw error;
    }
  }

  private async executeIperf3Test(profile: SpeedTestProfile, server: any, config: any): Promise<any> {
    try {
      // In production, this would execute iperf3 against VPS servers
      logger.info('Executing iperf3 speed test');
      
      await new Promise(resolve => setTimeout(resolve, profile.test_duration_seconds * 100));
      
      // Generate iperf3-like results (typically lower but more consistent)
      const download = Math.random() * 150 + 30;
      const upload = Math.random() * 80 + 15;
      const ping = Math.random() * 40 + 8;

      return {
        download_mbps: download,
        upload_mbps: upload,
        ping_ms: ping,
        jitter_ms: Math.random() * 8 + 1,
        packet_loss_percent: Math.random() * 0.5,
        retransmission_rate: Math.random() * 0.3,
        server_info: {
          server_name: server?.server_name || 'VPS Server',
          country: server?.country_code || 'DE',
          protocol: 'TCP',
          engine: 'iperf3'
        }
      };
    } catch (error) {
      logger.error('Error executing iperf3 test:', error);
      throw error;
    }
  }

  async getResults(filters?: {
    profile_id?: string;
    server_id?: string;
    interface?: string;
    start_date?: string;
    end_date?: string;
    limit?: number;
  }): Promise<SpeedTestResult[]> {
    try {
      let query = `
        SELECT 
          r.*,
          p.profile_name,
          s.server_name,
          s.country_code
        FROM speed_test_results r
        LEFT JOIN speed_test_profiles p ON r.profile_id = p.id
        LEFT JOIN speed_test_servers s ON r.server_id = s.id
        WHERE 1=1
      `;
      
      const params: any[] = [];

      if (filters?.profile_id) {
        query += ' AND r.profile_id = $' + (params.length + 1);
        params.push(filters.profile_id);
      }

      if (filters?.server_id) {
        query += ' AND r.server_id = $' + (params.length + 1);
        params.push(filters.server_id);
      }

      if (filters?.interface) {
        query += ' AND r.interface_used = $' + (params.length + 1);
        params.push(filters.interface);
      }

      if (filters?.start_date) {
        query += ' AND r.test_started_at >= $' + (params.length + 1);
        params.push(filters.start_date);
      }

      if (filters?.end_date) {
        query += ' AND r.test_started_at <= $' + (params.length + 1);
        params.push(filters.end_date);
      }

      query += ' ORDER BY r.test_started_at DESC';

      if (filters?.limit) {
        query += ' LIMIT $' + (params.length + 1);
        params.push(filters.limit);
      }

      const result = await this.db.query(query, params);
      return result.rows;
    } catch (error) {
      logger.error('Error fetching speed test results:', error);
      throw new Error('Failed to fetch speed test results');
    }
  }

  async getStats(timeRange: string = '24h'): Promise<any> {
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

      const result = await this.db.query(`
        SELECT 
          COUNT(*) as total_tests,
          COUNT(*) FILTER (WHERE success = true) as successful_tests,
          AVG(download_mbps) FILTER (WHERE success = true) as avg_download_mbps,
          AVG(upload_mbps) FILTER (WHERE success = true) as avg_upload_mbps,
          AVG(ping_ms) FILTER (WHERE success = true) as avg_ping_ms,
          MAX(test_started_at) as last_test_date
        FROM speed_test_results 
        WHERE test_started_at >= $1 AND test_started_at <= $2
      `, [startDate.toISOString(), endDate.toISOString()]);

      const stats = result.rows[0];
      
      return {
        total_tests: parseInt(stats.total_tests) || 0,
        successful_tests: parseInt(stats.successful_tests) || 0,
        failed_tests: (parseInt(stats.total_tests) || 0) - (parseInt(stats.successful_tests) || 0),
        avg_download_mbps: parseFloat(stats.avg_download_mbps) || 0,
        avg_upload_mbps: parseFloat(stats.avg_upload_mbps) || 0,
        avg_ping_ms: parseFloat(stats.avg_ping_ms) || 0,
        last_test_date: stats.last_test_date
      };
    } catch (error) {
      logger.error('Error fetching speed test stats:', error);
      throw new Error('Failed to fetch speed test statistics');
    }
  }

  async discoverOoklaServers(): Promise<any[]> {
    try {
      logger.info('Discovering Ookla speed test servers');
      
      // In production, this would query Ookla's servers.php API
      const mockServers = [
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
        const existingResult = await this.db.query(
          'SELECT id FROM speed_test_servers WHERE server_url = $1',
          [serverData.server_url]
        );

        if (existingResult.rows.length === 0) {
          const newServer = await this.createServer(serverData);
          results.push(newServer);
        }
      }

      return results;
    } catch (error) {
      logger.error('Error discovering Ookla servers:', error);
      throw new Error('Failed to discover Ookla servers');
    }
  }

  async testServerLatency(serverId: string): Promise<{ latency_ms: number; success: boolean }> {
    try {
      const serverResult = await this.db.query(
        'SELECT * FROM speed_test_servers WHERE id = $1',
        [serverId]
      );

      if (serverResult.rows.length === 0) {
        throw new Error('Server not found');
      }

      const server = serverResult.rows[0];
      
      // In production, this would ping the actual server
      logger.info(`Testing latency for server: ${server.server_name}`);
      
      const latency = Math.random() * 100 + 10; // 10-110ms
      
      // Update server latency
      await this.db.query(`
        UPDATE speed_test_servers 
        SET avg_latency_ms = $1, last_tested = $2
        WHERE id = $3
      `, [latency, new Date().toISOString(), serverId]);

      return { latency_ms: latency, success: true };
    } catch (error) {
      logger.error('Error testing server latency:', error);
      return { latency_ms: 0, success: false };
    }
  }

  async selectOptimalServer(criteria?: {
    country_preference?: string[];
    max_latency_ms?: number;
    exclude_countries?: string[];
  }): Promise<any> {
    try {
      let query = `
        SELECT * FROM speed_test_servers 
        WHERE is_whitelisted = true AND is_blacklisted = false
      `;
      const params: any[] = [];

      if (criteria?.country_preference && criteria.country_preference.length > 0) {
        query += ' AND country_code = ANY($' + (params.length + 1) + ')';
        params.push(criteria.country_preference);
      }

      if (criteria?.exclude_countries && criteria.exclude_countries.length > 0) {
        query += ' AND NOT (country_code = ANY($' + (params.length + 1) + '))';
        params.push(criteria.exclude_countries);
      }

      if (criteria?.max_latency_ms) {
        query += ' AND avg_latency_ms <= $' + (params.length + 1);
        params.push(criteria.max_latency_ms);
      }

      query += ' ORDER BY priority_score DESC, avg_latency_ms ASC LIMIT 1';

      const result = await this.db.query(query, params);
      return result.rows[0] || null;
    } catch (error) {
      logger.error('Error selecting optimal server:', error);
      return null;
    }
  }

  // DNS Ping Monitor Methods
  async getDNSMonitors(): Promise<any[]> {
    try {
      const result = await this.db.query(`
        SELECT * FROM dns_ping_monitors 
        ORDER BY monitor_name
      `);
      
      return result.rows;
    } catch (error) {
      logger.error('Error fetching DNS monitors:', error);
      throw new Error('Failed to fetch DNS monitors');
    }
  }

  async createDNSMonitor(monitorData: any): Promise<any> {
    try {
      const result = await this.db.query(`
        INSERT INTO dns_ping_monitors (
          monitor_name, target_ip, target_hostname, target_description,
          interval_ms, packet_size_bytes, timeout_ms,
          warning_rtt_ms, critical_rtt_ms, warning_jitter_ms, critical_jitter_ms,
          warning_loss_percent, critical_loss_percent, is_active
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
        RETURNING *
      `, [
        monitorData.monitor_name,
        monitorData.target_ip,
        monitorData.target_hostname,
        monitorData.target_description,
        monitorData.interval_ms || 1000,
        monitorData.packet_size_bytes || 64,
        monitorData.timeout_ms || 5000,
        monitorData.warning_rtt_ms || 50,
        monitorData.critical_rtt_ms || 100,
        monitorData.warning_jitter_ms || 10,
        monitorData.critical_jitter_ms || 20,
        monitorData.warning_loss_percent || 5,
        monitorData.critical_loss_percent || 10,
        true
      ]);

      const monitor = result.rows[0];
      logger.info(`Created DNS ping monitor: ${monitor.monitor_name}`);
      return monitor;
    } catch (error) {
      logger.error('Error creating DNS monitor:', error);
      throw new Error('Failed to create DNS monitor');
    }
  }

  async updateDNSMonitor(id: string, updates: any): Promise<any> {
    try {
      const setClauses: string[] = [];
      const params: any[] = [];
      let paramIndex = 1;

      Object.entries(updates).forEach(([key, value]) => {
        if (value !== undefined && key !== 'id' && key !== 'created_at') {
          setClauses.push(`${key} = $${paramIndex}`);
          params.push(value);
          paramIndex++;
        }
      });

      if (setClauses.length === 0) {
        const result = await this.db.query('SELECT * FROM dns_ping_monitors WHERE id = $1', [id]);
        return result.rows[0];
      }

      setClauses.push(`updated_at = NOW()`);
      params.push(id);

      const result = await this.db.query(`
        UPDATE dns_ping_monitors 
        SET ${setClauses.join(', ')}
        WHERE id = $${paramIndex}
        RETURNING *
      `, params);

      return result.rows[0];
    } catch (error) {
      logger.error('Error updating DNS monitor:', error);
      throw new Error('Failed to update DNS monitor');
    }
  }

  async startDNSMonitor(monitorId: string): Promise<boolean> {
    try {
      await this.db.query(`
        UPDATE dns_ping_monitors 
        SET is_active = true, updated_at = NOW()
        WHERE id = $1
      `, [monitorId]);

      // In production, this would start actual ping monitoring process
      logger.info(`Started DNS ping monitor: ${monitorId}`);
      return true;
    } catch (error) {
      logger.error('Error starting DNS monitor:', error);
      return false;
    }
  }

  async stopDNSMonitor(monitorId: string): Promise<boolean> {
    try {
      await this.db.query(`
        UPDATE dns_ping_monitors 
        SET is_active = false, updated_at = NOW()
        WHERE id = $1
      `, [monitorId]);

      logger.info(`Stopped DNS ping monitor: ${monitorId}`);
      return true;
    } catch (error) {
      logger.error('Error stopping DNS monitor:', error);
      return false;
    }
  }

  async getDNSPingResults(monitorId: string, hours: number = 1): Promise<any[]> {
    try {
      const startTime = new Date();
      startTime.setHours(startTime.getHours() - hours);

      const result = await this.db.query(`
        SELECT * FROM dns_ping_results 
        WHERE monitor_id = $1 AND timestamp >= $2
        ORDER BY timestamp DESC
        LIMIT 1000
      `, [monitorId, startTime.toISOString()]);
      
      return result.rows;
    } catch (error) {
      logger.error('Error fetching DNS ping results:', error);
      throw new Error('Failed to fetch DNS ping results');
    }
  }

  async getNetworkInterfaces(): Promise<any[]> {
    try {
      const result = await this.db.query(`
        SELECT * FROM network_interfaces 
        WHERE is_enabled = true
        ORDER BY interface_name
      `);
      
      return result.rows;
    } catch (error) {
      logger.error('Error fetching network interfaces:', error);
      throw new Error('Failed to fetch network interfaces');
    }
  }

  async discoverNetworkInterfaces(): Promise<any[]> {
    try {
      logger.info('Discovering network interfaces');
      
      // In production, this would scan system interfaces using ip command
      const mockInterfaces = [
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
        const existingResult = await this.db.query(
          'SELECT id FROM network_interfaces WHERE interface_name = $1',
          [ifaceData.interface_name]
        );

        if (existingResult.rows.length === 0) {
          const result = await this.db.query(`
            INSERT INTO network_interfaces (
              interface_name, interface_type, description, ip_address,
              is_up, is_running, speed_mbps, mtu, vpn_type, tunnel_endpoint
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            RETURNING *
          `, [
            ifaceData.interface_name,
            ifaceData.interface_type,
            ifaceData.description,
            ifaceData.ip_address,
            ifaceData.is_up,
            ifaceData.is_running,
            ifaceData.speed_mbps,
            ifaceData.mtu,
            ifaceData.vpn_type,
            ifaceData.tunnel_endpoint
          ]);

          results.push(result.rows[0]);
        }
      }

      return results;
    } catch (error) {
      logger.error('Error discovering network interfaces:', error);
      throw new Error('Failed to discover network interfaces');
    }
  }

  async analyzeBufferbloat(testResultId: string): Promise<any> {
    try {
      const result = await this.db.query(
        'SELECT idle_ping_ms, loaded_ping_ms, bufferbloat_score FROM speed_test_results WHERE id = $1',
        [testResultId]
      );

      if (result.rows.length === 0) {
        throw new Error('Test result not found');
      }

      const test = result.rows[0];
      const idlePing = test.idle_ping_ms || 0;
      const loadedPing = test.loaded_ping_ms || 0;
      const bloatMs = loadedPing - idlePing;

      let score = test.bufferbloat_score || 'A';
      let qoeImpact = 'none';
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
      logger.error('Error analyzing bufferbloat:', error);
      throw new Error('Failed to analyze bufferbloat');
    }
  }

  async getTestProgress(testId: string): Promise<any> {
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
      logger.error('Error getting test progress:', error);
      return null;
    }
  }
}