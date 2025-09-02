/*
  # Network Device Configuration System

  1. Device Configurations
     - Multi-role device support (router, edge_router, bridge, l3_switch, ap, mesh_ap, repeater, cpe_client, modem)
     - Role-based feature visibility and configuration
     - System-wide settings (timezone, NTP, logging, telemetry)

  2. WAN Profiles
     - Connection types: PPPoE, DHCP, Static, LTE/5G, ONT, DOCSIS, Starlink
     - VLAN tagging, MTU/MSS settings, MAC cloning
     - Performance metrics and reliability scoring

  3. VLAN Catalog
     - Predefined VLAN configurations with security levels
     - Traffic priorities and access controls
     - DHCP pool associations

  4. Role-Specific Configurations
     - Router: NAT, DHCP server, DNS, QoS, port forwarding
     - Edge Router: Multi-WAN, PBR, DPI, BGP/OSPF
     - Bridge: STP, LACP, port profiles, IGMP snooping
     - L3 Switch: SVI, inter-VLAN routing, ACLs
     - Access Point: Multi-SSID, roaming features, mesh
     - Mesh/Repeater: Backhaul, topology, range extension
     - Modem: Connection management, WAN integration

  5. Security Policies
     - Firewall zones and ACLs
     - Access control by device role
     - Certificate and authentication management
*/

-- Device role enum
CREATE TYPE device_role_enum AS ENUM (
  'router', 'edge_router', 'bridge', 'l3_switch', 
  'ap', 'mesh_ap', 'repeater', 'cpe_client', 'modem'
);

-- WAN connection types
CREATE TYPE wan_connection_type_enum AS ENUM (
  'pppoe', 'dhcp', 'static', 'lte_5g', 'docsis', 'ont', 'starlink'
);

-- Device configurations table
CREATE TABLE IF NOT EXISTS device_configurations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_name TEXT NOT NULL DEFAULT 'Pi5-Supernode',
  device_role device_role_enum[] NOT NULL DEFAULT ARRAY['router'],
  
  -- Management settings
  management_ip INET,
  management_vlan INTEGER DEFAULT 10,
  
  -- System settings
  timezone TEXT DEFAULT 'Europe/Istanbul',
  ntp_servers TEXT[] DEFAULT ARRAY['pool.ntp.org', 'time.cloudflare.com'],
  rf_regulatory_domain TEXT DEFAULT 'TR',
  firmware_version TEXT,
  auto_firmware_update BOOLEAN DEFAULT FALSE,
  
  -- Logging and telemetry
  logging_enabled BOOLEAN DEFAULT TRUE,
  telemetry_enabled BOOLEAN DEFAULT TRUE,
  ping_monitoring BOOLEAN DEFAULT TRUE,
  port_statistics BOOLEAN DEFAULT TRUE,
  ssid_statistics BOOLEAN DEFAULT TRUE,
  alert_notifications BOOLEAN DEFAULT TRUE,
  
  -- Role-specific configurations (JSONB for flexibility)
  router_config JSONB DEFAULT '{}',
  edge_router_config JSONB DEFAULT '{}',
  bridge_config JSONB DEFAULT '{}',
  l3_switch_config JSONB DEFAULT '{}',
  ap_config JSONB DEFAULT '{}',
  mesh_config JSONB DEFAULT '{}',
  modem_config JSONB DEFAULT '{}',
  
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- WAN profiles table
CREATE TABLE IF NOT EXISTS wan_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_name TEXT NOT NULL,
  profile_id TEXT UNIQUE NOT NULL, -- wan::fiber_pppoe, wan::lte1, etc.
  connection_type wan_connection_type_enum NOT NULL,
  description TEXT,
  
  -- Connection settings
  pppoe_username TEXT,
  pppoe_password TEXT,
  static_ip INET,
  static_gateway INET,
  static_dns INET[],
  wan_vlan_tag INTEGER,
  mtu INTEGER DEFAULT 1500,
  mss_clamp BOOLEAN DEFAULT FALSE,
  mac_clone MACADDR,
  
  -- LTE/5G settings
  apn TEXT,
  pin TEXT,
  lte_bands TEXT[],
  
  -- Performance metrics
  latency_ms INTEGER DEFAULT 0,
  bandwidth_mbps INTEGER DEFAULT 0,
  reliability_score DECIMAL(3,2) DEFAULT 1.00,
  
  is_active BOOLEAN DEFAULT TRUE,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- VLAN catalog table
CREATE TABLE IF NOT EXISTS vlan_catalog (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vlan_id INTEGER UNIQUE NOT NULL,
  vlan_name TEXT NOT NULL,
  description TEXT NOT NULL,
  network_cidr CIDR NOT NULL,
  gateway_ip INET NOT NULL,
  purpose TEXT NOT NULL, -- admin, trusted, iot, guest, gaming, voip, security, kids, media, lab
  security_level TEXT DEFAULT 'medium', -- low, medium, high, critical
  traffic_priority TEXT DEFAULT 'normal', -- low, normal, high, critical
  isolation_enabled BOOLEAN DEFAULT FALSE,
  inter_vlan_routing BOOLEAN DEFAULT TRUE,
  internet_access BOOLEAN DEFAULT TRUE,
  dhcp_enabled BOOLEAN DEFAULT TRUE,
  dhcp_start_ip INET,
  dhcp_end_ip INET,
  dhcp_lease_time TEXT DEFAULT '24 hours',
  custom_dns_servers INET[],
  bandwidth_limit_mbps INTEGER,
  max_devices INTEGER DEFAULT 253,
  color_code TEXT NOT NULL,
  is_standard BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- WiFi SSID configurations
CREATE TABLE IF NOT EXISTS wifi_ssid_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ssid_name TEXT NOT NULL,
  vlan_id INTEGER REFERENCES vlan_catalog(vlan_id),
  encryption_type TEXT DEFAULT 'wpa3', -- open, wpa2, wpa3, wpa2_enterprise, wpa3_enterprise
  passphrase TEXT,
  frequency_band TEXT DEFAULT 'dual_band', -- 2.4ghz, 5ghz, 6ghz, dual_band
  hide_ssid BOOLEAN DEFAULT FALSE,
  client_isolation BOOLEAN DEFAULT FALSE,
  captive_portal_enabled BOOLEAN DEFAULT FALSE,
  guest_network BOOLEAN DEFAULT FALSE,
  bandwidth_limit_mbps INTEGER,
  max_clients INTEGER DEFAULT 50,
  schedule_enabled BOOLEAN DEFAULT FALSE,
  schedule_config JSONB DEFAULT '{}',
  is_enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Security policies by device role
CREATE TABLE IF NOT EXISTS security_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_role device_role_enum NOT NULL,
  policy_name TEXT NOT NULL,
  description TEXT,
  
  -- Firewall configuration
  firewall_zones JSONB DEFAULT '{}',
  acl_rules JSONB DEFAULT '[]',
  port_restrictions JSONB DEFAULT '{}',
  
  -- Access control
  ssh_access_enabled BOOLEAN DEFAULT TRUE,
  web_admin_access BOOLEAN DEFAULT TRUE,
  api_access_enabled BOOLEAN DEFAULT TRUE,
  allowed_management_networks CIDR[],
  
  -- Security features
  dos_protection BOOLEAN DEFAULT TRUE,
  intrusion_detection BOOLEAN DEFAULT FALSE,
  rate_limiting JSONB DEFAULT '{}',
  
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(device_role)
);

-- Configuration validation results
CREATE TABLE IF NOT EXISTS configuration_validations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_config_id UUID REFERENCES device_configurations(id),
  validation_timestamp TIMESTAMPTZ DEFAULT NOW(),
  is_valid BOOLEAN NOT NULL,
  errors JSONB DEFAULT '[]',
  warnings JSONB DEFAULT '[]',
  recommendations JSONB DEFAULT '[]',
  validated_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Configuration change history
CREATE TABLE IF NOT EXISTS configuration_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_config_id UUID REFERENCES device_configurations(id),
  change_type TEXT NOT NULL, -- create, update, apply, rollback
  change_description TEXT,
  previous_config JSONB,
  new_config JSONB,
  applied_successfully BOOLEAN,
  applied_at TIMESTAMPTZ,
  applied_by TEXT,
  rollback_snapshot_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert standard VLAN catalog entries
INSERT INTO vlan_catalog (vlan_id, vlan_name, description, network_cidr, gateway_ip, purpose, security_level, traffic_priority, color_code, dhcp_start_ip, dhcp_end_ip) VALUES
(10, 'Admin', 'Yönetim cihazları - PC, Laptop, Network Equipment', '192.168.10.0/24', '192.168.10.1', 'admin', 'critical', 'high', '#4A90E2', '192.168.10.100', '192.168.10.199'),
(20, 'Trusted', 'Normal kullanım - Telefon, Tablet, Güvenilir cihazlar', '192.168.20.0/24', '192.168.20.1', 'trusted', 'high', 'normal', '#7ED321', '192.168.20.100', '192.168.20.199'),
(30, 'IoT', 'IoT cihazları - TV, Buzdolabı, Akıllı ev', '192.168.30.0/24', '192.168.30.1', 'iot', 'medium', 'low', '#F5A623', '192.168.30.100', '192.168.30.199'),
(40, 'Guest', 'Misafir cihazları - Internet-only access', '192.168.40.0/24', '192.168.40.1', 'guest', 'low', 'low', '#D0021B', '192.168.40.100', '192.168.40.199'),
(50, 'Gaming', 'Oyun konsolları - Düşük ping optimizasyonu', '192.168.50.0/24', '192.168.50.1', 'gaming', 'medium', 'critical', '#9013FE', '192.168.50.100', '192.168.50.199'),
(60, 'VoIP/Work', 'VoIP ve iş cihazları - Ses kalitesi önceliği', '192.168.60.0/24', '192.168.60.1', 'voip', 'high', 'high', '#50E3C2', '192.168.60.100', '192.168.60.199'),
(70, 'Security', 'Güvenlik kameraları ve NVR sistemleri', '192.168.70.0/24', '192.168.70.1', 'security', 'high', 'normal', '#B71C1C', '192.168.70.100', '192.168.70.199'),
(80, 'Kids', 'Çocuk cihazları - Zaman kısıtlamalı', '192.168.80.0/24', '192.168.80.1', 'kids', 'medium', 'normal', '#FF9800', '192.168.80.100', '192.168.80.199'),
(90, 'Media', 'Medya sunucuları - Plex, Jellyfin, NAS', '192.168.90.0/24', '192.168.90.1', 'media', 'medium', 'high', '#673AB7', '192.168.90.100', '192.168.90.199'),
(100, 'Lab/Test', 'Test ve deneysel cihazlar', '192.168.100.0/24', '192.168.100.1', 'lab', 'low', 'low', '#607D8B', '192.168.100.100', '192.168.100.199');

-- Enable Row Level Security
ALTER TABLE device_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE wan_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE vlan_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE wifi_ssid_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE configuration_validations ENABLE ROW LEVEL SECURITY;
ALTER TABLE configuration_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for authenticated users
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

CREATE POLICY "Users can read VLAN catalog"
  ON vlan_catalog
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can manage WiFi SSID configs"
  ON wifi_ssid_configs
  FOR ALL
  TO authenticated
  USING (true);

CREATE POLICY "Users can manage security policies"
  ON security_policies
  FOR ALL
  TO authenticated
  USING (true);

CREATE POLICY "Users can read configuration validations"
  ON configuration_validations
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can read configuration history"
  ON configuration_history
  FOR SELECT
  TO authenticated
  USING (true);

-- Indexes for performance
CREATE INDEX idx_device_configurations_role ON device_configurations USING GIN(device_role);
CREATE INDEX idx_wan_profiles_active ON wan_profiles(is_active, is_default);
CREATE INDEX idx_vlan_catalog_purpose ON vlan_catalog(purpose);
CREATE INDEX idx_wifi_ssid_vlan ON wifi_ssid_configs(vlan_id);
CREATE INDEX idx_security_policies_role ON security_policies(device_role);

-- Functions for dynamic egress catalog
CREATE OR REPLACE FUNCTION get_egress_catalog()
RETURNS TABLE (
  id TEXT,
  name TEXT,
  egress_type TEXT,
  description TEXT,
  latency_ms INTEGER,
  bandwidth_mbps INTEGER,
  reliability_score DECIMAL,
  is_active BOOLEAN
) AS $$
BEGIN
  -- Local internet egress
  RETURN QUERY SELECT 
    'local_internet'::TEXT as id,
    'Lokal İnternet (ISP)'::TEXT as name,
    'local_internet'::TEXT as egress_type,
    'Doğrudan ISP üzerinden normal internet trafiği'::TEXT as description,
    5::INTEGER as latency_ms,
    1000::INTEGER as bandwidth_mbps,
    0.95::DECIMAL as reliability_score,
    TRUE::BOOLEAN as is_active;

  -- WAN profiles as egress points
  RETURN QUERY SELECT 
    wp.profile_id::TEXT as id,
    wp.profile_name::TEXT as name,
    'wan_profile'::TEXT as egress_type,
    COALESCE(wp.description, 'WAN bağlantısı: ' || wp.connection_type::TEXT)::TEXT as description,
    wp.latency_ms::INTEGER,
    wp.bandwidth_mbps::INTEGER,
    wp.reliability_score::DECIMAL,
    wp.is_active::BOOLEAN
  FROM wan_profiles wp
  WHERE wp.is_active = TRUE;

  -- WireGuard connections as egress points
  RETURN QUERY SELECT 
    ('wg::' || ws.name)::TEXT as id,
    ('WG: ' || ws.name)::TEXT as name,
    'wireguard'::TEXT as egress_type,
    COALESCE(ws.description, 'WireGuard tünel: ' || ws.endpoint)::TEXT as description,
    50::INTEGER as latency_ms, -- Would be measured
    100::INTEGER as bandwidth_mbps, -- Would be measured
    0.90::DECIMAL as reliability_score,
    ws.is_active::BOOLEAN
  FROM wireguard_servers ws
  WHERE ws.is_active = TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to validate device configuration
CREATE OR REPLACE FUNCTION validate_device_configuration(config_data JSONB)
RETURNS TABLE (
  is_valid BOOLEAN,
  errors TEXT[],
  warnings TEXT[]
) AS $$
DECLARE
  validation_errors TEXT[] := '{}';
  validation_warnings TEXT[] := '{}';
  device_roles TEXT[];
BEGIN
  device_roles := ARRAY(SELECT jsonb_array_elements_text(config_data->'device_role'));
  
  -- Validate device name
  IF config_data->>'device_name' IS NULL OR LENGTH(config_data->>'device_name') = 0 THEN
    validation_errors := array_append(validation_errors, 'Cihaz adı gerekli');
  END IF;
  
  -- Validate management VLAN
  IF (config_data->>'management_vlan')::INTEGER NOT IN (SELECT vlan_id FROM vlan_catalog WHERE is_standard = TRUE) THEN
    validation_warnings := array_append(validation_warnings, 'Yönetim VLAN standart katalogda bulunamadı');
  END IF;
  
  -- Role-specific validations
  IF 'router' = ANY(device_roles) OR 'edge_router' = ANY(device_roles) THEN
    IF config_data->'router_config'->>'nat_enabled' IS NULL THEN
      validation_warnings := array_append(validation_warnings, 'Router rolü için NAT yapılandırması önerilir');
    END IF;
  END IF;
  
  IF 'ap' = ANY(device_roles) OR 'mesh_ap' = ANY(device_roles) THEN
    IF config_data->'ap_config'->>'radio_2_4ghz_enabled' IS NULL AND config_data->'ap_config'->>'radio_5ghz_enabled' IS NULL THEN
      validation_errors := array_append(validation_errors, 'Access Point için en az bir radio bandı etkinleştirilmeli');
    END IF;
  END IF;
  
  -- Check for conflicting roles
  IF 'bridge' = ANY(device_roles) AND ('router' = ANY(device_roles) OR 'edge_router' = ANY(device_roles)) THEN
    validation_warnings := array_append(validation_warnings, 'Bridge ve Router rolleri birlikte kullanıldığında L2/L3 işlev çakışması olabilir');
  END IF;
  
  RETURN QUERY SELECT 
    (array_length(validation_errors, 1) IS NULL OR array_length(validation_errors, 1) = 0)::BOOLEAN,
    validation_errors,
    validation_warnings;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to apply device configuration
CREATE OR REPLACE FUNCTION apply_device_configuration(config_id UUID)
RETURNS TABLE (
  success BOOLEAN,
  applied_features TEXT[],
  errors TEXT[]
) AS $$
DECLARE
  config_record RECORD;
  applied_list TEXT[] := '{}';
  error_list TEXT[] := '{}';
BEGIN
  SELECT * INTO config_record FROM device_configurations WHERE id = config_id;
  
  IF NOT FOUND THEN
    error_list := array_append(error_list, 'Konfigürasyon bulunamadı');
    RETURN QUERY SELECT FALSE, applied_list, error_list;
    RETURN;
  END IF;
  
  -- Apply role-specific configurations
  IF 'router' = ANY(config_record.device_role) THEN
    applied_list := array_append(applied_list, 'Router NAT/DHCP yapılandırması');
  END IF;
  
  IF 'edge_router' = ANY(config_record.device_role) THEN
    applied_list := array_append(applied_list, 'Edge Router Multi-WAN yapılandırması');
  END IF;
  
  IF 'ap' = ANY(config_record.device_role) THEN
    applied_list := array_append(applied_list, 'Access Point Wi-Fi yapılandırması');
  END IF;
  
  -- Log configuration application
  INSERT INTO configuration_history (
    device_config_id, change_type, change_description, 
    new_config, applied_successfully, applied_at
  ) VALUES (
    config_id, 'apply', 'Sistem yapılandırması uygulandı',
    to_jsonb(config_record), TRUE, NOW()
  );
  
  RETURN QUERY SELECT 
    TRUE::BOOLEAN,
    applied_list,
    error_list;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;