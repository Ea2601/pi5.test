import express from 'express';
import cors from 'cors';

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

// System metrics endpoint
app.get('/api/v1/system/metrics', (req, res) => {
  res.json({
    cpu: { usage: 45 },
    memory: { usage: 62, total: 8192, used: 5120 },
    disk: { usage: 78, total: 512000, used: 400000 },
    network: { bytesIn: 1048576, bytesOut: 524288 }
  });
});

// Network devices endpoint
app.get('/api/v1/network/devices', (req, res) => {
  res.json([
    {
      id: '1',
      name: 'Router',
      ip: '192.168.1.1',
      mac: '00:11:22:33:44:55',
      type: 'PC',
      status: 'active'
    }
  ]);
});

app.listen(port, () => {
  console.log(`API Gateway running on port ${port}`);
});