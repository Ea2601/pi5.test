/*
  # DHCP Management System

  1. New Tables
    - `dhcp_pools` - IP pool definitions for each VLAN
    - `dhcp_reservations` - Static IP assignments (MAC binding)
    - `dhcp_leases` - Active DHCP leases tracking
    - `dhcp_device_groups` - Device grouping for policy application
    - `dhcp_security_policies` - MAC filtering and security rules
    - `dhcp_options` - Custom DHCP options (PXE, VoIP, etc.)
    - `dhcp_logs` - DHCP server activity logs

  2. Security
    - Enable RLS on all DHCP tables
    - Add policies for authenticated users to manage DHCP data

  3. Features
    - VLAN-based IP pools
    - Static IP reservations
    - Device grouping (Admin, IoT, Guest, Gaming)
    - Security policies and MAC filtering
    - Custom DHCP options for PXE, VoIP
    - Comprehensive logging
*/

-- DHCP IP Pools (VLAN-based)
CREATE TABLE IF NOT EXISTS dhcp_pools (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  vlan_id integer NOT NULL,
  network_cidr inet NOT NULL,
  start_ip inet NOT NULL,
  end_ip inet NOT NULL,
  gateway_ip inet NOT NULL,
  subnet_mask inet NOT NULL,
  dns_servers inet[] DEFAULT ARRAY['1.1.1.1'::inet, '8.8.8.8'::inet],
  lease_time interval DEFAULT '24 hours',
  max_lease_time interval DEFAULT '7 days',
  is_active boolean DEFAULT true,
  allow_unknown_clients boolean DEFAULT true,
  require_authorization boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- DHCP Static Reservations (MAC Binding)
CREATE TABLE IF NOT EXISTS dhcp_reservations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mac_address text NOT NULL UNIQUE,
  ip_address inet NOT NULL,
  hostname text,
  device_group_id uuid,
  dhcp_pool_id uuid REFERENCES dhcp_pools(id) ON DELETE CASCADE,
  custom_dns_servers inet[],
  custom_options jsonb DEFAULT '{}',
  lease_time_override interval,
  is_active boolean DEFAULT true,
  description text,
  expires_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- DHCP Device Groups
CREATE TABLE IF NOT EXISTS dhcp_device_groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text,
  group_type text DEFAULT 'custom' CHECK (group_type IN ('admin', 'iot', 'guest', 'gaming', 'voip', 'custom')),
  default_vlan_id integer,
  default_lease_time interval DEFAULT '24 hours',
  mac_filtering_enabled boolean DEFAULT false,
  allowed_mac_patterns text[],
  custom_dhcp_options jsonb DEFAULT '{}',
  bandwidth_limit_mbps integer,
  priority integer DEFAULT 50,
  time_restrictions jsonb,
  dns_profile_override uuid,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- DHCP Active Leases
CREATE TABLE IF NOT EXISTS dhcp_leases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mac_address text NOT NULL,
  ip_address inet NOT NULL,
  hostname text,
  dhcp_pool_id uuid REFERENCES dhcp_pools(id),
  device_group_id uuid REFERENCES dhcp_device_groups(id),
  lease_start timestamptz DEFAULT now(),
  lease_end timestamptz NOT NULL,
  client_identifier text,
  vendor_class text,
  user_class text,
  fingerprint text,
  state text DEFAULT 'active' CHECK (state IN ('active', 'expired', 'declined', 'released')),
  renewal_count integer DEFAULT 0,
  last_renewal timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- DHCP Security Policies
CREATE TABLE IF NOT EXISTS dhcp_security_policies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  policy_type text DEFAULT 'mac_filter' CHECK (policy_type IN ('mac_filter', 'time_restriction', 'vendor_filter', 'custom')),
  conditions jsonb NOT NULL DEFAULT '{}',
  actions jsonb NOT NULL DEFAULT '{}',
  apply_to_groups uuid[],
  apply_to_vlans integer[],
  priority integer DEFAULT 100,
  is_active boolean DEFAULT true,
  violation_count integer DEFAULT 0,
  last_violation timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- DHCP Custom Options (PXE, VoIP, etc.)
CREATE TABLE IF NOT EXISTS dhcp_options (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  option_code integer NOT NULL,
  option_type text DEFAULT 'string' CHECK (option_type IN ('string', 'ip', 'integer', 'boolean', 'hex')),
  option_value text NOT NULL,
  description text,
  apply_to_pools uuid[],
  apply_to_groups uuid[],
  apply_to_devices text[], -- MAC addresses
  is_vendor_specific boolean DEFAULT false,
  vendor_class text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- DHCP Activity Logs
CREATE TABLE IF NOT EXISTS dhcp_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL CHECK (event_type IN ('discover', 'offer', 'request', 'ack', 'nak', 'decline', 'release', 'inform')),
  mac_address text NOT NULL,
  ip_address inet,
  hostname text,
  dhcp_pool_id uuid REFERENCES dhcp_pools(id),
  transaction_id text,
  client_identifier text,
  vendor_class text,
  requested_options integer[],
  lease_time interval,
  server_response_time_ms integer,
  success boolean DEFAULT true,
  error_message text,
  timestamp timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_dhcp_pools_vlan ON dhcp_pools(vlan_id);
CREATE INDEX IF NOT EXISTS idx_dhcp_pools_active ON dhcp_pools(is_active);
CREATE INDEX IF NOT EXISTS idx_dhcp_reservations_mac ON dhcp_reservations(mac_address);
CREATE INDEX IF NOT EXISTS idx_dhcp_reservations_ip ON dhcp_reservations(ip_address);
CREATE INDEX IF NOT EXISTS idx_dhcp_leases_mac ON dhcp_leases(mac_address);
CREATE INDEX IF NOT EXISTS idx_dhcp_leases_ip ON dhcp_leases(ip_address);
CREATE INDEX IF NOT EXISTS idx_dhcp_leases_state ON dhcp_leases(state);
CREATE INDEX IF NOT EXISTS idx_dhcp_leases_expiry ON dhcp_leases(lease_end);
CREATE INDEX IF NOT EXISTS idx_dhcp_logs_timestamp ON dhcp_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_dhcp_logs_mac ON dhcp_logs(mac_address);
CREATE INDEX IF NOT EXISTS idx_dhcp_logs_event ON dhcp_logs(event_type);

-- Enable Row Level Security
ALTER TABLE dhcp_pools ENABLE ROW LEVEL SECURITY;
ALTER TABLE dhcp_reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE dhcp_device_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE dhcp_leases ENABLE ROW LEVEL SECURITY;
ALTER TABLE dhcp_security_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE dhcp_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE dhcp_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can manage DHCP pools"
  ON dhcp_pools FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can manage DHCP reservations"
  ON dhcp_reservations FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can manage device groups"
  ON dhcp_device_groups FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can view DHCP leases"
  ON dhcp_leases FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can manage security policies"
  ON dhcp_security_policies FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can manage DHCP options"
  ON dhcp_options FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can view DHCP logs"
  ON dhcp_logs FOR SELECT
  TO authenticated
  USING (true);

-- Insert default DHCP pools for common VLANs
INSERT INTO dhcp_pools (name, description, vlan_id, network_cidr, start_ip, end_ip, gateway_ip, subnet_mask, dns_servers, lease_time) VALUES
  ('Admin Network', 'Administrative devices', 10, '192.168.10.0/24', '192.168.10.100', '192.168.10.199', '192.168.10.1', '255.255.255.0', ARRAY['192.168.10.1'::inet], '24 hours'),
  ('Trusted Network', 'Trusted user devices', 20, '192.168.20.0/24', '192.168.20.100', '192.168.20.199', '192.168.20.1', '255.255.255.0', ARRAY['1.1.1.1'::inet, '8.8.8.8'::inet], '24 hours'),
  ('IoT Network', 'Internet of Things devices', 30, '192.168.30.0/24', '192.168.30.100', '192.168.30.199', '192.168.30.1', '255.255.255.0', ARRAY['1.1.1.1'::inet], '12 hours'),
  ('Guest Network', 'Guest and temporary devices', 40, '192.168.40.0/24', '192.168.40.100', '192.168.40.199', '192.168.40.1', '255.255.255.0', ARRAY['1.1.1.1'::inet, '8.8.8.8'::inet], '4 hours'),
  ('Gaming Network', 'Gaming consoles and devices', 50, '192.168.50.0/24', '192.168.50.100', '192.168.50.149', '192.168.50.1', '255.255.255.0', ARRAY['1.1.1.1'::inet], '48 hours'),
  ('VoIP Network', 'Voice over IP devices', 60, '192.168.60.0/24', '192.168.60.100', '192.168.60.199', '192.168.60.1', '255.255.255.0', ARRAY['192.168.60.1'::inet], '7 days'),
  ('Security Network', 'Security cameras and systems', 70, '192.168.70.0/24', '192.168.70.100', '192.168.70.199', '192.168.70.1', '255.255.255.0', ARRAY['192.168.70.1'::inet], '7 days'),
  ('Kids Network', 'Children devices with restrictions', 80, '192.168.80.0/24', '192.168.80.100', '192.168.80.199', '192.168.80.1', '255.255.255.0', ARRAY['1.1.1.3'::inet], '8 hours'),
  ('Media Network', 'Streaming and media devices', 90, '192.168.90.0/24', '192.168.90.100', '192.168.90.199', '192.168.90.1', '255.255.255.0', ARRAY['1.1.1.1'::inet], '24 hours'),
  ('Lab Network', 'Testing and development', 100, '192.168.100.0/24', '192.168.100.100', '192.168.100.199', '192.168.100.1', '255.255.255.0', ARRAY['8.8.8.8'::inet], '2 hours');

-- Insert default device groups
INSERT INTO dhcp_device_groups (name, description, group_type, default_vlan_id, default_lease_time, mac_filtering_enabled) VALUES
  ('Admin Devices', 'Network administrators devices', 'admin', 10, '7 days', true),
  ('IoT Devices', 'Internet of Things sensors and devices', 'iot', 30, '12 hours', true),
  ('Guest Devices', 'Temporary and guest access devices', 'guest', 40, '4 hours', false),
  ('Gaming Devices', 'Gaming consoles and related equipment', 'gaming', 50, '48 hours', false),
  ('VoIP Devices', 'Voice communication equipment', 'voip', 60, '7 days', true);

-- Insert common DHCP options
INSERT INTO dhcp_options (name, option_code, option_type, option_value, description, is_vendor_specific) VALUES
  ('Router (Gateway)', 3, 'ip', '192.168.1.1', 'Default gateway for clients', false),
  ('Domain Name Server', 6, 'ip', '1.1.1.1,8.8.8.8', 'DNS servers for name resolution', false),
  ('Domain Name', 15, 'string', 'local', 'Domain suffix for hostname resolution', false),
  ('NTP Server', 42, 'ip', '192.168.1.1', 'Network Time Protocol server', false),
  ('PXE Boot Server', 66, 'string', '192.168.10.1', 'TFTP server for PXE network boot', false),
  ('PXE Boot Filename', 67, 'string', 'pxelinux.0', 'Boot filename for PXE clients', false),
  ('VoIP Server', 150, 'ip', '192.168.60.10', 'SIP server for VoIP devices', true),
  ('Vendor Class Identifier', 60, 'string', 'PXEClient', 'Client class identification', false);

-- Create trigger function for updating timestamps
CREATE OR REPLACE FUNCTION update_dhcp_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_dhcp_pools_updated_at BEFORE UPDATE ON dhcp_pools FOR EACH ROW EXECUTE FUNCTION update_dhcp_updated_at_column();
CREATE TRIGGER update_dhcp_reservations_updated_at BEFORE UPDATE ON dhcp_reservations FOR EACH ROW EXECUTE FUNCTION update_dhcp_updated_at_column();
CREATE TRIGGER update_dhcp_device_groups_updated_at BEFORE UPDATE ON dhcp_device_groups FOR EACH ROW EXECUTE FUNCTION update_dhcp_updated_at_column();
CREATE TRIGGER update_dhcp_leases_updated_at BEFORE UPDATE ON dhcp_leases FOR EACH ROW EXECUTE FUNCTION update_dhcp_updated_at_column();
CREATE TRIGGER update_dhcp_security_policies_updated_at BEFORE UPDATE ON dhcp_security_policies FOR EACH ROW EXECUTE FUNCTION update_dhcp_updated_at_column();
CREATE TRIGGER update_dhcp_options_updated_at BEFORE UPDATE ON dhcp_options FOR EACH ROW EXECUTE FUNCTION update_dhcp_updated_at_column();