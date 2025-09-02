import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import * as Icons from 'lucide-react';

export const DHCPReservationManagement: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-white">DHCP Rezervasyonları</h3>
          <p className="text-white/70 text-sm">Statik IP atamaları</p>
        </div>
        <Button>
          <Icons.Plus className="w-4 h-4 mr-2" />
          Rezervasyon
        </Button>
      </div>

      <Card>
        <div className="text-center py-12">
          <Icons.Shield className="w-16 h-16 text-white/30 mx-auto mb-4" />
          <h3 className="text-white font-semibold mb-2">DHCP Rezervasyonları</h3>
          <p className="text-white/60">Statik IP atamaları burada görünecek</p>
        </div>
      </Card>
    </div>
  );
};