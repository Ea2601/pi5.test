import React, { useState } from 'react';
import * as Icons from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { MetricCard } from '../cards/MetricCard';
import { ChartCard } from '../cards/ChartCard';
import { TableCard } from '../cards/TableCard';
import { cn, formatBytes } from '../../lib/utils';
import { 
  useWiFiPerformanceLogs, 
  useWiFiStats,
  useWiFiHealthCheck,
  useWiFiAccessPoints,
  useWiFiNetworks
} from '../../hooks/api/useWiFi';

export const WiFiPerformanceMonitoring: React.FC = () => {
  const [selectedTimeRange, setSelectedTimeRange] = useState<'1h' | '6h' | '24h' | '7d'>('24h');
  const [selectedAP, setSelectedAP] = useState<string>('');
  
  const { data: stats, isLoading: statsLoading } = useWiFiStats();
  const { data: health } = useWiFiHealthCheck();
  const { data: accessPoints = [] } = useWiFiAccessPoints();
  const { data: networks = [] } = useWiFiNetworks();
  const { data: performanceLogs = [] } = useWiFiPerformanceLogs({
    ap_id: selectedAP || undefined,
    hours: selectedTimeRange === '1h' ? 1 : selectedTimeRange === '6h' ? 6 : selectedTimeRange === '24h' ? 24 : 168
  });

  // Generate performance chart data
  const performanceData = Array.from({ length: 24 }, (_, i) => ({
    time: `${i}:00`,
    clients: Math.floor(Math.random() * 20) + 5,
    bandwidth: Math.floor(Math.random() * 150) + 50,
    signal: Math.floor(Math.random() * 30) + 50 // Signal quality 50-80
  }));

  const channelUtilizationData = Array.from({ length: 13 }, (_, i) => ({
    time: `CH${i + 1}`,
    value: Math.floor(Math.random() * 80) + 10,
    interference: Math.floor(Math.random() * 40) + 5
  }));

  const getHealthStatusIcon = (health?: 'healthy' | 'warning' | 'critical') => {
    switch (health) {
      case 'healthy': return Icons.CheckCircle;
      case 'warning': return Icons.AlertTriangle;
      case 'critical': return Icons.XCircle;
      default: return Icons.HelpCircle;
    }
  };

  const getHealthStatusColor = (health?: 'healthy' | 'warning' | 'critical') => {
    switch (health) {
      case 'healthy': return 'text-emerald-400';
      case 'warning': return 'text-orange-400';
      case 'critical': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  // Network performance breakdown
  const networkPerformanceColumns = [
    { 
      key: 'ssid', 
      label: 'SSID',
      render: (value: string, row: any) => (
        <div>
          <p className="text-white font-medium">{value}</p>
          <p className="text-white/60 text-xs">VLAN {row.vlan_id || 'N/A'}</p>
        </div>
      )
    },
    { 
      key: 'client_count', 
      label: 'İstemci',
      render: (value: number, row: any) => (
        <span className="text-white">{value} / {row.max_clients}</span>
      )
    },
    { 
      key: 'bandwidth_mbps', 
      label: 'Bant Genişliği',
      render: (value: number) => (
        <span className="text-white">{value.toFixed(1)} Mbps</span>
      )
    },
    { 
      key: 'network_type', 
      label: 'Tür',
      render: (value: string) => {
        const typeColors = {
          'admin': 'bg-blue-500/20 text-blue-400',
          'standard': 'bg-emerald-500/20 text-emerald-400',
          'iot': 'bg-orange-500/20 text-orange-400',
          'guest': 'bg-red-500/20 text-red-400'
        };
        return (
          <span className={cn("px-2 py-1 rounded text-xs", typeColors[value as keyof typeof typeColors] || 'bg-gray-500/20 text-gray-400')}>
            {value}
          </span>
        );
      }
    }
  ];

  if (statsLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-8 h-8 border-2 border-white/30 border-t-emerald-400 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-white">Wi-Fi Performans İzleme</h3>
          <p className="text-white/70 text-sm">Sinyal kalitesi, bant genişliği kullanımı ve sistem sağlığı</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={selectedAP}
            onChange={(e) => setSelectedAP(e.target.value)}
            className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none"
          >
            <option value="">Tüm Access Point'ler</option>
            {accessPoints.map((ap) => (
              <option key={ap.id} value={ap.id} className="bg-gray-800">
                {ap.ap_name} ({ap.location})
              </option>
            ))}
          </select>
          <select
            value={selectedTimeRange}
            onChange={(e) => setSelectedTimeRange(e.target.value as any)}
            className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none"
          >
            <option value="1h" className="bg-gray-800">Son 1 Saat</option>
            <option value="6h" className="bg-gray-800">Son 6 Saat</option>
            <option value="24h" className="bg-gray-800">Son 24 Saat</option>
            <option value="7d" className="bg-gray-800">Son 7 Gün</option>
          </select>
        </div>
      </div>

      {/* Wi-Fi Health Overview */}
      {health && (
        <Card title="Wi-Fi Sistem Sağlığı">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className={cn(
                "w-4 h-4 rounded-full",
                health.overall_health === 'healthy' ? "bg-emerald-400" :
                health.overall_health === 'warning' ? "bg-orange-400" : "bg-red-400"
              )} />
              <span className="text-white font-medium">
                Genel Durum: {health.overall_health === 'healthy' ? 'Sağlıklı' : 
                             health.overall_health === 'warning' ? 'Uyarı' : 'Kritik'}
              </span>
            </div>

            {health.issues.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-white font-medium">Tespit Edilen Sorunlar:</h4>
                {health.issues.map((issue, index) => {
                  const HealthIcon = getHealthStatusIcon(issue.severity as any);
                  return (
                    <div key={index} className={cn(
                      "p-3 rounded-lg border",
                      issue.severity === 'critical' ? "bg-red-500/10 border-red-500/20" :
                      issue.severity === 'warning' ? "bg-orange-500/10 border-orange-500/20" :
                      "bg-blue-500/10 border-blue-500/20"
                    )}>
                      <div className="flex items-center gap-2">
                        <HealthIcon className={cn("w-4 h-4", getHealthStatusColor(issue.severity as any))} />
                        <span className="text-white text-sm">{issue.message}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {health.recommendations.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-white font-medium">Öneriler:</h4>
                <ul className="space-y-1">
                  {health.recommendations.map((rec, index) => (
                    <li key={index} className="text-white/70 text-sm flex items-start gap-2">
                      <Icons.Lightbulb className="w-3 h-3 text-yellow-400 mt-0.5 flex-shrink-0" />
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard
          title="Toplam İstemci"
          value={String(stats?.connected_clients || 0)}
          subtitle={`${stats?.total_clients || 0} kayıtlı cihaz`}
          icon="Users"
          status="ok"
        />
        <MetricCard
          title="Toplam Bant Genişliği"
          value={`${(stats?.total_bandwidth_mbps || 0).toFixed(1)} Mbps`}
          subtitle="Aktif kullanım"
          icon="Activity"
          status="ok"
        />
        <MetricCard
          title="Ortalama Sinyal"
          value={`${Math.round(stats?.average_signal_strength || -70)} dBm`}
          subtitle="Tüm istemciler"
          icon="Signal"
          status={stats && stats.average_signal_strength > -60 ? 'ok' : 'warn'}
        />
        <MetricCard
          title="Aktif SSID"
          value={String(stats?.active_networks || 0)}
          subtitle={`${stats?.total_networks || 0} toplam ağ`}
          icon="Wifi"
          status="ok"
        />
      </div>

      {/* Performance Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title="İstemci ve Bant Genişliği Kullanımı"
          data={performanceData}
          type="line"
          color="#4ECDC4"
        />
        
        <ChartCard
          title="Kanal Kullanımı ve Girişim (2.4 GHz)"
          data={channelUtilizationData}
          type="area"
          color="#FF6B6B"
        />
      </div>

      {/* Network Performance Breakdown */}
      <TableCard
        title="SSID Bazlı Performans Dağılımı"
        columns={networkPerformanceColumns}
        data={stats?.client_distribution || []}
      />

      {/* Channel Utilization Overview */}
      <Card title="Kanal Kullanım Durumu">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-white font-medium mb-3">2.4 GHz Bantı</h4>
              <div className="space-y-2">
                {Array.from({ length: 13 }, (_, i) => {
                  const channel = i + 1;
                  const utilization = Math.floor(Math.random() * 80) + 10;
                  return (
                    <div key={channel} className="flex items-center justify-between p-2 rounded bg-white/5">
                      <span className="text-white text-sm">Kanal {channel}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-2 bg-white/10 rounded-full overflow-hidden">
                          <div 
                            className={cn(
                              "h-full rounded-full transition-all",
                              utilization > 70 ? "bg-red-400" :
                              utilization > 50 ? "bg-orange-400" : "bg-emerald-400"
                            )}
                            style={{ width: `${utilization}%` }}
                          />
                        </div>
                        <span className="text-white text-sm w-8 text-right">{utilization}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div>
              <h4 className="text-white font-medium mb-3">5 GHz Bantı</h4>
              <div className="space-y-2">
                {[36, 40, 44, 48, 149, 153, 157, 161].map((channel) => {
                  const utilization = Math.floor(Math.random() * 50) + 5;
                  return (
                    <div key={channel} className="flex items-center justify-between p-2 rounded bg-white/5">
                      <span className="text-white text-sm">Kanal {channel}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-2 bg-white/10 rounded-full overflow-hidden">
                          <div 
                            className={cn(
                              "h-full rounded-full transition-all",
                              utilization > 50 ? "bg-orange-400" : "bg-emerald-400"
                            )}
                            style={{ width: `${utilization}%` }}
                          />
                        </div>
                        <span className="text-white text-sm w-8 text-right">{utilization}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-4 border-t border-white/10">
            <Button variant="outline">
              <Icons.BarChart3 className="w-4 h-4 mr-2" />
              Kanal Analizi Yap
            </Button>
            <Button variant="outline">
              <Icons.Zap className="w-4 h-4 mr-2" />
              Kanalları Optimize Et
            </Button>
          </div>
        </div>
      </Card>

      {/* AP Performance Comparison */}
      <Card title="Access Point Performans Karşılaştırması">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {accessPoints.map((ap) => {
              const apLogs = performanceLogs.filter(log => log.ap_id === ap.id);
              const avgBandwidth = apLogs.length > 0 
                ? apLogs.reduce((acc, log) => acc + log.total_bandwidth_mbps, 0) / apLogs.length
                : 0;
              const avgClients = apLogs.length > 0 
                ? apLogs.reduce((acc, log) => acc + log.client_count, 0) / apLogs.length
                : 0;

              return (
                <div key={ap.id} className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center",
                      ap.is_online ? "bg-emerald-500/20 border border-emerald-500/30" : "bg-red-500/20 border border-red-500/30"
                    )}>
                      <Icons.Router className={cn("w-4 h-4", ap.is_online ? "text-emerald-400" : "text-red-400")} />
                    </div>
                    <div>
                      <h4 className="text-white font-medium">{ap.ap_name}</h4>
                      <p className="text-white/60 text-xs">{ap.location}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-white/60">Ort. İstemci:</span>
                      <span className="text-white">{avgClients.toFixed(0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Ort. Bant:</span>
                      <span className="text-white">{avgBandwidth.toFixed(1)} Mbps</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">CPU:</span>
                      <span className={cn(
                        ap.cpu_usage > 80 ? "text-red-400" : 
                        ap.cpu_usage > 60 ? "text-orange-400" : "text-emerald-400"
                      )}>
                        {ap.cpu_usage}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Sıcaklık:</span>
                      <span className={cn(
                        ap.temperature > 70 ? "text-red-400" : 
                        ap.temperature > 50 ? "text-orange-400" : "text-emerald-400"
                      )}>
                        {ap.temperature}°C
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      {/* Signal Strength Heatmap */}
      <Card title="Sinyal Gücü Haritası">
        <div className="space-y-4">
          <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Icons.Zap className="w-4 h-4 text-blue-400" />
              <span className="text-blue-400 font-medium">Wi-Fi Coverage Heatmap</span>
            </div>
            <p className="text-white/80 text-sm mb-3">
              Ev/ofis içindeki Wi-Fi sinyal dağılımını görselleştirin
            </p>
            <div className="bg-black/20 rounded-lg p-8 border border-white/10 text-center">
              <Icons.Map className="w-12 h-12 text-white/30 mx-auto mb-3" />
              <p className="text-white/60">Sinyal gücü haritası geliştirilme aşamasında...</p>
              <p className="text-white/40 text-sm">WiFi survey ve heatmap özelliği yakında eklenecek</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Network Alerts and Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Aktif Uyarılar">
          <div className="space-y-3">
            {health?.issues.map((issue, index) => {
              const HealthIcon = getHealthStatusIcon(issue.severity as any);
              return (
                <div key={index} className={cn(
                  "p-3 rounded-lg border",
                  issue.severity === 'critical' ? "bg-red-500/10 border-red-500/20" :
                  issue.severity === 'warning' ? "bg-orange-500/10 border-orange-500/20" :
                  "bg-blue-500/10 border-blue-500/20"
                )}>
                  <div className="flex items-center gap-2">
                    <HealthIcon className={cn("w-4 h-4", getHealthStatusColor(issue.severity as any))} />
                    <span className="text-white text-sm">{issue.message}</span>
                  </div>
                </div>
              );
            }) || [
              <div className="text-center py-4">
                <Icons.CheckCircle className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                <p className="text-white/70">Aktif uyarı bulunmuyor</p>
              </div>
            ]}
          </div>
        </Card>

        <Card title="Performans Önerileri">
          <div className="space-y-3">
            {health?.recommendations.map((rec, index) => (
              <div key={index} className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <div className="flex items-start gap-2">
                  <Icons.Lightbulb className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                  <span className="text-white text-sm">{rec}</span>
                </div>
              </div>
            )) || [
              <div className="text-center py-4">
                <Icons.ThumbsUp className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                <p className="text-white/70">Wi-Fi performansınız optimal</p>
              </div>
            ]}
          </div>
        </Card>
      </div>
    </div>
  );
};