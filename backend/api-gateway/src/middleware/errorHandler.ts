import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

interface ErrorWithStatus extends Error {
  status?: number;
  statusCode?: number;
}

export const errorHandler = (
  err: ErrorWithStatus,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.error('Error caught by middleware:', {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip
  });

  const status = err.status || err.statusCode || 500;
  const message = status === 500 ? 'Internal Server Error' : err.message;

  res.status(status).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};