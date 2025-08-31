import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

interface DraftChange {
  id: string;
  type: 'policy' | 'device' | 'reservation';
  action: 'create' | 'update' | 'delete';
  target: string;
  data: any;
  timestamp: string;
}

interface ApplyResult {
  success: boolean;
  errors: string[];
  applied: number;
  rollbackId?: string;
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
    
    const result = await applyTrafficChanges(changes);

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
    console.error('Apply changes error:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        errors: [error.message || 'Apply failed'],
        applied: 0
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

async function applyTrafficChanges(changes: DraftChange[]): Promise<ApplyResult> {
  const errors: string[] = [];
  let appliedCount = 0;

  try {
    // Create rollback snapshot first
    const rollbackId = await createRollbackSnapshot();
    
    // Apply changes atomically
    for (const change of changes) {
      try {
        await applyIndividualChange(change);
        appliedCount++;
      } catch (error) {
        errors.push(`${change.target}: ${error.message}`);
        
        // If critical error, rollback
        if (errors.length > 3) {
          await rollbackToSnapshot(rollbackId);
          throw new Error('Çok fazla hata, değişiklikler geri alındı');
        }
      }
    }

    // Apply system-level configuration
    if (appliedCount > 0) {
      await applySystemConfiguration();
    }

    return {
      success: errors.length === 0,
      errors,
      applied: appliedCount,
      rollbackId
    };

  } catch (error) {
    return {
      success: false,
      errors: [...errors, error.message],
      applied: appliedCount
    };
  }
}

async function applyIndividualChange(change: DraftChange): Promise<void> {
  switch (change.type) {
    case 'policy':
      await applyPolicyChange(change);
      break;
    case 'device':
      await applyDeviceChange(change);
      break;
    case 'reservation':
      await applyReservationChange(change);
      break;
    default:
      throw new Error(`Unknown change type: ${change.type}`);
  }
}

async function applyPolicyChange(change: DraftChange): Promise<void> {
  const policy = change.data;
  
  console.log(`Applying policy change: ${change.action} for ${change.target}`);
  
  // In production, this would:
  // 1. Update nftables rules for traffic routing
  // 2. Update policy routing tables
  // 3. Configure WireGuard fwmark if WG egress selected
  // 4. Update DNS split-brain configuration
  // 5. Apply QoS rules to traffic shaping
  
  // Mock implementation
  await new Promise(resolve => setTimeout(resolve, 200));
}

async function applyDeviceChange(change: DraftChange): Promise<void> {
  const device = change.data;
  
  console.log(`Applying device change: ${change.action} for ${device.hostname || device.mac}`);
  
  // In production, this would:
  // 1. Update Kea DHCP configuration via Control Agent
  // 2. Add/update device reservations
  // 3. Configure DDNS entries
  // 4. Update device database records
  
  await new Promise(resolve => setTimeout(resolve, 150));
}

async function applyReservationChange(change: DraftChange): Promise<void> {
  const reservation = change.data;
  
  console.log(`Applying reservation change: ${change.action} for ${change.target}`);
  
  // In production, this would:
  // 1. Update DHCP reservations in Kea
  // 2. Restart DHCP service if needed
  // 3. Update database records
  
  await new Promise(resolve => setTimeout(resolve, 100));
}

async function applySystemConfiguration(): Promise<void> {
  console.log('Applying system configuration changes...');
  
  // In production, this would:
  // 1. Generate and apply nftables ruleset
  // 2. Update policy routing tables
  // 3. Reload network services
  // 4. Update DNS configuration
  // 5. Apply QoS policies
  
  await new Promise(resolve => setTimeout(resolve, 500));
}

async function createRollbackSnapshot(): Promise<string> {
  const snapshotId = `rollback-${Date.now()}`;
  
  console.log(`Creating rollback snapshot: ${snapshotId}`);
  
  // In production, this would:
  // 1. Capture current nftables rules
  // 2. Save current Kea configuration
  // 3. Backup policy routing tables
  // 4. Store DNS configuration
  
  return snapshotId;
}

async function rollbackToSnapshot(snapshotId: string): Promise<void> {
  console.log(`Rolling back to snapshot: ${snapshotId}`);
  
  // In production, this would:
  // 1. Restore nftables rules
  // 2. Restore Kea configuration
  // 3. Restore policy routing
  // 4. Restart affected services
}