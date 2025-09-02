const express = require('express');
const cors = require('cors');
const Database = require('better-sqlite3');
const NodeCache = require('node-cache');

const app = express();
const PORT = 3000;

// Initialize in-memory cache (Redis alternative)
const cache = new NodeCache({ stdTTL: 600 });

// Initialize SQLite database (PostgreSQL alternative)
const db = new Database(':memory:');

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// System metrics endpoint
app.get('/api/v1/system/metrics', (req, res) => {
  try {
    const metrics = {
      cpu: { usage: Math.floor(Math.random() * 100), cores: 4 },
      memory: { total: 8192, used: Math.floor(Math.random() * 4096), free: 4096 },
      network: { 
        bytesIn: Math.floor(Math.random() * 1000000),
        bytesOut: Math.floor(Math.random() * 1000000),
        packetsIn: Math.floor(Math.random() * 10000),
        packetsOut: Math.floor(Math.random() * 10000)
      },
      timestamp: new Date().toISOString()
    };
    
    res.json(metrics);
  } catch (error) {
    console.error('Error getting system metrics:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Network devices endpoint
app.get('/api/v1/network/devices', (req, res) => {
  try {
    const devices = [
      {
        mac_address: '00:11:22:33:44:55',
        ip_address: '192.168.1.100',
        device_name: 'Router',
        device_type: 'PC',
        device_brand: 'Cisco',
        last_seen: new Date().toISOString(),
        is_active: true
      },
      {
        mac_address: '00:11:22:33:44:56',
        ip_address: '192.168.1.101',
        device_name: 'Laptop',
        device_type: 'PC',
        device_brand: 'Dell',
        last_seen: new Date().toISOString(),
        is_active: true
      }
    ];
    
    res.json(devices);
  } catch (error) {
    console.error('Error getting network devices:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Global error handler:', error);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.listen(PORT, () => {
  console.log(`API Gateway running on http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});

module.exports = app;