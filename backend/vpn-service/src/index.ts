import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.VPN_SERVICE_PORT || 3002;

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    service: 'vpn-service',
    version: '2.1.4',
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`✅ VPN Service running on port ${PORT}`);
});