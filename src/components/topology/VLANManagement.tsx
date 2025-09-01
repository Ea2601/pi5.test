import React, { useState } from 'react';
import { motion } from 'framer-motion';
import * as Icons from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { cn } from '../../lib/utils';
import { useVLANConfigurations, useCreateVLAN, useUpdateVLAN } from '../../hooks/api/useTopology';
import { VLANConfiguration } from '../../types/topology';

interface VLANFormData {
  vlan_id: number;
  vlan_name: string;
  description: string;
  network_cidr: string;
  gateway_ip: string;
  security_level: 'low' | 'medium' | 'high' | 'critical';
  traffic_priority: 'low' | 'normal' | 'high' | 'critical';
  isolation_enabled: boolean;
  inter_vlan_routing: boolean;
  internet_access: boolean;
  bandwidth_limit_mbps: number;
  max_devices: number;
  domain_suffix: string;
}

const vlanPresets = [
  { vlan: 10, name: 'Admin', description: 'Yönetim cihazları - PC, Laptop', network: '192.168.10.0/24', security: 'critical', priority: 'high', color: '#4A90E2' },
  { vlan: 20, name: 'Trusted', description: 'Normal kullanım - Telefon, Tablet', network: '192.168.20.0/24', security: 'high', priority: 'normal', color: '#7ED321' },
  { vlan: 30, name: 'IoT', description: 'IoT cihazları - TV, Buzdolabı', network: '192.168.30.0/24', security: 'medium', priority: 'low', color: '#F5A623' },
  { vlan: 40, name: 'Guest', description: 'Misafir cihazları - Internet-only', network: '192.168.40.0/24', security: 'low', priority: 'low', color: '#D0021B' },
  { vlan: 50, name: 'Gaming', description: 'Oyun konsolları - Düşük ping', network: '192.168.50.0/24', security: 'medium', priority: 'critical', color: '#9013FE' },
  { vlan: 60, name: 'VoIP/Work', description: 'VoIP ve iş cihazları', network: '192.168.60.0/24', security: 'high', priority: 'high', color: '#50E3C2' },
  { vlan: 70, name: 'Security', description: 'Güvenlik kameraları ve NVR', network: '192.168.70.0/24', security: 'high', priority: 'normal', color: '#B71C1C' },
  { vlan: 80, name: 'Kids', description: 'Çocuk cihazları - Zaman kısıtlı', network: '192.168.80.0/24', security: 'medium', priority: 'normal', color: '#FF9800' },
  { vlan: 90, name: 'Media', description: 'Medya sunucuları - Plex, Jellyfin', network: '192.168.90.0/24', security: 'medium', priority: 'high', color: '#673AB7' },
  { vlan: 100, name: 'Lab/Test', description: 'Test ve deneysel cihazlar', network: '192.168.100.0/24', security: 'low', priority: 'low', color: '#607D8B' }
];

export const VLANManagement: React.FC = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPresetModal, setShowPresetModal] = useState(false);
  const [editingVLAN, setEditingVLAN] = useState<VLANConfiguration | null>(null);
  
  const { data: vlans = [], isLoading } = useVLANConfigurations();
  const createVLANMutation = useCreateVLAN();
  const updateVLANMutation = useUpdateVLAN();

  const [formData, setFormData] = useState<VLANFormData>({
    vlan_id: 10,
    vlan_name: '',
    description: '',
    network_cidr: '192.168.10.0/24',
    gateway_ip: '192.168.10.1',
    security_level: 'medium',
    traffic_priority: 'normal',
    isolation_enabled: false,
    inter_vlan_routing: true,
    internet_access: true,
    bandwidth_limit_mbps: 0,
    max_devices: 253,
    domain_suffix: 'local'
  });

  const resetForm = () => {
    setFormData({
      vlan_id: 10,
      vlan_name: '',
      description: '',
      network_cidr: '192.168.10.0/24',
      gateway_ip: '192.168.10.1',
      security_level: 'medium',
      traffic_priority: 'normal',
      isolation_enabled: false,
      inter_vlan_routing: true,
      internet_access: true,
      bandwidth_limit_mbps: 0,
      max_devices: 253,
      domain_suffix: 'local'
    });
  };

  const handleCreateVLAN = async () => {
    try {
      await createVLANMutation.mutateAsync({
        ...formData,
        custom_dns_servers: [],
        device_restrictions: {},
        time_restrictions: {}
      });
      setShowCreateModal(false);
      resetForm();
    } catch (error) {
      console.error('Create VLAN error:', error);
    }
  };

  const handlePresetSelect = (preset: typeof vlanPresets[0]) => {
    const [network, cidr] = preset.network.split('/');
    const networkParts = network.split('.');
    
    setFormData({
      ...formData,
      vlan_id: preset.vlan,
      vlan_name: preset.name,
      description: preset.description,
      network_cidr: preset.network,
      gateway_ip: `${networkParts[0]}.${networkParts[1]}.${networkParts[2]}.1`,
      security_level: preset.security as any,
      traffic_priority: preset.priority as any
    });
    setShowPresetModal(false);
  };

  const getSecurityIcon = (level: string) => {
    switch (level) {
      case 'critical': return Icons.ShieldCheck;
      case 'high': return Icons.Shield;
      case 'medium': return Icons.ShieldAlert;
      case 'low': return Icons.ShieldX;
      default: return Icons.Shield;
    }
  };

  const getSecurityColor = (level: string) => {
    switch (level) {
      case 'critical': return 'text-purple-400 bg-purple-500/20 border-purple-500/30';
      case 'high': return 'text-emerald-400 bg-emerald-500/20 border-emerald-500/30';
      case 'medium': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      case 'low': return 'text-red-400 bg-red-500/20 border-red-500/30';
      default: return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-400';
      case 'high': return 'text-orange-400';
      case 'normal': return 'text-emerald-400';
      case 'low': return 'text-gray-400';
      default: return 'text-gray-400';
    }
  };

  const VLANCard: React.FC<{ vlan: VLANConfiguration }> = ({ vlan }) => {
    const SecurityIcon = getSecurityIcon(vlan.security_level);
    const preset = vlanPresets.find(p => p.vlan === vlan.vlan_id);
    
    return (
      <Card className="h-full">
        <div className="space-y-4">
          {/* VLAN Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div 
                className="w-10 h-10 rounded-lg flex items-center justify-center border text-white font-bold"
                style={{
                  backgroundColor: `${preset?.color || '#48CAE4'}20`,
                  borderColor: `${preset?.color || '#48CAE4'}60`,
                  color: preset?.color || '#48CAE4'
                }}
              >
                {vlan.vlan_id}
              </div>
              <div>
                <h4 className="text-white font-semibold">{vlan.vlan_name}</h4>
                <p className="text-white/60 text-sm">{vlan.network_cidr}</p>
              </div>
            </div>
            <div className={cn(
              "w-3 h-3 rounded-full",
              vlan.is_active ? "bg-emerald-400" : "bg-gray-400"
            )} />
          </div>

          {/* VLAN Properties */}
          <div className="grid grid-cols-2 gap-3">
            <div className={cn("p-2 rounded-lg text-center border", getSecurityColor(vlan.security_level))}>
              <SecurityIcon className="w-4 h-4 mx-auto mb-1" />
              <span className="text-xs">{vlan.security_level}</span>
            </div>
            <div className="p-2 rounded-lg text-center bg-white/5 border border-white/10">
              <Icons.Zap className={cn("w-4 h-4 mx-auto mb-1", getPriorityColor(vlan.traffic_priority))} />
              <span className="text-xs text-white">{vlan.traffic_priority}</span>
            </div>
          </div>

          {/* Network Info */}
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-white/60">Gateway:</span>
              <span className="text-white font-mono">{vlan.gateway_ip}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/60">DHCP:</span>
              <span className={vlan.dhcp_enabled ? 'text-emerald-400' : 'text-red-400'}>
                {vlan.dhcp_enabled ? 'Etkin' : 'Devre Dışı'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/60">Max Cihaz:</span>
              <span className="text-white">{vlan.max_devices}</span>
            </div>
            {vlan.bandwidth_limit_mbps && (
              <div className="flex justify-between">
                <span className="text-white/60">Bant Limiti:</span>
                <span className="text-white">{vlan.bandwidth_limit_mbps} Mbps</span>
              </div>
            )}
          </div>

          {/* Access Restrictions */}
          <div className="grid grid-cols-3 gap-2">
            <div className={cn(
              "p-2 rounded text-center text-xs",
              vlan.isolation_enabled ? "bg-orange-500/20 text-orange-400" : "bg-white/5 text-white/60"
            )}>
              <Icons.Shield className="w-3 h-3 mx-auto mb-1" />
              Izole
            </div>
            <div className={cn(
              "p-2 rounded text-center text-xs",
              vlan.inter_vlan_routing ? "bg-emerald-500/20 text-emerald-400" : "bg-white/5 text-white/60"
            )}>
              <Icons.ArrowLeftRight className="w-3 h-3 mx-auto mb-1" />
              VLAN Geçiş
            </div>
            <div className={cn(
              "p-2 rounded text-center text-xs",
              vlan.internet_access ? "bg-blue-500/20 text-blue-400" : "bg-red-500/20 text-red-400"
            )}>
              <Icons.Globe className="w-3 h-3 mx-auto mb-1" />
              Internet
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 pt-3 border-t border-white/10">
            <Button
              size="sm"
              variant={vlan.is_active ? "destructive" : "default"}
              onClick={() => updateVLANMutation.mutate({ 
                id: vlan.id, 
                updates: { is_active: !vlan.is_active } 
              })}
              className="flex-1"
            >
              {vlan.is_active ? (
                <>
                  <Icons.Pause className="w-3 h-3 mr-1" />
                  Devre Dışı
                </>
              ) : (
                <>
                  <Icons.Play className="w-3 h-3 mr-1" />
                  Etkinleştir
                </>
              )}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setEditingVLAN(vlan);
                setFormData({
                  vlan_id: vlan.vlan_id,
                  vlan_name: vlan.vlan_name,
                  description: vlan.description || '',
                  network_cidr: vlan.network_cidr,
                  gateway_ip: vlan.gateway_ip,
                  security_level: vlan.security_level,
                  traffic_priority: vlan.traffic_priority,
                  isolation_enabled: vlan.isolation_enabled,
                  inter_vlan_routing: vlan.inter_vlan_routing,
                  internet_access: vlan.internet_access,
                  bandwidth_limit_mbps: vlan.bandwidth_limit_mbps || 0,
                  max_devices: vlan.max_devices,
                  domain_suffix: vlan.domain_suffix
                });
              }}
            >
              <Icons.Edit className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-white">VLAN Yapılandırması</h3>
          <p className="text-white/70 text-sm">Sanal ağ bölümleri ve trafik politikaları</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setShowPresetModal(true)}>
            <Icons.Layers className="w-4 h-4 mr-2" />
            Preset VLAN'lar
          </Button>
          <Button onClick={() => setShowCreateModal(true)}>
            <Icons.Plus className="w-4 h-4 mr-2" />
            Özel VLAN
          </Button>
        </div>
      </div>

      {/* VLAN Grid */}
      {vlans.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <Icons.Network className="w-16 h-16 text-white/30 mx-auto mb-4" />
            <h3 className="text-white font-semibold mb-2">Henüz VLAN yapılandırması bulunmuyor</h3>
            <p className="text-white/60 mb-4">İlk VLAN'ınızı oluşturun</p>
            <div className="flex items-center gap-2 justify-center">
              <Button onClick={() => setShowPresetModal(true)}>
                <Icons.Layers className="w-4 h-4 mr-2" />
                Preset VLAN'lar
              </Button>
              <Button variant="outline" onClick={() => setShowCreateModal(true)}>
                <Icons.Plus className="w-4 h-4 mr-2" />
                Özel VLAN
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {vlans.map((vlan) => (
            <VLANCard key={vlan.id} vlan={vlan} />
          ))}
        </div>
      )}

      {/* Preset VLAN Modal */}
      <Modal
        isOpen={showPresetModal}
        onClose={() => setShowPresetModal(false)}
        title="Önceden Tanımlanmış VLAN'lar"
        size="xl"
      >
        <div className="space-y-4">
          <p className="text-white/70 text-sm">Enterprise standartlarına uygun VLAN yapılandırmalarını seçin</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {vlanPresets.map((preset) => (
              <button
                key={preset.vlan}
                onClick={() => handlePresetSelect(preset)}
                className="p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:border-white/20 transition-all text-left"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold border"
                      style={{
                        backgroundColor: `${preset.color}20`,
                        borderColor: `${preset.color}60`,
                        color: preset.color
                      }}
                    >
                      {preset.vlan}
                    </div>
                    <div>
                      <h4 className="text-white font-medium">{preset.name}</h4>
                      <p className="text-white/60 text-xs">{preset.network}</p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className={cn("px-2 py-1 rounded text-xs border", getSecurityColor(preset.security))}>
                      {preset.security}
                    </span>
                    <span className={cn("px-2 py-1 rounded text-xs", getPriorityColor(preset.priority))}>
                      {preset.priority}
                    </span>
                  </div>
                </div>
                <p className="text-white/70 text-sm">{preset.description}</p>
              </button>
            ))}
          </div>
        </div>
      </Modal>

      {/* Create/Edit VLAN Modal */}
      <Modal
        isOpen={showCreateModal || !!editingVLAN}
        onClose={() => {
          setShowCreateModal(false);
          setEditingVLAN(null);
          resetForm();
        }}
        title={editingVLAN ? 'VLAN Düzenle' : 'Yeni VLAN Oluştur'}
        size="lg"
      >
        <div className="space-y-6">
          {/* Basic Configuration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-white text-sm font-medium mb-2">VLAN ID</label>
              <input
                type="number"
                value={formData.vlan_id}
                onChange={(e) => setFormData({ ...formData, vlan_id: parseInt(e.target.value) })}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                min="1"
                max="4094"
              />
            </div>
            <div>
              <label className="block text-white text-sm font-medium mb-2">VLAN Adı</label>
              <input
                type="text"
                value={formData.vlan_name}
                onChange={(e) => setFormData({ ...formData, vlan_name: e.target.value })}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                placeholder="Admin"
              />
            </div>
          </div>

          <div>
            <label className="block text-white text-sm font-medium mb-2">Açıklama</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              rows={2}
              placeholder="VLAN açıklaması"
            />
          </div>

          {/* Network Configuration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-white text-sm font-medium mb-2">Ağ CIDR</label>
              <input
                type="text"
                value={formData.network_cidr}
                onChange={(e) => setFormData({ ...formData, network_cidr: e.target.value })}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                placeholder="192.168.10.0/24"
              />
            </div>
            <div>
              <label className="block text-white text-sm font-medium mb-2">Gateway IP</label>
              <input
                type="text"
                value={formData.gateway_ip}
                onChange={(e) => setFormData({ ...formData, gateway_ip: e.target.value })}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                placeholder="192.168.10.1"
              />
            </div>
          </div>

          {/* Security and Priority */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-white text-sm font-medium mb-2">Güvenlik Seviyesi</label>
              <select
                value={formData.security_level}
                onChange={(e) => setFormData({ ...formData, security_level: e.target.value as any })}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none"
              >
                <option value="low" className="bg-gray-800">Düşük</option>
                <option value="medium" className="bg-gray-800">Orta</option>
                <option value="high" className="bg-gray-800">Yüksek</option>
                <option value="critical" className="bg-gray-800">Kritik</option>
              </select>
            </div>
            <div>
              <label className="block text-white text-sm font-medium mb-2">Trafik Önceliği</label>
              <select
                value={formData.traffic_priority}
                onChange={(e) => setFormData({ ...formData, traffic_priority: e.target.value as any })}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none"
              >
                <option value="low" className="bg-gray-800">Düşük</option>
                <option value="normal" className="bg-gray-800">Normal</option>
                <option value="high" className="bg-gray-800">Yüksek</option>
                <option value="critical" className="bg-gray-800">Kritik</option>
              </select>
            </div>
          </div>

          {/* Access Control */}
          <div className="space-y-4">
            <h4 className="text-white font-medium">Erişim Kontrolü</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setFormData({ ...formData, isolation_enabled: !formData.isolation_enabled })}
                  className={cn(
                    "relative w-10 h-5 rounded-full transition-all duration-300",
                    formData.isolation_enabled 
                      ? "bg-orange-500 shadow-lg shadow-orange-500/30" 
                      : "bg-white/20"
                  )}
                >
                  <div
                    className={cn(
                      "absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all duration-300 shadow-lg",
                      formData.isolation_enabled ? "left-5" : "left-0.5"
                    )}
                  />
                </button>
                <span className="text-white text-sm">VLAN İzolasyonu</span>
              </div>
              
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setFormData({ ...formData, inter_vlan_routing: !formData.inter_vlan_routing })}
                  className={cn(
                    "relative w-10 h-5 rounded-full transition-all duration-300",
                    formData.inter_vlan_routing 
                      ? "bg-emerald-500 shadow-lg shadow-emerald-500/30" 
                      : "bg-white/20"
                  )}
                >
                  <div
                    className={cn(
                      "absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all duration-300 shadow-lg",
                      formData.inter_vlan_routing ? "left-5" : "left-0.5"
                    )}
                  />
                </button>
                <span className="text-white text-sm">VLAN Arası Geçiş</span>
              </div>
              
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setFormData({ ...formData, internet_access: !formData.internet_access })}
                  className={cn(
                    "relative w-10 h-5 rounded-full transition-all duration-300",
                    formData.internet_access 
                      ? "bg-blue-500 shadow-lg shadow-blue-500/30" 
                      : "bg-white/20"
                  )}
                >
                  <div
                    className={cn(
                      "absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all duration-300 shadow-lg",
                      formData.internet_access ? "left-5" : "left-0.5"
                    )}
                  />
                </button>
                <span className="text-white text-sm">Internet Erişimi</span>
              </div>
            </div>
          </div>

          {/* Advanced Settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-white text-sm font-medium mb-2">Bant Genişliği Limiti (Mbps)</label>
              <input
                type="number"
                value={formData.bandwidth_limit_mbps}
                onChange={(e) => setFormData({ ...formData, bandwidth_limit_mbps: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                placeholder="0 = Sınırsız"
                min="0"
              />
            </div>
            <div>
              <label className="block text-white text-sm font-medium mb-2">Maksimum Cihaz</label>
              <input
                type="number"
                value={formData.max_devices}
                onChange={(e) => setFormData({ ...formData, max_devices: parseInt(e.target.value) })}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                min="1"
                max="253"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-4">
            <Button
              onClick={handleCreateVLAN}
              disabled={createVLANMutation.isPending}
              isLoading={createVLANMutation.isPending}
              className="flex-1"
            >
              {editingVLAN ? 'Güncelle' : 'Oluştur'}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setShowCreateModal(false);
                setEditingVLAN(null);
                resetForm();
              }}
              className="flex-1"
            >
              İptal
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};