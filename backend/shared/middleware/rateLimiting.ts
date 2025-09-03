import rateLimit from 'express-rate-limit';

export const generalRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP',
  standardHeaders: true,
  legacyHeaders: false
});

export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // limit auth attempts
  message: 'Too many authentication attempts',
  skipSuccessfulRequests: true
});