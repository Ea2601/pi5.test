import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { cn } from '../../lib/utils';
import { 
  useDHCPPools, 
  useCreateDHCPPool, 
  useUpdateDHCPPool, 
  useDeleteDHCPPool,
  useGetNextAvailableIP 
} from '../../hooks/api/useDHCP';
import { DHCPPool } from '../../types/dhcp';

interface PoolFormData {
  name: string;
  description: string;
  vlan_id: number;
  network_cidr: string;
  start_ip: string;
  end_ip: string;
  gateway_ip: string;
  subnet_mask: string;
  dns_servers: string;
  lease_time: string;
  max_lease_time: string;
  allow_unknown_clients: boolean;
  require_authorization: boolean;
}

const vlanPresets = [
  { vlan: 10, name: 'Admin', network: '192.168.10.0/24', gateway: '192.168.10.1' },
  { vlan: 20, name: 'Trusted', network: '192.168.20.0/24', gateway: '192.168.20.1' },
  { vlan: 30, name: 'IoT', network: '192.168.30.0/24', gateway: '192.168.30.1' },
  { vlan: 40, name: 'Guest', network: '192.168.40.0/24', gateway: '192.168.40.1' },
  { vlan: 50, name: 'Gaming', network: '192.168.50.0/24', gateway: '192.168.50.1' },
  { vlan: 60, name: 'VoIP', network: '192.168.60.0/24', gateway: '192.168.60.1' },
  { vlan: 70, name: 'Security', network: '192.168.70.0/24', gateway: '192.168.70.1' },
  { vlan: 80, name: 'Kids', network: '192.168.80.0/24', gateway: '192.168.80.1' },
  { vlan: 90, name: 'Media', network: '192.168.90.0/24', gateway: '192.168.90.1' },
  { vlan: 100, name: 'Lab', network: '192.168.100.0/24', gateway: '192.168.100.1' }
];

export const DHCPPoolManagement: React.FC = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingPool, setEditingPool] = useState<DHCPPool | null>(null);
  const [showPresetModal, setShowPresetModal] = useState(false);
  
  const { data: pools = [], isLoading } = useDHCPPools();
  const createPoolMutation = useCreateDHCPPool();
  const updatePoolMutation = useUpdateDHCPPool();
  const deletePoolMutation = useDeleteDHCPPool();

  const [formData, setFormData] = useState<PoolFormData>({
    name: '',
    description: '',
    vlan_id: 10,
    network_cidr: '192.168.10.0/24',
    start_ip: '192.168.10.100',
    end_ip: '192.168.10.199',
    gateway_ip: '192.168.10.1',
    subnet_mask: '255.255.255.0',
    dns_servers: '1.1.1.1, 8.8.8.8',
    lease_time: '24 hours',
    max_lease_time: '7 days',
    allow_unknown_clients: true,
    require_authorization: false
  });

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      vlan_id: 10,
      network_cidr: '192.168.10.0/24',
      start_ip: '192.168.10.100',
      end_ip: '192.168.10.199',
      gateway_ip: '192.168.10.1',
      subnet_mask: '255.255.255.0',
      dns_servers: '1.1.1.1, 8.8.8.8',
      lease_time: '24 hours',
      max_lease_time: '7 days',
      allow_unknown_clients: true,
      require_authorization: false
    });
  };

  const handleCreatePool = async () => {
    try {
      await createPoolMutation.mutateAsync({
        ...formData,
        dns_servers: formData.dns_servers.split(',').map(dns => dns.trim())
      });
      setShowCreateModal(false);
      resetForm();
    } catch (error) {
      console.error('Create DHCP pool error:', error);
    }
  };

  const handlePresetSelect = (preset: typeof vlanPresets[0]) => {
    const [network, cidr] = preset.network.split('/');
    const networkParts = network.split('.');
    
    setFormData({
      ...formData,
      name: `${preset.name} Network`,
      vlan_id: preset.vlan,
      network_cidr: preset.network,
      start_ip: `${networkParts[0]}.${networkParts[1]}.${networkParts[2]}.100`,
      end_ip: `${networkParts[0]}.${networkParts[1]}.${networkParts[2]}.199`,
      gateway_ip: preset.gateway,
      subnet_mask: '255.255.255.0'
    });
    setShowPresetModal(false);
  };

  const calculatePoolSize = (startIP: string, endIP: string): number => {
    const start = startIP.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet), 0) >>> 0;
    const end = endIP.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet), 0) >>> 0;
    return end - start + 1;
  };

  const PoolCard: React.FC<{ pool: DHCPPool }> = ({ pool }) => {
    const poolSize = calculatePoolSize(pool.start_ip, pool.end_ip);
    
    return (
      <Card className="h-full">
        <div className="space-y-4">
          {/* Pool Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center",
                pool.is_active 
                  ? "bg-emerald-500/20 border border-emerald-500/30" 
                  : "bg-gray-500/20 border border-gray-500/30"
              )}>
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" 
                       width="24" height="24" viewBox="0 0 24 24" 
                       fill="none" stroke="currentColor" strokeWidth="2" 
                       strokeLinecap="round" strokeLinejoin="round" 
                       className={cn("w-5 h-5", pool.is_active ? "text-emerald-400" : "text-gray-400")}>
                    <rect x="16" y="16" width="6" height="6" rx="1"/>
                    <rect x="2" y="16" width="6" height="6" rx="1"/>
                    <rect x="9" y="2" width="6" height="6" rx="1"/>
                    <path d="M5 16v-3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3"/>
                    <path d="M12 12V8"/>
                  </svg>
                </div>
              </div>
              <div>
                <h4 className="text-white font-semibold">{pool.name}</h4>
                <p className="text-white/60 text-sm">VLAN {pool.vlan_id} • {pool.network_cidr}</p>
              </div>
            </div>
            <div className={cn(
              "w-3 h-3 rounded-full",
              pool.is_active ? "bg-emerald-400 shadow-lg shadow-emerald-400/50" : "bg-gray-400"
            )} />
          </div>

          {/* Pool Info */}
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-white/60">IP Aralığı:</span>
              <span className="text-white font-mono">{pool.start_ip} - {pool.end_ip}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/60">Gateway:</span>
              <span className="text-white font-mono">{pool.gateway_ip}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/60">Pool Boyutu:</span>
              <span className="text-white">{poolSize} IP</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/60">Lease Süresi:</span>
              <span className="text-white">{pool.lease_time}</span>
            </div>
          </div>

          {/* DNS Servers */}
          <div className="space-y-1">
            <span className="text-white/60 text-sm">DNS Sunucuları:</span>
            <div className="flex flex-wrap gap-1">
              {pool.dns_servers.map((dns, index) => (
                <span key={index} className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs font-mono">
                  {dns}
                </span>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 pt-3 border-t border-white/10">
            <Button
              size="sm"
              variant={pool.is_active ? "destructive" : "default"}
              onClick={() => updatePoolMutation.mutate({ id: pool.id, updates: { is_active: !pool.is_active } })}
              className="flex-1"
            >
              <div className="flex items-center">
                {pool.is_active ? (
                  <svg xmlns="http://www.w3.org/2000/svg" 
                       width="24" height="24" viewBox="0 0 24 24" 
                       fill="none" stroke="currentColor" strokeWidth="2" 
                       strokeLinecap="round" strokeLinejoin="round" 
                       className="w-3 h-3 mr-1">
                    <rect x="6" y="4" width="4" height="16"/>
                    <rect x="14" y="4" width="4" height="16"/>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" 
                       width="24" height="24" viewBox="0 0 24 24" 
                       fill="none" stroke="currentColor" strokeWidth="2" 
                       strokeLinecap="round" strokeLinejoin="round" 
                       className="w-3 h-3 mr-1">
                    <polygon points="6,3 20,12 6,21"/>
                  </svg>
                )}
                <span className="truncate">{pool.is_active ? 'Durdur' : 'Başlat'}</span>
              </div>
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setEditingPool(pool);
                setFormData({
                  name: pool.name,
                  description: pool.description || '',
                  vlan_id: pool.vlan_id,
                  network_cidr: pool.network_cidr,
                  start_ip: pool.start_ip,
                  end_ip: pool.end_ip,
                  gateway_ip: pool.gateway_ip,
                  subnet_mask: pool.subnet_mask,
                  dns_servers: pool.dns_servers.join(', '),
                  lease_time: pool.lease_time,
                  max_lease_time: pool.max_lease_time,
                  allow_unknown_clients: pool.allow_unknown_clients,
                  require_authorization: pool.require_authorization
                });
              }}
            >
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" 
                     width="24" height="24" viewBox="0 0 24 24" 
                     fill="none" stroke="currentColor" strokeWidth="2" 
                     strokeLinecap="round" strokeLinejoin="round" 
                     className="w-3 h-3">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4Z"/>
                </svg>
              </div>
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => {
                if (confirm('Bu DHCP pool\'unu silmek istediğinizden emin misiniz?')) {
                  deletePoolMutation.mutate(pool.id);
                }
              }}
            >
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" 
                     width="24" height="24" viewBox="0 0 24 24" 
                     fill="none" stroke="currentColor" strokeWidth="2" 
                     strokeLinecap="round" strokeLinejoin="round" 
                     className="w-3 h-3">
                  <path d="M3 6h18"/>
                  <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
                  <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                  <line x1="10" x2="10" y1="11" y2="17"/>
                  <line x1="14" x2="14" y1="11" y2="17"/>
                </svg>
              </div>
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
          <h3 className="text-xl font-bold text-white">DHCP IP Havuzları</h3>
          <p className="text-white/70 text-sm">VLAN bazlı IP dağıtım aralıkları</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setShowPresetModal(true)}>
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" 
                   width="24" height="24" viewBox="0 0 24 24" 
                   fill="none" stroke="currentColor" strokeWidth="2" 
                   strokeLinecap="round" strokeLinejoin="round" 
                   className="w-4 h-4 mr-2">
                <path d="M5 12h14"/>
                <path d="M12 5v14"/>
              </svg>
              <span className="truncate">VLAN Presets</span>
            </div>
          </Button>
          <Button onClick={() => setShowCreateModal(true)}>
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" 
                   width="24" height="24" viewBox="0 0 24 24" 
                   fill="none" stroke="currentColor" strokeWidth="2" 
                   strokeLinecap="round" strokeLinejoin="round" 
                   className="w-4 h-4 mr-2">
                <rect x="16" y="16" width="6" height="6" rx="1"/>
                <rect x="2" y="16" width="6" height="6" rx="1"/>
                <rect x="9" y="2" width="6" height="6" rx="1"/>
                <path d="M5 16v-3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3"/>
                <path d="M12 12V8"/>
              </svg>
              <span className="truncate">Özel Pool</span>
            </div>
          </Button>
        </div>
      </div>

      {/* DHCP Pools Grid */}
      {pools.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-emerald-500/20 rounded-xl flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" 
                   width="24" height="24" viewBox="0 0 24 24" 
                   fill="none" stroke="currentColor" strokeWidth="2" 
                   strokeLinecap="round" strokeLinejoin="round" 
                   className="w-8 h-8 text-emerald-400">
                <rect x="16" y="16" width="6" height="6" rx="1"/>
                <rect x="2" y="16" width="6" height="6" rx="1"/>
                <rect x="9" y="2" width="6" height="6" rx="1"/>
                <path d="M5 16v-3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3"/>
                <path d="M12 12V8"/>
              </svg>
            </div>
            <h3 className="text-white font-semibold mb-2">Henüz DHCP pool bulunmuyor</h3>
            <p className="text-white/60 mb-4">İlk IP havuzunuzu oluşturun</p>
            <div className="flex items-center gap-2 justify-center">
              <Button onClick={() => setShowPresetModal(true)}>
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" 
                       width="24" height="24" viewBox="0 0 24 24" 
                       fill="none" stroke="currentColor" strokeWidth="2" 
                       strokeLinecap="round" strokeLinejoin="round" 
                       className="w-4 h-4 mr-2">
                    <path d="M5 12h14"/>
                    <path d="M12 5v14"/>
                  </svg>
                  <span className="truncate">VLAN Preset</span>
                </div>
              </Button>
              <Button variant="outline" onClick={() => setShowCreateModal(true)}>
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" 
                       width="24" height="24" viewBox="0 0 24 24" 
                       fill="none" stroke="currentColor" strokeWidth="2" 
                       strokeLinecap="round" strokeLinejoin="round" 
                       className="w-4 h-4 mr-2">
                    <rect x="16" y="16" width="6" height="6" rx="1"/>
                    <rect x="2" y="16" width="6" height="6" rx="1"/>
                    <rect x="9" y="2" width="6" height="6" rx="1"/>
                    <path d="M5 16v-3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3"/>
                    <path d="M12 12V8"/>
                  </svg>
                  <span className="truncate">Özel Pool</span>
                </div>
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pools.map((pool) => (
            <PoolCard key={pool.id} pool={pool} />
          ))}
        </div>
      )}

      {/* VLAN Preset Modal */}
      <Modal
        isOpen={showPresetModal}
        onClose={() => setShowPresetModal(false)}
        title="VLAN Preset'leri"
        size="lg"
      >
        <div className="space-y-4">
          <p className="text-white/70 text-sm">Önceden tanımlanmış VLAN yapılandırmalarını seçin</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {vlanPresets.map((preset) => (
              <button
                key={preset.vlan}
                onClick={() => handlePresetSelect(preset)}
                className="p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:border-white/20 transition-all text-left"
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-white font-medium">VLAN {preset.vlan} - {preset.name}</h4>
                  <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-xs">
                    {preset.network}
                  </span>
                </div>
                <p className="text-white/60 text-sm">Gateway: {preset.gateway}</p>
              </button>
            ))}
          </div>
        </div>
      </Modal>

      {/* Create/Edit Pool Modal */}
      <Modal
        isOpen={showCreateModal || !!editingPool}
        onClose={() => {
          setShowCreateModal(false);
          setEditingPool(null);
          resetForm();
        }}
        title={editingPool ? 'DHCP Pool Düzenle' : 'Yeni DHCP Pool'}
        size="lg"
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-white text-sm font-medium mb-2">Pool Adı</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                placeholder="Admin Network"
              />
            </div>
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
          </div>

          <div>
            <label className="block text-white text-sm font-medium mb-2">Açıklama</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              rows={2}
              placeholder="Pool açıklaması"
            />
          </div>

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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-white text-sm font-medium mb-2">Başlangıç IP</label>
              <input
                type="text"
                value={formData.start_ip}
                onChange={(e) => setFormData({ ...formData, start_ip: e.target.value })}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                placeholder="192.168.10.100"
              />
            </div>
            <div>
              <label className="block text-white text-sm font-medium mb-2">Bitiş IP</label>
              <input
                type="text"
                value={formData.end_ip}
                onChange={(e) => setFormData({ ...formData, end_ip: e.target.value })}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                placeholder="192.168.10.199"
              />
            </div>
          </div>

          <div>
            <label className="block text-white text-sm font-medium mb-2">DNS Sunucuları</label>
            <input
              type="text"
              value={formData.dns_servers}
              onChange={(e) => setFormData({ ...formData, dns_servers: e.target.value })}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              placeholder="1.1.1.1, 8.8.8.8"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-white text-sm font-medium mb-2">Lease Süresi</label>
              <select
                value={formData.lease_time}
                onChange={(e) => setFormData({ ...formData, lease_time: e.target.value })}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none"
              >
                <option value="2 hours" className="bg-gray-800">2 saat</option>
                <option value="4 hours" className="bg-gray-800">4 saat</option>
                <option value="8 hours" className="bg-gray-800">8 saat</option>
                <option value="12 hours" className="bg-gray-800">12 saat</option>
                <option value="24 hours" className="bg-gray-800">24 saat</option>
                <option value="48 hours" className="bg-gray-800">48 saat</option>
                <option value="7 days" className="bg-gray-800">7 gün</option>
              </select>
            </div>
            <div>
              <label className="block text-white text-sm font-medium mb-2">Maksimum Lease</label>
              <select
                value={formData.max_lease_time}
                onChange={(e) => setFormData({ ...formData, max_lease_time: e.target.value })}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none"
              >
                <option value="24 hours" className="bg-gray-800">24 saat</option>
                <option value="48 hours" className="bg-gray-800">48 saat</option>
                <option value="7 days" className="bg-gray-800">7 gün</option>
                <option value="30 days" className="bg-gray-800">30 gün</option>
              </select>
            </div>
          </div>

          {/* Security Options */}
          <div className="space-y-3">
            <h4 className="text-white font-medium">Güvenlik Ayarları</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setFormData({ ...formData, allow_unknown_clients: !formData.allow_unknown_clients })}
                  className={cn(
                    "relative w-10 h-5 rounded-full transition-all duration-300",
                    formData.allow_unknown_clients 
                      ? "bg-emerald-500 shadow-lg shadow-emerald-500/30" 
                      : "bg-white/20"
                  )}
                >
                  <div
                    className={cn(
                      "absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all duration-300 shadow-lg",
                      formData.allow_unknown_clients ? "left-5" : "left-0.5"
                    )}
                  />
                </button>
                <span className="text-white text-sm">Bilinmeyen cihazlara izin ver</span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setFormData({ ...formData, require_authorization: !formData.require_authorization })}
                  className={cn(
                    "relative w-10 h-5 rounded-full transition-all duration-300",
                    formData.require_authorization 
                      ? "bg-orange-500 shadow-lg shadow-orange-500/30" 
                      : "bg-white/20"
                  )}
                >
                  <div
                    className={cn(
                      "absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all duration-300 shadow-lg",
                      formData.require_authorization ? "left-5" : "left-0.5"
                    )}
                  />
                </button>
                <span className="text-white text-sm">Yetkilendirme gerekli</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-4">
            <Button
              onClick={handleCreatePool}
              disabled={createPoolMutation.isPending}
              isLoading={createPoolMutation.isPending}
              className="flex-1"
            >
              {editingPool ? 'Güncelle' : 'Oluştur'}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setShowCreateModal(false);
                setEditingPool(null);
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