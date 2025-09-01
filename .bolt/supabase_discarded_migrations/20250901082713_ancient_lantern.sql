/*
  # Wi-Fi Management System

  1. New Tables
    - `wifi_access_points`
      - Access point management and configuration
      - Physical AP devices and their properties
    - `wifi_networks`
      - SSID configurations and security settings
      - Multiple SSIDs per AP with VLAN mapping
    - `wifi_clients`
      - Connected wireless clients and their stats
      - Real-time connection monitoring
    - `wifi_security_policies`
      - MAC filtering, captive portal, parental controls
      - Security rules and access restrictions
    - `wifi_performance_logs`
      - Performance monitoring and statistics
      - Signal strength, bandwidth usage tracking
    - `wifi_mesh_nodes`
      - Mesh network topology and node relationships
      - Backhaul configuration and status
    - `wifi_schedules`
      - Time-based Wi-Fi network control
      - Automatic enable/disable scheduling

  2. Security
    - Enable RLS on all Wi-Fi tables
    - Add policies for authenticated users to manage Wi-Fi settings

  3. Features
    - VLAN-based SSID separation
    - Guest network isolation
    - IoT device management
    - Performance monitoring
    - Security policy enforcement
*/

-- Create enum for Wi-Fi encryption types
CREATE TYPE wifi_encryption_enum AS ENUM ('open', 'wep', 'wpa2', 'wpa3', 'wpa2_enterprise', 'wpa3_enterprise');

-- Create enum for Wi-Fi frequency bands
CREATE TYPE wifi_band_enum AS ENUM ('2.4ghz', '5ghz', '6ghz');

-- Create enum for Wi-Fi client status
CREATE TYPE wifi_client_status_enum AS ENUM ('connected', 'disconnected', 'blocked', 'idle');

-- Wi-Fi Access Points Management
CREATE TABLE IF NOT EXISTS wifi_access_points (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ap_name TEXT NOT NULL,
    description TEXT,
    mac_address TEXT UNIQUE NOT NULL,
    ip_address INET,
    location TEXT,
    vendor TEXT DEFAULT 'Unknown',
    model TEXT,
    firmware_version TEXT,
    
    -- Physical properties
    max_clients INTEGER DEFAULT 50,
    supported_bands wifi_band_enum[] DEFAULT ARRAY['2.4ghz', '5ghz'],
    max_tx_power INTEGER DEFAULT 20, -- dBm
    antenna_count INTEGER DEFAULT 2,
    
    -- Configuration
    management_url TEXT,
    snmp_community TEXT,
    admin_username TEXT,
    admin_password_hash TEXT,
    
    -- Status
    is_online BOOLEAN DEFAULT TRUE,
    last_seen TIMESTAMPTZ DEFAULT NOW(),
    cpu_usage INTEGER DEFAULT 0,
    memory_usage INTEGER DEFAULT 0,
    temperature INTEGER DEFAULT 0,
    uptime_seconds INTEGER DEFAULT 0,
    
    -- Mesh configuration
    is_mesh_enabled BOOLEAN DEFAULT FALSE,
    mesh_role TEXT DEFAULT 'standalone', -- standalone, controller, node
    mesh_backhaul_type TEXT DEFAULT 'auto', -- auto, ethernet, wireless
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Wi-Fi Network Configurations (SSIDs)
CREATE TABLE IF NOT EXISTS wifi_networks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ap_id UUID REFERENCES wifi_access_points(id) ON DELETE CASCADE,
    
    -- Basic settings
    ssid TEXT NOT NULL,
    description TEXT,
    vlan_id INTEGER,
    network_type TEXT DEFAULT 'standard', -- standard, guest, iot, admin
    
    -- Security settings
    encryption_type wifi_encryption_enum DEFAULT 'wpa3',
    passphrase TEXT,
    hide_ssid BOOLEAN DEFAULT FALSE,
    mac_filtering_enabled BOOLEAN DEFAULT FALSE,
    allowed_macs TEXT[] DEFAULT '{}',
    blocked_macs TEXT[] DEFAULT '{}',
    
    -- Network configuration
    frequency_band wifi_band_enum DEFAULT '5ghz',
    channel INTEGER,
    channel_width INTEGER DEFAULT 80, -- MHz
    tx_power INTEGER DEFAULT 20, -- dBm
    
    -- Advanced features
    band_steering_enabled BOOLEAN DEFAULT TRUE,
    fast_roaming_enabled BOOLEAN DEFAULT TRUE, -- 802.11r
    load_balancing_enabled BOOLEAN DEFAULT TRUE,
    captive_portal_enabled BOOLEAN DEFAULT FALSE,
    captive_portal_url TEXT,
    
    -- Access control
    max_clients INTEGER DEFAULT 50,
    client_isolation BOOLEAN DEFAULT FALSE,
    internet_access BOOLEAN DEFAULT TRUE,
    local_access BOOLEAN DEFAULT TRUE,
    
    -- QoS and performance
    qos_enabled BOOLEAN DEFAULT TRUE,
    bandwidth_limit_mbps INTEGER,
    priority_level INTEGER DEFAULT 50, -- 1-100
    
    -- Scheduling
    schedule_enabled BOOLEAN DEFAULT FALSE,
    schedule_config JSONB DEFAULT '{}',
    
    -- Status
    is_enabled BOOLEAN DEFAULT TRUE,
    client_count INTEGER DEFAULT 0,
    last_activity TIMESTAMPTZ DEFAULT NOW(),
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(ap_id, ssid)
);

-- Wi-Fi Connected Clients
CREATE TABLE IF NOT EXISTS wifi_clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    network_id UUID REFERENCES wifi_networks(id) ON DELETE CASCADE,
    ap_id UUID REFERENCES wifi_access_points(id) ON DELETE CASCADE,
    
    -- Client identification
    mac_address TEXT NOT NULL,
    ip_address INET,
    hostname TEXT,
    device_name TEXT,
    device_type TEXT DEFAULT 'unknown',
    vendor TEXT DEFAULT 'Unknown',
    
    -- Connection details
    connected_ssid TEXT NOT NULL,
    frequency_band wifi_band_enum,
    channel INTEGER,
    connection_status wifi_client_status_enum DEFAULT 'connected',
    
    -- Signal and performance
    signal_strength_dbm INTEGER, -- RSSI
    noise_level_dbm INTEGER,
    snr_db INTEGER, -- Signal-to-Noise Ratio
    data_rate_mbps INTEGER,
    
    -- Session tracking
    connected_at TIMESTAMPTZ DEFAULT NOW(),
    last_seen TIMESTAMPTZ DEFAULT NOW(),
    session_duration INTERVAL,
    disconnection_reason TEXT,
    
    -- Traffic statistics
    bytes_sent BIGINT DEFAULT 0,
    bytes_received BIGINT DEFAULT 0,
    packets_sent BIGINT DEFAULT 0,
    packets_received BIGINT DEFAULT 0,
    
    -- Security
    authentication_method TEXT,
    encryption_used TEXT,
    is_authorized BOOLEAN DEFAULT TRUE,
    failed_auth_attempts INTEGER DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(ap_id, mac_address)
);

-- Wi-Fi Security Policies
CREATE TABLE IF NOT EXISTS wifi_security_policies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    policy_name TEXT NOT NULL,
    description TEXT,
    policy_type TEXT NOT NULL, -- mac_filter, time_restriction, device_limit, bandwidth_limit
    
    -- Target configuration
    apply_to_networks UUID[] DEFAULT '{}', -- Apply to specific SSIDs
    apply_to_vlans INTEGER[] DEFAULT '{}', -- Apply to VLANs
    apply_to_device_types TEXT[] DEFAULT '{}', -- Apply to device types
    
    -- Policy rules
    conditions JSONB DEFAULT '{}',
    actions JSONB DEFAULT '{}',
    
    -- Time-based rules
    time_restrictions JSONB DEFAULT '{}', -- Daily/weekly schedules
    parental_controls JSONB DEFAULT '{}', -- Kids device restrictions
    
    -- MAC filtering
    whitelist_macs TEXT[] DEFAULT '{}',
    blacklist_macs TEXT[] DEFAULT '{}',
    auto_whitelist_known_devices BOOLEAN DEFAULT FALSE,
    
    -- Rate limiting
    bandwidth_limit_mbps INTEGER,
    connection_time_limit INTEGER, -- minutes
    daily_data_limit_mb INTEGER,
    
    -- Captive portal
    captive_portal_config JSONB DEFAULT '{}',
    
    -- Status and metrics
    is_active BOOLEAN DEFAULT TRUE,
    priority INTEGER DEFAULT 50,
    violation_count INTEGER DEFAULT 0,
    last_violation TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Wi-Fi Performance Monitoring
CREATE TABLE IF NOT EXISTS wifi_performance_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ap_id UUID REFERENCES wifi_access_points(id) ON DELETE CASCADE,
    network_id UUID REFERENCES wifi_networks(id) ON DELETE CASCADE,
    
    -- Performance metrics
    client_count INTEGER DEFAULT 0,
    total_bandwidth_mbps NUMERIC(10,2) DEFAULT 0,
    average_signal_strength INTEGER, -- Average RSSI
    channel_utilization_percent INTEGER,
    noise_floor_dbm INTEGER,
    
    -- Traffic statistics
    total_bytes_sent BIGINT DEFAULT 0,
    total_bytes_received BIGINT DEFAULT 0,
    packets_per_second INTEGER DEFAULT 0,
    retransmission_rate_percent NUMERIC(5,2) DEFAULT 0,
    
    -- Quality metrics
    average_data_rate_mbps INTEGER,
    connection_success_rate NUMERIC(5,2) DEFAULT 100,
    roaming_success_rate NUMERIC(5,2) DEFAULT 100,
    
    -- Channel analysis
    channel_interference_level INTEGER, -- 1-10 scale
    neighboring_aps_count INTEGER DEFAULT 0,
    channel_recommendation INTEGER,
    
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Wi-Fi Mesh Network Topology
CREATE TABLE IF NOT EXISTS wifi_mesh_nodes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_ap_id UUID REFERENCES wifi_access_points(id) ON DELETE CASCADE,
    child_ap_id UUID REFERENCES wifi_access_points(id) ON DELETE CASCADE,
    
    -- Mesh relationship
    hop_count INTEGER DEFAULT 1,
    backhaul_type TEXT DEFAULT 'wireless', -- wireless, ethernet
    backhaul_frequency wifi_band_enum DEFAULT '5ghz',
    backhaul_channel INTEGER,
    
    -- Connection quality
    link_quality_percent INTEGER DEFAULT 100,
    signal_strength_dbm INTEGER,
    bandwidth_mbps INTEGER DEFAULT 0,
    latency_ms INTEGER DEFAULT 0,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    last_seen TIMESTAMPTZ DEFAULT NOW(),
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(parent_ap_id, child_ap_id)
);

-- Wi-Fi Network Schedules
CREATE TABLE IF NOT EXISTS wifi_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    network_id UUID REFERENCES wifi_networks(id) ON DELETE CASCADE,
    schedule_name TEXT NOT NULL,
    description TEXT,
    
    -- Schedule configuration
    schedule_type TEXT DEFAULT 'weekly', -- daily, weekly, custom
    enabled_days INTEGER[] DEFAULT '{1,2,3,4,5,6,0}', -- 0=Sunday, 1=Monday, etc.
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    timezone TEXT DEFAULT 'Europe/Istanbul',
    
    -- Actions
    action_type TEXT DEFAULT 'enable_disable', -- enable_disable, bandwidth_limit, client_limit
    action_config JSONB DEFAULT '{}',
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    last_executed TIMESTAMPTZ,
    next_execution TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Wi-Fi Channel Analysis and Optimization
CREATE TABLE IF NOT EXISTS wifi_channel_analysis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ap_id UUID REFERENCES wifi_access_points(id) ON DELETE CASCADE,
    
    -- Frequency band analysis
    frequency_band wifi_band_enum NOT NULL,
    channel INTEGER NOT NULL,
    channel_width INTEGER DEFAULT 80,
    
    -- Interference analysis
    noise_floor_dbm INTEGER,
    interference_level INTEGER, -- 1-10 scale
    neighboring_aps JSONB DEFAULT '[]', -- List of detected APs
    channel_utilization_percent INTEGER,
    
    -- Recommendation
    recommended_channel INTEGER,
    recommendation_reason TEXT,
    optimization_score INTEGER, -- 1-100
    
    -- Scan metadata
    scan_duration_ms INTEGER,
    scan_method TEXT DEFAULT 'active', -- active, passive
    
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_wifi_clients_mac ON wifi_clients(mac_address);
CREATE INDEX IF NOT EXISTS idx_wifi_clients_network ON wifi_clients(network_id);
CREATE INDEX IF NOT EXISTS idx_wifi_clients_status ON wifi_clients(connection_status);
CREATE INDEX IF NOT EXISTS idx_wifi_clients_connected_at ON wifi_clients(connected_at);

CREATE INDEX IF NOT EXISTS idx_wifi_performance_timestamp ON wifi_performance_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_wifi_performance_ap ON wifi_performance_logs(ap_id);

CREATE INDEX IF NOT EXISTS idx_wifi_networks_ssid ON wifi_networks(ssid);
CREATE INDEX IF NOT EXISTS idx_wifi_networks_vlan ON wifi_networks(vlan_id);
CREATE INDEX IF NOT EXISTS idx_wifi_networks_enabled ON wifi_networks(is_enabled);

CREATE INDEX IF NOT EXISTS idx_wifi_security_policies_active ON wifi_security_policies(is_active);
CREATE INDEX IF NOT EXISTS idx_wifi_schedules_active ON wifi_schedules(is_active);

-- Enable Row Level Security
ALTER TABLE wifi_access_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE wifi_networks ENABLE ROW LEVEL SECURITY;
ALTER TABLE wifi_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE wifi_security_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE wifi_performance_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE wifi_mesh_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE wifi_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE wifi_channel_analysis ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users
CREATE POLICY "Users can manage Wi-Fi access points"
  ON wifi_access_points
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can manage Wi-Fi networks"
  ON wifi_networks
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can view Wi-Fi clients"
  ON wifi_clients
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can manage Wi-Fi security policies"
  ON wifi_security_policies
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can view Wi-Fi performance logs"
  ON wifi_performance_logs
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can manage Wi-Fi mesh nodes"
  ON wifi_mesh_nodes
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can manage Wi-Fi schedules"
  ON wifi_schedules
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can view Wi-Fi channel analysis"
  ON wifi_channel_analysis
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create functions for Wi-Fi management
CREATE OR REPLACE FUNCTION update_wifi_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at columns
CREATE TRIGGER update_wifi_access_points_updated_at
    BEFORE UPDATE ON wifi_access_points
    FOR EACH ROW
    EXECUTE FUNCTION update_wifi_updated_at_column();

CREATE TRIGGER update_wifi_networks_updated_at
    BEFORE UPDATE ON wifi_networks
    FOR EACH ROW
    EXECUTE FUNCTION update_wifi_updated_at_column();

CREATE TRIGGER update_wifi_clients_updated_at
    BEFORE UPDATE ON wifi_clients
    FOR EACH ROW
    EXECUTE FUNCTION update_wifi_updated_at_column();

CREATE TRIGGER update_wifi_security_policies_updated_at
    BEFORE UPDATE ON wifi_security_policies
    FOR EACH ROW
    EXECUTE FUNCTION update_wifi_updated_at_column();

CREATE TRIGGER update_wifi_schedules_updated_at
    BEFORE UPDATE ON wifi_schedules
    FOR EACH ROW
    EXECUTE FUNCTION update_wifi_updated_at_column();

-- Insert sample data for development
INSERT INTO wifi_access_points (ap_name, mac_address, ip_address, vendor, model, location) VALUES
('Main Access Point', '00:1A:2B:3C:4D:5E', '192.168.1.10', 'TP-Link', 'AX6000', 'Living Room'),
('Office Access Point', '00:1A:2B:3C:4D:5F', '192.168.1.11', 'ASUS', 'AX6100', 'Office'),
('Outdoor Access Point', '00:1A:2B:3C:4D:60', '192.168.1.12', 'Ubiquiti', 'UniFi 6 Pro', 'Garden')
ON CONFLICT (mac_address) DO NOTHING;

-- Get AP IDs for network insertion
DO $$
DECLARE
    main_ap_id UUID;
    office_ap_id UUID;
    outdoor_ap_id UUID;
BEGIN
    SELECT id INTO main_ap_id FROM wifi_access_points WHERE ap_name = 'Main Access Point';
    SELECT id INTO office_ap_id FROM wifi_access_points WHERE ap_name = 'Office Access Point';
    SELECT id INTO outdoor_ap_id FROM wifi_access_points WHERE ap_name = 'Outdoor Access Point';

    -- Insert Wi-Fi networks with VLAN mapping
    INSERT INTO wifi_networks (ap_id, ssid, vlan_id, network_type, encryption_type, frequency_band, description) VALUES
    (main_ap_id, 'Infinite-Admin', 10, 'admin', 'wpa3', '5ghz', 'Yönetim cihazları için güvenli ağ'),
    (main_ap_id, 'Infinite-Home', 20, 'standard', 'wpa3', '5ghz', 'Ana ev ağı'),
    (main_ap_id, 'Infinite-IoT', 30, 'iot', 'wpa2', '2.4ghz', 'IoT cihazları için ayrı ağ'),
    (main_ap_id, 'Infinite-Guest', 40, 'guest', 'wpa2', '2.4ghz', 'Misafir ağı - internet only'),
    (office_ap_id, 'Infinite-Gaming', 50, 'standard', 'wpa3', '5ghz', 'Gaming cihazları - düşük gecikme'),
    (office_ap_id, 'Infinite-Work', 60, 'standard', 'wpa3', '5ghz', 'VoIP ve iş cihazları')
    ON CONFLICT (ap_id, ssid) DO NOTHING;
END $$;