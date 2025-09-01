import express from 'express';

const router = express.Router();

router.get('/', (req, res) => {
  res.json({
    success: true,
    service: 'vpn-service',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '2.1.4',
    wireguard: {
      installed: true,
      version: '1.0.20210914',
      kernel_module: true
    }
  });
});

export default router;