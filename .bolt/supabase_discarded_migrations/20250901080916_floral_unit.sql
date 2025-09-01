/*
  # Network Topology Management System

  1. New Tables
    - `network_topology_nodes` - Physical and logical network devices
    - `network_connections` - Device interconnections and relationships  
    - `vlan_configurations` - VLAN definitions and policies
    - `traffic_flows` - Traffic routing and flow management
    - `network_segments` - Network segment definitions
    - `topology_snapshots` - Network topology snapshots for history
    - `alert_rules` - Network monitoring and alerting rules

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage topology data

  3. Indexes
    - Performance indexes for topology queries
    - VLAN and device type indexes
*/

-- Network Topology Nodes (Physical and Logical Devices)
CREATE TABLE IF NOT EXISTS network_topology_nodes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    node_name TEXT NOT NULL,
    node_type TEXT NOT NULL CHECK (node_type IN ('wan_gateway', 'router', 'switch', 'access_point', 'server', 'client', 'iot_device', 'gaming_device')),
    device_category TEXT DEFAULT 'unknown' CHECK (device_category IN ('infrastructure', 'server', 'client', 'iot', 'network', 'security', 'unknown')),
    
    -- Physical properties
    mac_address TEXT UNIQUE,
    ip_address INET,
    hostname TEXT,
    vendor TEXT DEFAULT 'Unknown',
    model TEXT,
    
    -- Topology properties
    position_x INTEGER DEFAULT 0,
    position_y INTEGER DEFAULT 0,
    parent_node_id UUID REFERENCES network_topology_nodes(id) ON DELETE SET NULL,
    vlan_id INTEGER,
    network_segment TEXT,
    
    -- Status and metrics
    is_online BOOLEAN DEFAULT TRUE,
    last_seen TIMESTAMPTZ DEFAULT NOW(),
    ping_latency_ms INTEGER DEFAULT 0,
    bandwidth_usage_mbps DECIMAL(10,2) DEFAULT 0.0,
    port_count INTEGER DEFAULT 0,
    
    -- Configuration
    management_ip INET,
    snmp_community TEXT,
    config_backup TEXT,
    firmware_version TEXT,
    
    -- Visual representation
    icon_type TEXT DEFAULT 'device',
    color_code TEXT DEFAULT '#00A36C',
    size_scale DECIMAL(3,2) DEFAULT 1.0,
    
    -- Metadata
    description TEXT,
    location TEXT,
    purchase_date DATE,
    warranty_expires DATE,
    notes TEXT,
    
    -- Audit fields
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Network Connections (Device Interconnections)
CREATE TABLE IF NOT EXISTS network_connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_node_id UUID NOT NULL REFERENCES network_topology_nodes(id) ON DELETE CASCADE,
    target_node_id UUID NOT NULL REFERENCES network_topology_nodes(id) ON DELETE CASCADE,
    
    -- Connection properties
    connection_type TEXT NOT NULL CHECK (connection_type IN ('ethernet', 'wifi', 'fiber', 'vpn', 'logical')),
    interface_name_source TEXT,
    interface_name_target TEXT,
    
    -- Performance metrics
    bandwidth_mbps INTEGER DEFAULT 1000,
    latency_ms INTEGER DEFAULT 0,
    packet_loss_percent DECIMAL(5,2) DEFAULT 0.0,
    duplex_mode TEXT DEFAULT 'full' CHECK (duplex_mode IN ('full', 'half', 'auto')),
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    link_status TEXT DEFAULT 'up' CHECK (link_status IN ('up', 'down', 'testing', 'unknown')),
    
    -- VLAN and routing
    vlan_tags INTEGER[],
    trunk_mode BOOLEAN DEFAULT FALSE,
    native_vlan INTEGER DEFAULT 1,
    
    -- Quality metrics
    utilization_percent DECIMAL(5,2) DEFAULT 0.0,
    error_count INTEGER DEFAULT 0,
    last_error TIMESTAMPTZ,
    
    -- Metadata
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Ensure no self-loops
    CONSTRAINT no_self_connection CHECK (source_node_id != target_node_id)
);

-- VLAN Configurations
CREATE TABLE IF NOT EXISTS vlan_configurations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vlan_id INTEGER NOT NULL UNIQUE CHECK (vlan_id >= 1 AND vlan_id <= 4094),
    vlan_name TEXT NOT NULL,
    description TEXT,
    
    -- Network configuration
    network_cidr INET NOT NULL,
    gateway_ip INET NOT NULL,
    dhcp_enabled BOOLEAN DEFAULT TRUE,
    dhcp_pool_id UUID REFERENCES dhcp_pools(id) ON DELETE SET NULL,
    
    -- Security and access
    security_level TEXT DEFAULT 'medium' CHECK (security_level IN ('low', 'medium', 'high', 'critical')),
    isolation_enabled BOOLEAN DEFAULT FALSE,
    inter_vlan_routing BOOLEAN DEFAULT TRUE,
    internet_access BOOLEAN DEFAULT TRUE,
    
    -- Traffic management
    bandwidth_limit_mbps INTEGER,
    traffic_priority TEXT DEFAULT 'normal' CHECK (traffic_priority IN ('low', 'normal', 'high', 'critical')),
    qos_profile TEXT DEFAULT 'default',
    
    -- DNS and DHCP
    dns_profile_id UUID REFERENCES dns_profiles(id) ON DELETE SET NULL,
    custom_dns_servers INET[],
    domain_suffix TEXT DEFAULT 'local',
    
    -- Device restrictions
    max_devices INTEGER DEFAULT 253,
    device_restrictions JSONB DEFAULT '{}',
    time_restrictions JSONB DEFAULT '{}',
    
    -- Audit and status
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Traffic Flows (Network Traffic Routing)
CREATE TABLE IF NOT EXISTS traffic_flows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    flow_name TEXT NOT NULL,
    source_vlan_id INTEGER REFERENCES vlan_configurations(vlan_id),
    destination_type TEXT NOT NULL CHECK (destination_type IN ('internet', 'local', 'vpn', 'specific_host')),
    
    -- Routing configuration
    gateway_override INET,
    route_via TEXT, -- 'wan', 'vpn_germany', 'vpn_turkey', etc.
    load_balancing BOOLEAN DEFAULT FALSE,
    failover_enabled BOOLEAN DEFAULT TRUE,
    
    -- Traffic classification
    traffic_type TEXT NOT NULL CHECK (traffic_type IN ('web', 'gaming', 'voip', 'streaming', 'iot', 'admin', 'backup')),
    protocol_filters TEXT[],
    port_ranges TEXT[],
    domain_patterns TEXT[],
    
    -- Performance requirements
    max_latency_ms INTEGER,
    min_bandwidth_mbps INTEGER,
    jitter_tolerance_ms INTEGER,
    
    -- Policy and security
    priority INTEGER DEFAULT 50 CHECK (priority >= 1 AND priority <= 100),
    security_inspection BOOLEAN DEFAULT TRUE,
    logging_enabled BOOLEAN DEFAULT TRUE,
    
    -- Status and metrics
    is_active BOOLEAN DEFAULT TRUE,
    packet_count BIGINT DEFAULT 0,
    byte_count BIGINT DEFAULT 0,
    last_used TIMESTAMPTZ,
    
    -- Audit fields
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Network Segments (Logical Network Divisions)
CREATE TABLE IF NOT EXISTS network_segments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    segment_name TEXT NOT NULL,
    segment_type TEXT NOT NULL CHECK (segment_type IN ('dmz', 'internal', 'guest', 'management', 'storage', 'lab')),
    
    -- Network configuration
    network_range INET NOT NULL,
    vlan_ids INTEGER[],
    gateway_device_id UUID REFERENCES network_topology_nodes(id),
    
    -- Security configuration
    firewall_zone TEXT,
    access_control_list JSONB DEFAULT '[]',
    security_policies JSONB DEFAULT '{}',
    
    -- Monitoring
    monitoring_enabled BOOLEAN DEFAULT TRUE,
    alerting_enabled BOOLEAN DEFAULT TRUE,
    backup_enabled BOOLEAN DEFAULT FALSE,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    device_count INTEGER DEFAULT 0,
    utilization_percent DECIMAL(5,2) DEFAULT 0.0,
    
    -- Metadata
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Topology Snapshots (Historical Network States)
CREATE TABLE IF NOT EXISTS topology_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    snapshot_name TEXT NOT NULL,
    snapshot_type TEXT DEFAULT 'manual' CHECK (snapshot_type IN ('manual', 'scheduled', 'pre_change', 'post_change')),
    
    -- Snapshot data
    nodes_data JSONB NOT NULL,
    connections_data JSONB NOT NULL,
    vlans_data JSONB NOT NULL,
    
    -- Metadata
    description TEXT,
    triggered_by TEXT,
    change_reason TEXT,
    
    -- Statistics at time of snapshot
    total_nodes INTEGER DEFAULT 0,
    total_connections INTEGER DEFAULT 0,
    total_vlans INTEGER DEFAULT 0,
    
    -- Audit fields
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Alert Rules (Network Monitoring)
CREATE TABLE IF NOT EXISTS network_alert_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rule_name TEXT NOT NULL,
    rule_type TEXT NOT NULL CHECK (rule_type IN ('device_offline', 'high_latency', 'bandwidth_exceeded', 'new_device', 'topology_change')),
    
    -- Trigger conditions
    trigger_conditions JSONB NOT NULL,
    threshold_value DECIMAL(10,2),
    threshold_unit TEXT,
    time_window_minutes INTEGER DEFAULT 5,
    
    -- Target configuration
    apply_to_nodes UUID[],
    apply_to_vlans INTEGER[],
    apply_to_segments UUID[],
    
    -- Actions
    alert_actions JSONB DEFAULT '[]',
    notification_channels TEXT[] DEFAULT ARRAY['email'],
    escalation_rules JSONB DEFAULT '{}',
    
    -- Rule management
    is_active BOOLEAN DEFAULT TRUE,
    priority INTEGER DEFAULT 50,
    cooldown_minutes INTEGER DEFAULT 15,
    
    -- Statistics
    trigger_count INTEGER DEFAULT 0,
    last_triggered TIMESTAMPTZ,
    false_positive_count INTEGER DEFAULT 0,
    
    -- Audit fields
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_topology_nodes_type ON network_topology_nodes(node_type);
CREATE INDEX IF NOT EXISTS idx_topology_nodes_vlan ON network_topology_nodes(vlan_id);
CREATE INDEX IF NOT EXISTS idx_topology_nodes_online ON network_topology_nodes(is_online, last_seen);
CREATE INDEX IF NOT EXISTS idx_topology_nodes_position ON network_topology_nodes(position_x, position_y);

CREATE INDEX IF NOT EXISTS idx_connections_source ON network_connections(source_node_id);
CREATE INDEX IF NOT EXISTS idx_connections_target ON network_connections(target_node_id);
CREATE INDEX IF NOT EXISTS idx_connections_active ON network_connections(is_active, link_status);

CREATE INDEX IF NOT EXISTS idx_vlan_configs_id ON vlan_configurations(vlan_id);
CREATE INDEX IF NOT EXISTS idx_vlan_configs_active ON vlan_configurations(is_active);

CREATE INDEX IF NOT EXISTS idx_traffic_flows_vlan ON traffic_flows(source_vlan_id);
CREATE INDEX IF NOT EXISTS idx_traffic_flows_type ON traffic_flows(traffic_type);
CREATE INDEX IF NOT EXISTS idx_traffic_flows_active ON traffic_flows(is_active);

CREATE INDEX IF NOT EXISTS idx_network_segments_type ON network_segments(segment_type);
CREATE INDEX IF NOT EXISTS idx_network_segments_active ON network_segments(is_active);

CREATE INDEX IF NOT EXISTS idx_alert_rules_type ON network_alert_rules(rule_type);
CREATE INDEX IF NOT EXISTS idx_alert_rules_active ON network_alert_rules(is_active);

-- Enable Row Level Security
ALTER TABLE network_topology_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE network_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE vlan_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE traffic_flows ENABLE ROW LEVEL SECURITY;
ALTER TABLE network_segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE topology_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE network_alert_rules ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can manage topology nodes" ON network_topology_nodes FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Users can manage connections" ON network_connections FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Users can manage VLAN configs" ON vlan_configurations FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Users can manage traffic flows" ON traffic_flows FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Users can manage network segments" ON network_segments FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Users can manage topology snapshots" ON topology_snapshots FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Users can manage alert rules" ON network_alert_rules FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Insert default VLAN configurations
INSERT INTO vlan_configurations (vlan_id, vlan_name, description, network_cidr, gateway_ip, security_level, traffic_priority) VALUES
(10, 'Admin', 'Yönetim cihazları - PC, Laptop', '192.168.10.0/24', '192.168.10.1', 'critical', 'high'),
(20, 'Trusted', 'Normal kullanım cihazları - Telefon, Tablet', '192.168.20.0/24', '192.168.20.1', 'high', 'normal'),
(30, 'IoT', 'IoT cihazları - TV, Buzdolabı, Çamaşır makinesi', '192.168.30.0/24', '192.168.30.1', 'medium', 'low'),
(40, 'Guest', 'Misafir cihazları - Internet-only erişim', '192.168.40.0/24', '192.168.40.1', 'low', 'low'),
(50, 'Gaming', 'Oyun konsolları - Düşük ping için öncelikli', '192.168.50.0/24', '192.168.50.1', 'medium', 'critical'),
(60, 'VoIP/Work', 'VoIP ve iş cihazları - Görüntülü görüşme', '192.168.60.0/24', '192.168.60.1', 'high', 'high'),
(70, 'Security', 'Güvenlik kameraları ve NVR', '192.168.70.0/24', '192.168.70.1', 'high', 'normal'),
(80, 'Kids', 'Çocuk cihazları - Zaman kısıtlamalı', '192.168.80.0/24', '192.168.80.1', 'medium', 'normal'),
(90, 'Media', 'Medya sunucuları - Plex, Jellyfin', '192.168.90.0/24', '192.168.90.1', 'medium', 'high'),
(100, 'Lab/Test', 'Test ve deneysel cihazlar', '192.168.100.0/24', '192.168.100.1', 'low', 'low')
ON CONFLICT (vlan_id) DO NOTHING;

-- Insert default network segments
INSERT INTO network_segments (segment_name, segment_type, network_range, vlan_ids, description) VALUES
('DMZ', 'dmz', '10.0.0.0/24', ARRAY[70], 'Güvenlik kameraları ve dış erişimli servisler'),
('Internal LAN', 'internal', '192.168.0.0/16', ARRAY[10, 20, 30, 50, 60, 80, 90], 'Ana iç ağ segmenti'),
('Guest Network', 'guest', '192.168.40.0/24', ARRAY[40], 'Misafir cihazları için izole ağ'),
('Management', 'management', '192.168.10.0/24', ARRAY[10], 'Ağ yönetimi ve admin cihazları'),
('Lab Environment', 'lab', '192.168.100.0/24', ARRAY[100], 'Test ve geliştirme ortamı')
ON CONFLICT DO NOTHING;

-- Insert default traffic flows
INSERT INTO traffic_flows (flow_name, source_vlan_id, destination_type, traffic_type, route_via, priority, description) VALUES
('Web Traffic', 20, 'internet', 'web', 'wan', 50, 'Normal web trafiği doğrudan ISP üzerinden'),
('Gaming Traffic', 50, 'internet', 'gaming', 'wan', 90, 'Oyun trafiği öncelikli, düşük gecikme'),
('VoIP Traffic', 60, 'internet', 'voip', 'vpn_germany', 80, 'VoIP trafiği Almanya VPS üzerinden'),
('IoT Limited', 30, 'internet', 'iot', 'wan', 20, 'IoT cihazları sınırlı internet erişimi'),
('Admin Management', 10, 'local', 'admin', 'local', 100, 'Yönetim trafiği local ağda kalır')
ON CONFLICT DO NOTHING;

-- Create trigger function for updated_at
CREATE OR REPLACE FUNCTION update_topology_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_topology_nodes_updated_at BEFORE UPDATE ON network_topology_nodes FOR EACH ROW EXECUTE FUNCTION update_topology_updated_at_column();
CREATE TRIGGER update_connections_updated_at BEFORE UPDATE ON network_connections FOR EACH ROW EXECUTE FUNCTION update_topology_updated_at_column();
CREATE TRIGGER update_vlan_configs_updated_at BEFORE UPDATE ON vlan_configurations FOR EACH ROW EXECUTE FUNCTION update_topology_updated_at_column();
CREATE TRIGGER update_traffic_flows_updated_at BEFORE UPDATE ON traffic_flows FOR EACH ROW EXECUTE FUNCTION update_topology_updated_at_column();
CREATE TRIGGER update_network_segments_updated_at BEFORE UPDATE ON network_segments FOR EACH ROW EXECUTE FUNCTION update_topology_updated_at_column();
CREATE TRIGGER update_alert_rules_updated_at BEFORE UPDATE ON network_alert_rules FOR EACH ROW EXECUTE FUNCTION update_topology_updated_at_column();