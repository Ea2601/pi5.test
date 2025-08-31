/*
  # Auto WG Installation History

  1. New Tables
    - `auto_wg_installations`
      - `id` (uuid, primary key)
      - `server_name` (text)
      - `server_ip` (inet)
      - `wg_interface` (text)
      - `wg_port` (integer)
      - `wg_network` (cidr)
      - `installation_success` (boolean)
      - `server_public_key` (text)
      - `error_message` (text)
      - `installation_log` (jsonb)
      - `created_at` (timestamp)
      - `created_by` (uuid, foreign key)

  2. Security
    - Enable RLS on `auto_wg_installations` table
    - Add policy for authenticated users to read their own installation history
    - Add policy for authenticated users to create new installation records
*/

-- Auto WG Installation History Table
CREATE TABLE IF NOT EXISTS auto_wg_installations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  server_name text NOT NULL,
  server_ip inet NOT NULL,
  wg_interface text NOT NULL DEFAULT 'wg0',
  wg_port integer NOT NULL DEFAULT 51820,
  wg_network cidr NOT NULL DEFAULT '10.7.0.0/24',
  installation_success boolean NOT NULL DEFAULT false,
  server_public_key text,
  error_message text,
  installation_log jsonb DEFAULT '[]',
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id) DEFAULT auth.uid()
);

-- Enable Row Level Security
ALTER TABLE auto_wg_installations ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own installation history"
  ON auto_wg_installations
  FOR SELECT
  TO authenticated
  USING (created_by = auth.uid());

CREATE POLICY "Users can create installation records"
  ON auto_wg_installations
  FOR INSERT
  TO authenticated
  WITH CHECK (created_by = auth.uid());

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_auto_wg_installations_user 
  ON auto_wg_installations(created_by);

CREATE INDEX IF NOT EXISTS idx_auto_wg_installations_created_at 
  ON auto_wg_installations(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_auto_wg_installations_server_ip 
  ON auto_wg_installations(server_ip);

-- Comments for documentation
COMMENT ON TABLE auto_wg_installations IS 'History of automated WireGuard installations';
COMMENT ON COLUMN auto_wg_installations.server_name IS 'User-provided name for the server';
COMMENT ON COLUMN auto_wg_installations.server_ip IS 'IP address of the target server';
COMMENT ON COLUMN auto_wg_installations.wg_interface IS 'WireGuard interface name (e.g., wg0)';
COMMENT ON COLUMN auto_wg_installations.wg_port IS 'WireGuard listen port';
COMMENT ON COLUMN auto_wg_installations.wg_network IS 'WireGuard network CIDR';
COMMENT ON COLUMN auto_wg_installations.installation_success IS 'Whether the installation completed successfully';
COMMENT ON COLUMN auto_wg_installations.server_public_key IS 'Generated server public key';
COMMENT ON COLUMN auto_wg_installations.error_message IS 'Error message if installation failed';
COMMENT ON COLUMN auto_wg_installations.installation_log IS 'Detailed installation log entries';