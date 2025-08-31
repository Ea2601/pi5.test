import { supabase } from './supabase';

export interface AutoWGInstallRequest {
  username: string;
  ipAddress: string;
  password: string;
  serverName: string;
  sshPort?: number;
  wgPort?: number;
  wgNetwork?: string;
  wgInterface?: string;
  clientName?: string;
  createClient?: boolean;
}

export interface AutoWGInstallResult {
  success: boolean;
  serverPublicKey?: string;
  clientConfig?: string;
  serverInfo?: {
    serverIP: string;
    wgInterface: string;
    wgNetwork: string;
    wgPort: number;
  };
  error?: string;
  installationLog?: string[];
}

class AutoWGService {
  async installWireGuard(request: AutoWGInstallRequest): Promise<AutoWGInstallResult> {
    try {
      // Call the Supabase edge function
      const { data, error } = await supabase.functions.invoke('auto-wg-installer', {
        body: request
      });

      if (error) {
        throw new Error(error.message);
      }

      return data;
    } catch (error) {
      console.error('Auto WG installation error:', error);
      throw new Error(error instanceof Error ? error.message : 'Installation failed');
    }
  }

  async validateSSHConnection(
    username: string, 
    ipAddress: string, 
    password: string, 
    port: number = 22
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // In production, this would test SSH connectivity
      // For demo, simulate validation
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock validation logic
      if (!username || !ipAddress || !password) {
        return { success: false, error: 'Eksik bilgiler' };
      }
      
      if (Math.random() < 0.1) {
        return { success: false, error: 'SSH bağlantısı başarısız' };
      }
      
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Bağlantı hatası' 
      };
    }
  }

  async getInstallationHistory(): Promise<any[]> {
    // In production, this would fetch from database
    const { data, error } = await supabase
      .from('auto_wg_installations')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Error fetching installation history:', error);
      return [];
    }

    return data || [];
  }

  async saveInstallationRecord(
    request: AutoWGInstallRequest, 
    result: AutoWGInstallResult
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('auto_wg_installations')
        .insert([{
          server_name: request.serverName,
          server_ip: request.ipAddress,
          wg_interface: request.wgInterface || 'wg0',
          wg_port: request.wgPort || 51820,
          wg_network: request.wgNetwork || '10.7.0.0/24',
          installation_success: result.success,
          server_public_key: result.serverPublicKey,
          error_message: result.error,
          installation_log: result.installationLog
        }]);

      if (error) {
        console.error('Error saving installation record:', error);
      }
    } catch (error) {
      console.error('Error saving installation record:', error);
    }
  }
}

export const autoWGService = new AutoWGService();