import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.AUTOMATION_SERVICE_PORT || 3003;

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    service: 'automation-service',
    version: '2.1.4',
    timestamp: new Date().toISOString()
  });
});

// Automation rules endpoint
app.get('/api/v1/automation/rules', (req, res) => {
  res.json({
    success: true,
    data: [],
    timestamp: new Date().toISOString()
  });
});

// Webhook endpoints
app.get('/api/v1/automation/webhooks', (req, res) => {
  res.json({
    success: true,
    data: [],
    timestamp: new Date().toISOString()
  });
});

// Telegram bot endpoint
app.get('/api/v1/automation/telegram/status', (req, res) => {
  res.json({
    success: true,
    data: {
      bot_configured: false,
      bot_active: false,
      last_message: null
    },
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`✅ Automation Service running on port ${PORT}`);
});