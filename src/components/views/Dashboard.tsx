import React from 'react';
import { MetricCard } from '../cards/MetricCard';
import { TableCard } from '../cards/TableCard';
import { ChartCard } from '../cards/ChartCard';
import { Card, Button } from '../ui';
import { SEOMeta } from '../SEO/SEOMeta';
import { useSystemMetrics, useNetworkMetrics } from '../../hooks/api/usePerformance';
import * as Icons from 'lucide-react';

const Dashboard: React.FC = () => {
  const { data: systemMetrics, isLoading: systemLoading } = useSystemMetrics();
  const { data: networkMetrics, isLoading: networkLoading } = useNetworkMetrics();

  // Standardized device data with consistent structure
  const connectedDevices = [
    {
      name: 'iPhone 14 Pro',
      mac: '00:1A:2B:3C:4D:5E',
      ip: '192.168.1.101',
      status: 'Çevrimiçi',
      signal: '-42 dBm',
      bandwidth: '45 Mbps',
      vendor: 'Apple',
      type: 'Mobil',
      uptime: '2g 14s'
    },
    {
      name: 'MacBook Pro M2',
      mac: '00:1A:2B:3C:4D:5F', 
      ip: '192.168.1.102',
      status: 'Çevrimiçi',
      signal: '-38 dBm',
      bandwidth: '120 Mbps',
      vendor: 'Apple',
      type: 'Laptop',
      uptime: '5g 8s'
    },
    {
      name: 'Samsung Smart TV',
      mac: '00:1A:2B:3C:4D:60',
      ip: '192.168.1.103', 
      status: 'Boşta',
      signal: '-55 dBm',
      bandwidth: '2 Mbps',
      vendor: 'Samsung',
      type: 'TV',
      uptime: '1g 12s'
    },
    {
      name: 'Xbox Series X',
      mac: '00:1A:2B:3C:4D:61',
      ip: '192.168.1.104',
      status: 'Çevrimiçi', 
      signal: '-48 dBm',
      bandwidth: '78 Mbps',
      vendor: 'Microsoft',
      type: 'Oyun Konsolu',
      uptime: '18s 45d'
    },
    {
      name: 'HP LaserJet Pro',
      mac: '00:1A:2B:3C:4D:62',
      ip: '192.168.1.105',
      status: 'Boşta',
      signal: '-52 dBm', 
      bandwidth: '0.1 Mbps',
      vendor: 'HP',
      type: 'Yazıcı',
      uptime: '7g 3s'
    }
  ];

  // Standardized table columns with consistent language and proper alignment
  const deviceColumns = [
    { 
      key: 'device', 
      label: 'Cihaz',
      render: (value: any, row: any) => (
        <div className="flex items-center gap-3 py-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
            <Icons.Smartphone className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="min-w-0">
            <p className="text-white font-medium text-sm leading-tight truncate">{row.name}</p>
            <p className="text-white/60 text-xs leading-tight">{row.vendor} • {row.type}</p>
          </div>
        </div>
      )
    },
    { 
      key: 'ip', 
      label: 'IP Adresi',
      render: (value: string) => (
        <span className="text-white font-mono text-sm">{value}</span>
      )
    },
    { 
      key: 'status', 
      label: 'Durum',
      render: (value: string) => (
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${
            value === 'Çevrimiçi' ? 'bg-emerald-400' : 'bg-orange-400'
          }`} />
          <span className={`px-2 py-1 rounded-md text-xs font-medium ${
            value === 'Çevrimiçi' 
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
              : 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
          }`}>
            {value}
          </span>
        </div>
      )
    },
    { 
      key: 'signal', 
      label: 'Sinyal Gücü',
      render: (value: string) => (
        <span className="text-white font-mono text-sm">{value}</span>
      )
    },
    { 
      key: 'bandwidth', 
      label: 'Bant Genişliği',
      render: (value: string) => (
        <span className="text-white font-medium text-sm">{value}</span>
      )
    },
    { 
      key: 'uptime', 
      label: 'Çalışma Süresi',
      render: (value: string) => (
        <span className="text-white/80 text-sm">{value}</span>
      )
    },
    {
      key: 'actions',
      label: 'İşlemler',
      render: () => (
        <div className="flex items-center justify-center gap-1">
          <button 
            className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center hover:bg-blue-500/30 transition-all duration-200 touch-target"
            title="Düzenle"
            aria-label="Cihazı düzenle"
          >
            <Icons.Edit className="w-3.5 h-3.5 text-blue-400" />
          </button>
          <button 
            className="w-8 h-8 rounded-lg bg-orange-500/20 border border-orange-500/30 flex items-center justify-center hover:bg-orange-500/30 transition-all duration-200 touch-target"
            title="Engelle"
            aria-label="Cihazı engelle"
          >
            <Icons.UserX className="w-3.5 h-3.5 text-orange-400" />
          </button>
          <button 
            className="w-8 h-8 rounded-lg bg-red-500/20 border border-red-500/30 flex items-center justify-center hover:bg-red-500/30 transition-all duration-200 touch-target"
            title="Kaldır"
            aria-label="Cihazı kaldır"
          >
            <Icons.Trash2 className="w-3.5 h-3.5 text-red-400" />
          </button>
        </div>
      )
    }
  ];

  // Optimized bandwidth data for better chart scaling
  const bandwidthData = Array.from({ length: 24 }, (_, i) => ({
    time: `${String(i).padStart(2, '0')}:00`,
    value: Math.floor(Math.random() * 80) + 20,
    peak: Math.floor(Math.random() * 120) + 80
  }));

  // System resource data for comprehensive monitoring
  const systemResourceData = Array.from({ length: 12 }, (_, i) => ({
    time: `${String((i * 2)).padStart(2, '0')}:00`,
    cpu: Math.floor(Math.random() * 60) + 20,
    memory: Math.floor(Math.random() * 40) + 30,
    disk: Math.floor(Math.random() * 20) + 40
  }));

  if (systemLoading || networkLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-8 h-8 border-2 border-white/30 border-t-emerald-400 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white text-balance">Bağlı Cihazlar</h1>
          <p className="text-white/70 mt-1 text-balance">Ağ cihazları ve sistem kaynak izleme</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <Icons.RefreshCw className="w-4 h-4 mr-2" />
            Yenile
          </Button>
          <Button size="sm">
            <Icons.Search className="w-4 h-4 mr-2" />
            Cihaz Keşfi
          </Button>
        </div>
      </div>

      {/* Device-Specific Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Toplam Cihaz"
          value={String(networkMetrics?.totalDevices ?? 23)}
          subtitle="Ağda kayıtlı"
          icon="Router"
          trend="up"
          trendValue="+2 bugün"
          status="ok"
        />
        <MetricCard
          title="Aktif Bağlantılar"
          value={String(networkMetrics?.activeDevices ?? 18)}
          subtitle="Şu anda çevrimiçi"
          icon="Wifi"
          trend="stable"
          trendValue="Stabil"
          status="ok"
        />
        <MetricCard
          title="Ağ Kullanımı"
          value={`${networkMetrics?.bandwidth ?? 167} Mbps`}
          subtitle="1 Gbps kapasiteden"
          icon="Activity"
          trend="up"
          trendValue="+12%"
          status="ok"
        />
        <MetricCard
          title="Yeni Cihazlar"
          value="3"
          subtitle="Son 24 saatte"
          icon="Plus"
          status="warn"
        />
      </div>

      {/* System Resource Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Disk Kullanımı"
          value={`${systemMetrics?.disk ?? 67}%`}
          subtitle="847 GB / 1.2 TB kullanılan"
          icon="HardDrive"
          trend="up"
          trendValue="+5% bu ay"
          status="warn"
        />
        <MetricCard
          title="CPU Kullanımı"
          value={`${systemMetrics?.cpu ?? 34}%`}
          subtitle="Ortalama yük"
          icon="Cpu"
          trend="stable"
          trendValue="Normal"
          status="ok"
        />
        <MetricCard
          title="RAM Kullanımı"
          value={`${systemMetrics?.memory ?? 52}%`}
          subtitle="4.1 GB / 8 GB kullanılan"
          icon="MemoryStick"
          trend="stable"
          trendValue="Stabil"
          status="ok"
        />
        <MetricCard
          title="Ağ Gecikmesi"
          value={`${networkMetrics?.latency ?? 12}ms`}
          subtitle="İnternet erişimi"
          icon="Gauge"
          trend="down"
          trendValue="-3ms"
          status="ok"
        />
      </div>

      {/* Charts Section - Responsive layout */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="space-y-4">
          <ChartCard
            title="Cihaz Bant Genişliği Kullanımı (24 Saat)"
            data={bandwidthData}
            type="area"
            color="#00A36C"
          />
        </div>
        
        <div className="space-y-4">
          <ChartCard
            title="Sistem Kaynakları (12 Saat)"
            data={systemResourceData}
            type="line"
            color="#39d9a7"
          />
        </div>
      </div>

      {/* Quick Actions and Storage Status */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card title="Hızlı İşlemler" className="lg:col-span-1">
          <div className="space-y-3">
            <Button className="w-full h-12 whitespace-nowrap">
              <Icons.Search className="w-4 h-4" />
              Cihaz Keşfi
            </Button>
            <Button variant="outline" className="w-full h-12 whitespace-nowrap">
              <Icons.Scan className="w-4 h-4" />
              Ağ Taraması
            </Button>
            <Button variant="outline" className="w-full h-12 whitespace-nowrap">
              <Icons.BarChart3 className="w-4 h-4" />
              Kullanım Raporu
            </Button>
            <Button variant="outline" className="w-full h-12 whitespace-nowrap">
              <Icons.UserX className="w-4 h-4" />
              Cihaz Engelle
            </Button>
          </div>
        </Card>

        {/* VPN Status Summary */}
        <Card title="VPN Durumu" className="lg:col-span-1">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
              <div className="flex items-center gap-2">
                <Icons.Server className="w-4 h-4 text-emerald-400" />
                <span className="text-white text-sm">WireGuard Sunucuları</span>
              </div>
              <span className="text-white font-medium">2 / 3</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
              <div className="flex items-center gap-2">
                <Icons.Users className="w-4 h-4 text-blue-400" />
                <span className="text-white text-sm">Aktif İstemciler</span>
              </div>
              <span className="text-white font-medium">8 / 12</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
              <div className="flex items-center gap-2">
                <Icons.Shield className="w-4 h-4 text-purple-400" />
                <span className="text-white text-sm">Tünel Durumu</span>
              </div>
              <span className="text-emerald-400 font-medium text-sm">Sağlıklı</span>
            </div>
          </div>
        </Card>

        {/* Storage Partitions */}
        <Card title="Depolama Bölümleri" className="lg:col-span-2">
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <Icons.HardDrive className="w-4 h-4 text-white/70 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-white text-sm font-medium">/dev/sda1 (Sistem)</p>
                  <p className="text-white/60 text-xs">847 GB / 1.2 TB kullanılan</p>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-white font-medium">67%</p>
                <div className="w-20 h-1.5 bg-white/10 rounded-full mt-1">
                  <div className="w-[67%] h-full bg-orange-400 rounded-full"></div>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <Icons.Database className="w-4 h-4 text-white/70 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-white text-sm font-medium">/dev/sda2 (Veri)</p>
                  <p className="text-white/60 text-xs">234 GB / 500 GB kullanılan</p>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-white font-medium">47%</p>
                <div className="w-20 h-1.5 bg-white/10 rounded-full mt-1">
                  <div className="w-[47%] h-full bg-emerald-400 rounded-full"></div>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <Icons.Archive className="w-4 h-4 text-white/70 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-white text-sm font-medium">/dev/sda3 (Yedek)</p>
                  <p className="text-white/60 text-xs">45 GB / 200 GB kullanılan</p>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-white font-medium">23%</p>
                <div className="w-20 h-1.5 bg-white/10 rounded-full mt-1">
                  <div className="w-[23%] h-full bg-emerald-400 rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Connected Devices Table - Responsive */}
      <TableCard
        title="Bağlı Cihazlar"
        columns={deviceColumns}
        data={connectedDevices}
      />
    </div>
  );
};

export default Dashboard;