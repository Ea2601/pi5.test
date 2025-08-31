import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Joi from 'joi';
import { logger } from '../utils/logger';

const router = express.Router();

// Temporary user store (replace with database)
const users = [
  {
    id: '1',
    email: 'admin@pi5supernode.local',
    password: '$2a$10$rOzJq1YWQLGqxwKdcGxUxOv7P2D8K9LkQxLj8HzN1nQzFmKjHpYqS', // 'admin123'
    role: 'admin'
  }
];

// Validation schemas
const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required()
});

const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid('admin', 'user').default('user')
});

// Login endpoint
router.post('/login', async (req, res) => {
  try {
    const { error } = loginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    const { email, password } = req.body;
    const user = users.find(u => u.email === email);

    if (!user || !await bcrypt.compare(password, user.password)) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        role: user.role 
      },
      process.env.JWT_SECRET!,
      { expiresIn: '24h' }
    );

    logger.info(`User logged in: ${user.email}`);

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Register endpoint
router.post('/register', async (req, res) => {
  try {
    const { error } = registerSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    const { email, password, role } = req.body;
    
    // Check if user already exists
    if (users.find(u => u.email === email)) {
      return res.status(409).json({
        success: false,
        message: 'User already exists'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create new user
    const newUser = {
      id: Date.now().toString(),
      email,
      password: hashedPassword,
      role: role || 'user'
    };
    
    users.push(newUser);

    const token = jwt.sign(
      { 
        id: newUser.id, 
        email: newUser.email, 
        role: newUser.role 
      },
      process.env.JWT_SECRET!,
      { expiresIn: '24h' }
    );

    logger.info(`New user registered: ${newUser.email}`);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        role: newUser.role
      }
    });
  } catch (error) {
    logger.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Verify token endpoint
router.get('/verify', (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    
    res.json({
      success: true,
      user: {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role
      }
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
});

export default router;