import express from 'express';

const router = express.Router();

router.get('/', (req, res) => {
  res.json({
    success: true,
    service: 'automation-service',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '2.1.4',
    integrations: {
      telegram: !!process.env.TELEGRAM_BOT_TOKEN,
      webhooks: !!process.env.WEBHOOK_BASE_URL
    }
  });
});

export default router;