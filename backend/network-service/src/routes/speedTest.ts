import express from 'express';
import Joi from 'joi';
import { logger } from '../utils/logger';

const router = express.Router();

// Mock Speed Test data
const mockProfiles = [
  {
    id: 'profile-fast',
    profile_name: 'Hızlı Test',
    description: 'Hızlı genel bağlantı kontrolü',
    profile_type: 'fast',
    preferred_engine: 'ookla',
    parallel_threads: 2,
    test_duration_seconds: 15,
    warmup_seconds: 2,
    default_interface: 'auto',
    ip_version: 'ipv4',
    sampling_method: 'average',
    is_default: true,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'profile-balanced',
    profile_name: 'Dengeli Test',
    description: 'Dengeli performans ve doğruluk',
    profile_type: 'balanced',
    preferred_engine: 'ookla',
    parallel_threads: 4,
    test_duration_seconds: 30,
    warmup_seconds: 5,
    default_interface: 'auto',
    ip_version: 'ipv4',
    sampling_method: 'p90',
    is_default: false,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'profile-deep',
    profile_name: 'Derin Analiz',
    description: 'Kapsamlı QoE analizi',
    profile_type: 'deep_analysis',
    preferred_engine: 'iperf3',
    parallel_threads: 8,
    test_duration_seconds: 60,
    warmup_seconds: 10,
    default_interface: 'auto',
    ip_version: 'dual_stack',
    sampling_method: 'p95',
    is_default: false,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

const mockServers = [
  {
    id: 'server-tr-1',
    server_name: 'Türkiye - İstanbul (Türk Telekom)',
    server_url: 'http://speedtest.istanbul.net.tr',
    server_type: 'ookla',
    country_code: 'TR',
    city: 'İstanbul',
    sponsor: 'Türk Telekom',
    avg_latency_ms: 15,
    reliability_score: 0.95,
    is_preferred: true,
    is_whitelisted: true,
    is_blacklisted: false,
    priority_score: 95,
    port: 8080,
    protocol: 'http',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'server-ae-1',
    server_name: 'UAE - Dubai (Etisalat)',
    server_url: 'http://speedtest.etisalat.ae',
    server_type: 'ookla',
    country_code: 'AE',
    city: 'Dubai',
    sponsor: 'Etisalat',
    avg_latency_ms: 25,
    reliability_score: 0.92,
    is_preferred: true,
    is_whitelisted: true,
    is_blacklisted: false,
    priority_score: 90,
    port: 8080,
    protocol: 'http',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

const mockNetworkInterfaces = [
  {
    id: 'iface-1',
    interface_name: 'eth0',
    interface_type: 'ethernet',
    description: 'Ana Ethernet Bağlantısı',
    ip_address: '192.168.1.100',
    is_up: true,
    is_running: true,
    speed_mbps: 1000,
    mtu: 1500,
    is_enabled: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'iface-2',
    interface_name: 'wlan0',
    interface_type: 'wifi',
    description: 'Wi-Fi Bağlantısı',
    ip_address: '192.168.1.101',
    is_up: true,
    is_running: true,
    speed_mbps: 867,
    mtu: 1500,
    is_enabled: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

// GET /speed-test/profiles - List speed test profiles
router.get('/profiles', async (req, res) => {
  try {
    res.json({
      success: true,
      data: mockProfiles
    });
  } catch (error) {
    logger.error('Get speed test profiles error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch speed test profiles'
    });
  }
});

// GET /speed-test/servers - List speed test servers
router.get('/servers', async (req, res) => {
  try {
    res.json({
      success: true,
      data: mockServers
    });
  } catch (error) {
    logger.error('Get speed test servers error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch speed test servers'
    });
  }
});

// GET /speed-test/interfaces - Get network interfaces
router.get('/interfaces', async (req, res) => {
  try {
    res.json({
      success: true,
      data: mockNetworkInterfaces
    });
  } catch (error) {
    logger.error('Get network interfaces error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch network interfaces'
    });
  }
});

// POST /speed-test/run - Execute speed test
router.post('/run', async (req, res) => {
  try {
    const { profile, server, interface: testInterface, ip_version } = req.body;
    
    // Simulate speed test execution
    const testId = `test-${Date.now()}`;
    
    // Generate realistic results
    const download = Math.random() * 200 + 50; // 50-250 Mbps
    const upload = Math.random() * 100 + 20;   // 20-120 Mbps
    const ping = Math.random() * 50 + 10;      // 10-60 ms
    const jitter = Math.random() * 15 + 2;     // 2-17 ms
    const loss = Math.random() * 2;            // 0-2% loss

    const idlePing = ping;
    const loadedPing = ping + (Math.random() * 50 + 10);
    const bloatMs = loadedPing - idlePing;

    let bufferbloatScore = 'A';
    if (bloatMs > 100) bufferbloatScore = 'F';
    else if (bloatMs > 50) bufferbloatScore = 'D';
    else if (bloatMs > 20) bufferbloatScore = 'C';
    else if (bloatMs > 10) bufferbloatScore = 'B';

    const result = {
      id: testId,
      profile_id: profile?.id,
      server_id: server?.id,
      test_engine: profile?.preferred_engine || 'ookla',
      interface_used: testInterface || 'auto',
      ip_version: ip_version || 'ipv4',
      download_mbps: download,
      upload_mbps: upload,
      ping_ms: ping,
      jitter_ms: jitter,
      packet_loss_percent: loss,
      idle_ping_ms: idlePing,
      loaded_ping_ms: loadedPing,
      bufferbloat_score: bufferbloatScore,
      mos_score: Math.max(1, 5 - (jitter / 10) - (loss * 0.5)),
      success: true,
      test_started_at: new Date().toISOString(),
      test_completed_at: new Date().toISOString(),
      created_at: new Date().toISOString()
    };

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    logger.error('Run speed test error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to run speed test'
    });
  }
});

// GET /speed-test/results - Get speed test results
router.get('/results', async (req, res) => {
  try {
    const { limit } = req.query;
    
    // Generate mock results
    const results = Array.from({ length: parseInt(limit as string) || 10 }, (_, i) => ({
      id: `result-${i}`,
      download_mbps: Math.random() * 200 + 50,
      upload_mbps: Math.random() * 100 + 20,
      ping_ms: Math.random() * 50 + 10,
      bufferbloat_score: ['A', 'B', 'C', 'D', 'F'][Math.floor(Math.random() * 5)],
      success: Math.random() > 0.1,
      test_started_at: new Date(Date.now() - i * 3600000).toISOString(),
      created_at: new Date(Date.now() - i * 3600000).toISOString()
    }));

    res.json({
      success: true,
      data: results
    });
  } catch (error) {
    logger.error('Get speed test results error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch speed test results'
    });
  }
});

// GET /speed-test/stats - Get speed test statistics
router.get('/stats', async (req, res) => {
  try {
    const stats = {
      total_tests: Math.floor(Math.random() * 100) + 20,
      successful_tests: Math.floor(Math.random() * 90) + 15,
      failed_tests: Math.floor(Math.random() * 10) + 2,
      avg_download_mbps: Math.random() * 150 + 50,
      avg_upload_mbps: Math.random() * 80 + 20,
      avg_ping_ms: Math.random() * 40 + 15,
      last_test_date: new Date().toISOString(),
      popular_servers: [
        { server_name: 'Türkiye - İstanbul', test_count: 15, avg_download: 120.5 },
        { server_name: 'UAE - Dubai', test_count: 8, avg_download: 95.2 }
      ],
      performance_trends: []
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    logger.error('Get speed test stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch speed test statistics'
    });
  }
});

// DNS Ping Monitor Routes
// GET /speed-test/dns-monitors - List DNS ping monitors
router.get('/dns-monitors', async (req, res) => {
  try {
    const monitors = [
      {
        id: 'monitor-1',
        monitor_name: 'Cloudflare Primary',
        target_ip: '1.1.1.1',
        target_hostname: 'one.one.one.one',
        interval_ms: 1000,
        packet_size_bytes: 64,
        timeout_ms: 5000,
        warning_rtt_ms: 50,
        critical_rtt_ms: 100,
        is_active: true,
        last_rtt_ms: Math.random() * 30 + 10,
        last_status: 'healthy',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];

    res.json({
      success: true,
      data: monitors
    });
  } catch (error) {
    logger.error('Get DNS monitors error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch DNS monitors'
    });
  }
});

// POST /speed-test/dns-monitors - Create DNS monitor
router.post('/dns-monitors', async (req, res) => {
  try {
    const newMonitor = {
      id: `monitor-${Date.now()}`,
      ...req.body,
      is_active: false,
      last_status: 'unknown',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    res.status(201).json({
      success: true,
      data: newMonitor
    });
  } catch (error) {
    logger.error('Create DNS monitor error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create DNS monitor'
    });
  }
});

// GET /speed-test/dns-monitors/:id/results - Get DNS ping results
router.get('/dns-monitors/:id/results', async (req, res) => {
  try {
    const { hours } = req.query;
    const hoursBack = parseInt(hours as string) || 1;
    
    // Generate mock ping results
    const results = Array.from({ length: hoursBack * 60 }, (_, i) => ({
      id: `result-${i}`,
      monitor_id: req.params.id,
      rtt_ms: Math.random() * 50 + 10,
      jitter_ms: Math.random() * 10 + 1,
      packet_loss_percent: Math.random() * 2,
      timestamp: new Date(Date.now() - i * 60000).toISOString()
    }));

    res.json({
      success: true,
      data: results
    });
  } catch (error) {
    logger.error('Get DNS ping results error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch DNS ping results'
    });
  }
});

// POST /speed-test/servers/select-optimal - Select optimal server
router.post('/servers/select-optimal', async (req, res) => {
  try {
    const { country_preference } = req.body;
    
    // Select server based on preferences
    let selectedServer = mockServers[0]; // Default to first server
    
    if (country_preference && country_preference.length > 0) {
      const preferredServer = mockServers.find(s => 
        country_preference.includes(s.country_code)
      );
      if (preferredServer) {
        selectedServer = preferredServer;
      }
    }

    res.json({
      success: true,
      data: selectedServer
    });
  } catch (error) {
    logger.error('Select optimal server error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to select optimal server'
    });
  }
});

export default router;