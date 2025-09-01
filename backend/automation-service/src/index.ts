import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { logger } from './utils/logger';
import rulesRoutes from './routes/rules';
import webhooksRoutes from './routes/webhooks';
import telegramRoutes from './routes/telegram';
import healthRoutes from './routes/health';

dotenv.config();

const app = express();
const PORT = process.env.AUTOMATION_SERVICE_PORT || 3003;

app.use(cors());
app.use(express.json());

// Logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, { service: 'automation' });
  next();
});

// Routes
app.use('/health', healthRoutes);
app.use('/rules', rulesRoutes);
app.use('/webhooks', webhooksRoutes);
app.use('/telegram', telegramRoutes);

app.listen(PORT, () => {
  logger.info(`Automation Service running on port ${PORT}`);
});

export default app;