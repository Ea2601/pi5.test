import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as Icons from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { cn } from '../../lib/utils';
import { UserGroup, VLANGroup, EgressTarget, DNSProfile, TrafficPolicy, PolicyMatrixCell } from '../../types/traffic';

interface PolicyMatrix {
  userGroups: UserGroup[];
  vlanGroups: VLANGroup[];
  egressTargets: EgressTarget[];
  dnsProfiles: DNSProfile[];
  policies: TrafficPolicy[];
}

interface PolicyConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  groupId: string;
  vlanId: string;
  existingPolicy?: TrafficPolicy;
  egressTargets: EgressTarget[];
  dnsProfiles: DNSProfile[];
  onSave: (policy: Partial<TrafficPolicy>) => void;
}

const PolicyConfigModal: React.FC<PolicyConfigModalProps> = ({
  isOpen,
  onClose,
  groupId,
  vlanId,
  existingPolicy,
  egressTargets,
  dnsProfiles,
  onSave
}) => {
  const [config, setConfig] = useState({
    egressId: existingPolicy?.egressId || '',
    dnsProfileId: existingPolicy?.dnsProfileId || '',
    scheduleEnabled: existingPolicy?.scheduleConfig?.enabled || false,
    qosEnabled: existingPolicy?.qosConfig?.enabled || false,
    priority: existingPolicy?.qosConfig?.priority || 'normal' as const,
    maxBandwidth: existingPolicy?.qosConfig?.maxBandwidth || 0
  });

  const handleSave = () => {
    onSave({
      groupId,
      vlanId,
      egressId: config.egressId,
      dnsProfileId: config.dnsProfileId || undefined,
      scheduleConfig: config.scheduleEnabled ? {
        enabled: true,
        allowedHours: ['00-24'],
        allowedDays: ['0', '1', '2', '3', '4', '5', '6']
      } : undefined,
      qosConfig: config.qosEnabled ? {
        enabled: true,
        priority: config.priority,
        maxBandwidth: config.maxBandwidth > 0 ? config.maxBandwidth : undefined
      } : undefined
    });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Politika Yapılandırması" size="lg">
      <div className="space-y-6">
        {/* Egress Target Selection */}
        <div>
          <label className="block text-white text-sm font-medium mb-3">
            <Icons.Globe className="w-4 h-4 inline mr-2" />
            Trafik Çıkışı
          </label>
          <div className="grid grid-cols-1 gap-2">
            {egressTargets.map((target) => (
              <button
                key={target.id}
                onClick={() => setConfig({ ...config, egressId: target.id })}
                className={cn(
                  "p-3 rounded-lg border text-left transition-all",
                  config.egressId === target.id
                    ? "bg-emerald-500/20 border-emerald-500/30 text-white"
                    : "bg-white/5 border-white/10 text-white/80 hover:bg-white/10 hover:border-white/20"
                )}
              >
                <div className="flex items-center gap-3">
                  <Icons.Router className="w-4 h-4 text-emerald-400" />
                  <div>
                    <p className="font-medium">{target.name}</p>
                    <p className="text-xs text-white/60">{target.type === 'local' ? 'Yerel Ağ' : 'WireGuard Tüneli'}</p>
                  </div>
                  {config.egressId === target.id && (
                    <Icons.Check className="w-4 h-4 text-emerald-400 ml-auto" />
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* DNS Profile Selection */}
        <div>
          <label className="block text-white text-sm font-medium mb-3">
            <Icons.Shield className="w-4 h-4 inline mr-2" />
            DNS Profili
          </label>
          <select
            value={config.dnsProfileId}
            onChange={(e) => setConfig({ ...config, dnsProfileId: e.target.value })}
            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
          >
            <option value="">Varsayılan DNS</option>
            {dnsProfiles.map((profile) => (
              <option key={profile.id} value={profile.id} className="bg-gray-800">
                {profile.name}
              </option>
            ))}
          </select>
        </div>

        {/* Schedule Configuration */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setConfig({ ...config, scheduleEnabled: !config.scheduleEnabled })}
              className={cn(
                "relative w-10 h-5 rounded-full transition-all duration-300",
                config.scheduleEnabled 
                  ? "bg-emerald-500 shadow-lg shadow-emerald-500/30" 
                  : "bg-white/20"
              )}
            >
              <div
                className={cn(
                  "absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all duration-300 shadow-lg",
                  config.scheduleEnabled ? "left-5" : "left-0.5"
                )}
              />
            </button>
            <span className="text-white font-medium">Erişim Zamanlaması</span>
          </div>
          {config.scheduleEnabled && (
            <div className="p-3 bg-white/5 rounded-lg border border-white/10">
              <p className="text-white/60 text-sm">24/7 erişim aktif (gelişmiş zamanlama yakında)</p>
            </div>
          )}
        </div>

        {/* QoS Configuration */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setConfig({ ...config, qosEnabled: !config.qosEnabled })}
              className={cn(
                "relative w-10 h-5 rounded-full transition-all duration-300",
                config.qosEnabled 
                  ? "bg-emerald-500 shadow-lg shadow-emerald-500/30" 
                  : "bg-white/20"
              )}
            >
              <div
                className={cn(
                  "absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all duration-300 shadow-lg",
                  config.qosEnabled ? "left-5" : "left-0.5"
                )}
              />
            </button>
            <span className="text-white font-medium">Hız/Öncelik Kontrolü</span>
          </div>
          {config.qosEnabled && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-white text-sm mb-2">Öncelik</label>
                <select
                  value={config.priority}
                  onChange={(e) => setConfig({ ...config, priority: e.target.value as 'low' | 'normal' | 'high' })}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none"
                >
                  <option value="low" className="bg-gray-800">Düşük</option>
                  <option value="normal" className="bg-gray-800">Normal</option>
                  <option value="high" className="bg-gray-800">Yüksek</option>
                </select>
              </div>
              <div>
                <label className="block text-white text-sm mb-2">Max Bant Genişliği (Mbps)</label>
                <input
                  type="number"
                  value={config.maxBandwidth}
                  onChange={(e) => setConfig({ ...config, maxBandwidth: parseInt(e.target.value) || 0 })}
                  placeholder="Sınırsız"
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none"
                />
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-4 border-t border-white/10">
          <Button onClick={handleSave} className="flex-1">
            <Icons.Save className="w-4 h-4 mr-2" />
            Kaydet
          </Button>
          <Button variant="outline" onClick={onClose} className="flex-1">
            İptal
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export const PolicyMatrix: React.FC<{ data: PolicyMatrix; onPolicyChange: (policy: Partial<TrafficPolicy>) => void }> = ({
  data,
  onPolicyChange
}) => {
  const [selectedCell, setSelectedCell] = useState<{ groupId: string; vlanId: string } | null>(null);
  const [showConfigModal, setShowConfigModal] = useState(false);

  const handleCellClick = (groupId: string, vlanId: string) => {
    setSelectedCell({ groupId, vlanId });
    setShowConfigModal(true);
  };

  const handlePolicySave = (policy: Partial<TrafficPolicy>) => {
    onPolicyChange(policy);
    setShowConfigModal(false);
    setSelectedCell(null);
  };

  const getExistingPolicy = (): TrafficPolicy | undefined => {
    if (!selectedCell) return undefined;
    return data.policies.find(p => 
      p.groupId === selectedCell.groupId && p.vlanId === selectedCell.vlanId
    );
  };

  const getPolicyBadge = (groupId: string, vlanId: string) => {
    const policy = data.policies.find(p => p.groupId === groupId && p.vlanId === vlanId);
    if (!policy) return null;

    const egress = data.egressTargets.find(e => e.id === policy.egressId);
    return (
      <div className="absolute top-1 right-1 w-3 h-3 bg-emerald-400 rounded-full border border-emerald-300 shadow-lg shadow-emerald-400/50" 
           title={`Egress: ${egress?.name || 'Tanımsız'}`} />
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-white">Politika Matrisi</h3>
          <p className="text-white/70 text-sm">Kullanıcı Grupları × VLAN Grupları trafik kuralları</p>
        </div>
      </div>

      {/* Matrix Table */}
      <Card title="Trafik Yönlendirme Matrisi" className="overflow-hidden">
        <div className="overflow-x-auto">
          <div className="min-w-[800px]">
            {/* Header Row */}
            <div className="grid grid-cols-[200px_repeat(10,1fr)] gap-1 mb-2">
              <div className="p-3 bg-white/5 rounded-lg">
                <span className="text-white/80 font-medium text-sm">Grup \ VLAN</span>
              </div>
              {data.vlanGroups.map((vlan) => (
                <div key={vlan.id} className="p-2 bg-white/5 rounded-lg text-center">
                  <div className="text-white font-medium text-xs">{vlan.vlanId}</div>
                  <div className="text-white/60 text-xs truncate">{vlan.name}</div>
                </div>
              ))}
            </div>

            {/* Matrix Rows */}
            <div className="space-y-1">
              {data.userGroups.map((group) => (
                <div key={group.id} className="grid grid-cols-[200px_repeat(10,1fr)] gap-1">
                  {/* Group Label */}
                  <div className="p-3 bg-white/5 rounded-lg flex items-center gap-2">
                    <Icons.Users className="w-4 h-4 text-emerald-400" />
                    <div>
                      <div className="text-white font-medium text-sm">{group.name}</div>
                      <div className="text-white/60 text-xs">{group.memberCount} üye</div>
                    </div>
                  </div>

                  {/* Policy Cells */}
                  {data.vlanGroups.map((vlan) => {
                    const hasPolicy = data.policies.some(p => p.groupId === group.id && p.vlanId === vlan.id);
                    
                    return (
                      <button
                        key={`${group.id}-${vlan.id}`}
                        onClick={() => handleCellClick(group.id, vlan.id)}
                        className={cn(
                          "relative h-16 rounded-lg border transition-all duration-200 hover:scale-105",
                          hasPolicy
                            ? "bg-emerald-500/20 border-emerald-500/30 hover:bg-emerald-500/30"
                            : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20"
                        )}
                      >
                        {getPolicyBadge(group.id, vlan.id)}
                        <div className="absolute inset-0 flex items-center justify-center">
                          {hasPolicy ? (
                            <Icons.Check className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <Icons.Plus className="w-4 h-4 text-white/40" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Configuration Modal */}
      {selectedCell && (
        <PolicyConfigModal
          isOpen={showConfigModal}
          onClose={() => {
            setShowConfigModal(false);
            setSelectedCell(null);
          }}
          groupId={selectedCell.groupId}
          vlanId={selectedCell.vlanId}
          existingPolicy={getExistingPolicy()}
          egressTargets={data.egressTargets}
          dnsProfiles={data.dnsProfiles}
          onSave={handlePolicySave}
        />
      )}
    </div>
  );
};