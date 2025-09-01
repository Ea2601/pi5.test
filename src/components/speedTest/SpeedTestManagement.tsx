import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as Icons from 'lucide-react';
import { Card } from '../ui/Card';
import { MetricCard } from '../cards/MetricCard';
import { cn } from '../../lib/utils';
import { SpeedTestDashboard } from './SpeedTestDashboard';
import { DNSPingMonitor } from './DNSPingMonitor';
import { useSpeedTestStats } from '../../hooks/api/useSpeedTest';

const SpeedTestManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { data: stats } = useSpeedTestStats('24h');

  const tabs = [
    { id: 'dashboard', label: 'Hız Testi', icon: 'Zap' },
    { id: 'dns-monitor', label: 'DNS Ping İzleme', icon: 'Globe' },
    { id: 'profiles', label: 'Test Profilleri', icon: 'Settings' },
    { id: 'servers', label: 'Sunucu Yönetimi', icon: 'Server' },
    { id: 'schedules', label: 'Otomatik Testler', icon: 'Clock' },
    { id: 'alerts', label: 'Uyarılar', icon: 'Bell' }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <SpeedTestDashboard />;
      case 'dns-monitor':
        return <DNSPingMonitor />;
      case 'profiles':
        return (
          <Card title="Test Profilleri Yönetimi">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  {
                    name: 'Hızlı Test',
                    type: 'fast',
                    duration: '15 saniye',
                    description: 'Hızlı genel bağlantı kontrolü',
                    color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                  },
                  {
                    name: 'Dengeli Test',
                    type: 'balanced',
                    duration: '30 saniye',
                    description: 'Dengeli performans ve doğruluk',
                    color: 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                  },
                  {
                    name: 'Derin Analiz',
                    type: 'deep_analysis',
                    duration: '60 saniye',
                    description: 'Kapsamlı QoE analizi',
                    color: 'bg-purple-500/20 text-purple-400 border-purple-500/30'
                  }
                ].map((profile) => (
                  <div key={profile.type} className={cn("p-4 rounded-xl border", profile.color)}>
                    <div className="flex items-center gap-2 mb-2">
                      <Icons.Settings className="w-4 h-4" />
                      <span className="text-white font-medium">{profile.name}</span>
                    </div>
                    <p className="text-white/70 text-sm mb-2">{profile.description}</p>
                    <p className="text-white/60 text-xs">Test Süresi: {profile.duration}</p>
                  </div>
                ))}
              </div>
              <p className="text-white/60 text-sm">Test profili yönetimi yakında...</p>
            </div>
          </Card>
        );
      case 'servers':
        return (
          <Card title="Sunucu Yönetimi">
            <div className="space-y-4">
              <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <h4 className="text-blue-400 font-medium mb-2">Sunucu Keşfi</h4>
                <p className="text-white/80 text-sm mb-3">
                  Ookla directory, NDT7/MLab ve özel sunucu listelerini keşfedin
                </p>
                <div className="flex gap-2">
                  <button className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm hover:bg-white/20 transition-all">
                    Ookla Sunucuları Keşfet
                  </button>
                  <button className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm hover:bg-white/20 transition-all">
                    MLab Sunucuları
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { name: 'Türkiye - İstanbul', country: 'TR', ping: '15ms', sponsor: 'Türk Telekom' },
                  { name: 'UAE - Dubai', country: 'AE', ping: '25ms', sponsor: 'Etisalat' },
                  { name: 'Germany - Frankfurt', country: 'DE', ping: '45ms', sponsor: 'Deutsche Telekom' },
                  { name: 'Turkey - Ankara', country: 'TR', ping: '20ms', sponsor: 'TTNet' }
                ].map((server) => (
                  <div key={server.name} className="p-3 bg-white/5 border border-white/10 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white font-medium text-sm">{server.name}</span>
                      <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded text-xs">
                        {server.ping}
                      </span>
                    </div>
                    <p className="text-white/60 text-xs">{server.sponsor}</p>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        );
      case 'schedules':
        return (
          <Card title="Otomatik Test Zamanlaması">
            <div className="space-y-4">
              <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                <h4 className="text-orange-400 font-medium mb-2">Zamanlama Seçenekleri</h4>
                <p className="text-white/80 text-sm mb-3">
                  Saatlik, günlük ve yoğun saat öncesi/sonrası otomatik testler
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="p-3 bg-white/5 rounded border border-white/10">
                    <h5 className="text-white font-medium text-sm mb-1">Günlük Test</h5>
                    <p className="text-white/60 text-xs">Her gün 06:00 ve 22:00</p>
                  </div>
                  <div className="p-3 bg-white/5 rounded border border-white/10">
                    <h5 className="text-white font-medium text-sm mb-1">Saatlik Kontrol</h5>
                    <p className="text-white/60 text-xs">Hızlı ping ve throughput</p>
                  </div>
                </div>
              </div>
              <p className="text-white/60 text-sm">Otomatik zamanlama yakında...</p>
            </div>
          </Card>
        );
      case 'alerts':
        return (
          <Card title="Uyarı Sistemi">
            <div className="space-y-4">
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                <h4 className="text-red-400 font-medium mb-2">Uyarı Kuralları</h4>
                <p className="text-white/80 text-sm mb-3">
                  Hız, gecikme ve paket kaybı eşik aşımlarında otomatik bildirim
                </p>
                <div className="space-y-2">
                  {[
                    { metric: 'Download < 50 Mbps', action: 'Telegram bildirimi', status: 'Aktif' },
                    { metric: 'Ping > 100ms', action: 'WG tünel değiştir', status: 'Aktif' },
                    { metric: 'Packet Loss > 5%', action: 'DNS sunucu değiştir', status: 'Pasif' }
                  ].map((rule, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-white/5 rounded">
                      <span className="text-white text-sm">{rule.metric}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-white/60 text-xs">{rule.action}</span>
                        <span className={cn(
                          "px-2 py-1 rounded text-xs",
                          rule.status === 'Aktif' ? "bg-emerald-500/20 text-emerald-400" : "bg-gray-500/20 text-gray-400"
                        )}>
                          {rule.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <p className="text-white/60 text-sm">Uyarı sistemi yakında...</p>
            </div>
          </Card>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Ağ Hız Testi ve İzleme</h2>
          <p className="text-white/70 text-sm">İnternet hızı, gecikme analizi ve DNS ping izleme</p>
        </div>
      </div>

      {/* Overview Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard
          title="Son İndirme Hızı"
          value={stats ? `${stats.avg_download_mbps.toFixed(1)} Mbps` : '0 Mbps'}
          subtitle="Ortalama performans"
          icon="Download"
          status="ok"
        />
        <MetricCard
          title="Son Yükleme Hızı"
          value={stats ? `${stats.avg_upload_mbps.toFixed(1)} Mbps` : '0 Mbps'}
          subtitle="Ortalama performans"
          icon="Upload"
          status="ok"
        />
        <MetricCard
          title="Ortalama Gecikme"
          value={stats ? `${stats.avg_ping_ms.toFixed(0)} ms` : '0 ms'}
          subtitle="Ping response time"
          icon="Clock"
          status={stats && stats.avg_ping_ms < 50 ? 'ok' : 'warn'}
        />
        <MetricCard
          title="Test Sayısı"
          value={String(stats?.total_tests || 0)}
          subtitle={`${stats?.successful_tests || 0} başarılı`}
          icon="BarChart3"
          status="ok"
        />
      </div>

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

export default SpeedTestManagement;