import express from 'express';
import Joi from 'joi';
import { WireGuardServerService } from '../services/WireGuardServerService';
import { logger } from '../utils/logger';

const router = express.Router();
const serverService = new WireGuardServerService();

// Validation schemas
const serverSchema = Joi.object({
  name: Joi.string().min(1).max(255).required(),
  description: Joi.string().max(500).optional(),
  interface_name: Joi.string().pattern(/^wg[0-9]+$/).required(),
  listen_port: Joi.number().integer().min(1024).max(65535).required(),
  network_cidr: Joi.string().pattern(/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\/\d{1,2}$/).required(),
  endpoint: Joi.string().optional(),
  dns_servers: Joi.array().items(Joi.string().ip()).optional(),
  max_clients: Joi.number().integer().min(1).max(1000).default(100)
});

const serverUpdateSchema = Joi.object({
  name: Joi.string().min(1).max(255).optional(),
  description: Joi.string().max(500).optional(),
  endpoint: Joi.string().optional(),
  dns_servers: Joi.array().items(Joi.string().ip()).optional(),
  max_clients: Joi.number().integer().min(1).max(1000).optional(),
  is_active: Joi.boolean().optional()
});

// GET /servers - List all servers
router.get('/', async (req, res) => {
  try {
    const servers = await serverService.getAllServers();
    res.json({
      success: true,
      data: servers
    });
  } catch (error) {
    logger.error('Get servers error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch servers'
    });
  }
});

// GET /servers/:id - Get specific server
router.get('/:id', async (req, res) => {
  try {
    const server = await serverService.getServerById(req.params.id);
    
    if (!server) {
      return res.status(404).json({
        success: false,
        message: 'Server not found'
      });
    }

    res.json({
      success: true,
      data: server
    });
  } catch (error) {
    logger.error('Get server error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch server'
    });
  }
});

// POST /servers - Create new server
router.post('/', async (req, res) => {
  try {
    const { error } = serverSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    const server = await serverService.createServer(req.body);
    
    res.status(201).json({
      success: true,
      data: server
    });
  } catch (error) {
    logger.error('Create server error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create server'
    });
  }
});

// PUT /servers/:id - Update server
router.put('/:id', async (req, res) => {
  try {
    const { error } = serverUpdateSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    const server = await serverService.updateServer(req.params.id, req.body);
    
    if (!server) {
      return res.status(404).json({
        success: false,
        message: 'Server not found'
      });
    }

    res.json({
      success: true,
      data: server
    });
  } catch (error) {
    logger.error('Update server error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update server'
    });
  }
});

// DELETE /servers/:id - Delete server
router.delete('/:id', async (req, res) => {
  try {
    const success = await serverService.deleteServer(req.params.id);
    
    if (!success) {
      return res.status(404).json({
        success: false,
        message: 'Server not found'
      });
    }

    res.json({
      success: true,
      message: 'Server deleted successfully'
    });
  } catch (error) {
    logger.error('Delete server error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete server'
    });
  }
});

// POST /servers/:id/toggle - Start/Stop server
router.post('/:id/toggle', async (req, res) => {
  try {
    const server = await serverService.toggleServer(req.params.id);
    
    res.json({
      success: true,
      data: server,
      message: `Server ${server.is_active ? 'started' : 'stopped'} successfully`
    });
  } catch (error) {
    logger.error('Toggle server error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle server'
    });
  }
});

export default router;