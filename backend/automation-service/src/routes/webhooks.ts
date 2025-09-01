import express from 'express';
import { WebhookService } from '../services/WebhookService';
import { logger } from '../utils/logger';

const router = express.Router();
const webhookService = new WebhookService();

// POST /webhooks/send - Send webhook
router.post('/send', async (req, res) => {
  try {
    const { url, data, headers } = req.body;
    
    if (!url) {
      return res.status(400).json({
        success: false,
        message: 'Webhook URL is required'
      });
    }

    const result = await webhookService.sendWebhook(url, data, headers);
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    logger.error('Send webhook error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send webhook'
    });
  }
});

// POST /webhooks/test - Test webhook configuration
router.post('/test', async (req, res) => {
  try {
    const { url } = req.body;
    
    if (!url) {
      return res.status(400).json({
        success: false,
        message: 'Webhook URL is required'
      });
    }

    const testPayload = {
      event: 'test',
      timestamp: new Date().toISOString(),
      source: 'pi5-supernode',
      data: {
        message: 'Test webhook from Pi5 Supernode'
      }
    };

    const result = await webhookService.sendWebhook(url, testPayload);
    
    res.json({
      success: true,
      message: 'Test webhook sent successfully',
      data: result
    });
  } catch (error) {
    logger.error('Test webhook error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send test webhook'
    });
  }
});

export default router;