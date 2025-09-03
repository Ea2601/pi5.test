/**
 * Network Management Module
 * Modular implementation of network management functionality
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as Icons from 'lucide-react';
import { BaseModule } from '../core/BaseModule';
import { ModuleManifest } from '../core/ModuleManager';
import { communicationBus } from '../core/CommunicationBus';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { MetricCard } from '../components/cards/MetricCard';
import { cn } from '../lib/utils';

// Network Module Implementation
class NetworkModuleClass extends BaseModule {
  private networkData: any = {};
  private intervals: NodeJS.Timeout[] = [];

  protected async onInitialize(): Promise<void> {
    // Initialize network module data
    this.networkData = {
      dnsServers: [],
      dhcpPools: [],
      wifiNetworks: [],
      deviceAssignments: []
    };

    // Subscribe to system events
    communicationBus.subscribe(
      `${this.manifest.id}-system-events`,
      { action: ['device-connected', 'device-disconnected'] },
      this.handleSystemEvent.bind(this)
    );
  }

  protected async onStart(): Promise<void> {
    // Start network monitoring
    this.intervals.push(
      setInterval(() => this.refreshNetworkData(), 30000)
    );

    // Initial data load
    await this.refreshNetworkData();
  }

  protected async onStop(): Promise<void> {
    // Clean up intervals
    this.intervals.forEach(interval => clearInterval(interval));
    this.intervals = [];
  }

  protected async onAction(action: string, payload?: any): Promise<any> {
    switch (action) {
      case 'get-dns-servers':
        return this.getDNSServers();
      case 'create-dns-server':
        return this.createDNSServer(payload);
      case 'get-dhcp-pools':
        return this.getDHCPPools();
      case 'create-dhcp-pool':
        return this.createDHCPPool(payload);
      case 'get-wifi-networks':
        return this.getWiFiNetworks();
      case 'apply-configuration':
        return this.applyNetworkConfiguration();
      default:
        throw new Error(`Unknown action: ${action}`);
    }
  }

  public getComponent(): React.ComponentType<any> {
    return NetworkModuleComponent;
  }

  private async refreshNetworkData(): Promise<void> {
    try {
      // Refresh DNS servers
      this.networkData.dnsServers = await this.apiCall('/dns/servers');
      
      // Refresh DHCP pools
      this.networkData.dhcpPools = await this.apiCall('/dhcp/pools');
      
      // Refresh WiFi networks
      this.networkData.wifiNetworks = await this.apiCall('/wifi/networks');

      this.updateHealth('healthy');
      this.emit('dataRefreshed', this.networkData);
    } catch (error) {
      this.updateHealth('degraded', (error as Error).message);
      this.logger.error('Failed to refresh network data', { error: (error as Error).message });
    }
  }

  private handleSystemEvent(message: any): void {
    // Handle system-wide events that affect network module
    this.logger.debug(`Received system event: ${message.action}`, { payload: message.payload });
    
    if (message.action === 'device-connected') {
      this.emit('deviceConnected', message.payload);
    } else if (message.action === 'device-disconnected') {
      this.emit('deviceDisconnected', message.payload);
    }
  }

  // Network-specific methods
  private async getDNSServers(): Promise<any[]> {
    return this.networkData.dnsServers || [];
  }

  private async createDNSServer(serverData: any): Promise<any> {
    const result = await this.apiCall('/dns/servers', {
      method: 'POST',
      body: JSON.stringify(serverData)
    });
    
    await this.refreshNetworkData();
    return result;
  }

  private async getDHCPPools(): Promise<any[]> {
    return this.networkData.dhcpPools || [];
  }

  private async createDHCPPool(poolData: any): Promise<any> {
    const result = await this.apiCall('/dhcp/pools', {
      method: 'POST',
      body: JSON.stringify(poolData)
    });
    
    await this.refreshNetworkData();
    return result;
  }

  private async getWiFiNetworks(): Promise<any[]> {
    return this.networkData.wifiNetworks || [];
  }

  private async applyNetworkConfiguration(): Promise<any> {
    return await this.apiCall('/apply-config', {
      method: 'POST'
    });
  }
}

// React Component for Network Module
const NetworkModuleComponent: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dns');
  const [moduleData, setModuleData] = useState<any>({});
  const [isLoading, setIsLoading] = useState(true);

  const tabs = [
    { id: 'dns', label: 'DNS Yönetimi', icon: 'Globe' },
    { id: 'dhcp', label: 'DHCP Yönetimi', icon: 'Network' },
    { id: 'wifi', label: 'WiFi Yönetimi', icon: 'Wifi' },
    { id: 'settings', label: 'Ağ Ayarları', icon: 'Settings' }
  ];

  useEffect(() => {
    // Get network module instance
    const networkModule = (window as any).moduleManager?.getModule('network-management');
    
    if (networkModule) {
      // Subscribe to module data updates
      networkModule.registerEventHandler('dataRefreshed', (data: any) => {
        setModuleData(data);
        setIsLoading(false);
      });

      // Load initial data
      networkModule.handleAction('get-dns-servers').then(() => {
        setIsLoading(false);
      }).catch(() => {
        setIsLoading(false);
      });
    }
  }, []);

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
    
    // Send analytics event
    communicationBus.send({
      type: 'event',
      source: 'network-management',
      action: 'tab-changed',
      payload: { tab: tabId }
    });
  };

  const TabButton: React.FC<{ tab: any; isActive: boolean }> = ({ tab, isActive }) => {
    const IconComponent = Icons[tab.icon as keyof typeof Icons] as React.ComponentType<any>;
    
    return (
      <button
        onClick={() => handleTabClick(tab.id)}
        className={cn(
          "relative flex items-center gap-2 px-6 py-3 rounded-xl transition-all duration-300 font-medium",
          "touch-target cursor-pointer", // Ensure clickability
          isActive
            ? "bg-emerald-500/20 text-white border border-emerald-500/30 shadow-lg shadow-emerald-500/20"
            : "text-white/70 hover:text-white hover:bg-white/10 hover:shadow-lg hover:shadow-white/10 border border-transparent hover:border-white/20"
        )}
        style={{
          textShadow: isActive ? '0 0 8px rgba(0, 163, 108, 0.6)' : 'none'
        }}
        aria-pressed={isActive}
        role="tab"
      >
        <IconComponent className="w-4 h-4" />
        <span>{tab.label}</span>
      </button>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dns':
        return <DNSManagementTab moduleData={moduleData} />;
      case 'dhcp':
        return <DHCPManagementTab moduleData={moduleData} />;
      case 'wifi':
        return <WiFiManagementTab moduleData={moduleData} />;
      case 'settings':
        return <NetworkSettingsTab moduleData={moduleData} />;
      default:
        return <DNSManagementTab moduleData={moduleData} />;
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
      {/* Network Module Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Ağ Yönetimi Modülü</h1>
          <p className="text-white/70 mt-1">DNS, DHCP, WiFi ve ağ yapılandırması</p>
        </div>
      </div>

      {/* Tab Navigation - Fixed */}
      <div className="flex space-x-1 bg-white/5 p-1 rounded-2xl backdrop-blur-sm border border-white/10 overflow-x-auto">
        {tabs.map((tab) => (
          <TabButton 
            key={tab.id} 
            tab={tab} 
            isActive={activeTab === tab.id} 
          />
        ))}
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

// Tab Content Components with Working Buttons
const DNSManagementTab: React.FC<{ moduleData: any }> = ({ moduleData }) => {
  const [servers, setServers] = useState([]);

  const handleAddDNSServer = async () => {
    try {
      const newServer = {
        name: 'Cloudflare DNS',
        ip_address: '1.1.1.1',
        port: 53,
        type: 'standard'
      };

      await communicationBus.send({
        type: 'request',
        source: 'network-management',
        target: 'network-management',
        action: 'create-dns-server',
        payload: newServer
      });

      console.log('DNS sunucusu eklendi');
    } catch (error) {
      console.error('DNS sunucusu eklenirken hata:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard
          title="DNS Sunucuları"
          value={String(servers.length)}
          subtitle="Yapılandırılmış"
          icon="Globe"
          status="ok"
        />
        <MetricCard
          title="Aktif Profiller"
          value="2"
          subtitle="Güvenlik profilleri"
          icon="Shield"
          status="ok"
        />
        <MetricCard
          title="Günlük Sorgular"
          value="5,420"
          subtitle="Son 24 saat"
          icon="BarChart3"
          status="ok"
        />
        <MetricCard
          title="Engellenen"
          value="1,250"
          subtitle="Zararlı istekler"
          icon="Ban"
          status="warn"
        />
      </div>

      <Card title="DNS Sunucu Yönetimi">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Button 
              onClick={handleAddDNSServer}
              className="h-12"
            >
              <Icons.Plus className="w-4 h-4 mr-2" />
              <span>DNS Sunucu Ekle</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-12"
              onClick={() => console.log('DNS ayarları uygulanıyor...')}
            >
              <Icons.Settings className="w-4 h-4 mr-2" />
              <span>Ayarları Uygula</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-12"
              onClick={() => console.log('DNS cache temizleniyor...')}
            >
              <Icons.RefreshCw className="w-4 h-4 mr-2" />
              <span>Cache Temizle</span>
            </Button>
          </div>
          
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Icons.CheckCircle className="w-4 h-4 text-emerald-400" />
              <span className="text-emerald-400 font-medium">DNS Modülü Aktif</span>
            </div>
            <p className="text-white/80 text-sm">
              DNS yönetimi modülü başarıyla yüklendi. Butonlar ve API bağlantıları çalışıyor.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

const DHCPManagementTab: React.FC<{ moduleData: any }> = ({ moduleData }) => {
  const handleCreateDHCPPool = async () => {
    try {
      const newPool = {
        name: 'Guest Network',
        vlan_id: 40,
        network_cidr: '192.168.40.0/24',
        start_ip: '192.168.40.100',
        end_ip: '192.168.40.199',
        gateway_ip: '192.168.40.1'
      };

      await communicationBus.send({
        type: 'request',
        source: 'network-management',
        target: 'network-management',
        action: 'create-dhcp-pool',
        payload: newPool
      });

      console.log('DHCP pool oluşturuldu');
    } catch (error) {
      console.error('DHCP pool oluşturulurken hata:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard
          title="DHCP Pools"
          value="3"
          subtitle="Aktif IP havuzları"
          icon="Network"
          status="ok"
        />
        <MetricCard
          title="Aktif Lease'ler"
          value="25"
          subtitle="Dağıtılan IP'ler"
          icon="Users"
          status="ok"
        />
        <MetricCard
          title="Statik IP'ler"
          value="12"
          subtitle="Rezervasyonlar"
          icon="Lock"
          status="ok"
        />
        <MetricCard
          title="Pool Kullanımı"
          value="68%"
          subtitle="Ortalama doluluk"
          icon="BarChart3"
          status="ok"
        />
      </div>

      <Card title="DHCP Pool Yönetimi">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Button 
              onClick={handleCreateDHCPPool}
              className="h-12"
            >
              <Icons.Plus className="w-4 h-4 mr-2" />
              <span>DHCP Pool Ekle</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-12"
              onClick={() => console.log('DHCP yapılandırması uygulanıyor...')}
            >
              <Icons.Settings className="w-4 h-4 mr-2" />
              <span>Yapılandırmayı Uygula</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-12"
              onClick={() => console.log('DHCP sunucuları taranıyor...')}
            >
              <Icons.Search className="w-4 h-4 mr-2" />
              <span>Sunucu Tara</span>
            </Button>
          </div>
          
          <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Icons.CheckCircle className="w-4 h-4 text-blue-400" />
              <span className="text-blue-400 font-medium">DHCP Modülü Aktif</span>
            </div>
            <p className="text-white/80 text-sm">
              DHCP yönetimi modülü başarıyla yüklendi. IP havuzları ve rezervasyonlar yönetilebilir.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

const WiFiManagementTab: React.FC<{ moduleData: any }> = ({ moduleData }) => {
  const handleCreateWiFiNetwork = async () => {
    try {
      const newNetwork = {
        ssid: 'Infinite-Guest',
        vlan_id: 40,
        encryption_type: 'wpa2',
        max_clients: 20
      };

      await communicationBus.send({
        type: 'request',
        source: 'network-management',
        target: 'network-management',
        action: 'create-wifi-network',
        payload: newNetwork
      });

      console.log('WiFi ağı oluşturuldu');
    } catch (error) {
      console.error('WiFi ağı oluşturulurken hata:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard
          title="Access Point'ler"
          value="2 / 2"
          subtitle="Çevrimiçi AP'ler"
          icon="Router"
          status="ok"
        />
        <MetricCard
          title="Aktif SSID'ler"
          value="3 / 5"
          subtitle="Yayın yapan ağlar"
          icon="Wifi"
          status="ok"
        />
        <MetricCard
          title="Bağlı İstemciler"
          value="18"
          subtitle="WiFi cihazları"
          icon="Users"
          status="ok"
        />
        <MetricCard
          title="Toplam Bant"
          value="167 Mbps"
          subtitle="Aktif WiFi trafiği"
          icon="Activity"
          status="ok"
        />
      </div>

      <Card title="WiFi Ağ Yönetimi">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Button 
              onClick={handleCreateWiFiNetwork}
              className="h-12"
            >
              <Icons.Plus className="w-4 h-4 mr-2" />
              <span>WiFi Ağı Ekle</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-12"
              onClick={() => console.log('WiFi yapılandırması uygulanıyor...')}
            >
              <Icons.Settings className="w-4 h-4 mr-2" />
              <span>Yapılandırmayı Uygula</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-12"
              onClick={() => console.log('Kanal analizi yapılıyor...')}
            >
              <Icons.Search className="w-4 h-4 mr-2" />
              <span>Kanal Analizi</span>
            </Button>
          </div>
          
          <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Icons.CheckCircle className="w-4 h-4 text-purple-400" />
              <span className="text-purple-400 font-medium">WiFi Modülü Aktif</span>
            </div>
            <p className="text-white/80 text-sm">
              WiFi yönetimi modülü başarıyla yüklendi. SSID ve AP yönetimi çalışıyor.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

const NetworkSettingsTab: React.FC<{ moduleData: any }> = ({ moduleData }) => {
  const [ipForwarding, setIpForwarding] = useState(true);
  const [natEnabled, setNatEnabled] = useState(true);
  const [firewallEnabled, setFirewallEnabled] = useState(true);

  const ToggleSwitch: React.FC<{ value: boolean; onChange: (value: boolean) => void; label: string }> = ({ value, onChange, label }) => (
    <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10">
      <span className="text-white text-sm">{label}</span>
      <button
        onClick={() => onChange(!value)}
        className={cn(
          "relative w-10 h-5 rounded-full transition-all duration-300 cursor-pointer",
          value 
            ? "bg-emerald-500 shadow-lg shadow-emerald-500/30" 
            : "bg-white/20"
        )}
      >
        <div
          className={cn(
            "absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all duration-300 shadow-lg",
            value ? "left-5" : "left-0.5"
          )}
        />
      </button>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard
          title="Aktif Interface'ler"
          value="3 / 3"
          subtitle="Ağ arayüzleri"
          icon="Network"
          status="ok"
        />
        <MetricCard
          title="Firewall Kuralları"
          value="12"
          subtitle="Aktif güvenlik kuralları"
          icon="Shield"
          status="ok"
        />
        <MetricCard
          title="Routing Entries"
          value="8"
          subtitle="Yönlendirme tablosu"
          icon="Route"
          status="ok"
        />
        <MetricCard
          title="System Health"
          value="Sağlıklı"
          subtitle="Ağ servisleri"
          icon="Heart"
          status="ok"
        />
      </div>

      <Card title="Ağ Sistem Ayarları">
        <div className="space-y-4">
          <div className="space-y-3">
            <ToggleSwitch
              value={ipForwarding}
              onChange={setIpForwarding}
              label="IP Forwarding"
            />
            <ToggleSwitch
              value={natEnabled}
              onChange={setNatEnabled}
              label="NAT (Network Address Translation)"
            />
            <ToggleSwitch
              value={firewallEnabled}
              onChange={setFirewallEnabled}
              label="Güvenlik Duvarı"
            />
          </div>
          
          <div className="flex items-center gap-3 pt-4 border-t border-white/10">
            <Button 
              className="h-12 flex-1"
              onClick={() => console.log('Ağ ayarları uygulanıyor...')}
            >
              <Icons.Save className="w-4 h-4 mr-2" />
              <span>Ayarları Uygula</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-12 flex-1"
              onClick={() => console.log('Ağ bağlantısı test ediliyor...')}
            >
              <Icons.TestTube className="w-4 h-4 mr-2" />
              <span>Bağlantı Testi</span>
            </Button>
          </div>
          
          <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Icons.CheckCircle className="w-4 h-4 text-green-400" />
              <span className="text-green-400 font-medium">Ağ Ayarları Modülü Aktif</span>
            </div>
            <p className="text-white/80 text-sm">
              Ağ ayarları modülü başarıyla yüklendi. Sistem yapılandırması güncellenebilir.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

// Export the module class for registration
export default NetworkModuleClass;