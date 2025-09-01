/*
  # Speed Test Management System

  1. New Tables
    - `speed_test_profiles` - Test profilleri (Hızlı, Dengeli, Derin Analiz)
    - `speed_test_servers` - Test sunucuları ve yapılandırması
    - `speed_test_results` - Test sonuçları ve metrikler
    - `speed_test_schedules` - Otomatik test zamanlaması
    - `dns_ping_monitors` - DNS canlı ping izleme
    - `network_interfaces` - Test arayüzleri (eth0, wlan0, vlanX, wgX)
    - `speed_test_alerts` - Uyarı kuralları ve bildirimler
    - `wifi_access_points` - Wi-Fi erişim noktaları
    - `wifi_networks` - SSID yapılandırmaları
    - `wifi_clients` - Bağlı kablosuz cihazlar
    - `wifi_security_policies` - Wi-Fi güvenlik politikaları

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users

  3. Features
    - Çoklu test motoru desteği (Ookla, iperf3, flent)
    - DNS canlı ping monitörü
    - Otomatik sunucu seçimi
    - Kapsamlı uyarı sistemi
    - Wi-Fi VLAN entegrasyonu
*/

-- Create enum types for speed test system
CREATE TYPE speed_test_profile_enum AS ENUM ('fast', 'balanced', 'deep_analysis');
CREATE TYPE speed_test_engine_enum AS ENUM ('ookla', 'iperf3', 'flent', 'irtt');
CREATE TYPE wifi_encryption_enum AS ENUM ('open', 'wep', 'wpa2', 'wpa3', 'wpa2_enterprise', 'wpa3_enterprise');
CREATE TYPE wifi_band_enum AS ENUM ('2.4ghz', '5ghz', '6ghz');
CREATE TYPE wifi_client_status_enum AS ENUM ('connected', 'disconnected', 'blocked', 'idle');

-- Speed Test Profiles
CREATE TABLE IF NOT EXISTS speed_test_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_name text NOT NULL UNIQUE,
  description text,
  profile_type speed_test_profile_enum DEFAULT 'balanced',
  
  -- Test engine configuration
  preferred_engine speed_test_engine_enum DEFAULT 'ookla',
  parallel_threads integer DEFAULT 4,
  test_duration_seconds integer DEFAULT 30,
  warmup_seconds integer DEFAULT 5,
  
  -- Network configuration
  default_interface text DEFAULT 'auto',
  ip_version text DEFAULT 'ipv4', -- ipv4, ipv6, dual_stack
  mss_override integer,
  mtu_discovery boolean DEFAULT true,
  
  -- Measurement settings
  sampling_method text DEFAULT 'average', -- minimum, average, p90, p95, p99
  exclude_first_seconds integer DEFAULT 2,
  latency_under_load boolean DEFAULT true,
  qos_dscp_marking boolean DEFAULT false,
  
  -- Performance thresholds
  min_download_mbps numeric(10,2),
  min_upload_mbps numeric(10,2),
  max_latency_ms integer,
  max_jitter_ms integer,
  max_packet_loss_percent numeric(5,2),
  
  is_default boolean DEFAULT false,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Speed Test Servers
CREATE TABLE IF NOT EXISTS speed_test_servers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  server_name text NOT NULL,
  server_url text NOT NULL,
  server_type text DEFAULT 'ookla', -- ookla, iperf3, custom
  
  -- Geographic information
  country_code text NOT NULL,
  city text,
  asn integer,
  sponsor text,
  
  -- Performance metrics
  avg_latency_ms integer DEFAULT 0,
  reliability_score numeric(3,2) DEFAULT 1.0,
  last_tested timestamptz,
  
  -- Configuration
  port integer DEFAULT 80,
  protocol text DEFAULT 'https',
  auth_token text,
  preshared_key text,
  
  -- Filtering and selection
  is_preferred boolean DEFAULT false,
  is_whitelisted boolean DEFAULT true,
  is_blacklisted boolean DEFAULT false,
  priority_score integer DEFAULT 50,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Speed Test Results
CREATE TABLE IF NOT EXISTS speed_test_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid REFERENCES speed_test_profiles(id),
  server_id uuid REFERENCES speed_test_servers(id),
  
  -- Test metadata
  test_engine speed_test_engine_enum NOT NULL,
  interface_used text NOT NULL,
  ip_version text NOT NULL,
  test_duration_seconds integer,
  
  -- Performance results
  download_mbps numeric(10,2),
  upload_mbps numeric(10,2),
  ping_ms numeric(8,2),
  jitter_ms numeric(8,2),
  packet_loss_percent numeric(5,2),
  
  -- Advanced metrics
  idle_ping_ms numeric(8,2),
  loaded_ping_ms numeric(8,2),
  bufferbloat_score text, -- A, B, C, D, F
  mos_score numeric(3,2), -- Mean Opinion Score for VoIP
  
  -- Network details
  server_info jsonb,
  network_interface_info jsonb,
  tcp_info jsonb,
  error_details text,
  
  -- Quality metrics
  download_consistency numeric(5,2), -- % variation
  upload_consistency numeric(5,2),
  retransmission_rate numeric(5,2),
  
  -- Test context
  vlan_id integer,
  vpn_tunnel text,
  traffic_policy text,
  concurrent_users integer,
  cpu_usage_percent integer,
  
  success boolean DEFAULT true,
  test_started_at timestamptz DEFAULT now(),
  test_completed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- DNS Ping Monitors
CREATE TABLE IF NOT EXISTS dns_ping_monitors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  monitor_name text NOT NULL,
  target_type text DEFAULT 'dns_server', -- dns_server, custom_host
  
  -- Target configuration
  target_ip inet NOT NULL,
  target_hostname text,
  target_description text,
  
  -- Ping configuration
  interval_ms integer DEFAULT 1000,
  packet_size_bytes integer DEFAULT 64,
  timeout_ms integer DEFAULT 5000,
  packet_count integer DEFAULT 100,
  
  -- Thresholds
  warning_rtt_ms integer DEFAULT 50,
  critical_rtt_ms integer DEFAULT 100,
  warning_jitter_ms integer DEFAULT 10,
  critical_jitter_ms integer DEFAULT 20,
  warning_loss_percent numeric(5,2) DEFAULT 5.0,
  critical_loss_percent numeric(5,2) DEFAULT 10.0,
  
  -- Status
  is_active boolean DEFAULT true,
  last_ping_at timestamptz,
  last_rtt_ms numeric(8,2),
  last_status text DEFAULT 'unknown',
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- DNS Ping Results
CREATE TABLE IF NOT EXISTS dns_ping_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  monitor_id uuid REFERENCES dns_ping_monitors(id) ON DELETE CASCADE,
  
  -- Ping results
  rtt_ms numeric(8,2),
  packet_loss_percent numeric(5,2),
  jitter_ms numeric(8,2),
  packets_sent integer,
  packets_received integer,
  
  -- Additional metrics
  min_rtt_ms numeric(8,2),
  max_rtt_ms numeric(8,2),
  avg_rtt_ms numeric(8,2),
  stddev_rtt_ms numeric(8,2),
  
  timestamp timestamptz DEFAULT now()
);

-- Network Interfaces
CREATE TABLE IF NOT EXISTS network_interfaces (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  interface_name text NOT NULL UNIQUE,
  interface_type text NOT NULL, -- ethernet, wifi, vpn, vlan, loopback
  description text,
  
  -- Interface properties
  mac_address text,
  ip_address inet,
  netmask inet,
  gateway_ip inet,
  mtu integer DEFAULT 1500,
  
  -- Status
  is_up boolean DEFAULT false,
  is_running boolean DEFAULT false,
  speed_mbps integer,
  duplex_mode text, -- full, half, auto
  
  -- Statistics
  rx_bytes bigint DEFAULT 0,
  tx_bytes bigint DEFAULT 0,
  rx_packets bigint DEFAULT 0,
  tx_packets bigint DEFAULT 0,
  rx_errors bigint DEFAULT 0,
  tx_errors bigint DEFAULT 0,
  
  -- VLAN information
  parent_interface text,
  vlan_id integer,
  
  -- VPN information
  vpn_type text, -- wireguard, openvpn
  tunnel_endpoint text,
  
  is_enabled boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Speed Test Schedules
CREATE TABLE IF NOT EXISTS speed_test_schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  schedule_name text NOT NULL,
  description text,
  profile_id uuid REFERENCES speed_test_profiles(id),
  
  -- Schedule configuration
  schedule_type text DEFAULT 'interval', -- interval, cron, manual
  interval_minutes integer, -- For interval type
  cron_expression text, -- For cron type
  timezone text DEFAULT 'Europe/Istanbul',
  
  -- Execution settings
  random_delay_minutes integer DEFAULT 0,
  max_execution_time_minutes integer DEFAULT 10,
  
  -- Conditions
  cpu_threshold_percent integer DEFAULT 70,
  active_voip_check boolean DEFAULT true,
  active_gaming_check boolean DEFAULT true,
  disk_io_threshold integer DEFAULT 50,
  
  -- Status
  is_active boolean DEFAULT true,
  last_execution timestamptz,
  next_execution timestamptz,
  execution_count integer DEFAULT 0,
  failure_count integer DEFAULT 0,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Speed Test Alerts
CREATE TABLE IF NOT EXISTS speed_test_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_name text NOT NULL,
  description text,
  
  -- Alert conditions
  metric_type text NOT NULL, -- download, upload, ping, jitter, packet_loss, bufferbloat
  threshold_value numeric(10,2) NOT NULL,
  comparison_operator text DEFAULT 'less_than', -- less_than, greater_than, equals
  consecutive_failures integer DEFAULT 1,
  
  -- Notification settings
  notification_channels text[] DEFAULT '{}', -- telegram, webhook, email
  webhook_url text,
  telegram_chat_id text,
  email_recipients text[],
  
  -- Auto-actions
  auto_actions jsonb DEFAULT '{}',
  
  -- Status
  is_active boolean DEFAULT true,
  trigger_count integer DEFAULT 0,
  last_triggered timestamptz,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Wi-Fi Access Points
CREATE TABLE IF NOT EXISTS wifi_access_points (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ap_name text NOT NULL,
  description text,
  mac_address text UNIQUE NOT NULL,
  ip_address inet,
  location text,
  vendor text DEFAULT 'Unknown',
  model text,
  firmware_version text,
  
  -- Physical properties
  max_clients integer DEFAULT 50,
  supported_bands wifi_band_enum[] DEFAULT ARRAY['2.4ghz', '5ghz'],
  max_tx_power integer DEFAULT 20, -- dBm
  antenna_count integer DEFAULT 2,
  
  -- Configuration
  management_url text,
  snmp_community text,
  admin_username text,
  admin_password_hash text,
  
  -- Status
  is_online boolean DEFAULT true,
  last_seen timestamptz DEFAULT now(),
  cpu_usage integer DEFAULT 0,
  memory_usage integer DEFAULT 0,
  temperature integer DEFAULT 0,
  uptime_seconds integer DEFAULT 0,
  
  -- Mesh configuration
  is_mesh_enabled boolean DEFAULT false,
  mesh_role text DEFAULT 'standalone', -- standalone, controller, node
  mesh_backhaul_type text DEFAULT 'auto', -- auto, ethernet, wireless
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Wi-Fi Network Configurations (SSIDs)
CREATE TABLE IF NOT EXISTS wifi_networks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ap_id uuid REFERENCES wifi_access_points(id) ON DELETE CASCADE,
  
  -- Basic settings
  ssid text NOT NULL,
  description text,
  vlan_id integer,
  network_type text DEFAULT 'standard', -- standard, guest, iot, admin
  
  -- Security settings
  encryption_type wifi_encryption_enum DEFAULT 'wpa3',
  passphrase text,
  hide_ssid boolean DEFAULT false,
  mac_filtering_enabled boolean DEFAULT false,
  allowed_macs text[] DEFAULT '{}',
  blocked_macs text[] DEFAULT '{}',
  
  -- Network configuration
  frequency_band wifi_band_enum DEFAULT '5ghz',
  channel integer,
  channel_width integer DEFAULT 80, -- MHz
  tx_power integer DEFAULT 20, -- dBm
  
  -- Advanced features
  band_steering_enabled boolean DEFAULT true,
  fast_roaming_enabled boolean DEFAULT true, -- 802.11r
  load_balancing_enabled boolean DEFAULT true,
  captive_portal_enabled boolean DEFAULT false,
  captive_portal_url text,
  
  -- Access control
  max_clients integer DEFAULT 50,
  client_isolation boolean DEFAULT false,
  internet_access boolean DEFAULT true,
  local_access boolean DEFAULT true,
  
  -- QoS and performance
  qos_enabled boolean DEFAULT true,
  bandwidth_limit_mbps integer,
  priority_level integer DEFAULT 50, -- 1-100
  
  -- Scheduling
  schedule_enabled boolean DEFAULT false,
  schedule_config jsonb DEFAULT '{}',
  
  -- Status
  is_enabled boolean DEFAULT true,
  client_count integer DEFAULT 0,
  last_activity timestamptz DEFAULT now(),
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  UNIQUE(ap_id, ssid)
);

-- Wi-Fi Connected Clients
CREATE TABLE IF NOT EXISTS wifi_clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  network_id uuid REFERENCES wifi_networks(id) ON DELETE CASCADE,
  ap_id uuid REFERENCES wifi_access_points(id) ON DELETE CASCADE,
  
  -- Client identification
  mac_address text NOT NULL,
  ip_address inet,
  hostname text,
  device_name text,
  device_type text DEFAULT 'unknown',
  vendor text DEFAULT 'Unknown',
  
  -- Connection details
  connected_ssid text NOT NULL,
  frequency_band wifi_band_enum,
  channel integer,
  connection_status wifi_client_status_enum DEFAULT 'connected',
  
  -- Signal and performance
  signal_strength_dbm integer, -- RSSI
  noise_level_dbm integer,
  snr_db integer, -- Signal-to-Noise Ratio
  data_rate_mbps integer,
  
  -- Session tracking
  connected_at timestamptz DEFAULT now(),
  last_seen timestamptz DEFAULT now(),
  session_duration interval,
  disconnection_reason text,
  
  -- Traffic statistics
  bytes_sent bigint DEFAULT 0,
  bytes_received bigint DEFAULT 0,
  packets_sent bigint DEFAULT 0,
  packets_received bigint DEFAULT 0,
  
  -- Security
  authentication_method text,
  encryption_used text,
  is_authorized boolean DEFAULT true,
  failed_auth_attempts integer DEFAULT 0,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  UNIQUE(ap_id, mac_address)
);

-- Wi-Fi Security Policies
CREATE TABLE IF NOT EXISTS wifi_security_policies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  policy_name text NOT NULL,
  description text,
  policy_type text NOT NULL, -- mac_filter, time_restriction, device_limit, bandwidth_limit
  
  -- Target configuration
  apply_to_networks uuid[] DEFAULT '{}', -- Apply to specific SSIDs
  apply_to_vlans integer[] DEFAULT '{}', -- Apply to VLANs
  apply_to_device_types text[] DEFAULT '{}', -- Apply to device types
  
  -- Policy rules
  conditions jsonb DEFAULT '{}',
  actions jsonb DEFAULT '{}',
  
  -- Time-based rules
  time_restrictions jsonb DEFAULT '{}', -- Daily/weekly schedules
  parental_controls jsonb DEFAULT '{}', -- Kids device restrictions
  
  -- MAC filtering
  whitelist_macs text[] DEFAULT '{}',
  blacklist_macs text[] DEFAULT '{}',
  auto_whitelist_known_devices boolean DEFAULT false,
  
  -- Rate limiting
  bandwidth_limit_mbps integer,
  connection_time_limit integer, -- minutes
  daily_data_limit_mb integer,
  
  -- Captive portal
  captive_portal_config jsonb DEFAULT '{}',
  
  -- Status and metrics
  is_active boolean DEFAULT true,
  priority integer DEFAULT 50,
  violation_count integer DEFAULT 0,
  last_violation timestamptz,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_speed_test_results_test_started ON speed_test_results(test_started_at);
CREATE INDEX IF NOT EXISTS idx_speed_test_results_profile ON speed_test_results(profile_id);
CREATE INDEX IF NOT EXISTS idx_speed_test_results_server ON speed_test_results(server_id);
CREATE INDEX IF NOT EXISTS idx_dns_ping_results_monitor ON dns_ping_results(monitor_id);
CREATE INDEX IF NOT EXISTS idx_dns_ping_results_timestamp ON dns_ping_results(timestamp);
CREATE INDEX IF NOT EXISTS idx_network_interfaces_name ON network_interfaces(interface_name);
CREATE INDEX IF NOT EXISTS idx_wifi_clients_mac ON wifi_clients(mac_address);
CREATE INDEX IF NOT EXISTS idx_wifi_clients_network ON wifi_clients(network_id);
CREATE INDEX IF NOT EXISTS idx_wifi_clients_status ON wifi_clients(connection_status);

-- Enable Row Level Security
ALTER TABLE speed_test_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE speed_test_servers ENABLE ROW LEVEL SECURITY;
ALTER TABLE speed_test_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE speed_test_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE dns_ping_monitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE dns_ping_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE network_interfaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE speed_test_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE wifi_access_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE wifi_networks ENABLE ROW LEVEL SECURITY;
ALTER TABLE wifi_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE wifi_security_policies ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can manage speed test profiles"
  ON speed_test_profiles FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can manage speed test servers"
  ON speed_test_servers FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can view speed test results"
  ON speed_test_results FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can manage schedules"
  ON speed_test_schedules FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can manage DNS monitors"
  ON dns_ping_monitors FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can view DNS ping results"
  ON dns_ping_results FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can view network interfaces"
  ON network_interfaces FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can manage speed test alerts"
  ON speed_test_alerts FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can manage Wi-Fi access points"
  ON wifi_access_points FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can manage Wi-Fi networks"
  ON wifi_networks FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can view Wi-Fi clients"
  ON wifi_clients FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can manage Wi-Fi security policies"
  ON wifi_security_policies FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Insert default speed test profiles
INSERT INTO speed_test_profiles (profile_name, description, profile_type, test_duration_seconds, parallel_threads) VALUES
('Hızlı Test', 'Hızlı genel bağlantı kontrolü', 'fast', 15, 2),
('Dengeli Test', 'Dengeli performans ve doğruluk', 'balanced', 30, 4),
('Derin Analiz', 'Kapsamlı QoE analizi', 'deep_analysis', 60, 8);

-- Insert default speed test servers
INSERT INTO speed_test_servers (server_name, server_url, country_code, city, sponsor, priority_score) VALUES
('Türkiye - İstanbul', 'https://istanbul.speedtest.net', 'TR', 'İstanbul', 'Türk Telekom', 90),
('UAE - Dubai', 'https://dubai.speedtest.net', 'AE', 'Dubai', 'Etisalat', 85),
('Germany - Frankfurt', 'https://frankfurt.speedtest.net', 'DE', 'Frankfurt', 'Deutsche Telekom', 80),
('Turkey - Ankara', 'https://ankara.speedtest.net', 'TR', 'Ankara', 'TTNet', 75),
('Netherlands - Amsterdam', 'https://amsterdam.speedtest.net', 'NL', 'Amsterdam', 'KPN', 70);

-- Insert default DNS ping monitors
INSERT INTO dns_ping_monitors (monitor_name, target_ip, target_hostname, target_description) VALUES
('Cloudflare Primary', '1.1.1.1', 'one.one.one.one', 'Cloudflare DNS - Primary'),
('Cloudflare Secondary', '1.0.0.1', 'one.one.one.one', 'Cloudflare DNS - Secondary'),
('Google Primary', '8.8.8.8', 'dns.google', 'Google DNS - Primary'),
('Google Secondary', '8.8.4.4', 'dns.google', 'Google DNS - Secondary'),
('Quad9 Primary', '9.9.9.9', 'dns.quad9.net', 'Quad9 Secure DNS'),
('Etisalat UAE', '213.42.20.20', 'dns.etisalat.ae', 'Etisalat UAE DNS'),
('Türk Telekom', '194.27.1.1', 'dns.ttnet.net.tr', 'Türk Telekom DNS');

-- Insert default network interfaces
INSERT INTO network_interfaces (interface_name, interface_type, description, mtu) VALUES
('eth0', 'ethernet', 'Ana Ethernet Arayüzü', 1500),
('wlan0', 'wifi', 'Wi-Fi Arayüzü', 1500),
('lo', 'loopback', 'Loopback Arayüzü', 65536);

-- Insert sample Wi-Fi access points
INSERT INTO wifi_access_points (ap_name, mac_address, ip_address, vendor, model, location) VALUES
('Main Access Point', '00:1A:2B:3C:4D:5E', '192.168.1.10', 'TP-Link', 'AX6000', 'Living Room'),
('Office Access Point', '00:1A:2B:3C:4D:5F', '192.168.1.11', 'ASUS', 'AX6100', 'Office'),
('Outdoor Access Point', '00:1A:2B:3C:4D:60', '192.168.1.12', 'Ubiquiti', 'UniFi 6 Pro', 'Garden')
ON CONFLICT (mac_address) DO NOTHING;

-- Insert sample Wi-Fi networks with VLAN mapping
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

-- Create triggers for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_speed_test_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_speed_test_profiles_updated_at
    BEFORE UPDATE ON speed_test_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_speed_test_updated_at_column();

CREATE TRIGGER update_speed_test_servers_updated_at
    BEFORE UPDATE ON speed_test_servers
    FOR EACH ROW
    EXECUTE FUNCTION update_speed_test_updated_at_column();

CREATE TRIGGER update_speed_test_schedules_updated_at
    BEFORE UPDATE ON speed_test_schedules
    FOR EACH ROW
    EXECUTE FUNCTION update_speed_test_updated_at_column();

CREATE TRIGGER update_dns_ping_monitors_updated_at
    BEFORE UPDATE ON dns_ping_monitors
    FOR EACH ROW
    EXECUTE FUNCTION update_speed_test_updated_at_column();

CREATE TRIGGER update_network_interfaces_updated_at
    BEFORE UPDATE ON network_interfaces
    FOR EACH ROW
    EXECUTE FUNCTION update_speed_test_updated_at_column();

CREATE TRIGGER update_speed_test_alerts_updated_at
    BEFORE UPDATE ON speed_test_alerts
    FOR EACH ROW
    EXECUTE FUNCTION update_speed_test_updated_at_column();

CREATE TRIGGER update_wifi_access_points_updated_at
    BEFORE UPDATE ON wifi_access_points
    FOR EACH ROW
    EXECUTE FUNCTION update_speed_test_updated_at_column();

CREATE TRIGGER update_wifi_networks_updated_at
    BEFORE UPDATE ON wifi_networks
    FOR EACH ROW
    EXECUTE FUNCTION update_speed_test_updated_at_column();

CREATE TRIGGER update_wifi_clients_updated_at
    BEFORE UPDATE ON wifi_clients
    FOR EACH ROW
    EXECUTE FUNCTION update_speed_test_updated_at_column();

CREATE TRIGGER update_wifi_security_policies_updated_at
    BEFORE UPDATE ON wifi_security_policies
    FOR EACH ROW
    EXECUTE FUNCTION update_speed_test_updated_at_column();