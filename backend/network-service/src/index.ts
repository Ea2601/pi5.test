import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.NETWORK_SERVICE_PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    service: 'network-service',
    version: '2.1.4',
    timestamp: new Date().toISOString()
  });
});

// Network device discovery
app.post('/api/v1/network/discover', (req, res) => {
  res.json({
    success: true,
    data: {
      discovered: 3,
      devices: [
        {
          mac_address: '00:11:22:33:44:66',
          ip_address: '192.168.1.110',
          device_name: 'Discovered Device',
          device_type: 'PC',
          is_active: true,
          last_seen: new Date().toISOString()
        }
      ]
    },
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`✅ Network Service running on port ${PORT}`);
});