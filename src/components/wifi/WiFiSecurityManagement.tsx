import React, { useState } from 'react';
import { motion } from 'framer-motion';
import * as Icons from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { TableCard } from '../cards/TableCard';
import { cn } from '../../lib/utils';
import { 
  useWiFiSecurityPolicies, 
  useCreateWiFiSecurityPolicy, 
  useUpdateWiFiSecurityPolicy,
  useWiFiNetworks,
  useScanRogueAPs
} from '../../hooks/api/useWiFi';
import { WiFiSecurityPolicy } from '../../types/wifi';

interface SecurityPolicyFormData {
  policy_name: string;
  description: string;
  policy_type: 'mac_filter' | 'time_restriction' | 'device_limit' | 'bandwidth_limit';
  apply_to_networks: string[];
  apply_to_vlans: number[];
  whitelist_macs: string;
  blacklist_macs: string;
  bandwidth_limit_mbps: number;
  connection_time_limit: number;
  daily_data_limit_mb: number;
  time_restrictions: any;
  parental_controls: any;
}

export const WiFiSecurityManagement: React.FC = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState<WiFiSecurityPolicy | null>(null);
  const [showRogueAPModal, setShowRogueAPModal] = useState(false);
  const [rogueAPs, setRogueAPs] = useState<any[]>([]);
  
  const { data: policies = [], isLoading } = useWiFiSecurityPolicies();
  const { data: networks = [] } = useWiFiNetworks();
  const createPolicyMutation = useCreateWiFiSecurityPolicy();
  const updatePolicyMutation = useUpdateWiFiSecurityPolicy();
  const scanRogueAPsMutation = useScanRogueAPs();

  const [formData, setFormData] = useState<SecurityPolicyFormData>({
    policy_name: '',
    description: '',
    policy_type: 'mac_filter',
    apply_to_networks: [],
    apply_to_vlans: [],
    whitelist_macs: '',
    blacklist_macs: '',
    bandwidth_limit_mbps: 0,
    connection_time_limit: 0,
    daily_data_limit_mb: 0,
    time_restrictions: {},
    parental_controls: {}
  });

  const resetForm = () => {
    setFormData({
      policy_name: '',
      description: '',
      policy_type: 'mac_filter',
      apply_to_networks: [],
      apply_to_vlans: [],
      whitelist_macs: '',
      blacklist_macs: '',
      bandwidth_limit_mbps: 0,
      connection_time_limit: 0,
      daily_data_limit_mb: 0,
      time_restrictions: {},
      parental_controls: {}
    });
  };

  const handleCreatePolicy = async () => {
    try {
      const policyData = {
        ...formData,
        whitelist_macs: formData.whitelist_macs.split(',').map(mac => mac.trim()).filter(Boolean),
        blacklist_macs: formData.blacklist_macs.split(',').map(mac => mac.trim()).filter(Boolean),
        conditions: {
          whitelist_macs: formData.whitelist_macs.split(',').map(mac => mac.trim()).filter(Boolean),
          blacklist_macs: formData.blacklist_macs.split(',').map(mac => mac.trim()).filter(Boolean),
          bandwidth_limit_mbps: formData.bandwidth_limit_mbps > 0 ? formData.bandwidth_limit_mbps : undefined,
          time_restrictions: formData.time_restrictions
        },
        actions: {
          type: formData.policy_type,
          parameters: {
            bandwidth_limit: formData.bandwidth_limit_mbps,
            time_limit: formData.connection_time_limit,
            data_limit: formData.daily_data_limit_mb
          }
        }
      };

      await createPolicyMutation.mutateAsync(policyData);
      setShowCreateModal(false);
      resetForm();
    } catch (error) {
      console.error('Create security policy error:', error);
    }
  };

  const handleScanRogueAPs = async () => {
    try {
      const result = await scanRogueAPsMutation.mutateAsync();
      setRogueAPs(result);
      setShowRogueAPModal(true);
    } catch (error) {
      console.error('Scan rogue APs error:', error);
    }
  };

  const getPolicyTypeIcon = (type: string) => {
    switch (type) {
      case 'mac_filter': return Icons.Shield;
      case 'time_restriction': return Icons.Clock;
      case 'device_limit': return Icons.Users;
      case 'bandwidth_limit': return Icons.Gauge;
      default: return Icons.Lock;
    }
  };

  const getPolicyTypeLabel = (type: string) => {
    switch (type) {
      case 'mac_filter': return 'MAC Filtresi';
      case 'time_restriction': return 'Zaman Kısıtlaması';
      case 'device_limit': return 'Cihaz Limiti';
      case 'bandwidth_limit': return 'Bant Genişliği Limiti';
      default: return type;
    }
  };

  const getPolicyTypeColor = (type: string) => {
    switch (type) {
      case 'mac_filter': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'time_restriction': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'device_limit': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'bandwidth_limit': return 'bg-green-500/20 text-green-400 border-green-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const SecurityPolicyCard: React.FC<{ policy: WiFiSecurityPolicy }> = ({ policy }) => {
    const PolicyIcon = getPolicyTypeIcon(policy.policy_type);
    
    return (
      <Card className="h-full">
        <div className="space-y-4">
          {/* Policy Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center border",
                getPolicyTypeColor(policy.policy_type)
              )}>
                <PolicyIcon className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-white font-semibold">{policy.policy_name}</h4>
                <p className="text-white/60 text-sm">{getPolicyTypeLabel(policy.policy_type)}</p>
              </div>
            </div>
            <div className={cn(
              "w-3 h-3 rounded-full",
              policy.is_active ? "bg-emerald-400" : "bg-gray-400"
            )} />
          </div>

          {/* Policy Details */}
          <div className="space-y-2 text-sm">
            {policy.apply_to_networks.length > 0 && (
              <div>
                <span className="text-white/60">Uygulandığı SSID'ler:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {policy.apply_to_networks.map((networkId, index) => {
                    const network = networks.find(n => n.id === networkId);
                    return (
                      <span key={index} className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs">
                        {network?.ssid || networkId}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}
            
            {policy.apply_to_vlans.length > 0 && (
              <div>
                <span className="text-white/60">Uygulandığı VLAN'lar:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {policy.apply_to_vlans.map((vlan) => (
                    <span key={vlan} className="px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded text-xs">
                      VLAN {vlan}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {policy.whitelist_macs.length > 0 && (
              <div className="flex justify-between">
                <span className="text-white/60">İzin Verilen MAC:</span>
                <span className="text-emerald-400">{policy.whitelist_macs.length} cihaz</span>
              </div>
            )}

            {policy.blacklist_macs.length > 0 && (
              <div className="flex justify-between">
                <span className="text-white/60">Engellenen MAC:</span>
                <span className="text-red-400">{policy.blacklist_macs.length} cihaz</span>
              </div>
            )}

            {policy.bandwidth_limit_mbps && (
              <div className="flex justify-between">
                <span className="text-white/60">Bant Limiti:</span>
                <span className="text-white">{policy.bandwidth_limit_mbps} Mbps</span>
              </div>
            )}
          </div>

          {/* Violation Stats */}
          {policy.violation_count > 0 && (
            <div className="p-2 bg-red-500/10 border border-red-500/20 rounded">
              <div className="flex justify-between text-sm">
                <span className="text-red-400">İhlal Sayısı:</span>
                <span className="text-white">{policy.violation_count}</span>
              </div>
              {policy.last_violation && (
                <p className="text-red-400/70 text-xs mt-1">
                  Son: {new Date(policy.last_violation).toLocaleString('tr-TR')}
                </p>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2 pt-3 border-t border-white/10">
            <Button
              size="sm"
              variant={policy.is_active ? "destructive" : "default"}
              onClick={() => updatePolicyMutation.mutate({ 
                id: policy.id, 
                updates: { is_active: !policy.is_active } 
              })}
              className="flex-1"
            >
              {policy.is_active ? (
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
                setEditingPolicy(policy);
                setFormData({
                  policy_name: policy.policy_name,
                  description: policy.description || '',
                  policy_type: policy.policy_type,
                  apply_to_networks: policy.apply_to_networks,
                  apply_to_vlans: policy.apply_to_vlans,
                  whitelist_macs: policy.whitelist_macs.join(', '),
                  blacklist_macs: policy.blacklist_macs.join(', '),
                  bandwidth_limit_mbps: policy.bandwidth_limit_mbps || 0,
                  connection_time_limit: policy.connection_time_limit || 0,
                  daily_data_limit_mb: policy.daily_data_limit_mb || 0,
                  time_restrictions: policy.time_restrictions,
                  parental_controls: policy.parental_controls
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

  const rogueAPColumns = [
    { key: 'ssid', label: 'SSID' },
    { key: 'mac', label: 'MAC Address', render: (value: string) => <span className="font-mono text-sm">{value}</span> },
    { key: 'security', label: 'Güvenlik' },
    { 
      key: 'signal', 
      label: 'Sinyal', 
      render: (value: number) => <span className={getSignalColor(value)}>{value} dBm</span>
    },
    { key: 'channel', label: 'Kanal' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-white">Wi-Fi Güvenlik Yönetimi</h3>
          <p className="text-white/70 text-sm">Erişim kontrolü, MAC filtreleme ve güvenlik politikaları</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleScanRogueAPs}>
            <Icons.Search className="w-4 h-4 mr-2" />
            Yabancı AP Tara
          </Button>
          <Button onClick={() => setShowCreateModal(true)}>
            <Icons.Plus className="w-4 h-4 mr-2" />
            Güvenlik Politikası
          </Button>
        </div>
      </div>

      {/* Security Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Icons.Shield className="w-5 h-5 text-emerald-400" />
            <div>
              <p className="text-white font-medium">{policies.filter(p => p.is_active).length}</p>
              <p className="text-white/60 text-xs">Aktif Politika</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Icons.Ban className="w-5 h-5 text-red-400" />
            <div>
              <p className="text-white font-medium">
                {policies.reduce((acc, p) => acc + p.blacklist_macs.length, 0)}
              </p>
              <p className="text-white/60 text-xs">Engellenen MAC</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Icons.Check className="w-5 h-5 text-emerald-400" />
            <div>
              <p className="text-white font-medium">
                {policies.reduce((acc, p) => acc + p.whitelist_macs.length, 0)}
              </p>
              <p className="text-white/60 text-xs">İzin Verilen MAC</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Icons.AlertTriangle className="w-5 h-5 text-orange-400" />
            <div>
              <p className="text-white font-medium">
                {policies.reduce((acc, p) => acc + p.violation_count, 0)}
              </p>
              <p className="text-white/60 text-xs">Güvenlik İhlali</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Security Policies Grid */}
      {policies.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <Icons.Lock className="w-16 h-16 text-white/30 mx-auto mb-4" />
            <h3 className="text-white font-semibold mb-2">Henüz güvenlik politikası bulunmuyor</h3>
            <p className="text-white/60 mb-4">İlk Wi-Fi güvenlik politikanızı oluşturun</p>
            <Button onClick={() => setShowCreateModal(true)}>
              <Icons.Plus className="w-4 h-4 mr-2" />
              Güvenlik Politikası Ekle
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {policies.map((policy) => (
            <SecurityPolicyCard key={policy.id} policy={policy} />
          ))}
        </div>
      )}

      {/* Preset Security Templates */}
      <Card title="Önceden Tanımlanmış Güvenlik Şablonları">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            {
              name: 'Misafir Ağı Güvenliği',
              description: 'Zaman sınırlı erişim, bant genişliği kontrolü',
              icon: Icons.Users,
              config: { policy_type: 'time_restriction', bandwidth_limit_mbps: 30 }
            },
            {
              name: 'Çocuk Cihazları',
              description: 'Ebeveyn kontrolü, zaman kısıtlaması',
              icon: Icons.Baby,
              config: { policy_type: 'time_restriction', parental_controls: true }
            },
            {
              name: 'IoT Güvenliği',
              description: 'MAC filtreleme, yerel ağ kısıtlaması',
              icon: Icons.Home,
              config: { policy_type: 'mac_filter', local_access: false }
            },
            {
              name: 'Yönetim Ağı',
              description: 'Sadece yetkili cihazlar, tam erişim',
              icon: Icons.Shield,
              config: { policy_type: 'mac_filter', whitelist_only: true }
            }
          ].map((template) => (
            <button
              key={template.name}
              onClick={() => {
                setFormData({
                  ...formData,
                  policy_name: template.name,
                  description: template.description,
                  policy_type: template.config.policy_type as any,
                  bandwidth_limit_mbps: template.config.bandwidth_limit_mbps || 0
                });
                setShowCreateModal(true);
              }}
              className="p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:border-white/20 transition-all text-left"
            >
              <div className="flex items-center gap-3 mb-2">
                <template.icon className="w-5 h-5 text-emerald-400" />
                <span className="text-white font-medium">{template.name}</span>
              </div>
              <p className="text-white/70 text-sm">{template.description}</p>
            </button>
          ))}
        </div>
      </Card>

      {/* Create/Edit Security Policy Modal */}
      <Modal
        isOpen={showCreateModal || !!editingPolicy}
        onClose={() => {
          setShowCreateModal(false);
          setEditingPolicy(null);
          resetForm();
        }}
        title={editingPolicy ? 'Güvenlik Politikası Düzenle' : 'Yeni Güvenlik Politikası'}
        size="xl"
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-white text-sm font-medium mb-2">Politika Adı</label>
              <input
                type="text"
                value={formData.policy_name}
                onChange={(e) => setFormData({ ...formData, policy_name: e.target.value })}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                placeholder="Misafir Ağı Güvenliği"
              />
            </div>
            <div>
              <label className="block text-white text-sm font-medium mb-2">Politika Türü</label>
              <select
                value={formData.policy_type}
                onChange={(e) => setFormData({ ...formData, policy_type: e.target.value as any })}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none"
              >
                <option value="mac_filter" className="bg-gray-800">MAC Address Filtresi</option>
                <option value="time_restriction" className="bg-gray-800">Zaman Kısıtlaması</option>
                <option value="device_limit" className="bg-gray-800">Cihaz Limiti</option>
                <option value="bandwidth_limit" className="bg-gray-800">Bant Genişliği Limiti</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-white text-sm font-medium mb-2">Açıklama</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              rows={2}
              placeholder="Güvenlik politikası açıklaması"
            />
          </div>

          {/* Target Networks */}
          <div>
            <label className="block text-white text-sm font-medium mb-3">Uygulanacak Wi-Fi Ağları</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {networks.map((network) => (
                <div key={network.id} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id={`network-${network.id}`}
                    checked={formData.apply_to_networks.includes(network.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFormData({
                          ...formData,
                          apply_to_networks: [...formData.apply_to_networks, network.id]
                        });
                      } else {
                        setFormData({
                          ...formData,
                          apply_to_networks: formData.apply_to_networks.filter(id => id !== network.id)
                        });
                      }
                    }}
                    className="w-4 h-4 rounded border-white/20 bg-white/10"
                  />
                  <label htmlFor={`network-${network.id}`} className="text-white text-sm">
                    {network.ssid} (VLAN {network.vlan_id})
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* MAC Address Lists */}
          {formData.policy_type === 'mac_filter' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-white text-sm font-medium mb-2">İzin Verilen MAC'ler</label>
                <textarea
                  value={formData.whitelist_macs}
                  onChange={(e) => setFormData({ ...formData, whitelist_macs: e.target.value })}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none"
                  rows={4}
                  placeholder="00:1A:2B:3C:4D:5E, 00:1A:2B:3C:4D:5F"
                />
              </div>
              <div>
                <label className="block text-white text-sm font-medium mb-2">Engellenen MAC'ler</label>
                <textarea
                  value={formData.blacklist_macs}
                  onChange={(e) => setFormData({ ...formData, blacklist_macs: e.target.value })}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none"
                  rows={4}
                  placeholder="00:AA:BB:CC:DD:EE, 00:AA:BB:CC:DD:FF"
                />
              </div>
            </div>
          )}

          {/* Bandwidth and Time Limits */}
          {(formData.policy_type === 'bandwidth_limit' || formData.policy_type === 'time_restriction') && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-white text-sm font-medium mb-2">Bant Limiti (Mbps)</label>
                <input
                  type="number"
                  value={formData.bandwidth_limit_mbps}
                  onChange={(e) => setFormData({ ...formData, bandwidth_limit_mbps: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none"
                  placeholder="0 = Sınırsız"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-white text-sm font-medium mb-2">Bağlantı Süresi (dakika)</label>
                <input
                  type="number"
                  value={formData.connection_time_limit}
                  onChange={(e) => setFormData({ ...formData, connection_time_limit: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none"
                  placeholder="0 = Sınırsız"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-white text-sm font-medium mb-2">Günlük Veri Limiti (MB)</label>
                <input
                  type="number"
                  value={formData.daily_data_limit_mb}
                  onChange={(e) => setFormData({ ...formData, daily_data_limit_mb: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none"
                  placeholder="0 = Sınırsız"
                  min="0"
                />
              </div>
            </div>
          )}

          {/* Time Restrictions */}
          {formData.policy_type === 'time_restriction' && (
            <div>
              <label className="block text-white text-sm font-medium mb-3">Erişim Saatleri</label>
              <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                <p className="text-white/70 text-sm mb-3">Günlük erişim saatleri (gelişmiş zaman kontrolü yakında)</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white text-sm mb-2">Başlangıç Saati</label>
                    <input
                      type="time"
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none"
                      defaultValue="08:00"
                    />
                  </div>
                  <div>
                    <label className="block text-white text-sm mb-2">Bitiş Saati</label>
                    <input
                      type="time"
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none"
                      defaultValue="22:00"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3 pt-4">
            <Button
              onClick={handleCreatePolicy}
              disabled={createPolicyMutation.isPending}
              isLoading={createPolicyMutation.isPending}
              className="flex-1"
            >
              {editingPolicy ? 'Güncelle' : 'Oluştur'}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setShowCreateModal(false);
                setEditingPolicy(null);
                resetForm();
              }}
              className="flex-1"
            >
              İptal
            </Button>
          </div>
        </div>
      </Modal>

      {/* Rogue AP Scan Results Modal */}
      <Modal
        isOpen={showRogueAPModal}
        onClose={() => setShowRogueAPModal(false)}
        title="Yabancı Access Point Tarama Sonuçları"
      >
        <div className="space-y-4">
          <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Icons.AlertTriangle className="w-4 h-4 text-orange-400" />
              <span className="text-orange-400 font-medium">Güvenlik Uyarısı</span>
            </div>
            <p className="text-white/80 text-sm">
              Ağınızın yakınında {rogueAPs.length} yabancı access point tespit edildi. 
              Güvenlik açısından bu cihazları izlemek önemlidir.
            </p>
          </div>

          {rogueAPs.length > 0 ? (
            <TableCard
              title="Tespit Edilen Access Point'ler"
              columns={rogueAPColumns}
              data={rogueAPs}
            />
          ) : (
            <div className="text-center py-8">
              <Icons.CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
              <p className="text-white">Yabancı access point tespit edilmedi</p>
              <p className="text-white/60 text-sm">Ağınız güvenli görünüyor</p>
            </div>
          )}

          <Button 
            variant="outline" 
            onClick={() => setShowRogueAPModal(false)}
            className="w-full"
          >
            Kapat
          </Button>
        </div>
      </Modal>
    </div>
  );
};