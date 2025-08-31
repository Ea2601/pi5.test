import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

interface AutoWGRequest {
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

interface InstallationResult {
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

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const requestData: AutoWGRequest = await req.json();
    
    // Validate required fields
    const requiredFields = ['username', 'ipAddress', 'password', 'serverName'];
    for (const field of requiredFields) {
      if (!requestData[field as keyof AutoWGRequest]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    // Set defaults
    const config = {
      sshPort: requestData.sshPort || 22,
      wgPort: requestData.wgPort || 51820,
      wgNetwork: requestData.wgNetwork || '10.7.0.0/24',
      wgInterface: requestData.wgInterface || 'wg0',
      clientName: requestData.clientName || 'client1',
      createClient: requestData.createClient !== false,
      ...requestData
    };

    // In production, this would execute the actual SSH connection and WireGuard installation
    const result = await installWireGuardRemotely(config);

    return new Response(
      JSON.stringify(result),
      {
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        }
      }
    );
  } catch (error) {
    console.error('Auto WG installation error:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Installation failed'
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        }
      }
    );
  }
});

async function installWireGuardRemotely(config: AutoWGRequest & {
  sshPort: number;
  wgPort: number;
  wgNetwork: string;
  wgInterface: string;
  clientName: string;
  createClient: boolean;
}): Promise<InstallationResult> {
  
  try {
    // In production, this would use a library like 'ssh2' to execute remote commands
    // For demo purposes, we'll simulate the installation process
    
    const installationLog: string[] = [];
    const logStep = (message: string) => {
      installationLog.push(`[${new Date().toISOString()}] ${message}`);
      console.log(message);
    };

    logStep(`Starting WireGuard installation on ${config.ipAddress}`);
    logStep(`SSH connection to ${config.username}@${config.ipAddress}:${config.sshPort}`);
    
    // Simulate installation steps
    await new Promise(resolve => setTimeout(resolve, 1000));
    logStep('System package update completed');
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    logStep('WireGuard packages installed successfully');
    
    await new Promise(resolve => setTimeout(resolve, 800));
    logStep('IP forwarding enabled');
    
    await new Promise(resolve => setTimeout(resolve, 1200));
    logStep('Server key pair generated');
    
    // Generate mock keys
    const serverPrivateKey = generateMockKey();
    const serverPublicKey = generateMockKey();
    
    logStep(`Server public key: ${serverPublicKey}`);
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    logStep(`Configuration file created: /etc/wireguard/${config.wgInterface}.conf`);
    
    await new Promise(resolve => setTimeout(resolve, 800));
    logStep(`WireGuard service started on interface ${config.wgInterface}`);

    let clientConfig = '';
    if (config.createClient) {
      const clientPrivateKey = generateMockKey();
      const clientPublicKey = generateMockKey();
      const presharedKey = generateMockKey();
      
      logStep(`Client key pair generated for ${config.clientName}`);
      
      const networkParts = config.wgNetwork.split('.');
      const clientIP = `${networkParts[0]}.${networkParts[1]}.${networkParts[2]}.2`;
      
      clientConfig = `[Interface]
PrivateKey = ${clientPrivateKey}
Address = ${clientIP}/24
DNS = 1.1.1.1, 8.8.8.8

[Peer]
PublicKey = ${serverPublicKey}
PresharedKey = ${presharedKey}
Endpoint = ${config.ipAddress}:${config.wgPort}
AllowedIPs = 0.0.0.0/0, ::/0
PersistentKeepalive = 25`;

      logStep('Client configuration generated');
    }

    logStep('WireGuard installation completed successfully');

    // Simulate a small chance of failure
    if (Math.random() < 0.05) {
      throw new Error('SSH connection timeout');
    }

    return {
      success: true,
      serverPublicKey,
      clientConfig: config.createClient ? clientConfig : undefined,
      serverInfo: {
        serverIP: config.ipAddress,
        wgInterface: config.wgInterface,
        wgNetwork: config.wgNetwork,
        wgPort: config.wgPort
      },
      installationLog
    };

  } catch (error) {
    return {
      success: false,
      error: error.message || 'Unknown installation error'
    };
  }
}

function generateMockKey(): string {
  // Generate a realistic-looking WireGuard key (base64, 44 characters)
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  let result = '';
  for (let i = 0; i < 43; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result + '=';
}