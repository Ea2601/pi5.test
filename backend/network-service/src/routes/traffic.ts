import express from 'express';
import { logger } from '../utils/logger';

const router = express.Router();

// GET /traffic/rules - List traffic rules
router.get('/rules', async (req, res) => {
  try {
    // Mock traffic rules data
    const rules = [
      {
        id: '1',
        name: 'Gaming Priority',
        priority: 1,
        enabled: true,
        conditions: { device_type: 'Game Console' },
        actions: { qos_class: 'high', tunnel: 'wg-gaming' }
      },
      {
        id: '2', 
        name: 'Work Traffic',
        priority: 2,
        enabled: true,
        conditions: { client_group: 'work-devices' },
        actions: { tunnel: 'wg-office', dns: 'unbound' }
      }
    ];

    res.json({
      success: true,
      data: rules
    });
  } catch (error) {
    logger.error('Get traffic rules error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch traffic rules'
    });
  }
});

// POST /traffic/rules - Create traffic rule
router.post('/rules', async (req, res) => {
  try {
    const rule = {
      id: Date.now().toString(),
      ...req.body,
      created_at: new Date().toISOString()
    };

    res.status(201).json({
      success: true,
      data: rule
    });
  } catch (error) {
    logger.error('Create traffic rule error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create traffic rule'
    });
  }
});

export default router;