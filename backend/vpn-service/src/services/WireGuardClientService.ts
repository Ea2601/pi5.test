import { DatabaseService } from '../utils/database';
import { WireGuardManager } from '../utils/wireguardManager';
import { logger } from '../utils/logger';

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

export class WireGuardClientService {
  private db: DatabaseService;
  private wgManager: WireGuardManager;

  constructor() {
    this.db = new DatabaseService();
    this.wgManager = new WireGuardManager();
  }

  async getAllClients(serverId?: string): Promise<WireGuardClient[]> {
    try {
      let query = `
        SELECT 
          c.*,
          s.name as server_name,
          s.interface_name,
          cg.name as group_name
        FROM wireguard_clients c
        LEFT JOIN wireguard_servers s ON c.server_id = s.id
        LEFT JOIN client_groups cg ON c.client_group_id = cg.id
      `;
      
      const params: any[] = [];
      
      if (serverId) {
        query += ' WHERE c.server_id = $1';
        params.push(serverId);
      }
      
      query += ' ORDER BY c.created_at DESC';

      const result = await this.db.query(query, params);
      return result.rows;
    } catch (error) {
      logger.error('Error fetching clients:', error);
      throw new Error('Failed to fetch clients');
    }
  }

  async getClientById(id: string): Promise<WireGuardClient | null> {
    try {
      const result = await this.db.query(`
        SELECT c.*, s.name as server_name, s.interface_name
        FROM wireguard_clients c
        LEFT JOIN wireguard_servers s ON c.server_id = s.id
        WHERE c.id = $1
      `, [id]);
      
      return result.rows[0] || null;
    } catch (error) {
      logger.error('Error fetching client:', error);
      throw new Error('Failed to fetch client');
    }
  }

  async createClient(clientData: Partial<WireGuardClient>): Promise<WireGuardClient> {
    try {
      // Generate key pair if not provided
      if (!clientData.private_key || !clientData.public_key) {
        const keyPair = await this.wgManager.generateKeyPair();
        clientData.private_key = keyPair.private_key;
        clientData.public_key = keyPair.public_key;
      }

      // Assign IP if not provided
      if (!clientData.assigned_ip && clientData.server_id) {
        const assignedIp = await this.db.query(
          'SELECT assign_next_client_ip($1) as ip',
          [clientData.server_id]
        );
        clientData.assigned_ip = assignedIp.rows[0].ip;
      }

      const result = await this.db.query(`
        INSERT INTO wireguard_clients (
          server_id, name, description, public_key, private_key,
          allowed_ips, assigned_ip, persistent_keepalive, client_group_id
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *
      `, [
        clientData.server_id,
        clientData.name,
        clientData.description,
        clientData.public_key,
        clientData.private_key,
        clientData.allowed_ips || '0.0.0.0/0',
        clientData.assigned_ip,
        clientData.persistent_keepalive || 25,
        clientData.client_group_id
      ]);

      const client = result.rows[0];
      
      // Add client to server configuration
      await this.wgManager.addClientToServer(client);
      
      return client;
    } catch (error) {
      logger.error('Error creating client:', error);
      throw new Error('Failed to create client');
    }
  }

  async updateClient(id: string, updates: Partial<WireGuardClient>): Promise<WireGuardClient | null> {
    try {
      const setClauses: string[] = [];
      const params: any[] = [];
      let paramIndex = 1;

      Object.entries(updates).forEach(([key, value]) => {
        if (value !== undefined && key !== 'id') {
          setClauses.push(`${key} = $${paramIndex}`);
          params.push(value);
          paramIndex++;
        }
      });

      if (setClauses.length === 0) {
        return await this.getClientById(id);
      }

      setClauses.push(`updated_at = NOW()`);
      params.push(id);

      const result = await this.db.query(`
        UPDATE wireguard_clients 
        SET ${setClauses.join(', ')}
        WHERE id = $${paramIndex}
        RETURNING *
      `, params);

      const client = result.rows[0];
      
      if (client) {
        // Update server configuration
        await this.wgManager.updateClientInServer(client);
      }

      return client || null;
    } catch (error) {
      logger.error('Error updating client:', error);
      throw new Error('Failed to update client');
    }
  }

  async deleteClient(id: string): Promise<boolean> {
    try {
      const client = await this.getClientById(id);
      if (!client) return false;

      // Remove from server configuration
      await this.wgManager.removeClientFromServer(client);

      // Delete from database
      const result = await this.db.query(
        'DELETE FROM wireguard_clients WHERE id = $1',
        [id]
      );

      return result.rowCount > 0;
    } catch (error) {
      logger.error('Error deleting client:', error);
      throw new Error('Failed to delete client');
    }
  }

  async toggleClient(id: string): Promise<WireGuardClient> {
    try {
      const client = await this.getClientById(id);
      if (!client) throw new Error('Client not found');

      const newEnabledState = !client.is_enabled;

      const result = await this.db.query(`
        UPDATE wireguard_clients 
        SET is_enabled = $1, updated_at = NOW()
        WHERE id = $2
        RETURNING *
      `, [newEnabledState, id]);

      const updatedClient = result.rows[0];

      // Update server configuration
      await this.wgManager.updateClientInServer(updatedClient);

      return updatedClient;
    } catch (error) {
      logger.error('Error toggling client:', error);
      throw new Error('Failed to toggle client');
    }
  }

  async generateClientConfig(id: string): Promise<{ config: string; qr_code: string }> {
    try {
      const result = await this.db.query(`
        SELECT 
          c.*,
          s.public_key as server_public_key,
          s.endpoint as server_endpoint,
          s.dns_servers
        FROM wireguard_clients c
        JOIN wireguard_servers s ON c.server_id = s.id
        WHERE c.id = $1
      `, [id]);

      const client = result.rows[0];
      if (!client) throw new Error('Client not found');

      // Generate configuration
      const config = this.wgManager.buildClientConfig(client);
      
      // Generate QR code (mock for now)
      const qrCode = await this.wgManager.generateQRCode(config);

      // Update download statistics
      await this.db.query(`
        UPDATE wireguard_clients 
        SET 
          config_downloaded = TRUE,
          download_count = download_count + 1,
          last_download = NOW()
        WHERE id = $1
      `, [id]);

      return { config, qr_code: qrCode };
    } catch (error) {
      logger.error('Error generating client config:', error);
      throw new Error('Failed to generate client configuration');
    }
  }

  async bulkEnableClients(clientIds: string[]): Promise<void> {
    try {
      await this.db.query(`
        UPDATE wireguard_clients 
        SET is_enabled = TRUE, updated_at = NOW()
        WHERE id = ANY($1)
      `, [clientIds]);

      // Update server configurations for all affected clients
      for (const clientId of clientIds) {
        const client = await this.getClientById(clientId);
        if (client) {
          await this.wgManager.updateClientInServer(client);
        }
      }
    } catch (error) {
      logger.error('Error bulk enabling clients:', error);
      throw new Error('Failed to enable clients');
    }
  }

  async bulkDisableClients(clientIds: string[]): Promise<void> {
    try {
      await this.db.query(`
        UPDATE wireguard_clients 
        SET is_enabled = FALSE, updated_at = NOW()
        WHERE id = ANY($1)
      `, [clientIds]);

      // Update server configurations for all affected clients
      for (const clientId of clientIds) {
        const client = await this.getClientById(clientId);
        if (client) {
          await this.wgManager.updateClientInServer(client);
        }
      }
    } catch (error) {
      logger.error('Error bulk disabling clients:', error);
      throw new Error('Failed to disable clients');
    }
  }
}