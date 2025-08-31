/*
  # Device Storage Schema

  1. New Tables
    - `network_devices`
      - `mac_address` (text, primary key)
      - `ip_address` (text)
      - `device_name` (text, editable)
      - `device_type` (text, enum: Mobile/PC/IoT/Game Console)
      - `device_brand` (text, editable)
      - `last_seen` (timestamp)
      - `is_active` (boolean)
      - `first_discovered` (timestamp)
      - `dhcp_lease_expires` (timestamp)
      - `vendor_info` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `network_devices` table
    - Add policy for authenticated users to manage device data

  3. Indexes
    - Add index on ip_address for fast lookups
    - Add index on is_active for filtering active/inactive devices
*/

CREATE TYPE device_type_enum AS ENUM ('Mobile', 'PC', 'IoT', 'Game Console');

CREATE TABLE IF NOT EXISTS network_devices (
  mac_address text PRIMARY KEY,
  ip_address text,
  device_name text DEFAULT 'Unknown',
  device_type device_type_enum DEFAULT 'PC',
  device_brand text DEFAULT 'Unknown',
  last_seen timestamptz DEFAULT now(),
  is_active boolean DEFAULT true,
  first_discovered timestamptz DEFAULT now(),
  dhcp_lease_expires timestamptz,
  vendor_info text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE network_devices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage device data"
  ON network_devices
  FOR ALL
  TO authenticated
  USING (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_network_devices_ip ON network_devices(ip_address);
CREATE INDEX IF NOT EXISTS idx_network_devices_active ON network_devices(is_active);
CREATE INDEX IF NOT EXISTS idx_network_devices_last_seen ON network_devices(last_seen);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_network_devices_updated_at 
BEFORE UPDATE ON network_devices 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();