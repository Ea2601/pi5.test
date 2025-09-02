import React from 'react';
import { Card } from '../ui/Card';
import { MetricCard } from '../cards/MetricCard';
import * as Icons from 'lucide-react';

export const WiFiPerformanceMonitoring: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-white">WiFi Performans</h3>
        <p className="text-white/70 text-sm">Sinyal kalitesi ve performans izleme</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard
          title="Ortalama Sinyal"
          value="-58 dBm"
          subtitle="Tüm istemciler"
          icon="Signal"
          status="ok"
        />
        <MetricCard
          title="Kanal Kullanımı"
          value="45%"
          subtitle="2.4GHz band"
          icon="BarChart3"
          status="ok"
        />
        <MetricCard
          title="Throughput"
          value="167 Mbps"
          subtitle="Aktif trafik"
          icon="Activity"
          status="ok"
        />
        <MetricCard
          title="Interferans"
          value="Düşük"
          subtitle="Çevre AP'ler"
          icon="Zap"
          status="ok"
        />
      </div>

      <Card>
        <div className="text-center py-12">
          <Icons.BarChart3 className="w-16 h-16 text-white/30 mx-auto mb-4" />
          <h3 className="text-white font-semibold mb-2">Performans Grafikleri</h3>
          <p className="text-white/60">WiFi performans metrikleri burada görünecek</p>
        </div>
      </Card>
    </div>
  );
};