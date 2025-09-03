/**
 * System Settings Module
 * System configuration, documentation, and management
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as Icons from 'lucide-react';
import { BaseModule } from '../core/BaseModule';
import { communicationBus } from '../core/CommunicationBus';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { MetricCard } from '../components/cards/MetricCard';
import { ControlCard } from '../components/cards/ControlCard';
import { cn } from '../lib/utils';

class SystemSettingsModuleClass extends BaseModule {
  private settingsData = {
    systemConfig: {},
    snapshots: [],
    documentation: [],
    modules: []
  };

  protected async onInitialize(): Promise<void> {
    this.logger.info('Initializing System Settings Module');
  }

  protected async onStart(): Promise<void> {
    await this.refreshSettingsData();
  }

  protected async onStop(): Promise<void> {
    // Cleanup
  }

  protected async onAction(action: string, payload?: any): Promise<any> {
    switch (action) {
      case 'get-system-config':
        return this.getSystemConfig();
      case 'update-system-config':
        return this.updateSystemConfig(payload);
      case 'create-snapshot':
        return this.createSystemSnapshot(payload);
      case 'get-documentation':
        return this.getDocumentation();
      case 'get-metrics':
        return this.getModuleMetrics();
      default:
        throw new Error(`Unknown settings action: ${action}`);
    }
  }

  public getComponent(): React.ComponentType<any> {
    return SystemSettingsModuleComponent;
  }

  private async refreshSettingsData(): Promise<void> {
    try {
      const [config, docs] = await Promise.all([
        this.apiCall('/system/config'),
        this.apiCall('/system/documentation')
      ]);
      
      this.settingsData.systemConfig = config.data || {};
      this.settingsData.documentation = docs.data || [];
      this.updateHealth('healthy');
    } catch (error) {
      this.updateHealth('degraded', (error as Error).message);
    }
  }

  private async getSystemConfig(): Promise<any> {
    return this.settingsData.systemConfig;
  }

  private async updateSystemConfig(configData: any): Promise<any> {
    const result = await this.apiCall('/system/config', {
      method: 'PUT',
      body: JSON.stringify(configData)
    });
    await this.refreshSettingsData();
    return result;
  }

  private async createSystemSnapshot(snapshotData: any): Promise<any> {
    return await this.apiCall('/system/snapshot', {
      method: 'POST',
      body: JSON.stringify(snapshotData)
    });
  }

  private async getDocumentation(): Promise<any[]> {
    return this.settingsData.documentation;
  }

  private getModuleMetrics(): any {
    return {
      totalSnapshots: this.settingsData.snapshots.length,
      systemVersion: '2.1.4',
      configurationValid: true,
      documentsAvailable: this.settingsData.documentation.length
    };
  }
}

const SystemSettingsModuleComponent: React.FC = () => {
  const [activeTab, setActiveTab] = useState('system');
  const [isLoading, setIsLoading] = useState(false);

  const tabs = [
    { id: 'system', label: 'Sistem Yapılandırması', icon: 'Settings' },
    { id: 'modules', label: 'Modül Yönetimi', icon: 'Package' },
    { id: 'documentation', label: 'Dokümantasyon', icon: 'BookOpen' },
    { id: 'about', label: 'Sistem Bilgisi', icon: 'Info' }
  ];

  const systemControls = [
    { id: 'auto-updates', type: 'toggle' as const, label: 'Otomatik Güncellemeler', value: true, icon: 'Download', action: () => {} },
    { id: 'telemetry', type: 'toggle' as const, label: 'Telemetri Verileri', value: false, icon: 'BarChart3', action: () => {} },
    { id: 'ssh', type: 'toggle' as const, label: 'SSH Erişimi', value: true, icon: 'Terminal', action: () => {} },
    { id: 'backup', type: 'toggle' as const, label: 'Otomatik Yedekleme', value: true, icon: 'Archive', action: () => {} },
    { id: 'monitoring', type: 'toggle' as const, label: 'Sistem İzleme', value: true, icon: 'Activity', action: () => {} }
  ];

  const handleCreateSnapshot = async () => {
    try {
      await communicationBus.send({
        type: 'request',
        source: 'system-settings',
        target: 'system-settings',
        action: 'create-snapshot',
        payload: { name: `Manual snapshot ${new Date().toISOString()}` }
      });
      console.log('System snapshot created');
    } catch (error) {
      console.error('Snapshot creation failed:', error);
    }
  };

  const handleModuleReload = async (moduleId: string) => {
    try {
      // Reload specific module
      console.log(`Reloading module: ${moduleId}`);
      alert(`${moduleId} modülü yeniden yüklendi`);
    } catch (error) {
      console.error('Module reload failed:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Sistem Ayarları</h1>
          <p className="text-white/70 mt-1">Modüler sistem yapılandırması ve yönetimi</p>
        </div>
      </div>

      {/* System Status Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <MetricCard
          title="Sistem Sürümü"
          value="v2.1.4"
          subtitle="Pi5 Supernode"
          icon="Package"
          status="ok"
        />
        <MetricCard
          title="Yüklü Modüller"
          value="6"
          subtitle="Aktif modüller"
          icon="Puzzle"
          status="ok"
        />
        <MetricCard
          title="Database"
          value="Bağlı"
          subtitle="Supabase connection"
          icon="Database"
          status="ok"
        />
        <MetricCard
          title="API Gateway"
          value="Çalışıyor"
          subtitle="Port 3000"
          icon="Server"
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
          {activeTab === 'system' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ControlCard
                  title="Sistem Yapılandırması"
                  controls={systemControls}
                />

                <Card title="Sistem Snapshot Yönetimi">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Button onClick={handleCreateSnapshot} className="flex-1">
                        <Icons.Camera className="w-4 h-4 mr-2" />
                        Snapshot Al
                      </Button>
                      <Button variant="outline" className="flex-1">
                        <Icons.Upload className="w-4 h-4 mr-2" />
                        Geri Yükle
                      </Button>
                    </div>
                    
                    <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Icons.CheckCircle className="w-4 h-4 text-emerald-400" />
                        <span className="text-emerald-400 font-medium">Sistem Ayarları Modülü Aktif</span>
                      </div>
                      <p className="text-white/80 text-sm">
                        Modüler sistem ayarları, snapshot yönetimi ve configuration özellikleri çalışıyor.
                      </p>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          )}

          {activeTab === 'modules' && (
            <Card title="Modül Yönetimi">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Button>
                    <Icons.Download className="w-4 h-4 mr-2" />
                    Modül İndir
                  </Button>
                  <Button variant="outline">
                    <Icons.RefreshCw className="w-4 h-4 mr-2" />
                    Modülleri Yenile
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    { id: 'device-management', name: 'Device Management', status: 'loaded', version: '1.0.0', health: 'healthy' },
                    { id: 'network-management', name: 'Network Management', status: 'loaded', version: '1.0.0', health: 'healthy' },
                    { id: 'vpn-management', name: 'VPN Management', status: 'loaded', version: '1.0.0', health: 'healthy' },
                    { id: 'automation-engine', name: 'Automation Engine', status: 'loaded', version: '1.0.0', health: 'healthy' },
                    { id: 'storage-management', name: 'Storage Management', status: 'loaded', version: '1.0.0', health: 'healthy' },
                    { id: 'monitoring-dashboard', name: 'Monitoring Dashboard', status: 'loaded', version: '1.0.0', health: 'healthy' }
                  ].map((module) => (
                    <div key={module.id} className="p-4 rounded-xl bg-white/5 border border-white/10">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-8 h-8 rounded-lg flex items-center justify-center",
                            module.health === 'healthy' ? "bg-emerald-500/20 border border-emerald-500/30" : "bg-red-500/20 border border-red-500/30"
                          )}>
                            <Icons.Package className={cn(
                              "w-4 h-4",
                              module.health === 'healthy' ? "text-emerald-400" : "text-red-400"
                            )} />
                          </div>
                          <div>
                            <h4 className="text-white font-medium text-sm">{module.name}</h4>
                            <p className="text-white/60 text-xs">{module.version}</p>
                          </div>
                        </div>
                        <div className={cn(
                          "w-2 h-2 rounded-full",
                          module.health === 'healthy' ? "bg-emerald-400" : "bg-red-400"
                        )} />
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="flex-1"
                          onClick={() => handleModuleReload(module.id)}
                        >
                          <Icons.RefreshCw className="w-3 h-3 mr-1" />
                          Reload
                        </Button>
                        <Button size="sm" variant="outline">
                          <Icons.Settings className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          )}

          {activeTab === 'documentation' && (
            <Card title="Modüler Sistem Dokümantasyonu">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    { title: 'Modüler Mimari Kılavuzu', file: 'MODULAR_ARCHITECTURE.md', size: '89 KB', icon: 'GitBranch' },
                    { title: 'Module Development Guide', file: 'MODULE_DEVELOPMENT.md', size: '67 KB', icon: 'Code' },
                    { title: 'API Communication Standards', file: 'API_STANDARDS.md', size: '45 KB', icon: 'Webhook' },
                    { title: 'Installation & Deployment', file: 'INSTALLATION_GUIDE.md', size: '124 KB', icon: 'Download' },
                    { title: 'Troubleshooting Guide', file: 'TROUBLESHOOTING.md', size: '78 KB', icon: 'AlertTriangle' },
                    { title: 'Performance Optimization', file: 'OPTIMIZATION.md', size: '56 KB', icon: 'Zap' }
                  ].map((doc) => {
                    const IconComponent = Icons[doc.icon as keyof typeof Icons] as React.ComponentType<any>;
                    return (
                      <div key={doc.file} className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
                            <IconComponent className="w-4 h-4 text-blue-400" />
                          </div>
                          <div>
                            <h4 className="text-white font-medium text-sm">{doc.title}</h4>
                            <p className="text-white/60 text-xs">{doc.size}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="outline" className="flex-1">
                            <Icons.ExternalLink className="w-3 h-3 mr-1" />
                            Aç
                          </Button>
                          <Button size="sm" variant="outline">
                            <Icons.Download className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Icons.CheckCircle className="w-4 h-4 text-blue-400" />
                    <span className="text-blue-400 font-medium">Dokümantasyon Modülü Aktif</span>
                  </div>
                  <p className="text-white/80 text-sm">
                    Modüler sistem dokümantasyonu, API referansları ve geliştirici kılavuzları mevcut.
                  </p>
                </div>
              </div>
            </Card>
          )}

          {activeTab === 'about' && (
            <Card title="Pi5 Supernode - Modüler Sistem">
              <div className="space-y-6">
                <div className="text-center">
                  <div className="w-20 h-20 mx-auto mb-4 bg-emerald-500/20 rounded-2xl flex items-center justify-center">
                    <Icons.Cpu className="w-10 h-10 text-emerald-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">Pi5 Supernode</h2>
                  <p className="text-emerald-400 font-medium">Modüler Enterprise Network Management</p>
                  <p className="text-white/60 text-sm mt-1">Version 2.1.4 - Modular Architecture</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-4 bg-white/5 rounded-xl border border-white/10">
                    <Icons.Package className="w-8 h-8 text-purple-400 mx-auto mb-3" />
                    <h4 className="text-white font-semibold mb-2">Modular Architecture</h4>
                    <ul className="text-white/70 text-sm space-y-1">
                      <li>6 Independent Modules</li>
                      <li>Communication Bus</li>
                      <li>Auto-discovery</li>
                      <li>Hot-swappable</li>
                    </ul>
                  </div>
                  
                  <div className="text-center p-4 bg-white/5 rounded-xl border border-white/10">
                    <Icons.Server className="w-8 h-8 text-emerald-400 mx-auto mb-3" />
                    <h4 className="text-white font-semibold mb-2">Zero Configuration</h4>
                    <ul className="text-white/70 text-sm space-y-1">
                      <li>Automated Setup</li>
                      <li>Self-configuring</li>
                      <li>Health Monitoring</li>
                      <li>Auto-recovery</li>
                    </ul>
                  </div>
                  
                  <div className="text-center p-4 bg-white/5 rounded-xl border border-white/10">
                    <Icons.Zap className="w-8 h-8 text-yellow-400 mx-auto mb-3" />
                    <h4 className="text-white font-semibold mb-2">Performance</h4>
                    <ul className="text-white/70 text-sm space-y-1">
                      <li>Optimized for Pi5</li>
                      <li>Efficient Communication</li>
                      <li>Resource Monitoring</li>
                      <li>Smart Caching</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4">
                  <h4 className="text-emerald-400 font-medium mb-3">Modular System Benefits</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <h5 className="text-white font-medium mb-2">✅ Development Benefits</h5>
                      <ul className="text-white/80 space-y-1">
                        <li>• Independent module development</li>
                        <li>• Isolated testing and debugging</li>
                        <li>• No cross-module interference</li>
                        <li>• Simplified maintenance</li>
                      </ul>
                    </div>
                    <div>
                      <h5 className="text-white font-medium mb-2">🚀 User Benefits</h5>
                      <ul className="text-white/80 space-y-1">
                        <li>• Download only needed modules</li>
                        <li>• Faster system startup</li>
                        <li>• Better resource utilization</li>
                        <li>• Enhanced system stability</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default SystemSettingsModuleClass;