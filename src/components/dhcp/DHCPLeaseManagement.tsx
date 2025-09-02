import React from 'react';
import { Card } from '../ui/Card';
import * as Icons from 'lucide-react';

export const DHCPLeaseManagement: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-white">Aktif DHCP Lease'leri</h3>
        <p className="text-white/70 text-sm">Canlı IP atamaları</p>
      </div>

      <Card>
        <div className="text-center py-12">
          <Icons.Users className="w-16 h-16 text-white/30 mx-auto mb-4" />
          <h3 className="text-white font-semibold mb-2">Aktif Lease'ler</h3>
          <p className="text-white/60">Canlı IP atamaları burada görünecek</p>
        </div>
      </Card>
    </div>
  );
};