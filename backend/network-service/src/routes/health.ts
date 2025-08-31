import express from 'express';

const router = express.Router();

router.get('/', (req, res) => {
  res.json({
    success: true,
    service: 'network-service',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '2.1.4'
  });
});

export default router;