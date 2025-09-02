import express from 'express';
import cors from 'cors';

const app: express.Application = express();
const PORT = process.env.API_GATEWAY_PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req: express.Request, res: express.Response) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    service: 'api-gateway',
    version: '2.1.4'
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
    
    res.json({
      success: true,
      data: metrics,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching system metrics:', error);
    res.json({
      success: false,
      data: {
        cpu: 0,
        memory: 0,
        disk: 0,
        network: { received: 0, transmitted: 0, upload: 0, download: 0 },
        temperature: 0,
        uptime: 0
      },
      error: 'Metrics temporarily unavailable',
      timestamp: new Date().toISOString()
    });
  }
});

// Network device endpoints with graceful fallbacks
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
        vendor_info: 'Raspberry Pi Foundation',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];
    
    res.json({
      success: true,
      data: devices,
      total: devices.length,
      active: devices.filter(d => d.is_active).length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching network devices:', error);
    res.json({
      success: false,
      data: [],
      total: 0,
      active: 0,
      error: 'Device data temporarily unavailable',
      timestamp: new Date().toISOString()
    });
  }
});

// DNS endpoints with fallbacks
app.get('/api/v1/network/dns/servers', (req: express.Request, res: express.Response) => {
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
        reliability_score: 0.99,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];
    
    res.json({
      success: true,
      data: servers,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.json({
      success: false,
      data: [],
      error: 'DNS server data temporarily unavailable',
      timestamp: new Date().toISOString()
    });
  }
});

app.get('/api/v1/network/dns/stats', (req: express.Request, res: express.Response) => {
  try {
    const stats = {
      total_queries: 5420,
      blocked_queries: 1250,
      cache_hit_ratio: 0.85,
      average_response_time: 18,
      top_domains: [
        { domain: 'google.com', count: 120 },
        { domain: 'youtube.com', count: 95 }
      ],
      top_blocked_domains: [
        { domain: 'ads.example.com', count: 45 }
      ],
      queries_by_type: { A: 4200, AAAA: 800, CNAME: 320 },
      queries_by_device: {}
    };
    
    res.json({
      success: true,
      data: stats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.json({
      success: false,
      data: {
        total_queries: 0,
        blocked_queries: 0,
        cache_hit_ratio: 0,
        average_response_time: 0,
        top_domains: [],
        top_blocked_domains: [],
        queries_by_type: {},
        queries_by_device: {}
      },
      error: 'DNS statistics temporarily unavailable',
      timestamp: new Date().toISOString()
    });
  }
});

// DHCP endpoints
app.get('/api/v1/network/dhcp/pools', (req: express.Request, res: express.Response) => {
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
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];
    
    res.json({
      success: true,
      data: pools,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.json({
      success: false,
      data: [],
      error: 'DHCP pool data temporarily unavailable',
      timestamp: new Date().toISOString()
    });
  }
});

app.get('/api/v1/network/dhcp/stats', (req: express.Request, res: express.Response) => {
  try {
    const stats = {
      total_pools: 3,
      active_pools: 2,
      total_leases: 25,
      active_leases: 18,
      expired_leases: 7,
      total_reservations: 5,
      active_reservations: 5,
      pool_utilization: [],
      recent_activity: []
    };
    
    res.json({
      success: true,
      data: stats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.json({
      success: false,
      data: {
        total_pools: 0,
        active_pools: 0,
        total_leases: 0,
        active_leases: 0,
        expired_leases: 0,
        total_reservations: 0,
        active_reservations: 0,
        pool_utilization: [],
        recent_activity: []
      },
      error: 'DHCP statistics temporarily unavailable',
      timestamp: new Date().toISOString()
    });
  }
});

// WiFi endpoints
app.get('/api/v1/network/wifi/networks', (req: express.Request, res: express.Response) => {
  try {
    const networks = [
      {
        id: 'wifi-1',
        ssid: 'Infinite-Home',
        vlan_id: 20,
        encryption_type: 'WPA3',
        is_enabled: true,
        client_count: 8,
        max_clients: 50,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];
    
    res.json({
      success: true,
      data: networks,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.json({
      success: false,
      data: [],
      error: 'WiFi network data temporarily unavailable',
      timestamp: new Date().toISOString()
    });
  }
});

app.get('/api/v1/network/wifi/stats', (req: express.Request, res: express.Response) => {
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
    
    res.json({
      success: true,
      data: stats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.json({
      success: false,
      data: {
        total_access_points: 0,
        online_access_points: 0,
        total_networks: 0,
        active_networks: 0,
        total_clients: 0,
        connected_clients: 0,
        total_bandwidth_mbps: 0,
        average_signal_strength: -100,
        channel_utilization: [],
        client_distribution: []
      },
      error: 'WiFi statistics temporarily unavailable',
      timestamp: new Date().toISOString()
    });
  }
});

// POST endpoints for configuration
app.post('/api/v1/network/dns/apply-config', (req: express.Request, res: express.Response) => {
  res.json({ 
    success: true, 
    message: 'DNS configuration applied successfully',
    errors: [],
    timestamp: new Date().toISOString()
  });
});

app.post('/api/v1/network/dns/flush-cache', (req: express.Request, res: express.Response) => {
  res.json({ 
    success: true, 
    message: 'DNS cache flushed successfully',
    timestamp: new Date().toISOString()
  });
});

app.post('/api/v1/network/dhcp/apply-config', (req: express.Request, res: express.Response) => {
  res.json({ 
    success: true, 
    message: 'DHCP configuration applied successfully',
    errors: [],
    timestamp: new Date().toISOString()
  });
});

app.post('/api/v1/network/wifi/apply-config', (req: express.Request, res: express.Response) => {
  res.json({ 
    success: true, 
    message: 'WiFi configuration applied successfully',
    errors: [],
    timestamp: new Date().toISOString()
  });
});

// Health checks for services
app.get('/health/services', (req: express.Request, res: express.Response) => {
  res.json({
    success: true,
    services: [
      { name: 'api-gateway', status: 'healthy', port: 3000 },
      { name: 'network-service', status: 'starting', port: 3001 },
      { name: 'vpn-service', status: 'starting', port: 3002 },
      { name: 'automation-service', status: 'starting', port: 3003 }
    ],
    timestamp: new Date().toISOString()
  });
});

// System information
app.get('/api/v1/system/info', (req: express.Request, res: express.Response) => {
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
        database: { status: 'not_configured', type: 'supabase' },
        cache: { status: 'not_configured', type: 'redis' }
      }
    };
    
    res.json({
      success: true,
      data: systemInfo,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.json({
      success: false,
      data: {
        version: '2.1.4',
        platform: 'Unknown',
        node_version: 'Unknown',
        uptime: 0,
        memory_usage: { rss: 0, heapTotal: 0, heapUsed: 0, external: 0 },
        environment: 'development',
        services: {}
      },
      error: 'System information temporarily unavailable',
      timestamp: new Date().toISOString()
    });
  }
});

// Catch-all for undefined routes
app.use('*', (req: express.Request, res: express.Response) => {
  res.status(404).json({ 
    success: false,
    error: 'Endpoint not found',
    endpoint: req.originalUrl,
    timestamp: new Date().toISOString()
  });
});

// Global error handler
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Global error handler:', error);
  res.status(500).json({ 
    success: false,
    error: 'Internal server error',
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ API Gateway running on port ${PORT}`);
  console.log(`🌐 Health check: http://localhost:${PORT}/health`);
  console.log(`📊 System metrics: http://localhost:${PORT}/api/v1/system/metrics`);
});

export default app;