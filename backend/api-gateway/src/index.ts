import express from 'express';
import cors from 'cors';

const app: express.Application = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req: express.Request, res: express.Response) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    service: 'api-gateway'
  });
});

// System metrics endpoint
app.get('/api/v1/system/metrics', (req: express.Request, res: express.Response) => {
  try {
    const metrics = {
      cpu: Math.random() * 100,
      memory: Math.random() * 100,
      disk: Math.random() * 100,
      network: {
        received: Math.floor(Math.random() * 1000000),
        transmitted: Math.floor(Math.random() * 1000000),
        upload: Math.floor(Math.random() * 100),
        download: Math.floor(Math.random() * 200)
      },
      temperature: Math.random() * 40 + 30,
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    };
    
    res.json(metrics);
  } catch (error) {
    console.error('Error fetching system metrics:', error);
    res.status(500).json({ error: 'Failed to fetch system metrics' });
  }
});

// Network device endpoints
app.get('/api/v1/network/devices', (req: express.Request, res: express.Response) => {
  try {
    const devices = [
      {
        id: '1',
        mac_address: '00:11:22:33:44:55',
        ip_address: '192.168.1.100',
        device_name: 'Pi5 Supernode',
        device_type: 'PC',
        device_brand: 'Raspberry Pi',
        is_active: true,
        last_seen: new Date().toISOString(),
        vendor_info: 'Raspberry Pi Foundation'
      },
      {
        id: '2',
        mac_address: '00:11:22:33:44:56',
        ip_address: '192.168.1.101',
        device_name: 'iPhone 14 Pro',
        device_type: 'Mobile',
        device_brand: 'Apple',
        is_active: true,
        last_seen: new Date().toISOString(),
        vendor_info: 'Apple Inc.'
      }
    ];
    
    res.json(devices);
  } catch (error) {
    console.error('Error fetching network devices:', error);
    res.status(500).json({ error: 'Failed to fetch network devices' });
  }
});

// DNS Server endpoints
app.get('/api/v1/network/dns/servers', (req, res) => {
  try {
    const servers = [
      {
        id: 'dns-1',
        name: 'Cloudflare Primary',
        ip_address: '1.1.1.1',
        port: 53,
        type: 'standard',
        is_active: true,
        response_time_ms: 15,
        reliability_score: 0.99
      },
      {
        id: 'dns-2',
        name: 'Google DNS',
        ip_address: '8.8.8.8',
        port: 53,
        type: 'standard',
        is_active: true,
        response_time_ms: 22,
        reliability_score: 0.98
      }
    ];
    
    res.json(servers);
  } catch (error) {
    console.error('Error fetching DNS servers:', error);
    res.status(500).json({ error: 'Failed to fetch DNS servers' });
  }
});

// DHCP Pool endpoints
app.get('/api/v1/network/dhcp/pools', (req, res) => {
  try {
    const pools = [
      {
        id: 'pool-1',
        name: 'Admin Network',
        vlan_id: 10,
        network_cidr: '192.168.10.0/24',
        start_ip: '192.168.10.100',
        end_ip: '192.168.10.199',
        gateway_ip: '192.168.10.1',
        is_active: true
      },
      {
        id: 'pool-2',
        name: 'IoT Network', 
        vlan_id: 30,
        network_cidr: '192.168.30.0/24',
        start_ip: '192.168.30.100',
        end_ip: '192.168.30.199',
        gateway_ip: '192.168.30.1',
        is_active: true
      }
    ];
    
    res.json(pools);
  } catch (error) {
    console.error('Error fetching DHCP pools:', error);
    res.status(500).json({ error: 'Failed to fetch DHCP pools' });
  }
});

// WiFi Network endpoints
app.get('/api/v1/network/wifi/networks', (req, res) => {
  try {
    const networks = [
      {
        id: 'wifi-1',
        ssid: 'Infinite-Home',
        vlan_id: 20,
        encryption_type: 'WPA3',
        is_enabled: true,
        client_count: 8,
        max_clients: 50
      },
      {
        id: 'wifi-2',
        ssid: 'Infinite-Guest',
        vlan_id: 40,
        encryption_type: 'WPA2',
        is_enabled: true,
        client_count: 3,
        max_clients: 20
      }
    ];
    
    res.json(networks);
  } catch (error) {
    console.error('Error fetching WiFi networks:', error);
    res.status(500).json({ error: 'Failed to fetch WiFi networks' });
  }
});

// WiFi Stats endpoint
app.get('/api/v1/network/wifi/stats', (req, res) => {
  try {
    const stats = {
      total_access_points: 2,
      online_access_points: 2,
      total_networks: 3,
      active_networks: 2,
      total_clients: 15,
      connected_clients: 11,
      total_bandwidth_mbps: 167.5,
      average_signal_strength: -58,
      channel_utilization: [],
      client_distribution: []
    };
    
    res.json(stats);
  } catch (error) {
    console.error('Error fetching WiFi stats:', error);
    res.status(500).json({ error: 'Failed to fetch WiFi stats' });
  }
});

// Network Settings endpoints
app.get('/api/v1/network/settings/interfaces', (req, res) => {
  try {
    const interfaces = [
      {
        name: 'eth0',
        type: 'ethernet',
        status: 'up',
        ip_address: '192.168.1.100',
        mac_address: '00:11:22:33:44:55',
        mtu: 1500,
        speed: '1000 Mbps'
      },
      {
        name: 'wlan0',
        type: 'wifi',
        status: 'up',
        ip_address: '192.168.1.101',
        mac_address: '00:11:22:33:44:56',
        mtu: 1500,
        speed: '866 Mbps'
      }
    ];
    
    res.json(interfaces);
  } catch (error) {
    console.error('Error fetching network interfaces:', error);
    res.status(500).json({ error: 'Failed to fetch network interfaces' });
  }
});

app.get('/api/v1/network/settings/firewall', (req, res) => {
  try {
    const rules = [
      {
        id: 'fw-1',
        name: 'SSH Access',
        action: 'allow',
        protocol: 'tcp',
        source: '192.168.1.0/24',
        destination: 'any',
        port: '22',
        enabled: true
      }
    ];
    
    res.json(rules);
  } catch (error) {
    console.error('Error fetching firewall rules:', error);
    res.status(500).json({ error: 'Failed to fetch firewall rules' });
  }
});

app.get('/api/v1/network/settings/routing', (req, res) => {
  try {
    const routes = [
      {
        id: 'route-1',
        destination: '0.0.0.0/0',
        gateway: '192.168.1.1',
        interface: 'eth0',
        metric: 100,
        enabled: true
      }
    ];
    
    res.json(routes);
  } catch (error) {
    console.error('Error fetching routing rules:', error);
    res.status(500).json({ error: 'Failed to fetch routing rules' });
  }
});

// Network configuration apply endpoint
app.post('/api/v1/network/settings/apply', (req, res) => {
  res.json({ success: true, message: 'Network settings applied successfully', errors: [] });
});

// System information endpoint
app.get('/api/v1/system/info', (req, res) => {
  try {
    const systemInfo = {
      version: '2.1.4',
      platform: 'Raspberry Pi 5',
      node_version: process.version,
      uptime: process.uptime(),
      memory_usage: process.memoryUsage(),
      environment: process.env.NODE_ENV || 'development',
      services: {
        api_gateway: { status: 'running', port: 3000 },
        database: { status: 'disconnected', type: 'supabase' },
        cache: { status: 'disconnected', type: 'redis' }
      }
    };
    
    res.json(systemInfo);
  } catch (error) {
    console.error('Error fetching system info:', error);
    res.status(500).json({ error: 'Failed to fetch system info' });
  }
});

// Configuration endpoints
app.get('/api/v1/system/config', (req, res) => {
  try {
    const config = {
      database_configured: !!(process.env.VITE_SUPABASE_URL && process.env.VITE_SUPABASE_ANON_KEY),
      services_running: ['api-gateway'],
      required_env_vars: [
        'VITE_SUPABASE_URL',
        'VITE_SUPABASE_ANON_KEY',
        'JWT_SECRET',
        'POSTGRES_PASSWORD'
      ],
      optional_env_vars: [
        'TELEGRAM_BOT_TOKEN',
        'WEBHOOK_BASE_URL',
        'GRAFANA_PASSWORD'
      ]
    };
    
    res.json(config);
  } catch (error) {
    console.error('Error fetching system config:', error);
    res.status(500).json({ error: 'Failed to fetch system config' });
  }
});

// DNS Stats endpoint
app.get('/api/v1/network/dns/stats', (req, res) => {
  try {
    const stats = {
      total_queries: 5420,
      blocked_queries: 1250,
      cache_hit_ratio: 0.85,
      average_response_time: 18,
      top_domains: [
        { domain: 'google.com', count: 120 },
        { domain: 'youtube.com', count: 95 },
        { domain: 'github.com', count: 78 }
      ],
      top_blocked_domains: [
        { domain: 'ads.example.com', count: 45 },
        { domain: 'tracker.bad.com', count: 32 }
      ],
      queries_by_type: { A: 4200, AAAA: 800, CNAME: 320, MX: 100 },
      queries_by_device: {}
    };
    
    res.json(stats);
  } catch (error) {
    console.error('Error fetching DNS stats:', error);
    res.status(500).json({ error: 'Failed to fetch DNS stats' });
  }
});

// DHCP Stats endpoint
app.get('/api/v1/network/dhcp/stats', (req, res) => {
  try {
    const stats = {
      total_pools: 3,
      active_pools: 2,
      total_leases: 25,
      active_leases: 18,
      expired_leases: 7,
      total_reservations: 5,
      active_reservations: 5,
      pool_utilization: [
        {
          pool_name: 'Admin Network',
          vlan_id: 10,
          total_ips: 100,
          used_ips: 12,
          utilization_percent: 12
        },
        {
          pool_name: 'IoT Network',
          vlan_id: 30,
          total_ips: 100,
          used_ips: 6,
          utilization_percent: 6
        }
      ],
      recent_activity: []
    };
    
    res.json(stats);
  } catch (error) {
    console.error('Error fetching DHCP stats:', error);
    res.status(500).json({ error: 'Failed to fetch DHCP stats' });
  }
});

// Health check for DNS
app.get('/api/v1/network/dns/health', (req, res) => {
  try {
    const health = {
      overall_health: true,
      server_health: [
        { server: 'Cloudflare Primary', healthy: true, response_time: 15, error: null },
        { server: 'Google DNS', healthy: true, response_time: 22, error: null }
      ],
      total_servers: 2,
      active_servers: 2
    };
    
    res.json(health);
  } catch (error) {
    console.error('Error checking DNS health:', error);
    res.status(500).json({ error: 'Failed to check DNS health' });
  }
});

// WiFi Health endpoint
app.get('/api/v1/network/wifi/health', (req, res) => {
  try {
    const health = {
      overall_health: 'healthy',
      issues: [],
      recommendations: [
        'Kanal 6 ve 11 arasında optimizasyon yapılabilir',
        '5GHz bandında daha fazla kanal kullanımı önerilir'
      ]
    };
    
    res.json(health);
  } catch (error) {
    console.error('Error checking WiFi health:', error);
    res.status(500).json({ error: 'Failed to check WiFi health' });
  }
});

// Speed Test Stats endpoint
app.get('/api/v1/network/speed-test/stats', (req, res) => {
  try {
    const stats = {
      total_tests: 45,
      successful_tests: 42,
      failed_tests: 3,
      avg_download_mbps: 167.5,
      avg_upload_mbps: 45.2,
      avg_ping_ms: 18,
      last_test_date: new Date().toISOString(),
      popular_servers: [],
      performance_trends: []
    };
    
    res.json(stats);
  } catch (error) {
    console.error('Error fetching speed test stats:', error);
    res.status(500).json({ error: 'Failed to fetch speed test stats' });
  }
});

// Generic POST endpoints for various operations
app.post('/api/v1/network/dns/apply-config', (req, res) => {
  res.json({ success: true, message: 'DNS configuration applied', errors: [] });
});

app.post('/api/v1/network/dns/flush-cache', (req, res) => {
  res.json({ success: true, message: 'DNS cache flushed' });
});

app.post('/api/v1/network/dhcp/apply-config', (req, res) => {
  res.json({ success: true, message: 'DHCP configuration applied', errors: [] });
});

app.post('/api/v1/network/wifi/apply-config', (req, res) => {
  res.json({ success: true, message: 'WiFi configuration applied', errors: [] });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global error handler
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Global error handler:', error);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ API Gateway running on port ${PORT}`);
  console.log(`🌐 Health check: http://localhost:${PORT}/health`);
  console.log(`📊 System metrics: http://localhost:${PORT}/api/v1/system/metrics`);
});

export default app;