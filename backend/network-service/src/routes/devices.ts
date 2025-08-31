import express from 'express';
import Joi from 'joi';
import { DeviceService } from '../services/DeviceService';
import { logger } from '../utils/logger';

const router = express.Router();
const deviceService = new DeviceService();

// Validation schemas
const deviceSchema = Joi.object({
  mac_address: Joi.string().pattern(/^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/).required(),
  ip_address: Joi.string().ip().optional(),
  device_name: Joi.string().max(255).optional(),
  device_type: Joi.string().valid('Mobile', 'PC', 'IoT', 'Game Console').optional(),
  device_brand: Joi.string().max(255).optional()
});

const updateDeviceSchema = Joi.object({
  ip_address: Joi.string().ip().optional(),
  device_name: Joi.string().max(255).optional(),
  device_type: Joi.string().valid('Mobile', 'PC', 'IoT', 'Game Console').optional(),
  device_brand: Joi.string().max(255).optional(),
  is_active: Joi.boolean().optional()
});

// GET /devices - List all devices
router.get('/', async (req, res) => {
  try {
    const { active, type, search } = req.query;
    const devices = await deviceService.getDevices({
      active: active === 'true' ? true : active === 'false' ? false : undefined,
      type: type as string,
      search: search as string
    });

    res.json({
      success: true,
      data: devices,
      total: devices.length,
      active: devices.filter(d => d.is_active).length
    });
  } catch (error) {
    logger.error('Get devices error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch devices'
    });
  }
});

// GET /devices/:mac - Get specific device
router.get('/:mac', async (req, res) => {
  try {
    const device = await deviceService.getDeviceByMac(req.params.mac);
    
    if (!device) {
      return res.status(404).json({
        success: false,
        message: 'Device not found'
      });
    }

    res.json({
      success: true,
      data: device
    });
  } catch (error) {
    logger.error('Get device error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch device'
    });
  }
});

// POST /devices - Add new device
router.post('/', async (req, res) => {
  try {
    const { error } = deviceSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    const device = await deviceService.createDevice(req.body);
    
    res.status(201).json({
      success: true,
      data: device
    });
  } catch (error) {
    logger.error('Create device error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create device'
    });
  }
});

// PUT /devices/:mac - Update device
router.put('/:mac', async (req, res) => {
  try {
    const { error } = updateDeviceSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    const device = await deviceService.updateDevice(req.params.mac, req.body);
    
    if (!device) {
      return res.status(404).json({
        success: false,
        message: 'Device not found'
      });
    }

    res.json({
      success: true,
      data: device
    });
  } catch (error) {
    logger.error('Update device error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update device'
    });
  }
});

// DELETE /devices/:mac - Remove device
router.delete('/:mac', async (req, res) => {
  try {
    const success = await deviceService.deleteDevice(req.params.mac);
    
    if (!success) {
      return res.status(404).json({
        success: false,
        message: 'Device not found'
      });
    }

    res.json({
      success: true,
      message: 'Device deleted successfully'
    });
  } catch (error) {
    logger.error('Delete device error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete device'
    });
  }
});

// POST /devices/:mac/wake - Wake on LAN
router.post('/:mac/wake', async (req, res) => {
  try {
    await deviceService.wakeDevice(req.params.mac);
    
    res.json({
      success: true,
      message: 'Wake on LAN packet sent'
    });
  } catch (error) {
    logger.error('Wake device error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to wake device'
    });
  }
});

export default router;