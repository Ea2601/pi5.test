import express from 'express';
import Joi from 'joi';
import { AutomationRuleService } from '../services/AutomationRuleService';
import { logger } from '../utils/logger';

const router = express.Router();
const ruleService = new AutomationRuleService();

// Validation schemas
const ruleSchema = Joi.object({
  name: Joi.string().min(1).max(255).required(),
  description: Joi.string().max(500).optional(),
  triggers: Joi.array().items(Joi.object()).min(1).required(),
  actions: Joi.array().items(Joi.object()).min(1).required(),
  enabled: Joi.boolean().default(true),
  priority: Joi.number().integer().min(1).max(100).default(50)
});

// GET /rules - List all automation rules
router.get('/', async (req, res) => {
  try {
    const rules = await ruleService.getAllRules();
    res.json({
      success: true,
      data: rules
    });
  } catch (error) {
    logger.error('Get rules error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch automation rules'
    });
  }
});

// POST /rules - Create new rule
router.post('/', async (req, res) => {
  try {
    const { error } = ruleSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    const rule = await ruleService.createRule(req.body);
    
    res.status(201).json({
      success: true,
      data: rule
    });
  } catch (error) {
    logger.error('Create rule error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create rule'
    });
  }
});

// PUT /rules/:id - Update rule
router.put('/:id', async (req, res) => {
  try {
    const rule = await ruleService.updateRule(req.params.id, req.body);
    
    if (!rule) {
      return res.status(404).json({
        success: false,
        message: 'Rule not found'
      });
    }

    res.json({
      success: true,
      data: rule
    });
  } catch (error) {
    logger.error('Update rule error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update rule'
    });
  }
});

// DELETE /rules/:id - Delete rule
router.delete('/:id', async (req, res) => {
  try {
    const success = await ruleService.deleteRule(req.params.id);
    
    if (!success) {
      return res.status(404).json({
        success: false,
        message: 'Rule not found'
      });
    }

    res.json({
      success: true,
      message: 'Rule deleted successfully'
    });
  } catch (error) {
    logger.error('Delete rule error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete rule'
    });
  }
});

// POST /rules/:id/toggle - Enable/Disable rule
router.post('/:id/toggle', async (req, res) => {
  try {
    const rule = await ruleService.toggleRule(req.params.id);
    
    res.json({
      success: true,
      data: rule,
      message: `Rule ${rule.enabled ? 'enabled' : 'disabled'} successfully`
    });
  } catch (error) {
    logger.error('Toggle rule error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle rule'
    });
  }
});

export default router;