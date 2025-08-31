import { supabase } from './supabase';
import { TrafficPolicy, DraftChange, UserGroup, VLANGroup, EgressTarget, DNSProfile } from '../types/traffic';

class TrafficService {
  // Policy Management
  async getPolicies(): Promise<TrafficPolicy[]> {
    const { data, error } = await supabase
      .from('traffic_policies')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }

  async createPolicy(policy: Partial<TrafficPolicy>): Promise<TrafficPolicy> {
    const { data, error } = await supabase
      .from('traffic_policies')
      .insert([policy])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async updatePolicy(id: string, updates: Partial<TrafficPolicy>): Promise<TrafficPolicy> {
    const { data, error } = await supabase
      .from('traffic_policies')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async deletePolicy(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('traffic_policies')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  }

  // User Groups
  async getUserGroups(): Promise<UserGroup[]> {
    const { data, error } = await supabase
      .from('user_groups')
      .select('*')
      .order('name');
    
    if (error) throw error;
    return data || [];
  }

  // VLAN Groups
  async getVLANGroups(): Promise<VLANGroup[]> {
    const { data, error } = await supabase
      .from('vlan_groups')
      .select('*')
      .order('vlan_id');
    
    if (error) throw error;
    return data || [];
  }

  // Egress Targets
  async getEgressTargets(): Promise<EgressTarget[]> {
    const { data, error } = await supabase
      .from('egress_targets')
      .select('*')
      .order('name');
    
    if (error) throw error;
    return data || [];
  }

  // DNS Profiles
  async getDNSProfiles(): Promise<DNSProfile[]> {
    const { data, error } = await supabase
      .from('dns_profiles')
      .select('*')
      .order('name');
    
    if (error) throw error;
    return data || [];
  }

  // Draft System
  async saveDraftChanges(changes: DraftChange[]): Promise<void> {
    const { error } = await supabase
      .from('draft_changes')
      .insert(changes.map(change => ({
        type: change.type,
        action: change.action,
        target: change.target,
        data: change.data,
        timestamp: change.timestamp
      })));
    
    if (error) throw error;
  }

  async getDraftChanges(): Promise<DraftChange[]> {
    const { data, error } = await supabase
      .from('draft_changes')
      .select('*')
      .order('timestamp', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }

  async clearDraftChanges(): Promise<void> {
    const { error } = await supabase
      .from('draft_changes')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all
    
    if (error) throw error;
  }

  // Apply System
  async validateChanges(changes: DraftChange[]): Promise<{ valid: boolean; errors: string[] }> {
    try {
      // Call validation endpoint
      const { data, error } = await supabase.functions.invoke('validate-traffic-changes', {
        body: { changes }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      return {
        valid: false,
        errors: [error instanceof Error ? error.message : 'Validation failed']
      };
    }
  }

  async applyChanges(changes: DraftChange[]): Promise<{ success: boolean; errors: string[] }> {
    try {
      // Call apply endpoint
      const { data, error } = await supabase.functions.invoke('apply-traffic-changes', {
        body: { changes }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      return {
        success: false,
        errors: [error instanceof Error ? error.message : 'Apply failed']
      };
    }
  }

  // Snapshots
  async createSnapshot(name: string): Promise<void> {
    const { error } = await supabase.functions.invoke('create-network-snapshot', {
      body: { name }
    });

    if (error) throw error;
  }

  async getSnapshots(): Promise<any[]> {
    const { data, error } = await supabase
      .from('network_snapshots')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }

  async restoreSnapshot(id: string): Promise<void> {
    const { error } = await supabase.functions.invoke('restore-network-snapshot', {
      body: { snapshotId: id }
    });

    if (error) throw error;
  }
}

export const trafficService = new TrafficService();