import React from 'react';
import { Card } from '../ui/Card';
import { TableCard } from '../cards/TableCard';
import * as Icons from 'lucide-react';

export const WiFiClientManagement: React.FC = () => {
  const mockClients = [
    {
      id: 'client-1',
      device_name: 'iPhone 14 Pro',
      mac_address: '00:1A:2B:3C:4D:5E',
      ip_address: '192.168.20.101',
      ssid: 'Infinite-Home',
      signal_strength: '-42 dBm',
      status: 'connected'
    },
    {
      id: 'client-2',
      device_name: 'MacBook Pro',
      mac_address: '00:1A:2B:3C:4D:5F',
      ip_address: '192.168.20.102',
      ssid: 'Infinite-Home',
      signal_strength: '-38 dBm',
      status: 'connected'
    }
  ];

  const clientColumns = [
    { 
      key: 'device_name', 
      label: 'Cihaz',
      render: (value: string, row: any) => (
        <div>
          <p className="text-white font-medium">{value}</p>
          <p className="text-white/60 text-xs">{row.mac_address}</p>
        </div>
      )
    },
    { key: 'ip_address', label: 'IP Adresi' },
    { key: 'ssid', label: 'SSID' },
    { key: 'signal_strength', label: 'Sinyal' },
    { 
      key: 'status', 
      label: 'Durum',
      render: (value: string) => (
        <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded text-xs">
          {value === 'connected' ? 'Bağlı' : 'Bağlı Değil'}
        </span>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-white">WiFi İstemcileri</h3>
        <p className="text-white/70 text-sm">Bağlı kablosuz cihazlar</p>
      </div>

      <TableCard
        title="Bağlı WiFi Cihazları"
        columns={clientColumns}
        data={mockClients}
      />
    </div>
  );
};