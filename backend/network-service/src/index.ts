import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'network-service' });
});

app.listen(PORT, () => {
  console.log(`Network Service running on port ${PORT}`);
});