import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import * as Icons from 'lucide-react';
import { cn } from '../../lib/utils';

interface DHCPPool {
  id: string;
  name: string;
  vlan_id: number;
  network_cidr: string;
  start_ip: string;
  end_ip: string;
  gateway_ip: string;
  is_active: boolean;
}

interface PoolFormData {
  name: string;
  vlan_id: number;
  network_cidr: string;
  start_ip: string;
  end_ip: string;
  gateway_ip: string;
}

export const DHCPPoolManagement: React.FC = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  // Mock data
  const [pools] = useState<DHCPPool[]>([
    {
      id: 'pool-1',
      name: 'Admin Network',
      vlan_id: 10,
      network_cidr: '192.168.10.0/24',
      start_ip: '192.168.10.100',
      end_ip: '192.168.10.199',
      gateway_ip: '192.168.10.1',
      is_active: true
    },
    {
      id: 'pool-2',
      name: 'IoT Network',
      vlan_id: 30,
      network_cidr: '192.168.30.0/24',
      start_ip: '192.168.30.100',
      end_ip: '192.168.30.199',
      gateway_ip: '192.168.30.1',
      is_active: true
    }
  ]);

  const [formData, setFormData] = useState<PoolFormData>({
    name: '',
    vlan_id: 20,
    network_cidr: '192.168.20.0/24',
    start_ip: '192.168.20.100',
    end_ip: '192.168.20.199',
    gateway_ip: '192.168.20.1'
  });

  const resetForm = () => {
    setFormData({
      name: '',
      vlan_id: 20,
      network_cidr: '192.168.20.0/24',
      start_ip: '192.168.20.100',
      end_ip: '192.168.20.199',
      gateway_ip: '192.168.20.1'
    });
  };

  const handleCreatePool = async () => {
    try {
      console.log('Creating DHCP pool:', formData);
      setShowCreateModal(false);
      resetForm();
    } catch (error) {
      console.error('Create DHCP pool error:', error);
    }
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
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center",
                pool.is_active 
                  ? "bg-emerald-500/20 border border-emerald-500/30" 
                  : "bg-gray-500/20 border border-gray-500/30"
              )}>
                <Icons.Network className={cn(
                  "w-5 h-5",
                  pool.is_active ? "text-emerald-400" : "text-gray-400"
                )} />
              </div>
              <div>
                <h4 className="text-white font-semibold">{pool.name}</h4>
                <p className="text-white/60 text-sm">VLAN {pool.vlan_id}</p>
              </div>
            </div>
            <div className={cn(
              "w-3 h-3 rounded-full",
              pool.is_active ? "bg-emerald-400" : "bg-gray-400"
            )} />
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-white/60">Ağ:</span>
              <span className="text-white font-mono">{pool.network_cidr}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/60">IP Aralığı:</span>
              <span className="text-white font-mono text-xs">{pool.start_ip} - {pool.end_ip}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/60">Gateway:</span>
              <span className="text-white font-mono">{pool.gateway_ip}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/60">Pool Boyutu:</span>
              <span className="text-white">{poolSize} IP</span>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-3 border-t border-white/10">
            <Button size="sm" variant="outline" className="flex-1">
              <Icons.Edit className="w-3 h-3 mr-1" />
              Düzenle
            </Button>
            <Button size="sm" variant={pool.is_active ? "destructive" : "default"}>
              {pool.is_active ? <Icons.Pause className="w-3 h-3" /> : <Icons.Play className="w-3 h-3" />}
            </Button>
          </div>
        </div>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-white">DHCP Pools</h3>
          <p className="text-white/70 text-sm">IP aralığı yönetimi</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Icons.Plus className="w-4 h-4 mr-2" />
          DHCP Pool
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {pools.map((pool) => (
          <PoolCard key={pool.id} pool={pool} />
        ))}
      </div>

      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          resetForm();
        }}
        title="Yeni DHCP Pool"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-white text-sm font-medium mb-2">Pool Adı</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                placeholder="Guest Network"
              />
            </div>
            <div>
              <label className="block text-white text-sm font-medium mb-2">VLAN ID</label>
              <input
                type="number"
                value={formData.vlan_id}
                onChange={(e) => setFormData({ ...formData, vlan_id: parseInt(e.target.value) })}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none"
                min="1"
                max="4094"
              />
            </div>
          </div>

          <div>
            <label className="block text-white text-sm font-medium mb-2">Ağ CIDR</label>
            <input
              type="text"
              value={formData.network_cidr}
              onChange={(e) => setFormData({ ...formData, network_cidr: e.target.value })}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              placeholder="192.168.20.0/24"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-white text-sm font-medium mb-2">Başlangıç IP</label>
              <input
                type="text"
                value={formData.start_ip}
                onChange={(e) => setFormData({ ...formData, start_ip: e.target.value })}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none"
                placeholder="192.168.20.100"
              />
            </div>
            <div>
              <label className="block text-white text-sm font-medium mb-2">Bitiş IP</label>
              <input
                type="text"
                value={formData.end_ip}
                onChange={(e) => setFormData({ ...formData, end_ip: e.target.value })}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none"
                placeholder="192.168.20.199"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-4">
            <Button onClick={handleCreatePool} className="flex-1">
              Oluştur
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setShowCreateModal(false);
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