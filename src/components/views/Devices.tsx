import React from 'react';
import { MetricCard } from '../cards/MetricCard';
import { TableCard } from '../cards/TableCard';
import { ChartCard } from '../cards/ChartCard';
import { Card, Button } from '../ui';
import { SEOMeta } from '../SEO/SEOMeta';
import { useNetworkMetrics } from '../../hooks/api/usePerformance';
import * as Icons from 'lucide-react';

const Devices: React.FC = () => {
  const { data: networkMetrics, isLoading } = useNetworkMetrics();

  const devices = [
    {
      name: 'iPhone 14 Pro',
      mac: '00:1A:2B:3C:4D:5E',
      ip: '192.168.1.101',
      status: 'Çevrimiçi',
      signal: '-42 dBm',
      bandwidth: '45 Mbps',
      firstSeen: '2 gün önce',
      vendor: 'Apple'
    },
    {
      name: 'MacBook Pro M2',
      mac: '00:1A:2B:3C:4D:5F',
      ip: '192.168.1.102',
      status: 'Çevrimiçi',
      signal: '-38 dBm',
      bandwidth: '120 Mbps',
      firstSeen: '5 gün önce',
      vendor: 'Apple'
    },
    {
      name: 'Akıllı TV',
      mac: '00:1A:2B:3C:4D:60',
      ip: '192.168.1.103',
      status: 'Boşta',
      signal: '-55 dBm',
      bandwidth: '2 Mbps',
      firstSeen: '1 hafta önce',
      vendor: 'Samsung'
    }
  ];

  const deviceColumns = [
    { 
      key: 'name', 
      label: 'Cihaz',
      render: (value: string, row: any) => (
        <div className="min-w-0">
          <p className="text-white font-medium truncate">{value}</p>
          <p className="text-white/60 text-xs">{row.vendor}</p>
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
      key: 'mac', 
      label: 'MAC Adresi',
      render: (value: string) => (
        <span className="text-white/80 font-mono text-xs">{value}</span>
      )
    },
    { 
      key: 'status', 
      label: 'Durum',
      render: (value: string) => (
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${
            value === 'Çevrimiçi' ? 'bg-emerald-400' : 'bg-white/40'
          }`} />
          <span className="text-white text-sm">{value}</span>
        </div>
      )
    },
    { 
      key: 'signal', 
      label: 'Sinyal',
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
    }
  ];

  const bandwidthData = Array.from({ length: 24 }, (_, i) => ({
    time: `${i}:00`,
    value: Math.floor(Math.random() * 150) + 20
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white text-balance">Cihaz Yönetimi</h1>
          <p className="text-white/70 mt-1 text-balance">Bağlı cihazlar ve ağ topolojisi</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" 
                   width="24" height="24" viewBox="0 0 24 24" 
                   fill="none" stroke="currentColor" strokeWidth="2" 
                   strokeLinecap="round" strokeLinejoin="round" 
                   className="lucide lucide-refresh-cw w-4 h-4 mr-2">
                <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
                <path d="M21 3v5h-5"/>
                <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
                <path d="M8 16H3v5"/>
              </svg>
              <span className="truncate">Yenile</span>
            </div>
          </Button>
          <Button size="sm">
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" 
                   width="24" height="24" viewBox="0 0 24 24" 
                   fill="none" stroke="currentColor" strokeWidth="2" 
                   strokeLinecap="round" strokeLinejoin="round" 
                   className="lucide lucide-search w-4 h-4 mr-2">
                <circle cx="11" cy="11" r="8"/>
                <path d="m21 21-4.35-4.35"/>
              </svg>
              <span className="truncate">Cihaz Tara</span>
            </div>
          </Button>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Toplam Cihaz"
          value={String(networkMetrics?.totalDevices ?? 23)}
          subtitle="Ağda aktif"
          icon="Router"
          trend="up"
          trendValue="+2 bugün"
          status="ok"
        />
        <MetricCard
          title="Yeni Cihazlar"
          value="1"
          subtitle="Son 24 saat"
          icon="Plus"
          status="ok"
        />
        <MetricCard
          title="Bant Genişliği Kullanımı"
          value={`${networkMetrics?.bandwidth ?? 167} Mbps`}
          subtitle="1 Gbps'den kullanılan"
          icon="Activity"
          trend="stable"
          trendValue="Normal"
          status="ok"
        />
        <MetricCard
          title="Wi-Fi İstemcileri"
          value="12"
          subtitle="Kablosuz bağlı"
          icon="Wifi"
          status="ok"
        />
      </div>

      {/* Main Content - Responsive layout */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Bandwidth Chart */}
        <div className="xl:col-span-2">
          <ChartCard
            title="Cihaz Bant Genişliği Kullanımı (24s)"
            data={bandwidthData}
            type="area"
            color="#00A36C"
          />
        </div>

        {/* Quick Actions */}
        <Card title="Hızlı İşlemler">
          <div className="space-y-3">
           <Button className="w-full justify-start">
             <div className="flex items-center">
               <svg xmlns="http://www.w3.org/2000/svg" 
                    width="24" height="24" viewBox="0 0 24 24" 
                    fill="none" stroke="currentColor" strokeWidth="2" 
                    strokeLinecap="round" strokeLinejoin="round" 
                    className="lucide lucide-search w-4 h-4 mr-2">
                 <circle cx="11" cy="11" r="8"/>
                 <path d="m21 21-4.35-4.35"/>
               </svg>
               <span className="truncate">Cihaz Tara</span>
             </div>
           </Button>
           <Button variant="outline" className="w-full justify-start">
             <div className="flex items-center">
               <svg xmlns="http://www.w3.org/2000/svg" 
                    width="24" height="24" viewBox="0 0 24 24" 
                    fill="none" stroke="currentColor" strokeWidth="2" 
                    strokeLinecap="round" strokeLinejoin="round" 
                    className="lucide lucide-scan w-4 h-4 mr-2">
                 <path d="M3 7V5a2 2 0 0 1 2-2h2"/>
                 <path d="M17 3h2a2 2 0 0 1 2 2v2"/>
                 <path d="M21 17v2a2 2 0 0 1-2 2h-2"/>
                 <path d="M7 21H5a2 2 0 0 1-2-2v-2"/>
               </svg>
               <span className="truncate">Ağ Keşfi</span>
             </div>
           </Button>
           <Button variant="outline" className="w-full justify-start">
             <div className="flex items-center">
               <svg xmlns="http://www.w3.org/2000/svg" 
                    width="24" height="24" viewBox="0 0 24 24" 
                    fill="none" stroke="currentColor" strokeWidth="2" 
                    strokeLinecap="round" strokeLinejoin="round" 
                    className="lucide lucide-bar-chart-3 w-4 h-4 mr-2">
                 <path d="M3 3v18h18"/>
                 <path d="M18 17V9"/>
                 <path d="M13 17V5"/>
                 <path d="M8 17v-3"/>
               </svg>
               <span className="truncate">Rapor Al</span>
             </div>
           </Button>
           <Button variant="outline" className="w-full justify-start">
             <div className="flex items-center">
               <svg xmlns="http://www.w3.org/2000/svg" 
                    width="24" height="24" viewBox="0 0 24 24" 
                    fill="none" stroke="currentColor" strokeWidth="2" 
                    strokeLinecap="round" strokeLinejoin="round" 
                    className="lucide lucide-user-x w-4 h-4 mr-2">
                 <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                 <circle cx="9" cy="7" r="4"/>
                 <line x1="17" x2="22" y1="8" y2="13"/>
                 <line x1="22" x2="17" y1="8" y2="13"/>
               </svg>
               <span className="truncate">Engelle</span>
             </div>
           </Button>
          </div>
        </Card>
      </div>

      {/* Devices Table */}
      <TableCard
        title="Bağlı Cihazlar"
        columns={deviceColumns}
        data={devices}
      />
    </div>
  );
};

export default Devices;