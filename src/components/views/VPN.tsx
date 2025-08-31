import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as Icons from 'lucide-react';
import { MetricCard } from '../cards/MetricCard';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { cn } from '../../lib/utils';
import { SEOMeta } from '../SEO/SEOMeta';
import { ServerManagement } from '../vpn/ServerManagement';
import { ClientManagement } from '../vpn/ClientManagement';
import { AutoWGInstaller } from '../vpn/AutoWGInstaller';
import { useWireGuardServers, useWireGuardClients } from '../../hooks/api/useWireGuard';

const VPN: React.FC = () => {
  const [activeTab, setActiveTab] = useState('servers');
  
  const { data: servers = [], isLoading: serversLoading } = useWireGuardServers();
  const { data: clients = [], isLoading: clientsLoading } = useWireGuardClients();

  const activeServers = servers.filter(s => s.is_active);
  const activeClients = clients.filter(c => c.is_enabled && c.connection_status === 'connected');
  const totalTraffic = clients.reduce((acc, client) => acc + client.rx_bytes + client.tx_bytes, 0);

  const tabs = [
    { id: 'servers', label: 'Sunucular', icon: 'Server' },
    { id: 'clients', label: 'İstemciler', icon: 'Users' },
    { id: 'auto-wg', label: 'Auto WG', icon: 'Zap' },
    { id: 'settings', label: 'Ayarlar', icon: 'Settings' }
  ];

  const isLoading = serversLoading || clientsLoading;

  const serverColumns = [
    { 
      key: 'name', 
      label: 'Sunucu Adı',
      render: (value: string, row: WireGuardServer) => (
        <div>
          <p className="text-white font-medium">{value}</p>
          <p className="text-white/60 text-xs">{row.endpoint}</p>
        </div>
      )
    },
    { key: 'allowedIPs', label: 'İzin Verilen IP\'ler' },
    { key: 'lastHandshake', label: 'Son Bağlantı' },
    { key: 'rxBytes', label: 'İndirilen', render: (value: number) => formatBytes(value) },
    { key: 'txBytes', label: 'Yüklenen', render: (value: number) => formatBytes(value) },
    { 
      key: 'status', 
      label: 'Durum',
      render: (value: string) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          value === 'connected' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
          value === 'connecting' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
          'bg-red-500/20 text-red-400 border border-red-500/30'
        }`}>
          {value === 'connected' ? 'Bağlı' : value === 'connecting' ? 'Bağlanıyor' : 'Bağlı Değil'}
        </span>
      )
    }
  ];

  const clientColumns = [
    { 
      key: 'name', 
      label: 'İstemci Adı',
      render: (value: string, row: WireGuardClient) => (
        <div>
          <p className="text-white font-medium">{value}</p>
          <p className="text-white/60 text-xs">{row.allowedIPs}</p>
        </div>
      )
    },
    { key: 'lastHandshake', label: 'Son Bağlantı' },
    { key: 'rxBytes', label: 'İndirilen', render: (value: number) => formatBytes(value) },
    { key: 'txBytes', label: 'Yüklenen', render: (value: number) => formatBytes(value) },
    { 
      key: 'enabled', 
      label: 'Durum',
      render: (value: boolean, row: WireGuardClient) => (
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${
            value && row.status === 'connected' ? 'bg-emerald-400' : 'bg-red-400'
          }`} />
          <span className="text-white">
            {value ? (row.status === 'connected' ? 'Bağlı' : 'Etkin') : 'Devre Dışı'}
          </span>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <SEOMeta
        title="VPN Yönetimi"
        description="WireGuard VPN sunucu ve istemci yönetimi"
      />
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">WireGuard VPN Yönetimi</h1>
          <p className="text-white/70 mt-1">Sunucu bağlantıları ve istemci tünel yönetimi</p>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <MetricCard
          title="Aktif Sunucu Bağlantıları"
          value={String(activeServers.length)}
          subtitle={`${servers.length} sunucudan`}
          icon="Server"
          status="ok"
        />
        <MetricCard
          title="Bağlı İstemciler"
          value={String(activeClients.length)}
          subtitle={`${clients.length} istemciden`}
          icon="Users"
          status="ok"
        />
        <MetricCard
          title="Toplam Veri Trafiği"
          value={totalTraffic > 0 ? `${(totalTraffic / (1024 * 1024 * 1024)).toFixed(1)} GB` : '0 GB'}
          subtitle="Bu ay"
          icon="Activity"
          trend="up"
          trendValue="+15%"
          status="ok"
        />
        <MetricCard
          title="Tünel Durumu"
          value="Sağlıklı"
          subtitle="Tüm bağlantılar aktif"
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
            <ServerManagement />
          )}

          {activeTab === 'clients' && (
            <ClientManagement />
          )}

          {activeTab === 'auto-wg' && (
            <AutoWGInstaller />
          )}

          {activeTab === 'settings' && (
            <Card title="VPN Genel Ayarları">
              <div className="space-y-4">
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Icons.Info className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-400 font-medium">Sistem Durumu</span>
                  </div>
                  <p className="text-white/80 text-sm">
                    WireGuard servisleri normal çalışıyor. Toplam {servers.length} sunucu, 
                    {activeServers.length} aktif, {activeClients.length} bağlı istemci.
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <h4 className="text-white font-medium">Sistem Bilgileri</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-white/60">WireGuard Sürümü:</span>
                        <span className="text-white">1.0.20210914</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60">Kernel Modülü:</span>
                        <span className="text-emerald-400">Yüklü</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60">IPv4 Forwarding:</span>
                        <span className="text-emerald-400">Etkin</span>
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
    </div>
  );
};

export default VPN;