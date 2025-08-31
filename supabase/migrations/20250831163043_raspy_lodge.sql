/*
  # Traffic Management System

  1. New Tables
    - `user_groups` - Kullanıcı grupları (Lokal 1/2/3, WG Client 1/2, vs.)
    - `vlan_groups` - VLAN grupları (10 Admin, 20 Trusted, 30 IoT, vs.)
    - `egress_targets` - Trafik çıkış hedefleri (Lokal, WG Server 1/2, vs.)
    - `dns_profiles` - DNS profilleri ve filtreleme listeleri
    - `traffic_policies` - Grup×VLAN politika matrisi
    - `draft_changes` - Taslak değişiklik sistemi
    - `network_snapshots` - Ağ yapılandırması anlık görüntüleri

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
    - Audit trails for all changes

  3. Initial Data
    - Default user groups (Lokal 1/2/3, WG Client 1/2)
    - Standard VLAN structure (10-100)
    - Basic egress targets and DNS profiles
*/

-- User Groups Table
CREATE TABLE IF NOT EXISTS user_groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  type text NOT NULL CHECK (type IN ('local', 'wg', 'custom')),
  description text,
  member_count integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

-- VLAN Groups Table
CREATE TABLE IF NOT EXISTS vlan_groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  vlan_id integer UNIQUE NOT NULL CHECK (vlan_id >= 1 AND vlan_id <= 4094),
  subnet text NOT NULL, -- CIDR notation
  gateway text,
  pool_start text,
  pool_end text,
  dns_profile_id uuid REFERENCES dns_profiles(id),
  lease_time interval DEFAULT '24 hours',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

-- DNS Profiles Table  
CREATE TABLE IF NOT EXISTS dns_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  description text,
  resolvers jsonb DEFAULT '["1.1.1.1", "8.8.8.8"]'::jsonb,
  blocklists jsonb DEFAULT '[]'::jsonb,
  custom_rules jsonb DEFAULT '{}'::jsonb,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

-- Egress Targets Table
CREATE TABLE IF NOT EXISTS egress_targets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  type text NOT NULL CHECK (type IN ('local', 'wg')),
  ref_id uuid, -- Reference to WG server if type='wg'
  priority integer DEFAULT 100,
  route_table integer, -- Linux routing table number
  health_status jsonb DEFAULT '{}'::jsonb,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

-- Traffic Policies Table (Policy Matrix)
CREATE TABLE IF NOT EXISTS traffic_policies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL REFERENCES user_groups(id),
  vlan_id uuid NOT NULL REFERENCES vlan_groups(id),
  egress_id uuid NOT NULL REFERENCES egress_targets(id),
  dns_profile_id uuid REFERENCES dns_profiles(id),
  schedule_config jsonb DEFAULT '{}'::jsonb,
  qos_config jsonb DEFAULT '{}'::jsonb,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id),
  
  -- Ensure unique policy per group-vlan combination
  UNIQUE(group_id, vlan_id)
);

-- Draft Changes Table
CREATE TABLE IF NOT EXISTS draft_changes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL CHECK (type IN ('policy', 'device', 'reservation', 'group', 'vlan')),
  action text NOT NULL CHECK (action IN ('create', 'update', 'delete')),
  target text NOT NULL,
  data jsonb NOT NULL,
  timestamp timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

-- Network Snapshots Table
CREATE TABLE IF NOT EXISTS network_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  payload jsonb NOT NULL,
  checksum text,
  size_bytes bigint,
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE user_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE vlan_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE dns_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE egress_targets ENABLE ROW LEVEL SECURITY;
ALTER TABLE traffic_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE draft_changes ENABLE ROW LEVEL SECURITY;
ALTER TABLE network_snapshots ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can read traffic configuration"
  ON user_groups FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can manage user groups"
  ON user_groups FOR ALL TO authenticated USING (created_by = auth.uid());

CREATE POLICY "Users can read VLAN configuration"
  ON vlan_groups FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can manage VLAN groups"
  ON vlan_groups FOR ALL TO authenticated USING (created_by = auth.uid());

CREATE POLICY "Users can read DNS profiles"
  ON dns_profiles FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can manage DNS profiles"
  ON dns_profiles FOR ALL TO authenticated USING (created_by = auth.uid());

CREATE POLICY "Users can read egress targets"
  ON egress_targets FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can manage egress targets"
  ON egress_targets FOR ALL TO authenticated USING (created_by = auth.uid());

CREATE POLICY "Users can read traffic policies"
  ON traffic_policies FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can manage traffic policies"
  ON traffic_policies FOR ALL TO authenticated USING (created_by = auth.uid());

CREATE POLICY "Users can read their draft changes"
  ON draft_changes FOR SELECT TO authenticated USING (created_by = auth.uid());

CREATE POLICY "Users can manage their draft changes"
  ON draft_changes FOR ALL TO authenticated USING (created_by = auth.uid());

CREATE POLICY "Users can read snapshots"
  ON network_snapshots FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can create snapshots"
  ON network_snapshots FOR INSERT TO authenticated WITH CHECK (created_by = auth.uid());

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_traffic_policies_group_vlan ON traffic_policies(group_id, vlan_id);
CREATE INDEX IF NOT EXISTS idx_traffic_policies_egress ON traffic_policies(egress_id);
CREATE INDEX IF NOT EXISTS idx_draft_changes_created_by ON draft_changes(created_by);
CREATE INDEX IF NOT EXISTS idx_draft_changes_timestamp ON draft_changes(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_vlan_groups_vlan_id ON vlan_groups(vlan_id);

-- Insert default data
-- User Groups
INSERT INTO user_groups (name, type, description, member_count) VALUES
('Lokal 1', 'local', 'Birincil yerel kullanıcı grubu', 8),
('Lokal 2', 'local', 'İkincil yerel kullanıcı grubu', 5),
('Lokal 3', 'local', 'Üçüncül yerel kullanıcı grubu', 12),
('WG Client 1', 'wg', 'WireGuard istemci grubu 1', 3),
('WG Client 2', 'wg', 'WireGuard istemci grubu 2', 7)
ON CONFLICT (name) DO NOTHING;

-- VLAN Groups
INSERT INTO vlan_groups (name, vlan_id, subnet, gateway, pool_start, pool_end) VALUES
('Admin', 10, '192.168.10.0/24', '192.168.10.1', '192.168.10.100', '192.168.10.199'),
('Trusted', 20, '192.168.20.0/24', '192.168.20.1', '192.168.20.100', '192.168.20.199'),
('IoT', 30, '192.168.30.0/24', '192.168.30.1', '192.168.30.100', '192.168.30.199'),
('Guest', 40, '192.168.40.0/24', '192.168.40.1', '192.168.40.100', '192.168.40.199'),
('Gaming', 50, '192.168.50.0/24', '192.168.50.1', '192.168.50.100', '192.168.50.199'),
('VoIP/Work', 60, '192.168.60.0/24', '192.168.60.1', '192.168.60.100', '192.168.60.199'),
('Security', 70, '192.168.70.0/24', '192.168.70.1', '192.168.70.100', '192.168.70.199'),
('Kids', 80, '192.168.80.0/24', '192.168.80.1', '192.168.80.100', '192.168.80.199'),
('Media', 90, '192.168.90.0/24', '192.168.90.1', '192.168.90.100', '192.168.90.199'),
('Lab/Test', 100, '192.168.100.0/24', '192.168.100.1', '192.168.100.100', '192.168.100.199')
ON CONFLICT (vlan_id) DO NOTHING;

-- DNS Profiles
INSERT INTO dns_profiles (name, description, resolvers, blocklists) VALUES
('Varsayılan', 'Standart DNS çözümlemesi', '["1.1.1.1", "8.8.8.8"]'::jsonb, '[]'::jsonb),
('Aile Güvenli', 'Aile dostu filtreleme', '["1.1.1.3", "1.0.0.3"]'::jsonb, '["adult", "gambling"]'::jsonb),
('İş Ağı', 'İş ortamı için optimize', '["208.67.222.222", "208.67.220.220"]'::jsonb, '["social", "games"]'::jsonb),
('Hızlı', 'Düşük gecikme odaklı', '["9.9.9.9", "149.112.112.112"]'::jsonb, '[]'::jsonb)
ON CONFLICT (name) DO NOTHING;

-- Egress Targets
INSERT INTO egress_targets (name, type, priority, route_table) VALUES
('Lokal Ağ', 'local', 100, 254),
('WG Server 1', 'wg', 200, 101),
('WG Server 2', 'wg', 300, 102)
ON CONFLICT (name) DO NOTHING;