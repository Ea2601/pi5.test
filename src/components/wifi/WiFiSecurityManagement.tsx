import React from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import * as Icons from 'lucide-react';

export const WiFiSecurityManagement: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-white">WiFi Güvenlik</h3>
          <p className="text-white/70 text-sm">Erişim kontrolü ve güvenlik</p>
        </div>
        <Button>
          <Icons.Plus className="w-4 h-4 mr-2" />
          Güvenlik Politikası
        </Button>
      </div>

      <Card>
        <div className="text-center py-12">
          <Icons.Shield className="w-16 h-16 text-white/30 mx-auto mb-4" />
          <h3 className="text-white font-semibold mb-2">WiFi Güvenlik Politikaları</h3>
          <p className="text-white/60">Güvenlik kuralları burada görünecek</p>
        </div>
      </Card>
    </div>
  );
};