/*
  # DNS Management System Schema

  1. New Tables
    - `dns_servers` - DNS server configurations (Google, Cloudflare, etc.)
    - `dns_profiles` - Security and filtering profiles  
    - `dns_zone_configs` - Internal zone management (home.local, etc.)
    - `dns_device_assignments` - Device-specific DNS assignments
    - `dns_query_logs` - DNS query logging and analytics
    - `dns_blocklists` - Ad/malware blocking lists
    - `dns_cache_settings` - Cache and performance settings

  2. Security
    - Enable RLS on all DNS tables
    - Add policies for authenticated users to manage DNS data
    - Add policies for reading DNS logs

  3. Performance
    - Add indexes for frequently queried columns
    - Add triggers for updated_at timestamps
*/

-- Create update_updated_at_column function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- DNS Servers table
CREATE TABLE IF NOT EXISTS dns_servers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  ip_address text NOT NULL,
  port integer DEFAULT 53,
  type text DEFAULT 'standard' CHECK (type IN ('standard', 'doh', 'dot', 'dnssec')),
  provider text CHECK (provider IN ('google', 'cloudflare', 'quad9', 'custom')),
  is_primary boolean DEFAULT false,
  is_fallback boolean DEFAULT false,
  supports_dnssec boolean DEFAULT false,
  supports_doh boolean DEFAULT false,
  supports_dot boolean DEFAULT false,
  doh_url text,
  dot_hostname text,
  response_time_ms integer DEFAULT 0,
  reliability_score numeric(3,2) DEFAULT 1.0,
  is_active boolean DEFAULT true,
  priority integer DEFAULT 100,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- DNS Profiles table
CREATE TABLE IF NOT EXISTS dns_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  profile_type text DEFAULT 'standard' CHECK (profile_type IN ('standard', 'family', 'business', 'gaming')),
  ad_blocking_enabled boolean DEFAULT false,
  malware_blocking_enabled boolean DEFAULT true,
  adult_content_blocking boolean DEFAULT false,
  social_media_blocking boolean DEFAULT false,
  gaming_blocking boolean DEFAULT false,
  custom_blocklist_urls jsonb DEFAULT '[]'::jsonb,
  whitelist_domains jsonb DEFAULT '[]'::jsonb,
  blacklist_domains jsonb DEFAULT '[]'::jsonb,
  safe_search_enabled boolean DEFAULT false,
  logging_enabled boolean DEFAULT true,
  cache_ttl_override integer,
  upstream_dns_servers jsonb DEFAULT '[]'::jsonb,
  is_default boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- DNS Zone Configs table
CREATE TABLE IF NOT EXISTS dns_zone_configs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  zone_name text NOT NULL,
  zone_type text DEFAULT 'forward' CHECK (zone_type IN ('forward', 'reverse')),
  authoritative boolean DEFAULT false,
  soa_record jsonb DEFAULT '{}'::jsonb,
  ns_records jsonb DEFAULT '[]'::jsonb,
  a_records jsonb DEFAULT '[]'::jsonb,
  aaaa_records jsonb DEFAULT '[]'::jsonb,
  cname_records jsonb DEFAULT '[]'::jsonb,
  mx_records jsonb DEFAULT '[]'::jsonb,
  txt_records jsonb DEFAULT '[]'::jsonb,
  srv_records jsonb DEFAULT '[]'::jsonb,
  auto_reverse_zone boolean DEFAULT false,
  ttl_default integer DEFAULT 3600,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- DNS Device Assignments table
CREATE TABLE IF NOT EXISTS dns_device_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  device_mac text NOT NULL,
  dns_profile_id uuid,
  custom_dns_servers jsonb DEFAULT '[]'::jsonb,
  override_global_settings boolean DEFAULT false,
  schedule_config jsonb,
  parental_controls jsonb,
  bandwidth_priority integer DEFAULT 50,
  bypass_filtering boolean DEFAULT false,
  force_safe_search boolean DEFAULT false,
  block_adult_content boolean DEFAULT false,
  log_queries boolean DEFAULT true,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  FOREIGN KEY (device_mac) REFERENCES network_devices(mac_address) ON DELETE CASCADE,
  FOREIGN KEY (dns_profile_id) REFERENCES dns_profiles(id) ON DELETE SET NULL
);

-- DNS Query Logs table
CREATE TABLE IF NOT EXISTS dns_query_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  device_mac text NOT NULL,
  client_ip inet,
  query_domain text NOT NULL,
  query_type text DEFAULT 'A',
  response_code integer,
  response_ip inet,
  response_time_ms integer,
  blocked boolean DEFAULT false,
  block_reason text,
  dns_server_used text,
  profile_applied text,
  timestamp timestamptz DEFAULT now(),
  FOREIGN KEY (device_mac) REFERENCES network_devices(mac_address) ON DELETE CASCADE
);

-- DNS Blocklists table
CREATE TABLE IF NOT EXISTS dns_blocklists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  category text DEFAULT 'custom' CHECK (category IN ('ads', 'malware', 'adult', 'social', 'gaming', 'custom')),
  source_url text,
  domains jsonb DEFAULT '[]'::jsonb,
  regex_patterns jsonb DEFAULT '[]'::jsonb,
  last_updated timestamptz,
  update_frequency text DEFAULT 'daily',
  auto_update boolean DEFAULT true,
  is_active boolean DEFAULT true,
  entry_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- DNS Cache Settings table
CREATE TABLE IF NOT EXISTS dns_cache_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_name text NOT NULL,
  cache_size_mb integer DEFAULT 256,
  default_ttl integer DEFAULT 3600,
  min_ttl integer DEFAULT 60,
  max_ttl integer DEFAULT 86400,
  negative_cache_ttl integer DEFAULT 300,
  prefetch_enabled boolean DEFAULT true,
  serve_stale_enabled boolean DEFAULT false,
  serve_stale_ttl integer DEFAULT 3600,
  compression_enabled boolean DEFAULT true,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE dns_servers ENABLE ROW LEVEL SECURITY;
ALTER TABLE dns_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE dns_zone_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE dns_device_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE dns_query_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE dns_blocklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE dns_cache_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for DNS Servers
CREATE POLICY "Users can manage DNS servers"
  ON dns_servers
  FOR ALL
  TO authenticated
  USING (true);

-- RLS Policies for DNS Profiles  
CREATE POLICY "Users can manage DNS profiles"
  ON dns_profiles
  FOR ALL
  TO authenticated
  USING (true);

-- RLS Policies for DNS Zones
CREATE POLICY "Users can manage DNS zones"
  ON dns_zone_configs
  FOR ALL
  TO authenticated
  USING (true);

-- RLS Policies for DNS Device Assignments
CREATE POLICY "Users can manage DNS device assignments"
  ON dns_device_assignments
  FOR ALL
  TO authenticated
  USING (true);

-- RLS Policies for DNS Query Logs
CREATE POLICY "Users can view DNS query logs"
  ON dns_query_logs
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "System can insert DNS query logs"
  ON dns_query_logs
  FOR INSERT
  TO authenticated
  USING (true);

-- RLS Policies for DNS Blocklists
CREATE POLICY "Users can manage DNS blocklists"
  ON dns_blocklists
  FOR ALL
  TO authenticated
  USING (true);

-- RLS Policies for DNS Cache Settings
CREATE POLICY "Users can manage DNS cache settings"
  ON dns_cache_settings
  FOR ALL
  TO authenticated
  USING (true);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_dns_servers_active ON dns_servers(is_active);
CREATE INDEX IF NOT EXISTS idx_dns_servers_priority ON dns_servers(priority ASC, is_active);
CREATE INDEX IF NOT EXISTS idx_dns_profiles_default ON dns_profiles(is_default);
CREATE INDEX IF NOT EXISTS idx_dns_device_assignments_mac ON dns_device_assignments(device_mac);
CREATE INDEX IF NOT EXISTS idx_dns_query_logs_timestamp ON dns_query_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_dns_query_logs_device ON dns_query_logs(device_mac);
CREATE INDEX IF NOT EXISTS idx_dns_query_logs_domain ON dns_query_logs(query_domain);
CREATE INDEX IF NOT EXISTS idx_dns_query_logs_blocked ON dns_query_logs(blocked);
CREATE INDEX IF NOT EXISTS idx_dns_blocklists_category ON dns_blocklists(category);

-- Updated_at triggers
CREATE TRIGGER update_dns_servers_updated_at
  BEFORE UPDATE ON dns_servers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_dns_profiles_updated_at
  BEFORE UPDATE ON dns_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_dns_zone_configs_updated_at
  BEFORE UPDATE ON dns_zone_configs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_dns_device_assignments_updated_at
  BEFORE UPDATE ON dns_device_assignments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_dns_blocklists_updated_at
  BEFORE UPDATE ON dns_blocklists
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_dns_cache_settings_updated_at
  BEFORE UPDATE ON dns_cache_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default DNS servers
INSERT INTO dns_servers (name, description, ip_address, provider, type, supports_dnssec, is_active, priority) VALUES
('Google DNS Primary', 'Google Public DNS primary server', '8.8.8.8', 'google', 'standard', true, true, 10),
('Google DNS Secondary', 'Google Public DNS secondary server', '8.8.4.4', 'google', 'standard', true, true, 20),
('Cloudflare DNS Primary', 'Cloudflare public DNS primary', '1.1.1.1', 'cloudflare', 'standard', true, true, 15),
('Cloudflare DNS Secondary', 'Cloudflare public DNS secondary', '1.0.0.1', 'cloudflare', 'standard', true, true, 25),
('Quad9 DNS', 'Quad9 secure DNS with malware blocking', '9.9.9.9', 'quad9', 'dnssec', true, true, 30)
ON CONFLICT DO NOTHING;

-- Insert default DNS profile
INSERT INTO dns_profiles (name, description, profile_type, is_default, malware_blocking_enabled, logging_enabled) VALUES
('Default Profile', 'Default DNS profile for all devices', 'standard', true, true, true)
ON CONFLICT DO NOTHING;

-- Insert default cache settings
INSERT INTO dns_cache_settings (setting_name, cache_size_mb, default_ttl) VALUES
('Default Cache', 256, 3600)
ON CONFLICT DO NOTHING;