/**
 * VPN Management Module
 * Complete WireGuard VPN server and client management
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as Icons from 'lucide-react';
import { BaseModule } from '../core/BaseModule';
import { ModuleManifest } from '../core/ModuleManager';
import { communicationBus } from '../core/CommunicationBus';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { MetricCard } from '../cards/MetricCard';
import { cn, formatBytes } from '../lib/utils';

class VPNModuleClass extends BaseModule {
  private vpnData = {
    servers: [],
    clients: [],
    connections: [],
    metrics: {}
  };

  protected async onInitialize(): Promise<void> {
    this.logger.info('Initializing VPN Management Module');
    
    // Subscribe to system events
    communicationBus.subscribe(
      `${this.manifest.id}-events`,
      { action: ['wg-server-status-changed', 'wg-client-connected'] },
      this.handleVPNEvent.bind(this)
    );
  }

  protected async onStart(): Promise<void> {
    // Load VPN configurations
    await this.refreshVPNData();
    
    // Start monitoring
    setInterval(() => this.monitorVPNStatus(), 30000);
  }

  protected async onStop(): Promise<void> {
    // Cleanup monitoring
  }

  protected async onAction(action: string, payload?: any): Promise<any> {
    switch (action) {
      case 'get-servers':
        return this.getServers();
      case 'create-server':
        return this.createServer(payload);
      case 'get-clients':
        return this.getClients();
      case 'create-client':
        return this.createClient(payload);
      case 'generate-config':
        return this.generateClientConfig(payload);
      case 'get-metrics':
        return this.getModuleMetrics();
      default:
        throw new Error(`Unknown VPN action: ${action}`);
    }
  }

  public getComponent(): React.ComponentType<any> {
    return VPNModuleComponent;
  }

  private async refreshVPNData(): Promise<void> {
    try {
      const [servers, clients] = await Promise.all([
        this.apiCall('/vpn/servers'),
        this.apiCall('/vpn/clients')
      ]);
      
      this.vpnData.servers = servers.data || [];
      this.vpnData.clients = clients.data || [];
      this.updateHealth('healthy');
      this.emit('vpnDataUpdated', this.vpnData);
    } catch (error) {
      this.updateHealth('degraded', (error as Error).message);
    }
  }

  private async monitorVPNStatus(): Promise<void> {
    // Monitor WireGuard interfaces status
    try {
      const status = await this.apiCall('/vpn/status');
      this.vpnData.metrics = status.data;
      this.emit('vpnStatusUpdated', status.data);
    } catch (error) {
      this.logger.warn('VPN status check failed', { error: (error as Error).message });
    }
  }

  private handleVPNEvent(message: any): void {
    this.logger.debug(`VPN event received: ${message.action}`, { payload: message.payload });
    this.refreshVPNData();
  }

  private async getServers(): Promise<any[]> {
    return this.vpnData.servers;
  }

  private async createServer(serverData: any): Promise<any> {
    const result = await this.apiCall('/vpn/servers', {
      method: 'POST',
      body: JSON.stringify(serverData)
    });
    await this.refreshVPNData();
    return result;
  }

  private async getClients(): Promise<any[]> {
    return this.vpnData.clients;
  }

  private async createClient(clientData: any): Promise<any> {
    const result = await this.apiCall('/vpn/clients', {
      method: 'POST',
      body: JSON.stringify(clientData)
    });
    await this.refreshVPNData();
    return result;
  }

  private async generateClientConfig(clientId: string): Promise<any> {
    return await this.apiCall(`/vpn/clients/${clientId}/config`, {
      method: 'POST'
    });
  }

  private getModuleMetrics(): any {
    return {
      totalServers: this.vpnData.servers.length,
      activeServers: this.vpnData.servers.filter((s: any) => s.is_active).length,
      totalClients: this.vpnData.clients.length,
      connectedClients: this.vpnData.clients.filter((c: any) => c.connection_status === 'connected').length
    };
  }
}

const VPNModuleComponent: React.FC = () => {
  const [activeTab, setActiveTab] = useState('servers');
  const [servers, setServers] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [showServerModal, setShowServerModal] = useState(false);
  const [showClientModal, setShowClientModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const tabs = [
    { id: 'servers', label: 'Sunucular', icon: 'Server' },
    { id: 'clients', label: 'İstemciler', icon: 'Users' },
    { id: 'auto-wg', label: 'Auto WG', icon: 'Zap' },
    { id: 'settings', label: 'VPN Ayarları', icon: 'Settings' }
  ];

  useEffect(() => {
    const loadVPNData = async () => {
      try {
        const results = await Promise.all([
          communicationBus.send({
            type: 'request',
            source: 'vpn-management',
            target: 'vpn-management',
            action: 'get-servers'
          }),
          communicationBus.send({
            type: 'request',
            source: 'vpn-management',
            target: 'vpn-management',
            action: 'get-clients'
          })
        ]);

        setServers(results[0] || []);
        setClients(results[1] || []);
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to load VPN data:', error);
        setIsLoading(false);
      }
    };

    loadVPNData();
  }, []);

  const handleCreateServer = async (serverData: any) => {
    try {
      await communicationBus.send({
        type: 'request',
        source: 'vpn-management',
        target: 'vpn-management',
        action: 'create-server',
        payload: serverData
      });
      console.log('VPN sunucusu oluşturuldu');
      setShowServerModal(false);
    } catch (error) {
      console.error('VPN server creation failed:', error);
    }
  };

  const handleCreateClient = async (clientData: any) => {
    try {
      await communicationBus.send({
        type: 'request',
        source: 'vpn-management',
        target: 'vpn-management',
        action: 'create-client',
        payload: clientData
      });
      console.log('VPN istemcisi oluşturuldu');
      setShowClientModal(false);
    } catch (error) {
      console.error('VPN client creation failed:', error);
    }
  };

  const handleGenerateConfig = async (clientId: string) => {
    try {
      const config = await communicationBus.send({
        type: 'request',
        source: 'vpn-management',
        target: 'vpn-management',
        action: 'generate-config',
        payload: clientId
      });
      console.log('Client config generated:', config);
      // Show config in modal or download
    } catch (error) {
      console.error('Config generation failed:', error);
    }
  };

  const activeServers = servers.filter(s => s.is_active);
  const connectedClients = clients.filter(c => c.connection_status === 'connected');

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
          <h1 className="text-2xl font-bold text-white">WireGuard VPN Yönetimi</h1>
          <p className="text-white/70 mt-1">Modüler VPN sunucu ve istemci yönetimi</p>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <MetricCard
          title="Aktif Sunucular"
          value={String(activeServers.length)}
          subtitle={`${servers.length} toplam sunucu`}
          icon="Server"
          status="ok"
        />
        <MetricCard
          title="Bağlı İstemciler"
          value={String(connectedClients.length)}
          subtitle={`${clients.length} toplam istemci`}
          icon="Users"
          status="ok"
        />
        <MetricCard
          title="Toplam Trafik"
          value="2.3 GB"
          subtitle="Bu ay"
          icon="Activity"
          status="ok"
        />
        <MetricCard
          title="VPN Durumu"
          value="Sağlıklı"
          subtitle="Tüm tunnel'lar aktif"
          icon="Shield"
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
          {activeTab === 'servers' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">WireGuard Sunucuları</h3>
                <Button onClick={() => setShowServerModal(true)}>
                  <Icons.Plus className="w-4 h-4 mr-2" />
                  Yeni Sunucu
                </Button>
              </div>

              {servers.length === 0 ? (
                <Card>
                  <div className="text-center py-12">
                    <Icons.Server className="w-16 h-16 text-white/30 mx-auto mb-4" />
                    <h3 className="text-white font-semibold mb-2">Henüz sunucu bulunmuyor</h3>
                    <p className="text-white/60 mb-4">İlk VPN sunucunuzu oluşturun</p>
                    <Button onClick={() => setShowServerModal(true)}>
                      <Icons.Plus className="w-4 h-4 mr-2" />
                      Sunucu Ekle
                    </Button>
                  </div>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {servers.map((server) => (
                    <ServerCard key={server.id} server={server} />
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'clients' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">VPN İstemcileri</h3>
                <Button onClick={() => setShowClientModal(true)}>
                  <Icons.Plus className="w-4 h-4 mr-2" />
                  Yeni İstemci
                </Button>
              </div>

              {clients.length === 0 ? (
                <Card>
                  <div className="text-center py-12">
                    <Icons.Users className="w-16 h-16 text-white/30 mx-auto mb-4" />
                    <h3 className="text-white font-semibold mb-2">Henüz istemci bulunmuyor</h3>
                    <p className="text-white/60 mb-4">İlk VPN istemcinizi oluşturun</p>
                    <Button onClick={() => setShowClientModal(true)}>
                      <Icons.Plus className="w-4 h-4 mr-2" />
                      İstemci Ekle
                    </Button>
                  </div>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {clients.map((client) => (
                    <ClientCard key={client.id} client={client} onGenerateConfig={handleGenerateConfig} />
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'auto-wg' && (
            <Card title="Otomatik WireGuard Kurulumu">
              <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Icons.CheckCircle className="w-4 h-4 text-blue-400" />
                  <span className="text-blue-400 font-medium">Auto WG Modülü Aktif</span>
                </div>
                <p className="text-white/80 text-sm">
                  Uzak sunuculara otomatik WireGuard kurulum özelliği modüler sistem içinde çalışıyor.
                </p>
              </div>
            </Card>
          )}

          {activeTab === 'settings' && (
            <Card title="VPN Sistem Ayarları">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <h4 className="text-white font-medium">WireGuard Bilgileri</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-white/60">Sürüm:</span>
                        <span className="text-white">1.0.20210914</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60">Kernel Modülü:</span>
                        <span className="text-emerald-400">Yüklü</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60">Aktif Interface'ler:</span>
                        <span className="text-white">{activeServers.length}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <h4 className="text-white font-medium">Güvenlik</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-white/60">Şifreleme:</span>
                        <span className="text-white">ChaCha20Poly1305</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60">Anahtar Değişimi:</span>
                        <span className="text-white">Curve25519</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60">Hash:</span>
                        <span className="text-white">BLAKE2s</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Server Creation Modal */}
      <Modal
        isOpen={showServerModal}
        onClose={() => setShowServerModal(false)}
        title="Yeni WireGuard Sunucusu"
      >
        <ServerForm onSubmit={handleCreateServer} onCancel={() => setShowServerModal(false)} />
      </Modal>

      {/* Client Creation Modal */}
      <Modal
        isOpen={showClientModal}
        onClose={() => setShowClientModal(false)}
        title="Yeni VPN İstemcisi"
      >
        <ClientForm onSubmit={handleCreateClient} onCancel={() => setShowClientModal(false)} servers={servers} />
      </Modal>
    </div>
  );
};

// Server Card Component
const ServerCard: React.FC<{ server: any }> = ({ server }) => (
  <Card className="h-full">
    <div className="space-y-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-10 h-10 rounded-lg flex items-center justify-center",
            server.is_active 
              ? "bg-emerald-500/20 border border-emerald-500/30" 
              : "bg-gray-500/20 border border-gray-500/30"
          )}>
            <Icons.Server className={cn(
              "w-5 h-5",
              server.is_active ? "text-emerald-400" : "text-gray-400"
            )} />
          </div>
          <div>
            <h4 className="text-white font-semibold">{server.name}</h4>
            <p className="text-white/60 text-sm">{server.interface_name} • Port {server.listen_port}</p>
          </div>
        </div>
        <div className={cn(
          "w-3 h-3 rounded-full",
          server.is_active ? "bg-emerald-400" : "bg-gray-400"
        )} />
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-white/60">Ağ:</span>
          <span className="text-white font-mono">{server.network_cidr}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-white/60">Endpoint:</span>
          <span className="text-white font-mono text-xs">{server.endpoint || 'Belirtilmemiş'}</span>
        </div>
      </div>

      <div className="flex items-center gap-2 pt-3 border-t border-white/10">
        <Button size="sm" variant="outline" className="flex-1">
          <Icons.Edit className="w-3 h-3 mr-1" />
          Düzenle
        </Button>
        <Button size="sm" variant={server.is_active ? "destructive" : "default"}>
          {server.is_active ? <Icons.Pause className="w-3 h-3" /> : <Icons.Play className="w-3 h-3" />}
        </Button>
      </div>
    </div>
  </Card>
);

// Client Card Component
const ClientCard: React.FC<{ client: any; onGenerateConfig: (id: string) => void }> = ({ client, onGenerateConfig }) => (
  <Card className="h-full">
    <div className="space-y-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-10 h-10 rounded-lg flex items-center justify-center",
            client.is_enabled 
              ? "bg-blue-500/20 border border-blue-500/30" 
              : "bg-gray-500/20 border border-gray-500/30"
          )}>
            <Icons.Smartphone className={cn(
              "w-5 h-5",
              client.is_enabled ? "text-blue-400" : "text-gray-400"
            )} />
          </div>
          <div>
            <h4 className="text-white font-semibold">{client.name}</h4>
            <p className="text-white/60 text-sm">{client.assigned_ip}</p>
          </div>
        </div>
        <div className={cn(
          "w-3 h-3 rounded-full",
          client.connection_status === 'connected' ? "bg-emerald-400" : "bg-gray-400"
        )} />
      </div>

      <div className="flex items-center gap-2 pt-3 border-t border-white/10">
        <Button 
          size="sm" 
          variant="outline" 
          className="flex-1"
          onClick={() => onGenerateConfig(client.id)}
        >
          <Icons.Download className="w-3 h-3 mr-1" />
          Config
        </Button>
        <Button size="sm" variant={client.is_enabled ? "destructive" : "default"}>
          {client.is_enabled ? <Icons.Pause className="w-3 h-3" /> : <Icons.Play className="w-3 h-3" />}
        </Button>
      </div>
    </div>
  </Card>
);

// Server Form Component
const ServerForm: React.FC<{ onSubmit: (data: any) => void; onCancel: () => void }> = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    interface_name: 'wg0',
    listen_port: 51820,
    network_cidr: '10.0.0.0/24',
    endpoint: ''
  });

  const handleSubmit = () => {
    onSubmit(formData);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-white text-sm font-medium mb-2">Sunucu Adı</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            placeholder="VPN Sunucusu"
          />
        </div>
        <div>
          <label className="block text-white text-sm font-medium mb-2">Arayüz Adı</label>
          <input
            type="text"
            value={formData.interface_name}
            onChange={(e) => setFormData({ ...formData, interface_name: e.target.value })}
            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            placeholder="wg0"
          />
        </div>
      </div>

      <div className="flex items-center gap-3 pt-4">
        <Button onClick={handleSubmit} className="flex-1">
          Oluştur
        </Button>
        <Button variant="outline" onClick={onCancel} className="flex-1">
          İptal
        </Button>
      </div>
    </div>
  );
};

// Client Form Component  
const ClientForm: React.FC<{ onSubmit: (data: any) => void; onCancel: () => void; servers: any[] }> = ({ onSubmit, onCancel, servers }) => {
  const [formData, setFormData] = useState({
    name: '',
    server_id: '',
    allowed_ips: '0.0.0.0/0'
  });

  const handleSubmit = () => {
    onSubmit(formData);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-white text-sm font-medium mb-2">İstemci Adı</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            placeholder="Mobil Cihaz"
          />
        </div>
        <div>
          <label className="block text-white text-sm font-medium mb-2">Sunucu</label>
          <select
            value={formData.server_id}
            onChange={(e) => setFormData({ ...formData, server_id: e.target.value })}
            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
          >
            <option value="">Sunucu seçin</option>
            {servers.map((server) => (
              <option key={server.id} value={server.id}>
                {server.name} ({server.interface_name})
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex items-center gap-3 pt-4">
        <Button onClick={handleSubmit} className="flex-1">
          Oluştur
        </Button>
        <Button variant="outline" onClick={onCancel} className="flex-1">
          İptal
        </Button>
      </div>
    </div>
  );
};

export default VPNModuleClass;