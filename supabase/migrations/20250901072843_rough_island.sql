/*
  # Create DNS Management Tables

  1. New Tables
    - `dns_servers` - DNS server configurations (Google, Cloudflare, custom)
    - `dns_profiles` - DNS security and filtering profiles
    - `dns_zone_configs` - Internal zone management for local domains
    - `dns_device_assignments` - Device-specific DNS assignments
    - `dns_query_logs` - DNS query logging and monitoring
    - `dns_blocklists` - Whitelist/blacklist management
    - `dns_cache_settings` - TTL and cache configuration

  2. Security
    - Enable RLS on all DNS tables
    - Add policies for authenticated users to manage DNS data

  3. Changes
    - Add comprehensive DNS management structure
    - Support for DoH/DoT, DNSSEC, Pi-hole integration
    - Device-based DNS assignments
    - Query logging and analytics
*/

-- DNS Servers Configuration
CREATE TABLE IF NOT EXISTS dns_servers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  ip_address inet NOT NULL,
  port integer DEFAULT 53,
  type text NOT NULL DEFAULT 'standard', -- standard, doh, dot, dnssec
  provider text, -- google, cloudflare, quad9, custom
  is_primary boolean DEFAULT false,
  is_fallback boolean DEFAULT false,
  supports_dnssec boolean DEFAULT false,
  supports_doh boolean DEFAULT false,
  supports_dot boolean DEFAULT false,
  doh_url text,
  dot_hostname text,
  response_time_ms integer DEFAULT 0,
  reliability_score decimal(3,2) DEFAULT 1.0,
  is_active boolean DEFAULT true,
  priority integer DEFAULT 100,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- DNS Profiles for Security and Filtering
CREATE TABLE IF NOT EXISTS dns_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  profile_type text NOT NULL DEFAULT 'standard', -- standard, family, business, gaming
  ad_blocking_enabled boolean DEFAULT false,
  malware_blocking_enabled boolean DEFAULT false,
  adult_content_blocking boolean DEFAULT false,
  social_media_blocking boolean DEFAULT false,
  gaming_blocking boolean DEFAULT false,
  custom_blocklist_urls text[],
  whitelist_domains text[],
  blacklist_domains text[],
  safe_search_enabled boolean DEFAULT false,
  logging_enabled boolean DEFAULT true,
  cache_ttl_override integer,
  upstream_dns_servers uuid[] DEFAULT '{}',
  is_default boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Internal Zone Management
CREATE TABLE IF NOT EXISTS dns_zone_configs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  zone_name text NOT NULL UNIQUE, -- e.g., "home.local", "office.internal"
  zone_type text NOT NULL DEFAULT 'forward', -- forward, reverse
  authoritative boolean DEFAULT true,
  soa_record jsonb,
  ns_records jsonb DEFAULT '[]',
  a_records jsonb DEFAULT '[]',
  aaaa_records jsonb DEFAULT '[]',
  cname_records jsonb DEFAULT '[]',
  mx_records jsonb DEFAULT '[]',
  txt_records jsonb DEFAULT '[]',
  srv_records jsonb DEFAULT '[]',
  auto_reverse_zone boolean DEFAULT true,
  ttl_default integer DEFAULT 86400,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Device-Specific DNS Assignments
CREATE TABLE IF NOT EXISTS dns_device_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  device_mac text REFERENCES network_devices(mac_address) ON DELETE CASCADE,
  dns_profile_id uuid REFERENCES dns_profiles(id) ON DELETE SET NULL,
  custom_dns_servers inet[],
  override_global_settings boolean DEFAULT false,
  schedule_config jsonb, -- Time-based DNS switching
  parental_controls jsonb,
  bandwidth_priority integer DEFAULT 50,
  bypass_filtering boolean DEFAULT false,
  force_safe_search boolean DEFAULT false,
  block_adult_content boolean DEFAULT false,
  log_queries boolean DEFAULT true,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(device_mac)
);

-- DNS Query Logging
CREATE TABLE IF NOT EXISTS dns_query_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  device_mac text REFERENCES network_devices(mac_address) ON DELETE CASCADE,
  client_ip inet NOT NULL,
  query_domain text NOT NULL,
  query_type text NOT NULL DEFAULT 'A', -- A, AAAA, MX, TXT, etc.
  response_code integer,
  response_ip inet,
  response_time_ms integer,
  blocked boolean DEFAULT false,
  block_reason text,
  dns_server_used inet,
  profile_applied uuid REFERENCES dns_profiles(id),
  timestamp timestamptz DEFAULT now()
);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_dns_query_logs_domain ON dns_query_logs(query_domain);
CREATE INDEX IF NOT EXISTS idx_dns_query_logs_timestamp ON dns_query_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_dns_query_logs_device ON dns_query_logs(device_mac);

-- DNS Blocklists Management
CREATE TABLE IF NOT EXISTS dns_blocklists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  category text NOT NULL, -- ads, malware, adult, social, gaming, custom
  source_url text,
  domains text[],
  regex_patterns text[],
  last_updated timestamptz,
  update_frequency interval DEFAULT '24 hours',
  auto_update boolean DEFAULT true,
  is_active boolean DEFAULT true,
  entry_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- DNS Cache Settings
CREATE TABLE IF NOT EXISTS dns_cache_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_name text NOT NULL UNIQUE,
  cache_size_mb integer DEFAULT 100,
  default_ttl integer DEFAULT 3600,
  min_ttl integer DEFAULT 60,
  max_ttl integer DEFAULT 86400,
  negative_cache_ttl integer DEFAULT 300,
  prefetch_enabled boolean DEFAULT true,
  serve_stale_enabled boolean DEFAULT true,
  serve_stale_ttl integer DEFAULT 86400,
  compression_enabled boolean DEFAULT true,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE dns_servers ENABLE ROW LEVEL SECURITY;
ALTER TABLE dns_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE dns_zone_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE dns_device_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE dns_query_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE dns_blocklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE dns_cache_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users
CREATE POLICY "Users can manage DNS servers"
  ON dns_servers FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can manage DNS profiles"
  ON dns_profiles FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can manage DNS zones"
  ON dns_zone_configs FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can manage device DNS assignments"
  ON dns_device_assignments FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can view DNS query logs"
  ON dns_query_logs FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can manage DNS blocklists"
  ON dns_blocklists FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can manage DNS cache settings"
  ON dns_cache_settings FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Insert default DNS servers
INSERT INTO dns_servers (name, description, ip_address, provider, supports_dnssec, supports_doh, supports_dot, doh_url, dot_hostname, is_active, priority) VALUES
('Google Primary', 'Google Public DNS - Primary', '8.8.8.8', 'google', true, true, true, 'https://dns.google/dns-query', 'dns.google', true, 1),
('Google Secondary', 'Google Public DNS - Secondary', '8.8.4.4', 'google', true, true, true, 'https://dns.google/dns-query', 'dns.google', true, 2),
('Cloudflare Primary', 'Cloudflare DNS - Primary', '1.1.1.1', 'cloudflare', true, true, true, 'https://cloudflare-dns.com/dns-query', 'cloudflare-dns.com', true, 3),
('Cloudflare Secondary', 'Cloudflare DNS - Secondary', '1.0.0.1', 'cloudflare', true, true, true, 'https://cloudflare-dns.com/dns-query', 'cloudflare-dns.com', true, 4),
('Quad9 Primary', 'Quad9 Secure DNS', '9.9.9.9', 'quad9', true, true, true, 'https://dns.quad9.net/dns-query', 'dns.quad9.net', true, 5),
('Quad9 Secondary', 'Quad9 Secure DNS - Secondary', '149.112.112.112', 'quad9', true, true, true, 'https://dns.quad9.net/dns-query', 'dns.quad9.net', true, 6);

-- Insert default DNS profiles
INSERT INTO dns_profiles (name, description, profile_type, ad_blocking_enabled, malware_blocking_enabled, is_default) VALUES
('Varsayılan', 'Standart DNS profili', 'standard', false, false, true),
('Aile Güvenli', 'Çocuklar için güvenli DNS profili', 'family', true, true, false),
('İş Ağı', 'İş kullanımı için optimize edilmiş', 'business', true, true, false),
('Oyun Optimize', 'Oyun trafiği için düşük gecikme', 'gaming', false, false, false);

-- Insert default cache settings
INSERT INTO dns_cache_settings (setting_name, cache_size_mb, default_ttl, min_ttl, max_ttl) VALUES
('default', 100, 3600, 60, 86400);

-- Insert sample blocklists
INSERT INTO dns_blocklists (name, description, category, domains, is_active) VALUES
('Reklam Engelleme', 'Yaygın reklam domain''leri', 'ads', 
  ARRAY['doubleclick.net', 'googlesyndication.com', 'googleadservices.com'], true),
('Zararlı Site Engelleme', 'Bilinen zararlı siteler', 'malware',
  ARRAY['example-malware.com', 'phishing-site.org'], true),
('Sosyal Medya', 'Sosyal medya platformları', 'social',
  ARRAY['facebook.com', 'twitter.com', 'instagram.com'], false);