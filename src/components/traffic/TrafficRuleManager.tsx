import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as Icons from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { MetricCard } from '../cards/MetricCard';
import { cn } from '../../lib/utils';
import { 
  EnhancedTrafficRule, 
  TrafficMatcher, 
  ClientGroup, 
  DNSPolicy, 
  EgressPoint,
  RuleBuilder,
  LiveTrafficView,
  TrafficAnalytics,
  trafficRulePresets
} from '../../types/traffic';

export const TrafficRuleManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState('rules');
  const [showRuleBuilder, setShowRuleBuilder] = useState(false);
  const [showPresetModal, setShowPresetModal] = useState(false);
  const [ruleBuilder, setRuleBuilder] = useState<RuleBuilder>({
    step: 'clients',
    selectedClients: [],
    selectedMatchers: [],
    selectedEgress: 'local_internet',
    ruleName: '',
    priority: 50
  });

  // Mock data - in production, these would come from API
  const [rules, setRules] = useState<EnhancedTrafficRule[]>([
    {
      id: 'rule-1',
      name: 'Gaming Priority',
      description: 'Steam ve Xbox trafiği Almanya VPS üzerinden',
      priority: 10,
      is_enabled: true,
      client_groups: ['gaming'],
      traffic_matchers: ['gaming-steam'],
      dns_policy_id: 'bypass',
      egress_point_id: 'wg-de-vps',
      qos_enabled: true,
      latency_priority: 'critical',
      dpi_inspection: false,
      logging_enabled: true,
      match_count: 156,
      bytes_processed: 1024 * 1024 * 1024 * 2.5,
      last_matched: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ]);

  const clientGroups: ClientGroup[] = [
    { id: 'admin', name: 'Admin (VLAN 10)', type: 'vlan', vlan_id: 10, member_count: 3, is_active: true, created_at: '', updated_at: '' },
    { id: 'trusted', name: 'Trusted (VLAN 20)', type: 'vlan', vlan_id: 20, member_count: 8, is_active: true, created_at: '', updated_at: '' },
    { id: 'iot', name: 'IoT (VLAN 30)', type: 'vlan', vlan_id: 30, member_count: 12, is_active: true, created_at: '', updated_at: '' },
    { id: 'guest', name: 'Guest (VLAN 40)', type: 'vlan', vlan_id: 40, member_count: 5, is_active: true, created_at: '', updated_at: '' },
    { id: 'gaming', name: 'Gaming (VLAN 50)', type: 'vlan', vlan_id: 50, member_count: 4, is_active: true, created_at: '', updated_at: '' },
    { id: 'voip', name: 'VoIP/Work (VLAN 60)', type: 'vlan', vlan_id: 60, member_count: 6, is_active: true, created_at: '', updated_at: '' },
    { id: 'lab', name: 'Lab/Test (VLAN 100)', type: 'vlan', vlan_id: 100, member_count: 2, is_active: true, created_at: '', updated_at: '' },
    { id: 'wg-mobile', name: 'WG: Mobile Clients', type: 'wireguard', wg_client_ids: ['client-1', 'client-2'], member_count: 2, is_active: true, created_at: '', updated_at: '' }
  ];

  const trafficMatchers: TrafficMatcher[] = [
    { 
      id: 'gaming-steam', 
      name: 'Steam Gaming', 
      protocols: ['tcp', 'udp'], 
      applications: ['steam'], 
      ports: ['27015-27050'], 
      domains: ['*.steampowered.com', 'steamcommunity.com'],
      created_at: '', 
      updated_at: '' 
    },
    { 
      id: 'voip-general', 
      name: 'VoIP Traffic', 
      protocols: ['sip', 'rtp', 'stun'], 
      applications: [], 
      ports: ['5060', '5061', '10000-20000'], 
      domains: ['*.voip.example'],
      created_at: '', 
      updated_at: '' 
    },
    { 
      id: 'streaming-netflix', 
      name: 'Netflix Streaming', 
      protocols: ['https'], 
      applications: ['netflix'], 
      ports: ['443'], 
      domains: ['*.netflix.com', '*.nflxvideo.net'],
      created_at: '', 
      updated_at: '' 
    }
  ];

  const dnsPolicies: DNSPolicy[] = [
    { 
      id: 'pihole_unbound', 
      name: 'Pi-hole + Unbound', 
      policy_type: 'pihole_unbound',
      pihole_enabled: true,
      unbound_enabled: true,
      ad_blocking: true,
      malware_blocking: true,
      logging_enabled: true,
      description: 'Reklam/zararlı filtre + log',
      is_active: true,
      created_at: '', 
      updated_at: '' 
    },
    { 
      id: 'bypass', 
      name: 'DNS Bypass', 
      policy_type: 'bypass',
      use_egress_dns: true,
      description: 'Seçilen çıkış noktasının DNS\'ini kullan',
      is_active: true,
      created_at: '', 
      updated_at: '' 
    },
    { 
      id: 'custom-cloudflare', 
      name: 'Custom Cloudflare', 
      policy_type: 'custom',
      custom_resolvers: ['1.1.1.1', '1.0.0.1'],
      doh_enabled: true,
      doh_url: 'https://cloudflare-dns.com/dns-query',
      description: 'Cloudflare DoH',
      is_active: true,
      created_at: '', 
      updated_at: '' 
    }
  ];

  const egressPoints: EgressPoint[] = [
    { 
      id: 'local_internet', 
      name: 'Local Internet (ISP)', 
      type: 'local_internet',
      isp_name: 'Local ISP',
      is_active: true,
      is_default: true,
      latency_ms: 15,
      bandwidth_mbps: 1000,
      reliability_score: 0.98,
      description: 'Doğrudan ISP bağlantısı',
      created_at: '', 
      updated_at: '' 
    },
    { 
      id: 'wg-de-vps', 
      name: 'WG: Germany VPS', 
      type: 'wireguard',
      wg_connection_name: 'de_vps',
      wg_endpoint: 'de.example.com:51820',
      is_active: true,
      is_default: false,
      latency_ms: 45,
      bandwidth_mbps: 500,
      reliability_score: 0.95,
      description: 'Almanya VPS - Gaming/VoIP',
      created_at: '', 
      updated_at: '' 
    },
    { 
      id: 'wg-tr-vps', 
      name: 'WG: Turkey VPS', 
      type: 'wireguard',
      wg_connection_name: 'tr_vps',
      wg_endpoint: 'tr.example.com:51820',
      is_active: true,
      is_default: false,
      latency_ms: 25,
      bandwidth_mbps: 300,
      reliability_score: 0.92,
      description: 'Türkiye VPS - Web/DPI Bypass',
      created_at: '', 
      updated_at: '' 
    }
  ];

  const tabs = [
    { id: 'rules', label: 'Trafik Kuralları', icon: 'Zap' },
    { id: 'live', label: 'Canlı İzleme', icon: 'Activity' },
    { id: 'analytics', label: 'Analitik', icon: 'BarChart3' },
    { id: 'config', label: 'Yapılandırma', icon: 'Settings' }
  ];

  const handleCreateRule = () => {
    setRuleBuilder({
      step: 'clients',
      selectedClients: [],
      selectedMatchers: [],
      selectedEgress: 'local_internet',
      ruleName: '',
      priority: 50
    });
    setShowRuleBuilder(true);
  };

  const handlePresetSelect = (preset: typeof trafficRulePresets[0]) => {
    // Apply preset rules
    const newRules = preset.rules.map((presetRule, index) => ({
      id: `preset-${Date.now()}-${index}`,
      name: presetRule.name,
      description: `${preset.description} - ${presetRule.name}`,
      priority: presetRule.priority,
      is_enabled: true,
      client_groups: presetRule.clients,
      traffic_matchers: [`matcher-${presetRule.name.toLowerCase().replace(/\s+/g, '-')}`],
      dns_policy_id: presetRule.dns_policy,
      egress_point_id: presetRule.egress,
      qos_enabled: true,
      latency_priority: 'high' as const,
      logging_enabled: true,
      match_count: 0,
      bytes_processed: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));

    setRules(prev => [...prev, ...newRules]);
    setShowPresetModal(false);
  };

  const getEgressIcon = (type: string) => {
    switch (type) {
      case 'local_internet': return Icons.Globe;
      case 'wireguard': return Icons.Shield;
      default: return Icons.Route;
    }
  };

  const getEgressColor = (egressId: string) => {
    switch (egressId) {
      case 'local_internet': return 'text-blue-400';
      case 'wg-de-vps': return 'text-purple-400';
      case 'wg-tr-vps': return 'text-red-400';
      case 'wg-ae-vps': return 'text-green-400';
      default: return 'text-gray-400';
    }
  };

  const getPriorityIcon = (priority: number) => {
    if (priority <= 20) return Icons.ArrowUp;
    if (priority <= 50) return Icons.ArrowRight;
    return Icons.ArrowDown;
  };

  const getPriorityColor = (priority: number) => {
    if (priority <= 20) return 'text-red-400';
    if (priority <= 50) return 'text-yellow-400';
    return 'text-green-400';
  };

  const TrafficRuleCard: React.FC<{ rule: EnhancedTrafficRule }> = ({ rule }) => {
    const egress = egressPoints.find(e => e.id === rule.egress_point_id);
    const dnsPolicy = dnsPolicies.find(d => d.id === rule.dns_policy_id);
    const PriorityIcon = getPriorityIcon(rule.priority);
    const EgressIcon = getEgressIcon(egress?.type || 'local_internet');
    
    return (
      <Card className="h-full">
        <div className="space-y-4">
          {/* Rule Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center border",
                rule.is_enabled 
                  ? "bg-emerald-500/20 border-emerald-500/30" 
                  : "bg-gray-500/20 border-gray-500/30"
              )}>
                <Icons.Zap className={cn(
                  "w-5 h-5",
                  rule.is_enabled ? "text-emerald-400" : "text-gray-400"
                )} />
              </div>
              <div>
                <h4 className="text-white font-semibold">{rule.name}</h4>
                <p className="text-white/60 text-sm">{rule.description}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <PriorityIcon className={cn("w-4 h-4", getPriorityColor(rule.priority))} />
              <span className="text-white text-sm">{rule.priority}</span>
            </div>
          </div>

          {/* Rule Configuration */}
          <div className="space-y-3">
            {/* Client Groups */}
            <div>
              <span className="text-white/60 text-sm">İstemci Grupları:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {rule.client_groups.map(groupId => {
                  const group = clientGroups.find(g => g.id === groupId);
                  return (
                    <span key={groupId} className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs">
                      {group?.name || groupId}
                    </span>
                  );
                })}
              </div>
            </div>

            {/* Egress and DNS */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/5 rounded-lg p-2">
                <div className="flex items-center gap-2 mb-1">
                  <EgressIcon className={cn("w-3 h-3", getEgressColor(rule.egress_point_id))} />
                  <span className="text-white/60 text-xs">Çıkış:</span>
                </div>
                <p className="text-white text-xs">{egress?.name || 'Unknown'}</p>
              </div>
              <div className="bg-white/5 rounded-lg p-2">
                <div className="flex items-center gap-2 mb-1">
                  <Icons.Globe className="w-3 h-3 text-emerald-400" />
                  <span className="text-white/60 text-xs">DNS:</span>
                </div>
                <p className="text-white text-xs">{dnsPolicy?.name || 'Default'}</p>
              </div>
            </div>

            {/* QoS and Features */}
            <div className="grid grid-cols-3 gap-2">
              <div className={cn(
                "p-2 rounded text-center text-xs",
                rule.qos_enabled ? "bg-purple-500/20 text-purple-400" : "bg-white/5 text-white/60"
              )}>
                <Icons.Gauge className="w-3 h-3 mx-auto mb-1" />
                QoS
              </div>
              <div className={cn(
                "p-2 rounded text-center text-xs",
                rule.dpi_inspection ? "bg-orange-500/20 text-orange-400" : "bg-white/5 text-white/60"
              )}>
                <Icons.Shield className="w-3 h-3 mx-auto mb-1" />
                DPI
              </div>
              <div className={cn(
                "p-2 rounded text-center text-xs",
                rule.logging_enabled ? "bg-blue-500/20 text-blue-400" : "bg-white/5 text-white/60"
              )}>
                <Icons.FileText className="w-3 h-3 mx-auto mb-1" />
                Log
              </div>
            </div>

            {/* Statistics */}
            <div className="text-xs text-white/60 pt-2 border-t border-white/10">
              <div className="flex justify-between">
                <span>Eşleşme:</span>
                <span>{rule.match_count.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Veri:</span>
                <span>{(rule.bytes_processed / (1024 * 1024 * 1024)).toFixed(1)} GB</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 pt-3 border-t border-white/10">
            <Button
              size="sm"
              variant={rule.is_enabled ? "destructive" : "default"}
              onClick={() => {
                setRules(prev => prev.map(r => 
                  r.id === rule.id ? { ...r, is_enabled: !r.is_enabled } : r
                ));
              }}
              className="flex-1"
            >
              {rule.is_enabled ? (
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
            <Button size="sm" variant="outline">
              <Icons.Edit className="w-3 h-3" />
            </Button>
            <Button size="sm" variant="destructive">
              <Icons.Trash2 className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </Card>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'rules':
        return (
          <div className="space-y-6">
            {/* Traffic Rules Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rules.map(rule => (
                <TrafficRuleCard key={rule.id} rule={rule} />
              ))}
            </div>
          </div>
        );

      case 'live':
        return (
          <Card title="Canlı Trafik İzleme">
            <div className="space-y-6">
              {/* Real-time Rule Activity */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-white font-medium mb-3">Aktif Kurallar</h4>
                  <div className="space-y-2">
                    {rules.filter(r => r.is_enabled).map(rule => {
                      const egress = egressPoints.find(e => e.id === rule.egress_point_id);
                      const matchesPerMin = Math.floor(Math.random() * 50) + 5;
                      
                      return (
                        <div key={rule.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10">
                          <div>
                            <p className="text-white font-medium text-sm">{rule.name}</p>
                            <p className="text-white/60 text-xs">{egress?.name}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-emerald-400 font-mono text-sm">{matchesPerMin}/dk</p>
                            <p className="text-white/60 text-xs">eşleşme</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <h4 className="text-white font-medium mb-3">Çıkış Noktası Dağılımı</h4>
                  <div className="space-y-2">
                    {egressPoints.filter(e => e.is_active).map(egress => {
                      const percentage = Math.floor(Math.random() * 60) + 10;
                      const EgressIcon = getEgressIcon(egress.type);
                      
                      return (
                        <div key={egress.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10">
                          <div className="flex items-center gap-2">
                            <EgressIcon className={cn("w-4 h-4", getEgressColor(egress.id))} />
                            <span className="text-white text-sm">{egress.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-2 bg-white/10 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-emerald-400 rounded-full transition-all"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                            <span className="text-white text-sm w-8 text-right">{percentage}%</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Active Client Flows */}
              <div>
                <h4 className="text-white font-medium mb-3">Aktif İstemci Akışları</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {[
                    { ip: '192.168.50.100', name: 'Gaming PC', rule: 'Gaming Priority', egress: 'Germany VPS', speed: '45 Mbps' },
                    { ip: '192.168.60.50', name: 'Work Laptop', rule: 'VoIP Traffic', egress: 'Turkey VPS', speed: '12 Mbps' },
                    { ip: '192.168.20.80', name: 'iPhone 14', rule: 'Default Policy', egress: 'Local ISP', speed: '8 Mbps' }
                  ].map((client, index) => (
                    <div key={index} className="p-3 rounded-lg bg-white/5 border border-white/10">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                        <span className="text-white font-medium text-sm">{client.name}</span>
                      </div>
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span className="text-white/60">IP:</span>
                          <span className="text-white font-mono">{client.ip}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-white/60">Kural:</span>
                          <span className="text-white">{client.rule}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-white/60">Çıkış:</span>
                          <span className="text-white">{client.egress}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-white/60">Hız:</span>
                          <span className="text-emerald-400">{client.speed}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        );

      case 'analytics':
        return (
          <Card title="Trafik Analitikleri">
            <div className="space-y-6">
              {/* Analytics Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <Icons.Zap className="w-5 h-5 text-emerald-400 mb-2" />
                  <p className="text-white text-2xl font-bold">{rules.filter(r => r.is_enabled).length}</p>
                  <p className="text-white/60 text-sm">Aktif Kural</p>
                </div>
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <Icons.Target className="w-5 h-5 text-blue-400 mb-2" />
                  <p className="text-white text-2xl font-bold">{rules.reduce((acc, r) => acc + r.match_count, 0).toLocaleString()}</p>
                  <p className="text-white/60 text-sm">Toplam Eşleşme</p>
                </div>
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <Icons.HardDrive className="w-5 h-5 text-purple-400 mb-2" />
                  <p className="text-white text-2xl font-bold">
                    {(rules.reduce((acc, r) => acc + r.bytes_processed, 0) / (1024 * 1024 * 1024)).toFixed(1)} GB
                  </p>
                  <p className="text-white/60 text-sm">İşlenen Veri</p>
                </div>
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <Icons.Clock className="w-5 h-5 text-orange-400 mb-2" />
                  <p className="text-white text-2xl font-bold">
                    {egressPoints.filter(e => e.is_active).reduce((acc, e) => acc + (e.latency_ms || 0), 0) / egressPoints.filter(e => e.is_active).length || 0}ms
                  </p>
                  <p className="text-white/60 text-sm">Ortalama Gecikme</p>
                </div>
              </div>

              {/* Top Rules */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-white font-medium mb-3">En Çok Tetiklenen Kurallar</h4>
                  <div className="space-y-2">
                    {rules.sort((a, b) => b.match_count - a.match_count).slice(0, 5).map((rule, index) => (
                      <div key={rule.id} className="flex items-center justify-between p-2 rounded-lg bg-white/5">
                        <div className="flex items-center gap-2">
                          <span className="text-emerald-400 font-mono text-sm">{index + 1}</span>
                          <span className="text-white text-sm">{rule.name}</span>
                        </div>
                        <span className="text-white/60 text-sm">{rule.match_count.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-white font-medium mb-3">Çıkış Noktası Kullanımı</h4>
                  <div className="space-y-2">
                    {egressPoints.filter(e => e.is_active).map(egress => {
                      const usage = Math.floor(Math.random() * 40) + 10;
                      const EgressIcon = getEgressIcon(egress.type);
                      
                      return (
                        <div key={egress.id} className="flex items-center justify-between p-2 rounded-lg bg-white/5">
                          <div className="flex items-center gap-2">
                            <EgressIcon className={cn("w-4 h-4", getEgressColor(egress.id))} />
                            <span className="text-white text-sm">{egress.name}</span>
                          </div>
                          <span className="text-white/60 text-sm">{usage}%</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        );

      case 'config':
        return (
          <div className="space-y-6">
            {/* Client Groups Configuration */}
            <Card title="İstemci Grupları">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {clientGroups.map(group => (
                  <div key={group.id} className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <div className="flex items-center gap-2 mb-2">
                      {group.type === 'vlan' ? (
                        <div 
                          className="w-6 h-6 rounded border flex items-center justify-center text-white font-bold text-xs"
                          style={{ backgroundColor: `hsl(${(group.vlan_id || 0) * 36}, 70%, 50%)` }}
                        >
                          {group.vlan_id}
                        </div>
                      ) : (
                        <Icons.Shield className="w-4 h-4 text-emerald-400" />
                      )}
                      <span className="text-white font-medium">{group.name}</span>
                    </div>
                    <p className="text-white/60 text-sm mb-2">{group.member_count} üye</p>
                    <div className={cn(
                      "w-2 h-2 rounded-full",
                      group.is_active ? "bg-emerald-400" : "bg-red-400"
                    )} />
                  </div>
                ))}
              </div>
            </Card>

            {/* DNS Policies */}
            <Card title="DNS Filtreleme Politikaları">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {dnsPolicies.map(policy => (
                  <div key={policy.id} className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <div className="flex items-center gap-2 mb-2">
                      <Icons.Globe className="w-4 h-4 text-blue-400" />
                      <span className="text-white font-medium">{policy.name}</span>
                    </div>
                    <p className="text-white/60 text-sm mb-3">{policy.description}</p>
                    
                    {/* Features */}
                    <div className="grid grid-cols-2 gap-2">
                      {policy.pihole_enabled && (
                        <div className="bg-red-500/20 rounded p-1 text-center">
                          <Icons.Shield className="w-3 h-3 text-red-400 mx-auto mb-1" />
                          <span className="text-xs text-white">Pi-hole</span>
                        </div>
                      )}
                      {policy.unbound_enabled && (
                        <div className="bg-purple-500/20 rounded p-1 text-center">
                          <Icons.Lock className="w-3 h-3 text-purple-400 mx-auto mb-1" />
                          <span className="text-xs text-white">Unbound</span>
                        </div>
                      )}
                      {policy.doh_enabled && (
                        <div className="bg-emerald-500/20 rounded p-1 text-center">
                          <Icons.Key className="w-3 h-3 text-emerald-400 mx-auto mb-1" />
                          <span className="text-xs text-white">DoH</span>
                        </div>
                      )}
                      {policy.use_egress_dns && (
                        <div className="bg-orange-500/20 rounded p-1 text-center">
                          <Icons.Route className="w-3 h-3 text-orange-400 mx-auto mb-1" />
                          <span className="text-xs text-white">Bypass</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Egress Points */}
            <Card title="Çıkış Noktaları">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {egressPoints.map(egress => {
                  const EgressIcon = getEgressIcon(egress.type);
                  
                  return (
                    <div key={egress.id} className="p-4 rounded-xl bg-white/5 border border-white/10">
                      <div className="flex items-center gap-2 mb-2">
                        <EgressIcon className={cn("w-4 h-4", getEgressColor(egress.id))} />
                        <span className="text-white font-medium">{egress.name}</span>
                        {egress.is_default && (
                          <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs">
                            Varsayılan
                          </span>
                        )}
                      </div>
                      
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span className="text-white/60">Gecikme:</span>
                          <span className="text-white">{egress.latency_ms}ms</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-white/60">Bant:</span>
                          <span className="text-white">{egress.bandwidth_mbps} Mbps</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-white/60">Güvenilirlik:</span>
                          <span className="text-white">{((egress.reliability_score || 0) * 100).toFixed(0)}%</span>
                        </div>
                      </div>
                      
                      <div className={cn(
                        "w-2 h-2 rounded-full mt-2",
                        egress.is_active ? "bg-emerald-400" : "bg-red-400"
                      )} />
                    </div>
                  );
                })}
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Gelişmiş Trafik Kuralları</h2>
          <p className="text-white/70 text-sm">Protokol bazlı yönlendirme, DNS politikaları ve canlı izleme</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setShowPresetModal(true)}>
            <Icons.Download className="w-4 h-4 mr-2" />
            Preset Kurallar
          </Button>
          <Button onClick={handleCreateRule}>
            <Icons.Plus className="w-4 h-4 mr-2" />
            Kural Oluştur
          </Button>
        </div>
      </div>

      {/* System Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard
          title="Aktif Kurallar"
          value={String(rules.filter(r => r.is_enabled).length)}
          subtitle={`${rules.length} toplam kuraldan`}
          icon="Zap"
          status="ok"
        />
        <MetricCard
          title="Eşleşme Oranı"
          value="92%"
          subtitle="Trafiğin kurallara eşleşme oranı"
          icon="Target"
          status="ok"
        />
        <MetricCard
          title="Varsayılan Politika"
          value="68%"
          subtitle="Kural dışı trafik (Local ISP)"
          icon="Globe"
          status="warn"
        />
        <MetricCard
          title="VPN Kullanımı"
          value="32%"
          subtitle="WireGuard tünelleri"
          icon="Shield"
          status="ok"
        />
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-white/5 p-1 rounded-2xl backdrop-blur-sm border border-white/10 overflow-x-auto">
        {tabs.map((tab) => {
          const IconComponent = Icons[tab.icon as keyof typeof Icons] as React.ComponentType<any>;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "relative flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 font-medium whitespace-nowrap",
                activeTab === tab.id
                  ? "bg-emerald-500/20 text-white border border-emerald-500/30 shadow-lg shadow-emerald-500/20"
                  : "text-white/70 hover:text-white hover:bg-white/10 hover:shadow-lg hover:shadow-white/10 border border-transparent hover:border-white/20"
              )}
              style={{
                textShadow: activeTab === tab.id ? '0 0 8px rgba(0, 163, 108, 0.6)' : 'none'
              }}
            >
              <IconComponent className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
        >
          {renderTabContent()}
        </motion.div>
      </AnimatePresence>

      {/* Preset Rules Modal */}
      <Modal
        isOpen={showPresetModal}
        onClose={() => setShowPresetModal(false)}
        title="Önceden Tanımlanmış Kural Setleri"
        size="lg"
      >
        <div className="space-y-4">
          <p className="text-white/70 text-sm">Yaygın kullanım senaryoları için hazır kural setleri</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {trafficRulePresets.map(preset => (
              <button
                key={preset.name}
                onClick={() => handlePresetSelect(preset)}
                className="p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:border-white/20 transition-all text-left"
              >
                <div className="flex items-center gap-3 mb-2">
                  {preset.category === 'gaming' && <Icons.Gamepad2 className="w-5 h-5 text-purple-400" />}
                  {preset.category === 'voip' && <Icons.Phone className="w-5 h-5 text-green-400" />}
                  {preset.category === 'business' && <Icons.Briefcase className="w-5 h-5 text-blue-400" />}
                  {preset.category === 'streaming' && <Icons.Play className="w-5 h-5 text-red-400" />}
                  {preset.category === 'security' && <Icons.Shield className="w-5 h-5 text-orange-400" />}
                  {preset.category === 'family' && <Icons.Heart className="w-5 h-5 text-pink-400" />}
                  
                  <span className="text-white font-medium">{preset.name}</span>
                </div>
                <p className="text-white/70 text-sm mb-2">{preset.description}</p>
                <p className="text-white/50 text-xs">{preset.rules.length} kural içerir</p>
              </button>
            ))}
          </div>
        </div>
      </Modal>

      {/* Rule Builder Modal */}
      <Modal
        isOpen={showRuleBuilder}
        onClose={() => setShowRuleBuilder(false)}
        title="Yeni Trafik Kuralı Oluştur"
        size="xl"
      >
        <div className="space-y-6">
          {/* Step Indicator */}
          <div className="flex items-center justify-between">
            {(['clients', 'traffic', 'dns', 'egress', 'review'] as const).map((step, index) => (
              <div key={step} className="flex items-center">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center border-2 font-bold text-sm",
                  ruleBuilder.step === step 
                    ? "bg-emerald-500 border-emerald-400 text-white" 
                    : "border-white/20 text-white/60"
                )}>
                  {index + 1}
                </div>
                {index < 4 && <div className="w-12 h-0.5 bg-white/20 mx-2" />}
              </div>
            ))}
          </div>

          {/* Step Content */}
          {ruleBuilder.step === 'clients' && (
            <div>
              <h3 className="text-white font-semibold mb-4">1. İstemci Grupları Seçin</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {clientGroups.map(group => (
                  <button
                    key={group.id}
                    onClick={() => {
                      const selected = ruleBuilder.selectedClients.includes(group.id);
                      setRuleBuilder(prev => ({
                        ...prev,
                        selectedClients: selected 
                          ? prev.selectedClients.filter(id => id !== group.id)
                          : [...prev.selectedClients, group.id]
                      }));
                    }}
                    className={cn(
                      "p-3 rounded-lg border text-left transition-all",
                      ruleBuilder.selectedClients.includes(group.id)
                        ? "bg-emerald-500/20 border-emerald-500/30 text-white"
                        : "bg-white/5 border-white/10 text-white/80 hover:bg-white/10 hover:border-white/20"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      {group.type === 'vlan' ? (
                        <div 
                          className="w-6 h-6 rounded border flex items-center justify-center text-white font-bold text-xs"
                          style={{ backgroundColor: `hsl(${(group.vlan_id || 0) * 36}, 70%, 50%)` }}
                        >
                          {group.vlan_id}
                        </div>
                      ) : (
                        <Icons.Shield className="w-4 h-4 text-emerald-400" />
                      )}
                      <div>
                        <p className="font-medium">{group.name}</p>
                        <p className="text-xs text-white/60">{group.member_count} üye</p>
                      </div>
                      {ruleBuilder.selectedClients.includes(group.id) && (
                        <Icons.Check className="w-4 h-4 text-emerald-400 ml-auto" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {ruleBuilder.step === 'traffic' && (
            <div>
              <h3 className="text-white font-semibold mb-4">2. Trafik Tipi Seçin</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {trafficMatchers.map(matcher => (
                  <button
                    key={matcher.id}
                    onClick={() => {
                      const selected = ruleBuilder.selectedMatchers.includes(matcher.id);
                      setRuleBuilder(prev => ({
                        ...prev,
                        selectedMatchers: selected 
                          ? prev.selectedMatchers.filter(id => id !== matcher.id)
                          : [...prev.selectedMatchers, matcher.id]
                      }));
                    }}
                    className={cn(
                      "p-3 rounded-lg border text-left transition-all",
                      ruleBuilder.selectedMatchers.includes(matcher.id)
                        ? "bg-emerald-500/20 border-emerald-500/30 text-white"
                        : "bg-white/5 border-white/10 text-white/80 hover:bg-white/10 hover:border-white/20"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Icons.Target className="w-4 h-4 text-blue-400" />
                      <div>
                        <p className="font-medium">{matcher.name}</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {matcher.protocols.slice(0, 3).map(protocol => (
                            <span key={protocol} className="px-1 py-0.5 bg-blue-500/20 text-blue-400 rounded text-xs">
                              {protocol}
                            </span>
                          ))}
                          {matcher.applications.slice(0, 2).map(app => (
                            <span key={app} className="px-1 py-0.5 bg-purple-500/20 text-purple-400 rounded text-xs">
                              {app}
                            </span>
                          ))}
                        </div>
                      </div>
                      {ruleBuilder.selectedMatchers.includes(matcher.id) && (
                        <Icons.Check className="w-4 h-4 text-emerald-400 ml-auto" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {ruleBuilder.step === 'dns' && (
            <div>
              <h3 className="text-white font-semibold mb-4">3. DNS Politikası Seçin</h3>
              <div className="grid grid-cols-1 gap-3">
                {dnsPolicies.map(policy => (
                  <button
                    key={policy.id}
                    onClick={() => setRuleBuilder(prev => ({ ...prev, selectedDNSPolicy: policy.id }))}
                    className={cn(
                      "p-4 rounded-lg border text-left transition-all",
                      ruleBuilder.selectedDNSPolicy === policy.id
                        ? "bg-emerald-500/20 border-emerald-500/30 text-white"
                        : "bg-white/5 border-white/10 text-white/80 hover:bg-white/10 hover:border-white/20"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Icons.Globe className="w-5 h-5 text-blue-400" />
                      <div>
                        <p className="font-medium">{policy.name}</p>
                        <p className="text-xs text-white/60">{policy.description}</p>
                      </div>
                      {ruleBuilder.selectedDNSPolicy === policy.id && (
                        <Icons.Check className="w-4 h-4 text-emerald-400 ml-auto" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {ruleBuilder.step === 'egress' && (
            <div>
              <h3 className="text-white font-semibold mb-4">4. Çıkış Noktası Seçin</h3>
              <div className="grid grid-cols-1 gap-3">
                {egressPoints.filter(e => e.is_active).map(egress => {
                  const EgressIcon = getEgressIcon(egress.type);
                  
                  return (
                    <button
                      key={egress.id}
                      onClick={() => setRuleBuilder(prev => ({ ...prev, selectedEgress: egress.id }))}
                      className={cn(
                        "p-4 rounded-lg border text-left transition-all",
                        ruleBuilder.selectedEgress === egress.id
                          ? "bg-emerald-500/20 border-emerald-500/30 text-white"
                          : "bg-white/5 border-white/10 text-white/80 hover:bg-white/10 hover:border-white/20"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <EgressIcon className={cn("w-5 h-5", getEgressColor(egress.id))} />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{egress.name}</p>
                            {egress.is_default && (
                              <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs">
                                Varsayılan
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-white/60">{egress.description}</p>
                          <div className="flex gap-4 mt-1 text-xs text-white/60">
                            <span>Ping: {egress.latency_ms}ms</span>
                            <span>Bant: {egress.bandwidth_mbps} Mbps</span>
                          </div>
                        </div>
                        {ruleBuilder.selectedEgress === egress.id && (
                          <Icons.Check className="w-4 h-4 text-emerald-400" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {ruleBuilder.step === 'review' && (
            <div>
              <h3 className="text-white font-semibold mb-4">5. Kural Onayı</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-white text-sm font-medium mb-2">Kural Adı</label>
                  <input
                    type="text"
                    value={ruleBuilder.ruleName}
                    onChange={(e) => setRuleBuilder(prev => ({ ...prev, ruleName: e.target.value }))}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                    placeholder="Özel Trafik Kuralı"
                  />
                </div>

                <div>
                  <label className="block text-white text-sm font-medium mb-2">Öncelik (1-100, düşük sayı = yüksek öncelik)</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={ruleBuilder.priority}
                    onChange={(e) => setRuleBuilder(prev => ({ ...prev, priority: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none"
                  />
                </div>

                {/* Rule Summary */}
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                  <h4 className="text-emerald-400 font-medium mb-3">Kural Özeti</h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-white/60">İstemci Grupları: </span>
                      <span className="text-white">
                        {ruleBuilder.selectedClients.map(id => 
                          clientGroups.find(g => g.id === id)?.name
                        ).join(', ')}
                      </span>
                    </div>
                    <div>
                      <span className="text-white/60">Trafik Eşleyiciler: </span>
                      <span className="text-white">
                        {ruleBuilder.selectedMatchers.map(id => 
                          trafficMatchers.find(m => m.id === id)?.name
                        ).join(', ')}
                      </span>
                    </div>
                    <div>
                      <span className="text-white/60">DNS Politikası: </span>
                      <span className="text-white">
                        {dnsPolicies.find(d => d.id === ruleBuilder.selectedDNSPolicy)?.name || 'Varsayılan'}
                      </span>
                    </div>
                    <div>
                      <span className="text-white/60">Çıkış Noktası: </span>
                      <span className="text-white">
                        {egressPoints.find(e => e.id === ruleBuilder.selectedEgress)?.name}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between pt-4 border-t border-white/10">
            <Button
              variant="outline"
              onClick={() => {
                const steps = ['clients', 'traffic', 'dns', 'egress', 'review'] as const;
                const currentIndex = steps.indexOf(ruleBuilder.step);
                if (currentIndex > 0) {
                  setRuleBuilder(prev => ({ ...prev, step: steps[currentIndex - 1] }));
                }
              }}
              disabled={ruleBuilder.step === 'clients'}
            >
              <Icons.ChevronLeft className="w-4 h-4 mr-2" />
              Geri
            </Button>

            <div className="flex items-center gap-2">
              {ruleBuilder.step === 'review' ? (
                <Button
                  onClick={() => {
                    // Create the rule
                    const newRule: EnhancedTrafficRule = {
                      id: `rule-${Date.now()}`,
                      name: ruleBuilder.ruleName || 'Yeni Kural',
                      priority: ruleBuilder.priority,
                      is_enabled: true,
                      client_groups: ruleBuilder.selectedClients,
                      traffic_matchers: ruleBuilder.selectedMatchers,
                      dns_policy_id: ruleBuilder.selectedDNSPolicy,
                      egress_point_id: ruleBuilder.selectedEgress,
                      qos_enabled: false,
                      logging_enabled: true,
                      match_count: 0,
                      bytes_processed: 0,
                      created_at: new Date().toISOString(),
                      updated_at: new Date().toISOString()
                    };
                    
                    setRules(prev => [...prev, newRule]);
                    setShowRuleBuilder(false);
                  }}
                  disabled={!ruleBuilder.ruleName || ruleBuilder.selectedClients.length === 0 || ruleBuilder.selectedMatchers.length === 0}
                >
                  <Icons.Save className="w-4 h-4 mr-2" />
                  Kuralı Oluştur
                </Button>
              ) : (
                <Button
                  onClick={() => {
                    const steps = ['clients', 'traffic', 'dns', 'egress', 'review'] as const;
                    const currentIndex = steps.indexOf(ruleBuilder.step);
                    if (currentIndex < steps.length - 1) {
                      setRuleBuilder(prev => ({ ...prev, step: steps[currentIndex + 1] }));
                    }
                  }}
                  disabled={
                    (ruleBuilder.step === 'clients' && ruleBuilder.selectedClients.length === 0) ||
                    (ruleBuilder.step === 'traffic' && ruleBuilder.selectedMatchers.length === 0)
                  }
                >
                  İleri
                  <Icons.ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};