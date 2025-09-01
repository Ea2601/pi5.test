import React, { useState } from 'react';
import * as Icons from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { MetricCard } from '../cards/MetricCard';
import { cn, formatUptime } from '../../lib/utils';
import { 
  useWiFiAccessPoints, 
  useCreateAccessPoint, 
  useUpdateAccessPoint, 
  useDeleteAccessPoint,
  useAnalyzeChannels,
  useOptimizeChannels,
  useRestartWiFiService
} from '../../hooks/api/useWiFi';
import { WiFiAccessPoint } from '../../types/wifi';

interface APFormData {
  ap_name: string;
  description: string;
  mac_address: string;
  ip_address: string;
  location: string;
  vendor: string;
  model: string;
  max_clients: number;
  supported_bands: ('2.4ghz' | '5ghz' | '6ghz')[];
  max_tx_power: number;
  management_url: string;
  is_mesh_enabled: boolean;
  mesh_role: 'standalone' | 'controller' | 'node';
  mesh_backhaul_type: 'auto' | 'ethernet' | 'wireless';
}

export const WiFiAccessPointManagement: React.FC = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingAP, setEditingAP] = useState<WiFiAccessPoint | null>(null);
  const [selectedAP, setSelectedAP] = useState<string>('');
  
  const { data: accessPoints = [], isLoading } = useWiFiAccessPoints();
  const createAPMutation = useCreateAccessPoint();
  const updateAPMutation = useUpdateAccessPoint();
  const deleteAPMutation = useDeleteAccessPoint();
  const analyzeChannelsMutation = useAnalyzeChannels();
  const optimizeChannelsMutation = useOptimizeChannels();
  const restartServiceMutation = useRestartWiFiService();

  const [formData, setFormData] = useState<APFormData>({
    ap_name: '',
    description: '',
    mac_address: '',
    ip_address: '',
    location: '',
    vendor: '',
    model: '',
    max_clients: 50,
    supported_bands: ['2.4ghz', '5ghz'],
    max_tx_power: 20,
    management_url: '',
    is_mesh_enabled: false,
    mesh_role: 'standalone',
    mesh_backhaul_type: 'auto'
  });

  const resetForm = () => {
    setFormData({
      ap_name: '',
      description: '',
      mac_address: '',
      ip_address: '',
      location: '',
      vendor: '',
      model: '',
      max_clients: 50,
      supported_bands: ['2.4ghz', '5ghz'],
      max_tx_power: 20,
      management_url: '',
      is_mesh_enabled: false,
      mesh_role: 'standalone',
      mesh_backhaul_type: 'auto'
    });
  };

  const handleCreateAP = async () => {
    try {
      await createAPMutation.mutateAsync(formData);
      setShowCreateModal(false);
      resetForm();
    } catch (error) {
      console.error('Create access point error:', error);
    }
  };

  const handleAnalyzeChannels = async (apId: string) => {
    try {
      const analysis = await analyzeChannelsMutation.mutateAsync(apId);
      console.log('Channel analysis:', analysis);
      alert('Kanal analizi tamamlandı - sonuçları konsola bakın');
    } catch (error) {
      console.error('Channel analysis error:', error);
    }
  };

  const handleOptimizeChannels = async (apId: string) => {
    try {
      const result = await optimizeChannelsMutation.mutateAsync(apId);
      alert(`Kanal optimizasyonu: ${result.recommendations.map(r => `${r.band} → Kanal ${r.channel}`).join(', ')}`);
    } catch (error) {
      console.error('Channel optimization error:', error);
    }
  };

  const handleRestartService = async (apId?: string) => {
    if (confirm('Wi-Fi servisini yeniden başlatmak istediğinizden emin misiniz?')) {
      try {
        await restartServiceMutation.mutateAsync(apId);
        alert('Wi-Fi servisi yeniden başlatıldı');
      } catch (error) {
        console.error('Restart service error:', error);
      }
    }
  };

  const getStatusColor = (isOnline: boolean) => {
    return isOnline ? 'bg-emerald-400' : 'bg-red-400';
  };

  const getTemperatureColor = (temp: number) => {
    if (temp > 70) return 'text-red-400';
    if (temp > 50) return 'text-orange-400';
    return 'text-emerald-400';
  };

  const getMeshRoleIcon = (role: string) => {
    switch (role) {
      case 'controller': return Icons.Crown;
      case 'node': return Icons.Radio;
      default: return Icons.Router;
    }
  };

  const AccessPointCard: React.FC<{ ap: WiFiAccessPoint }> = ({ ap }) => {
    const MeshIcon = getMeshRoleIcon(ap.mesh_role);
    
    return (
      <Card className="h-full">
        <div className="space-y-4">
          {/* AP Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center",
                ap.is_online 
                  ? "bg-emerald-500/20 border border-emerald-500/30" 
                  : "bg-red-500/20 border border-red-500/30"
              )}>
                <Icons.Router className={cn(
                  "w-5 h-5",
                  ap.is_online ? "text-emerald-400" : "text-red-400"
                )} />
              </div>
              <div>
                <h4 className="text-white font-semibold">{ap.ap_name}</h4>
                <p className="text-white/60 text-sm">{ap.vendor} {ap.model}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {ap.is_mesh_enabled && (
                <div className="flex items-center gap-1 px-2 py-1 bg-purple-500/20 border border-purple-500/30 rounded">
                  <MeshIcon className="w-3 h-3 text-purple-400" />
                  <span className="text-purple-400 text-xs">{ap.mesh_role}</span>
                </div>
              )}
              <div className={cn("w-3 h-3 rounded-full", getStatusColor(ap.is_online))} />
            </div>
          </div>

          {/* AP Info */}
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-white/60">IP Adresi:</span>
              <span className="text-white font-mono">{ap.ip_address || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/60">Konum:</span>
              <span className="text-white">{ap.location || 'Belirtilmemiş'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/60">Max Power:</span>
              <span className="text-white">{ap.max_tx_power} dBm</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/60">Sıcaklık:</span>
              <span className={getTemperatureColor(ap.temperature)}>
                {ap.temperature}°C
              </span>
            </div>
          </div>

          {/* Supported Bands */}
          <div className="space-y-1">
            <span className="text-white/60 text-sm">Desteklenen Bantlar:</span>
            <div className="flex flex-wrap gap-1">
              {ap.supported_bands.map((band) => (
                <span key={band} className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs">
                  {band === '2.4ghz' ? '2.4 GHz' : band === '5ghz' ? '5 GHz' : '6 GHz'}
                </span>
              ))}
            </div>
          </div>

          {/* System Status */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/5 rounded-lg p-2">
              <p className="text-white/60 text-xs">CPU</p>
              <p className="text-white font-medium">{ap.cpu_usage}%</p>
            </div>
            <div className="bg-white/5 rounded-lg p-2">
              <p className="text-white/60 text-xs">RAM</p>
              <p className="text-white font-medium">{ap.memory_usage}%</p>
            </div>
          </div>

          {/* Uptime */}
          <div className="text-center p-2 bg-white/5 rounded-lg">
            <p className="text-white/60 text-xs">Çalışma Süresi</p>
            <p className="text-white font-medium">{formatUptime(ap.uptime_seconds)}</p>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-1 pt-3 border-t border-white/10">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleAnalyzeChannels(ap.id)}
              className="text-xs"
            >
              <Icons.BarChart3 className="w-3 h-3 mr-1" />
              Kanal Analizi
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleOptimizeChannels(ap.id)}
              className="text-xs"
            >
              <Icons.Zap className="w-3 h-3 mr-1" />
              Optimize
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setEditingAP(ap);
                setFormData({
                  ap_name: ap.ap_name,
                  description: ap.description || '',
                  mac_address: ap.mac_address,
                  ip_address: ap.ip_address || '',
                  location: ap.location || '',
                  vendor: ap.vendor,
                  model: ap.model || '',
                  max_clients: ap.max_clients,
                  supported_bands: ap.supported_bands,
                  max_tx_power: ap.max_tx_power,
                  management_url: ap.management_url || '',
                  is_mesh_enabled: ap.is_mesh_enabled,
                  mesh_role: ap.mesh_role,
                  mesh_backhaul_type: ap.mesh_backhaul_type
                });
              }}
              className="text-xs"
            >
              <Icons.Edit className="w-3 h-3 mr-1" />
              Düzenle
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => handleRestartService(ap.id)}
              className="text-xs"
            >
              <Icons.RotateCcw className="w-3 h-3 mr-1" />
              Restart
            </Button>
          </div>
        </div>
      </Card>
    );
  };

  const onlineAPs = accessPoints.filter(ap => ap.is_online);
  const averageTemp = accessPoints.length > 0 
    ? Math.round(accessPoints.reduce((acc, ap) => acc + ap.temperature, 0) / accessPoints.length)
    : 0;

  return (
    <div className="space-y-6">
      {/* AP Overview Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard
          title="Access Point'ler"
          value={`${onlineAPs.length} / ${accessPoints.length}`}
          subtitle="Çevrimiçi AP'ler"
          icon="Router"
          status={onlineAPs.length === accessPoints.length ? 'ok' : 'warn'}
        />
        <MetricCard
          title="Ortalama Sıcaklık"
          value={`${averageTemp}°C`}
          subtitle="Tüm AP'ler"
          icon="Thermometer"
          status={averageTemp > 60 ? 'warn' : 'ok'}
        />
        <MetricCard
          title="Toplam İstemci Kapasitesi"
          value={String(accessPoints.reduce((acc, ap) => acc + ap.max_clients, 0))}
          subtitle="Maksimum bağlantı"
          icon="Users"
          status="ok"
        />
        <MetricCard
          title="Mesh Durumu"
          value={accessPoints.filter(ap => ap.is_mesh_enabled).length > 1 ? "Aktif" : "Pasif"}
          subtitle="Mesh ağ yapısı"
          icon="Network"
          status="ok"
        />
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-white">Access Point Yönetimi</h3>
          <p className="text-white/70 text-sm">Wi-Fi erişim noktaları ve fiziksel cihaz yapılandırması</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Icons.Plus className="w-4 h-4 mr-2" />
          Yeni Access Point
        </Button>
      </div>

      {/* Access Points Grid */}
      {accessPoints.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <Icons.Router className="w-16 h-16 text-white/30 mx-auto mb-4" />
            <h3 className="text-white font-semibold mb-2">Henüz access point bulunmuyor</h3>
            <p className="text-white/60 mb-4">İlk Wi-Fi access point'inizi ekleyin</p>
            <Button onClick={() => setShowCreateModal(true)}>
              <Icons.Plus className="w-4 h-4 mr-2" />
              Access Point Ekle
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {accessPoints.map((ap) => (
            <AccessPointCard key={ap.id} ap={ap} />
          ))}
        </div>
      )}

      {/* Create/Edit AP Modal */}
      <Modal
        isOpen={showCreateModal || !!editingAP}
        onClose={() => {
          setShowCreateModal(false);
          setEditingAP(null);
          resetForm();
        }}
        title={editingAP ? 'Access Point Düzenle' : 'Yeni Access Point'}
        size="lg"
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-white text-sm font-medium mb-2">AP Adı</label>
              <input
                type="text"
                value={formData.ap_name}
                onChange={(e) => setFormData({ ...formData, ap_name: e.target.value })}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                placeholder="Main Access Point"
              />
            </div>
            <div>
              <label className="block text-white text-sm font-medium mb-2">Konum</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                placeholder="Living Room"
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
              placeholder="Access point açıklaması"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-white text-sm font-medium mb-2">MAC Address</label>
              <input
                type="text"
                value={formData.mac_address}
                onChange={(e) => setFormData({ ...formData, mac_address: e.target.value })}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                placeholder="00:1A:2B:3C:4D:5E"
              />
            </div>
            <div>
              <label className="block text-white text-sm font-medium mb-2">IP Address</label>
              <input
                type="text"
                value={formData.ip_address}
                onChange={(e) => setFormData({ ...formData, ip_address: e.target.value })}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                placeholder="192.168.1.10"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-white text-sm font-medium mb-2">Vendor</label>
              <input
                type="text"
                value={formData.vendor}
                onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                placeholder="TP-Link"
              />
            </div>
            <div>
              <label className="block text-white text-sm font-medium mb-2">Model</label>
              <input
                type="text"
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                placeholder="AX6000"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <label className="block text-white text-sm font-medium mb-2">Max TX Power (dBm)</label>
              <input
                type="number"
                value={formData.max_tx_power}
                onChange={(e) => setFormData({ ...formData, max_tx_power: parseInt(e.target.value) })}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none"
                min="1"
                max="30"
              />
            </div>
          </div>

          {/* Supported Bands */}
          <div>
            <label className="block text-white text-sm font-medium mb-3">Desteklenen Frekans Bantları</label>
            <div className="flex gap-4">
              {(['2.4ghz', '5ghz', '6ghz'] as const).map((band) => (
                <div key={band} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id={`band-${band}`}
                    checked={formData.supported_bands.includes(band)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFormData({ 
                          ...formData, 
                          supported_bands: [...formData.supported_bands, band]
                        });
                      } else {
                        setFormData({ 
                          ...formData, 
                          supported_bands: formData.supported_bands.filter(b => b !== band)
                        });
                      }
                    }}
                    className="w-4 h-4 rounded border-white/20 bg-white/10"
                  />
                  <label htmlFor={`band-${band}`} className="text-white text-sm">
                    {band === '2.4ghz' ? '2.4 GHz' : band === '5ghz' ? '5 GHz' : '6 GHz'}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Mesh Configuration */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setFormData({ ...formData, is_mesh_enabled: !formData.is_mesh_enabled })}
                className={cn(
                  "relative w-10 h-5 rounded-full transition-all duration-300",
                  formData.is_mesh_enabled 
                    ? "bg-purple-500 shadow-lg shadow-purple-500/30" 
                    : "bg-white/20"
                )}
              >
                <div
                  className={cn(
                    "absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all duration-300 shadow-lg",
                    formData.is_mesh_enabled ? "left-5" : "left-0.5"
                  )}
                />
              </button>
              <span className="text-white font-medium">Mesh Network Desteği</span>
            </div>

            {formData.is_mesh_enabled && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white text-sm font-medium mb-2">Mesh Rolü</label>
                  <select
                    value={formData.mesh_role}
                    onChange={(e) => setFormData({ ...formData, mesh_role: e.target.value as any })}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none"
                  >
                    <option value="standalone" className="bg-gray-800">Standalone</option>
                    <option value="controller" className="bg-gray-800">Controller</option>
                    <option value="node" className="bg-gray-800">Node</option>
                  </select>
                </div>
                <div>
                  <label className="block text-white text-sm font-medium mb-2">Backhaul Türü</label>
                  <select
                    value={formData.mesh_backhaul_type}
                    onChange={(e) => setFormData({ ...formData, mesh_backhaul_type: e.target.value as any })}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none"
                  >
                    <option value="auto" className="bg-gray-800">Otomatik</option>
                    <option value="ethernet" className="bg-gray-800">Ethernet</option>
                    <option value="wireless" className="bg-gray-800">Wireless</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-4">
            <Button
              onClick={handleCreateAP}
              disabled={createAPMutation.isPending}
              isLoading={createAPMutation.isPending}
              className="flex-1"
            >
              {editingAP ? 'Güncelle' : 'Oluştur'}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setShowCreateModal(false);
                setEditingAP(null);
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