import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 3003;

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'automation-service' });
});

app.listen(PORT, () => {
  console.log(`Automation Service running on port ${PORT}`);
});