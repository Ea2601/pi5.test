import React, { useState } from 'react';
import { motion } from 'framer-motion';
import * as Icons from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { MetricCard } from '../cards/MetricCard';
import { ControlCard } from '../cards/ControlCard';
import { ErrorBoundary, NetworkErrorFallback } from '../ui/ErrorBoundary';
import { cn } from '../../lib/utils';

interface NetworkInterface {
  name: string;
  type: 'ethernet' | 'wifi' | 'bridge' | 'vlan';
  status: 'up' | 'down';
  ip_address?: string;
  mac_address?: string;
  mtu: number;
  speed?: string;
}

interface FirewallRule {
  id: string;
  name: string;
  action: 'allow' | 'deny' | 'reject';
  protocol: 'tcp' | 'udp' | 'any';
  source: string;
  destination: string;
  port?: string;
  enabled: boolean;
}

interface RoutingRule {
  id: string;
  destination: string;
  gateway: string;
  interface: string;
  metric: number;
  enabled: boolean;
}

export const NetworkSettings: React.FC = () => {
  const [activeSection, setActiveSection] = useState('general');
  const [showFirewallModal, setShowFirewallModal] = useState(false);
  const [showRoutingModal, setShowRoutingModal] = useState(false);
  const [showInterfaceModal, setShowInterfaceModal] = useState(false);

  // Mock data for network interfaces
  const [interfaces] = useState<NetworkInterface[]>([
    {
      name: 'eth0',
      type: 'ethernet',
      status: 'up',
      ip_address: '192.168.1.100',
      mac_address: '00:11:22:33:44:55',
      mtu: 1500,
      speed: '1000 Mbps'
    },
    {
      name: 'wlan0',
      type: 'wifi',
      status: 'up',
      ip_address: '192.168.1.101',
      mac_address: '00:11:22:33:44:56',
      mtu: 1500,
      speed: '866 Mbps'
    },
    {
      name: 'br0',
      type: 'bridge',
      status: 'up',
      ip_address: '192.168.1.1',
      mac_address: '00:11:22:33:44:57',
      mtu: 1500
    }
  ]);

  // Mock firewall rules
  const [firewallRules] = useState<FirewallRule[]>([
    {
      id: 'fw-1',
      name: 'SSH Access',
      action: 'allow',
      protocol: 'tcp',
      source: '192.168.1.0/24',
      destination: 'any',
      port: '22',
      enabled: true
    },
    {
      id: 'fw-2',
      name: 'HTTP/HTTPS',
      action: 'allow',
      protocol: 'tcp',
      source: 'any',
      destination: 'any',
      port: '80,443',
      enabled: true
    },
    {
      id: 'fw-3',
      name: 'WireGuard VPN',
      action: 'allow',
      protocol: 'udp',
      source: 'any',
      destination: 'any',
      port: '51820',
      enabled: true
    }
  ]);

  // Mock routing rules
  const [routingRules] = useState<RoutingRule[]>([
    {
      id: 'route-1',
      destination: '0.0.0.0/0',
      gateway: '192.168.1.1',
      interface: 'eth0',
      metric: 100,
      enabled: true
    },
    {
      id: 'route-2',
      destination: '10.0.0.0/8',
      gateway: '192.168.1.254',
      interface: 'wg0',
      metric: 50,
      enabled: true
    }
  ]);

  const systemControls = [
    { id: 'ip-forward', type: 'toggle' as const, label: 'IP Forwarding', value: true, icon: 'ArrowRight', action: () => {} },
    { id: 'nat-enabled', type: 'toggle' as const, label: 'NAT (Network Address Translation)', value: true, icon: 'Share2', action: () => {} },
    { id: 'dhcp-relay', type: 'toggle' as const, label: 'DHCP Relay', value: false, icon: 'Repeat', action: () => {} },
    { id: 'ipv6-enabled', type: 'toggle' as const, label: 'IPv6 Desteği', value: false, icon: 'Globe', action: () => {} },
    { id: 'stp-enabled', type: 'toggle' as const, label: 'STP (Spanning Tree Protocol)', value: true, icon: 'GitBranch', action: () => {} }
  ];

  const securityControls = [
    { id: 'firewall-enabled', type: 'toggle' as const, label: 'Güvenlik Duvarı', value: true, icon: 'Shield', action: () => {} },
    { id: 'intrusion-detection', type: 'toggle' as const, label: 'Saldırı Tespit Sistemi', value: false, icon: 'AlertTriangle', action: () => {} },
    { id: 'dos-protection', type: 'toggle' as const, label: 'DDoS Koruması', value: true, icon: 'ShieldCheck', action: () => {} },
    { id: 'port-scan-detection', type: 'toggle' as const, label: 'Port Tarama Tespiti', value: true, icon: 'Search', action: () => {} }
  ];

  const qosControls = [
    { id: 'qos-enabled', type: 'toggle' as const, label: 'QoS (Service Kalitesi)', value: true, icon: 'Zap', action: () => {} },
    { id: 'bandwidth-limit', type: 'slider' as const, label: 'Genel Bant Limiti (Mbps)', value: 500, min: 10, max: 1000, icon: 'Gauge', action: () => {} },
    { id: 'priority-gaming', type: 'select' as const, label: 'Gaming Önceliği', value: 'high', options: [
      { value: 'low', label: 'Düşük' },
      { value: 'medium', label: 'Orta' },
      { value: 'high', label: 'Yüksek' },
      { value: 'critical', label: 'Kritik' }
    ], icon: 'Gamepad2', action: () => {} }
  ];

  const sections = [
    { id: 'general', label: 'Genel Ayarlar', icon: 'Settings' },
    { id: 'interfaces', label: 'Ağ Arayüzleri', icon: 'Network' },
    { id: 'routing', label: 'Yönlendirme', icon: 'Route' },
    { id: 'firewall', label: 'Güvenlik Duvarı', icon: 'Shield' },
    { id: 'qos', label: 'QoS ve Trafik Şekillendirme', icon: 'Zap' },
    { id: 'advanced', label: 'Gelişmiş Ayarlar', icon: 'Wrench' }
  ];

  const getInterfaceIcon = (type: string) => {
    switch (type) {
      case 'ethernet': return Icons.Cable;
      case 'wifi': return Icons.Wifi;
      case 'bridge': return Icons.GitBranch;
      case 'vlan': return Icons.Layers;
      default: return Icons.Network;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'allow': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'deny': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'reject': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const InterfaceCard: React.FC<{ interface: NetworkInterface }> = ({ interface: iface }) => {
    const IconComponent = getInterfaceIcon(iface.type);
    
    return (
      <Card className="h-full">
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center",
                iface.status === 'up' 
                  ? "bg-emerald-500/20 border border-emerald-500/30" 
                  : "bg-red-500/20 border border-red-500/30"
              )}>
                <IconComponent className={cn(
                  "w-5 h-5",
                  iface.status === 'up' ? "text-emerald-400" : "text-red-400"
                )} />
              </div>
              <div>
                <h4 className="text-white font-semibold">{iface.name}</h4>
                <p className="text-white/60 text-sm capitalize">{iface.type}</p>
              </div>
            </div>
            <div className={cn(
              "w-3 h-3 rounded-full",
              iface.status === 'up' ? "bg-emerald-400" : "bg-red-400"
            )} />
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-white/60">IP Adresi:</span>
              <span className="text-white font-mono">{iface.ip_address || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/60">MAC:</span>
              <span className="text-white font-mono text-xs">{iface.mac_address}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/60">MTU:</span>
              <span className="text-white">{iface.mtu}</span>
            </div>
            {iface.speed && (
              <div className="flex justify-between">
                <span className="text-white/60">Hız:</span>
                <span className="text-white">{iface.speed}</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 pt-3 border-t border-white/10">
            <Button size="sm" variant="outline" className="flex-1">
              <Icons.Edit className="w-3 h-3 mr-1" />
              Düzenle
            </Button>
            <Button 
              size="sm" 
              variant={iface.status === 'up' ? "destructive" : "default"}
            >
              {iface.status === 'up' ? (
                <Icons.Power className="w-3 h-3" />
              ) : (
                <Icons.Play className="w-3 h-3" />
              )}
            </Button>
          </div>
        </div>
      </Card>
    );
  };

  const FirewallRuleRow: React.FC<{ rule: FirewallRule }> = ({ rule }) => (
    <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10">
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", getActionColor(rule.action))}>
          {rule.action === 'allow' ? (
            <Icons.Check className="w-4 h-4" />
          ) : rule.action === 'deny' ? (
            <Icons.X className="w-4 h-4" />
          ) : (
            <Icons.Ban className="w-4 h-4" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="text-white font-medium text-sm">{rule.name}</h4>
          <p className="text-white/60 text-xs">
            {rule.protocol.toUpperCase()} {rule.source} → {rule.destination}
            {rule.port && ` :${rule.port}`}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div className={cn(
          "w-2 h-2 rounded-full",
          rule.enabled ? "bg-emerald-400" : "bg-gray-400"
        )} />
        <Button size="sm" variant="outline">
          <Icons.Edit className="w-3 h-3" />
        </Button>
      </div>
    </div>
  );

  const RoutingRuleRow: React.FC<{ rule: RoutingRule }> = ({ rule }) => (
    <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10">
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
          <Icons.ArrowRight className="w-4 h-4 text-blue-400" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-white font-medium text-sm font-mono">{rule.destination}</p>
          <p className="text-white/60 text-xs">
            via {rule.gateway} dev {rule.interface} metric {rule.metric}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div className={cn(
          "w-2 h-2 rounded-full",
          rule.enabled ? "bg-emerald-400" : "bg-gray-400"
        )} />
        <Button size="sm" variant="outline">
          <Icons.Edit className="w-3 h-3" />
        </Button>
      </div>
    </div>
  );

  const renderSectionContent = () => {
    switch (activeSection) {
      case 'general':
        return (
          <div className="space-y-6">
            {/* Global Network Settings */}
            <ControlCard
              title="Genel Ağ Yapılandırması"
              controls={systemControls}
            />

            {/* Network Information */}
            <Card title="Ağ Bilgileri">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h4 className="text-white font-medium">Sistem Ağ Durumu</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-white/60">Hostname:</span>
                      <span className="text-white font-mono">pi5-supernode</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Domain:</span>
                      <span className="text-white">local</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Default Gateway:</span>
                      <span className="text-white font-mono">192.168.1.1</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Primary DNS:</span>
                      <span className="text-white font-mono">1.1.1.1</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h4 className="text-white font-medium">Bağlantı Durumu</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-white/60">Internet Erişimi:</span>
                      <span className="text-emerald-400">Aktif</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">VPN Bağlantıları:</span>
                      <span className="text-white">2 aktif</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Aktif Interface'ler:</span>
                      <span className="text-white">{interfaces.filter(i => i.status === 'up').length} / {interfaces.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Firewall Durumu:</span>
                      <span className="text-emerald-400">Aktif</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Quick Actions */}
            <Card title="Hızlı İşlemler">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Button variant="outline" className="h-12">
                  <Icons.RefreshCw className="w-4 h-4 mr-2" />
                  Ağ Yenile
                </Button>
                <Button variant="outline" className="h-12">
                  <Icons.TestTube className="w-4 h-4 mr-2" />
                  Bağlantı Testi
                </Button>
                <Button variant="outline" className="h-12">
                  <Icons.Download className="w-4 h-4 mr-2" />
                  Config Export
                </Button>
              </div>
            </Card>
          </div>
        );

      case 'interfaces':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-white">Ağ Arayüzleri</h3>
                <p className="text-white/70 text-sm">Network interface yapılandırması</p>
              </div>
              <Button onClick={() => setShowInterfaceModal(true)}>
                <Icons.Plus className="w-4 h-4 mr-2" />
                Arayüz Ekle
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {interfaces.map((iface) => (
                <InterfaceCard key={iface.name} interface={iface} />
              ))}
            </div>
          </div>
        );

      case 'routing':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-white">Yönlendirme Tablosu</h3>
                <p className="text-white/70 text-sm">IP routing kuralları</p>
              </div>
              <Button onClick={() => setShowRoutingModal(true)}>
                <Icons.Plus className="w-4 h-4 mr-2" />
                Route Ekle
              </Button>
            </div>

            <Card title="Aktif Routes">
              <div className="space-y-2">
                {routingRules.map((rule) => (
                  <RoutingRuleRow key={rule.id} rule={rule} />
                ))}
              </div>
            </Card>

            <Card title="Default Gateway">
              <div className="space-y-4">
                <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <div className="flex items-center gap-3 mb-2">
                    <Icons.Router className="w-5 h-5 text-blue-400" />
                    <span className="text-white font-medium">Primary Gateway</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="flex justify-between">
                      <span className="text-white/60">Gateway IP:</span>
                      <span className="text-white font-mono">192.168.1.1</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Interface:</span>
                      <span className="text-white">eth0</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Metric:</span>
                      <span className="text-white">100</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Status:</span>
                      <span className="text-emerald-400">Active</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        );

      case 'firewall':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-white">Güvenlik Duvarı</h3>
                <p className="text-white/70 text-sm">Firewall kuralları ve güvenlik</p>
              </div>
              <Button onClick={() => setShowFirewallModal(true)}>
                <Icons.Plus className="w-4 h-4 mr-2" />
                Kural Ekle
              </Button>
            </div>

            {/* Security Controls */}
            <ControlCard
              title="Güvenlik Ayarları"
              controls={securityControls}
            />

            {/* Firewall Rules */}
            <Card title="Aktif Firewall Kuralları">
              <div className="space-y-2">
                {firewallRules.map((rule) => (
                  <FirewallRuleRow key={rule.id} rule={rule} />
                ))}
              </div>
            </Card>

            {/* Firewall Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <MetricCard
                title="Aktif Kurallar"
                value={String(firewallRules.filter(r => r.enabled).length)}
                subtitle={`${firewallRules.length} toplam kural`}
                icon="Shield"
                status="ok"
              />
              <MetricCard
                title="Engellenen Paketler"
                value="1,247"
                subtitle="Son 24 saat"
                icon="Ban"
                status="warn"
              />
              <MetricCard
                title="İzin Verilen"
                value="98.2%"
                subtitle="Trafik geçiş oranı"
                icon="CheckCircle"
                status="ok"
              />
            </div>
          </div>
        );

      case 'qos':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-bold text-white">QoS ve Trafik Şekillendirme</h3>
              <p className="text-white/70 text-sm">Servis kalitesi ve bant genişliği yönetimi</p>
            </div>

            {/* QoS Controls */}
            <ControlCard
              title="QoS Yapılandırması"
              controls={qosControls}
            />

            {/* Bandwidth Allocation */}
            <Card title="Bant Genişliği Dağılımı">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { name: 'Gaming Traffic', allocation: 30, color: 'emerald', priority: 'Yüksek' },
                    { name: 'VoIP/Video Calls', allocation: 25, color: 'blue', priority: 'Kritik' },
                    { name: 'Web Browsing', allocation: 20, color: 'yellow', priority: 'Normal' },
                    { name: 'Streaming', allocation: 15, color: 'purple', priority: 'Orta' },
                    { name: 'File Downloads', allocation: 10, color: 'orange', priority: 'Düşük' }
                  ].map((traffic) => (
                    <div key={traffic.name} className="p-4 rounded-xl bg-white/5 border border-white/10">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white font-medium text-sm">{traffic.name}</span>
                        <span className="text-white/80 text-sm">{traffic.allocation}%</span>
                      </div>
                      <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden mb-2">
                        <div 
                          className={`h-full bg-${traffic.color}-400 rounded-full transition-all`}
                          style={{ width: `${traffic.allocation}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-white/60">Öncelik:</span>
                        <span className="text-white">{traffic.priority}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            {/* QoS Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <MetricCard
                title="Aktif QoS Kuralları"
                value="5"
                subtitle="Trafik şekillendirme"
                icon="Zap"
                status="ok"
              />
              <MetricCard
                title="Ortalama Gecikme"
                value="12ms"
                subtitle="Yüksek öncelik"
                icon="Clock"
                status="ok"
              />
              <MetricCard
                title="Bant Kullanımı"
                value="167 Mbps"
                subtitle="1 Gbps'den"
                icon="Activity"
                status="ok"
              />
              <MetricCard
                title="Paket Kaybı"
                value="0.02%"
                subtitle="Kabul edilebilir"
                icon="TrendingDown"
                status="ok"
              />
            </div>
          </div>
        );

      case 'advanced':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-bold text-white">Gelişmiş Ağ Ayarları</h3>
              <p className="text-white/70 text-sm">Expert seviye network konfigürasyonu</p>
            </div>

            {/* Advanced Network Features */}
            <Card title="Gelişmiş Özellikler">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { 
                      title: 'VLAN Trunking',
                      description: '802.1Q VLAN tag desteği',
                      enabled: true,
                      icon: 'Layers'
                    },
                    { 
                      title: 'Link Aggregation',
                      description: 'LACP/Static bonding',
                      enabled: false,
                      icon: 'Link'
                    },
                    { 
                      title: 'Jumbo Frames',
                      description: '9000 byte MTU desteği',
                      enabled: false,
                      icon: 'Package'
                    },
                    { 
                      title: 'Network Namespace',
                      description: 'Isolated network stacks',
                      enabled: false,
                      icon: 'Boxes'
                    }
                  ].map((feature) => {
                    const IconComponent = Icons[feature.icon as keyof typeof Icons] as React.ComponentType<any>;
                    return (
                      <div key={feature.title} className="p-4 rounded-xl bg-white/5 border border-white/10">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              "w-8 h-8 rounded-lg flex items-center justify-center",
                              feature.enabled 
                                ? "bg-emerald-500/20 border border-emerald-500/30"
                                : "bg-gray-500/20 border border-gray-500/30"
                            )}>
                              <IconComponent className={cn(
                                "w-4 h-4",
                                feature.enabled ? "text-emerald-400" : "text-gray-400"
                              )} />
                            </div>
                            <div>
                              <h4 className="text-white font-medium text-sm">{feature.title}</h4>
                              <p className="text-white/60 text-xs">{feature.description}</p>
                            </div>
                          </div>
                          <button
                            className={cn(
                              "relative w-10 h-5 rounded-full transition-all duration-300",
                              feature.enabled 
                                ? "bg-emerald-500 shadow-lg shadow-emerald-500/30" 
                                : "bg-white/20"
                            )}
                          >
                            <div
                              className={cn(
                                "absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all duration-300 shadow-lg",
                                feature.enabled ? "left-5" : "left-0.5"
                              )}
                            />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </Card>

            {/* Kernel Network Parameters */}
            <Card title="Kernel Ağ Parametreleri">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white text-sm font-medium mb-2">TCP Window Scaling</label>
                    <select className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none">
                      <option value="1">Enabled</option>
                      <option value="0">Disabled</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-white text-sm font-medium mb-2">TCP Congestion Control</label>
                    <select className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none">
                      <option value="cubic">CUBIC (Default)</option>
                      <option value="reno">Reno</option>
                      <option value="bbr">BBR</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-white text-sm font-medium mb-2">Network Buffer Size</label>
                    <input
                      type="number"
                      defaultValue={262144}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-white text-sm font-medium mb-2">Connection Tracking</label>
                    <input
                      type="number"
                      defaultValue={65536}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none"
                    />
                  </div>
                </div>
                
                <div className="pt-4 border-t border-white/10">
                  <div className="flex items-center gap-3">
                    <Button variant="outline" className="flex-1">
                      <Icons.RotateCcw className="w-4 h-4 mr-2" />
                      Varsayılanlara Sıfırla
                    </Button>
                    <Button className="flex-1">
                      <Icons.Save className="w-4 h-4 mr-2" />
                      Uygula
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        );

      case 'firewall':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-white">Güvenlik Duvarı</h3>
                <p className="text-white/70 text-sm">iptables/nftables kural yönetimi</p>
              </div>
              <Button onClick={() => setShowFirewallModal(true)}>
                <Icons.Plus className="w-4 h-4 mr-2" />
                Firewall Kuralı
              </Button>
            </div>

            {/* Security Overview */}
            <ControlCard
              title="Güvenlik Duvarı Kontrolü"
              controls={securityControls}
            />

            {/* Firewall Rules List */}
            <Card title="Güvenlik Duvarı Kuralları">
              <div className="space-y-2">
                {firewallRules.map((rule) => (
                  <FirewallRuleRow key={rule.id} rule={rule} />
                ))}
              </div>
            </Card>

            {/* Predefined Rule Templates */}
            <Card title="Hazır Kural Şablonları">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { name: 'SSH Access', description: 'Güvenli SSH erişimi', ports: '22', protocol: 'TCP' },
                  { name: 'Web Services', description: 'HTTP/HTTPS trafiği', ports: '80,443', protocol: 'TCP' },
                  { name: 'VPN Server', description: 'WireGuard VPN', ports: '51820', protocol: 'UDP' },
                  { name: 'DNS Server', description: 'DNS sorguları', ports: '53', protocol: 'UDP/TCP' },
                  { name: 'DHCP Server', description: 'DHCP servisi', ports: '67,68', protocol: 'UDP' },
                  { name: 'Network Discovery', description: 'UPnP/mDNS', ports: '1900,5353', protocol: 'UDP' }
                ].map((template) => (
                  <button
                    key={template.name}
                    className="p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:border-white/20 transition-all text-left"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Icons.Shield className="w-4 h-4 text-emerald-400" />
                      <span className="text-white font-medium text-sm">{template.name}</span>
                    </div>
                    <p className="text-white/60 text-xs">{template.description}</p>
                    <p className="text-white/50 text-xs mt-1">
                      {template.protocol} : {template.ports}
                    </p>
                  </button>
                ))}
              </div>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Network Overview Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard
          title="Aktif Interface'ler"
          value={String(interfaces.filter(i => i.status === 'up').length)}
          subtitle={`${interfaces.length} toplam interface`}
          icon="Network"
          status="ok"
        />
        <MetricCard
          title="Routing Entries"
          value={String(routingRules.filter(r => r.enabled).length)}
          subtitle={`${routingRules.length} toplam route`}
          icon="Route"
          status="ok"
        />
        <MetricCard
          title="Firewall Rules"
          value={String(firewallRules.filter(r => r.enabled).length)}
          subtitle={`${firewallRules.length} toplam kural`}
          icon="Shield"
          status="ok"
        />
        <MetricCard
          title="Network Health"
          value="Sağlıklı"
          subtitle="Tüm servisler çalışıyor"
          icon="Heart"
          status="ok"
        />
      </div>

      {/* Section Navigation */}
      <div className="flex space-x-1 bg-white/5 p-1 rounded-2xl backdrop-blur-sm border border-white/10 overflow-x-auto">
        {sections.map((section) => {
          const IconComponent = Icons[section.icon as keyof typeof Icons] as React.ComponentType<any>;
          return (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={cn(
                "relative flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 font-medium whitespace-nowrap",
                activeSection === section.id
                  ? "bg-emerald-500/20 text-white border border-emerald-500/30 shadow-lg shadow-emerald-500/20"
                  : "text-white/70 hover:text-white hover:bg-white/10 hover:shadow-lg hover:shadow-white/10 border border-transparent hover:border-white/20"
              )}
              style={{
                textShadow: activeSection === section.id ? '0 0 8px rgba(0, 163, 108, 0.6)' : 'none'
              }}
            >
              <IconComponent className="w-4 h-4" />
              <span>{section.label}</span>
            </button>
          );
        })}
      </div>

      {/* Section Content */}
      <motion.div
        key={activeSection}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        {renderSectionContent()}
      </motion.div>

      {/* Modals */}
      <Modal
        isOpen={showFirewallModal}
        onClose={() => setShowFirewallModal(false)}
        title="Yeni Firewall Kuralı"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-white text-sm font-medium mb-2">Kural Adı</label>
              <input
                type="text"
                placeholder="SSH Access Allow"
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
            </div>
            <div>
              <label className="block text-white text-sm font-medium mb-2">Eylem</label>
              <select className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none">
                <option value="allow">Allow</option>
                <option value="deny">Deny</option>
                <option value="reject">Reject</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-white text-sm font-medium mb-2">Kaynak</label>
              <input
                type="text"
                placeholder="192.168.1.0/24 veya any"
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-white text-sm font-medium mb-2">Hedef</label>
              <input
                type="text"
                placeholder="any veya 192.168.1.100"
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-4">
            <Button className="flex-1">
              Kural Ekle
            </Button>
            <Button variant="outline" onClick={() => setShowFirewallModal(false)} className="flex-1">
              İptal
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showRoutingModal}
        onClose={() => setShowRoutingModal(false)}
        title="Yeni Routing Kuralı"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-white text-sm font-medium mb-2">Hedef Network</label>
              <input
                type="text"
                placeholder="192.168.2.0/24"
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-white text-sm font-medium mb-2">Gateway</label>
              <input
                type="text"
                placeholder="192.168.1.1"
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-white text-sm font-medium mb-2">Interface</label>
              <select className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none">
                <option value="eth0">eth0</option>
                <option value="wlan0">wlan0</option>
                <option value="wg0">wg0</option>
              </select>
            </div>
            <div>
              <label className="block text-white text-sm font-medium mb-2">Metric</label>
              <input
                type="number"
                defaultValue={100}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-4">
            <Button className="flex-1">
              Route Ekle
            </Button>
            <Button variant="outline" onClick={() => setShowRoutingModal(false)} className="flex-1">
              İptal
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showInterfaceModal}
        onClose={() => setShowInterfaceModal(false)}
        title="Yeni Ağ Arayüzü"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-white text-sm font-medium mb-2">Interface Adı</label>
              <input
                type="text"
                placeholder="vlan10"
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-white text-sm font-medium mb-2">Interface Tipi</label>
              <select className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none">
                <option value="vlan">VLAN</option>
                <option value="bridge">Bridge</option>
                <option value="bonding">Bonding</option>
                <option value="tun">TUN/TAP</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-4">
            <Button className="flex-1">
              Interface Oluştur
            </Button>
            <Button variant="outline" onClick={() => setShowInterfaceModal(false)} className="flex-1">
              İptal
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default NetworkSettings