import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import * as Icons from 'lucide-react';
import { cn } from '../../lib/utils';

interface WiFiNetwork {
  id: string;
  ssid: string;
  vlan_id: number;
  encryption_type: string;
  is_enabled: boolean;
  client_count: number;
  max_clients: number;
}

interface NetworkFormData {
  ssid: string;
  vlan_id: number;
  encryption_type: string;
  passphrase: string;
  max_clients: number;
}

export const WiFiNetworkManagement: React.FC = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  // Mock data
  const [networks] = useState<WiFiNetwork[]>([
    {
      id: 'wifi-1',
      ssid: 'Infinite-Home',
      vlan_id: 20,
      encryption_type: 'WPA3',
      is_enabled: true,
      client_count: 8,
      max_clients: 50
    },
    {
      id: 'wifi-2',
      ssid: 'Infinite-Guest',
      vlan_id: 40,
      encryption_type: 'WPA2',
      is_enabled: true,
      client_count: 3,
      max_clients: 20
    }
  ]);

  const [formData, setFormData] = useState<NetworkFormData>({
    ssid: '',
    vlan_id: 20,
    encryption_type: 'wpa3',
    passphrase: '',
    max_clients: 50
  });

  const resetForm = () => {
    setFormData({
      ssid: '',
      vlan_id: 20,
      encryption_type: 'wpa3',
      passphrase: '',
      max_clients: 50
    });
  };

  const handleCreateNetwork = async () => {
    try {
      console.log('Creating WiFi network:', formData);
      setShowCreateModal(false);
      resetForm();
    } catch (error) {
      console.error('Create WiFi network error:', error);
    }
  };

  const NetworkCard: React.FC<{ network: WiFiNetwork }> = ({ network }) => {
    const utilizationPercent = Math.round((network.client_count / network.max_clients) * 100);
    
    return (
      <Card className="h-full">
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center",
                network.is_enabled 
                  ? "bg-emerald-500/20 border border-emerald-500/30" 
                  : "bg-gray-500/20 border border-gray-500/30"
              )}>
                <Icons.Wifi className={cn(
                  "w-5 h-5",
                  network.is_enabled ? "text-emerald-400" : "text-gray-400"
                )} />
              </div>
              <div>
                <h4 className="text-white font-semibold">{network.ssid}</h4>
                <p className="text-white/60 text-sm">VLAN {network.vlan_id}</p>
              </div>
            </div>
            <div className={cn(
              "w-3 h-3 rounded-full",
              network.is_enabled ? "bg-emerald-400" : "bg-gray-400"
            )} />
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-white/60">Şifreleme:</span>
              <span className="text-white">{network.encryption_type}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/60">İstemci:</span>
              <span className="text-white">{network.client_count} / {network.max_clients}</span>
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-white/60">Kapasite:</span>
              <span className="text-white">{utilizationPercent}%</span>
            </div>
            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
              <div 
                className={cn(
                  "h-full rounded-full transition-all",
                  utilizationPercent > 80 ? "bg-red-400" :
                  utilizationPercent > 60 ? "bg-orange-400" : "bg-emerald-400"
                )}
                style={{ width: `${utilizationPercent}%` }}
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-3 border-t border-white/10">
            <Button size="sm" variant="outline" className="flex-1">
              <Icons.Edit className="w-3 h-3 mr-1" />
              Düzenle
            </Button>
            <Button size="sm" variant={network.is_enabled ? "destructive" : "default"}>
              {network.is_enabled ? <Icons.WifiOff className="w-3 h-3" /> : <Icons.Wifi className="w-3 h-3" />}
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
          <h3 className="text-xl font-bold text-white">WiFi Ağları</h3>
          <p className="text-white/70 text-sm">SSID yapılandırması</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Icons.Plus className="w-4 h-4 mr-2" />
          WiFi Ağı
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {networks.map((network) => (
          <NetworkCard key={network.id} network={network} />
        ))}
      </div>

      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          resetForm();
        }}
        title="Yeni WiFi Ağı"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-white text-sm font-medium mb-2">SSID</label>
            <input
              type="text"
              value={formData.ssid}
              onChange={(e) => setFormData({ ...formData, ssid: e.target.value })}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              placeholder="Infinite-Home"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
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
            <div>
              <label className="block text-white text-sm font-medium mb-2">Şifreleme</label>
              <select
                value={formData.encryption_type}
                onChange={(e) => setFormData({ ...formData, encryption_type: e.target.value })}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none"
              >
                <option value="wpa3" className="bg-gray-800">WPA3</option>
                <option value="wpa2" className="bg-gray-800">WPA2</option>
                <option value="open" className="bg-gray-800">Açık</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-white text-sm font-medium mb-2">Parola</label>
            <input
              type="password"
              value={formData.passphrase}
              onChange={(e) => setFormData({ ...formData, passphrase: e.target.value })}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              placeholder="Güçlü parola"
            />
          </div>

          <div className="flex items-center gap-3 pt-4">
            <Button onClick={handleCreateNetwork} className="flex-1">
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