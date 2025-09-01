import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as Icons from 'lucide-react';
import { MetricCard } from '../cards/MetricCard';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { cn } from '../../lib/utils';
import { NetworkTopologyMap } from './NetworkTopologyMap';
import { VLANManagement } from './VLANManagement';
import { TrafficFlowVisualization } from './TrafficFlowVisualization';
import SpeedTestManagement from '../speedTest/SpeedTestManagement';
import { 
  useTopologyStats, 
  useNetworkHealthCheck, 
  useDiscoverTopology,
  useAutoLayoutTopology,
  useSyncWithNetworkDevices,
  useCreateTopologySnapshot
} from '../../hooks/api/useTopology';

const NetworkTopology: React.FC = () => {
  const [activeTab, setActiveTab] = useState('topology');
  
  const { data: stats, isLoading: statsLoading } = useTopologyStats();
  const { data: health } = useNetworkHealthCheck();
  const discoverTopologyMutation = useDiscoverTopology();
  const autoLayoutMutation = useAutoLayoutTopology();
  const syncMutation = useSyncWithNetworkDevices();
  const createSnapshotMutation = useCreateTopologySnapshot();

  const tabs = [
    { id: 'topology', label: 'Topoloji Haritası', icon: 'Network' },
    { id: 'vlans', label: 'VLAN Yönetimi', icon: 'Layers' },
    { id: 'traffic', label: 'Trafik Akışı', icon: 'Zap' },
    { id: 'speed-test', label: 'Hız Testi', icon: 'Gauge' },
    { id: 'segments', label: 'Ağ Segmentleri', icon: 'Boxes' },
    { id: 'monitoring', label: 'İzleme & Uyarılar', icon: 'Bell' }
  ];

  const handleDiscoverTopology = async () => {
    try {
      const result = await discoverTopologyMutation.mutateAsync();
      alert(`Ağ keşfi tamamlandı: ${result.discovered_nodes.length} cihaz, ${result.discovered_connections.length} bağlantı bulundu`);
    } catch (error) {
      console.error('Topology discovery error:', error);
    }
  };

  const handleAutoLayout = async () => {
    try {
      await autoLayoutMutation.mutateAsync();
      alert('Otomatik düzen uygulandı');
    } catch (error) {
      console.error('Auto layout error:', error);
    }
  };

  const handleSyncDevices = async () => {
    try {
      await syncMutation.mutateAsync();
      alert('Cihazlar topoloji ile senkronize edildi');
    } catch (error) {
      console.error('Sync devices error:', error);
    }
  };

  const handleCreateSnapshot = async () => {
    const snapshotName = `topology-snapshot-${new Date().toISOString().split('T')[0]}`;
    try {
      await createSnapshotMutation.mutateAsync({ 
        name: snapshotName,
        description: 'Manuel topoloji anlık görüntüsü' 
      });
      alert('Topoloji anlık görüntüsü oluşturuldu');
    } catch (error) {
      console.error('Create snapshot error:', error);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'topology':
        return <NetworkTopologyMap />;
      case 'vlans':
        return <VLANManagement />;
      case 'traffic':
        return <TrafficFlowVisualization />;
      case 'speed-test':
        return <SpeedTestManagement />;
      case 'segments':
        return (
          <Card title="Ağ Segmentleri">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { name: 'DMZ', type: 'dmz', description: 'Güvenlik kameraları ve dış erişimli servisler', vlans: [70], color: '#B71C1C' },
                  { name: 'Internal LAN', type: 'internal', description: 'Ana iç ağ segmenti', vlans: [10, 20, 30, 50, 60, 80, 90], color: '#4A90E2' },
                  { name: 'Guest Network', type: 'guest', description: 'Misafir cihazları için izole ağ', vlans: [40], color: '#D0021B' },
                  { name: 'Management', type: 'management', description: 'Ağ yönetimi ve admin cihazları', vlans: [10], color: '#7ED321' },
                  { name: 'Lab Environment', type: 'lab', description: 'Test ve geliştirme ortamı', vlans: [100], color: '#607D8B' }
                ].map((segment) => (
                  <div key={segment.type} className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <div className="flex items-center gap-2 mb-2">
                      <div 
                        className="w-4 h-4 rounded border"
                        style={{ backgroundColor: segment.color }}
                      />
                      <span className="text-white font-medium">{segment.name}</span>
                    </div>
                    <p className="text-white/70 text-sm mb-3">{segment.description}</p>
                    <div className="flex flex-wrap gap-1">
                      {segment.vlans.map(vlanId => (
                        <span key={vlanId} className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs">
                          VLAN {vlanId}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-white/60 text-sm">Ağ segmentleri gelişmiş özellikler yakında...</p>
            </div>
          </Card>
        );
      case 'monitoring':
        return (
          <div className="space-y-6">
            {/* Network Health Overview */}
            <Card title="Ağ Sağlık Durumu">
              <div className="space-y-4">
                {health && (
                  <>
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-4 h-4 rounded-full",
                        health.overall_health === 'healthy' ? "bg-emerald-400" :
                        health.overall_health === 'warning' ? "bg-orange-400" : "bg-red-400"
                      )} />
                      <span className="text-white font-medium">
                        Genel Durum: {health.overall_health === 'healthy' ? 'Sağlıklı' : 
                                     health.overall_health === 'warning' ? 'Uyarı' : 'Kritik'}
                      </span>
                    </div>

                    {health.issues.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-white font-medium">Tespit Edilen Sorunlar:</h4>
                        {health.issues.map((issue, index) => (
                          <div key={index} className={cn(
                            "p-3 rounded-lg border",
                            issue.severity === 'critical' ? "bg-red-500/10 border-red-500/20" :
                            issue.severity === 'warning' ? "bg-orange-500/10 border-orange-500/20" :
                            "bg-blue-500/10 border-blue-500/20"
                          )}>
                            <div className="flex items-center gap-2">
                              <Icons.AlertTriangle className={cn(
                                "w-4 h-4",
                                issue.severity === 'critical' ? "text-red-400" :
                                issue.severity === 'warning' ? "text-orange-400" : "text-blue-400"
                              )} />
                              <span className="text-white text-sm">{issue.message}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {health.recommendations.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-white font-medium">Öneriler:</h4>
                        <ul className="space-y-1">
                          {health.recommendations.map((rec, index) => (
                            <li key={index} className="text-white/70 text-sm flex items-start gap-2">
                              <Icons.Lightbulb className="w-3 h-3 text-yellow-400 mt-0.5 flex-shrink-0" />
                              {rec}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </>
                )}
              </div>
            </Card>

            {/* Alert Rules */}
            <Card title="Uyarı Kuralları">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { name: 'Cihaz Çevrimdışı', type: 'device_offline', description: 'Cihaz 5 dakikadan fazla erişilemez olduğunda', active: true },
                    { name: 'Yüksek Gecikme', type: 'high_latency', description: 'Ping süresi 100ms üzerine çıktığında', active: true },
                    { name: 'Bant Genişliği Aşımı', type: 'bandwidth_exceeded', description: 'VLAN bant limiti aşıldığında', active: false },
                    { name: 'Yeni Cihaz', type: 'new_device', description: 'Ağa yeni cihaz bağlandığında', active: true }
                  ].map((rule) => (
                    <div key={rule.type} className="p-3 bg-white/5 border border-white/10 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white font-medium text-sm">{rule.name}</span>
                        <div className={cn(
                          "w-2 h-2 rounded-full",
                          rule.active ? "bg-emerald-400" : "bg-gray-400"
                        )} />
                      </div>
                      <p className="text-white/60 text-xs mb-2">{rule.description}</p>
                      <Button size="sm" variant="outline" className="w-full">
                        <Icons.Edit className="w-3 h-3 mr-1" />
                        Düzenle
                      </Button>
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="w-full">
                  <Icons.Plus className="w-4 h-4 mr-2" />
                  Yeni Uyarı Kuralı
                </Button>
              </div>
            </Card>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Network Overview Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard
          title="Toplam Cihaz"
          value={stats ? String(stats.total_nodes) : '0'}
          subtitle={`${stats?.online_nodes || 0} çevrimiçi`}
          icon="Monitor"
          status="ok"
        />
        <MetricCard
          title="Aktif Bağlantılar"
          value={stats ? String(stats.active_connections) : '0'}
          subtitle={`${stats?.total_connections || 0} toplam bağlantı`}
          icon="Link"
          status="ok"
        />
        <MetricCard
          title="VLAN Sayısı"
          value={stats ? String(stats.active_vlans) : '0'}
          subtitle={`${stats?.total_vlans || 0} toplam VLAN`}
          icon="Layers"
          status="ok"
        />
        <MetricCard
          title="Ortalama Gecikme"
          value={stats ? `${stats.avg_latency}ms` : '0ms'}
          subtitle="Ağ performansı"
          icon="Gauge"
          status={stats && stats.avg_latency > 50 ? 'warn' : 'ok'}
        />
      </div>

      {/* Network Control Panel */}
      <Card title="Ağ Topolojisi Kontrol Paneli">
        <div className="flex flex-wrap items-center gap-3">
          <Button
            onClick={handleDiscoverTopology}
            isLoading={discoverTopologyMutation.isPending}
            disabled={discoverTopologyMutation.isPending}
          >
            <Icons.Search className="w-4 h-4 mr-2" />
            Ağ Keşfi Başlat
          </Button>
          
          <Button
            variant="outline"
            onClick={handleAutoLayout}
            isLoading={autoLayoutMutation.isPending}
          >
            <Icons.RotateCcw className="w-4 h-4 mr-2" />
            Otomatik Düzen
          </Button>
          
          <Button
            variant="outline"
            onClick={handleSyncDevices}
            isLoading={syncMutation.isPending}
          >
            <Icons.RefreshCw className="w-4 h-4 mr-2" />
            Cihaz Senkronize
          </Button>
          
          <Button
            variant="outline"
            onClick={handleCreateSnapshot}
            isLoading={createSnapshotMutation.isPending}
          >
            <Icons.Camera className="w-4 h-4 mr-2" />
            Snapshot Al
          </Button>
        </div>

        {/* Network Health Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="p-3 rounded-lg bg-white/5 border border-white/10">
            <div className="flex items-center gap-2 mb-2">
              <div className={cn(
                "w-3 h-3 rounded-full",
                health?.overall_health === 'healthy' ? "bg-emerald-400" : 
                health?.overall_health === 'warning' ? "bg-orange-400" : "bg-red-400"
              )} />
              <span className="text-white font-medium">Ağ Durumu</span>
            </div>
            <p className="text-white/60 text-sm">
              {health?.overall_health === 'healthy' ? 'Tüm cihazlar normal çalışıyor' :
               health?.overall_health === 'warning' ? 'Bazı cihazlarda sorun var' : 
               'Kritik ağ sorunları mevcut'}
            </p>
          </div>
          
          <div className="p-3 rounded-lg bg-white/5 border border-white/10">
            <div className="flex items-center gap-2 mb-2">
              <Icons.Activity className="w-4 h-4 text-blue-400" />
              <span className="text-white font-medium">Trafik İzleme</span>
            </div>
            <p className="text-white/60 text-sm">
              {stats ? `${stats.total_bandwidth.toFixed(1)} Mbps aktif trafik` : 'Trafik verisi hazırlanıyor'}
            </p>
          </div>
          
          <div className="p-3 rounded-lg bg-white/5 border border-white/10">
            <div className="flex items-center gap-2 mb-2">
              <Icons.Shield className="w-4 h-4 text-purple-400" />
              <span className="text-white font-medium">Güvenlik</span>
            </div>
            <p className="text-white/60 text-sm">VLAN izolasyonu ve firewall aktif</p>
          </div>
        </div>
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

export default NetworkTopology;