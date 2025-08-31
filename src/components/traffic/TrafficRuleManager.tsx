import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import * as Icons from 'lucide-react';
import { PolicyMatrix } from './PolicyMatrix';
import { DraftManager } from './DraftManager';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { cn } from '../../lib/utils';
import { UserGroup, VLANGroup, EgressTarget, DNSProfile, TrafficPolicy, DraftChange } from '../../types/traffic';

export const TrafficRuleManager: React.FC = () => {
  const [draftChanges, setDraftChanges] = useState<DraftChange[]>([]);
  const [isApplying, setIsApplying] = useState(false);

  // Mock data - in production, this would come from your backend
  const [matrixData, setMatrixData] = useState({
    userGroups: [
      { id: 'local-1', name: 'Lokal 1', type: 'local' as const, memberCount: 8 },
      { id: 'local-2', name: 'Lokal 2', type: 'local' as const, memberCount: 5 },
      { id: 'local-3', name: 'Lokal 3', type: 'local' as const, memberCount: 12 },
      { id: 'wg-client-1', name: 'WG Client 1', type: 'wg' as const, memberCount: 3 },
      { id: 'wg-client-2', name: 'WG Client 2', type: 'wg' as const, memberCount: 7 }
    ] as UserGroup[],
    
    vlanGroups: [
      { id: 'vlan-10', name: 'Admin', vlanId: 10, subnet: '192.168.10.0/24' },
      { id: 'vlan-20', name: 'Trusted', vlanId: 20, subnet: '192.168.20.0/24' },
      { id: 'vlan-30', name: 'IoT', vlanId: 30, subnet: '192.168.30.0/24' },
      { id: 'vlan-40', name: 'Guest', vlanId: 40, subnet: '192.168.40.0/24' },
      { id: 'vlan-50', name: 'Gaming', vlanId: 50, subnet: '192.168.50.0/24' },
      { id: 'vlan-60', name: 'VoIP/Work', vlanId: 60, subnet: '192.168.60.0/24' },
      { id: 'vlan-70', name: 'Security', vlanId: 70, subnet: '192.168.70.0/24' },
      { id: 'vlan-80', name: 'Kids', vlanId: 80, subnet: '192.168.80.0/24' },
      { id: 'vlan-90', name: 'Media', vlanId: 90, subnet: '192.168.90.0/24' },
      { id: 'vlan-100', name: 'Lab/Test', vlanId: 100, subnet: '192.168.100.0/24' }
    ] as VLANGroup[],
    
    egressTargets: [
      { id: 'local', name: 'Lokal Ağ', type: 'local' as const, isActive: true },
      { id: 'wg-server-1', name: 'WG Server 1', type: 'wg' as const, isActive: true },
      { id: 'wg-server-2', name: 'WG Server 2', type: 'wg' as const, isActive: false }
    ] as EgressTarget[],
    
    dnsProfiles: [
      { id: 'default', name: 'Varsayılan', resolvers: ['1.1.1.1', '8.8.8.8'], blocklists: [] },
      { id: 'family', name: 'Aile Güvenli', resolvers: ['1.1.1.3', '1.0.0.3'], blocklists: ['adult', 'gambling'] },
      { id: 'business', name: 'İş Ağı', resolvers: ['208.67.222.222', '208.67.220.220'], blocklists: ['social', 'games'] }
    ] as DNSProfile[],
    
    policies: [
      {
        id: 'p1',
        groupId: 'local-1',
        vlanId: 'vlan-10',
        egressId: 'local',
        dnsProfileId: 'default',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ] as TrafficPolicy[]
  });

  const handlePolicyChange = (policy: Partial<TrafficPolicy>) => {
    // Add to draft changes
    const draftChange: DraftChange = {
      id: `draft-${Date.now()}`,
      type: 'policy',
      action: 'update',
      target: `${policy.groupId} → ${policy.vlanId}`,
      data: policy,
      timestamp: new Date().toISOString()
    };

    setDraftChanges(prev => [...prev, draftChange]);
  };

  const handleApplyChanges = async () => {
    setIsApplying(true);
    
    try {
      // Simulate API call to apply changes
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Apply changes to matrix data
      draftChanges.forEach(change => {
        if (change.type === 'policy' && change.action === 'update') {
          const newPolicy = change.data as TrafficPolicy;
          
          setMatrixData(prev => ({
            ...prev,
            policies: [
              ...prev.policies.filter(p => !(p.groupId === newPolicy.groupId && p.vlanId === newPolicy.vlanId)),
              {
                ...newPolicy,
                id: newPolicy.id || `policy-${Date.now()}`,
                createdAt: newPolicy.createdAt || new Date().toISOString(),
                updatedAt: new Date().toISOString()
              }
            ]
          }));
        }
      });
      
      // Clear draft changes
      setDraftChanges([]);
    } catch (error) {
      console.error('Apply changes error:', error);
    } finally {
      setIsApplying(false);
    }
  };

  const handleClearDrafts = () => {
    setDraftChanges([]);
  };

  return (
    <div className="space-y-6">
      {/* Draft Manager */}
      <DraftManager
        draftChanges={draftChanges}
        onApplyChanges={handleApplyChanges}
        onClearDrafts={handleClearDrafts}
        isApplying={isApplying}
      />

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Icons.Users className="w-5 h-5 text-emerald-400" />
            <div>
              <p className="text-white font-medium">{matrixData.userGroups.length}</p>
              <p className="text-white/60 text-xs">Kullanıcı Grubu</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Icons.Network className="w-5 h-5 text-blue-400" />
            <div>
              <p className="text-white font-medium">{matrixData.vlanGroups.length}</p>
              <p className="text-white/60 text-xs">VLAN Grubu</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Icons.Route className="w-5 h-5 text-purple-400" />
            <div>
              <p className="text-white font-medium">{matrixData.policies.length}</p>
              <p className="text-white/60 text-xs">Aktif Politika</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Icons.GitBranch className="w-5 h-5 text-orange-400" />
            <div>
              <p className="text-white font-medium">{draftChanges.length}</p>
              <p className="text-white/60 text-xs">Bekleyen Değişiklik</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Policy Matrix */}
      <PolicyMatrix
        data={matrixData}
        onPolicyChange={handlePolicyChange}
      />

      {/* Legend */}
      <Card title="Gösterge">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-white font-medium mb-3">Kullanıcı Grupları</h4>
            <div className="space-y-2">
              {matrixData.userGroups.map((group) => (
                <div key={group.id} className="flex items-center gap-3">
                  <Icons.Users className="w-4 h-4 text-emerald-400" />
                  <span className="text-white text-sm">{group.name}</span>
                  <span className="text-white/60 text-xs">({group.memberCount} üye)</span>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="text-white font-medium mb-3">Trafik Çıkışları</h4>
            <div className="space-y-2">
              {matrixData.egressTargets.map((target) => (
                <div key={target.id} className="flex items-center gap-3">
                  <div className={cn(
                    "w-2 h-2 rounded-full",
                    target.isActive ? "bg-emerald-400" : "bg-red-400"
                  )} />
                  <span className="text-white text-sm">{target.name}</span>
                  <span className="text-white/60 text-xs">
                    {target.type === 'local' ? 'Yerel' : 'WireGuard'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};