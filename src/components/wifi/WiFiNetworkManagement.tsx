import React, { useState } from 'react';
import { motion } from 'framer-motion';
import * as Icons from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { cn } from '../../lib/utils';
import { 
  useWiFiNetworks, 
  useWiFiAccessPoints,
  useCreateWiFiNetwork, 
  useUpdateWiFiNetwork, 
  useDeleteWiFiNetwork,
  useToggleWiFiNetwork 
} from '../../hooks/api/useWiFi';
import { WiFiNetwork, WiFiAccessPoint, wifiNetworkPresets } from '../../types/wifi';

interface NetworkFormData {
  ssid: string;
  description: string;
  ap_id: string;
  vlan_id: number;
  network_type: 'standard' | 'guest' | 'iot' | 'admin';
  encryption_type: 'open' | 'wep' | 'wpa2' | 'wpa3' | 'wpa2_enterprise' | 'wpa3_enterprise';
  passphrase: string;
  frequency_band: '2.4ghz' | '5ghz' | '6ghz';
  channel: number;
  channel_width: number;
  tx_power: number;
  hide_ssid: boolean;
  mac_filtering_enabled: boolean;
  band_steering_enabled: boolean;
  fast_roaming_enabled: boolean;
  captive_portal_enabled: boolean;
  client_isolation: boolean;
  internet_access: boolean;
  local_access: boolean;
  max_clients: number;
  bandwidth_limit_mbps: number;
  priority_level: number;
}

const NetworkTypeCard: React.FC<{ 
  preset: typeof wifiNetworkPresets[0]; 
  onSelect: () => void;
  isSelected: boolean;
}> = ({ preset, onSelect, isSelected }) => {
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'admin': return 'border-blue-500/30 bg-blue-500/10';
      case 'standard': return 'border-emerald-500/30 bg-emerald-500/10';
      case 'iot': return 'border-orange-500/30 bg-orange-500/10';
      case 'guest': return 'border-red-500/30 bg-red-500/10';
      default: return 'border-white/20 bg-white/5';
    }
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

  const SecurityIcon = getSecurityIcon(preset.security_level);

  return (
    <button
      onClick={onSelect}
      className={cn(
        "p-4 rounded-xl border transition-all text-left w-full",
        getTypeColor(preset.network_type),
        isSelected 
          ? "ring-2 ring-emerald-500/50 scale-105" 
          : "hover:border-white/40 hover:bg-white/10"
      )}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-8 h-8 rounded-lg flex items-center justify-center border",
            getTypeColor(preset.network_type)
          )}>
            <span className="text-white font-bold">{preset.vlan_id}</span>
          </div>
          <div>
            <h4 className="text-white font-medium">{preset.name}</h4>
            <p className="text-white/60 text-xs">{preset.encryption_type.toUpperCase()}</p>
          </div>
        </div>
        <SecurityIcon className="w-5 h-5 text-white/70" />
      </div>
      <p className="text-white/70 text-sm">{preset.description}</p>
      <div className="flex items-center gap-2 mt-2">
        <span className="px-2 py-1 bg-white/10 rounded text-xs text-white">
          VLAN {preset.vlan_id}
        </span>
        <span className="px-2 py-1 bg-white/10 rounded text-xs text-white">
          {preset.frequency_band}
        </span>
      </div>
    </button>
  );
};

export const WiFiNetworkManagement: React.FC = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPresetModal, setShowPresetModal] = useState(false);
  const [editingNetwork, setEditingNetwork] = useState<WiFiNetwork | null>(null);
  const [selectedPreset, setSelectedPreset] = useState<typeof wifiNetworkPresets[0] | null>(null);
  
  const { data: networks = [], isLoading } = useWiFiNetworks();
  const { data: accessPoints = [] } = useWiFiAccessPoints();
  const createNetworkMutation = useCreateWiFiNetwork();
  const updateNetworkMutation = useUpdateWiFiNetwork();
  const deleteNetworkMutation = useDeleteWiFiNetwork();
  const toggleNetworkMutation = useToggleWiFiNetwork();

  const [formData, setFormData] = useState<NetworkFormData>({
    ssid: '',
    description: '',
    ap_id: '',
    vlan_id: 20,
    network_type: 'standard',
    encryption_type: 'wpa3',
    passphrase: '',
    frequency_band: '5ghz',
    channel: 36,
    channel_width: 80,
    tx_power: 20,
    hide_ssid: false,
    mac_filtering_enabled: false,
    band_steering_enabled: true,
    fast_roaming_enabled: true,
    captive_portal_enabled: false,
    client_isolation: false,
    internet_access: true,
    local_access: true,
    max_clients: 50,
    bandwidth_limit_mbps: 0,
    priority_level: 50
  });

  const resetForm = () => {
    setFormData({
      ssid: '',
      description: '',
      ap_id: '',
      vlan_id: 20,
      network_type: 'standard',
      encryption_type: 'wpa3',
      passphrase: '',
      frequency_band: '5ghz',
      channel: 36,
      channel_width: 80,
      tx_power: 20,
      hide_ssid: false,
      mac_filtering_enabled: false,
      band_steering_enabled: true,
      fast_roaming_enabled: true,
      captive_portal_enabled: false,
      client_isolation: false,
      internet_access: true,
      local_access: true,
      max_clients: 50,
      bandwidth_limit_mbps: 0,
      priority_level: 50
    });
    setSelectedPreset(null);
  };

  const handlePresetSelect = (preset: typeof wifiNetworkPresets[0]) => {
    setSelectedPreset(preset);
    setFormData({
      ...formData,
      ssid: `Infinite-${preset.name}`,
      description: preset.description,
      vlan_id: preset.vlan_id,
      network_type: preset.network_type,
      encryption_type: preset.encryption_type,
      frequency_band: preset.frequency_band,
      ...preset.default_config
    });
    setShowPresetModal(false);
  };

  const handleCreateNetwork = async () => {
    try {
      await createNetworkMutation.mutateAsync(formData);
      setShowCreateModal(false);
      resetForm();
    } catch (error) {
      console.error('Create WiFi network error:', error);
    }
  };

  const getNetworkTypeColor = (type: string) => {
    switch (type) {
      case 'admin': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'standard': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'iot': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'guest': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getEncryptionIcon = (encryption: string) => {
    switch (encryption) {
      case 'wpa3': return Icons.ShieldCheck;
      case 'wpa2': return Icons.Shield;
      case 'wpa2_enterprise': return Icons.Building;
      case 'wpa3_enterprise': return Icons.Building2;
      case 'open': return Icons.ShieldX;
      default: return Icons.Shield;
    }
  };

  const NetworkCard: React.FC<{ network: WiFiNetwork & { access_point?: any } }> = ({ network }) => {
    const EncryptionIcon = getEncryptionIcon(network.encryption_type);
    
    return (
      <Card className="h-full">
        <div className="space-y-4">
          {/* Network Header */}
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
                <p className="text-white/60 text-sm">
                  {network.access_point?.ap_name || 'Unknown AP'} • {network.frequency_band}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={cn("px-2 py-1 rounded-full text-xs border", getNetworkTypeColor(network.network_type))}>
                VLAN {network.vlan_id}
              </span>
              <div className={cn(
                "w-3 h-3 rounded-full",
                network.is_enabled ? "bg-emerald-400" : "bg-gray-400"
              )} />
            </div>
          </div>

          {/* Network Info */}
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-white/60">Şifreleme:</span>
              <div className="flex items-center gap-1">
                <EncryptionIcon className="w-3 h-3 text-white" />
                <span className="text-white">{network.encryption_type.toUpperCase()}</span>
              </div>
            </div>
            <div className="flex justify-between">
              <span className="text-white/60">Kanal:</span>
              <span className="text-white">{network.channel || 'Auto'} ({network.channel_width}MHz)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/60">İstemci:</span>
              <span className="text-white">{network.client_count} / {network.max_clients}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/60">TX Power:</span>
              <span className="text-white">{network.tx_power} dBm</span>
            </div>
          </div>

          {/* Features */}
          <div className="grid grid-cols-3 gap-2">
            <div className={cn(
              "p-2 rounded text-center text-xs",
              network.band_steering_enabled ? "bg-emerald-500/20 text-emerald-400" : "bg-white/5 text-white/60"
            )}>
              <Icons.Zap className="w-3 h-3 mx-auto mb-1" />
              Band Steering
            </div>
            <div className={cn(
              "p-2 rounded text-center text-xs",
              network.fast_roaming_enabled ? "bg-blue-500/20 text-blue-400" : "bg-white/5 text-white/60"
            )}>
              <Icons.Shuffle className="w-3 h-3 mx-auto mb-1" />
              Fast Roaming
            </div>
            <div className={cn(
              "p-2 rounded text-center text-xs",
              network.qos_enabled ? "bg-purple-500/20 text-purple-400" : "bg-white/5 text-white/60"
            )}>
              <Icons.Gauge className="w-3 h-3 mx-auto mb-1" />
              QoS
            </div>
          </div>

          {/* Security Indicators */}
          <div className="grid grid-cols-2 gap-2">
            <div className={cn(
              "p-2 rounded text-center text-xs",
              network.client_isolation ? "bg-orange-500/20 text-orange-400" : "bg-white/5 text-white/60"
            )}>
              <Icons.Shield className="w-3 h-3 mx-auto mb-1" />
              İstemci İzolasyonu
            </div>
            <div className={cn(
              "p-2 rounded text-center text-xs",
              network.captive_portal_enabled ? "bg-red-500/20 text-red-400" : "bg-white/5 text-white/60"
            )}>
              <Icons.Lock className="w-3 h-3 mx-auto mb-1" />
              Captive Portal
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 pt-3 border-t border-white/10">
            <Button
              size="sm"
              variant={network.is_enabled ? "destructive" : "default"}
              onClick={() => toggleNetworkMutation.mutate(network.id)}
              className="flex-1"
            >
              {network.is_enabled ? (
                <>
                  <Icons.WifiOff className="w-3 h-3 mr-1" />
                  Kapat
                </>
              ) : (
                <>
                  <Icons.Wifi className="w-3 h-3 mr-1" />
                  Aç
                </>
              )}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setEditingNetwork(network);
                setFormData({
                  ssid: network.ssid,
                  description: network.description || '',
                  ap_id: network.ap_id,
                  vlan_id: network.vlan_id || 20,
                  network_type: network.network_type,
                  encryption_type: network.encryption_type,
                  passphrase: network.passphrase || '',
                  frequency_band: network.frequency_band,
                  channel: network.channel || 36,
                  channel_width: network.channel_width,
                  tx_power: network.tx_power,
                  hide_ssid: network.hide_ssid,
                  mac_filtering_enabled: network.mac_filtering_enabled,
                  band_steering_enabled: network.band_steering_enabled,
                  fast_roaming_enabled: network.fast_roaming_enabled,
                  captive_portal_enabled: network.captive_portal_enabled,
                  client_isolation: network.client_isolation,
                  internet_access: network.internet_access,
                  local_access: network.local_access,
                  max_clients: network.max_clients,
                  bandwidth_limit_mbps: network.bandwidth_limit_mbps || 0,
                  priority_level: network.priority_level
                });
              }}
            >
              <Icons.Edit className="w-3 h-3" />
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => {
                if (confirm('Bu Wi-Fi ağını silmek istediğinizden emin misiniz?')) {
                  deleteNetworkMutation.mutate(network.id);
                }
              }}
            >
              <Icons.Trash2 className="w-3 h-3" />
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
          <h3 className="text-xl font-bold text-white">Wi-Fi Ağ Yönetimi (SSID)</h3>
          <p className="text-white/70 text-sm">Kablosuz ağ yapılandırması ve VLAN eşleştirmesi</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setShowPresetModal(true)}>
            <Icons.Layers className="w-4 h-4 mr-2" />
            Preset Ağlar
          </Button>
          <Button onClick={() => setShowCreateModal(true)}>
            <Icons.Plus className="w-4 h-4 mr-2" />
            Özel SSID
          </Button>
        </div>
      </div>

      {/* Networks Grid */}
      {networks.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <Icons.Wifi className="w-16 h-16 text-white/30 mx-auto mb-4" />
            <h3 className="text-white font-semibold mb-2">Henüz Wi-Fi ağı bulunmuyor</h3>
            <p className="text-white/60 mb-4">İlk wireless ağınızı oluşturun</p>
            <div className="flex items-center gap-2 justify-center">
              <Button onClick={() => setShowPresetModal(true)}>
                <Icons.Layers className="w-4 h-4 mr-2" />
                Preset Ağlar
              </Button>
              <Button variant="outline" onClick={() => setShowCreateModal(true)}>
                <Icons.Plus className="w-4 h-4 mr-2" />
                Özel SSID
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {networks.map((network) => (
            <NetworkCard key={network.id} network={network} />
          ))}
        </div>
      )}

      {/* Preset Networks Modal */}
      <Modal
        isOpen={showPresetModal}
        onClose={() => setShowPresetModal(false)}
        title="Önceden Tanımlanmış Wi-Fi Ağları"
        size="xl"
      >
        <div className="space-y-4">
          <p className="text-white/70 text-sm">VLAN tabanlı güvenli Wi-Fi ağ yapılandırmalarını seçin</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {wifiNetworkPresets.map((preset) => (
              <NetworkTypeCard
                key={preset.vlan_id}
                preset={preset}
                onSelect={() => handlePresetSelect(preset)}
                isSelected={selectedPreset?.vlan_id === preset.vlan_id}
              />
            ))}
          </div>
        </div>
      </Modal>

      {/* Create/Edit Network Modal */}
      <Modal
        isOpen={showCreateModal || !!editingNetwork}
        onClose={() => {
          setShowCreateModal(false);
          setEditingNetwork(null);
          resetForm();
        }}
        title={editingNetwork ? 'Wi-Fi Ağı Düzenle' : 'Yeni Wi-Fi Ağı Oluştur'}
        size="xl"
      >
        <div className="space-y-6">
          {/* Basic Settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-white text-sm font-medium mb-2">SSID (Ağ Adı)</label>
              <input
                type="text"
                value={formData.ssid}
                onChange={(e) => setFormData({ ...formData, ssid: e.target.value })}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                placeholder="Infinite-Home"
              />
            </div>
            <div>
              <label className="block text-white text-sm font-medium mb-2">Access Point</label>
              <select
                value={formData.ap_id}
                onChange={(e) => setFormData({ ...formData, ap_id: e.target.value })}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none"
              >
                <option value="">Access Point seçin</option>
                {accessPoints.map((ap) => (
                  <option key={ap.id} value={ap.id} className="bg-gray-800">
                    {ap.ap_name} ({ap.location})
                  </option>
                ))}
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
              placeholder="Wi-Fi ağı açıklaması"
            />
          </div>

          {/* Security Settings */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              <label className="block text-white text-sm font-medium mb-2">Ağ Türü</label>
              <select
                value={formData.network_type}
                onChange={(e) => setFormData({ ...formData, network_type: e.target.value as any })}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none"
              >
                <option value="standard" className="bg-gray-800">Standart</option>
                <option value="guest" className="bg-gray-800">Misafir</option>
                <option value="iot" className="bg-gray-800">IoT</option>
                <option value="admin" className="bg-gray-800">Yönetim</option>
              </select>
            </div>
            <div>
              <label className="block text-white text-sm font-medium mb-2">Şifreleme</label>
              <select
                value={formData.encryption_type}
                onChange={(e) => setFormData({ ...formData, encryption_type: e.target.value as any })}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none"
              >
                <option value="wpa3" className="bg-gray-800">WPA3 (Önerilen)</option>
                <option value="wpa2" className="bg-gray-800">WPA2</option>
                <option value="wpa2_enterprise" className="bg-gray-800">WPA2 Enterprise</option>
                <option value="wpa3_enterprise" className="bg-gray-800">WPA3 Enterprise</option>
                <option value="open" className="bg-gray-800">Açık Ağ</option>
              </select>
            </div>
          </div>

          {formData.encryption_type !== 'open' && (
            <div>
              <label className="block text-white text-sm font-medium mb-2">Wi-Fi Parolası</label>
              <div className="relative">
                <input
                  type="password"
                  value={formData.passphrase}
                  onChange={(e) => setFormData({ ...formData, passphrase: e.target.value })}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  placeholder="Güçlü parola girin"
                  minLength={8}
                />
                <Icons.Key className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/40" />
              </div>
            </div>
          )}

          {/* Radio Settings */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-white text-sm font-medium mb-2">Frekans Bandı</label>
              <select
                value={formData.frequency_band}
                onChange={(e) => setFormData({ ...formData, frequency_band: e.target.value as any })}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none"
              >
                <option value="2.4ghz" className="bg-gray-800">2.4 GHz</option>
                <option value="5ghz" className="bg-gray-800">5 GHz</option>
                <option value="6ghz" className="bg-gray-800">6 GHz</option>
              </select>
            </div>
            <div>
              <label className="block text-white text-sm font-medium mb-2">Kanal</label>
              <input
                type="number"
                value={formData.channel}
                onChange={(e) => setFormData({ ...formData, channel: parseInt(e.target.value) })}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none"
                placeholder="Auto"
              />
            </div>
            <div>
              <label className="block text-white text-sm font-medium mb-2">Kanal Genişliği</label>
              <select
                value={formData.channel_width}
                onChange={(e) => setFormData({ ...formData, channel_width: parseInt(e.target.value) })}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none"
              >
                <option value={20} className="bg-gray-800">20 MHz</option>
                <option value={40} className="bg-gray-800">40 MHz</option>
                <option value={80} className="bg-gray-800">80 MHz</option>
                <option value={160} className="bg-gray-800">160 MHz</option>
              </select>
            </div>
            <div>
              <label className="block text-white text-sm font-medium mb-2">TX Power (dBm)</label>
              <input
                type="number"
                value={formData.tx_power}
                onChange={(e) => setFormData({ ...formData, tx_power: parseInt(e.target.value) })}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none"
                min="1"
                max="30"
              />
            </div>
          </div>

          {/* Advanced Features */}
          <div className="space-y-4">
            <h4 className="text-white font-medium">Gelişmiş Özellikler</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                {[
                  { key: 'hide_ssid', label: 'SSID Gizle' },
                  { key: 'mac_filtering_enabled', label: 'MAC Filtresi' },
                  { key: 'band_steering_enabled', label: 'Band Steering' },
                  { key: 'fast_roaming_enabled', label: 'Fast Roaming (802.11r)' }
                ].map(({ key, label }) => (
                  <div key={key} className="flex items-center gap-3">
                    <button
                      onClick={() => setFormData({ ...formData, [key]: !formData[key as keyof NetworkFormData] })}
                      className={cn(
                        "relative w-10 h-5 rounded-full transition-all duration-300",
                        formData[key as keyof NetworkFormData] 
                          ? "bg-emerald-500 shadow-lg shadow-emerald-500/30" 
                          : "bg-white/20"
                      )}
                    >
                      <div
                        className={cn(
                          "absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all duration-300 shadow-lg",
                          formData[key as keyof NetworkFormData] ? "left-5" : "left-0.5"
                        )}
                      />
                    </button>
                    <span className="text-white text-sm">{label}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-3">
                {[
                  { key: 'captive_portal_enabled', label: 'Captive Portal' },
                  { key: 'client_isolation', label: 'İstemci İzolasyonu' },
                  { key: 'internet_access', label: 'İnternet Erişimi' },
                  { key: 'local_access', label: 'Yerel Ağ Erişimi' }
                ].map(({ key, label }) => (
                  <div key={key} className="flex items-center gap-3">
                    <button
                      onClick={() => setFormData({ ...formData, [key]: !formData[key as keyof NetworkFormData] })}
                      className={cn(
                        "relative w-10 h-5 rounded-full transition-all duration-300",
                        formData[key as keyof NetworkFormData] 
                          ? "bg-emerald-500 shadow-lg shadow-emerald-500/30" 
                          : "bg-white/20"
                      )}
                    >
                      <div
                        className={cn(
                          "absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all duration-300 shadow-lg",
                          formData[key as keyof NetworkFormData] ? "left-5" : "left-0.5"
                        )}
                      />
                    </button>
                    <span className="text-white text-sm">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Performance Settings */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-white text-sm font-medium mb-2">Maksimum İstemci</label>
              <input
                type="number"
                value={formData.max_clients}
                onChange={(e) => setFormData({ ...formData, max_clients: parseInt(e.target.value) })}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none"
                min="1"
                max="200"
              />
            </div>
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
              <label className="block text-white text-sm font-medium mb-2">QoS Öncelik</label>
              <input
                type="range"
                min="1"
                max="100"
                value={formData.priority_level}
                onChange={(e) => setFormData({ ...formData, priority_level: parseInt(e.target.value) })}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-white/60 mt-1">
                <span>Düşük</span>
                <span className="text-white">{formData.priority_level}</span>
                <span>Kritik</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-4">
            <Button
              onClick={handleCreateNetwork}
              disabled={createNetworkMutation.isPending}
              isLoading={createNetworkMutation.isPending}
              className="flex-1"
            >
              {editingNetwork ? 'Güncelle' : 'Oluştur'}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setShowCreateModal(false);
                setEditingNetwork(null);
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