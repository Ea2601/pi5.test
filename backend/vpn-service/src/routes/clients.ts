import express from 'express';
import Joi from 'joi';
import { WireGuardClientService } from '../services/WireGuardClientService';
import { logger } from '../utils/logger';

const router = express.Router();
const clientService = new WireGuardClientService();

// Validation schemas
const clientSchema = Joi.object({
  server_id: Joi.string().uuid().required(),
  name: Joi.string().min(1).max(255).required(),
  description: Joi.string().max(500).optional(),
  allowed_ips: Joi.string().default('0.0.0.0/0'),
  persistent_keepalive: Joi.number().integer().min(0).max(3600).default(25),
  client_group_id: Joi.string().uuid().optional()
});

const clientUpdateSchema = Joi.object({
  name: Joi.string().min(1).max(255).optional(),
  description: Joi.string().max(500).optional(),
  allowed_ips: Joi.string().optional(),
  persistent_keepalive: Joi.number().integer().min(0).max(3600).optional(),
  is_enabled: Joi.boolean().optional(),
  client_group_id: Joi.string().uuid().allow(null).optional()
});

// GET /clients - List all clients
router.get('/', async (req, res) => {
  try {
    const { server_id } = req.query;
    const clients = await clientService.getAllClients(server_id as string);
    
    res.json({
      success: true,
      data: clients
    });
  } catch (error) {
    logger.error('Get clients error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch clients'
    });
  }
});

// POST /clients - Create new client
router.post('/', async (req, res) => {
  try {
    const { error } = clientSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    const client = await clientService.createClient(req.body);
    
    res.status(201).json({
      success: true,
      data: client
    });
  } catch (error) {
    logger.error('Create client error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create client'
    });
  }
});

// PUT /clients/:id - Update client
router.put('/:id', async (req, res) => {
  try {
    const { error } = clientUpdateSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    const client = await clientService.updateClient(req.params.id, req.body);
    
    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found'
      });
    }

    res.json({
      success: true,
      data: client
    });
  } catch (error) {
    logger.error('Update client error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update client'
    });
  }
});

// DELETE /clients/:id - Delete client
router.delete('/:id', async (req, res) => {
  try {
    const success = await clientService.deleteClient(req.params.id);
    
    if (!success) {
      return res.status(404).json({
        success: false,
        message: 'Client not found'
      });
    }

    res.json({
      success: true,
      message: 'Client deleted successfully'
    });
  } catch (error) {
    logger.error('Delete client error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete client'
    });
  }
});

// POST /clients/:id/toggle - Enable/Disable client
router.post('/:id/toggle', async (req, res) => {
  try {
    const client = await clientService.toggleClient(req.params.id);
    
    res.json({
      success: true,
      data: client,
      message: `Client ${client.is_enabled ? 'enabled' : 'disabled'} successfully`
    });
  } catch (error) {
    logger.error('Toggle client error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle client'
    });
  }
});

// GET /clients/:id/config - Generate client configuration
router.get('/:id/config', async (req, res) => {
  try {
    const config = await clientService.generateClientConfig(req.params.id);
    
    res.json({
      success: true,
      data: config
    });
  } catch (error) {
    logger.error('Generate config error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate configuration'
    });
  }
});

// POST /clients/bulk/enable - Bulk enable clients
router.post('/bulk/enable', async (req, res) => {
  try {
    const { client_ids } = req.body;
    
    if (!Array.isArray(client_ids)) {
      return res.status(400).json({
        success: false,
        message: 'client_ids must be an array'
      });
    }

    await clientService.bulkEnableClients(client_ids);
    
    res.json({
      success: true,
      message: `${client_ids.length} clients enabled successfully`
    });
  } catch (error) {
    logger.error('Bulk enable error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to enable clients'
    });
  }
});

// POST /clients/bulk/disable - Bulk disable clients
router.post('/bulk/disable', async (req, res) => {
  try {
    const { client_ids } = req.body;
    
    if (!Array.isArray(client_ids)) {
      return res.status(400).json({
        success: false,
        message: 'client_ids must be an array'
      });
    }

    await clientService.bulkDisableClients(client_ids);
    
    res.json({
      success: true,
      message: `${client_ids.length} clients disabled successfully`
    });
  } catch (error) {
    logger.error('Bulk disable error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to disable clients'
    });
  }
});

export default router;