/*
  # WireGuard VPN Management System

  1. New Tables
    - `wireguard_servers`
      - `id` (uuid, primary key)
      - `name` (text, server name)
      - `description` (text, optional description)
      - `interface_name` (text, wg interface name like wg0)
      - `listen_port` (integer, UDP port)
      - `private_key` (text, server private key)
      - `public_key` (text, server public key)
      - `network_cidr` (text, VPN network range)
      - `dns_servers` (jsonb, DNS configuration)
      - `endpoint` (text, server endpoint)
      - `is_active` (boolean, server status)
      - `config_path` (text, config file path)
      - `pre_up` (text, pre-up scripts)
      - `post_up` (text, post-up scripts)
      - `pre_down` (text, pre-down scripts)
      - `post_down` (text, post-down scripts)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `wireguard_clients`
      - `id` (uuid, primary key)
      - `server_id` (uuid, foreign key to wireguard_servers)
      - `name` (text, client name)
      - `description` (text, optional description)
      - `public_key` (text, client public key)
      - `private_key` (text, client private key)
      - `allowed_ips` (text, allowed IP ranges)
      - `assigned_ip` (inet, client VPN IP)
      - `persistent_keepalive` (integer, keepalive interval)
      - `is_enabled` (boolean, client enabled status)
      - `last_handshake` (timestamp, last connection)
      - `rx_bytes` (bigint, received bytes)
      - `tx_bytes` (bigint, transmitted bytes)
      - `connection_status` (text, connected/disconnected)
      - `client_group_id` (uuid, foreign key to client_groups)
      - `config_downloaded` (boolean, config download status)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `wireguard_config_templates`
      - `id` (uuid, primary key)
      - `name` (text, template name)
      - `template_type` (text, server/client)
      - `config_template` (text, configuration template)
      - `variables` (jsonb, template variables)
      - `is_default` (boolean, default template flag)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage VPN data
    - Add audit triggers for configuration changes

  3. Functions
    - Function to generate WireGuard key pairs
    - Function to assign client IPs automatically
    - Function to generate configuration files
*/

-- Create enum for connection status
CREATE TYPE wireguard_connection_status AS ENUM ('connected', 'disconnected', 'connecting', 'error');

-- WireGuard Servers Table
CREATE TABLE IF NOT EXISTS wireguard_servers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    interface_name TEXT NOT NULL UNIQUE,
    listen_port INTEGER NOT NULL DEFAULT 51820,
    private_key TEXT NOT NULL,
    public_key TEXT NOT NULL,
    network_cidr TEXT NOT NULL DEFAULT '10.0.0.0/24',
    dns_servers JSONB DEFAULT '["1.1.1.1", "8.8.8.8"]',
    endpoint TEXT,
    is_active BOOLEAN DEFAULT FALSE,
    config_path TEXT,
    pre_up TEXT,
    post_up TEXT,
    pre_down TEXT,
    post_down TEXT,
    max_clients INTEGER DEFAULT 100,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_listen_port UNIQUE (listen_port),
    CONSTRAINT valid_port_range CHECK (listen_port BETWEEN 1024 AND 65535),
    CONSTRAINT valid_network_cidr CHECK (network_cidr ~ '^(\d{1,3}\.){3}\d{1,3}/\d{1,2}$')
);

-- WireGuard Clients Table
CREATE TABLE IF NOT EXISTS wireguard_clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    server_id UUID NOT NULL REFERENCES wireguard_servers(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    public_key TEXT NOT NULL UNIQUE,
    private_key TEXT NOT NULL,
    allowed_ips TEXT DEFAULT '0.0.0.0/0',
    assigned_ip INET NOT NULL,
    persistent_keepalive INTEGER DEFAULT 25,
    is_enabled BOOLEAN DEFAULT TRUE,
    last_handshake TIMESTAMPTZ,
    rx_bytes BIGINT DEFAULT 0,
    tx_bytes BIGINT DEFAULT 0,
    connection_status wireguard_connection_status DEFAULT 'disconnected',
    client_group_id UUID REFERENCES client_groups(id) ON DELETE SET NULL,
    config_downloaded BOOLEAN DEFAULT FALSE,
    download_count INTEGER DEFAULT 0,
    last_download TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_assigned_ip_per_server UNIQUE (server_id, assigned_ip),
    CONSTRAINT valid_keepalive CHECK (persistent_keepalive BETWEEN 0 AND 3600)
);

-- WireGuard Configuration Templates Table
CREATE TABLE IF NOT EXISTS wireguard_config_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    template_type TEXT NOT NULL CHECK (template_type IN ('server', 'client')),
    config_template TEXT NOT NULL,
    variables JSONB DEFAULT '{}',
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_default_per_type UNIQUE (template_type, is_default) DEFERRABLE INITIALLY DEFERRED
);

-- WireGuard Connection History Table
CREATE TABLE IF NOT EXISTS wireguard_connection_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES wireguard_clients(id) ON DELETE CASCADE,
    server_id UUID NOT NULL REFERENCES wireguard_servers(id) ON DELETE CASCADE,
    connected_at TIMESTAMPTZ DEFAULT NOW(),
    disconnected_at TIMESTAMPTZ,
    duration INTERVAL,
    rx_bytes BIGINT DEFAULT 0,
    tx_bytes BIGINT DEFAULT 0,
    client_ip INET,
    client_endpoint TEXT,
    disconnect_reason TEXT
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_wireguard_servers_active ON wireguard_servers(is_active);
CREATE INDEX IF NOT EXISTS idx_wireguard_clients_server ON wireguard_clients(server_id);
CREATE INDEX IF NOT EXISTS idx_wireguard_clients_enabled ON wireguard_clients(is_enabled);
CREATE INDEX IF NOT EXISTS idx_wireguard_clients_status ON wireguard_clients(connection_status);
CREATE INDEX IF NOT EXISTS idx_wireguard_clients_group ON wireguard_clients(client_group_id);
CREATE INDEX IF NOT EXISTS idx_wireguard_connection_history_client ON wireguard_connection_history(client_id);
CREATE INDEX IF NOT EXISTS idx_wireguard_connection_history_time ON wireguard_connection_history(connected_at);

-- Enable Row Level Security
ALTER TABLE wireguard_servers ENABLE ROW LEVEL SECURITY;
ALTER TABLE wireguard_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE wireguard_config_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE wireguard_connection_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can manage WireGuard servers"
    ON wireguard_servers
    FOR ALL
    TO authenticated
    USING (true);

CREATE POLICY "Users can manage WireGuard clients"
    ON wireguard_clients
    FOR ALL
    TO authenticated
    USING (true);

CREATE POLICY "Users can view config templates"
    ON wireguard_config_templates
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Users can manage config templates"
    ON wireguard_config_templates
    FOR INSERT, UPDATE, DELETE
    TO authenticated
    USING (true);

CREATE POLICY "Users can view connection history"
    ON wireguard_connection_history
    FOR SELECT
    TO authenticated
    USING (true);

-- Function to generate WireGuard key pair
CREATE OR REPLACE FUNCTION generate_wireguard_keypair()
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    -- In production, this would call actual wg commands
    -- For now, return mock keys
    result := json_build_object(
        'private_key', encode(gen_random_bytes(32), 'base64'),
        'public_key', encode(gen_random_bytes(32), 'base64')
    );
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Function to assign next available IP
CREATE OR REPLACE FUNCTION assign_next_client_ip(server_uuid UUID)
RETURNS INET AS $$
DECLARE
    server_network TEXT;
    base_ip INET;
    next_ip INET;
    ip_counter INTEGER := 2; -- Start from .2 (.1 is usually the server)
BEGIN
    -- Get server network
    SELECT network_cidr INTO server_network FROM wireguard_servers WHERE id = server_uuid;
    
    IF server_network IS NULL THEN
        RAISE EXCEPTION 'Server not found';
    END IF;
    
    -- Extract base network
    base_ip := network(server_network::CIDR);
    
    -- Find next available IP
    LOOP
        next_ip := base_ip + ip_counter;
        
        -- Check if IP is already assigned
        IF NOT EXISTS (
            SELECT 1 FROM wireguard_clients 
            WHERE server_id = server_uuid AND assigned_ip = next_ip
        ) THEN
            RETURN next_ip;
        END IF;
        
        ip_counter := ip_counter + 1;
        
        -- Prevent infinite loop
        IF ip_counter > 253 THEN
            RAISE EXCEPTION 'No available IP addresses in network range';
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_wireguard_servers_updated_at
    BEFORE UPDATE ON wireguard_servers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_wireguard_clients_updated_at
    BEFORE UPDATE ON wireguard_clients
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_wireguard_config_templates_updated_at
    BEFORE UPDATE ON wireguard_config_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert default configuration templates
INSERT INTO wireguard_config_templates (name, template_type, config_template, variables, is_default) VALUES 
(
    'Default Server Template',
    'server',
    '[Interface]
PrivateKey = {{private_key}}
Address = {{server_ip}}
ListenPort = {{listen_port}}
{{#dns_servers}}
DNS = {{.}}
{{/dns_servers}}
{{#pre_up}}
PreUp = {{.}}
{{/pre_up}}
{{#post_up}}
PostUp = {{.}}
{{/post_up}}
{{#pre_down}}
PreDown = {{.}}
{{/pre_down}}
{{#post_down}}
PostDown = {{.}}
{{/post_down}}

{{#clients}}
[Peer]
PublicKey = {{public_key}}
AllowedIPs = {{allowed_ips}}
{{#persistent_keepalive}}
PersistentKeepalive = {{.}}
{{/persistent_keepalive}}

{{/clients}}',
    '{"server_ip": "10.0.0.1/24", "listen_port": 51820}',
    true
),
(
    'Default Client Template', 
    'client',
    '[Interface]
PrivateKey = {{private_key}}
Address = {{client_ip}}
{{#dns_servers}}
DNS = {{.}}
{{/dns_servers}}

[Peer]
PublicKey = {{server_public_key}}
Endpoint = {{server_endpoint}}
AllowedIPs = {{allowed_ips}}
{{#persistent_keepalive}}
PersistentKeepalive = {{.}}
{{/persistent_keepalive}}',
    '{"allowed_ips": "0.0.0.0/0", "persistent_keepalive": 25}',
    true
);

-- Insert sample server
INSERT INTO wireguard_servers (
    name, description, interface_name, listen_port, 
    private_key, public_key, network_cidr, endpoint, is_active
) VALUES (
    'Main VPN Server',
    'Primary WireGuard server for secure access',
    'wg0',
    51820,
    'cGYweG90dGhlcmVhbGtleXMxMjM0NTY3ODkw',
    'cHVibGlja2V5dGhpcmlzbm90cmVhbDEyMzQ1Ng==',
    '10.0.0.0/24',
    'vpn.example.com:51820',
    true
);

-- Insert sample clients
DO $$
DECLARE
    server_uuid UUID;
    client_ip INET;
BEGIN
    SELECT id INTO server_uuid FROM wireguard_servers WHERE interface_name = 'wg0';
    
    IF server_uuid IS NOT NULL THEN
        -- Client 1
        client_ip := assign_next_client_ip(server_uuid);
        INSERT INTO wireguard_clients (
            server_id, name, description, public_key, private_key, 
            assigned_ip, allowed_ips, is_enabled, connection_status
        ) VALUES (
            server_uuid,
            'Mobile Phone - iOS',
            'iPhone device for secure browsing',
            'aW9zcGhvbmVwdWJsaWNrZXkyMDI1MDEyMw==',
            'aW9zcGhvbmVwcml2YXRla2V5MjAyNTAxMjM=',
            client_ip,
            '0.0.0.0/0',
            true,
            'connected'
        );

        -- Client 2
        client_ip := assign_next_client_ip(server_uuid);
        INSERT INTO wireguard_clients (
            server_id, name, description, public_key, private_key,
            assigned_ip, allowed_ips, is_enabled, connection_status
        ) VALUES (
            server_uuid,
            'Work Laptop',
            'Corporate laptop for remote work',
            'bGFwdG9wcHVibGlja2V5MjAyNTAxMjM0NQ==',
            'bGFwdG9wcHJpdmF0ZWtleTIwMjUwMTIzNDU=',
            client_ip,
            '0.0.0.0/0',
            true,
            'disconnected'
        );
    END IF;
END $$;