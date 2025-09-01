import express from 'express';
import Joi from 'joi';
import { DNSServerService } from '../services/DNSServerService';
import { logger } from '../utils/logger';

const router = express.Router();
const dnsService = new DNSServerService();

// Validation schemas
const dnsServerSchema = Joi.object({
  name: Joi.string().min(1).max(255).required(),
  description: Joi.string().max(500).optional(),
  ip_address: Joi.string().ip().required(),
  port: Joi.number().integer().min(1).max(65535).default(53),
  type: Joi.string().valid('standard', 'doh', 'dot', 'dnssec').default('standard'),
  provider: Joi.string().valid('google', 'cloudflare', 'quad9', 'custom').optional(),
  is_primary: Joi.boolean().default(false),
  is_fallback: Joi.boolean().default(false),
  doh_url: Joi.string().uri().optional(),
  dot_hostname: Joi.string().hostname().optional(),
  priority: Joi.number().integer().min(1).max(999).default(100)
});

// GET /dns/servers - List all DNS servers
router.get('/servers', async (req, res) => {
  try {
    const servers = await dnsService.getAllServers();
    res.json({
      success: true,
      data: servers
    });
  } catch (error) {
    logger.error('Get DNS servers error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch DNS servers'
    });
  }
});

// POST /dns/servers - Create DNS server
router.post('/servers', async (req, res) => {
  try {
    const { error } = dnsServerSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    const server = await dnsService.createServer(req.body);
    
    res.status(201).json({
      success: true,
      data: server
    });
  } catch (error) {
    logger.error('Create DNS server error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create DNS server'
    });
  }
});

// PUT /dns/servers/:id - Update DNS server
router.put('/servers/:id', async (req, res) => {
  try {
    const server = await dnsService.updateServer(req.params.id, req.body);
    
    if (!server) {
      return res.status(404).json({
        success: false,
        message: 'DNS server not found'
      });
    }

    res.json({
      success: true,
      data: server
    });
  } catch (error) {
    logger.error('Update DNS server error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update DNS server'
    });
  }
});

// DELETE /dns/servers/:id - Delete DNS server
router.delete('/servers/:id', async (req, res) => {
  try {
    const success = await dnsService.deleteServer(req.params.id);
    
    if (!success) {
      return res.status(404).json({
        success: false,
        message: 'DNS server not found'
      });
    }

    res.json({
      success: true,
      message: 'DNS server deleted successfully'
    });
  } catch (error) {
    logger.error('Delete DNS server error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete DNS server'
    });
  }
});

// POST /dns/servers/:id/test - Test DNS server
router.post('/servers/:id/test', async (req, res) => {
  try {
    const server = await dnsService.getServerById(req.params.id);
    if (!server) {
      return res.status(404).json({
        success: false,
        message: 'DNS server not found'
      });
    }

    const testResult = await dnsService.testServer(server.ip_address);
    
    res.json({
      success: true,
      data: testResult
    });
  } catch (error) {
    logger.error('Test DNS server error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to test DNS server'
    });
  }
});

// GET /dns/profiles - List DNS profiles
router.get('/profiles', async (req, res) => {
  try {
    const profiles = await dnsService.getAllProfiles();
    res.json({
      success: true,
      data: profiles
    });
  } catch (error) {
    logger.error('Get DNS profiles error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch DNS profiles'
    });
  }
});

// POST /dns/profiles - Create DNS profile
router.post('/profiles', async (req, res) => {
  try {
    const profile = await dnsService.createProfile(req.body);
    
    res.status(201).json({
      success: true,
      data: profile
    });
  } catch (error) {
    logger.error('Create DNS profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create DNS profile'
    });
  }
});

// GET /dns/stats - Get DNS statistics
router.get('/stats', async (req, res) => {
  try {
    const { timeRange } = req.query;
    const stats = await dnsService.getStats(timeRange as string);
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    logger.error('Get DNS stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch DNS statistics'
    });
  }
});

// POST /dns/apply - Apply DNS configuration
router.post('/apply', async (req, res) => {
  try {
    const result = await dnsService.applyConfiguration();
    
    res.json({
      success: result.success,
      errors: result.errors,
      message: result.success ? 'DNS configuration applied successfully' : 'DNS configuration failed'
    });
  } catch (error) {
    logger.error('Apply DNS configuration error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to apply DNS configuration'
    });
  }
});

// POST /dns/flush-cache - Flush DNS cache
router.post('/flush-cache', async (req, res) => {
  try {
    const success = await dnsService.flushCache();
    
    res.json({
      success,
      message: success ? 'DNS cache flushed successfully' : 'Failed to flush DNS cache'
    });
  } catch (error) {
    logger.error('Flush DNS cache error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to flush DNS cache'
    });
  }
});

export default router;