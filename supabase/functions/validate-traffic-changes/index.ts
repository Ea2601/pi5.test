import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

interface DraftChange {
  id: string;
  type: 'policy' | 'device' | 'reservation';
  action: 'create' | 'update' | 'delete';
  target: string;
  data: any;
  timestamp: string;
}

interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
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
    const { changes }: { changes: DraftChange[] } = await req.json();
    
    const result = await validateTrafficChanges(changes);

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
    console.error('Validation error:', error);
    
    return new Response(
      JSON.stringify({
        valid: false,
        errors: [error.message || 'Validation failed'],
        warnings: []
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

async function validateTrafficChanges(changes: DraftChange[]): Promise<ValidationResult> {
  const errors: string[] = [];
  const warnings: string[] = [];

  for (const change of changes) {
    // Validate policy changes
    if (change.type === 'policy') {
      const policy = change.data;
      
      // Check required fields
      if (!policy.groupId) errors.push(`Politika ${change.target}: Kullanıcı grubu gerekli`);
      if (!policy.vlanId) errors.push(`Politika ${change.target}: VLAN grubu gerekli`);
      if (!policy.egressId) errors.push(`Politika ${change.target}: Trafik çıkışı gerekli`);
      
      // Check QoS configuration
      if (policy.qosConfig?.enabled) {
        if (policy.qosConfig.maxBandwidth && policy.qosConfig.maxBandwidth < 0) {
          errors.push(`Politika ${change.target}: Geçersiz bant genişliği değeri`);
        }
        if (!['low', 'normal', 'high'].includes(policy.qosConfig.priority)) {
          errors.push(`Politika ${change.target}: Geçersiz öncelik değeri`);
        }
      }
      
      // Check schedule configuration
      if (policy.scheduleConfig?.enabled) {
        if (!policy.scheduleConfig.allowedHours || policy.scheduleConfig.allowedHours.length === 0) {
          warnings.push(`Politika ${change.target}: Saat kısıtlaması tanımlanmamış`);
        }
      }
    }
    
    // Validate device changes
    if (change.type === 'device') {
      const device = change.data;
      
      if (!device.mac) errors.push(`Cihaz ${change.target}: MAC adresi gerekli`);
      if (!device.hostname) warnings.push(`Cihaz ${change.target}: Hostname önerilir`);
      
      // MAC format validation
      const macRegex = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/;
      if (device.mac && !macRegex.test(device.mac)) {
        errors.push(`Cihaz ${change.target}: Geçersiz MAC adresi formatı`);
      }
      
      // IP validation if static IP is provided
      if (device.static_ip) {
        const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
        if (!ipRegex.test(device.static_ip)) {
          errors.push(`Cihaz ${change.target}: Geçersiz IP adresi formatı`);
        }
      }
    }
  }

  // Check for conflicting changes
  const policyChanges = changes.filter(c => c.type === 'policy');
  const duplicatePolicies = policyChanges.filter((change, index) => 
    policyChanges.findIndex(c => 
      c.data.groupId === change.data.groupId && 
      c.data.vlanId === change.data.vlanId
    ) !== index
  );
  
  if (duplicatePolicies.length > 0) {
    errors.push('Aynı grup-VLAN kombinasyonu için birden fazla politika tanımlanmış');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}