/*
  # Traffic Routing System Database Schema

  1. New Tables
    - `traffic_rules` - Main routing rules with conditions and actions
    - `client_groups` - Device grouping for bulk traffic management
    - `tunnel_pools` - Available tunnels for load balancing
    - `traffic_classifications` - DPI-based traffic type definitions
    - `routing_history` - Historical routing decisions and performance
    - `tunnel_performance` - Real-time tunnel performance metrics

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users

  3. Features
    - Hierarchical rule system with priorities
    - Dynamic client grouping capabilities
    - Load balancing and failover support
    - Real-time performance tracking
*/

-- Traffic routing rules table
CREATE TABLE IF NOT EXISTS traffic_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  priority integer NOT NULL DEFAULT 100,
  enabled boolean DEFAULT true,
  conditions jsonb NOT NULL DEFAULT '{}',
  actions jsonb NOT NULL DEFAULT '{}',
  client_group_id uuid,
  tunnel_pool_id uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Client groups for bulk management
CREATE TABLE IF NOT EXISTS client_groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  criteria jsonb NOT NULL DEFAULT '{}',
  bandwidth_limit integer,
  priority integer DEFAULT 50,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tunnel pools for load balancing
CREATE TABLE IF NOT EXISTS tunnel_pools (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  tunnel_type text NOT NULL DEFAULT 'wireguard',
  endpoints jsonb NOT NULL DEFAULT '[]',
  load_balance_method text DEFAULT 'round_robin',
  health_check_enabled boolean DEFAULT true,
  failover_enabled boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Traffic classifications for DPI
CREATE TABLE IF NOT EXISTS traffic_classifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL,
  protocols jsonb DEFAULT '[]',
  ports jsonb DEFAULT '[]',
  domains jsonb DEFAULT '[]',
  signatures jsonb DEFAULT '[]',
  enabled boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Historical routing decisions
CREATE TABLE IF NOT EXISTS routing_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_ip inet NOT NULL,
  destination_ip inet,
  destination_domain text,
  traffic_type text,
  rule_id uuid,
  tunnel_id uuid,
  client_group_id uuid,
  bandwidth_used bigint DEFAULT 0,
  latency_ms integer,
  success boolean DEFAULT true,
  timestamp timestamptz DEFAULT now()
);

-- Real-time tunnel performance metrics
CREATE TABLE IF NOT EXISTS tunnel_performance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tunnel_id uuid NOT NULL,
  tunnel_name text NOT NULL,
  endpoint text NOT NULL,
  latency_ms integer,
  packet_loss_percent numeric(5,2),
  bandwidth_mbps numeric(10,2),
  active_connections integer DEFAULT 0,
  is_healthy boolean DEFAULT true,
  timestamp timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_traffic_rules_priority ON traffic_rules(priority DESC, enabled);
CREATE INDEX IF NOT EXISTS idx_traffic_rules_enabled ON traffic_rules(enabled);
CREATE INDEX IF NOT EXISTS idx_routing_history_timestamp ON routing_history(timestamp);
CREATE INDEX IF NOT EXISTS idx_routing_history_source_ip ON routing_history(source_ip);
CREATE INDEX IF NOT EXISTS idx_tunnel_performance_tunnel_id ON tunnel_performance(tunnel_id);
CREATE INDEX IF NOT EXISTS idx_tunnel_performance_timestamp ON tunnel_performance(timestamp);
CREATE INDEX IF NOT EXISTS idx_client_groups_criteria ON client_groups USING gin(criteria);
CREATE INDEX IF NOT EXISTS idx_traffic_classifications_category ON traffic_classifications(category);

-- Add foreign key constraints
ALTER TABLE traffic_rules ADD CONSTRAINT fk_traffic_rules_client_group 
  FOREIGN KEY (client_group_id) REFERENCES client_groups(id) ON DELETE SET NULL;

ALTER TABLE traffic_rules ADD CONSTRAINT fk_traffic_rules_tunnel_pool 
  FOREIGN KEY (tunnel_pool_id) REFERENCES tunnel_pools(id) ON DELETE SET NULL;

ALTER TABLE routing_history ADD CONSTRAINT fk_routing_history_rule 
  FOREIGN KEY (rule_id) REFERENCES traffic_rules(id) ON DELETE SET NULL;

-- Enable RLS
ALTER TABLE traffic_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE tunnel_pools ENABLE ROW LEVEL SECURITY;
ALTER TABLE traffic_classifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE routing_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE tunnel_performance ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can manage traffic rules"
  ON traffic_rules FOR ALL
  TO authenticated
  USING (true);

CREATE POLICY "Users can manage client groups"
  ON client_groups FOR ALL
  TO authenticated
  USING (true);

CREATE POLICY "Users can manage tunnel pools"
  ON tunnel_pools FOR ALL
  TO authenticated
  USING (true);

CREATE POLICY "Users can view traffic classifications"
  ON traffic_classifications FOR ALL
  TO authenticated
  USING (true);

CREATE POLICY "Users can view routing history"
  ON routing_history FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can view tunnel performance"
  ON tunnel_performance FOR SELECT
  TO authenticated
  USING (true);

-- Create updated_at trigger function if not exists
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add update triggers
CREATE TRIGGER update_traffic_rules_updated_at
  BEFORE UPDATE ON traffic_rules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_client_groups_updated_at
  BEFORE UPDATE ON client_groups
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tunnel_pools_updated_at
  BEFORE UPDATE ON tunnel_pools
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();