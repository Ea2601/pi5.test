import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());
app.use(cors());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    service: 'api-gateway'
  });
});

// System metrics endpoint
app.get('/api/v1/system/metrics', (req, res) => {
  try {
    const metrics = {
      cpu: {
        usage: Math.random() * 100,
        cores: 4
      },
      memory: {
        total: 8192,
        used: Math.random() * 4096,
        free: 4096 - Math.random() * 2048
      },
      network: {
        bytesIn: Math.floor(Math.random() * 1000000),
        bytesOut: Math.floor(Math.random() * 1000000)
      },
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    };
    
    res.json(metrics);
  } catch (error) {
    console.error('Error fetching system metrics:', error);
    res.status(500).json({ error: 'Failed to fetch system metrics' });
  }
});

// Network devices endpoint
app.get('/api/v1/network/devices', (req, res) => {
  try {
    const devices = [
      {
        id: '1',
        name: 'Router',
        ip: '192.168.1.1',
        mac: '00:11:22:33:44:55',
        type: 'Router',
        status: 'online'
      },
      {
        id: '2', 
        name: 'Pi5 Supernode',
        ip: '192.168.1.100',
        mac: '11:22:33:44:55:66',
        type: 'Server',
        status: 'online'
      }
    ];
    
    res.json(devices);
  } catch (error) {
    console.error('Error fetching network devices:', error);
    res.status(500).json({ error: 'Failed to fetch network devices' });
  }
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global error handler
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Global error handler:', error);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
});