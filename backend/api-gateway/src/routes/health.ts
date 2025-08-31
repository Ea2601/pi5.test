import express from 'express';
import { logger } from '../utils/logger';

const router = express.Router();

// Basic health check
router.get('/', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '2.1.4',
    uptime: process.uptime()
  });
});

// Database health check
router.get('/database', async (req, res) => {
  try {
    // Add actual database ping here
    res.json({
      success: true,
      status: 'healthy',
      database: 'postgresql',
      connection: 'active'
    });
  } catch (error) {
    logger.error('Database health check failed:', error);
    res.status(503).json({
      success: false,
      status: 'unhealthy',
      database: 'postgresql',
      connection: 'failed'
    });
  }
});

// Services health check
router.get('/services', async (req, res) => {
  const services = [
    { name: 'network-service', port: 3001 },
    { name: 'vpn-service', port: 3002 },
    { name: 'automation-service', port: 3003 }
  ];

  const serviceStatus = await Promise.all(
    services.map(async (service) => {
      try {
        const response = await fetch(`http://localhost:${service.port}/health`);
        return {
          name: service.name,
          status: response.ok ? 'healthy' : 'unhealthy',
          port: service.port
        };
      } catch (error) {
        return {
          name: service.name,
          status: 'unreachable',
          port: service.port
        };
      }
    })
  );

  const allHealthy = serviceStatus.every(s => s.status === 'healthy');

  res.status(allHealthy ? 200 : 503).json({
    success: allHealthy,
    services: serviceStatus
  });
});

export default router;