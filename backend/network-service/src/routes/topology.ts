import express from 'express';
import Joi from 'joi';
import { TopologyService } from '../services/TopologyService';
import { logger } from '../utils/logger';

const router = express.Router();
const topologyService = new TopologyService();

// Validation schemas
const nodeSchema = Joi.object({
  node_name: Joi.string().min(1).max(255).required(),
  node_type: Joi.string().valid('wan_gateway', 'router', 'switch', 'access_point', 'server', 'client', 'iot_device', 'gaming_device').required(),
  device_category: Joi.string().valid('infrastructure', 'server', 'client', 'iot', 'network', 'security', 'unknown').default('unknown'),
  mac_address: Joi.string().pattern(/^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/).optional(),
  ip_address: Joi.string().ip().optional(),
  hostname: Joi.string().max(255).optional(),
  vendor: Joi.string().max(255).optional(),
  position_x: Joi.number().integer().min(0).default(0),
  position_y: Joi.number().integer().min(0).default(0),
  vlan_id: Joi.number().integer().min(1).max(4094).optional(),
  description: Joi.string().max(500).optional()
});

const connectionSchema = Joi.object({
  source_node_id: Joi.string().uuid().required(),
  target_node_id: Joi.string().uuid().required(),
  connection_type: Joi.string().valid('ethernet', 'wifi', 'fiber', 'vpn', 'logical').required(),
  bandwidth_mbps: Joi.number().integer().min(1).default(1000),
  interface_name_source: Joi.string().max(50).optional(),
  interface_name_target: Joi.string().max(50).optional(),
  vlan_tags: Joi.array().items(Joi.number().integer().min(1).max(4094)).default([]),
  trunk_mode: Joi.boolean().default(false),
  description: Joi.string().max(500).optional()
});

const vlanSchema = Joi.object({
  vlan_id: Joi.number().integer().min(1).max(4094).required(),
  vlan_name: Joi.string().min(1).max(255).required(),
  description: Joi.string().max(500).optional(),
  network_cidr: Joi.string().pattern(/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\/\d{1,2}$/).required(),
  gateway_ip: Joi.string().ip().required(),
  security_level: Joi.string().valid('low', 'medium', 'high', 'critical').default('medium'),
  traffic_priority: Joi.string().valid('low', 'normal', 'high', 'critical').default('normal'),
  isolation_enabled: Joi.boolean().default(false),
  inter_vlan_routing: Joi.boolean().default(true),
  internet_access: Joi.boolean().default(true),
  max_devices: Joi.number().integer().min(1).max(253).default(253)
});

// GET /topology/nodes - List all topology nodes
router.get('/nodes', async (req, res) => {
  try {
    const { node_types, vlans, online_only, search } = req.query;
    
    const filter: any = {};
    if (node_types) filter.node_types = (node_types as string).split(',');
    if (vlans) filter.vlans = (vlans as string).split(',').map(Number);
    if (online_only === 'true') filter.online_only = true;
    if (search) filter.search_term = search as string;

    const nodes = await topologyService.getNodes(filter);
    
    res.json({
      success: true,
      data: nodes
    });
  } catch (error) {
    logger.error('Get topology nodes error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch topology nodes'
    });
  }
});

// POST /topology/nodes - Create topology node
router.post('/nodes', async (req, res) => {
  try {
    const { error } = nodeSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    const node = await topologyService.createNode(req.body);
    
    res.status(201).json({
      success: true,
      data: node
    });
  } catch (error) {
    logger.error('Create topology node error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create topology node'
    });
  }
});

// PUT /topology/nodes/:id - Update topology node
router.put('/nodes/:id', async (req, res) => {
  try {
    const node = await topologyService.updateNode(req.params.id, req.body);
    
    if (!node) {
      return res.status(404).json({
        success: false,
        message: 'Topology node not found'
      });
    }

    res.json({
      success: true,
      data: node
    });
  } catch (error) {
    logger.error('Update topology node error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update topology node'
    });
  }
});

// DELETE /topology/nodes/:id - Delete topology node
router.delete('/nodes/:id', async (req, res) => {
  try {
    const success = await topologyService.deleteNode(req.params.id);
    
    if (!success) {
      return res.status(404).json({
        success: false,
        message: 'Topology node not found'
      });
    }

    res.json({
      success: true,
      message: 'Topology node deleted successfully'
    });
  } catch (error) {
    logger.error('Delete topology node error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete topology node'
    });
  }
});

// GET /topology/connections - List all connections
router.get('/connections', async (req, res) => {
  try {
    const connections = await topologyService.getConnections();
    res.json({
      success: true,
      data: connections
    });
  } catch (error) {
    logger.error('Get connections error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch connections'
    });
  }
});

// POST /topology/connections - Create connection
router.post('/connections', async (req, res) => {
  try {
    const { error } = connectionSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    const connection = await topologyService.createConnection(req.body);
    
    res.status(201).json({
      success: true,
      data: connection
    });
  } catch (error) {
    logger.error('Create connection error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create connection'
    });
  }
});

// GET /topology/vlans - List VLAN configurations
router.get('/vlans', async (req, res) => {
  try {
    const vlans = await topologyService.getVLANs();
    res.json({
      success: true,
      data: vlans
    });
  } catch (error) {
    logger.error('Get VLANs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch VLAN configurations'
    });
  }
});

// POST /topology/vlans - Create VLAN configuration
router.post('/vlans', async (req, res) => {
  try {
    const { error } = vlanSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    const vlan = await topologyService.createVLAN(req.body);
    
    res.status(201).json({
      success: true,
      data: vlan
    });
  } catch (error) {
    logger.error('Create VLAN error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create VLAN configuration'
    });
  }
});

// GET /topology/stats - Get topology statistics
router.get('/stats', async (req, res) => {
  try {
    const stats = await topologyService.getStats();
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    logger.error('Get topology stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch topology statistics'
    });
  }
});

// POST /topology/discover - Discover network topology
router.post('/discover', async (req, res) => {
  try {
    const result = await topologyService.discoverTopology();
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    logger.error('Discover topology error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to discover network topology'
    });
  }
});

// POST /topology/auto-layout - Apply automatic layout
router.post('/auto-layout', async (req, res) => {
  try {
    const result = await topologyService.autoLayout();
    res.json({
      success: true,
      data: result,
      message: 'Auto layout applied successfully'
    });
  } catch (error) {
    logger.error('Auto layout error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to apply auto layout'
    });
  }
});

// POST /topology/sync-devices - Sync with network devices
router.post('/sync-devices', async (req, res) => {
  try {
    await topologyService.syncWithNetworkDevices();
    res.json({
      success: true,
      message: 'Topology synced with network devices'
    });
  } catch (error) {
    logger.error('Sync devices error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to sync with network devices'
    });
  }
});

// POST /topology/snapshots - Create topology snapshot
router.post('/snapshots', async (req, res) => {
  try {
    const { name, description } = req.body;
    
    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Snapshot name is required'
      });
    }

    const snapshot = await topologyService.createSnapshot(name, description);
    
    res.status(201).json({
      success: true,
      data: snapshot
    });
  } catch (error) {
    logger.error('Create snapshot error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create topology snapshot'
    });
  }
});

// GET /topology/snapshots - List topology snapshots
router.get('/snapshots', async (req, res) => {
  try {
    const snapshots = await topologyService.getSnapshots();
    res.json({
      success: true,
      data: snapshots
    });
  } catch (error) {
    logger.error('Get snapshots error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch topology snapshots'
    });
  }
});

// POST /topology/snapshots/:id/restore - Restore topology snapshot
router.post('/snapshots/:id/restore', async (req, res) => {
  try {
    const success = await topologyService.restoreSnapshot(req.params.id);
    
    res.json({
      success,
      message: success ? 'Topology restored from snapshot' : 'Failed to restore topology'
    });
  } catch (error) {
    logger.error('Restore snapshot error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to restore topology snapshot'
    });
  }
});

// GET /topology/health - Network health check
router.get('/health', async (req, res) => {
  try {
    const health = await topologyService.performHealthCheck();
    res.json({
      success: true,
      data: health
    });
  } catch (error) {
    logger.error('Network health check error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to perform network health check'
    });
  }
});

// GET /topology/traffic-analysis - Traffic analysis
router.get('/traffic-analysis', async (req, res) => {
  try {
    const { timeRange } = req.query;
    const analysis = await topologyService.analyzeTrafficPatterns(timeRange as string);
    
    res.json({
      success: true,
      data: analysis
    });
  } catch (error) {
    logger.error('Traffic analysis error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to analyze traffic patterns'
    });
  }
});

export default router;