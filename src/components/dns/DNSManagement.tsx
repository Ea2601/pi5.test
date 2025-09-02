import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { MetricCard } from '../cards/MetricCard';
import { TableCard } from '../cards/TableCard';
import { ChartCard } from '../cards/ChartCard';
import { cn } from '../../lib/utils';
import { DNSServerManagement } from './DNSServerManagement';
import { DNSProfileManagement } from './DNSProfileManagement';
import { dnsService } from '../../services/dnsService';

// Mock hooks until Supabase is connected
const useDNSStats = (timeRange: string) => {
  const [data, setData] = React.useState({
    total_queries: 5420,
    blocked_queries: 1250,
    cache_hit_ratio: 0.85,
    average_response_time: 18,
    top_domains: [
      { domain: 'google.com', count: 120 },
      { domain: 'youtube.com', count: 95 },
      { domain: 'github.com', count: 78 }
    ],
    top_blocked_domains: [
      { domain: 'ads.example.com', count: 45 },
      { domain: 'tracker.bad.com', count: 32 }
    ],
    queries_by_type: { A: 4200, AAAA: 800, CNAME: 320, MX: 100 },
    queries_by_device: {}
  });
  return { data, isLoading: false };
};

const useDNSHealthCheck = () => {
  const [data, setData] = React.useState({
    overall_health: true,
    server_health: [
      { server: 'Cloudflare Primary', healthy: true, response_time: 15, error: null },
      { server: 'Google DNS', healthy: true, response_time: 22, error: null }
    ],
    total_servers: 2,
    active_servers: 2
  });
  return { data };
};

const useApplyDNSConfiguration = () => {
  return {
    mutateAsync: async () => ({ success: true, errors: [] }),
    isPending: false
  };
};

const useFlushDNSCache = () => {
  return {
    mutateAsync: async () => {
      console.log('DNS cache flushed');
      return true;
    },
    isPending: false
  };
};

const DNSManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState('servers');
  
  const { data: stats, isLoading: statsLoading } = useDNSStats('24h');
  const { data: health } = useDNSHealthCheck();
  const applyConfigMutation = useApplyDNSConfiguration();
  const flushCacheMutation = useFlushDNSCache();

  const tabs = [
    { id: 'servers', label: 'DNS Sunucuları', icon: 'Globe' },
    { id: 'profiles', label: 'Güvenlik Profilleri', icon: 'Shield' },
    { id: 'zones', label: 'İç Ağ Alanları', icon: 'Home' },
    { id: 'assignments', label: 'Cihaz Atamaları', icon: 'Users' },
    { id: 'logs', label: 'Sorgu Logları', icon: 'FileText' },
    { id: 'cache', label: 'Önbellek Ayarları', icon: 'Database' }
  ];

  const handleApplyConfiguration = async () => {
    try {
      const result = await applyConfigMutation.mutateAsync();
      if (result.success) {
        console.log('DNS yapılandırması başarıyla uygulandı');
      } else {
        console.error(`Yapılandırma hatası: ${result.errors.join(', ')}`);
      }
    } catch (error) {
      console.error('Apply configuration error:', error);
    }
  };

  const handleFlushCache = async () => {
    try {
      const success = await flushCacheMutation.mutateAsync();
      if (success) {
        console.log('DNS önbelleği temizlendi');
      } else {
        console.error('Önbellek temizleme başarısız');
      }
    } catch (error) {
      console.error('Flush cache error:', error);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'servers':
        return <DNSServerManagement />;
      case 'profiles':
        return <DNSProfileManagement />;
      case 'zones':
        return (
          <Card title="İç Ağ Alan Adları (Internal Zones)">
            <div className="space-y-4">
              <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <h4 className="text-blue-400 font-medium mb-2">Internal Zone Management</h4>
                <p className="text-white/80 text-sm mb-3">
                  Ev/iş içi servisler için özel alan adları tanımlayın (örn: nas.local, printer.home)
                </p>
                <Button variant="outline" className="w-full">
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" 
                         width="24" height="24" viewBox="0 0 24 24" 
                         fill="none" stroke="currentColor" strokeWidth="2" 
                         strokeLinecap="round" strokeLinejoin="round" 
                         className="w-4 h-4 mr-2">
                      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                      <polyline points="3.29,7 12,12 20.71,7"/>
                      <line x1="12" x2="12" y1="22" y2="12"/>
                    </svg>
                    <span className="truncate">Zone Yapılandırması</span>
                  </div>
                </Button>
              </div>
              <p className="text-white/60 text-sm">Bu özellik geliştirme aşamasında...</p>
            </div>
          </Card>
        );
      case 'assignments':
        return (
          <Card title="Cihaz Bazlı DNS Atamaları">
            <div className="space-y-4">
              <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                <h4 className="text-purple-400 font-medium mb-2">Device-Based DNS Assignment</h4>
                <p className="text-white/80 text-sm mb-3">
                  MAC adresine göre özel DNS profilleri atayın (örn: çocuk cihazları → aile güvenli DNS)
                </p>
                <Button variant="outline" className="w-full">
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" 
                         width="24" height="24" viewBox="0 0 24 24" 
                         fill="none" stroke="currentColor" strokeWidth="2" 
                         strokeLinecap="round" strokeLinejoin="round" 
                         className="w-4 h-4 mr-2">
                      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                      <circle cx="9" cy="7" r="4"/>
                      <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
                      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                    </svg>
                    <span className="truncate">Cihaz Ataması Yap</span>
                  </div>
                </Button>
              </div>
              <p className="text-white/60 text-sm">Bu özellik geliştirme aşamasında...</p>
            </div>
          </Card>
        );
      case 'logs':
        return (
          <div className="space-y-6">
            {/* Query Statistics */}
            {stats && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <MetricCard
                  title="Toplam Sorgu"
                  value={String(stats.total_queries)}
                  subtitle="Son 24 saat"
                  icon="BarChart3"
                  status="ok"
                />
                <MetricCard
                  title="Engellenen Sorgular"
                  value={String(stats.blocked_queries)}
                  subtitle={`${((stats.blocked_queries / stats.total_queries) * 100 || 0).toFixed(1)}% oranında`}
                  icon="Shield"
                  status="warn"
                />
                <MetricCard
                  title="Ortalama Yanıt Süresi"
                  value={`${stats.average_response_time.toFixed(0)}ms`}
                  subtitle="DNS çözümleme"
                  icon="Gauge"
                  status="ok"
                />
                <MetricCard
                  title="Cache Hit Oranı"
                  value={`${(stats.cache_hit_ratio * 100).toFixed(1)}%`}
                  subtitle="Önbellek verimliliği"
                  icon="Database"
                  status="ok"
                />
              </div>
            )}

            {/* Top Domains Tables */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card title="En Çok Sorgulanan Domain'ler">
                <div className="space-y-2">
                  {stats?.top_domains.slice(0, 10).map((domain, index) => (
                    <div key={domain.domain} className="flex items-center justify-between p-2 rounded-lg bg-white/5">
                      <div className="flex items-center gap-2">
                        <span className="text-emerald-400 font-mono text-sm">{index + 1}</span>
                        <span className="text-white text-sm">{domain.domain}</span>
                      </div>
                      <span className="text-white/60 text-sm">{domain.count}</span>
                    </div>
                  )) || []}
                </div>
              </Card>

              <Card title="En Çok Engellenen Domain'ler">
                <div className="space-y-2">
                  {stats?.top_blocked_domains.slice(0, 10).map((domain, index) => (
                    <div key={domain.domain} className="flex items-center justify-between p-2 rounded-lg bg-red-500/5 border border-red-500/10">
                      <div className="flex items-center gap-2">
                        <span className="text-red-400 font-mono text-sm">{index + 1}</span>
                        <span className="text-white text-sm">{domain.domain}</span>
                      </div>
                      <span className="text-red-400 text-sm">{domain.count}</span>
                    </div>
                  )) || []}
                </div>
              </Card>
            </div>
          </div>
        );
      case 'cache':
        return (
          <Card title="DNS Önbellek Yönetimi">
            <div className="space-y-6">
              {/* Cache Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                  <h4 className="text-white font-medium mb-2">Önbellek Boyutu</h4>
                  <p className="text-white text-2xl font-bold">100 MB</p>
                  <p className="text-white/60 text-sm">Maksimum bellek kullanımı</p>
                </div>
                <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                  <h4 className="text-white font-medium mb-2">Varsayılan TTL</h4>
                  <p className="text-white text-2xl font-bold">1 saat</p>
                  <p className="text-white/60 text-sm">Cache saklama süresi</p>
                </div>
                <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                  <h4 className="text-white font-medium mb-2">Hit Oranı</h4>
                  <p className="text-white text-2xl font-bold">{stats ? (stats.cache_hit_ratio * 100).toFixed(1) : 0}%</p>
                  <p className="text-white/60 text-sm">Önbellekten yanıt</p>
                </div>
              </div>

              {/* Cache Actions */}
              <div className="flex items-center gap-3">
                <Button
                  onClick={handleFlushCache}
                  isLoading={flushCacheMutation.isPending}
                  disabled={flushCacheMutation.isPending}
                >
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" 
                         width="24" height="24" viewBox="0 0 24 24" 
                         fill="none" stroke="currentColor" strokeWidth="2" 
                         strokeLinecap="round" strokeLinejoin="round" 
                         className="w-4 h-4 mr-2">
                      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
                      <path d="M21 3v5h-5"/>
                      <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
                      <path d="M8 16H3v5"/>
                    </svg>
                    <span className="truncate">Önbelleği Temizle</span>
                  </div>
                </Button>
                <Button variant="outline">
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" 
                         width="24" height="24" viewBox="0 0 24 24" 
                         fill="none" stroke="currentColor" strokeWidth="2" 
                         strokeLinecap="round" strokeLinejoin="round" 
                         className="w-4 h-4 mr-2">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/>
                      <path d="M9 12l2 2 4-4"/>
                    </svg>
                    <span className="truncate">Ayarları Kaydet</span>
                  </div>
                </Button>
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
      {/* DNS Health Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard
          title="DNS Sunucuları"
          value={health ? `${health.active_servers} / ${health.total_servers}` : '0 / 0'}
          subtitle="Aktif sunucular"
          icon="Globe"
          status={health?.overall_health ? 'ok' : 'warn'}
        />
        <MetricCard
          title="Ortalama Yanıt Süresi"
          value={stats ? `${stats.average_response_time.toFixed(0)}ms` : '0ms'}
          subtitle="DNS çözümleme"
          icon="Gauge"
          status="ok"
        />
        <MetricCard
          title="Engelleme Oranı"
          value={stats ? `${((stats.blocked_queries / stats.total_queries) * 100 || 0).toFixed(1)}%` : '0%'}
          subtitle="Filtrelenen sorgular"
          icon="Shield"
          status="ok"
        />
        <MetricCard
          title="Cache Verimliliği"
          value={stats ? `${(stats.cache_hit_ratio * 100).toFixed(1)}%` : '0%'}
          subtitle="Önbellek hit oranı"
          icon="Database"
          status="ok"
        />
      </div>

      {/* DNS Control Panel */}
      <Card title="DNS Kontrol Paneli">
        <div className="flex items-center gap-3 mb-6">
          <Button
            onClick={handleApplyConfiguration}
            isLoading={applyConfigMutation.isPending}
            disabled={applyConfigMutation.isPending}
          >
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" 
                   width="24" height="24" viewBox="0 0 24 24" 
                   fill="none" stroke="currentColor" strokeWidth="2" 
                   strokeLinecap="round" strokeLinejoin="round" 
                   className="w-4 h-4 mr-2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/>
                <path d="M9 12l2 2 4-4"/>
              </svg>
              <span className="truncate">Yapılandırmayı Uygula</span>
            </div>
          </Button>
          <Button
            variant="outline"
            onClick={handleFlushCache}
            isLoading={flushCacheMutation.isPending}
          >
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" 
                   width="24" height="24" viewBox="0 0 24 24" 
                   fill="none" stroke="currentColor" strokeWidth="2" 
                   strokeLinecap="round" strokeLinejoin="round" 
                   className="w-4 h-4 mr-2">
                <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
                <path d="M21 3v5h-5"/>
                <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
                <path d="M8 16H3v5"/>
              </svg>
              <span className="truncate">Cache Temizle</span>
            </div>
          </Button>
          <Button variant="outline">
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" 
                   width="24" height="24" viewBox="0 0 24 24" 
                   fill="none" stroke="currentColor" strokeWidth="2" 
                   strokeLinecap="round" strokeLinejoin="round" 
                   className="w-4 h-4 mr-2">
                <path d="M14.5 2v17.5c0 1.4-1.1 2.5-2.5 2.5s-2.5-1.1-2.5-2.5V2"/>
                <path d="M8.5 2h7"/>
                <path d="M14.5 16a2.5 2.5 0 0 1-5 0v-4"/>
              </svg>
              <span className="truncate">Bağlantı Testi</span>
            </div>
          </Button>
        </div>

        {/* DNS Status Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-3 rounded-lg bg-white/5 border border-white/10">
            <div className="flex items-center gap-2 mb-2">
              <div className={cn(
                "w-3 h-3 rounded-full",
                health?.overall_health ? "bg-emerald-400" : "bg-red-400"
              )} />
              <span className="text-white font-medium">DNS Durumu</span>
            </div>
            <p className="text-white/60 text-sm">
              {health?.overall_health ? 'Tüm sunucular çalışıyor' : 'Bazı sunucular erişilemiyor'}
            </p>
          </div>
          
          <div className="p-3 rounded-lg bg-white/5 border border-white/10">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 bg-blue-400 rounded-full" />
              <span className="text-white font-medium">DNSSEC</span>
            </div>
            <p className="text-white/60 text-sm">DNS güvenlik imzalaması aktif</p>
          </div>
          
          <div className="p-3 rounded-lg bg-white/5 border border-white/10">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 bg-purple-400 rounded-full" />
              <span className="text-white font-medium">DoH/DoT</span>
            </div>
            <p className="text-white/60 text-sm">Şifreli DNS sorguları etkin</p>
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <div className="flex space-x-1 bg-white/5 p-1 rounded-2xl backdrop-blur-sm border border-white/10 overflow-x-auto">
        {tabs.map((tab) => {
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
              <div className="w-4 h-4">
                {tab.icon === 'Globe' && (
                  <svg xmlns="http://www.w3.org/2000/svg" 
                       width="24" height="24" viewBox="0 0 24 24" 
                       fill="none" stroke="currentColor" strokeWidth="2" 
                       strokeLinecap="round" strokeLinejoin="round" 
                       className="w-4 h-4">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/>
                    <path d="M2 12h20"/>
                  </svg>
                )}
                {tab.icon === 'Shield' && (
                  <svg xmlns="http://www.w3.org/2000/svg" 
                       width="24" height="24" viewBox="0 0 24 24" 
                       fill="none" stroke="currentColor" strokeWidth="2" 
                       strokeLinecap="round" strokeLinejoin="round" 
                       className="w-4 h-4">
                    <path d="M20 13c0 5-3.5 7.5-8 7.5s-8-2.5-8-7.5c0-1.3.3-2.5.8-3.5.5-1 1.2-1.9 2.2-2.6 1-0.7 2.2-1.2 3.5-1.5 1.3-0.3 2.7-0.3 4 0 1.3 0.3 2.5 0.8 3.5 1.5 1 0.7 1.7 1.6 2.2 2.6.5 1 .8 2.2.8 3.5z"/>
                  </svg>
                )}
                {tab.icon === 'Home' && (
                  <svg xmlns="http://www.w3.org/2000/svg" 
                       width="24" height="24" viewBox="0 0 24 24" 
                       fill="none" stroke="currentColor" strokeWidth="2" 
                       strokeLinecap="round" strokeLinejoin="round" 
                       className="w-4 h-4">
                    <path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/>
                    <path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                  </svg>
                )}
                {tab.icon === 'Users' && (
                  <svg xmlns="http://www.w3.org/2000/svg" 
                       width="24" height="24" viewBox="0 0 24 24" 
                       fill="none" stroke="currentColor" strokeWidth="2" 
                       strokeLinecap="round" strokeLinejoin="round" 
                       className="w-4 h-4">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                    <circle cx="9" cy="7" r="4"/>
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                  </svg>
                )}
                {tab.icon === 'FileText' && (
                  <svg xmlns="http://www.w3.org/2000/svg" 
                       width="24" height="24" viewBox="0 0 24 24" 
                       fill="none" stroke="currentColor" strokeWidth="2" 
                       strokeLinecap="round" strokeLinejoin="round" 
                       className="w-4 h-4">
                    <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/>
                    <path d="M14 2v4a2 2 0 0 0 2 2h4"/>
                    <path d="M10 9H8"/>
                    <path d="M16 13H8"/>
                    <path d="M16 17H8"/>
                  </svg>
                )}
                {tab.icon === 'Database' && (
                  <svg xmlns="http://www.w3.org/2000/svg" 
                       width="24" height="24" viewBox="0 0 24 24" 
                       fill="none" stroke="currentColor" strokeWidth="2" 
                       strokeLinecap="round" strokeLinejoin="round" 
                       className="w-4 h-4">
                    <ellipse cx="12" cy="5" rx="9" ry="3"/>
                    <path d="M3 5v14a9 3 0 0 0 18 0V5"/>
                    <path d="M3 12a9 3 0 0 0 18 0"/>
                  </svg>
                )}
              </div>
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

export default DNSManagement;