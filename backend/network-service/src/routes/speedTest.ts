import express from 'express';
import Joi from 'joi';
import { SpeedTestService } from '../services/SpeedTestService';
import { logger } from '../utils/logger';

const router = express.Router();
const speedTestService = new SpeedTestService();

// Validation schemas
const profileSchema = Joi.object({
  profile_name: Joi.string().min(1).max(255).required(),
  description: Joi.string().max(500).optional(),
  profile_type: Joi.string().valid('fast', 'balanced', 'deep_analysis').default('balanced'),
  preferred_engine: Joi.string().valid('ookla', 'iperf3', 'flent', 'irtt').default('ookla'),
  parallel_threads: Joi.number().integer().min(1).max(16).default(4),
  test_duration_seconds: Joi.number().integer().min(5).max(300).default(30),
  warmup_seconds: Joi.number().integer().min(0).max(30).default(5),
  default_interface: Joi.string().default('auto'),
  ip_version: Joi.string().valid('ipv4', 'ipv6', 'dual_stack').default('ipv4'),
  sampling_method: Joi.string().valid('minimum', 'average', 'p90', 'p95', 'p99').default('average')
});

const serverSchema = Joi.object({
  server_name: Joi.string().min(1).max(255).required(),
  server_url: Joi.string().uri().required(),
  server_type: Joi.string().valid('ookla', 'iperf3', 'custom').default('ookla'),
  country_code: Joi.string().length(2).required(),
  city: Joi.string().max(255).optional(),
  sponsor: Joi.string().max(255).optional(),
  port: Joi.number().integer().min(1).max(65535).default(80),
  protocol: Joi.string().valid('http', 'https', 'tcp', 'udp').default('https')
});

const dnsMonitorSchema = Joi.object({
  monitor_name: Joi.string().min(1).max(255).required(),
  target_ip: Joi.string().ip().required(),
  target_hostname: Joi.string().max(255).optional(),
  target_description: Joi.string().max(500).optional(),
  interval_ms: Joi.number().integer().min(100).max(60000).default(1000),
  packet_size_bytes: Joi.number().integer().min(32).max(1500).default(64),
  timeout_ms: Joi.number().integer().min(1000).max(10000).default(5000),
  warning_rtt_ms: Joi.number().integer().min(1).default(50),
  critical_rtt_ms: Joi.number().integer().min(1).default(100)
});

// GET /speed-test/profiles - List speed test profiles
router.get('/profiles', async (req, res) => {
  try {
    const profiles = await speedTestService.getProfiles();
    res.json({
      success: true,
      data: profiles
    });
  } catch (error) {
    logger.error('Get speed test profiles error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch speed test profiles'
    });
  }
});

// POST /speed-test/profiles - Create speed test profile
router.post('/profiles', async (req, res) => {
  try {
    const { error } = profileSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    const profile = await speedTestService.createProfile(req.body);
    
    res.status(201).json({
      success: true,
      data: profile
    });
  } catch (error) {
    logger.error('Create speed test profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create speed test profile'
    });
  }
});

// GET /speed-test/servers - List speed test servers
router.get('/servers', async (req, res) => {
  try {
    const servers = await speedTestService.getServers();
    res.json({
      success: true,
      data: servers
    });
  } catch (error) {
    logger.error('Get speed test servers error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch speed test servers'
    });
  }
});

// POST /speed-test/servers - Create speed test server
router.post('/servers', async (req, res) => {
  try {
    const { error } = serverSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    const server = await speedTestService.createServer(req.body);
    
    res.status(201).json({
      success: true,
      data: server
    });
  } catch (error) {
    logger.error('Create speed test server error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create speed test server'
    });
  }
});

// POST /speed-test/run - Execute speed test
router.post('/run', async (req, res) => {
  try {
    const { profile_id, server_id, interface, ip_version, custom_settings } = req.body;
    
    if (!profile_id) {
      return res.status(400).json({
        success: false,
        message: 'Profile ID is required'
      });
    }

    const result = await speedTestService.runSpeedTest({
      profile_id,
      server_id,
      interface,
      ip_version,
      custom_settings
    });
    
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
    const { profile_id, server_id, interface, start_date, end_date, limit } = req.query;
    
    const results = await speedTestService.getResults({
      profile_id: profile_id as string,
      server_id: server_id as string,
      interface: interface as string,
      start_date: start_date as string,
      end_date: end_date as string,
      limit: limit ? parseInt(limit as string) : undefined
    });
    
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
    const { timeRange } = req.query;
    const stats = await speedTestService.getStats(timeRange as string);
    
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

// POST /speed-test/servers/discover - Discover Ookla servers
router.post('/servers/discover', async (req, res) => {
  try {
    const servers = await speedTestService.discoverOoklaServers();
    res.json({
      success: true,
      data: servers,
      message: `${servers.length} servers discovered`
    });
  } catch (error) {
    logger.error('Discover Ookla servers error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to discover Ookla servers'
    });
  }
});

// POST /speed-test/servers/:id/test-latency - Test server latency
router.post('/servers/:id/test-latency', async (req, res) => {
  try {
    const result = await speedTestService.testServerLatency(req.params.id);
    res.json({
      success: result.success,
      data: result
    });
  } catch (error) {
    logger.error('Test server latency error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to test server latency'
    });
  }
});

// DNS Ping Monitor Routes
// GET /speed-test/dns-monitors - List DNS ping monitors
router.get('/dns-monitors', async (req, res) => {
  try {
    const monitors = await speedTestService.getDNSMonitors();
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
    const { error } = dnsMonitorSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    const monitor = await speedTestService.createDNSMonitor(req.body);
    
    res.status(201).json({
      success: true,
      data: monitor
    });
  } catch (error) {
    logger.error('Create DNS monitor error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create DNS monitor'
    });
  }
});

// PUT /speed-test/dns-monitors/:id - Update DNS monitor
router.put('/dns-monitors/:id', async (req, res) => {
  try {
    const monitor = await speedTestService.updateDNSMonitor(req.params.id, req.body);
    
    if (!monitor) {
      return res.status(404).json({
        success: false,
        message: 'DNS monitor not found'
      });
    }

    res.json({
      success: true,
      data: monitor
    });
  } catch (error) {
    logger.error('Update DNS monitor error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update DNS monitor'
    });
  }
});

// POST /speed-test/dns-monitors/:id/start - Start DNS monitor
router.post('/dns-monitors/:id/start', async (req, res) => {
  try {
    const success = await speedTestService.startDNSMonitor(req.params.id);
    res.json({
      success,
      message: success ? 'DNS monitor started' : 'Failed to start DNS monitor'
    });
  } catch (error) {
    logger.error('Start DNS monitor error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to start DNS monitor'
    });
  }
});

// POST /speed-test/dns-monitors/:id/stop - Stop DNS monitor
router.post('/dns-monitors/:id/stop', async (req, res) => {
  try {
    const success = await speedTestService.stopDNSMonitor(req.params.id);
    res.json({
      success,
      message: success ? 'DNS monitor stopped' : 'Failed to stop DNS monitor'
    });
  } catch (error) {
    logger.error('Stop DNS monitor error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to stop DNS monitor'
    });
  }
});

// GET /speed-test/dns-monitors/:id/results - Get DNS ping results
router.get('/dns-monitors/:id/results', async (req, res) => {
  try {
    const { hours } = req.query;
    const results = await speedTestService.getDNSPingResults(
      req.params.id, 
      hours ? parseInt(hours as string) : 1
    );
    
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

// GET /speed-test/interfaces - Get network interfaces
router.get('/interfaces', async (req, res) => {
  try {
    const interfaces = await speedTestService.getNetworkInterfaces();
    res.json({
      success: true,
      data: interfaces
    });
  } catch (error) {
    logger.error('Get network interfaces error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch network interfaces'
    });
  }
});

// POST /speed-test/interfaces/discover - Discover network interfaces
router.post('/interfaces/discover', async (req, res) => {
  try {
    const interfaces = await speedTestService.discoverNetworkInterfaces();
    res.json({
      success: true,
      data: interfaces,
      message: `${interfaces.length} network interfaces discovered`
    });
  } catch (error) {
    logger.error('Discover network interfaces error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to discover network interfaces'
    });
  }
});

// POST /speed-test/servers/select-optimal - Select optimal server
router.post('/servers/select-optimal', async (req, res) => {
  try {
    const { country_preference, max_latency_ms, exclude_countries } = req.body;
    
    const server = await speedTestService.selectOptimalServer({
      country_preference,
      max_latency_ms,
      exclude_countries
    });
    
    if (!server) {
      return res.status(404).json({
        success: false,
        message: 'No suitable server found'
      });
    }

    res.json({
      success: true,
      data: server
    });
  } catch (error) {
    logger.error('Select optimal server error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to select optimal server'
    });
  }
});

// POST /speed-test/analyze-bufferbloat/:id - Analyze bufferbloat
router.post('/analyze-bufferbloat/:id', async (req, res) => {
  try {
    const analysis = await speedTestService.analyzeBufferbloat(req.params.id);
    res.json({
      success: true,
      data: analysis
    });
  } catch (error) {
    logger.error('Analyze bufferbloat error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to analyze bufferbloat'
    });
  }
});

// GET /speed-test/progress/:id - Get test progress
router.get('/progress/:id', async (req, res) => {
  try {
    const progress = await speedTestService.getTestProgress(req.params.id);
    
    if (!progress) {
      return res.status(404).json({
        success: false,
        message: 'Test progress not found'
      });
    }

    res.json({
      success: true,
      data: progress
    });
  } catch (error) {
    logger.error('Get test progress error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get test progress'
    });
  }
});

export default router;