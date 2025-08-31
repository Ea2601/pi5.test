import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { logger } from './utils/logger';
import deviceRoutes from './routes/devices';
import trafficRoutes from './routes/traffic';
import healthRoutes from './routes/health';

dotenv.config();

const app = express();
const PORT = process.env.NETWORK_SERVICE_PORT || 3001;

app.use(cors());
app.use(express.json());

// Logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, { service: 'network' });
  next();
});

// Routes
app.use('/health', healthRoutes);
app.use('/devices', deviceRoutes);
app.use('/traffic', trafficRoutes);

app.listen(PORT, () => {
  logger.info(`Network Service running on port ${PORT}`);
});

export default app;