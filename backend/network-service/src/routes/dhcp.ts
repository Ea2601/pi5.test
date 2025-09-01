import express from 'express';
import Joi from 'joi';
import { DHCPService } from '../services/DHCPService';
import { logger } from '../utils/logger';

const router = express.Router();
const dhcpService = new DHCPService();

// Validation schemas
const dhcpPoolSchema = Joi.object({
  name: Joi.string().min(1).max(255).required(),
  description: Joi.string().max(500).optional(),
  vlan_id: Joi.number().integer().min(1).max(4094).required(),
  network_cidr: Joi.string().pattern(/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\/\d{1,2}$/).required(),
  start_ip: Joi.string().ip().required(),
  end_ip: Joi.string().ip().required(),
  gateway_ip: Joi.string().ip().required(),
  subnet_mask: Joi.string().ip().required(),
  dns_servers: Joi.array().items(Joi.string().ip()).min(1).required(),
  lease_time: Joi.string().default('24 hours'),
  max_lease_time: Joi.string().default('7 days'),
  allow_unknown_clients: Joi.boolean().default(true),
  require_authorization: Joi.boolean().default(false)
});

const dhcpReservationSchema = Joi.object({
  mac_address: Joi.string().pattern(/^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/).required(),
  ip_address: Joi.string().ip().required(),
  hostname: Joi.string().max(255).optional(),
  device_group_id: Joi.string().uuid().optional(),
  dhcp_pool_id: Joi.string().uuid().optional(),
  description: Joi.string().max(500).optional(),
  lease_time_override: Joi.string().optional(),
  custom_dns_servers: Joi.array().items(Joi.string().ip()).optional()
});

// GET /dhcp/pools - List all DHCP pools
router.get('/pools', async (req, res) => {
  try {
    const pools = await dhcpService.getAllPools();
    res.json({
      success: true,
      data: pools
    });
  } catch (error) {
    logger.error('Get DHCP pools error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch DHCP pools'
    });
  }
});

// POST /dhcp/pools - Create DHCP pool
router.post('/pools', async (req, res) => {
  try {
    const { error } = dhcpPoolSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    const pool = await dhcpService.createPool(req.body);
    
    res.status(201).json({
      success: true,
      data: pool
    });
  } catch (error) {
    logger.error('Create DHCP pool error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create DHCP pool'
    });
  }
});

// PUT /dhcp/pools/:id - Update DHCP pool
router.put('/pools/:id', async (req, res) => {
  try {
    const pool = await dhcpService.updatePool(req.params.id, req.body);
    
    if (!pool) {
      return res.status(404).json({
        success: false,
        message: 'DHCP pool not found'
      });
    }

    res.json({
      success: true,
      data: pool
    });
  } catch (error) {
    logger.error('Update DHCP pool error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update DHCP pool'
    });
  }
});

// DELETE /dhcp/pools/:id - Delete DHCP pool
router.delete('/pools/:id', async (req, res) => {
  try {
    const success = await dhcpService.deletePool(req.params.id);
    
    if (!success) {
      return res.status(404).json({
        success: false,
        message: 'DHCP pool not found'
      });
    }

    res.json({
      success: true,
      message: 'DHCP pool deleted successfully'
    });
  } catch (error) {
    logger.error('Delete DHCP pool error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete DHCP pool'
    });
  }
});

// GET /dhcp/reservations - List static IP reservations
router.get('/reservations', async (req, res) => {
  try {
    const { group_id, pool_id } = req.query;
    const reservations = await dhcpService.getAllReservations({
      group_id: group_id as string,
      pool_id: pool_id as string
    });
    
    res.json({
      success: true,
      data: reservations
    });
  } catch (error) {
    logger.error('Get DHCP reservations error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch DHCP reservations'
    });
  }
});

// POST /dhcp/reservations - Create static IP reservation
router.post('/reservations', async (req, res) => {
  try {
    const { error } = dhcpReservationSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    const reservation = await dhcpService.createReservation(req.body);
    
    res.status(201).json({
      success: true,
      data: reservation
    });
  } catch (error) {
    logger.error('Create DHCP reservation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create DHCP reservation'
    });
  }
});

// GET /dhcp/leases - List active leases
router.get('/leases', async (req, res) => {
  try {
    const leases = await dhcpService.getActiveLeases();
    res.json({
      success: true,
      data: leases
    });
  } catch (error) {
    logger.error('Get DHCP leases error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch DHCP leases'
    });
  }
});

// POST /dhcp/leases/:mac/release - Release IP lease
router.post('/leases/:mac/release', async (req, res) => {
  try {
    const success = await dhcpService.releaseIP(req.params.mac);
    
    res.json({
      success,
      message: success ? 'IP lease released successfully' : 'Failed to release IP lease'
    });
  } catch (error) {
    logger.error('Release IP lease error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to release IP lease'
    });
  }
});

// POST /dhcp/leases/:id/renew - Renew lease
router.post('/leases/:id/renew', async (req, res) => {
  try {
    const { lease_time } = req.body;
    const lease = await dhcpService.renewLease(req.params.id, lease_time);
    
    res.json({
      success: true,
      data: lease,
      message: 'Lease renewed successfully'
    });
  } catch (error) {
    logger.error('Renew lease error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to renew lease'
    });
  }
});

// GET /dhcp/groups - List device groups
router.get('/groups', async (req, res) => {
  try {
    const groups = await dhcpService.getDeviceGroups();
    res.json({
      success: true,
      data: groups
    });
  } catch (error) {
    logger.error('Get device groups error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch device groups'
    });
  }
});

// GET /dhcp/logs - Get DHCP activity logs
router.get('/logs', async (req, res) => {
  try {
    const { mac_address, event_type, start_date, end_date, limit } = req.query;
    const logs = await dhcpService.getLogs({
      mac_address: mac_address as string,
      event_type: event_type as string,
      start_date: start_date as string,
      end_date: end_date as string,
      limit: limit ? parseInt(limit as string) : undefined
    });
    
    res.json({
      success: true,
      data: logs
    });
  } catch (error) {
    logger.error('Get DHCP logs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch DHCP logs'
    });
  }
});

// GET /dhcp/stats - Get DHCP statistics
router.get('/stats', async (req, res) => {
  try {
    const stats = await dhcpService.getStats();
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    logger.error('Get DHCP stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch DHCP statistics'
    });
  }
});

// POST /dhcp/apply - Apply DHCP configuration
router.post('/apply', async (req, res) => {
  try {
    const result = await dhcpService.applyConfiguration();
    
    res.json({
      success: result.success,
      errors: result.errors,
      message: result.success ? 'DHCP configuration applied successfully' : 'DHCP configuration failed'
    });
  } catch (error) {
    logger.error('Apply DHCP configuration error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to apply DHCP configuration'
    });
  }
});

// POST /dhcp/discover - Discover DHCP servers
router.post('/discover', async (req, res) => {
  try {
    const servers = await dhcpService.discoverServers();
    res.json({
      success: true,
      data: servers
    });
  } catch (error) {
    logger.error('Discover DHCP servers error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to discover DHCP servers'
    });
  }
});

// POST /dhcp/cleanup - Cleanup expired leases
router.post('/cleanup', async (req, res) => {
  try {
    const cleaned = await dhcpService.cleanupExpiredLeases();
    res.json({
      success: true,
      message: `${cleaned} expired leases cleaned up`,
      cleaned_count: cleaned
    });
  } catch (error) {
    logger.error('Cleanup expired leases error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cleanup expired leases'
    });
  }
});

// GET /dhcp/next-ip/:poolId - Get next available IP in pool
router.get('/next-ip/:poolId', async (req, res) => {
  try {
    const nextIP = await dhcpService.getNextAvailableIP(req.params.poolId);
    
    if (!nextIP) {
      return res.status(404).json({
        success: false,
        message: 'No available IPs in pool'
      });
    }

    res.json({
      success: true,
      data: { ip_address: nextIP }
    });
  } catch (error) {
    logger.error('Get next available IP error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get next available IP'
    });
  }
});

export default router;