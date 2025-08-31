import { supabase } from './supabase';

export interface WireGuardServer {
  id: string;
  name: string;
  description?: string;
  interface_name: string;
  listen_port: number;
  private_key: string;
  public_key: string;
  network_cidr: string;
  dns_servers: string[];
  endpoint?: string;
  is_active: boolean;
  config_path?: string;
  pre_up?: string;
  post_up?: string;
  pre_down?: string;
  post_down?: string;
  max_clients: number;
  created_at: string;
  updated_at: string;
}

export interface WireGuardClient {
  id: string;
  server_id: string;
  name: string;
  description?: string;
  public_key: string;
  private_key: string;
  allowed_ips: string;
  assigned_ip: string;
  persistent_keepalive: number;
  is_enabled: boolean;
  last_handshake?: string;
  rx_bytes: number;
  tx_bytes: number;
  connection_status: 'connected' | 'disconnected' | 'connecting' | 'error';
  client_group_id?: string;
  config_downloaded: boolean;
  download_count: number;
  last_download?: string;
  created_at: string;
  updated_at: string;
}

export interface WireGuardKeyPair {
  private_key: string;
  public_key: string;
}

export interface ClientConfig {
  config: string;
  qr_code: string;
}

class WireGuardService {
  // Server Management
  async getServers(): Promise<WireGuardServer[]> {
    const { data, error } = await supabase
      .from('wireguard_servers')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }

  async getServer(id: string): Promise<WireGuardServer | null> {
    const { data, error } = await supabase
      .from('wireguard_servers')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  }

  async createServer(serverData: Partial<WireGuardServer>): Promise<WireGuardServer> {
    // Generate key pair if not provided
    if (!serverData.private_key || !serverData.public_key) {
      const keyPair = await this.generateKeyPair();
      serverData.private_key = keyPair.private_key;
      serverData.public_key = keyPair.public_key;
    }

    const { data, error } = await supabase
      .from('wireguard_servers')
      .insert([serverData])
      .select()
      .single();
    
    if (error) throw error;
    
    // Apply configuration to system
    await this.applyServerConfig(data);
    
    return data;
  }

  async updateServer(id: string, updates: Partial<WireGuardServer>): Promise<WireGuardServer> {
    const { data, error } = await supabase
      .from('wireguard_servers')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    // Apply configuration changes to system
    await this.applyServerConfig(data);
    
    return data;
  }

  async deleteServer(id: string): Promise<boolean> {
    // Get server info before deletion
    const server = await this.getServer(id);
    if (!server) return false;

    // Delete from database
    const { error } = await supabase
      .from('wireguard_servers')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    // Remove from system
    await this.removeServerFromSystem(server);
    
    return true;
  }

  async toggleServer(id: string): Promise<WireGuardServer> {
    const server = await this.getServer(id);
    if (!server) throw new Error('Server not found');

    const { data, error } = await supabase
      .from('wireguard_servers')
      .update({ is_active: !server.is_active })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    // Apply system changes
    if (data.is_active) {
      await this.startServer(data);
    } else {
      await this.stopServer(data);
    }
    
    return data;
  }

  // Client Management
  async getClients(serverId?: string): Promise<WireGuardClient[]> {
    let query = supabase
      .from('wireguard_clients')
      .select(`
        *,
        server:wireguard_servers(name, interface_name),
        client_group:client_groups(name)
      `);
    
    if (serverId) {
      query = query.eq('server_id', serverId);
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }

  async getClient(id: string): Promise<WireGuardClient | null> {
    const { data, error } = await supabase
      .from('wireguard_clients')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  }

  async createClient(clientData: Partial<WireGuardClient>): Promise<WireGuardClient> {
    // Generate key pair if not provided
    if (!clientData.private_key || !clientData.public_key) {
      const keyPair = await this.generateKeyPair();
      clientData.private_key = keyPair.private_key;
      clientData.public_key = keyPair.public_key;
    }

    // Assign IP if not provided
    if (!clientData.assigned_ip && clientData.server_id) {
      const { data: assignedIp } = await supabase.rpc('assign_next_client_ip', {
        server_uuid: clientData.server_id
      });
      clientData.assigned_ip = assignedIp;
    }

    const { data, error } = await supabase
      .from('wireguard_clients')
      .insert([clientData])
      .select()
      .single();
    
    if (error) throw error;
    
    // Apply configuration to system
    await this.applyClientConfig(data);
    
    return data;
  }

  async updateClient(id: string, updates: Partial<WireGuardClient>): Promise<WireGuardClient> {
    const { data, error } = await supabase
      .from('wireguard_clients')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    // Apply configuration changes to system
    await this.applyClientConfig(data);
    
    return data;
  }

  async deleteClient(id: string): Promise<boolean> {
    const client = await this.getClient(id);
    if (!client) return false;

    const { error } = await supabase
      .from('wireguard_clients')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    // Remove from system
    await this.removeClientFromSystem(client);
    
    return true;
  }

  async toggleClient(id: string): Promise<WireGuardClient> {
    const client = await this.getClient(id);
    if (!client) throw new Error('Client not found');

    const { data, error } = await supabase
      .from('wireguard_clients')
      .update({ is_enabled: !client.is_enabled })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    // Apply system changes
    await this.applyClientConfig(data);
    
    return data;
  }

  // Configuration Generation
  async generateClientConfig(clientId: string): Promise<ClientConfig> {
    const { data: client, error: clientError } = await supabase
      .from('wireguard_clients')
      .select(`
        *,
        server:wireguard_servers(*)
      `)
      .eq('id', clientId)
      .single();
    
    if (clientError) throw clientError;
    if (!client || !client.server) throw new Error('Client or server not found');

    // Generate configuration
    const config = this.buildClientConfig(client, client.server);
    
    // Generate QR code (in production, this would use actual QR generation)
    const qrCode = `data:image/svg+xml;base64,${btoa(`
      <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
        <rect width="200" height="200" fill="white"/>
        <text x="100" y="100" text-anchor="middle" fill="black">QR Code</text>
        <text x="100" y="120" text-anchor="middle" fill="gray" font-size="12">${client.name}</text>
      </svg>
    `)}`;

    // Update download statistics
    await supabase
      .from('wireguard_clients')
      .update({
        config_downloaded: true,
        download_count: (client.download_count || 0) + 1,
        last_download: new Date().toISOString()
      })
      .eq('id', clientId);

    return { config, qr_code: qrCode };
  }

  // Key Management
  async generateKeyPair(): Promise<WireGuardKeyPair> {
    // In production, this would call actual WireGuard key generation
    // For demo purposes, generate mock keys
    const privateKey = btoa(Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15));
    const publicKey = btoa(Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15));
    
    return {
      private_key: privateKey,
      public_key: publicKey
    };
  }

  async regenerateClientKeys(clientId: string): Promise<WireGuardClient> {
    const keyPair = await this.generateKeyPair();
    
    return await this.updateClient(clientId, {
      private_key: keyPair.private_key,
      public_key: keyPair.public_key
    });
  }

  // System Integration Methods
  private buildClientConfig(client: WireGuardClient, server: WireGuardServer): string {
    return `[Interface]
PrivateKey = ${client.private_key}
Address = ${client.assigned_ip}/32
DNS = ${(server.dns_servers as string[]).join(', ')}

[Peer]
PublicKey = ${server.public_key}
Endpoint = ${server.endpoint}
AllowedIPs = ${client.allowed_ips}
PersistentKeepalive = ${client.persistent_keepalive}`;
  }

  private async applyServerConfig(server: WireGuardServer): Promise<void> {
    // In production, this would:
    // 1. Generate WireGuard configuration file
    // 2. Apply to system using wg commands
    // 3. Update systemd service
    console.log(`Applying server config for ${server.interface_name}`);
  }

  private async applyClientConfig(client: WireGuardClient): Promise<void> {
    // In production, this would:
    // 1. Update server configuration with new peer
    // 2. Reload WireGuard configuration
    // 3. Update iptables rules if needed
    console.log(`Applying client config for ${client.name}`);
  }

  private async removeServerFromSystem(server: WireGuardServer): Promise<void> {
    // In production, this would:
    // 1. Stop WireGuard interface
    // 2. Remove configuration files
    // 3. Clean up iptables rules
    console.log(`Removing server ${server.interface_name} from system`);
  }

  private async removeClientFromSystem(client: WireGuardClient): Promise<void> {
    // In production, this would:
    // 1. Remove peer from server configuration
    // 2. Reload WireGuard configuration
    console.log(`Removing client ${client.name} from system`);
  }

  private async startServer(server: WireGuardServer): Promise<void> {
    // In production: systemctl start wg-quick@${server.interface_name}
    console.log(`Starting WireGuard server ${server.interface_name}`);
  }

  private async stopServer(server: WireGuardServer): Promise<void> {
    // In production: systemctl stop wg-quick@${server.interface_name}
    console.log(`Stopping WireGuard server ${server.interface_name}`);
  }

  // Statistics and Monitoring
  async getServerStats(serverId: string): Promise<any> {
    const { data, error } = await supabase
      .from('wireguard_clients')
      .select('rx_bytes, tx_bytes, connection_status')
      .eq('server_id', serverId);
    
    if (error) throw error;
    
    const totalClients = data.length;
    const activeClients = data.filter(c => c.connection_status === 'connected').length;
    const totalRx = data.reduce((sum, c) => sum + (c.rx_bytes || 0), 0);
    const totalTx = data.reduce((sum, c) => sum + (c.tx_bytes || 0), 0);
    
    return {
      total_clients: totalClients,
      active_clients: activeClients,
      total_rx_bytes: totalRx,
      total_tx_bytes: totalTx
    };
  }

  async updateClientStats(clientId: string, stats: { rx_bytes: number; tx_bytes: number; last_handshake?: Date }): Promise<void> {
    const { error } = await supabase
      .from('wireguard_clients')
      .update({
        rx_bytes: stats.rx_bytes,
        tx_bytes: stats.tx_bytes,
        last_handshake: stats.last_handshake?.toISOString(),
        connection_status: stats.last_handshake ? 'connected' : 'disconnected'
      })
      .eq('id', clientId);
    
    if (error) throw error;
  }

  // Bulk Operations
  async createClientGroup(name: string, description?: string): Promise<any> {
    const { data, error } = await supabase
      .from('client_groups')
      .insert([{ name, description }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async assignClientsToGroup(clientIds: string[], groupId: string): Promise<void> {
    const { error } = await supabase
      .from('wireguard_clients')
      .update({ client_group_id: groupId })
      .in('id', clientIds);
    
    if (error) throw error;
  }

  async bulkEnableClients(clientIds: string[]): Promise<void> {
    const { error } = await supabase
      .from('wireguard_clients')
      .update({ is_enabled: true })
      .in('id', clientIds);
    
    if (error) throw error;
    
    // Apply changes to system for each client
    for (const clientId of clientIds) {
      const client = await this.getClient(clientId);
      if (client) {
        await this.applyClientConfig(client);
      }
    }
  }

  async bulkDisableClients(clientIds: string[]): Promise<void> {
    const { error } = await supabase
      .from('wireguard_clients')
      .update({ is_enabled: false })
      .in('id', clientIds);
    
    if (error) throw error;
    
    // Apply changes to system for each client
    for (const clientId of clientIds) {
      const client = await this.getClient(clientId);
      if (client) {
        await this.applyClientConfig(client);
      }
    }
  }
}

export const wireGuardService = new WireGuardService();