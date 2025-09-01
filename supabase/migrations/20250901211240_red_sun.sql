/*
  # Network Device Configuration System

  1. Device Configuration Tables
    - `device_configurations` - Main device config and role
    - `wan_profiles` - WAN connection profiles
    - `vlan_catalog` - Standard VLAN definitions
    - `wifi_ssid_configs` - Wi-Fi SSID configurations
    - `traffic_policies` - Traffic routing policies
    - `security_policies` - Security and firewall settings

  2. Device Roles
    - Router (Gateway/NAT)
    - Edge Router (Advanced routing)
    - Bridge/L2 Switch
    - L3 Switch
    - Access Point
    - Mesh AP/Repeater
    - Modem/WAN Integration

  3. Role-based Feature Visibility
    - Dynamic UI based on selected device role
    - Feature sets per role type
*/

-- Device Configurations Table
CREATE TABLE IF NOT EXISTS device_configurations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  device_name text NOT NULL,
  device_role text[] NOT NULL DEFAULT '{"router"}', -- ["router", "ap", "edge_router", "bridge", "l3_switch", "modem"]
  
  -- Management
  management_ip inet,
  management_vlan integer DEFAULT 10,
  
  -- System
  timezone text DEFAULT 'Europe/Istanbul',
  ntp_servers text[] DEFAULT '{"pool.ntp.org", "time.cloudflare.com"}',
  rf_regulatory_domain text DEFAULT 'TR', -- TR, EU, US, etc.
  firmware_version text,
  auto_firmware_update boolean DEFAULT false,
  
  -- Logging and Telemetry
  logging_enabled boolean DEFAULT true,
  telemetry_enabled boolean DEFAULT true,
  ping_monitoring boolean DEFAULT true,
  port_statistics boolean DEFAULT true,
  ssid_statistics boolean DEFAULT true,
  alert_notifications boolean DEFAULT true,
  
  -- Role-specific configurations stored as JSONB
  router_config jsonb DEFAULT '{}',
  edge_router_config jsonb DEFAULT '{}',
  bridge_config jsonb DEFAULT '{}',
  l3_switch_config jsonb DEFAULT '{}',
  ap_config jsonb DEFAULT '{}',
  mesh_config jsonb DEFAULT '{}',
  modem_config jsonb DEFAULT '{}',
  
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- WAN Profiles Table
CREATE TABLE IF NOT EXISTS wan_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_name text NOT NULL,
  profile_id text UNIQUE NOT NULL, -- wan::fiber_pppoe, wan::lte1, etc.
  
  -- Connection Type
  connection_type text NOT NULL, -- pppoe, dhcp, static, lte_5g, docsis, ont, starlink
  description text,
  
  -- PPPoE Configuration
  pppoe_username text,
  pppoe_password text,
  pppoe_service_name text,
  
  -- Static IP Configuration
  static_ip inet,
  static_gateway inet,
  static_dns text[],
  
  -- VLAN Configuration
  wan_vlan_tag integer,
  wan_vlan_priority integer DEFAULT 0,
  
  -- Advanced Settings
  mtu integer DEFAULT 1500,
  mss_clamp boolean DEFAULT false,
  mac_clone text,
  
  -- LTE/5G Settings
  apn text,
  pin text,
  lte_bands text[],
  
  -- Performance Metrics
  latency_ms integer DEFAULT 0,
  bandwidth_mbps integer DEFAULT 0,
  reliability_score decimal(3,2) DEFAULT 1.0,
  
  -- Status
  is_active boolean DEFAULT true,
  is_default boolean DEFAULT false,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- VLAN Catalog Table (Standard VLAN Definitions)
CREATE TABLE IF NOT EXISTS vlan_catalog (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vlan_id integer UNIQUE NOT NULL,
  vlan_name text NOT NULL,
  description text NOT NULL,
  
  -- Network Configuration
  network_cidr inet NOT NULL,
  gateway_ip inet NOT NULL,
  
  -- Purpose and Security
  purpose text NOT NULL, -- admin, trusted, iot, guest, gaming, voip, security, kids, media, lab
  security_level text NOT NULL, -- low, medium, high, critical
  traffic_priority text NOT NULL, -- low, normal, high, critical
  
  -- Access Control
  isolation_enabled boolean DEFAULT false,
  inter_vlan_routing boolean DEFAULT true,
  internet_access boolean DEFAULT true,
  local_access boolean DEFAULT true,
  
  -- DHCP Configuration
  dhcp_enabled boolean DEFAULT true,
  dhcp_start_ip inet,
  dhcp_end_ip inet,
  dhcp_lease_time interval DEFAULT '24 hours',
  
  -- DNS Configuration
  custom_dns_servers inet[],
  dns_profile_id uuid,
  
  -- QoS Configuration
  bandwidth_limit_mbps integer,
  max_devices integer DEFAULT 253,
  
  -- Security Policies
  mac_filtering_enabled boolean DEFAULT false,
  time_restrictions jsonb DEFAULT '{}',
  parental_controls jsonb DEFAULT '{}',
  
  -- Default Configuration Template
  is_standard boolean DEFAULT true,
  color_code text DEFAULT '#48CAE4',
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Wi-Fi SSID Configuration Templates
CREATE TABLE IF NOT EXISTS wifi_ssid_configs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ssid_name text NOT NULL,
  vlan_id integer NOT NULL,
  
  -- Security Configuration
  encryption_type text NOT NULL DEFAULT 'wpa3', -- open, wep, wpa2, wpa3, wpa2_enterprise, wpa3_enterprise
  passphrase text,
  hide_ssid boolean DEFAULT false,
  
  -- Network Configuration
  network_type text NOT NULL DEFAULT 'standard', -- standard, guest, iot, admin
  frequency_band text NOT NULL DEFAULT '5ghz', -- 2.4ghz, 5ghz, 6ghz, dual_band
  channel integer,
  channel_width integer DEFAULT 80, -- 20, 40, 80, 160
  tx_power integer DEFAULT 20,
  
  -- Advanced Features
  band_steering_enabled boolean DEFAULT true,
  fast_roaming_enabled boolean DEFAULT true, -- 802.11r/k/v
  load_balancing_enabled boolean DEFAULT false,
  airtime_fairness boolean DEFAULT true,
  
  -- Access Control
  client_isolation boolean DEFAULT false,
  mac_filtering_enabled boolean DEFAULT false,
  allowed_macs text[] DEFAULT '{}',
  blocked_macs text[] DEFAULT '{}',
  
  -- Guest Network Features
  captive_portal_enabled boolean DEFAULT false,
  captive_portal_url text,
  guest_bandwidth_limit integer,
  guest_time_limit interval,
  
  -- QoS
  qos_enabled boolean DEFAULT false,
  bandwidth_limit_mbps integer,
  priority_level integer DEFAULT 50,
  
  -- Scheduling
  schedule_enabled boolean DEFAULT false,
  schedule_config jsonb DEFAULT '{}',
  
  -- Status
  is_active boolean DEFAULT true,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Security Policies Table
CREATE TABLE IF NOT EXISTS security_policies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  policy_name text NOT NULL,
  device_role text NOT NULL, -- router, edge_router, bridge, l3_switch, ap
  
  -- Firewall Configuration
  firewall_enabled boolean DEFAULT true,
  firewall_zones jsonb DEFAULT '{}', -- WAN, LAN, VPN, DMZ zones
  
  -- Access Control Lists
  wan_to_lan_rules jsonb DEFAULT '[]',
  inter_vlan_rules jsonb DEFAULT '[]',
  port_isolation_rules jsonb DEFAULT '[]',
  
  -- DoS Protection
  dos_protection_enabled boolean DEFAULT true,
  syn_flood_protection boolean DEFAULT true,
  ping_flood_protection boolean DEFAULT true,
  rate_limiting jsonb DEFAULT '{}',
  
  -- SSH/API Access
  ssh_enabled boolean DEFAULT true,
  ssh_port integer DEFAULT 22,
  ssh_key_only boolean DEFAULT false,
  api_access_enabled boolean DEFAULT true,
  api_rate_limit integer DEFAULT 100,
  
  -- Certificate Management
  tls_enabled boolean DEFAULT false,
  certificate_path text,
  auto_cert_renewal boolean DEFAULT false,
  
  -- Two-Factor Authentication
  tfa_enabled boolean DEFAULT false,
  tfa_method text, -- totp, sms, email
  
  -- Backup and Recovery
  auto_backup_enabled boolean DEFAULT true,
  backup_schedule text DEFAULT '0 2 * * *', -- Daily at 2 AM
  backup_retention_days integer DEFAULT 30,
  
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Network Monitoring Configuration
CREATE TABLE IF NOT EXISTS monitoring_configs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id uuid REFERENCES device_configurations(id),
  
  -- Monitoring Settings
  ping_monitoring_enabled boolean DEFAULT true,
  ping_targets inet[] DEFAULT '{"8.8.8.8", "1.1.1.1"}',
  ping_interval_seconds integer DEFAULT 60,
  
  -- Bandwidth Monitoring
  bandwidth_monitoring boolean DEFAULT true,
  bandwidth_threshold_mbps integer DEFAULT 80,
  
  -- Port Monitoring
  port_monitoring boolean DEFAULT true,
  monitored_ports integer[] DEFAULT '{}',
  
  -- SNMP Configuration
  snmp_enabled boolean DEFAULT false,
  snmp_community text DEFAULT 'public',
  snmp_version text DEFAULT 'v2c', -- v1, v2c, v3
  
  -- Alert Configuration
  alerts_enabled boolean DEFAULT true,
  alert_methods text[] DEFAULT '{"telegram"}', -- telegram, webhook, email
  
  -- Performance Thresholds
  cpu_threshold_percent integer DEFAULT 80,
  memory_threshold_percent integer DEFAULT 85,
  disk_threshold_percent integer DEFAULT 90,
  temperature_threshold_celsius integer DEFAULT 70,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Insert Standard VLAN Catalog
INSERT INTO vlan_catalog (vlan_id, vlan_name, description, network_cidr, gateway_ip, purpose, security_level, traffic_priority, dhcp_start_ip, dhcp_end_ip) VALUES
(10, 'Admin', 'Yönetim cihazları - PC, Laptop, Server', '192.168.10.0/24', '192.168.10.1', 'admin', 'critical', 'high', '192.168.10.100', '192.168.10.199'),
(20, 'Trusted', 'Güvenilir cihazlar - Ana kullanım', '192.168.20.0/24', '192.168.20.1', 'trusted', 'high', 'normal', '192.168.20.100', '192.168.20.199'),
(30, 'IoT', 'IoT cihazları - TV, Buzdolabı, Akıllı ev', '192.168.30.0/24', '192.168.30.1', 'iot', 'medium', 'low', '192.168.30.100', '192.168.30.199'),
(40, 'Guest', 'Misafir cihazları - Internet-only', '192.168.40.0/24', '192.168.40.1', 'guest', 'low', 'low', '192.168.40.100', '192.168.40.199'),
(50, 'Gaming', 'Oyun konsolları - Düşük gecikme', '192.168.50.0/24', '192.168.50.1', 'gaming', 'medium', 'critical', '192.168.50.100', '192.168.50.199'),
(60, 'VoIP/Work', 'VoIP ve iş cihazları', '192.168.60.0/24', '192.168.60.1', 'voip', 'high', 'high', '192.168.60.100', '192.168.60.199'),
(70, 'Security', 'Güvenlik kameraları ve NVR', '192.168.70.0/24', '192.168.70.1', 'security', 'high', 'normal', '192.168.70.100', '192.168.70.199'),
(80, 'Kids', 'Çocuk cihazları - Zaman kısıtlı', '192.168.80.0/24', '192.168.80.1', 'kids', 'medium', 'normal', '192.168.80.100', '192.168.80.199'),
(90, 'Media', 'Medya sunucuları - Plex, Jellyfin', '192.168.90.0/24', '192.168.90.1', 'media', 'medium', 'high', '192.168.90.100', '192.168.90.199'),
(100, 'Lab/Test', 'Test ve deneysel cihazlar', '192.168.100.0/24', '192.168.100.1', 'lab', 'low', 'low', '192.168.100.100', '192.168.100.199')
ON CONFLICT (vlan_id) DO UPDATE SET
  vlan_name = EXCLUDED.vlan_name,
  description = EXCLUDED.description,
  updated_at = now();

-- Insert Default Wi-Fi SSID Templates
INSERT INTO wifi_ssid_configs (ssid_name, vlan_id, encryption_type, network_type, frequency_band, client_isolation, captive_portal_enabled, priority_level) VALUES
('Infinite-Admin', 10, 'wpa3', 'admin', '5ghz', false, false, 90),
('Infinite-Home', 20, 'wpa3', 'standard', 'dual_band', false, false, 70),
('Infinite-IoT', 30, 'wpa2', 'iot', '2.4ghz', true, false, 30),
('Infinite-Guest', 40, 'wpa2', 'guest', '2.4ghz', true, true, 20),
('Infinite-Gaming', 50, 'wpa3', 'standard', '5ghz', false, false, 95),
('Infinite-VoIP', 60, 'wpa3', 'standard', '5ghz', false, false, 85)
ON CONFLICT (ssid_name) DO UPDATE SET
  updated_at = now();

-- Enable Row Level Security
ALTER TABLE device_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE wan_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE vlan_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE wifi_ssid_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE monitoring_configs ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies
CREATE POLICY "Users can manage device configurations"
  ON device_configurations
  FOR ALL
  TO authenticated
  USING (true);

CREATE POLICY "Users can manage WAN profiles"
  ON wan_profiles
  FOR ALL
  TO authenticated
  USING (true);

CREATE POLICY "Users can view VLAN catalog"
  ON vlan_catalog
  FOR ALL
  TO authenticated
  USING (true);

CREATE POLICY "Users can manage Wi-Fi SSID configs"
  ON wifi_ssid_configs
  FOR ALL
  TO authenticated
  USING (true);

CREATE POLICY "Users can manage security policies"
  ON security_policies
  FOR ALL
  TO authenticated
  USING (true);

CREATE POLICY "Users can manage monitoring configs"
  ON monitoring_configs
  FOR ALL
  TO authenticated
  USING (true);

-- Create Indexes
CREATE INDEX IF NOT EXISTS idx_device_configurations_role ON device_configurations USING GIN(device_role);
CREATE INDEX IF NOT EXISTS idx_wan_profiles_type ON wan_profiles(connection_type);
CREATE INDEX IF NOT EXISTS idx_vlan_catalog_purpose ON vlan_catalog(purpose);
CREATE INDEX IF NOT EXISTS idx_wifi_ssid_vlan ON wifi_ssid_configs(vlan_id);
CREATE INDEX IF NOT EXISTS idx_security_policies_role ON security_policies(device_role);