import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { createProxyMiddleware } from 'http-proxy-middleware';
import dotenv from 'dotenv';
import { authMiddleware } from './middleware/auth';
import { errorHandler } from './middleware/errorHandler';
import { logger } from './utils/logger';
import authRoutes from './routes/auth';
import healthRoutes from './routes/health';

dotenv.config();

const app = express();
const PORT = process.env.API_GATEWAY_PORT || 3000;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP'
});
app.use(limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });
  next();
});

// Health check routes (no auth required)
app.use('/health', healthRoutes);

// Authentication routes
app.use('/api/v1/auth', authRoutes);

// Protected routes middleware
app.use('/api/v1', authMiddleware);

// Service proxies
app.use('/api/v1/network', createProxyMiddleware({
  target: `http://localhost:${process.env.NETWORK_SERVICE_PORT || 3001}`,
  changeOrigin: true,
  pathRewrite: { '^/api/v1/network': '' }
}));

app.use('/api/v1/vpn', createProxyMiddleware({
  target: `http://localhost:${process.env.VPN_SERVICE_PORT || 3002}`,
  changeOrigin: true,
  pathRewrite: { '^/api/v1/vpn': '' }
}));

app.use('/api/v1/automation', createProxyMiddleware({
  target: `http://localhost:${process.env.AUTOMATION_SERVICE_PORT || 3003}`,
  changeOrigin: true,
  pathRewrite: { '^/api/v1/automation': '' }
}));

// Error handling
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found'
  });
});

app.listen(PORT, () => {
  logger.info(`API Gateway running on port ${PORT}`);
});

export default app;