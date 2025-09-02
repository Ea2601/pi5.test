import express from 'express';
import Joi from 'joi';
import { NetworkConfigService } from '../services/NetworkConfigService';
import { logger } from '../utils/logger';

const router = express.Router();
const configService = new NetworkConfigService();

// Validation schemas
const deviceConfigSchema = Joi.object({
  device_name: Joi.string().min(1).max(255).required(),
  device_role: Joi.array().items(Joi.string().valid(
    'router', 'edge_router', 'bridge', 'l3_switch', 
    'ap', 'mesh_ap', 'repeater', 'cpe_client', 'modem'
  )).min(1).required(),
  management_ip: Joi.string().ip().optional(),
  management_vlan: Joi.number().integer().min(1).max(4094).default(10),
  timezone: Joi.string().default('Europe/Istanbul'),
  ntp_servers: Joi.array().items(Joi.string()).default(['pool.ntp.org']),
  rf_regulatory_domain: Joi.string().length(2).default('TR'),
  logging_enabled: Joi.boolean().default(true),
  telemetry_enabled: Joi.boolean().default(true),
  router_config: Joi.object().optional(),
  edge_router_config: Joi.object().optional(),
  bridge_config: Joi.object().optional(),
  l3_switch_config: Joi.object().optional(),
  ap_config: Joi.object().optional(),
  mesh_config: Joi.object().optional(),
  modem_config: Joi.object().optional()
});

const wanProfileSchema = Joi.object({
  profile_name: Joi.string().min(1).max(255).required(),
  profile_id: Joi.string().pattern(/^wan::[a-z0-9_]+$/).required(),
  connection_type: Joi.string().valid('pppoe', 'dhcp', 'static', 'lte_5g', 'docsis', 'ont', 'starlink').required(),
  description: Joi.string().max(500).optional(),
  pppoe_username: Joi.string().when('connection_type', { is: 'pppoe', then: Joi.required() }),
  pppoe_password: Joi.string().when('connection_type', { is: 'pppoe', then: Joi.required() }),
  static_ip: Joi.string().ip().when('connection_type', { is: 'static', then: Joi.required() }),
  static_gateway: Joi.string().ip().when('connection_type', { is: 'static', then: Joi.required() }),
  static_dns: Joi.array().items(Joi.string().ip()).optional(),
  wan_vlan_tag: Joi.number().integer().min(1).max(4094).optional(),
  mtu: Joi.number().integer().min(576).max(9000).default(1500),
  mss_clamp: Joi.boolean().default(false),
  apn: Joi.string().when('connection_type', { is: 'lte_5g', then: Joi.required() }),
  pin: Joi.string().optional(),
  lte_bands: Joi.array().items(Joi.string()).optional()
});

// GET /config/device - Get current device configuration
router.get('/device', async (req, res) => {
  try {
    const config = await configService.getDeviceConfiguration();
    res.json({
      success: true,
      data: config
    });
  } catch (error) {
    logger.error('Get device configuration error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch device configuration'
    });
  }
});

// POST /config/device - Create device configuration
router.post('/device', async (req, res) => {
  try {
    const { error } = deviceConfigSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    const config = await configService.createDeviceConfiguration(req.body);
    
    res.status(201).json({
      success: true,
      data: config
    });
  } catch (error) {
    logger.error('Create device configuration error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create device configuration'
    });
  }
});

// PUT /config/device/:id - Update device configuration
router.put('/device/:id', async (req, res) => {
  try {
    const config = await configService.updateDeviceConfiguration(req.params.id, req.body);
    
    if (!config) {
      return res.status(404).json({
        success: false,
        message: 'Device configuration not found'
      });
    }

    res.json({
      success: true,
      data: config
    });
  } catch (error) {
    logger.error('Update device configuration error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update device configuration'
    });
  }
});

// POST /config/validate - Validate configuration
router.post('/validate', async (req, res) => {
  try {
    const validation = await configService.validateConfiguration(req.body);
    
    res.json({
      success: true,
      data: validation
    });
  } catch (error) {
    logger.error('Validate configuration error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to validate configuration'
    });
  }
});

// POST /config/apply - Apply configuration to system
router.post('/apply', async (req, res) => {
  try {
    const result = await configService.applyConfiguration(req.body);
    
    res.json({
      success: result.success,
      data: result,
      message: result.success ? 'Configuration applied successfully' : 'Configuration applied with errors'
    });
  } catch (error) {
    logger.error('Apply configuration error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to apply configuration'
    });
  }
});

// GET /config/wan-profiles - List WAN profiles
router.get('/wan-profiles', async (req, res) => {
  try {
    const profiles = await configService.getWANProfiles();
    res.json({
      success: true,
      data: profiles
    });
  } catch (error) {
    logger.error('Get WAN profiles error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch WAN profiles'
    });
  }
});

// POST /config/wan-profiles - Create WAN profile
router.post('/wan-profiles', async (req, res) => {
  try {
    const { error } = wanProfileSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    const profile = await configService.createWANProfile(req.body);
    
    res.status(201).json({
      success: true,
      data: profile
    });
  } catch (error) {
    logger.error('Create WAN profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create WAN profile'
    });
  }
});

// GET /config/vlan-catalog - Get VLAN catalog
router.get('/vlan-catalog', async (req, res) => {
  try {
    const catalog = await configService.getVLANCatalog();
    res.json({
      success: true,
      data: catalog
    });
  } catch (error) {
    logger.error('Get VLAN catalog error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch VLAN catalog'
    });
  }
});

// PUT /config/vlan-catalog/:id - Update VLAN catalog entry
router.put('/vlan-catalog/:id', async (req, res) => {
  try {
    const entry = await configService.updateVLANCatalogEntry(req.params.id, req.body);
    
    if (!entry) {
      return res.status(404).json({
        success: false,
        message: 'VLAN catalog entry not found'
      });
    }

    res.json({
      success: true,
      data: entry
    });
  } catch (error) {
    logger.error('Update VLAN catalog entry error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update VLAN catalog entry'
    });
  }
});

// GET /config/wifi-ssids - Get WiFi SSID configurations
router.get('/wifi-ssids', async (req, res) => {
  try {
    const ssids = await configService.getWiFiSSIDConfigs();
    res.json({
      success: true,
      data: ssids
    });
  } catch (error) {
    logger.error('Get WiFi SSID configs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch WiFi SSID configurations'
    });
  }
});

// POST /config/wifi-ssids - Create WiFi SSID configuration
router.post('/wifi-ssids', async (req, res) => {
  try {
    const ssid = await configService.createWiFiSSIDConfig(req.body);
    
    res.status(201).json({
      success: true,
      data: ssid
    });
  } catch (error) {
    logger.error('Create WiFi SSID config error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create WiFi SSID configuration'
    });
  }
});

// GET /config/egress-catalog - Get dynamic egress catalog
router.get('/egress-catalog', async (req, res) => {
  try {
    const catalog = await configService.getEgressCatalog();
    res.json({
      success: true,
      data: catalog
    });
  } catch (error) {
    logger.error('Get egress catalog error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch egress catalog'
    });
  }
});

// GET /config/security-policy/:role - Get security policy for role
router.get('/security-policy/:role', async (req, res) => {
  try {
    const policy = await configService.getSecurityPolicy(req.params.role);
    res.json({
      success: true,
      data: policy
    });
  } catch (error) {
    logger.error('Get security policy error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch security policy'
    });
  }
});

// PUT /config/security-policy/:role - Update security policy
router.put('/security-policy/:role', async (req, res) => {
  try {
    const policy = await configService.updateSecurityPolicy(req.params.role, req.body);
    
    res.json({
      success: true,
      data: policy,
      message: 'Security policy updated successfully'
    });
  } catch (error) {
    logger.error('Update security policy error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update security policy'
    });
  }
});

// GET /config/export - Export configuration
router.get('/export', async (req, res) => {
  try {
    const { format } = req.query;
    const exportData = await configService.exportConfiguration(format as string || 'json');
    
    res.json({
      success: true,
      data: { config: exportData }
    });
  } catch (error) {
    logger.error('Export configuration error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export configuration'
    });
  }
});

// POST /config/import - Import configuration
router.post('/import', async (req, res) => {
  try {
    const { config, format } = req.body;
    const imported = await configService.importConfiguration(config, format);
    
    res.json({
      success: true,
      data: imported,
      message: 'Configuration imported successfully'
    });
  } catch (error) {
    logger.error('Import configuration error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to import configuration'
    });
  }
});

// GET /config/presets - Get device configuration presets
router.get('/presets', async (req, res) => {
  try {
    const presets = [
      {
        name: 'Home Router + Wi-Fi',
        description: 'Ev kullanımı için router ve access point kombinasyonu',
        device_role: ['router', 'ap'],
        recommended_vlans: [10, 20, 30, 40, 50],
        required_features: ['WAN Configuration', 'DHCP Server', 'Wi-Fi Management']
      },
      {
        name: 'Enterprise Edge Router',
        description: 'Kurumsal ağ için gelişmiş yönlendirme özellikleri',
        device_role: ['edge_router'],
        recommended_vlans: [10, 20, 30, 40, 50, 60, 70, 100],
        required_features: ['Multi-WAN', 'Policy Routing', 'DPI', 'VPN Management']
      },
      {
        name: 'L2 Bridge/Switch',
        description: 'Katman 2 köprüleme ve VLAN yönetimi',
        device_role: ['bridge'],
        recommended_vlans: [10, 20, 30, 40],
        required_features: ['VLAN Management', 'STP', 'IGMP Snooping']
      },
      {
        name: 'Wi-Fi Access Point',
        description: 'Sadece Wi-Fi erişim noktası',
        device_role: ['ap'],
        recommended_vlans: [10, 20, 40],
        required_features: ['Multi-SSID', 'Fast Roaming', 'Band Steering']
      },
      {
        name: 'Mesh Network Controller',
        description: 'Mesh ağ koordinatörü ve AP',
        device_role: ['mesh_ap'],
        recommended_vlans: [10, 20, 30, 40, 50],
        required_features: ['Mesh Management', 'Backhaul Config', 'Roaming']
      }
    ];

    res.json({
      success: true,
      data: presets
    });
  } catch (error) {
    logger.error('Get config presets error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch configuration presets'
    });
  }
});

// POST /config/discover-wan - Discover WAN connections
router.post('/discover-wan', async (req, res) => {
  try {
    const discovered = await configService.discoverWANConnections();
    
    res.json({
      success: true,
      data: discovered,
      message: `${discovered.length} WAN connections discovered`
    });
  } catch (error) {
    logger.error('Discover WAN connections error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to discover WAN connections'
    });
  }
});

// GET /config/ui-config/:roles - Get UI configuration for roles
router.get('/ui-config/:roles', async (req, res) => {
  try {
    const roles = req.params.roles.split(',');
    const uiConfig = await configService.getUIConfigForRole(roles);
    
    res.json({
      success: true,
      data: uiConfig
    });
  } catch (error) {
    logger.error('Get UI config error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch UI configuration'
    });
  }
});

// POST /config/generate-sample - Generate sample configuration
router.post('/generate-sample', async (req, res) => {
  try {
    const { roles } = req.body;
    const sampleConfig = await configService.generateSampleConfiguration(roles);
    
    res.json({
      success: true,
      data: sampleConfig
    });
  } catch (error) {
    logger.error('Generate sample config error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate sample configuration'
    });
  }
});

export default router;