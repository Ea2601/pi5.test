import express from 'express';
import Joi from 'joi';
import { EnhancedTrafficService } from '../services/EnhancedTrafficService';
import { logger } from '../utils/logger';

const router = express.Router();
const trafficService = new EnhancedTrafficService();

// Validation schemas
const trafficMatcherSchema = Joi.object({
  name: Joi.string().min(1).max(255).required(),
  description: Joi.string().max(500).optional(),
  protocols: Joi.array().items(Joi.string().valid('tcp', 'udp', 'http', 'https', 'sip', 'rtp', 'stun', 'quic')).default([]),
  applications: Joi.array().items(Joi.string().valid('whatsapp', 'telegram', 'facetime', 'zoom', 'edge', 'chrome', 'psn', 'xbox', 'steam', 'netflix', 'youtube')).default([]),
  ports: Joi.array().items(Joi.string()).default([]),
  domains: Joi.array().items(Joi.string()).default([])
});

const clientGroupSchema = Joi.object({
  name: Joi.string().min(1).max(255).required(),
  description: Joi.string().max(500).optional(),
  group_type: Joi.string().valid('vlan', 'wireguard', 'custom').required(),
  vlan_id: Joi.number().integer().min(1).max(4094).when('group_type', { is: 'vlan', then: Joi.required() }),
  wg_client_ids: Joi.array().items(Joi.string().uuid()).when('group_type', { is: 'wireguard', then: Joi.required() }),
  mac_addresses: Joi.array().items(Joi.string()).when('group_type', { is: 'custom', then: Joi.optional() }),
  ip_ranges: Joi.array().items(Joi.string()).when('group_type', { is: 'custom', then: Joi.optional() })
});

const dnsPolicySchema = Joi.object({
  name: Joi.string().min(1).max(255).required(),
  description: Joi.string().max(500).optional(),
  policy_type: Joi.string().valid('pihole_unbound', 'bypass', 'custom', 'default').required(),
  pihole_enabled: Joi.boolean().default(false),
  unbound_enabled: Joi.boolean().default(false),
  ad_blocking: Joi.boolean().default(false),
  malware_blocking: Joi.boolean().default(false),
  custom_resolvers: Joi.array().items(Joi.string().ip()).optional(),
  doh_enabled: Joi.boolean().default(false),
  doh_url: Joi.string().uri().optional(),
  use_egress_dns: Joi.boolean().default(false)
});

const egressPointSchema = Joi.object({
  name: Joi.string().min(1).max(255).required(),
  description: Joi.string().max(500).optional(),
  egress_type: Joi.string().valid('local_internet', 'wireguard').required(),
  isp_name: Joi.string().when('egress_type', { is: 'local_internet', then: Joi.optional() }),
  wg_connection_name: Joi.string().when('egress_type', { is: 'wireguard', then: Joi.required() }),
  wg_endpoint: Joi.string().when('egress_type', { is: 'wireguard', then: Joi.optional() }),
  latency_ms: Joi.number().integer().min(0).default(0),
  bandwidth_mbps: Joi.number().integer().min(0).default(0),
  reliability_score: Joi.number().min(0).max(1).default(1.0)
});

const enhancedTrafficRuleSchema = Joi.object({
  name: Joi.string().min(1).max(255).required(),
  description: Joi.string().max(500).optional(),
  priority: Joi.number().integer().min(1).max(100).default(50),
  client_group_ids: Joi.array().items(Joi.string().uuid()).min(1).required(),
  traffic_matcher_ids: Joi.array().items(Joi.string().uuid()).min(1).required(),
  dns_policy_id: Joi.string().uuid().optional(),
  egress_point_id: Joi.string().uuid().required(),
  qos_enabled: Joi.boolean().default(false),
  bandwidth_limit_mbps: Joi.number().integer().min(1).optional(),
  latency_priority: Joi.string().valid('low', 'normal', 'high', 'critical').default('normal'),
  dpi_inspection: Joi.boolean().default(false),
  logging_enabled: Joi.boolean().default(true)
});

// GET /enhanced-traffic/rules - List all enhanced traffic rules
router.get('/rules', async (req, res) => {
  try {
    const rules = await trafficService.getAllRules();
    res.json({
      success: true,
      data: rules
    });
  } catch (error) {
    logger.error('Get enhanced traffic rules error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch enhanced traffic rules'
    });
  }
});

// POST /enhanced-traffic/rules - Create enhanced traffic rule
router.post('/rules', async (req, res) => {
  try {
    const { error } = enhancedTrafficRuleSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    const rule = await trafficService.createRule(req.body);
    
    res.status(201).json({
      success: true,
      data: rule
    });
  } catch (error) {
    logger.error('Create enhanced traffic rule error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create enhanced traffic rule'
    });
  }
});

// PUT /enhanced-traffic/rules/:id - Update enhanced traffic rule
router.put('/rules/:id', async (req, res) => {
  try {
    const rule = await trafficService.updateRule(req.params.id, req.body);
    
    if (!rule) {
      return res.status(404).json({
        success: false,
        message: 'Enhanced traffic rule not found'
      });
    }

    res.json({
      success: true,
      data: rule
    });
  } catch (error) {
    logger.error('Update enhanced traffic rule error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update enhanced traffic rule'
    });
  }
});

// DELETE /enhanced-traffic/rules/:id - Delete enhanced traffic rule
router.delete('/rules/:id', async (req, res) => {
  try {
    const success = await trafficService.deleteRule(req.params.id);
    
    if (!success) {
      return res.status(404).json({
        success: false,
        message: 'Enhanced traffic rule not found'
      });
    }

    res.json({
      success: true,
      message: 'Enhanced traffic rule deleted successfully'
    });
  } catch (error) {
    logger.error('Delete enhanced traffic rule error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete enhanced traffic rule'
    });
  }
});

// GET /enhanced-traffic/matchers - List traffic matchers
router.get('/matchers', async (req, res) => {
  try {
    const matchers = await trafficService.getMatchers();
    res.json({
      success: true,
      data: matchers
    });
  } catch (error) {
    logger.error('Get traffic matchers error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch traffic matchers'
    });
  }
});

// POST /enhanced-traffic/matchers - Create traffic matcher
router.post('/matchers', async (req, res) => {
  try {
    const { error } = trafficMatcherSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    const matcher = await trafficService.createMatcher(req.body);
    
    res.status(201).json({
      success: true,
      data: matcher
    });
  } catch (error) {
    logger.error('Create traffic matcher error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create traffic matcher'
    });
  }
});

// GET /enhanced-traffic/client-groups - List client groups
router.get('/client-groups', async (req, res) => {
  try {
    const groups = await trafficService.getClientGroups();
    res.json({
      success: true,
      data: groups
    });
  } catch (error) {
    logger.error('Get client groups error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch client groups'
    });
  }
});

// POST /enhanced-traffic/client-groups - Create client group
router.post('/client-groups', async (req, res) => {
  try {
    const { error } = clientGroupSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    const group = await trafficService.createClientGroup(req.body);
    
    res.status(201).json({
      success: true,
      data: group
    });
  } catch (error) {
    logger.error('Create client group error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create client group'
    });
  }
});

// GET /enhanced-traffic/dns-policies - List DNS policies
router.get('/dns-policies', async (req, res) => {
  try {
    const policies = await trafficService.getDNSPolicies();
    res.json({
      success: true,
      data: policies
    });
  } catch (error) {
    logger.error('Get DNS policies error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch DNS policies'
    });
  }
});

// POST /enhanced-traffic/dns-policies - Create DNS policy
router.post('/dns-policies', async (req, res) => {
  try {
    const { error } = dnsPolicySchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    const policy = await trafficService.createDNSPolicy(req.body);
    
    res.status(201).json({
      success: true,
      data: policy
    });
  } catch (error) {
    logger.error('Create DNS policy error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create DNS policy'
    });
  }
});

// GET /enhanced-traffic/egress-points - List egress points
router.get('/egress-points', async (req, res) => {
  try {
    const points = await trafficService.getEgressPoints();
    res.json({
      success: true,
      data: points
    });
  } catch (error) {
    logger.error('Get egress points error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch egress points'
    });
  }
});

// POST /enhanced-traffic/egress-points - Create egress point
router.post('/egress-points', async (req, res) => {
  try {
    const { error } = egressPointSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    const point = await trafficService.createEgressPoint(req.body);
    
    res.status(201).json({
      success: true,
      data: point
    });
  } catch (error) {
    logger.error('Create egress point error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create egress point'
    });
  }
});

// GET /enhanced-traffic/live-view - Live traffic monitoring
router.get('/live-view', async (req, res) => {
  try {
    const liveView = await trafficService.getLiveTrafficView();
    res.json({
      success: true,
      data: liveView
    });
  } catch (error) {
    logger.error('Get live traffic view error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch live traffic view'
    });
  }
});

// GET /enhanced-traffic/analytics - Traffic analytics
router.get('/analytics', async (req, res) => {
  try {
    const { timeRange } = req.query;
    const analytics = await trafficService.getTrafficAnalytics(timeRange as string);
    
    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    logger.error('Get traffic analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch traffic analytics'
    });
  }
});

// POST /enhanced-traffic/apply-configuration - Apply traffic configuration
router.post('/apply-configuration', async (req, res) => {
  try {
    const result = await trafficService.applyConfiguration();
    
    res.json({
      success: result.success,
      errors: result.errors,
      applied_rules: result.applied_rules,
      message: result.success ? 'Traffic configuration applied successfully' : 'Configuration applied with errors'
    });
  } catch (error) {
    logger.error('Apply traffic configuration error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to apply traffic configuration'
    });
  }
});

// POST /enhanced-traffic/validate-rules - Validate rule configuration
router.post('/validate-rules', async (req, res) => {
  try {
    const { rules } = req.body;
    const validation = await trafficService.validateRules(rules);
    
    res.json({
      success: true,
      data: validation
    });
  } catch (error) {
    logger.error('Validate rules error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to validate rules'
    });
  }
});

// GET /enhanced-traffic/presets - Get rule presets
router.get('/presets', async (req, res) => {
  try {
    const presets = await trafficService.getRulePresets();
    res.json({
      success: true,
      data: presets
    });
  } catch (error) {
    logger.error('Get rule presets error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch rule presets'
    });
  }
});

// POST /enhanced-traffic/presets/:name/apply - Apply rule preset
router.post('/presets/:name/apply', async (req, res) => {
  try {
    const result = await trafficService.applyRulePreset(req.params.name);
    
    res.json({
      success: true,
      data: result,
      message: `Applied ${result.rules_created} rules from preset ${req.params.name}`
    });
  } catch (error) {
    logger.error('Apply rule preset error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to apply rule preset'
    });
  }
});

// GET /enhanced-traffic/matches - Get recent rule matches
router.get('/matches', async (req, res) => {
  try {
    const { rule_id, client_ip, limit } = req.query;
    const matches = await trafficService.getRuleMatches({
      rule_id: rule_id as string,
      client_ip: client_ip as string,
      limit: limit ? parseInt(limit as string) : 100
    });
    
    res.json({
      success: true,
      data: matches
    });
  } catch (error) {
    logger.error('Get rule matches error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch rule matches'
    });
  }
});

// POST /enhanced-traffic/test-rule - Test rule configuration
router.post('/test-rule', async (req, res) => {
  try {
    const { client_ip, protocol, application, port, domain } = req.body;
    
    const testResult = await trafficService.testRuleMatching({
      client_ip,
      protocol,
      application,
      port,
      domain
    });
    
    res.json({
      success: true,
      data: testResult
    });
  } catch (error) {
    logger.error('Test rule error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to test rule'
    });
  }
});

export default router;