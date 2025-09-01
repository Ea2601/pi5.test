import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { TableCard } from '../cards/TableCard';
import { LogCard } from '../cards/LogCard';
import { cn, formatBytes } from '../../lib/utils';
import { 
  useActiveDHCPLeases, 
  useReleaseIP, 
  useRenewLease,
  useDHCPLogs,
  useCleanupExpiredLeases,
  useSyncWithNetworkDevices
} from '../../hooks/api/useDHCP';

export const DHCPLeaseManagement: React.FC = () => {
  const [selectedMac, setSelectedMac] = useState<string>('');
  
  const { data: leases = [], isLoading } = useActiveDHCPLeases();
  const { data: logs = [] } = useDHCPLogs({ limit: 20 });
  const releaseIPMutation = useReleaseIP();
  const renewLeaseMutation = useRenewLease();
  const cleanupMutation = useCleanupExpiredLeases();
  const syncMutation = useSyncWithNetworkDevices();

  const handleReleaseIP = async (macAddress: string) => {
    if (confirm('Bu cihazın IP lease\'ini sonlandırmak istediğinizden emin misiniz?')) {
      try {
        await releaseIPMutation.mutateAsync(macAddress);
      } catch (error) {
        console.error('Release IP error:', error);
      }
    }
  };

  const handleRenewLease = async (leaseId: string, macAddress: string) => {
    try {
      await renewLeaseMutation.mutateAsync({ id: leaseId });
      alert(`${macAddress} için lease yenilendi`);
    } catch (error) {
      console.error('Renew lease error:', error);
    }
  };

  const getLeaseStatusColor = (state: string, leaseEnd: string) => {
    const now = new Date();
    const endDate = new Date(leaseEnd);
    const hoursRemaining = (endDate.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (state !== 'active') return 'bg-gray-400';
    if (hoursRemaining < 1) return 'bg-red-400';
    if (hoursRemaining < 6) return 'bg-orange-400';
    return 'bg-emerald-400';
  };

  const getLeaseStatusText = (state: string, leaseEnd: string) => {
    const now = new Date();
    const endDate = new Date(leaseEnd);
    const hoursRemaining = Math.max(0, (endDate.getTime() - now.getTime()) / (1000 * 60 * 60));

    if (state !== 'active') return state;
    if (hoursRemaining < 1) return 'Süresi dolacak';
    if (hoursRemaining < 6) return `${Math.round(hoursRemaining)}s kaldı`;
    if (hoursRemaining < 24) return `${Math.round(hoursRemaining)}s kaldı`;
    return `${Math.round(hoursRemaining / 24)}g kaldı`;
  };

  const leaseColumns = [
    { 
      key: 'device', 
      label: 'Cihaz',
      render: (value: any, row: any) => (
        <div className="flex items-center gap-3 py-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" 
                 width="24" height="24" viewBox="0 0 24 24" 
                 fill="none" stroke="currentColor" strokeWidth="2" 
                 strokeLinecap="round" strokeLinejoin="round" 
                 className="w-4 h-4 text-emerald-400">
              <rect width="14" height="20" x="5" y="2" rx="2" ry="2"/>
              <path d="M12 18h.01"/>
            </svg>
          </div>
          <div className="min-w-0">
            <p className="text-white font-medium text-sm leading-tight truncate">{row.hostname || 'Unknown Device'}</p>
            <p className="text-white/60 text-xs leading-tight font-mono">{row.mac_address}</p>
          </div>
        </div>
      )
    },
    { 
      key: 'ip_address', 
      label: 'IP Adresi',
      render: (value: string) => (
        <span className="text-white font-mono text-sm">{value}</span>
      )
    },
    { 
      key: 'lease_status', 
      label: 'Lease Durumu',
      render: (value: any, row: any) => (
        <div className="flex items-center gap-2">
          <div className={cn("w-2 h-2 rounded-full", getLeaseStatusColor(row.state, row.lease_end))} />
          <span className="text-white text-sm">{getLeaseStatusText(row.state, row.lease_end)}</span>
        </div>
      )
    },
    { 
      key: 'dhcp_pool', 
      label: 'Pool',
      render: (value: any) => (
        <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs">
          {value?.name || 'Default'}
        </span>
      )
    },
    { 
      key: 'renewal_count', 
      label: 'Yenileme',
      render: (value: number) => (
        <span className="text-white text-sm">{value}x</span>
      )
    },
    {
      key: 'actions',
      label: 'İşlemler',
      render: (value: any, row: any) => (
        <div className="flex items-center justify-center gap-1">
          <button 
            onClick={() => handleRenewLease(row.id, row.mac_address)}
            className="w-8 h-8 rounded-lg bg-green-500/20 border border-green-500/30 flex items-center justify-center hover:bg-green-500/30 transition-all duration-200"
            title="Lease Yenile"
          >
            <svg xmlns="http://www.w3.org/2000/svg" 
                 width="24" height="24" viewBox="0 0 24 24" 
                 fill="none" stroke="currentColor" strokeWidth="2" 
                 strokeLinecap="round" strokeLinejoin="round" 
                 className="w-3.5 h-3.5 text-green-400">
              <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
              <path d="M21 3v5h-5"/>
              <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
              <path d="M8 16H3v5"/>
            </svg>
          </button>
          <button 
            onClick={() => handleReleaseIP(row.mac_address)}
            className="w-8 h-8 rounded-lg bg-red-500/20 border border-red-500/30 flex items-center justify-center hover:bg-red-500/30 transition-all duration-200"
            title="IP'yi Serbest Bırak"
          >
            <svg xmlns="http://www.w3.org/2000/svg" 
                 width="24" height="24" viewBox="0 0 24 24" 
                 fill="none" stroke="currentColor" strokeWidth="2" 
                 strokeLinecap="round" strokeLinejoin="round" 
                 className="w-3.5 h-3.5 text-red-400">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <line x1="17" x2="22" y1="8" y2="13"/>
              <line x1="22" x2="17" y1="8" y2="13"/>
            </svg>
          </button>
        </div>
      )
    }
  ];

  // Convert logs to proper format for LogCard
  const dhcpLogEntries = logs.map(log => ({
    timestamp: log.timestamp,
    level: log.success ? 'info' as const : 'error' as const,
    message: `${log.event_type.toUpperCase()}: ${log.hostname || log.mac_address} → ${log.ip_address || 'N/A'}${log.error_message ? ` (${log.error_message})` : ''}`,
    source: 'DHCP Server'
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-white">Aktif DHCP Lease'leri</h3>
          <p className="text-white/70 text-sm">Canlı IP atamaları ve lease yönetimi</p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline"
            onClick={() => cleanupMutation.mutate()}
            isLoading={cleanupMutation.isPending}
          >
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" 
                   width="24" height="24" viewBox="0 0 24 24" 
                   fill="none" stroke="currentColor" strokeWidth="2" 
                   strokeLinecap="round" strokeLinejoin="round" 
                   className="w-4 h-4 mr-2">
                <path d="M3 6h18"/>
                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                <line x1="10" x2="10" y1="11" y2="17"/>
                <line x1="14" x2="14" y1="11" y2="17"/>
              </svg>
              <span className="truncate">Süresi Dolmuş Temizle</span>
            </div>
          </Button>
          <Button 
            onClick={() => syncMutation.mutate()}
            isLoading={syncMutation.isPending}
          >
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" 
                   width="24" height="24" viewBox="0 0 24 24" 
                   fill="none" stroke="currentColor" strokeWidth="2" 
                   strokeLinecap="round" strokeLinejoin="round" 
                   className="w-4 h-4 mr-2">
                <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
                <path d="M21 3v5h-5"/>
                <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
                <path d="M8 16H3v5"/>
              </svg>
              <span className="truncate">Cihazlarla Senkronize</span>
            </div>
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Active Leases Table */}
        <div className="xl:col-span-2">
          <TableCard
            title="Aktif IP Lease'leri"
            columns={leaseColumns}
            data={leases}
          />
        </div>

        {/* DHCP Activity Logs */}
        <div>
          <LogCard
            title="DHCP Sunucu Logları"
            logs={dhcpLogEntries}
            maxLines={15}
          />
        </div>
      </div>

      {/* Lease Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" 
                 width="24" height="24" viewBox="0 0 24 24" 
                 fill="none" stroke="currentColor" strokeWidth="2" 
                 strokeLinecap="round" strokeLinejoin="round" 
                 className="w-5 h-5 text-emerald-400">
              <path d="M9 12l2 2 4-4"/>
              <path d="M21 12c.552 0 1-.448 1-1V8a2 2 0 0 0-2-2h-1l-1-2h-3l-1 2H9L8 4H5a2 2 0 0 0-2 2v3c0 .552.448 1 1 1"/>
              <path d="M3 12h6v9H3z"/>
              <path d="M13 12h8v9h-8z"/>
            </svg>
            <div>
              <p className="text-white font-medium">{leases.filter(l => l.state === 'active').length}</p>
              <p className="text-white/60 text-xs">Aktif Lease</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" 
                 width="24" height="24" viewBox="0 0 24 24" 
                 fill="none" stroke="currentColor" strokeWidth="2" 
                 strokeLinecap="round" strokeLinejoin="round" 
                 className="w-5 h-5 text-orange-400">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12,6 12,12 16,14"/>
            </svg>
            <div>
              <p className="text-white font-medium">{leases.filter(l => {
                const hoursRemaining = (new Date(l.lease_end).getTime() - new Date().getTime()) / (1000 * 60 * 60);
                return hoursRemaining < 6 && hoursRemaining > 0;
              }).length}</p>
              <p className="text-white/60 text-xs">Süresi Dolacak</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" 
                 width="24" height="24" viewBox="0 0 24 24" 
                 fill="none" stroke="currentColor" strokeWidth="2" 
                 strokeLinecap="round" strokeLinejoin="round" 
                 className="w-5 h-5 text-blue-400">
              <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
              <path d="M21 3v5h-5"/>
              <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
              <path d="M8 16H3v5"/>
            </svg>
            <div>
              <p className="text-white font-medium">{leases.reduce((acc, l) => acc + l.renewal_count, 0)}</p>
              <p className="text-white/60 text-xs">Toplam Yenileme</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" 
                 width="24" height="24" viewBox="0 0 24 24" 
                 fill="none" stroke="currentColor" strokeWidth="2" 
                 strokeLinecap="round" strokeLinejoin="round" 
                 className="w-5 h-5 text-purple-400">
              <path d="M8 2v4"/>
              <path d="M16 2v4"/>
              <rect width="18" height="18" x="3" y="4" rx="2"/>
              <path d="M3 10h18"/>
              <path d="M8 14h.01"/>
              <path d="M12 14h.01"/>
              <path d="M16 14h.01"/>
              <path d="M8 18h.01"/>
              <path d="M12 18h.01"/>
              <path d="M16 18h.01"/>
            </svg>
            <div>
              <p className="text-white font-medium">{Math.round(leases.reduce((acc, l) => {
                const duration = (new Date(l.lease_end).getTime() - new Date(l.lease_start).getTime()) / (1000 * 60 * 60);
                return acc + duration;
              }, 0) / leases.length) || 0}h</p>
              <p className="text-white/60 text-xs">Ortalama Süre</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};