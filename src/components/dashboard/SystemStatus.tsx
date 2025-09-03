import React from 'react';
import { Card } from '../ui/Card';
import * as Icons from 'lucide-react';

export const SystemStatus: React.FC = () => {
  return (
    <Card title="VPN Durumu">
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
  );
};