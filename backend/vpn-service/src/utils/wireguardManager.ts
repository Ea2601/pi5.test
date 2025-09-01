import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs-extra';
import * as path from 'path';
import { logger } from './logger';

const execAsync = promisify(exec);

export interface KeyPair {
  private_key: string;
  public_key: string;
}

export class WireGuardManager {
  private configDir = '/etc/wireguard';

  async generateKeyPair(): Promise<KeyPair> {
    try {
      // Generate private key
      const { stdout: privateKey } = await execAsync('wg genkey');
      
      // Generate public key from private key
      const { stdout: publicKey } = await execAsync(`echo "${privateKey.trim()}" | wg pubkey`);

      return {
        private_key: privateKey.trim(),
        public_key: publicKey.trim()
      };
    } catch (error) {
      logger.error('Error generating key pair:', error);
      throw new Error('Failed to generate WireGuard key pair');
    }
  }

  async createServerConfig(server: any): Promise<void> {
    try {
      const configPath = path.join(this.configDir, `${server.interface_name}.conf`);
      
      // Build server configuration
      let config = `[Interface]
PrivateKey = ${server.private_key}
Address = ${server.network_cidr.replace(/\/\d+$/, '.1/24')}
ListenPort = ${server.listen_port}
PostUp = iptables -A FORWARD -i ${server.interface_name} -j ACCEPT; iptables -A FORWARD -o ${server.interface_name} -j ACCEPT; iptables -t nat -A POSTROUTING -o eth0 -j MASQUERADE
PostDown = iptables -D FORWARD -i ${server.interface_name} -j ACCEPT; iptables -D FORWARD -o ${server.interface_name} -j ACCEPT; iptables -t nat -D POSTROUTING -o eth0 -j MASQUERADE

`;

      // Add clients if any exist
      const clients = await this.getServerClients(server.id);
      for (const client of clients) {
        if (client.is_enabled) {
          config += `[Peer]
PublicKey = ${client.public_key}
AllowedIPs = ${client.assigned_ip}/32

`;
        }
      }

      // Write configuration file
      await fs.ensureDir(this.configDir);
      await fs.writeFile(configPath, config, { mode: 0o600 });
      
      logger.info(`Created WireGuard config: ${configPath}`);
    } catch (error) {
      logger.error('Error creating server config:', error);
      throw new Error('Failed to create server configuration');
    }
  }

  async updateServerConfig(server: any): Promise<void> {
    try {
      await this.createServerConfig(server); // Recreate config
      
      // Reload configuration if server is active
      if (server.is_active) {
        await this.reloadServer(server.interface_name);
      }
    } catch (error) {
      logger.error('Error updating server config:', error);
      throw new Error('Failed to update server configuration');
    }
  }

  async removeServerConfig(interfaceName: string): Promise<void> {
    try {
      const configPath = path.join(this.configDir, `${interfaceName}.conf`);
      
      if (await fs.pathExists(configPath)) {
        await fs.remove(configPath);
        logger.info(`Removed WireGuard config: ${configPath}`);
      }
    } catch (error) {
      logger.error('Error removing server config:', error);
      throw new Error('Failed to remove server configuration');
    }
  }

  async startServer(interfaceName: string): Promise<void> {
    try {
      await execAsync(`systemctl enable wg-quick@${interfaceName}`);
      await execAsync(`systemctl start wg-quick@${interfaceName}`);
      logger.info(`Started WireGuard interface: ${interfaceName}`);
    } catch (error) {
      logger.error('Error starting server:', error);
      throw new Error(`Failed to start WireGuard interface: ${interfaceName}`);
    }
  }

  async stopServer(interfaceName: string): Promise<void> {
    try {
      await execAsync(`systemctl stop wg-quick@${interfaceName}`);
      await execAsync(`systemctl disable wg-quick@${interfaceName}`);
      logger.info(`Stopped WireGuard interface: ${interfaceName}`);
    } catch (error) {
      logger.error('Error stopping server:', error);
      throw new Error(`Failed to stop WireGuard interface: ${interfaceName}`);
    }
  }

  async reloadServer(interfaceName: string): Promise<void> {
    try {
      await execAsync(`systemctl restart wg-quick@${interfaceName}`);
      logger.info(`Reloaded WireGuard interface: ${interfaceName}`);
    } catch (error) {
      logger.error('Error reloading server:', error);
      throw new Error(`Failed to reload WireGuard interface: ${interfaceName}`);
    }
  }

  async addClientToServer(client: any): Promise<void> {
    try {
      // This will be handled by updateServerConfig
      // which regenerates the entire configuration
      logger.info(`Added client ${client.name} to server configuration`);
    } catch (error) {
      logger.error('Error adding client to server:', error);
      throw error;
    }
  }

  async updateClientInServer(client: any): Promise<void> {
    try {
      // Get server information
      const server = await this.getServerForClient(client.server_id);
      if (server) {
        await this.updateServerConfig(server);
      }
    } catch (error) {
      logger.error('Error updating client in server:', error);
      throw error;
    }
  }

  async removeClientFromServer(client: any): Promise<void> {
    try {
      // Get server information
      const server = await this.getServerForClient(client.server_id);
      if (server) {
        await this.updateServerConfig(server);
      }
      logger.info(`Removed client ${client.name} from server configuration`);
    } catch (error) {
      logger.error('Error removing client from server:', error);
      throw error;
    }
  }

  buildClientConfig(client: any): string {
    const dnsServers = Array.isArray(client.dns_servers) ? client.dns_servers.join(', ') : '1.1.1.1, 8.8.8.8';
    
    return `[Interface]
PrivateKey = ${client.private_key}
Address = ${client.assigned_ip}/32
DNS = ${dnsServers}

[Peer]
PublicKey = ${client.server_public_key}
Endpoint = ${client.server_endpoint}
AllowedIPs = ${client.allowed_ips}
PersistentKeepalive = ${client.persistent_keepalive}`;
  }

  async generateQRCode(config: string): Promise<string> {
    // In production, this would use a QR code library
    // For now, return a mock QR code
    const encoded = Buffer.from(config).toString('base64');
    return `data:image/svg+xml;base64,${Buffer.from(`
      <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
        <rect width="200" height="200" fill="white"/>
        <rect x="20" y="20" width="160" height="160" fill="black"/>
        <rect x="40" y="40" width="120" height="120" fill="white"/>
        <text x="100" y="105" text-anchor="middle" fill="black" font-size="10">QR Code</text>
        <text x="100" y="120" text-anchor="middle" fill="black" font-size="8">WireGuard</text>
      </svg>
    `).toString('base64')}`;
  }

  private async getServerClients(serverId: string): Promise<any[]> {
    try {
      const { DatabaseService } = await import('./database');
      const db = new DatabaseService();
      
      const result = await db.query(`
        SELECT * FROM wireguard_clients 
        WHERE server_id = $1 AND is_enabled = TRUE
      `, [serverId]);
      
      return result.rows;
    } catch (error) {
      logger.error('Error fetching server clients:', error);
      return [];
    }
  }

  private async getServerForClient(serverId: string): Promise<any> {
    try {
      const { DatabaseService } = await import('./database');
      const db = new DatabaseService();
      
      const result = await db.query(`
        SELECT * FROM wireguard_servers WHERE id = $1
      `, [serverId]);
      
      return result.rows[0] || null;
    } catch (error) {
      logger.error('Error fetching server for client:', error);
      return null;
    }
  }
}