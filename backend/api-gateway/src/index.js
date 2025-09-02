const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.API_GATEWAY_PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    service: 'api-gateway',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '2.1.4'
  });
});

// System metrics endpoint
app.get('/api/v1/system/metrics', (req, res) => {
  try {
    // Mock system metrics for now
    const metrics = {
      cpu: Math.floor(Math.random() * 60) + 20, // 20-80%
      memory: Math.floor(Math.random() * 40) + 30, // 30-70%
      disk: Math.floor(Math.random() * 30) + 50, // 50-80%
      network: {
        upload: Math.floor(Math.random() * 100) + 10,
        download: Math.floor(Math.random() * 200) + 50
      },
      temperature: Math.floor(Math.random() * 20) + 45, // 45-65°C
      uptime: Math.floor(Date.now() / 1000) - Math.floor(Math.random() * 86400 * 7) // Random uptime up to 7 days
    };

    res.json({
      success: true,
      data: metrics,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('System metrics error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch system metrics',
      timestamp: new Date().toISOString()
    });
  }
});

// Network devices endpoint
app.get('/api/v1/network/devices', (req, res) => {
  try {
    // Mock network devices
    const devices = [
      {
        mac_address: '00:1A:2B:3C:4D:5E',
        ip_address: '192.168.1.101',
        device_name: 'iPhone 14 Pro',
        device_type: 'Mobile',
        device_brand: 'Apple',
        is_active: true,
        last_seen: new Date().toISOString(),
        first_discovered: new Date(Date.now() - 86400000 * 2).toISOString(),
        created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        mac_address: '00:1A:2B:3C:4D:5F',
        ip_address: '192.168.1.102',
        device_name: 'MacBook Pro M2',
        device_type: 'PC',
        device_brand: 'Apple',
        is_active: true,
        last_seen: new Date().toISOString(),
        first_discovered: new Date(Date.now() - 86400000 * 5).toISOString(),
        created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
        updated_at: new Date().toISOString()
      }
    ];

    res.json({
      success: true,
      data: devices,
      total: devices.length,
      active: devices.filter(d => d.is_active).length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Network devices error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch network devices',
      timestamp: new Date().toISOString()
    });
  }
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    path: req.originalUrl,
    timestamp: new Date().toISOString()
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Global error handler:', error);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`API Gateway running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});