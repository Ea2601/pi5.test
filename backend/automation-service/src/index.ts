import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.AUTOMATION_SERVICE_PORT || 3003;

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    service: 'automation-service',
    version: '2.1.4',
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`✅ Automation Service running on port ${PORT}`);
});