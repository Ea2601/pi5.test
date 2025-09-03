/**
 * Module Manager UI Component
 * Manage installed modules, marketplace, and system updates
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as Icons from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { MetricCard } from '../cards/MetricCard';
import { Modal } from '../ui/Modal';
import { cn } from '../../lib/utils';
import { moduleManager, ModuleInterface, ModuleStatus } from '../../core/ModuleManager';
import { moduleRegistry } from '../../core/ModuleRegistry';
import { moduleMarketplace, MarketplaceModule } from '../../core/ModuleMarketplace';
import { performanceOptimizer } from '../../core/PerformanceOptimizer';
import { ModuleMarketplace as MarketplaceComponent } from '../marketplace/ModuleMarketplace';

export const ModuleManagerComponent: React.FC = () => {
  const [activeTab, setActiveTab] = useState('installed');
  const [installedModules, setInstalledModules] = useState<ModuleInterface[]>([]);
  const [moduleStatuses, setModuleStatuses] = useState<Record<string, ModuleStatus>>({});
  const [marketplaceModules, setMarketplaceModules] = useState<MarketplaceModule[]>([]);
  const [performanceReport, setPerformanceReport] = useState<any>(null);
  const [showMarketplace, setShowMarketplace] = useState(false);
  const [selectedModule, setSelectedModule] = useState<ModuleInterface | null>(null);

  const tabs = [
    { id: 'installed', label: 'Yüklü Modüller', icon: 'Package' },
    { id: 'marketplace', label: 'Marketplace', icon: 'Store' },
    { id: 'performance', label: 'Performans', icon: 'Zap' },
    { id: 'updates', label: 'Güncellemeler', icon: 'Download' }
  ];

  useEffect(() => {
    refreshModuleData();
    
    // Refresh every 30 seconds
    const interval = setInterval(refreshModuleData, 30000);
    return () => clearInterval(interval);
  }, []);

  const refreshModuleData = async () => {
    try {
      // Get installed modules
      const modules = moduleManager.getAllModules();
      setInstalledModules(modules);

      // Get module statuses
      const statuses: Record<string, ModuleStatus> = {};
      for (const module of modules) {
        statuses[module.manifest.id] = module.getStatus();
      }
      setModuleStatuses(statuses);

      // Get performance report
      const perfReport = performanceOptimizer.getPerformanceReport();
      setPerformanceReport(perfReport);

      // Get marketplace modules
      const marketplace = await moduleMarketplace.discoverModules();
      setMarketplaceModules(marketplace);
    } catch (error) {
      console.error('Failed to refresh module data:', error);
    }
  };

  const handleStartModule = async (moduleId: string) => {
    try {
      await moduleManager.startModule(moduleId);
      await refreshModuleData();
      console.log(`Module started: ${moduleId}`);
    } catch (error) {
      console.error('Failed to start module:', error);
    }
  };

  const handleStopModule = async (moduleId: string) => {
    try {
      await moduleManager.stopModule(moduleId);
      await refreshModuleData();
      console.log(`Module stopped: ${moduleId}`);
    } catch (error) {
      console.error('Failed to stop module:', error);
    }
  };

  const handleReloadModule = async (moduleId: string) => {
    try {
      await moduleManager.stopModule(moduleId);
      await moduleManager.startModule(moduleId);
      await refreshModuleData();
      console.log(`Module reloaded: ${moduleId}`);
    } catch (error) {
      console.error('Failed to reload module:', error);
    }
  };

  const handleUninstallModule = async (moduleId: string) => {
    const confirmed = window.confirm(`${moduleId} modülünü kaldırmak istediğinizden emin misiniz?`);
    if (!confirmed) return;

    try {
      await moduleManager.unloadModule(moduleId);
      await refreshModuleData();
      console.log(`Module uninstalled: ${moduleId}`);
    } catch (error) {
      console.error('Failed to uninstall module:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'bg-emerald-400';
      case 'ready': return 'bg-blue-400';
      case 'error': return 'bg-red-400';
      case 'stopped': return 'bg-gray-400';
      default: return 'bg-orange-400';
    }
  };

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'healthy': return 'text-emerald-400';
      case 'degraded': return 'text-orange-400';
      case 'unhealthy': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const ModuleCard: React.FC<{ module: ModuleInterface }> = ({ module }) => {
    const status = moduleStatuses[module.manifest.id];
    
    return (
      <Card className="h-full">
        <div className="space-y-4">
          {/* Module Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center",
                status?.status === 'running' ? "bg-emerald-500/20 border border-emerald-500/30" :
                status?.status === 'ready' ? "bg-blue-500/20 border border-blue-500/30" :
                status?.status === 'error' ? "bg-red-500/20 border border-red-500/30" :
                "bg-gray-500/20 border border-gray-500/30"
              )}>
                <Icons.Package className={cn(
                  "w-5 h-5",
                  status?.status === 'running' ? "text-emerald-400" :
                  status?.status === 'ready' ? "text-blue-400" :
                  status?.status === 'error' ? "text-red-400" : "text-gray-400"
                )} />
              </div>
              <div>
                <h4 className="text-white font-semibold">{module.manifest.name}</h4>
                <p className="text-white/60 text-sm">v{module.manifest.version}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className={cn("w-2 h-2 rounded-full", getStatusColor(status?.status || 'loading'))} />
              <span className={cn("text-xs", getHealthColor(status?.health || 'unknown'))}>
                {status?.health === 'healthy' ? 'Sağlıklı' :
                 status?.health === 'degraded' ? 'Kısmi' :
                 status?.health === 'unhealthy' ? 'Sorunlu' : 'Bilinmiyor'}
              </span>
            </div>
          </div>

          {/* Module Info */}
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-white/60">Kategori:</span>
              <span className="text-white capitalize">{module.manifest.category}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/60">Durum:</span>
              <span className={cn(
                "font-medium",
                status?.status === 'running' ? "text-emerald-400" :
                status?.status === 'ready' ? "text-blue-400" :
                status?.status === 'error' ? "text-red-400" : "text-orange-400"
              )}>
                {status?.status === 'running' ? 'Çalışıyor' :
                 status?.status === 'ready' ? 'Hazır' :
                 status?.status === 'error' ? 'Hata' :
                 status?.status === 'stopped' ? 'Durduruldu' : 'Yükleniyor'}
              </span>
            </div>
          </div>

          <p className="text-white/70 text-sm">{module.manifest.description}</p>

          {/* Error Display */}
          {status?.lastError && (
            <div className="p-2 bg-red-500/10 border border-red-500/20 rounded text-xs">
              <span className="text-red-400">Hata: {status.lastError}</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2 pt-3 border-t border-white/10">
            {status?.status === 'running' ? (
              <Button size="sm" variant="destructive" onClick={() => handleStopModule(module.manifest.id)} className="flex-1">
                <Icons.Square className="w-3 h-3 mr-1" />
                Durdur
              </Button>
            ) : status?.status === 'stopped' || status?.status === 'ready' ? (
              <Button size="sm" onClick={() => handleStartModule(module.manifest.id)} className="flex-1">
                <Icons.Play className="w-3 h-3 mr-1" />
                Başlat
              </Button>
            ) : (
              <Button size="sm" variant="outline" disabled className="flex-1">
                <Icons.Loader className="w-3 h-3 mr-1 animate-spin" />
                Yükleniyor
              </Button>
            )}
            
            <Button size="sm" variant="outline" onClick={() => handleReloadModule(module.manifest.id)}>
              <Icons.RefreshCw className="w-3 h-3" />
            </Button>
            <Button size="sm" variant="outline" onClick={() => setSelectedModule(module)}>
              <Icons.Eye className="w-3 h-3" />
            </Button>
            <Button size="sm" variant="destructive" onClick={() => handleUninstallModule(module.manifest.id)}>
              <Icons.Trash2 className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Module System Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard
          title="Yüklü Modüller"
          value={String(installedModules.length)}
          subtitle="Aktif sistem modülleri"
          icon="Package"
          status="ok"
        />
        <MetricCard
          title="Çalışan Modüller"
          value={String(Object.values(moduleStatuses).filter(s => s.status === 'running').length)}
          subtitle="Aktif olarak çalışan"
          icon="Play"
          status="ok"
        />
        <MetricCard
          title="Marketplace"
          value={String(marketplaceModules.length)}
          subtitle="Mevcut ek modüller"
          icon="Store"
          status="ok"
        />
        <MetricCard
          title="Sistem Sağlığı"
          value={Object.values(moduleStatuses).every(s => s.health === 'healthy') ? 'Sağlıklı' : 'Kısmi'}
          subtitle="Modül durumu"
          icon="Heart"
          status={Object.values(moduleStatuses).every(s => s.health === 'healthy') ? 'ok' : 'warn'}
        />
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-white/5 p-1 rounded-2xl backdrop-blur-sm border border-white/10">
        {tabs.map((tab) => {
          const IconComponent = Icons[tab.icon as keyof typeof Icons] as React.ComponentType<any>;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "relative flex items-center gap-2 px-6 py-3 rounded-xl transition-all duration-300 font-medium",
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
          {activeTab === 'installed' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-white">Yüklü Modüller</h3>
                  <p className="text-white/70 text-sm">Sistem modüllerini yönetin</p>
                </div>
                <Button onClick={refreshModuleData}>
                  <Icons.RefreshCw className="w-4 h-4 mr-2" />
                  Yenile
                </Button>
              </div>

              {installedModules.length === 0 ? (
                <Card>
                  <div className="text-center py-12">
                    <Icons.Package className="w-16 h-16 text-white/30 mx-auto mb-4" />
                    <h3 className="text-white font-semibold mb-2">Henüz modül yüklenmemiş</h3>
                    <p className="text-white/60 mb-4">Marketplace'den modülleri yükleyebilirsiniz</p>
                    <Button onClick={() => setShowMarketplace(true)}>
                      <Icons.Store className="w-4 h-4 mr-2" />
                      Marketplace'i Aç
                    </Button>
                  </div>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {installedModules.map((module) => (
                    <ModuleCard key={module.manifest.id} module={module} />
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'marketplace' && (
            <div className="space-y-6">
              <MarketplaceComponent />
            </div>
          )}

          {activeTab === 'performance' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-white">Modül Performansı</h3>
                <p className="text-white/70 text-sm">Sistem performansı ve optimizasyon</p>
              </div>

              {performanceReport && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <MetricCard
                    title="Cache Hit Oranı"
                    value={`${(performanceReport.cacheHitRatio * 100).toFixed(1)}%`}
                    subtitle="Modül cache verimliliği"
                    icon="Database"
                    status={performanceReport.cacheHitRatio > 0.8 ? 'ok' : 'warn'}
                  />
                  <MetricCard
                    title="Ortalama Yükleme Süresi"
                    value={`${Math.round(Object.values(performanceReport.moduleLoadTime).reduce((acc: number, time: any) => acc + time, 0) / Math.max(Object.keys(performanceReport.moduleLoadTime).length, 1))}ms`}
                    subtitle="Modül başlatma süresi"
                    icon="Clock"
                    status="ok"
                  />
                  <MetricCard
                    title="Toplam Bundle Boyutu"
                    value={`${(performanceReport.bundleSize / 1024 / 1024).toFixed(1)} MB`}
                    subtitle="JavaScript bundle"
                    icon="Package"
                    status={performanceReport.bundleSize < 1024 * 1024 ? 'ok' : 'warn'}
                  />
                  <MetricCard
                    title="API Yanıt Süresi"
                    value={`${Math.round(Object.values(performanceReport.apiResponseTime).reduce((acc: number, time: any) => acc + time, 0) / Math.max(Object.keys(performanceReport.apiResponseTime).length, 1))}ms`}
                    subtitle="Ortalama API gecikme"
                    icon="Zap"
                    status="ok"
                  />
                </div>
              )}

              {/* Performance Recommendations */}
              {performanceReport && performanceReport.recommendations.length > 0 && (
                <Card title="Performans Önerileri">
                  <div className="space-y-2">
                    {performanceReport.recommendations.map((rec: string, index: number) => (
                      <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                        <Icons.Lightbulb className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                        <span className="text-white/80 text-sm">{rec}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </div>
          )}

          {activeTab === 'updates' && (
            <Card title="Modül Güncellemeleri">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Button>
                    <Icons.Download className="w-4 h-4 mr-2" />
                    Tüm Güncellemeleri Kontrol Et
                  </Button>
                  <Button variant="outline">
                    <Icons.Settings className="w-4 h-4 mr-2" />
                    Otomatik Güncelleme Ayarları
                  </Button>
                </div>

                <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Icons.CheckCircle className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-400 font-medium">Tüm Modüller Güncel</span>
                  </div>
                  <p className="text-white/80 text-sm">
                    Son kontrol: {new Date().toLocaleString('tr-TR')} • Güncellemeler otomatik kontrol ediliyor
                  </p>
                </div>
              </div>
            </Card>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Module Detail Modal */}
      {selectedModule && (
        <Modal
          isOpen={!!selectedModule}
          onClose={() => setSelectedModule(null)}
          title={selectedModule.manifest.name}
          size="lg"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-white font-semibold mb-2">Modül Bilgileri</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-white/60">ID:</span>
                    <span className="text-white font-mono">{selectedModule.manifest.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">Sürüm:</span>
                    <span className="text-white">{selectedModule.manifest.version}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">Kategori:</span>
                    <span className="text-white">{selectedModule.manifest.category}</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="text-white font-semibold mb-2">Durum Bilgileri</h4>
                <div className="space-y-2 text-sm">
                  {moduleStatuses[selectedModule.manifest.id] && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-white/60">Durum:</span>
                        <span className={getHealthColor(moduleStatuses[selectedModule.manifest.id].health)}>
                          {moduleStatuses[selectedModule.manifest.id].status}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60">Sağlık:</span>
                        <span className={getHealthColor(moduleStatuses[selectedModule.manifest.id].health)}>
                          {moduleStatuses[selectedModule.manifest.id].health}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-2">Açıklama</h4>
              <p className="text-white/70 text-sm">{selectedModule.manifest.description}</p>
            </div>

            {selectedModule.manifest.dependencies.length > 0 && (
              <div>
                <h4 className="text-white font-semibold mb-2">Bağımlılıklar</h4>
                <div className="space-y-1">
                  {selectedModule.manifest.dependencies.map(dep => (
                    <div key={dep} className="flex items-center gap-2">
                      <span className="text-white/70 text-sm">{dep}</span>
                      {moduleManager.getModule(dep) ? (
                        <Icons.Check className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <Icons.AlertCircle className="w-3 h-3 text-orange-400" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Marketplace Modal */}
      {showMarketplace && (
        <Modal
          isOpen={showMarketplace}
          onClose={() => setShowMarketplace(false)}
          title="Module Marketplace"
          size="xl"
        >
          <MarketplaceComponent />
        </Modal>
      )}
    </div>
  );
};