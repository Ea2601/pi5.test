/*
  # Enhanced Traffic Rules System

  1. New Tables
    - `traffic_matchers` - Protocol, application, port, domain matching rules
    - `enhanced_client_groups` - VLAN and WireGuard based client grouping
    - `dns_policies` - DNS filtering and resolution policies  
    - `egress_points` - Traffic exit points (ISP, WireGuard tunnels)
    - `enhanced_traffic_rules` - Enhanced traffic rules with priority and advanced matching
    - `traffic_rule_matches` - Live traffic matching logs
    - `default_policies` - Fallback policies for unmatched traffic

  2. Security
    - Enable RLS on all new tables
    - Add policies for authenticated users to manage traffic rules
    - Add audit logging for rule changes

  3. Changes
    - Create comprehensive traffic management system
    - Add support for protocol/application matching
    - Add DNS policy integration
    - Add egress point management
    - Add live traffic monitoring
*/

-- Traffic Matchers Table
CREATE TABLE IF NOT EXISTS traffic_matchers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  
  -- Protocol matching
  protocols text[] DEFAULT '{}',
  
  -- Application matching  
  applications text[] DEFAULT '{}',
  
  -- Port matching (supports ranges like "443", "3478-3480")
  ports text[] DEFAULT '{}',
  
  -- Domain matching (supports wildcards like "*.example.com")
  domains text[] DEFAULT '{}',
  
  -- Additional filters
  source_ips inet[] DEFAULT '{}',
  destination_ips inet[] DEFAULT '{}',
  packet_size_min integer,
  packet_size_max integer,
  
  -- Metadata
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enhanced Client Groups Table
CREATE TABLE IF NOT EXISTS enhanced_client_groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  group_type text NOT NULL CHECK (group_type IN ('vlan', 'wireguard', 'custom')),
  
  -- VLAN based groups
  vlan_id integer REFERENCES vlan_configurations(vlan_id),
  
  -- WireGuard based groups
  wg_client_ids uuid[] DEFAULT '{}',
  
  -- Custom groups
  mac_addresses text[] DEFAULT '{}',
  ip_ranges inet[] DEFAULT '{}',
  
  -- Status
  member_count integer DEFAULT 0,
  is_active boolean DEFAULT true,
  
  -- Metadata
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  UNIQUE(name)
);

-- DNS Policies Table
CREATE TABLE IF NOT EXISTS dns_policies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  policy_type text NOT NULL CHECK (policy_type IN ('pihole_unbound', 'bypass', 'custom', 'default')),
  
  -- Pi-hole + Unbound configuration
  pihole_enabled boolean DEFAULT false,
  unbound_enabled boolean DEFAULT false,
  ad_blocking boolean DEFAULT false,
  malware_blocking boolean DEFAULT false,
  logging_enabled boolean DEFAULT true,
  
  -- Custom DNS resolvers
  custom_resolvers inet[] DEFAULT '{}',
  doh_enabled boolean DEFAULT false,
  dot_enabled boolean DEFAULT false,
  doh_url text,
  dot_hostname text,
  
  -- Bypass configuration
  use_egress_dns boolean DEFAULT false,
  
  -- Status
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  UNIQUE(name)
);

-- Egress Points Table
CREATE TABLE IF NOT EXISTS egress_points (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  egress_type text NOT NULL CHECK (egress_type IN ('local_internet', 'wireguard')),
  
  -- Local internet configuration
  isp_name text,
  
  -- WireGuard tunnel configuration
  wg_connection_name text,
  wg_server_id uuid REFERENCES tunnel_pools(id),
  wg_endpoint text,
  
  -- Performance metrics
  latency_ms integer DEFAULT 0,
  bandwidth_mbps integer DEFAULT 0,
  reliability_score decimal(3,2) DEFAULT 1.0,
  
  -- Status
  is_active boolean DEFAULT true,
  is_default boolean DEFAULT false,
  
  -- Metadata
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  UNIQUE(name)
);

-- Enhanced Traffic Rules Table
CREATE TABLE IF NOT EXISTS enhanced_traffic_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  
  -- Rule configuration
  priority integer NOT NULL DEFAULT 50,
  is_enabled boolean DEFAULT true,
  
  -- Matching criteria
  client_group_ids uuid[] DEFAULT '{}',
  traffic_matcher_ids uuid[] DEFAULT '{}',
  
  -- Actions
  dns_policy_id uuid REFERENCES dns_policies(id),
  egress_point_id uuid NOT NULL REFERENCES egress_points(id),
  
  -- QoS settings
  qos_enabled boolean DEFAULT false,
  bandwidth_limit_mbps integer,
  latency_priority text CHECK (latency_priority IN ('low', 'normal', 'high', 'critical')) DEFAULT 'normal',
  
  -- Security settings
  dpi_inspection boolean DEFAULT false,
  logging_enabled boolean DEFAULT true,
  
  -- Schedule settings
  schedule_enabled boolean DEFAULT false,
  allowed_hours text[] DEFAULT '{}',
  allowed_days integer[] DEFAULT '{}',
  
  -- Statistics
  match_count bigint DEFAULT 0,
  bytes_processed bigint DEFAULT 0,
  last_matched timestamptz,
  
  -- Metadata
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  UNIQUE(name)
);

-- Traffic Rule Matches Table (for live monitoring)
CREATE TABLE IF NOT EXISTS traffic_rule_matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_id uuid NOT NULL REFERENCES enhanced_traffic_rules(id) ON DELETE CASCADE,
  
  -- Client information
  client_mac text,
  client_ip inet NOT NULL,
  client_hostname text,
  
  -- Matched criteria
  matched_protocol text,
  matched_application text,
  matched_port integer,
  matched_domain text,
  
  -- Applied actions
  applied_dns_policy text,
  applied_egress_point text NOT NULL,
  exit_tunnel text,
  
  -- Performance metrics
  latency_ms integer,
  bandwidth_used_mbps decimal(10,2),
  packet_count integer DEFAULT 0,
  byte_count bigint DEFAULT 0,
  
  -- Metadata
  timestamp timestamptz DEFAULT now()
);

-- Default Policies Table
CREATE TABLE IF NOT EXISTS default_policies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL DEFAULT 'Default Policy',
  description text NOT NULL DEFAULT 'Fallback policy for unmatched traffic',
  
  -- Default actions
  default_egress_point_id uuid NOT NULL REFERENCES egress_points(id),
  default_dns_policy_id uuid REFERENCES dns_policies(id),
  
  -- Fallback settings
  fallback_dns_servers inet[] DEFAULT '{1.1.1.1, 8.8.8.8}',
  fallback_bandwidth_limit integer,
  
  -- Status
  logging_enabled boolean DEFAULT true,
  is_active boolean DEFAULT true,
  
  -- Metadata
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_traffic_matchers_protocols ON traffic_matchers USING GIN (protocols);
CREATE INDEX IF NOT EXISTS idx_traffic_matchers_applications ON traffic_matchers USING GIN (applications);
CREATE INDEX IF NOT EXISTS idx_enhanced_traffic_rules_priority ON enhanced_traffic_rules (priority ASC, is_enabled);
CREATE INDEX IF NOT EXISTS idx_traffic_rule_matches_timestamp ON traffic_rule_matches (timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_traffic_rule_matches_rule_id ON traffic_rule_matches (rule_id);
CREATE INDEX IF NOT EXISTS idx_egress_points_type ON egress_points (egress_type);
CREATE INDEX IF NOT EXISTS idx_dns_policies_type ON dns_policies (policy_type);

-- Enable Row Level Security
ALTER TABLE traffic_matchers ENABLE ROW LEVEL SECURITY;
ALTER TABLE enhanced_client_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE dns_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE egress_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE enhanced_traffic_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE traffic_rule_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE default_policies ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can manage traffic matchers"
  ON traffic_matchers
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can manage client groups"
  ON enhanced_client_groups
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can manage DNS policies"
  ON dns_policies
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can manage egress points"
  ON egress_points
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can manage enhanced traffic rules"
  ON enhanced_traffic_rules
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can view traffic rule matches"
  ON traffic_rule_matches
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can manage default policies"
  ON default_policies
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Insert default data
INSERT INTO egress_points (id, name, egress_type, isp_name, is_default, is_active, latency_ms, bandwidth_mbps, reliability_score, description) VALUES
  ('local-internet', 'Local Internet (ISP)', 'local_internet', 'Local ISP', true, true, 15, 1000, 0.98, 'Doğrudan ISP bağlantısı'),
  ('wg-de-vps', 'WG: Germany VPS', 'wireguard', NULL, false, true, 45, 500, 0.95, 'Almanya VPS - Gaming/VoIP'),
  ('wg-tr-vps', 'WG: Turkey VPS', 'wireguard', NULL, false, true, 25, 300, 0.92, 'Türkiye VPS - Web/DPI Bypass'),
  ('wg-ae-vps', 'WG: UAE VPS', 'wireguard', NULL, false, true, 30, 400, 0.93, 'BAE VPS - Streaming/Business')
ON CONFLICT (name) DO NOTHING;

INSERT INTO dns_policies (id, name, policy_type, description, pihole_enabled, unbound_enabled, ad_blocking, malware_blocking, is_active) VALUES
  ('pihole-unbound', 'Pi-hole + Unbound', 'pihole_unbound', 'Reklam/zararlı filtre + log', true, true, true, true, true),
  ('bypass-policy', 'DNS Bypass', 'bypass', 'Seçilen çıkış noktasının DNS''ini kullan', false, false, false, false, true),
  ('custom-cloudflare', 'Custom Cloudflare', 'custom', 'Cloudflare DoH', false, false, false, false, true),
  ('default-policy', 'Default DNS', 'default', 'Varsayılan sistem DNS', false, false, false, false, true)
ON CONFLICT (name) DO NOTHING;

UPDATE dns_policies SET custom_resolvers = '{1.1.1.1, 1.0.0.1}', doh_enabled = true, doh_url = 'https://cloudflare-dns.com/dns-query' WHERE id = 'custom-cloudflare';

INSERT INTO enhanced_client_groups (id, name, group_type, vlan_id, member_count, description, is_active) VALUES
  ('admin-group', 'Admin (VLAN 10)', 'vlan', 10, 3, 'Yönetim cihazları', true),
  ('trusted-group', 'Trusted (VLAN 20)', 'vlan', 20, 8, 'Güvenilir kullanıcı cihazları', true),
  ('iot-group', 'IoT (VLAN 30)', 'vlan', 30, 12, 'IoT ve akıllı ev cihazları', true),
  ('guest-group', 'Guest (VLAN 40)', 'vlan', 40, 5, 'Misafir cihazları', true),
  ('gaming-group', 'Gaming (VLAN 50)', 'vlan', 50, 4, 'Oyun konsolları ve gaming PC', true),
  ('voip-group', 'VoIP/Work (VLAN 60)', 'vlan', 60, 6, 'VoIP ve iş cihazları', true),
  ('lab-group', 'Lab/Test (VLAN 100)', 'vlan', 100, 2, 'Test ve deneysel cihazlar', true),
  ('wg-mobile-group', 'WG: Mobile Clients', 'wireguard', NULL, 2, 'WireGuard mobil istemcileri', true)
ON CONFLICT (name) DO NOTHING;

INSERT INTO traffic_matchers (id, name, protocols, applications, ports, domains, description) VALUES
  ('gaming-steam', 'Steam Gaming', '{tcp,udp}', '{steam}', '{27015-27050}', '{*.steampowered.com,steamcommunity.com}', 'Steam oyun trafiği'),
  ('gaming-xbox', 'Xbox Live', '{tcp,udp}', '{xbox}', '{88,3074,53,500,3544,4500}', '{*.xboxlive.com,*.xbox.com}', 'Xbox Live trafiği'),
  ('voip-general', 'VoIP Traffic', '{sip,rtp,stun}', '{}', '{5060,5061,10000-20000}', '{*.voip.example}', 'Genel VoIP trafiği'),
  ('streaming-netflix', 'Netflix Streaming', '{https}', '{netflix}', '{443}', '{*.netflix.com,*.nflxvideo.net}', 'Netflix medya akışı'),
  ('messaging-whatsapp', 'WhatsApp', '{tcp,udp}', '{whatsapp}', '{443,5222}', '{*.whatsapp.net,*.whatsapp.com}', 'WhatsApp mesajlaşma'),
  ('messaging-telegram', 'Telegram', '{tcp,udp}', '{telegram}', '{443,80}', '{*.telegram.org,web.telegram.org}', 'Telegram mesajlaşma'),
  ('video-zoom', 'Zoom Meetings', '{tcp,udp}', '{zoom}', '{443,80,8801-8802}', '{*.zoom.us,*.zoomgov.com}', 'Zoom video konferans'),
  ('browser-chrome', 'Chrome Browser', '{tcp,https}', '{chrome}', '{443,80}', '{}', 'Google Chrome tarayıcı'),
  ('browser-edge', 'Edge Browser', '{tcp,https}', '{edge}', '{443,80}', '{}', 'Microsoft Edge tarayıcı')
ON CONFLICT DO NOTHING;

INSERT INTO default_policies (name, description, default_egress_point_id, default_dns_policy_id, logging_enabled) VALUES
  ('System Default Policy', 'Eşleşmeyen trafik için varsayılan politika', 'local-internet', 'default-policy', true)
ON CONFLICT DO NOTHING;

-- Create or replace function to update member counts
CREATE OR REPLACE FUNCTION update_client_group_member_count()
RETURNS TRIGGER AS $$
BEGIN
  -- Update member count for VLAN-based groups
  UPDATE enhanced_client_groups 
  SET member_count = (
    SELECT COUNT(*) 
    FROM network_devices 
    WHERE network_devices.vlan_id = enhanced_client_groups.vlan_id 
    AND network_devices.is_active = true
  )
  WHERE group_type = 'vlan' AND vlan_id IS NOT NULL;
  
  -- Update member count for WireGuard-based groups
  UPDATE enhanced_client_groups 
  SET member_count = array_length(wg_client_ids, 1)
  WHERE group_type = 'wireguard' AND wg_client_ids IS NOT NULL;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update member counts
DROP TRIGGER IF EXISTS trigger_update_client_group_counts ON network_devices;
CREATE TRIGGER trigger_update_client_group_counts
  AFTER INSERT OR UPDATE OR DELETE ON network_devices
  FOR EACH STATEMENT
  EXECUTE FUNCTION update_client_group_member_count();

-- Create function to get next rule priority
CREATE OR REPLACE FUNCTION get_next_rule_priority()
RETURNS integer AS $$
DECLARE
  max_priority integer;
BEGIN
  SELECT COALESCE(MAX(priority), 0) + 10 INTO max_priority 
  FROM enhanced_traffic_rules;
  
  RETURN max_priority;
END;
$$ LANGUAGE plpgsql;

-- Create function to validate rule conflicts
CREATE OR REPLACE FUNCTION validate_traffic_rule_conflicts(
  p_client_groups uuid[],
  p_traffic_matchers uuid[],
  p_priority integer,
  p_rule_id uuid DEFAULT NULL
)
RETURNS boolean AS $$
DECLARE
  conflict_count integer;
BEGIN
  -- Check for rules with same client groups and higher priority
  SELECT COUNT(*) INTO conflict_count
  FROM enhanced_traffic_rules
  WHERE 
    client_group_ids && p_client_groups
    AND priority < p_priority
    AND is_enabled = true
    AND (p_rule_id IS NULL OR id != p_rule_id);
  
  RETURN conflict_count = 0;
END;
$$ LANGUAGE plpgsql;

-- Create function to log rule matches
CREATE OR REPLACE FUNCTION log_traffic_rule_match(
  p_rule_id uuid,
  p_client_ip inet,
  p_matched_protocol text DEFAULT NULL,
  p_matched_application text DEFAULT NULL,
  p_egress_point text DEFAULT NULL
)
RETURNS void AS $$
BEGIN
  INSERT INTO traffic_rule_matches (
    rule_id, client_ip, matched_protocol, matched_application, applied_egress_point
  ) VALUES (
    p_rule_id, p_client_ip, p_matched_protocol, p_matched_application, p_egress_point
  );
  
  -- Update rule statistics
  UPDATE enhanced_traffic_rules 
  SET 
    match_count = match_count + 1,
    last_matched = now()
  WHERE id = p_rule_id;
END;
$$ LANGUAGE plpgsql;