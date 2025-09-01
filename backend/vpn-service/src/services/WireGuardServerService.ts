import { DatabaseService } from '../utils/database';
import { WireGuardManager } from '../utils/wireguardManager';
import { logger } from '../utils/logger';

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

export class WireGuardServerService {
  private db: DatabaseService;
  private wgManager: WireGuardManager;

  constructor() {
    this.db = new DatabaseService();
    this.wgManager = new WireGuardManager();
  }

  async getAllServers(): Promise<WireGuardServer[]> {
    try {
      const result = await this.db.query(`
        SELECT 
          id, name, description, interface_name, listen_port,
          public_key, network_cidr, dns_servers, endpoint,
          is_active, max_clients, created_at, updated_at
        FROM wireguard_servers 
        ORDER BY created_at DESC
      `);
      
      return result.rows;
    } catch (error) {
      logger.error('Error fetching servers:', error);
      throw new Error('Failed to fetch servers');
    }
  }

  async getServerById(id: string): Promise<WireGuardServer | null> {
    try {
      const result = await this.db.query(`
        SELECT * FROM wireguard_servers WHERE id = $1
      `, [id]);
      
      return result.rows[0] || null;
    } catch (error) {
      logger.error('Error fetching server:', error);
      throw new Error('Failed to fetch server');
    }
  }

  async createServer(serverData: Partial<WireGuardServer>): Promise<WireGuardServer> {
    try {
      // Generate key pair if not provided
      if (!serverData.private_key || !serverData.public_key) {
        const keyPair = await this.wgManager.generateKeyPair();
        serverData.private_key = keyPair.private_key;
        serverData.public_key = keyPair.public_key;
      }

      const result = await this.db.query(`
        INSERT INTO wireguard_servers (
          name, description, interface_name, listen_port,
          private_key, public_key, network_cidr, dns_servers,
          endpoint, max_clients, config_path
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING *
      `, [
        serverData.name,
        serverData.description,
        serverData.interface_name,
        serverData.listen_port,
        serverData.private_key,
        serverData.public_key,
        serverData.network_cidr,
        JSON.stringify(serverData.dns_servers || ['1.1.1.1', '8.8.8.8']),
        serverData.endpoint,
        serverData.max_clients || 100,
        `/etc/wireguard/${serverData.interface_name}.conf`
      ]);

      const server = result.rows[0];
      
      // Create configuration file
      await this.wgManager.createServerConfig(server);
      
      return server;
    } catch (error) {
      logger.error('Error creating server:', error);
      throw new Error('Failed to create server');
    }
  }

  async updateServer(id: string, updates: Partial<WireGuardServer>): Promise<WireGuardServer | null> {
    try {
      const setClauses: string[] = [];
      const params: any[] = [];
      let paramIndex = 1;

      Object.entries(updates).forEach(([key, value]) => {
        if (value !== undefined) {
          setClauses.push(`${key} = $${paramIndex}`);
          params.push(key === 'dns_servers' ? JSON.stringify(value) : value);
          paramIndex++;
        }
      });

      if (setClauses.length === 0) {
        return await this.getServerById(id);
      }

      setClauses.push(`updated_at = NOW()`);
      params.push(id);

      const result = await this.db.query(`
        UPDATE wireguard_servers 
        SET ${setClauses.join(', ')}
        WHERE id = $${paramIndex}
        RETURNING *
      `, params);

      const server = result.rows[0];
      
      if (server) {
        // Update configuration file
        await this.wgManager.updateServerConfig(server);
      }

      return server || null;
    } catch (error) {
      logger.error('Error updating server:', error);
      throw new Error('Failed to update server');
    }
  }

  async deleteServer(id: string): Promise<boolean> {
    try {
      const server = await this.getServerById(id);
      if (!server) return false;

      // Stop server if active
      if (server.is_active) {
        await this.wgManager.stopServer(server.interface_name);
      }

      // Remove configuration file
      await this.wgManager.removeServerConfig(server.interface_name);

      // Delete from database
      const result = await this.db.query(
        'DELETE FROM wireguard_servers WHERE id = $1',
        [id]
      );

      return result.rowCount > 0;
    } catch (error) {
      logger.error('Error deleting server:', error);
      throw new Error('Failed to delete server');
    }
  }

  async toggleServer(id: string): Promise<WireGuardServer> {
    try {
      const server = await this.getServerById(id);
      if (!server) throw new Error('Server not found');

      const newActiveState = !server.is_active;

      // Update database first
      const result = await this.db.query(`
        UPDATE wireguard_servers 
        SET is_active = $1, updated_at = NOW()
        WHERE id = $2
        RETURNING *
      `, [newActiveState, id]);

      const updatedServer = result.rows[0];

      // Apply system changes
      if (newActiveState) {
        await this.wgManager.startServer(server.interface_name);
      } else {
        await this.wgManager.stopServer(server.interface_name);
      }

      return updatedServer;
    } catch (error) {
      logger.error('Error toggling server:', error);
      throw new Error('Failed to toggle server');
    }
  }

  async getServerStats(id: string): Promise<any> {
    try {
      const result = await this.db.query(`
        SELECT 
          COUNT(*) as total_clients,
          COUNT(*) FILTER (WHERE connection_status = 'connected') as active_clients,
          COALESCE(SUM(rx_bytes), 0) as total_rx_bytes,
          COALESCE(SUM(tx_bytes), 0) as total_tx_bytes
        FROM wireguard_clients 
        WHERE server_id = $1
      `, [id]);

      return result.rows[0] || {
        total_clients: 0,
        active_clients: 0,
        total_rx_bytes: 0,
        total_tx_bytes: 0
      };
    } catch (error) {
      logger.error('Error fetching server stats:', error);
      throw new Error('Failed to fetch server statistics');
    }
  }
}