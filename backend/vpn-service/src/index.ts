import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { logger } from './utils/logger';
import serverRoutes from './routes/servers';
import clientRoutes from './routes/clients';
import healthRoutes from './routes/health';

dotenv.config();

const app = express();
const PORT = process.env.VPN_SERVICE_PORT || 3002;

app.use(cors());
app.use(express.json());

// Logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, { service: 'vpn' });
  next();
});

// Routes
app.use('/health', healthRoutes);
app.use('/servers', serverRoutes);
app.use('/clients', clientRoutes);

app.listen(PORT, () => {
  logger.info(`VPN Service running on port ${PORT}`);
});

export default app;