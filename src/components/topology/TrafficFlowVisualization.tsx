import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as Icons from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { cn } from '../../lib/utils';
import { 
  useTrafficFlows, 
  useCreateTrafficFlow, 
  useVLANConfigurations,
  useTrafficAnalysis 
} from '../../hooks/api/useTopology';
import { TrafficFlow, VLANConfiguration } from '../../types/topology';

interface TrafficFlowFormData {
  flow_name: string;
  source_vlan_id: number;
  destination_type: 'internet' | 'local' | 'vpn' | 'specific_host';
  traffic_type: 'web' | 'gaming' | 'voip' | 'streaming' | 'iot' | 'admin' | 'backup';
  route_via: string;
  priority: number;
  max_latency_ms: number;
  min_bandwidth_mbps: number;
  security_inspection: boolean;
  logging_enabled: boolean;
}

const trafficTypeIcons = {
  'web': Icons.Globe,
  'gaming': Icons.Gamepad2,
  'voip': Icons.Phone,
  'streaming': Icons.Play,
  'iot': Icons.Home,
  'admin': Icons.Shield,
  'backup': Icons.Archive
};

const trafficTypeColors = {
  'web': '#4A90E2',
  'gaming': '#9013FE',
  'voip': '#50E3C2',
  'streaming': '#FF6B6B',
  'iot': '#F5A623',
  'admin': '#D0021B',
  'backup': '#607D8B'
};

const routeOptions = [
  { value: 'wan', label: 'Doğrudan ISP (WAN)', description: 'Normal internet trafiği' },
  { value: 'vpn_germany', label: 'Almanya VPS', description: 'VoIP ve düşük gecikme' },
  { value: 'vpn_turkey', label: 'Türkiye VPS', description: 'Web trafiği ve DPI bypass' },
  { value: 'local', label: 'Yerel Ağ', description: 'LAN içinde kalır' },
  { value: 'load_balance', label: 'Yük Dengeleme', description: 'Çoklu çıkış noktası' }
];

export const TrafficFlowVisualization: React.FC = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTimeRange, setSelectedTimeRange] = useState<'1h' | '24h' | '7d'>('24h');
  
  const { data: flows = [], isLoading } = useTrafficFlows();
  const { data: vlans = [] } = useVLANConfigurations();
  const { data: trafficAnalysis } = useTrafficAnalysis(selectedTimeRange);
  const createFlowMutation = useCreateTrafficFlow();

  const [formData, setFormData] = useState<TrafficFlowFormData>({
    flow_name: '',
    source_vlan_id: 20,
    destination_type: 'internet',
    traffic_type: 'web',
    route_via: 'wan',
    priority: 50,
    max_latency_ms: 100,
    min_bandwidth_mbps: 10,
    security_inspection: true,
    logging_enabled: true
  });

  const resetForm = () => {
    setFormData({
      flow_name: '',
      source_vlan_id: 20,
      destination_type: 'internet',
      traffic_type: 'web',
      route_via: 'wan',
      priority: 50,
      max_latency_ms: 100,
      min_bandwidth_mbps: 10,
      security_inspection: true,
      logging_enabled: true
    });
  };

  const handleCreateFlow = async () => {
    try {
      await createFlowMutation.mutateAsync({
        ...formData,
        protocol_filters: [],
        port_ranges: [],
        domain_patterns: [],
        load_balancing: formData.route_via === 'load_balance',
        failover_enabled: true,
        packet_count: 0,
        byte_count: 0
      });
      setShowCreateModal(false);
      resetForm();
    } catch (error) {
      console.error('Create traffic flow error:', error);
    }
  };

  const getRouteColor = (routeVia: string): string => {
    const routeColors: Record<string, string> = {
      'wan': '#4A90E2',
      'vpn_germany': '#9013FE',
      'vpn_turkey': '#FF6B6B',
      'local': '#7ED321',
      'load_balance': '#F5A623'
    };
    return routeColors[routeVia] || '#48CAE4';
  };

  const getPriorityIcon = (priority: number) => {
    if (priority >= 80) return Icons.ArrowUp;
    if (priority >= 60) return Icons.ArrowRight;
    if (priority >= 40) return Icons.ArrowDown;
    return Icons.Minus;
  };

  const TrafficFlowCard: React.FC<{ flow: TrafficFlow }> = ({ flow }) => {
    const TrafficIcon = trafficTypeIcons[flow.traffic_type] || Icons.Network;
    const PriorityIcon = getPriorityIcon(flow.priority);
    const sourceVLAN = vlans.find(v => v.vlan_id === flow.source_vlan_id);
    const routeOption = routeOptions.find(r => r.value === flow.route_via);
    
    return (
      <Card className="h-full">
        <div className="space-y-4">
          {/* Flow Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div 
                className="w-10 h-10 rounded-lg flex items-center justify-center border"
                style={{
                  backgroundColor: `${trafficTypeColors[flow.traffic_type] || '#48CAE4'}20`,
                  borderColor: `${trafficTypeColors[flow.traffic_type] || '#48CAE4'}60`
                }}
              >
                <TrafficIcon 
                  className="w-5 h-5"
                  style={{ color: trafficTypeColors[flow.traffic_type] || '#48CAE4' }}
                />
              </div>
              <div>
                <h4 className="text-white font-semibold">{flow.flow_name}</h4>
                <p className="text-white/60 text-sm">
                  {sourceVLAN?.vlan_name || `VLAN ${flow.source_vlan_id}`} → {flow.destination_type}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <PriorityIcon className={cn(
                "w-4 h-4",
                flow.priority >= 80 ? "text-red-400" :
                flow.priority >= 60 ? "text-orange-400" :
                flow.priority >= 40 ? "text-yellow-400" : "text-gray-400"
              )} />
              <span className="text-white text-sm">{flow.priority}</span>
            </div>
          </div>

          {/* Route Info */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: getRouteColor(flow.route_via) }}
              />
              <span className="text-white text-sm font-medium">
                {routeOption?.label || flow.route_via}
              </span>
            </div>
            <p className="text-white/60 text-xs">
              {routeOption?.description || 'Özel routing yapılandırması'}
            </p>
          </div>

          {/* Performance Requirements */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            {flow.max_latency_ms && (
              <div className="bg-white/5 rounded p-2">
                <span className="text-white/60">Max Gecikme:</span>
                <p className="text-white font-mono">{flow.max_latency_ms}ms</p>
              </div>
            )}
            {flow.min_bandwidth_mbps && (
              <div className="bg-white/5 rounded p-2">
                <span className="text-white/60">Min Bant:</span>
                <p className="text-white font-mono">{flow.min_bandwidth_mbps} Mbps</p>
              </div>
            )}
          </div>

          {/* Features */}
          <div className="grid grid-cols-3 gap-2">
            <div className={cn(
              "p-2 rounded text-center text-xs",
              flow.security_inspection ? "bg-emerald-500/20 text-emerald-400" : "bg-white/5 text-white/60"
            )}>
              <Icons.Shield className="w-3 h-3 mx-auto mb-1" />
              DPI
            </div>
            <div className={cn(
              "p-2 rounded text-center text-xs",
              flow.logging_enabled ? "bg-blue-500/20 text-blue-400" : "bg-white/5 text-white/60"
            )}>
              <Icons.FileText className="w-3 h-3 mx-auto mb-1" />
              Log
            </div>
            <div className={cn(
              "p-2 rounded text-center text-xs",
              flow.load_balancing ? "bg-purple-500/20 text-purple-400" : "bg-white/5 text-white/60"
            )}>
              <Icons.Shuffle className="w-3 h-3 mx-auto mb-1" />
              LB
            </div>
          </div>

          {/* Traffic Stats */}
          {flow.packet_count > 0 && (
            <div className="text-xs text-white/60 pt-2 border-t border-white/10">
              <div className="flex justify-between">
                <span>Paketler:</span>
                <span>{flow.packet_count.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Veri:</span>
                <span>{(flow.byte_count / (1024 * 1024)).toFixed(1)} MB</span>
              </div>
            </div>
          )}
        </div>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-white">Trafik Akışı ve Yönlendirme</h3>
          <p className="text-white/70 text-sm">VLAN bazlı trafik politikaları ve routing kuralları</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Icons.Plus className="w-4 h-4 mr-2" />
          Yeni Trafik Kuralı
        </Button>
      </div>

      {/* Traffic Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Protocol Distribution */}
        <Card title="Protokol Dağılımı">
          <div className="space-y-3">
            {trafficAnalysis && Object.entries(trafficAnalysis.protocol_distribution).map(([protocol, percent]) => (
              <div key={protocol} className="flex items-center justify-between">
                <span className="text-white text-sm">{protocol}</span>
                <div className="flex items-center gap-2">
                  <div className="w-20 h-2 bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-emerald-400 rounded-full transition-all"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <span className="text-white text-sm">{percent}%</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Top Talkers */}
        <Card title="En Yoğun Cihazlar">
          <div className="space-y-3">
            {trafficAnalysis?.top_talkers.map((device, index) => (
              <div key={device.node_id} className="flex items-center justify-between p-2 rounded-lg bg-white/5">
                <div className="flex items-center gap-2">
                  <span className="text-emerald-400 font-mono text-sm">{index + 1}</span>
                  <span className="text-white text-sm">{device.node_name}</span>
                </div>
                <span className="text-white/60 text-sm">
                  {(device.bytes_transferred / (1024 * 1024 * 1024)).toFixed(1)} GB
                </span>
              </div>
            )) || []}
          </div>
        </Card>
      </div>

      {/* Traffic Flows Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {flows.map((flow) => (
          <TrafficFlowCard key={flow.id} flow={flow} />
        ))}
      </div>

      {/* Create Traffic Flow Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          resetForm();
        }}
        title="Yeni Trafik Akışı Kuralı"
        size="lg"
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-white text-sm font-medium mb-2">Kural Adı</label>
              <input
                type="text"
                value={formData.flow_name}
                onChange={(e) => setFormData({ ...formData, flow_name: e.target.value })}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                placeholder="VoIP Almanya Routing"
              />
            </div>
            <div>
              <label className="block text-white text-sm font-medium mb-2">Kaynak VLAN</label>
              <select
                value={formData.source_vlan_id}
                onChange={(e) => setFormData({ ...formData, source_vlan_id: parseInt(e.target.value) })}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none"
              >
                {vlans.map(vlan => (
                  <option key={vlan.vlan_id} value={vlan.vlan_id} className="bg-gray-800">
                    VLAN {vlan.vlan_id} - {vlan.vlan_name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-white text-sm font-medium mb-2">Trafik Türü</label>
              <select
                value={formData.traffic_type}
                onChange={(e) => setFormData({ ...formData, traffic_type: e.target.value as any })}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none"
              >
                <option value="web" className="bg-gray-800">Web Trafiği</option>
                <option value="gaming" className="bg-gray-800">Gaming</option>
                <option value="voip" className="bg-gray-800">VoIP</option>
                <option value="streaming" className="bg-gray-800">Medya Streaming</option>
                <option value="iot" className="bg-gray-800">IoT</option>
                <option value="admin" className="bg-gray-800">Yönetim</option>
                <option value="backup" className="bg-gray-800">Yedekleme</option>
              </select>
            </div>
            <div>
              <label className="block text-white text-sm font-medium mb-2">Hedef</label>
              <select
                value={formData.destination_type}
                onChange={(e) => setFormData({ ...formData, destination_type: e.target.value as any })}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none"
              >
                <option value="internet" className="bg-gray-800">Internet</option>
                <option value="local" className="bg-gray-800">Yerel Ağ</option>
                <option value="vpn" className="bg-gray-800">VPN Tüneli</option>
                <option value="specific_host" className="bg-gray-800">Belirli Host</option>
              </select>
            </div>
          </div>

          {/* Route Selection */}
          <div>
            <label className="block text-white text-sm font-medium mb-3">Yönlendirme Yolu</label>
            <div className="grid grid-cols-1 gap-2">
              {routeOptions.map((route) => (
                <button
                  key={route.value}
                  onClick={() => setFormData({ ...formData, route_via: route.value })}
                  className={cn(
                    "p-3 rounded-lg border text-left transition-all",
                    formData.route_via === route.value
                      ? "bg-emerald-500/20 border-emerald-500/30 text-white"
                      : "bg-white/5 border-white/10 text-white/80 hover:bg-white/10 hover:border-white/20"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: getRouteColor(route.value) }}
                    />
                    <div>
                      <p className="font-medium">{route.label}</p>
                      <p className="text-xs text-white/60">{route.description}</p>
                    </div>
                    {formData.route_via === route.value && (
                      <Icons.Check className="w-4 h-4 text-emerald-400 ml-auto" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Performance Requirements */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-white text-sm font-medium mb-2">Öncelik (1-100)</label>
              <input
                type="range"
                min="1"
                max="100"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-white/60 mt-1">
                <span>Düşük</span>
                <span className="text-white">{formData.priority}</span>
                <span>Kritik</span>
              </div>
            </div>
            <div>
              <label className="block text-white text-sm font-medium mb-2">Max Gecikme (ms)</label>
              <input
                type="number"
                value={formData.max_latency_ms}
                onChange={(e) => setFormData({ ...formData, max_latency_ms: parseInt(e.target.value) })}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none"
                min="1"
                max="1000"
              />
            </div>
            <div>
              <label className="block text-white text-sm font-medium mb-2">Min Bant (Mbps)</label>
              <input
                type="number"
                value={formData.min_bandwidth_mbps}
                onChange={(e) => setFormData({ ...formData, min_bandwidth_mbps: parseInt(e.target.value) })}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none"
                min="1"
                max="10000"
              />
            </div>
          </div>

          {/* Security Options */}
          <div className="space-y-3">
            <h4 className="text-white font-medium">Güvenlik ve İzleme</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setFormData({ ...formData, security_inspection: !formData.security_inspection })}
                  className={cn(
                    "relative w-10 h-5 rounded-full transition-all duration-300",
                    formData.security_inspection 
                      ? "bg-emerald-500 shadow-lg shadow-emerald-500/30" 
                      : "bg-white/20"
                  )}
                >
                  <div
                    className={cn(
                      "absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all duration-300 shadow-lg",
                      formData.security_inspection ? "left-5" : "left-0.5"
                    )}
                  />
                </button>
                <span className="text-white text-sm">DPI Güvenlik İncelemesi</span>
              </div>
              
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setFormData({ ...formData, logging_enabled: !formData.logging_enabled })}
                  className={cn(
                    "relative w-10 h-5 rounded-full transition-all duration-300",
                    formData.logging_enabled 
                      ? "bg-blue-500 shadow-lg shadow-blue-500/30" 
                      : "bg-white/20"
                  )}
                >
                  <div
                    className={cn(
                      "absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all duration-300 shadow-lg",
                      formData.logging_enabled ? "left-5" : "left-0.5"
                    )}
                  />
                </button>
                <span className="text-white text-sm">Trafik Loglama</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-4">
            <Button
              onClick={handleCreateFlow}
              disabled={createFlowMutation.isPending}
              isLoading={createFlowMutation.isPending}
              className="flex-1"
            >
              Trafik Kuralı Oluştur
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setShowCreateModal(false);
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