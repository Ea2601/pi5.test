import express from 'express';
import { TelegramService } from '../services/TelegramService';
import { logger } from '../utils/logger';

const router = express.Router();
const telegramService = new TelegramService();

// POST /telegram/send - Send Telegram message
router.post('/send', async (req, res) => {
  try {
    const { message, chat_id } = req.body;
    
    if (!message) {
      return res.status(400).json({
        success: false,
        message: 'Message is required'
      });
    }

    const result = await telegramService.sendMessage(message, chat_id);
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    logger.error('Send telegram message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send telegram message'
    });
  }
});

// POST /telegram/test - Test Telegram bot
router.post('/test', async (req, res) => {
  try {
    const testMessage = `🤖 Test mesajı Pi5 Supernode'dan\n\n⏰ Zaman: ${new Date().toLocaleString('tr-TR')}\n🔧 Sistem: Otomatik test\n✅ Durum: Başarılı`;
    
    const result = await telegramService.sendMessage(testMessage);
    
    res.json({
      success: true,
      message: 'Test message sent successfully',
      data: result
    });
  } catch (error) {
    logger.error('Test telegram error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send test message'
    });
  }
});

// GET /telegram/status - Get bot status
router.get('/status', async (req, res) => {
  try {
    const status = await telegramService.getBotInfo();
    
    res.json({
      success: true,
      data: status
    });
  } catch (error) {
    logger.error('Get telegram status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get bot status'
    });
  }
});

export default router;