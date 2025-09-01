import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { MetricCard } from '../cards/MetricCard';
import { cn } from '../../lib/utils';
import { DHCPPoolManagement } from './DHCPPoolManagement';
import { DHCPReservationManagement } from './DHCPReservationManagement';
import { DHCPLeaseManagement } from './DHCPLeaseManagement';
import { useDHCPStats, useApplyDHCPConfiguration, useDiscoverDHCPServers } from '../../hooks/api/useDHCP';

const DHCPManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState('pools');
  
  const { data: stats, isLoading: statsLoading } = useDHCPStats();
  const applyConfigMutation = useApplyDHCPConfiguration();
  const discoverServersMutation = useDiscoverDHCPServers();

  const tabs = [
    { id: 'pools', label: 'IP Havuzları', icon: 'Network' },
    { id: 'reservations', label: 'Statik IP (MAC Binding)', icon: 'Shield' },
    { id: 'leases', label: 'Aktif Lease\'ler', icon: 'Users' },
    { id: 'groups', label: 'Cihaz Grupları', icon: 'Layers' },
    { id: 'security', label: 'Güvenlik Politikaları', icon: 'Lock' },
    { id: 'options', label: 'DHCP Seçenekleri (PXE/VoIP)', icon: 'Settings' }
  ];

  const handleApplyConfiguration = async () => {
    try {
      const result = await applyConfigMutation.mutateAsync();
      if (result.success) {
        alert('DHCP yapılandırması başarıyla uygulandı');
      } else {
        alert(`Yapılandırma hatası: ${result.errors.join(', ')}`);
      }
    } catch (error) {
      console.error('Apply DHCP configuration error:', error);
    }
  };

  const handleDiscoverServers = async () => {
    try {
      const servers = await discoverServersMutation.mutateAsync();
      console.log('Discovered DHCP servers:', servers);
      alert(`${servers.length} DHCP sunucusu bulundu`);
    } catch (error) {
      console.error('Discover DHCP servers error:', error);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'pools':
        return <DHCPPoolManagement />;
      case 'reservations':
        return <DHCPReservationManagement />;
      case 'leases':
        return <DHCPLeaseManagement />;
      case 'groups':
        return (
          <Card title="Cihaz Grupları ve Politikalar">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { name: 'Admin Cihazları', type: 'admin', color: 'blue', description: 'Sabit IP, güvenli VLAN, tam erişim' },
                  { name: 'IoT Cihazları', type: 'iot', color: 'purple', description: 'Ayrı VLAN, kısa lease, sınırlı erişim' },
                  { name: 'Guest Cihazları', type: 'guest', color: 'orange', description: 'Ayrı VLAN, internet-only, kısa süre' },
                  { name: 'Gaming Cihazları', type: 'gaming', color: 'green', description: 'Dar havuz, düşük gecikme optimizasyonu' },
                  { name: 'VoIP Cihazları', type: 'voip', color: 'pink', description: 'Özel VLAN, VoIP server yönlendirmesi' }
                ].map((group) => (
                  <div key={group.type} className={`p-4 rounded-xl bg-${group.color}-500/10 border border-${group.color}-500/20`}>
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`w-3 h-3 rounded-full bg-${group.color}-400`} />
                      <span className="text-white font-medium">{group.name}</span>
                    </div>
                    <p className="text-white/70 text-sm">{group.description}</p>
                    <Button size="sm" variant="outline" className="w-full mt-3">
                      <div className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" 
                             width="24" height="24" viewBox="0 0 24 24" 
                             fill="none" stroke="currentColor" strokeWidth="2" 
                             strokeLinecap="round" strokeLinejoin="round" 
                             className="w-3 h-3 mr-1">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                          <path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4Z"/>
                        </svg>
                        <span className="truncate">Düzenle</span>
                      </div>
                    </Button>
                  </div>
                ))}
              </div>
              <p className="text-white/60 text-sm">Cihaz grupları yakında tam özellikli olacak...</p>
            </div>
          </Card>
        );
      case 'security':
        return (
          <Card title="DHCP Güvenlik Politikaları">
            <div className="space-y-6">
              {/* MAC Address Filtering */}
              <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                <h4 className="text-orange-400 font-medium mb-3 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" 
                       width="24" height="24" viewBox="0 0 24 24" 
                       fill="none" stroke="currentColor" strokeWidth="2" 
                       strokeLinecap="round" strokeLinejoin="round" 
                       className="w-4 h-4">
                    <path d="M20 13c0 5-3.5 7.5-8 7.5s-8-2.5-8-7.5c0-1.3.3-2.5.8-3.5.5-1 1.2-1.9 2.2-2.6 1-0.7 2.2-1.2 3.5-1.5 1.3-0.3 2.7-0.3 4 0 1.3 0.3 2.5 0.8 3.5 1.5 1 0.7 1.7 1.6 2.2 2.6.5 1 .8 2.2.8 3.5z"/>
                  </svg>
                  MAC Address Filtering
                </h4>
                <p className="text-white/80 text-sm mb-3">Sadece kayıtlı MAC adreslerine IP dağıtımı</p>
                <div className="flex items-center gap-3">
                  <Button variant="outline" className="flex-1">
                    <div className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" 
                           width="24" height="24" viewBox="0 0 24 24" 
                           fill="none" stroke="currentColor" strokeWidth="2" 
                           strokeLinecap="round" strokeLinejoin="round" 
                           className="w-4 h-4 mr-2">
                        <path d="M5 12h14"/>
                        <path d="M12 5v14"/>
                      </svg>
                      <span className="truncate">MAC Filtresi Ekle</span>
                    </div>
                  </Button>
                </div>
              </div>

              {/* DHCP Snooping */}
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                <h4 className="text-red-400 font-medium mb-3 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" 
                       width="24" height="24" viewBox="0 0 24 24" 
                       fill="none" stroke="currentColor" strokeWidth="2" 
                       strokeLinecap="round" strokeLinejoin="round" 
                       className="w-4 h-4">
                    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
                    <path d="M12 9v4"/>
                    <path d="M12 17h.01"/>
                  </svg>
                  DHCP Snooping
                </h4>
                <p className="text-white/80 text-sm mb-3">Sahte DHCP sunucularının engellenmesi (Switch desteği gerekli)</p>
                <Button variant="outline" className="w-full">
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" 
                         width="24" height="24" viewBox="0 0 24 24" 
                         fill="none" stroke="currentColor" strokeWidth="2" 
                         strokeLinecap="round" strokeLinejoin="round" 
                         className="w-4 h-4 mr-2">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/>
                      <path d="M9 12l2 2 4-4"/>
                    </svg>
                    <span className="truncate">Snooping Ayarları</span>
                  </div>
                </Button>
              </div>

              {/* Time-based IP Distribution */}
              <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                <h4 className="text-purple-400 font-medium mb-3 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" 
                       width="24" height="24" viewBox="0 0 24 24" 
                       fill="none" stroke="currentColor" strokeWidth="2" 
                       strokeLinecap="round" strokeLinejoin="round" 
                       className="w-4 h-4">
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12,6 12,12 16,14"/>
                  </svg>
                  Zaman Bazlı IP Dağıtımı
                </h4>
                <p className="text-white/80 text-sm mb-3">Belirli cihazlara sadece belirli saatlerde IP verme</p>
                <Button variant="outline" className="w-full">
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" 
                         width="24" height="24" viewBox="0 0 24 24" 
                         fill="none" stroke="currentColor" strokeWidth="2" 
                         strokeLinecap="round" strokeLinejoin="round" 
                         className="w-4 h-4 mr-2">
                      <path d="M8 2v4"/>
                      <path d="M16 2v4"/>
                      <rect width="18" height="18" x="3" y="4" rx="2"/>
                      <path d="M3 10h18"/>
                    </svg>
                    <span className="truncate">Zaman Kısıtlamaları</span>
                  </div>
                </Button>
              </div>
            </div>
          </Card>
        );
      case 'options':
        return (
          <Card title="Özel DHCP Seçenekleri">
            <div className="space-y-6">
              {/* PXE Boot Configuration */}
              <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <h4 className="text-blue-400 font-medium mb-3 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" 
                       width="24" height="24" viewBox="0 0 24 24" 
                       fill="none" stroke="currentColor" strokeWidth="2" 
                       strokeLinecap="round" strokeLinejoin="round" 
                       className="w-4 h-4">
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                    <polyline points="3.29,7 12,12 20.71,7"/>
                    <line x1="12" x2="12" y1="22" y2="12"/>
                  </svg>
                  PXE Boot Desteği
                </h4>
                <p className="text-white/80 text-sm mb-3">Ağ üzerinden işletim sistemi kurulumu için DHCP seçenekleri</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="p-3 bg-white/5 rounded-lg">
                    <span className="text-white/60 text-sm">TFTP Server:</span>
                    <p className="text-white font-mono">192.168.10.1</p>
                  </div>
                  <div className="p-3 bg-white/5 rounded-lg">
                    <span className="text-white/60 text-sm">Boot Filename:</span>
                    <p className="text-white font-mono">pxelinux.0</p>
                  </div>
                </div>
              </div>

              {/* VoIP Configuration */}
              <div className="p-4 bg-pink-500/10 border border-pink-500/20 rounded-lg">
                <h4 className="text-pink-400 font-medium mb-3 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" 
                       width="24" height="24" viewBox="0 0 24 24" 
                       fill="none" stroke="currentColor" strokeWidth="2" 
                       strokeLinecap="round" strokeLinejoin="round" 
                       className="w-4 h-4">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                  </svg>
                  VoIP Cihaz Yapılandırması
                </h4>
                <p className="text-white/80 text-sm mb-3">VLAN 60 → özel DHCP seçenekleri ile VoIP sunucu yönlendirmesi</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="p-3 bg-white/5 rounded-lg">
                    <span className="text-white/60 text-sm">SIP Server:</span>
                    <p className="text-white font-mono">192.168.60.10</p>
                  </div>
                  <div className="p-3 bg-white/5 rounded-lg">
                    <span className="text-white/60 text-sm">VLAN Priority:</span>
                    <p className="text-white">High QoS</p>
                  </div>
                </div>
              </div>

              {/* VPN Client Integration */}
              <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                <h4 className="text-green-400 font-medium mb-3 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" 
                       width="24" height="24" viewBox="0 0 24 24" 
                       fill="none" stroke="currentColor" strokeWidth="2" 
                       strokeLinecap="round" strokeLinejoin="round" 
                       className="w-4 h-4">
                    <path d="M20 13c0 5-3.5 7.5-8 7.5s-8-2.5-8-7.5c0-1.3.3-2.5.8-3.5.5-1 1.2-1.9 2.2-2.6 1-0.7 2.2-1.2 3.5-1.5 1.3-0.3 2.7-0.3 4 0 1.3 0.3 2.5 0.8 3.5 1.5 1 0.7 1.7 1.6 2.2 2.6.5 1 .8 2.2.8 3.5z"/>
                  </svg>
                  VPN Entegrasyonu
                </h4>
                <p className="text-white/80 text-sm mb-3">WireGuard/OpenVPN istemcilerine DHCP'den IP dağıtımı</p>
                <Button variant="outline" className="w-full">
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" 
                         width="24" height="24" viewBox="0 0 24 24" 
                         fill="none" stroke="currentColor" strokeWidth="2" 
                         strokeLinecap="round" strokeLinejoin="round" 
                         className="w-4 h-4 mr-2">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/>
                      <path d="M9 12l2 2 4-4"/>
                    </svg>
                    <span className="truncate">VPN Entegrasyon Ayarları</span>
                  </div>
                </Button>
              </div>

              {/* Test/Lab Network */}
              <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                <h4 className="text-yellow-400 font-medium mb-3 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" 
                       width="24" height="24" viewBox="0 0 24 24" 
                       fill="none" stroke="currentColor" strokeWidth="2" 
                       strokeLinecap="round" strokeLinejoin="round" 
                       className="w-4 h-4">
                    <path d="M14.5 2v17.5c0 1.4-1.1 2.5-2.5 2.5s-2.5-1.1-2.5-2.5V2"/>
                    <path d="M8.5 2h7"/>
                    <path d="M14.5 16a2.5 2.5 0 0 1-5 0v-4"/>
                  </svg>
                  Test/Lab Ağı
                </h4>
                <p className="text-white/80 text-sm mb-3">Kısa süreli IP dağıtımı (6-12 saat) ile izole test ortamı</p>
                <Button variant="outline" className="w-full">
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" 
                         width="24" height="24" viewBox="0 0 24 24" 
                         fill="none" stroke="currentColor" strokeWidth="2" 
                         strokeLinecap="round" strokeLinejoin="round" 
                         className="w-4 h-4 mr-2">
                      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                      <polyline points="3.29,7 12,12 20.71,7"/>
                      <line x1="12" x2="12" y1="22" y2="12"/>
                    </svg>
                    <span className="truncate">Lab Ağı Konfigürasyonu</span>
                  </div>
                </Button>
              </div>
            </div>
          </Card>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* DHCP Health Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard
          title="DHCP Pools"
          value={stats ? `${stats.active_pools} / ${stats.total_pools}` : '0 / 0'}
          subtitle="Aktif IP havuzları"
          icon="Network"
          status="ok"
        />
        <MetricCard
          title="Aktif Lease'ler"
          value={String(stats?.active_leases || 0)}
          subtitle={`${stats?.total_leases || 0} toplam lease`}
          icon="Users"
          status="ok"
        />
        <MetricCard
          title="Statik IP'ler"
          value={String(stats?.active_reservations || 0)}
          subtitle={`${stats?.total_reservations || 0} rezervasyon`}
          icon="Shield"
          status="ok"
        />
        <MetricCard
          title="Pool Kullanımı"
          value={stats?.pool_utilization.length ? `${Math.round(stats.pool_utilization.reduce((acc, p) => acc + p.utilization_percent, 0) / stats.pool_utilization.length)}%` : '0%'}
          subtitle="Ortalama doluluk"
          icon="BarChart3"
          status="ok"
        />
      </div>

      {/* DHCP Control Panel */}
      <Card title="DHCP Kontrol Paneli">
        <div className="flex items-center gap-3 mb-6">
          <Button
            onClick={handleApplyConfiguration}
            isLoading={applyConfigMutation.isPending}
            disabled={applyConfigMutation.isPending}
          >
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" 
                   width="24" height="24" viewBox="0 0 24 24" 
                   fill="none" stroke="currentColor" strokeWidth="2" 
                   strokeLinecap="round" strokeLinejoin="round" 
                   className="w-4 h-4 mr-2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/>
                <path d="M9 12l2 2 4-4"/>
              </svg>
              <span className="truncate">Konfigürasyonu Uygula</span>
            </div>
          </Button>
          <Button
            variant="outline"
            onClick={handleDiscoverServers}
            isLoading={discoverServersMutation.isPending}
          >
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" 
                   width="24" height="24" viewBox="0 0 24 24" 
                   fill="none" stroke="currentColor" strokeWidth="2" 
                   strokeLinecap="round" strokeLinejoin="round" 
                   className="w-4 h-4 mr-2">
                <circle cx="11" cy="11" r="8"/>
                <path d="m21 21-4.35-4.35"/>
              </svg>
              <span className="truncate">DHCP Sunucuları Tara</span>
            </div>
          </Button>
          <Button variant="outline">
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" 
                   width="24" height="24" viewBox="0 0 24 24" 
                   fill="none" stroke="currentColor" strokeWidth="2" 
                   strokeLinecap="round" strokeLinejoin="round" 
                   className="w-4 h-4 mr-2">
                <path d="M14.5 2v17.5c0 1.4-1.1 2.5-2.5 2.5s-2.5-1.1-2.5-2.5V2"/>
                <path d="M8.5 2h7"/>
                <path d="M14.5 16a2.5 2.5 0 0 1-5 0v-4"/>
              </svg>
              <span className="truncate">Bağlantı Testi</span>
            </div>
          </Button>
        </div>

        {/* Pool Utilization Overview */}
        {stats?.pool_utilization && stats.pool_utilization.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-white font-medium">Pool Kullanım Durumu</h4>
            <div className="space-y-2">
              {stats.pool_utilization.map((pool) => (
                <div key={pool.pool_name} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10">
                  <div className="flex items-center gap-3">
                    <span className="text-white font-medium text-sm">{pool.pool_name}</span>
                    <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs">
                      VLAN {pool.vlan_id}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-white text-sm">{pool.used_ips} / {pool.total_ips}</p>
                      <p className="text-white/60 text-xs">{pool.utilization_percent}% kullanım</p>
                    </div>
                    <div className="w-20 h-2 bg-white/10 rounded-full overflow-hidden">
                      <div 
                        className={cn(
                          "h-full rounded-full transition-all",
                          pool.utilization_percent > 90 ? "bg-red-400" :
                          pool.utilization_percent > 75 ? "bg-orange-400" : "bg-emerald-400"
                        )}
                        style={{ width: `${pool.utilization_percent}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* Tabs */}
      <div className="flex space-x-1 bg-white/5 p-1 rounded-2xl backdrop-blur-sm border border-white/10 overflow-x-auto">
        {tabs.map((tab) => (
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
            <div className="w-4 h-4">
              {tab.icon === 'Network' && (
                <svg xmlns="http://www.w3.org/2000/svg" 
                     width="24" height="24" viewBox="0 0 24 24" 
                     fill="none" stroke="currentColor" strokeWidth="2" 
                     strokeLinecap="round" strokeLinejoin="round" 
                     className="w-4 h-4">
                  <rect x="16" y="16" width="6" height="6" rx="1"/>
                  <rect x="2" y="16" width="6" height="6" rx="1"/>
                  <rect x="9" y="2" width="6" height="6" rx="1"/>
                  <path d="M5 16v-3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3"/>
                  <path d="M12 12V8"/>
                </svg>
              )}
              {tab.icon === 'Shield' && (
                <svg xmlns="http://www.w3.org/2000/svg" 
                     width="24" height="24" viewBox="0 0 24 24" 
                     fill="none" stroke="currentColor" strokeWidth="2" 
                     strokeLinecap="round" strokeLinejoin="round" 
                     className="w-4 h-4">
                  <path d="M20 13c0 5-3.5 7.5-8 7.5s-8-2.5-8-7.5c0-1.3.3-2.5.8-3.5.5-1 1.2-1.9 2.2-2.6 1-0.7 2.2-1.2 3.5-1.5 1.3-0.3 2.7-0.3 4 0 1.3 0.3 2.5 0.8 3.5 1.5 1 0.7 1.7 1.6 2.2 2.6.5 1 .8 2.2.8 3.5z"/>
                </svg>
              )}
              {tab.icon === 'Users' && (
                <svg xmlns="http://www.w3.org/2000/svg" 
                     width="24" height="24" viewBox="0 0 24 24" 
                     fill="none" stroke="currentColor" strokeWidth="2" 
                     strokeLinecap="round" strokeLinejoin="round" 
                     className="w-4 h-4">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
              )}
              {tab.icon === 'Layers' && (
                <svg xmlns="http://www.w3.org/2000/svg" 
                     width="24" height="24" viewBox="0 0 24 24" 
                     fill="none" stroke="currentColor" strokeWidth="2" 
                     strokeLinecap="round" strokeLinejoin="round" 
                     className="w-4 h-4">
                  <path d="M2 12h20l-10-5z"/>
                  <path d="M2 17h20l-10-5z"/>
                  <path d="M2 22h20l-10-5z"/>
                </svg>
              )}
              {tab.icon === 'Lock' && (
                <svg xmlns="http://www.w3.org/2000/svg" 
                     width="24" height="24" viewBox="0 0 24 24" 
                     fill="none" stroke="currentColor" strokeWidth="2" 
                     strokeLinecap="round" strokeLinejoin="round" 
                     className="w-4 h-4">
                  <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
              )}
              {tab.icon === 'Settings' && (
                <svg xmlns="http://www.w3.org/2000/svg" 
                     width="24" height="24" viewBox="0 0 24 24" 
                     fill="none" stroke="currentColor" strokeWidth="2" 
                     strokeLinecap="round" strokeLinejoin="round" 
                     className="w-4 h-4">
                  <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
              )}
            </div>
            <span>{tab.label}</span>
          </button>
        ))}
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
    </div>
  );
};

export default DHCPManagement;