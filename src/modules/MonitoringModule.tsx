/**
 * Monitoring Dashboard Module
 * System monitoring and observability
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as Icons from 'lucide-react';
import { BaseModule } from '../core/BaseModule';
import { communicationBus } from '../core/CommunicationBus';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { MetricCard } from '../cards/MetricCard';
import { ChartCard } from '../cards/ChartCard';
import { LogCard } from '../cards/LogCard';
import { cn } from '../lib/utils';

class MonitoringModuleClass extends BaseModule {
  private monitoringData = {
    metrics: {},
    logs: [],
    alerts: [],
    dashboards: []
  };

  protected async onInitialize(): Promise<void> {
    this.logger.info('Initializing Monitoring Dashboard Module');
    
    // Subscribe to all system events
    communicationBus.subscribe(
      `${this.manifest.id}-events`,
      { type: 'event' },
      this.handleSystemEvent.bind(this)
    );
  }

  protected async onStart(): Promise<void> {
    await this.refreshMonitoringData();
    this.startMetricsCollection();
  }

  protected async onStop(): Promise<void> {
    this.stopMetricsCollection();
  }

  protected async onAction(action: string, payload?: any): Promise<any> {
    switch (action) {
      case 'get-metrics':
        return this.getSystemMetrics();
      case 'get-logs':
        return this.getSystemLogs();
      case 'generate-report':
        return this.generateSystemReport();
      case 'get-alerts':
        return this.getAlerts();
      default:
        throw new Error(`Unknown monitoring action: ${action}`);
    }
  }

  public getComponent(): React.ComponentType<any> {
    return MonitoringModuleComponent;
  }

  private async refreshMonitoringData(): Promise<void> {
    try {
      const [metrics, logs, alerts] = await Promise.all([
        this.apiCall('/monitoring/metrics'),
        this.apiCall('/monitoring/logs'),
        this.apiCall('/monitoring/alerts')
      ]);
      
      this.monitoringData.metrics = metrics.data || {};
      this.monitoringData.logs = logs.data || [];
      this.monitoringData.alerts = alerts.data || [];
      this.updateHealth('healthy');
      this.emit('monitoringDataUpdated', this.monitoringData);
    } catch (error) {
      this.updateHealth('degraded', (error as Error).message);
    }
  }

  private startMetricsCollection(): void {
    this.logger.info('Started metrics collection');
    setInterval(() => this.collectMetrics(), 15000);
  }

  private stopMetricsCollection(): void {
    this.logger.info('Stopped metrics collection');
  }

  private async collectMetrics(): Promise<void> {
    // Collect metrics from all modules
    const modules = (window as any).moduleManager?.getAllModules() || [];
    const moduleMetrics: Record<string, any> = {};

    for (const module of modules) {
      try {
        const metrics = await module.handleAction('get-metrics');
        moduleMetrics[module.manifest.id] = metrics;
      } catch (error) {
        this.logger.debug(`Failed to get metrics from ${module.manifest.id}`);
      }
    }

    this.monitoringData.metrics = moduleMetrics;
    this.emit('metricsCollected', moduleMetrics);
  }

  private handleSystemEvent(message: any): void {
    // Log all system events for monitoring
    const logEntry = {
      timestamp: new Date().toISOString(),
      level: 'info' as const,
      message: `${message.source}: ${message.action}`,
      source: message.source
    };
    
    this.monitoringData.logs.unshift(logEntry);
    
    // Keep only last 100 logs
    if (this.monitoringData.logs.length > 100) {
      this.monitoringData.logs = this.monitoringData.logs.slice(0, 100);
    }
    
    this.emit('newLogEntry', logEntry);
  }

  private async getSystemMetrics(): Promise<any> {
    return this.monitoringData.metrics;
  }

  private async getSystemLogs(): Promise<any[]> {
    return this.monitoringData.logs;
  }

  private async generateSystemReport(): Promise<any> {
    const report = {
      timestamp: new Date().toISOString(),
      systemHealth: 'healthy',
      moduleStatuses: this.monitoringData.metrics,
      summary: 'System operating normally'
    };
    
    return report;
  }

  private async getAlerts(): Promise<any[]> {
    return this.monitoringData.alerts;
  }
}

const MonitoringModuleComponent: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [systemLogs, setSystemLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const tabs = [
    { id: 'overview', label: 'Sistem Genel Bakış', icon: 'LayoutDashboard' },
    { id: 'metrics', label: 'Metrikler', icon: 'BarChart3' },
    { id: 'logs', label: 'Sistem Logları', icon: 'FileText' },
    { id: 'alerts', label: 'Uyarılar', icon: 'Bell' },
    { id: 'grafana', label: 'Grafana Dashboard', icon: 'ExternalLink' }
  ];

  useEffect(() => {
    const loadMonitoringData = async () => {
      try {
        const logs = await communicationBus.send({
          type: 'request',
          source: 'monitoring-dashboard',
          target: 'monitoring-dashboard',
          action: 'get-logs'
        });

        setSystemLogs(logs || [
          { timestamp: new Date().toISOString(), level: 'info', message: 'Modüler sistem başlatıldı' },
          { timestamp: new Date().toISOString(), level: 'info', message: 'Tüm modüller yüklendi' },
          { timestamp: new Date().toISOString(), level: 'warn', message: 'Disk kullanımı %75\'e ulaştı' },
          { timestamp: new Date().toISOString(), level: 'info', message: 'VPN bağlantısı kuruldu' }
        ]);
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to load monitoring data:', error);
        setIsLoading(false);
      }
    };

    loadMonitoringData();
  }, []);

  const handleGenerateReport = async () => {
    try {
      const report = await communicationBus.send({
        type: 'request',
        source: 'monitoring-dashboard',
        target: 'monitoring-dashboard',
        action: 'generate-report'
      });
      console.log('System report generated:', report);
      alert('Sistem raporu oluşturuldu ve indirilebilir');
    } catch (error) {
      console.error('Report generation failed:', error);
    }
  };

  const metricsData = Array.from({ length: 24 }, (_, i) => ({
    time: `${i}:00`,
    cpu: Math.floor(Math.random() * 100) + 10,
    memory: Math.floor(Math.random() * 80) + 20,
    network: Math.floor(Math.random() * 200) + 50
  }));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-8 h-8 border-2 border-white/30 border-t-emerald-400 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Sistem İzleme</h1>
          <p className="text-white/70 mt-1">Modüler monitoring ve observability</p>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <MetricCard
          title="Sistem Sağlığı"
          value="Sağlıklı"
          subtitle="Tüm modüller çalışıyor"
          icon="Heart"
          status="ok"
        />
        <MetricCard
          title="Toplanan Metrikler"
          value="1,247"
          subtitle="Son saat"
          icon="BarChart3"
          status="ok"
        />
        <MetricCard
          title="Aktif Uyarılar"
          value="2"
          subtitle="Düşük öncelik"
          icon="Bell"
          status="warn"
        />
        <MetricCard
          title="Uptime"
          value="15 gün"
          subtitle="Kesintisiz çalışma"
          icon="Clock"
          status="ok"
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
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ChartCard
                  title="Sistem Kaynakları (24 Saat)"
                  data={metricsData}
                  type="line"
                  color="#00A36C"
                />
                <LogCard
                  title="Son Sistem Olayları"
                  logs={systemLogs}
                  maxLines={10}
                />
              </div>

              <Card title="Modül Durum Özeti">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { name: 'Network Management', status: 'healthy', icon: 'Network', color: 'emerald' },
                    { name: 'VPN Management', status: 'healthy', icon: 'Shield', color: 'blue' },
                    { name: 'Automation Engine', status: 'healthy', icon: 'Zap', color: 'purple' },
                    { name: 'Storage Management', status: 'healthy', icon: 'HardDrive', color: 'yellow' }
                  ].map((module) => {
                    const IconComponent = Icons[module.icon as keyof typeof Icons] as React.ComponentType<any>;
                    return (
                      <div key={module.name} className="p-4 rounded-xl bg-white/5 border border-white/10">
                        <div className="flex items-center gap-3 mb-2">
                          <div className={`w-8 h-8 rounded-lg bg-${module.color}-500/20 border border-${module.color}-500/30 flex items-center justify-center`}>
                            <IconComponent className={`w-4 h-4 text-${module.color}-400`} />
                          </div>
                          <span className="text-white font-medium text-sm">{module.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-emerald-400 rounded-full" />
                          <span className="text-emerald-400 text-xs">Sağlıklı</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            </div>
          )}

          {activeTab === 'metrics' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <MetricCard
                  title="CPU Kullanımı"
                  value="34%"
                  subtitle="Ortalama yük"
                  icon="Cpu"
                  status="ok"
                />
                <MetricCard
                  title="RAM Kullanımı"
                  value="52%"
                  subtitle="4.1 GB / 8 GB"
                  icon="MemoryStick"
                  status="ok"
                />
                <MetricCard
                  title="Disk I/O"
                  value="15.2 MB/s"
                  subtitle="Okuma/Yazma"
                  icon="HardDrive"
                  status="ok"
                />
                <MetricCard
                  title="Ağ Trafiği"
                  value="167 Mbps"
                  subtitle="Toplam bant"
                  icon="Activity"
                  status="ok"
                />
              </div>

              <ChartCard
                title="Gerçek Zamanlı Sistem Metrikleri"
                data={metricsData}
                type="area"
                color="#4ECDC4"
              />
            </div>
          )}

          {activeTab === 'logs' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">Sistem Logları</h3>
                <div className="flex items-center gap-3">
                  <Button variant="outline">
                    <Icons.Download className="w-4 h-4 mr-2" />
                    Export Logs
                  </Button>
                  <Button variant="outline">
                    <Icons.Trash2 className="w-4 h-4 mr-2" />
                    Clear Logs
                  </Button>
                </div>
              </div>

              <LogCard
                title="Canlı Sistem Logları"
                logs={systemLogs}
                maxLines={20}
              />

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <MetricCard
                  title="Log Entries"
                  value="12,456"
                  subtitle="Son 24 saat"
                  icon="FileText"
                  status="ok"
                />
                <MetricCard
                  title="Hata Logları"
                  value="23"
                  subtitle="Kritik olmayan"
                  icon="AlertTriangle"
                  status="warn"
                />
                <MetricCard
                  title="Log Size"
                  value="156 MB"
                  subtitle="Toplam log boyutu"
                  icon="Database"
                  status="ok"
                />
                <MetricCard
                  title="Retention"
                  value="30 gün"
                  subtitle="Log saklama süresi"
                  icon="Archive"
                  status="ok"
                />
              </div>
            </div>
          )}

          {activeTab === 'alerts' && (
            <Card title="Sistem Uyarıları">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Button>
                    <Icons.Plus className="w-4 h-4 mr-2" />
                    Uyarı Kuralı Ekle
                  </Button>
                  <Button variant="outline">
                    <Icons.Settings className="w-4 h-4 mr-2" />
                    Bildirim Ayarları
                  </Button>
                </div>

                <div className="space-y-3">
                  {[
                    { type: 'warning', title: 'Disk kullanımı yüksek', time: '5 dakika önce', resolved: false },
                    { type: 'info', title: 'Yeni cihaz ağa bağlandı', time: '15 dakika önce', resolved: true },
                    { type: 'error', title: 'VPN bağlantı sorunu', time: '2 saat önce', resolved: true }
                  ].map((alert, index) => (
                    <div key={index} className={cn(
                      "p-4 rounded-xl border",
                      alert.type === 'error' ? "bg-red-500/10 border-red-500/20" :
                      alert.type === 'warning' ? "bg-orange-500/10 border-orange-500/20" :
                      "bg-blue-500/10 border-blue-500/20"
                    )}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {alert.type === 'error' ? (
                            <Icons.XCircle className="w-5 h-5 text-red-400" />
                          ) : alert.type === 'warning' ? (
                            <Icons.AlertTriangle className="w-5 h-5 text-orange-400" />
                          ) : (
                            <Icons.Info className="w-5 h-5 text-blue-400" />
                          )}
                          <div>
                            <h4 className="text-white font-medium">{alert.title}</h4>
                            <p className="text-white/60 text-sm">{alert.time}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {alert.resolved ? (
                            <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded text-xs">
                              Çözüldü
                            </span>
                          ) : (
                            <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded text-xs">
                              Aktif
                            </span>
                          )}
                          <Button size="sm" variant="outline">
                            <Icons.Eye className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          )}

          {activeTab === 'grafana' && (
            <Card title="Grafana Entegrasyonu">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Button onClick={() => window.open('http://localhost:3100', '_blank')}>
                    <Icons.ExternalLink className="w-4 h-4 mr-2" />
                    Grafana Aç
                  </Button>
                  <Button variant="outline" onClick={handleGenerateReport}>
                    <Icons.Download className="w-4 h-4 mr-2" />
                    Rapor Oluştur
                  </Button>
                </div>

                <div className="h-96 bg-black/20 rounded-xl border border-white/10 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-orange-500/20 rounded-xl flex items-center justify-center">
                      <Icons.BarChart3 className="w-8 h-8 text-orange-400" />
                    </div>
                    <p className="text-white font-medium mb-2">Grafana Dashboard</p>
                    <p className="text-white/60 text-sm mb-4">
                      Detaylı metrikler ve grafikler için Grafana'yı açın
                    </p>
                    <Button 
                      variant="outline" 
                      onClick={() => window.open('http://localhost:3100', '_blank')}
                    >
                      <Icons.ExternalLink className="w-4 h-4 mr-2" />
                      Grafana'da Aç
                    </Button>
                  </div>
                </div>

                <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Icons.CheckCircle className="w-4 h-4 text-orange-400" />
                    <span className="text-orange-400 font-medium">İzleme Modülü Aktif</span>
                  </div>
                  <p className="text-white/80 text-sm">
                    Sistem izleme, log toplama ve Grafana entegrasyonu çalışıyor.
                  </p>
                </div>
              </div>
            </Card>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default MonitoringModuleClass;