import React, { useState } from 'react';
import { motion } from 'framer-motion';
import * as Icons from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { ChartCard } from '../cards/ChartCard';
import { cn } from '../../lib/utils';
import { 
  useDNSPingMonitors, 
  useCreateDNSMonitor,
  useUpdateDNSMonitor,
  useDNSPingResults,
  useStartDNSMonitor,
  useStopDNSMonitor
} from '../../hooks/api/useSpeedTest';
import { DNSPingMonitor } from '../../types/speedTest';

interface DNSMonitorFormData {
  monitor_name: string;
  target_ip: string;
  target_hostname: string;
  target_description: string;
  interval_ms: number;
  packet_size_bytes: number;
  timeout_ms: number;
  warning_rtt_ms: number;
  critical_rtt_ms: number;
  warning_jitter_ms: number;
  critical_jitter_ms: number;
  warning_loss_percent: number;
  critical_loss_percent: number;
}

const dnsPresets = [
  { name: 'Cloudflare Primary', ip: '1.1.1.1', hostname: 'one.one.one.one', description: 'Cloudflare DNS - Primary' },
  { name: 'Cloudflare Secondary', ip: '1.0.0.1', hostname: 'one.one.one.one', description: 'Cloudflare DNS - Secondary' },
  { name: 'Google Primary', ip: '8.8.8.8', hostname: 'dns.google', description: 'Google DNS - Primary' },
  { name: 'Google Secondary', ip: '8.8.4.4', hostname: 'dns.google', description: 'Google DNS - Secondary' },
  { name: 'Quad9 Primary', ip: '9.9.9.9', hostname: 'dns.quad9.net', description: 'Quad9 Secure DNS' },
  { name: 'Etisalat UAE', ip: '213.42.20.20', hostname: 'dns.etisalat.ae', description: 'Etisalat UAE DNS' },
  { name: 'Türk Telekom', ip: '194.27.1.1', hostname: 'dns.ttnet.net.tr', description: 'Türk Telekom DNS' }
];

export const DNSPingMonitor: React.FC = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingMonitor, setEditingMonitor] = useState<DNSPingMonitor | null>(null);
  const [selectedMonitor, setSelectedMonitor] = useState<string>('');
  const [timeRange, setTimeRange] = useState<'1h' | '6h' | '24h'>('1h');
  
  const { data: monitors = [], isLoading } = useDNSPingMonitors();
  const { data: pingResults = [] } = useDNSPingResults(selectedMonitor, timeRange === '1h' ? 1 : timeRange === '6h' ? 6 : 24);
  const createMonitorMutation = useCreateDNSMonitor();
  const updateMonitorMutation = useUpdateDNSMonitor();
  const startMonitorMutation = useStartDNSMonitor();
  const stopMonitorMutation = useStopDNSMonitor();

  const [formData, setFormData] = useState<DNSMonitorFormData>({
    monitor_name: '',
    target_ip: '',
    target_hostname: '',
    target_description: '',
    interval_ms: 1000,
    packet_size_bytes: 64,
    timeout_ms: 5000,
    warning_rtt_ms: 50,
    critical_rtt_ms: 100,
    warning_jitter_ms: 10,
    critical_jitter_ms: 20,
    warning_loss_percent: 5,
    critical_loss_percent: 10
  });

  const resetForm = () => {
    setFormData({
      monitor_name: '',
      target_ip: '',
      target_hostname: '',
      target_description: '',
      interval_ms: 1000,
      packet_size_bytes: 64,
      timeout_ms: 5000,
      warning_rtt_ms: 50,
      critical_rtt_ms: 100,
      warning_jitter_ms: 10,
      critical_jitter_ms: 20,
      warning_loss_percent: 5,
      critical_loss_percent: 10
    });
  };

  const handleCreateMonitor = async () => {
    try {
      await createMonitorMutation.mutateAsync(formData);
      setShowCreateModal(false);
      resetForm();
    } catch (error) {
      console.error('Create DNS monitor error:', error);
    }
  };

  const handlePresetSelect = (preset: typeof dnsPresets[0]) => {
    setFormData({
      ...formData,
      monitor_name: preset.name,
      target_ip: preset.ip,
      target_hostname: preset.hostname,
      target_description: preset.description
    });
  };

  const handleToggleMonitor = async (monitor: DNSPingMonitor) => {
    try {
      if (monitor.is_active) {
        await stopMonitorMutation.mutateAsync(monitor.id);
      } else {
        await startMonitorMutation.mutateAsync(monitor.id);
      }
    } catch (error) {
      console.error('Toggle DNS monitor error:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-emerald-400';
      case 'warning': return 'bg-orange-400';
      case 'critical': return 'bg-red-400';
      default: return 'bg-gray-400';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'healthy': return 'Sağlıklı';
      case 'warning': return 'Uyarı';
      case 'critical': return 'Kritik';
      default: return 'Bilinmiyor';
    }
  };

  // Convert ping results to chart format
  const chartData = pingResults.slice(0, 60).reverse().map((result, index) => ({
    time: new Date(result.timestamp).toLocaleTimeString('tr-TR', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    }),
    ping: result.rtt_ms || 0,
    jitter: result.jitter_ms || 0,
    loss: result.packet_loss_percent || 0
  }));

  const MonitorCard: React.FC<{ monitor: DNSPingMonitor }> = ({ monitor }) => {
    return (
      <Card className="h-full">
        <div className="space-y-4">
          {/* Monitor Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center",
                monitor.is_active ? "bg-emerald-500/20 border border-emerald-500/30" : "bg-gray-500/20 border border-gray-500/30"
              )}>
                <Icons.Globe className={cn(
                  "w-5 h-5",
                  monitor.is_active ? "text-emerald-400" : "text-gray-400"
                )} />
              </div>
              <div>
                <h4 className="text-white font-semibold">{monitor.monitor_name}</h4>
                <p className="text-white/60 text-sm">{monitor.target_hostname || monitor.target_ip}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className={cn("w-3 h-3 rounded-full", getStatusColor(monitor.last_status))} />
              <span className="text-white text-xs">{getStatusText(monitor.last_status)}</span>
            </div>
          </div>

          {/* Monitor Stats */}
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-white/60">IP Adresi:</span>
              <span className="text-white font-mono">{monitor.target_ip}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/60">Son Ping:</span>
              <span className="text-white">{monitor.last_rtt_ms?.toFixed(1) || 0} ms</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/60">Interval:</span>
              <span className="text-white">{monitor.interval_ms} ms</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/60">Timeout:</span>
              <span className="text-white">{monitor.timeout_ms} ms</span>
            </div>
          </div>

          {/* Thresholds */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-orange-500/10 rounded p-2 border border-orange-500/20">
              <span className="text-orange-400">Uyarı:</span>
              <p className="text-white">{monitor.warning_rtt_ms}ms RTT</p>
            </div>
            <div className="bg-red-500/10 rounded p-2 border border-red-500/20">
              <span className="text-red-400">Kritik:</span>
              <p className="text-white">{monitor.critical_rtt_ms}ms RTT</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 pt-3 border-t border-white/10">
            <Button
              size="sm"
              variant={monitor.is_active ? "destructive" : "default"}
              onClick={() => handleToggleMonitor(monitor)}
              className="flex-1"
            >
              {monitor.is_active ? (
                <>
                  <Icons.Pause className="w-3 h-3 mr-1" />
                  Durdur
                </>
              ) : (
                <>
                  <Icons.Play className="w-3 h-3 mr-1" />
                  Başlat
                </>
              )}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setSelectedMonitor(monitor.id)}
            >
              <Icons.Eye className="w-3 h-3" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setEditingMonitor(monitor);
                setFormData({
                  monitor_name: monitor.monitor_name,
                  target_ip: monitor.target_ip,
                  target_hostname: monitor.target_hostname || '',
                  target_description: monitor.target_description || '',
                  interval_ms: monitor.interval_ms,
                  packet_size_bytes: monitor.packet_size_bytes,
                  timeout_ms: monitor.timeout_ms,
                  warning_rtt_ms: monitor.warning_rtt_ms,
                  critical_rtt_ms: monitor.critical_rtt_ms,
                  warning_jitter_ms: monitor.warning_jitter_ms,
                  critical_jitter_ms: monitor.critical_jitter_ms,
                  warning_loss_percent: monitor.warning_loss_percent,
                  critical_loss_percent: monitor.critical_loss_percent
                });
              }}
            >
              <Icons.Edit className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-white">DNS Canlı Ping İzleme</h3>
          <p className="text-white/70 text-sm">DNS sunucuları ve özel hedefler için gerçek zamanlı ping izleme</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Icons.Plus className="w-4 h-4 mr-2" />
          Yeni Monitor
        </Button>
      </div>

      {/* Live Ping Chart */}
      {selectedMonitor && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-white font-semibold">Canlı Ping Grafiği</h3>
            <div className="flex items-center gap-2">
              <select
                value={selectedMonitor}
                onChange={(e) => setSelectedMonitor(e.target.value)}
                className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none"
              >
                <option value="">Monitor seçin</option>
                {monitors.map((monitor) => (
                  <option key={monitor.id} value={monitor.id}>
                    {monitor.monitor_name}
                  </option>
                ))}
              </select>
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as any)}
                className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none"
              >
                <option value="1h">Son 1 Saat</option>
                <option value="6h">Son 6 Saat</option>
                <option value="24h">Son 24 Saat</option>
              </select>
            </div>
          </div>
          
          <ChartCard
            title="Ping Gecikme Trendi"
            data={chartData}
            type="line"
            color="#4ECDC4"
          />
        </div>
      )}

      {/* DNS Monitors Grid */}
      {monitors.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <Icons.Globe className="w-16 h-16 text-white/30 mx-auto mb-4" />
            <h3 className="text-white font-semibold mb-2">Henüz DNS ping monitörü bulunmuyor</h3>
            <p className="text-white/60 mb-4">İlk DNS ping monitörünüzü oluşturun</p>
            <Button onClick={() => setShowCreateModal(true)}>
              <Icons.Plus className="w-4 h-4 mr-2" />
              DNS Monitor Ekle
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {monitors.map((monitor) => (
            <MonitorCard key={monitor.id} monitor={monitor} />
          ))}
        </div>
      )}

      {/* DNS Preset Quick Add */}
      <Card title="Popüler DNS Sunucuları">
        <div className="space-y-4">
          <p className="text-white/70 text-sm">Yaygın kullanılan DNS sunucularını hızlıca monitöre ekleyin</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {dnsPresets.map((preset) => (
              <button
                key={preset.ip}
                onClick={() => {
                  handlePresetSelect(preset);
                  setShowCreateModal(true);
                }}
                className="p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:border-white/20 transition-all text-left"
              >
                <div className="flex items-center gap-3 mb-2">
                  <Icons.Globe className="w-4 h-4 text-emerald-400" />
                  <span className="text-white font-medium text-sm">{preset.name}</span>
                </div>
                <p className="text-white/60 text-xs">{preset.ip}</p>
                <p className="text-white/50 text-xs">{preset.hostname}</p>
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Create/Edit Monitor Modal */}
      <Modal
        isOpen={showCreateModal || !!editingMonitor}
        onClose={() => {
          setShowCreateModal(false);
          setEditingMonitor(null);
          resetForm();
        }}
        title={editingMonitor ? 'DNS Monitor Düzenle' : 'Yeni DNS Ping Monitörü'}
        size="lg"
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-white text-sm font-medium mb-2">Monitor Adı</label>
              <input
                type="text"
                value={formData.monitor_name}
                onChange={(e) => setFormData({ ...formData, monitor_name: e.target.value })}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                placeholder="Cloudflare Primary"
              />
            </div>
            <div>
              <label className="block text-white text-sm font-medium mb-2">Hedef IP Adresi</label>
              <input
                type="text"
                value={formData.target_ip}
                onChange={(e) => setFormData({ ...formData, target_ip: e.target.value })}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                placeholder="1.1.1.1"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-white text-sm font-medium mb-2">Hostname</label>
              <input
                type="text"
                value={formData.target_hostname}
                onChange={(e) => setFormData({ ...formData, target_hostname: e.target.value })}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                placeholder="one.one.one.one"
              />
            </div>
            <div>
              <label className="block text-white text-sm font-medium mb-2">Açıklama</label>
              <input
                type="text"
                value={formData.target_description}
                onChange={(e) => setFormData({ ...formData, target_description: e.target.value })}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                placeholder="Cloudflare DNS - Primary"
              />
            </div>
          </div>

          {/* Ping Configuration */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-white text-sm font-medium mb-2">Ping Aralığı (ms)</label>
              <select
                value={formData.interval_ms}
                onChange={(e) => setFormData({ ...formData, interval_ms: parseInt(e.target.value) })}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none"
              >
                <option value={500}>500 ms</option>
                <option value={1000}>1 saniye</option>
                <option value={2000}>2 saniye</option>
                <option value={5000}>5 saniye</option>
                <option value={10000}>10 saniye</option>
              </select>
            </div>
            <div>
              <label className="block text-white text-sm font-medium mb-2">Paket Boyutu</label>
              <select
                value={formData.packet_size_bytes}
                onChange={(e) => setFormData({ ...formData, packet_size_bytes: parseInt(e.target.value) })}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none"
              >
                <option value={32}>32 bytes</option>
                <option value={64}>64 bytes</option>
                <option value={128}>128 bytes</option>
                <option value={256}>256 bytes</option>
                <option value={512}>512 bytes</option>
              </select>
            </div>
            <div>
              <label className="block text-white text-sm font-medium mb-2">Timeout (ms)</label>
              <input
                type="number"
                value={formData.timeout_ms}
                onChange={(e) => setFormData({ ...formData, timeout_ms: parseInt(e.target.value) })}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none"
                min="1000"
                max="10000"
              />
            </div>
          </div>

          {/* Alert Thresholds */}
          <div className="space-y-4">
            <h4 className="text-white font-medium">Uyarı Eşikleri</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-white text-sm font-medium mb-2">Uyarı RTT (ms)</label>
                <input
                  type="number"
                  value={formData.warning_rtt_ms}
                  onChange={(e) => setFormData({ ...formData, warning_rtt_ms: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none"
                  min="1"
                />
              </div>
              <div>
                <label className="block text-white text-sm font-medium mb-2">Kritik RTT (ms)</label>
                <input
                  type="number"
                  value={formData.critical_rtt_ms}
                  onChange={(e) => setFormData({ ...formData, critical_rtt_ms: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none"
                  min="1"
                />
              </div>
              <div>
                <label className="block text-white text-sm font-medium mb-2">Uyarı Jitter (ms)</label>
                <input
                  type="number"
                  value={formData.warning_jitter_ms}
                  onChange={(e) => setFormData({ ...formData, warning_jitter_ms: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none"
                  min="1"
                />
              </div>
              <div>
                <label className="block text-white text-sm font-medium mb-2">Kritik Loss (%)</label>
                <input
                  type="number"
                  value={formData.critical_loss_percent}
                  onChange={(e) => setFormData({ ...formData, critical_loss_percent: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none"
                  min="0"
                  max="100"
                  step="0.1"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-4">
            <Button
              onClick={handleCreateMonitor}
              disabled={createMonitorMutation.isPending}
              isLoading={createMonitorMutation.isPending}
              className="flex-1"
            >
              {editingMonitor ? 'Güncelle' : 'Oluştur'}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setShowCreateModal(false);
                setEditingMonitor(null);
                resetForm();
              }}
              className="flex-1"
            >
              İptal
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};