import React from 'react';
import * as Icons from 'lucide-react';
import { Card } from '../ui/Card';
import { MetricCard } from '../cards/MetricCard';
import { LogCard } from '../cards/LogCard';
import { ChartCard } from '../cards/ChartCard';
import { SEOMeta } from '../SEO/SEOMeta';

const Observability: React.FC = () => {
  const systemLogs = [
    { timestamp: new Date().toISOString(), level: 'info' as const, message: 'Grafana gösterge paneli başarıyla yüklendi' },
    { timestamp: new Date().toISOString(), level: 'info' as const, message: 'Prometheus metrikleri toplandı' },
    { timestamp: new Date().toISOString(), level: 'warn' as const, message: 'Disk kullanımı %80\'e yaklaşıyor' },
    { timestamp: new Date().toISOString(), level: 'error' as const, message: 'node_exporter metriklerini toplama hatası' }
  ];

  const metricsData = Array.from({ length: 24 }, (_, i) => ({
    time: `${i}:00`,
    value: Math.floor(Math.random() * 100) + 10
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Sistem İzleme</h1>
          <p className="text-white/70 mt-1">Monitoring, metrikler ve sistem analizleri</p>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <MetricCard
          title="Toplanan Metrikler"
          value="1,247"
          subtitle="Son saat"
          icon="BarChart3"
          status="ok"
        />
        <MetricCard
          title="Uyarı Kuralları"
          value="12"
          subtitle="5 aktif"
          icon="Bell"
          status="ok"
        />
        <MetricCard
          title="Veri Saklama"
          value="30 gün"
          subtitle="Prometheus depolama"
          icon="Database"
          status="ok"
        />
        <MetricCard
          title="Dashboard Durumu"
          value="Çevrimiçi"
          subtitle="Grafana erişilebilir"
          icon="Activity"
          status="ok"
        />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Grafana Gösterge Paneli */}
        <Card title="Grafana Gösterge Paneli" className="h-96">
          <div className="h-full bg-black/20 rounded-xl border border-white/10 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                <Icons.BarChart3 className="w-8 h-8 text-emerald-400" />
              </div>
              <p className="text-white font-medium">Grafana Gösterge Paneli</p>
              <p className="text-white/60 text-sm mt-1">Gömülü izleme arayüzü</p>
            </div>
          </div>
        </Card>

        {/* Sistem Günlükleri */}
        <LogCard
          title="Canlı Sistem Günlükleri"
          logs={systemLogs}
          maxLines={12}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title="İşlemci Kullanımı (24s)"
          data={metricsData}
          type="line"
          color="#00A36C"
        />
        <ChartCard
          title="Bellek Kullanımı (24s)"
          data={metricsData.map(d => ({ ...d, value: d.value * 0.6 }))}
          type="area"
          color="#39d9a7"
        />
      </div>
    </div>
  );
};

export default Observability;