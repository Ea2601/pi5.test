import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// System metrics endpoint
app.get('/api/v1/system/metrics', (req, res) => {
  res.json({
    cpu: Math.random() * 100,
    memory: Math.random() * 100,
    disk: Math.random() * 100,
    network: {
      received: Math.floor(Math.random() * 1000000),
      transmitted: Math.floor(Math.random() * 1000000)
    },
    timestamp: new Date().toISOString()
  });
});

// Health check endpoint
app.get('/api/v1/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
});