/**
 * Modular Dashboard - System Overview
 * Displays metrics from all loaded modules
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import * as Icons from 'lucide-react';
import { MetricCard } from '../cards/MetricCard';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { moduleManager } from '../../core/ModuleManager';
import { communicationBus } from '../../core/CommunicationBus';
import { SEOMeta } from '../SEO/SEOMeta';

export const ModularDashboard: React.FC = () => {
  const [systemMetrics, setSystemMetrics] = useState<any>({});
  const [moduleMetrics, setModuleMetrics] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeDashboard = async () => {
      try {
        // Get system-wide metrics
        const response = await fetch('/api/v1/system/metrics');
        const data = await response.json();
        setSystemMetrics(data.data || {});

        // Collect metrics from all modules
        const modules = moduleManager.getAllModules();
        const metrics: Record<string, any> = {};

        for (const module of modules) {
          try {
            const moduleMetrics = await module.handleAction('get-metrics');
            metrics[module.manifest.id] = moduleMetrics;
          } catch (error) {
            console.warn(`Failed to get metrics from module: ${module.manifest.id}`);
          }
        }

        setModuleMetrics(metrics);
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to initialize dashboard:', error);
        setIsLoading(false);
      }
    };

    initializeDashboard();

    // Refresh metrics every 30 seconds
    const interval = setInterval(initializeDashboard, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleQuickAction = async (action: string) => {
    try {
      switch (action) {
        case 'discover-devices':
          await communicationBus.send({
            type: 'request',
            source: 'dashboard',
            target: 'device-management',
            action: 'discover-devices'
          });
          console.log('Cihaz keşfi başlatıldı');
          break;
        case 'network-scan':
          await communicationBus.send({
            type: 'request',
            source: 'dashboard',
            target: 'network-management',
            action: 'scan-network'
          });
          console.log('Ağ taraması başlatıldı');
          break;
        case 'speed-test':
          await communicationBus.send({
            type: 'request',
            source: 'dashboard',
            target: 'network-management',
            action: 'run-speed-test'
          });
          console.log('Hız testi başlatıldı');
          break;
        case 'system-report':
          await communicationBus.send({
            type: 'request',
            source: 'dashboard',
            target: 'monitoring-dashboard',
            action: 'generate-report'
          });
          console.log('Sistem raporu oluşturuluyor');
          break;
      }
    } catch (error) {
      console.error(`Quick action failed: ${action}`, error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-8 h-8 border-2 border-white/30 border-t-emerald-400 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SEOMeta
        title="Modüler Dashboard"
        description="Pi5 Supernode sistem genel bakışı ve modül durumları"
      />
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white text-balance">Modüler Dashboard</h1>
          <p className="text-white/70 mt-1 text-balance">Sistem genel bakışı ve modül durumları</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => handleQuickAction('system-report')}>
            <Icons.BarChart3 className="w-4 h-4 mr-2" />
            <span className="truncate">Sistem Raporu</span>
          </Button>
          <Button size="sm" onClick={() => handleQuickAction('discover-devices')}>
            <Icons.Search className="w-4 h-4 mr-2" />
            <span className="truncate">Cihaz Keşfi</span>
          </Button>
        </div>
      </div>

      {/* System Overview Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="CPU Kullanımı"
          value={`${Math.round(systemMetrics?.cpu || 0)}%`}
          subtitle="İşlemci yükü"
          icon="Cpu"
          trend={systemMetrics?.cpu > 80 ? 'up' : 'stable'}
          status={systemMetrics?.cpu > 80 ? 'warn' : 'ok'}
        />
        <MetricCard
          title="RAM Kullanımı"
          value={`${Math.round(systemMetrics?.memory || 0)}%`}
          subtitle="Bellek kullanımı"
          icon="MemoryStick"
          trend="stable"
          status={systemMetrics?.memory > 85 ? 'warn' : 'ok'}
        />
        <MetricCard
          title="Disk Kullanımı"
          value={`${Math.round(systemMetrics?.disk || 0)}%`}
          subtitle="Depolama alanı"
          icon="HardDrive"
          trend="up"
          status={systemMetrics?.disk > 90 ? 'error' : systemMetrics?.disk > 75 ? 'warn' : 'ok'}
        />
        <MetricCard
          title="Ağ Trafiği"
          value={`${Math.round((systemMetrics?.network?.upload || 0) + (systemMetrics?.network?.download || 0))} Mbps`}
          subtitle="Toplam bant genişliği"
          icon="Activity"
          trend="up"
          status="ok"
        />
      </div>

      {/* Module Status Overview */}
      <Card title="Yüklü Modüller">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(moduleMetrics).map(([moduleId, metrics]) => {
              const module = moduleManager.getModule(moduleId);
              const status = moduleStatuses[moduleId];
              
              return (
                <motion.div
                  key={moduleId}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2 }}
                  className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center",
                      status?.health === 'healthy' ? "bg-emerald-500/20 border border-emerald-500/30" :
                      status?.health === 'degraded' ? "bg-orange-500/20 border border-orange-500/30" :
                      "bg-red-500/20 border border-red-500/30"
                    )}>
                      <Icons.Package className={cn(
                        "w-4 h-4",
                        status?.health === 'healthy' ? "text-emerald-400" :
                        status?.health === 'degraded' ? "text-orange-400" : "text-red-400"
                      )} />
                    </div>
                    <div>
                      <h4 className="text-white font-medium text-sm">{module?.manifest.name || moduleId}</h4>
                      <p className="text-white/60 text-xs">{module?.manifest.version || 'v1.0.0'}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-xs">
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
                         status?.status === 'error' ? 'Hata' : 'Yükleniyor'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Sağlık:</span>
                      <span className={cn(
                        "font-medium",
                        status?.health === 'healthy' ? "text-emerald-400" :
                        status?.health === 'degraded' ? "text-orange-400" : "text-red-400"
                      )}>
                        {status?.health === 'healthy' ? 'Sağlıklı' :
                         status?.health === 'degraded' ? 'Kısmi' : 'Sorunlu'}
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
          
          {Object.keys(moduleMetrics).length === 0 && (
            <div className="text-center py-8">
              <Icons.Package className="w-12 h-12 text-white/30 mx-auto mb-3" />
              <p className="text-white/60">Modüller yükleniyor...</p>
            </div>
          )}
        </div>
      </Card>

      {/* Quick Actions */}
      <Card title="Hızlı İşlemler">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <Button 
            className="h-12 justify-start"
            onClick={() => handleQuickAction('discover-devices')}
          >
            <Icons.Search className="w-4 h-4 mr-2" />
            <span className="truncate">Cihaz Keşfi</span>
          </Button>
          <Button 
            variant="outline" 
            className="h-12 justify-start"
            onClick={() => handleQuickAction('network-scan')}
          >
            <Icons.Scan className="w-4 h-4 mr-2" />
            <span className="truncate">Ağ Taraması</span>
          </Button>
          <Button 
            variant="outline" 
            className="h-12 justify-start"
            onClick={() => handleQuickAction('speed-test')}
          >
            <Icons.Zap className="w-4 h-4 mr-2" />
            <span className="truncate">Hız Testi</span>
          </Button>
          <Button 
            variant="outline" 
            className="h-12 justify-start"
            onClick={() => handleQuickAction('system-report')}
          >
            <Icons.BarChart3 className="w-4 h-4 mr-2" />
            <span className="truncate">Sistem Raporu</span>
          </Button>
        </div>
      </Card>

      {/* System Health Summary */}
      <Card title="Sistem Sağlık Durumu">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <div className="flex items-center gap-3 mb-2">
                <Icons.CheckCircle className="w-5 h-5 text-emerald-400" />
                <span className="text-white font-medium">Sistem Durumu</span>
              </div>
              <p className="text-emerald-400 text-sm">Tüm servisler normal çalışıyor</p>
            </div>
            
            <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
              <div className="flex items-center gap-3 mb-2">
                <Icons.Database className="w-5 h-5 text-blue-400" />
                <span className="text-white font-medium">Veritabanı</span>
              </div>
              <p className="text-blue-400 text-sm">Bağlantı başarılı</p>
            </div>
            
            <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20">
              <div className="flex items-center gap-3 mb-2">
                <Icons.Package className="w-5 h-5 text-purple-400" />
                <span className="text-white font-medium">Modüller</span>
              </div>
              <p className="text-purple-400 text-sm">{Object.keys(moduleMetrics).length} modül aktif</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};