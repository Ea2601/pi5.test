import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 3002;

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'vpn-service' });
});

app.listen(PORT, () => {
  console.log(`VPN Service running on port ${PORT}`);
});