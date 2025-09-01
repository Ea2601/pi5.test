import React, { useState } from 'react';
import { motion } from 'framer-motion';
import * as Icons from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { TableCard } from '../cards/TableCard';
import { ChartCard } from '../cards/ChartCard';
import { cn, formatBytes } from '../../lib/utils';
import { 
  useWiFiClients, 
  useWiFiNetworks,
  useDisconnectWiFiClient, 
  useBlockWiFiClient, 
  useUnblockWiFiClient,
  useWiFiClientSignals,
  useSetClientBandwidth
} from '../../hooks/api/useWiFi';
import { WiFiClient } from '../../types/wifi';

interface ClientFilters {
  network_id?: string;
  status?: string;
  signal_threshold?: number;
}

export const WiFiClientManagement: React.FC = () => {
  const [filters, setFilters] = useState<ClientFilters>({});
  const [selectedClients, setSelectedClients] = useState<string[]>([]);
  
  const { data: clients = [], isLoading } = useWiFiClients(filters);
  const { data: networks = [] } = useWiFiNetworks();
  const { data: signalData = [] } = useWiFiClientSignals();
  const disconnectMutation = useDisconnectWiFiClient();
  const blockMutation = useBlockWiFiClient();
  const unblockMutation = useUnblockWiFiClient();
  const setBandwidthMutation = useSetClientBandwidth();

  const handleDisconnectClient = async (clientId: string) => {
    if (confirm('Bu cihazın bağlantısını kesmek istediğinizden emin misiniz?')) {
      try {
        await disconnectMutation.mutateAsync(clientId);
      } catch (error) {
        console.error('Disconnect client error:', error);
      }
    }
  };

  const handleBlockClient = async (macAddress: string) => {
    if (confirm('Bu cihazı engellemek istediğinizden emin misiniz?')) {
      try {
        await blockMutation.mutateAsync(macAddress);
      } catch (error) {
        console.error('Block client error:', error);
      }
    }
  };

  const handleUnblockClient = async (macAddress: string) => {
    try {
      await unblockMutation.mutateAsync(macAddress);
    } catch (error) {
      console.error('Unblock client error:', error);
    }
  };

  const handleSetBandwidth = async (clientId: string) => {
    const limit = prompt('Bant genişliği limiti (Mbps):');
    if (limit) {
      try {
        await setBandwidthMutation.mutateAsync({ clientId, limitMbps: parseInt(limit) });
        alert(`Bant genişliği limiti ${limit} Mbps olarak ayarlandı`);
      } catch (error) {
        console.error('Set bandwidth error:', error);
      }
    }
  };

  const getSignalIcon = (signal?: number) => {
    if (!signal) return Icons.WifiOff;
    if (signal > -50) return Icons.Wifi;
    if (signal > -70) return Icons.Wifi;
    return Icons.WifiOff;
  };

  const getSignalColor = (signal?: number) => {
    if (!signal) return 'text-gray-400';
    if (signal > -50) return 'text-emerald-400';
    if (signal > -70) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getSignalText = (signal?: number) => {
    if (!signal) return 'Bağlı değil';
    if (signal > -50) return 'Mükemmel';
    if (signal > -70) return 'İyi';
    if (signal > -80) return 'Zayıf';
    return 'Çok zayıf';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'bg-emerald-400';
      case 'blocked': return 'bg-red-400';
      case 'idle': return 'bg-yellow-400';
      default: return 'bg-gray-400';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'connected': return 'Bağlı';
      case 'blocked': return 'Engellendi';
      case 'idle': return 'Boşta';
      case 'disconnected': return 'Bağlı Değil';
      default: return status;
    }
  };

  const clientColumns = [
    { 
      key: 'device', 
      label: 'Cihaz',
      render: (value: any, row: WiFiClient) => (
        <div className="flex items-center gap-3 py-2">
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center flex-shrink-0">
            <Icons.Smartphone className="w-4 h-4 text-blue-400" />
          </div>
          <div className="min-w-0">
            <p className="text-white font-medium text-sm leading-tight truncate">
              {row.device_name || row.hostname || 'Unknown Device'}
            </p>
            <p className="text-white/60 text-xs leading-tight">{row.vendor}</p>
          </div>
        </div>
      )
    },
    { 
      key: 'connected_ssid', 
      label: 'SSID',
      render: (value: string, row: any) => (
        <div>
          <p className="text-white text-sm">{value}</p>
          <p className="text-white/60 text-xs">VLAN {row.network?.vlan_id || 'N/A'}</p>
        </div>
      )
    },
    { 
      key: 'ip_address', 
      label: 'IP Adresi',
      render: (value: string) => (
        <span className="text-white font-mono text-sm">{value || 'N/A'}</span>
      )
    },
    { 
      key: 'signal_strength', 
      label: 'Sinyal Gücü',
      render: (value: any, row: WiFiClient) => {
        const SignalIcon = getSignalIcon(row.signal_strength_dbm);
        return (
          <div className="flex items-center gap-2">
            <SignalIcon className={cn("w-4 h-4", getSignalColor(row.signal_strength_dbm))} />
            <div>
              <p className="text-white text-sm">{row.signal_strength_dbm || 'N/A'} dBm</p>
              <p className="text-white/60 text-xs">{getSignalText(row.signal_strength_dbm)}</p>
            </div>
          </div>
        );
      }
    },
    { 
      key: 'data_usage', 
      label: 'Veri Kullanımı',
      render: (value: any, row: WiFiClient) => (
        <div>
          <p className="text-white text-sm">
            {formatBytes(row.bytes_sent + row.bytes_received)}
          </p>
          <p className="text-white/60 text-xs">
            ↑{formatBytes(row.bytes_sent)} ↓{formatBytes(row.bytes_received)}
          </p>
        </div>
      )
    },
    { 
      key: 'connection_status', 
      label: 'Durum',
      render: (value: string) => (
        <div className="flex items-center gap-2">
          <div className={cn("w-2 h-2 rounded-full", getStatusColor(value))} />
          <span className="text-white text-sm">{getStatusText(value)}</span>
        </div>
      )
    },
    {
      key: 'actions',
      label: 'İşlemler',
      render: (value: any, row: WiFiClient) => (
        <div className="flex items-center justify-center gap-1">
          {row.connection_status === 'connected' && (
            <button 
              onClick={() => handleDisconnectClient(row.id)}
              className="w-8 h-8 rounded-lg bg-orange-500/20 border border-orange-500/30 flex items-center justify-center hover:bg-orange-500/30 transition-all duration-200"
              title="Bağlantıyı Kes"
            >
              <Icons.WifiOff className="w-3.5 h-3.5 text-orange-400" />
            </button>
          )}
          {row.connection_status !== 'blocked' ? (
            <button 
              onClick={() => handleBlockClient(row.mac_address)}
              className="w-8 h-8 rounded-lg bg-red-500/20 border border-red-500/30 flex items-center justify-center hover:bg-red-500/30 transition-all duration-200"
              title="Cihazı Engelle"
            >
              <Icons.Ban className="w-3.5 h-3.5 text-red-400" />
            </button>
          ) : (
            <button 
              onClick={() => handleUnblockClient(row.mac_address)}
              className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center hover:bg-emerald-500/30 transition-all duration-200"
              title="Engeli Kaldır"
            >
              <Icons.Check className="w-3.5 h-3.5 text-emerald-400" />
            </button>
          )}
          <button 
            onClick={() => handleSetBandwidth(row.id)}
            className="w-8 h-8 rounded-lg bg-purple-500/20 border border-purple-500/30 flex items-center justify-center hover:bg-purple-500/30 transition-all duration-200"
            title="Bant Genişliği Ayarla"
          >
            <Icons.Gauge className="w-3.5 h-3.5 text-purple-400" />
          </button>
        </div>
      )
    }
  ];

  // Generate signal strength chart data
  const signalChartData = signalData.slice(0, 20).map((signal, index) => ({
    time: `${index}`,
    signal: Math.abs(signal.signal),
    noise: Math.abs(signal.noise),
    snr: signal.snr
  }));

  const connectedClients = clients.filter(c => c.connection_status === 'connected');
  const averageSignal = connectedClients.length > 0 
    ? connectedClients.reduce((acc, client) => acc + (client.signal_strength_dbm || -70), 0) / connectedClients.length
    : -70;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-white">Bağlı Wi-Fi Cihazları</h3>
          <p className="text-white/70 text-sm">Kablosuz istemci izleme ve yönetimi</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={filters.network_id || ''}
            onChange={(e) => setFilters({ ...filters, network_id: e.target.value || undefined })}
            className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none"
          >
            <option value="">Tüm SSID'ler</option>
            {networks.map((network) => (
              <option key={network.id} value={network.id} className="bg-gray-800">
                {network.ssid} (VLAN {network.vlan_id})
              </option>
            ))}
          </select>
          <Button variant="outline" size="sm">
            <Icons.RefreshCw className="w-4 h-4 mr-2" />
            Yenile
          </Button>
        </div>
      </div>

      {/* Signal Monitoring */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title="Sinyal Gücü İzleme (Canlı)"
          data={signalChartData}
          type="line"
          color="#4ECDC4"
        />
        
        <Card title="Wi-Fi Performans Özeti">
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
              <div className="flex items-center gap-2">
                <Icons.Users className="w-4 h-4 text-emerald-400" />
                <span className="text-white text-sm">Toplam Bağlı Cihaz</span>
              </div>
              <span className="text-white font-medium">{connectedClients.length}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
              <div className="flex items-center gap-2">
                <Icons.Signal className="w-4 h-4 text-blue-400" />
                <span className="text-white text-sm">Ortalama Sinyal</span>
              </div>
              <span className="text-white font-medium">{Math.round(averageSignal)} dBm</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
              <div className="flex items-center gap-2">
                <Icons.Activity className="w-4 h-4 text-purple-400" />
                <span className="text-white text-sm">Toplam Trafik</span>
              </div>
              <span className="text-white font-medium">
                {formatBytes(clients.reduce((acc, c) => acc + c.bytes_sent + c.bytes_received, 0))}
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* Client Filters */}
      <Card title="İstemci Filtreleri">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-white text-sm">Durum:</label>
            <select
              value={filters.status || ''}
              onChange={(e) => setFilters({ ...filters, status: e.target.value || undefined })}
              className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none"
            >
              <option value="">Tümü</option>
              <option value="connected" className="bg-gray-800">Bağlı</option>
              <option value="blocked" className="bg-gray-800">Engellendi</option>
              <option value="idle" className="bg-gray-800">Boşta</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-white text-sm">Min. Sinyal:</label>
            <select
              value={filters.signal_threshold || ''}
              onChange={(e) => setFilters({ ...filters, signal_threshold: e.target.value ? parseInt(e.target.value) : undefined })}
              className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none"
            >
              <option value="">Tümü</option>
              <option value="-50" className="bg-gray-800">Mükemmel (-50 dBm)</option>
              <option value="-70" className="bg-gray-800">İyi (-70 dBm)</option>
              <option value="-80" className="bg-gray-800">Zayıf (-80 dBm)</option>
            </select>
          </div>

          <Button variant="outline" size="sm">
            <Icons.Download className="w-4 h-4 mr-2" />
            Rapor İndir
          </Button>
        </div>
      </Card>

      {/* Bulk Actions */}
      {selectedClients.length > 0 && (
        <Card title="Toplu İşlemler" className="border-orange-500/30 bg-orange-500/5">
          <div className="flex items-center gap-3">
            <span className="text-white">
              {selectedClients.length} cihaz seçili
            </span>
            <Button size="sm" variant="destructive">
              <Icons.Ban className="w-4 h-4 mr-1" />
              Seçilenleri Engelle
            </Button>
            <Button size="sm" variant="outline">
              <Icons.WifiOff className="w-4 h-4 mr-1" />
              Bağlantıyı Kes
            </Button>
            <Button size="sm" variant="outline">
              <Icons.Gauge className="w-4 h-4 mr-1" />
              Bant Limiti
            </Button>
          </div>
        </Card>
      )}

      {/* Connected Clients Table */}
      <TableCard
        title="Bağlı Wi-Fi Cihazları"
        columns={clientColumns}
        data={clients}
      />

      {/* Network Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {networks.filter(n => n.is_enabled).map((network) => {
          const networkClients = clients.filter(c => c.network_id === network.id && c.connection_status === 'connected');
          const utilizationPercent = Math.round((networkClients.length / network.max_clients) * 100);
          
          return (
            <Card key={network.id} className="p-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icons.Wifi className="w-4 h-4 text-emerald-400" />
                    <span className="text-white font-medium text-sm">{network.ssid}</span>
                  </div>
                  <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs">
                    VLAN {network.vlan_id}
                  </span>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-white/60">İstemci:</span>
                    <span className="text-white">{networkClients.length} / {network.max_clients}</span>
                  </div>
                  <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className={cn(
                        "h-full rounded-full transition-all",
                        utilizationPercent > 90 ? "bg-red-400" :
                        utilizationPercent > 75 ? "bg-orange-400" : "bg-emerald-400"
                      )}
                      style={{ width: `${utilizationPercent}%` }}
                    />
                  </div>
                  <p className="text-white/60 text-xs">{utilizationPercent}% kapasite kullanımı</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};