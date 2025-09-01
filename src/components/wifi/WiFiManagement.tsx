import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as Icons from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { MetricCard } from '../cards/MetricCard';
import { cn } from '../../lib/utils';
import { WiFiNetworkManagement } from './WiFiNetworkManagement';
import { WiFiClientManagement } from './WiFiClientManagement';
import { WiFiAccessPointManagement } from './WiFiAccessPointManagement';
import { WiFiSecurityManagement } from './WiFiSecurityManagement';
import { WiFiPerformanceMonitoring } from './WiFiPerformanceMonitoring';
import { 
  useWiFiStats, 
  useWiFiHealthCheck, 
  useApplyWiFiConfiguration,
  useRestartWiFiService
} from '../../hooks/api/useWiFi';

const WiFiManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState('networks');
  
  const { data: stats, isLoading: statsLoading } = useWiFiStats();
  const { data: health } = useWiFiHealthCheck();
  const applyConfigMutation = useApplyWiFiConfiguration();
  const restartServiceMutation = useRestartWiFiService();

  const tabs = [
    { id: 'networks', label: 'Wi-Fi Ağları (SSID)', icon: 'Wifi' },
    { id: 'access-points', label: 'Access Point\'ler', icon: 'Router' },
    { id: 'clients', label: 'Bağlı Cihazlar', icon: 'Users' },
    { id: 'security', label: 'Güvenlik Politikaları', icon: 'Shield' },
    { id: 'performance', label: 'Performans İzleme', icon: 'Activity' },
    { id: 'mesh', label: 'Mesh Ağ Yapısı', icon: 'Network' }
  ];

  const handleApplyConfiguration = async () => {
    try {
      const result = await applyConfigMutation.mutateAsync();
      if (result.success) {
        alert('Wi-Fi yapılandırması başarıyla uygulandı');
      } else {
        alert(`Yapılandırma hatası: ${result.errors.join(', ')}`);
      }
    } catch (error) {
      console.error('Apply WiFi configuration error:', error);
    }
  };

  const handleRestartService = async () => {
    if (confirm('Tüm Wi-Fi servislerini yeniden başlatmak istediğinizden emin misiniz?')) {
      try {
        await restartServiceMutation.mutateAsync();
        alert('Wi-Fi servisleri yeniden başlatıldı');
      } catch (error) {
        console.error('Restart WiFi service error:', error);
      }
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'networks':
        return <WiFiNetworkManagement />;
      case 'access-points':
        return <WiFiAccessPointManagement />;
      case 'clients':
        return <WiFiClientManagement />;
      case 'security':
        return <WiFiSecurityManagement />;
      case 'performance':
        return <WiFiPerformanceMonitoring />;
      case 'mesh':
        return (
          <Card title="Mesh Ağ Topolojisi">
            <div className="space-y-4">
              <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Icons.Network className="w-4 h-4 text-purple-400" />
                  <span className="text-purple-400 font-medium">Mesh Network Visualization</span>
                </div>
                <p className="text-white/80 text-sm mb-3">
                  Mesh ağ yapısını ve backhaul bağlantılarını görselleştirin
                </p>
                <div className="bg-black/20 rounded-lg p-8 border border-white/10 text-center">
                  <Icons.Wifi className="w-12 h-12 text-white/30 mx-auto mb-3" />
                  <p className="text-white/60">Mesh topoloji haritası geliştirilme aşamasında...</p>
                  <p className="text-white/40 text-sm">AP'ler arası bağlantı ve performans izleme</p>
                </div>
              </div>

              {/* Mesh Features */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Icons.Zap className="w-5 h-5 text-yellow-400" />
                    <span className="text-white font-medium">Fast Roaming</span>
                  </div>
                  <p className="text-white/70 text-sm mb-3">
                    802.11r/k/v desteği ile kesintisiz geçiş
                  </p>
                  <Button variant="outline" className="w-full">
                    <Icons.Settings className="w-4 h-4 mr-2" />
                    Roaming Ayarları
                  </Button>
                </Card>

                <Card className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Icons.Shuffle className="w-5 h-5 text-green-400" />
                    <span className="text-white font-medium">Load Balancing</span>
                  </div>
                  <p className="text-white/70 text-sm mb-3">
                    İstemci dağılımı ve yük dengeleme
                  </p>
                  <Button variant="outline" className="w-full">
                    <Icons.Settings className="w-4 h-4 mr-2" />
                    Dengeleme Ayarları
                  </Button>
                </Card>
              </div>
            </div>
          </Card>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Wi-Fi System Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard
          title="Access Point'ler"
          value={stats ? `${stats.online_access_points} / ${stats.total_access_points}` : '0 / 0'}
          subtitle="Çevrimiçi AP'ler"
          icon="Router"
          status={stats && stats.online_access_points === stats.total_access_points ? 'ok' : 'warn'}
        />
        <MetricCard
          title="Aktif SSID'ler"
          value={stats ? `${stats.active_networks} / ${stats.total_networks}` : '0 / 0'}
          subtitle="Yayın yapan ağlar"
          icon="Wifi"
          status="ok"
        />
        <MetricCard
          title="Bağlı İstemciler"
          value={String(stats?.connected_clients || 0)}
          subtitle={`${stats?.total_clients || 0} kayıtlı cihaz`}
          icon="Users"
          status="ok"
        />
        <MetricCard
          title="Toplam Bant Genişliği"
          value={`${(stats?.total_bandwidth_mbps || 0).toFixed(1)} Mbps`}
          subtitle="Aktif Wi-Fi trafiği"
          icon="Activity"
          status="ok"
        />
      </div>

      {/* Wi-Fi Control Panel */}
      <Card title="Wi-Fi Kontrol Paneli">
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <Button
            onClick={handleApplyConfiguration}
            isLoading={applyConfigMutation.isPending}
            disabled={applyConfigMutation.isPending}
          >
            <Icons.Settings className="w-4 h-4 mr-2" />
            Yapılandırmayı Uygula
          </Button>
          
          <Button
            variant="outline"
            onClick={handleRestartService}
            isLoading={restartServiceMutation.isPending}
          >
            <Icons.RotateCcw className="w-4 h-4 mr-2" />
            Wi-Fi Servisini Restart
          </Button>
          
          <Button variant="outline">
            <Icons.Search className="w-4 h-4 mr-2" />
            Kanal Tara
          </Button>
          
          <Button variant="outline">
            <Icons.Zap className="w-4 h-4 mr-2" />
            Otomatik Optimize
          </Button>
        </div>

        {/* System Health Status */}
        {health && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-3 rounded-lg bg-white/5 border border-white/10">
              <div className="flex items-center gap-2 mb-2">
                <div className={cn(
                  "w-3 h-3 rounded-full",
                  health.overall_health === 'healthy' ? "bg-emerald-400" :
                  health.overall_health === 'warning' ? "bg-orange-400" : "bg-red-400"
                )} />
                <span className="text-white font-medium">Wi-Fi Durumu</span>
              </div>
              <p className="text-white/60 text-sm">
                {health.overall_health === 'healthy' ? 'Tüm AP\'ler normal çalışıyor' :
                 health.overall_health === 'warning' ? 'Bazı sorunlar tespit edildi' :
                 'Kritik Wi-Fi sorunları mevcut'}
              </p>
            </div>
            
            <div className="p-3 rounded-lg bg-white/5 border border-white/10">
              <div className="flex items-center gap-2 mb-2">
                <Icons.Signal className="w-4 h-4 text-blue-400" />
                <span className="text-white font-medium">Sinyal Kalitesi</span>
              </div>
              <p className="text-white/60 text-sm">
                Ortalama sinyal: {Math.round(stats?.average_signal_strength || -70)} dBm
              </p>
            </div>
            
            <div className="p-3 rounded-lg bg-white/5 border border-white/10">
              <div className="flex items-center gap-2 mb-2">
                <Icons.Lock className="w-4 h-4 text-purple-400" />
                <span className="text-white font-medium">Güvenlik</span>
              </div>
              <p className="text-white/60 text-sm">WPA3 şifreleme ve MAC filtreleme aktif</p>
            </div>
          </div>
        )}
      </Card>

      {/* Tabs */}
      <div className="flex space-x-1 bg-white/5 p-1 rounded-2xl backdrop-blur-sm border border-white/10 overflow-x-auto">
        {tabs.map((tab) => {
          const IconComponent = Icons[tab.icon as keyof typeof Icons] as React.ComponentType<any>;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "relative flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 font-medium whitespace-nowrap",
                activeTab === tab.id
                  ? "bg-emerald-500/20 text-white border border-emerald-500/30 shadow-lg shadow-emerald-500/20"
                  : "text-white/70 hover:text-white hover:bg-white/10 hover:shadow-lg hover:shadow-white/10 border border-transparent hover:border-white/20"
              )}
              style={{
                textShadow: activeTab === tab.id ? '0 0 8px rgba(0, 163, 108, 0.6)' : 'none'
              }}
            >
              <IconComponent className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
        >
          {renderTabContent()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default WiFiManagement;