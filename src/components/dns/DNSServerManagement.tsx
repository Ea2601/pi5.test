import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { cn } from '../../lib/utils';
import { 
  useDNSServers, 
  useCreateDNSServer, 
  useUpdateDNSServer, 
  useDeleteDNSServer,
  useTestDNSServer 
} from '../../hooks/api/useDNS';
import { DNSServer } from '../../types/dns';

interface ServerFormData {
  name: string;
  description: string;
  ip_address: string;
  port: number;
  type: 'standard' | 'doh' | 'dot' | 'dnssec';
  provider: 'google' | 'cloudflare' | 'quad9' | 'custom';
  is_primary: boolean;
  is_fallback: boolean;
  doh_url: string;
  dot_hostname: string;
  priority: number;
}

const predefinedServers = {
  google: { name: 'Google DNS', ip: '8.8.8.8', doh: 'https://dns.google/dns-query', dot: 'dns.google' },
  cloudflare: { name: 'Cloudflare DNS', ip: '1.1.1.1', doh: 'https://cloudflare-dns.com/dns-query', dot: 'cloudflare-dns.com' },
  quad9: { name: 'Quad9 Secure', ip: '9.9.9.9', doh: 'https://dns.quad9.net/dns-query', dot: 'dns.quad9.net' }
};

export const DNSServerManagement: React.FC = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingServer, setEditingServer] = useState<DNSServer | null>(null);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  
  const { data: servers = [], isLoading } = useDNSServers();
  const createServerMutation = useCreateDNSServer();
  const updateServerMutation = useUpdateDNSServer();
  const deleteServerMutation = useDeleteDNSServer();
  const testServerMutation = useTestDNSServer();

  const [formData, setFormData] = useState<ServerFormData>({
    name: '',
    description: '',
    ip_address: '',
    port: 53,
    type: 'standard',
    provider: 'custom',
    is_primary: false,
    is_fallback: false,
    doh_url: '',
    dot_hostname: '',
    priority: 100
  });

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      ip_address: '',
      port: 53,
      type: 'standard',
      provider: 'custom',
      is_primary: false,
      is_fallback: false,
      doh_url: '',
      dot_hostname: '',
      priority: 100
    });
  };

  const handleCreateServer = async () => {
    try {
      await createServerMutation.mutateAsync({
        ...formData,
        supports_dnssec: formData.type === 'dnssec',
        supports_doh: formData.type === 'doh' && !!formData.doh_url,
        supports_dot: formData.type === 'dot' && !!formData.dot_hostname
      });
      setShowCreateModal(false);
      resetForm();
    } catch (error) {
      console.error('Create DNS server error:', error);
    }
  };

  const handleQuickAdd = async (provider: keyof typeof predefinedServers) => {
    const serverConfig = predefinedServers[provider];
    try {
      await createServerMutation.mutateAsync({
        name: serverConfig.name,
        ip_address: serverConfig.ip,
        provider,
        type: 'doh',
        supports_doh: true,
        supports_dot: true,
        supports_dnssec: true,
        doh_url: serverConfig.doh,
        dot_hostname: serverConfig.dot,
        port: 53,
        priority: servers.length + 1,
        is_active: true
      });
      setShowQuickAdd(false);
    } catch (error) {
      console.error('Quick add DNS server error:', error);
    }
  };

  const handleTestServer = async (ipAddress: string) => {
    try {
      const result = await testServerMutation.mutateAsync(ipAddress);
      if (result.success) {
        alert(`DNS sunucusu test edildi: ${result.response_time}ms`);
      } else {
        alert(`DNS test başarısız: ${result.error}`);
      }
    } catch (error) {
      console.error('DNS test error:', error);
    }
  };

  const ServerCard: React.FC<{ server: DNSServer }> = ({ server }) => {
    return (
      <Card className="h-full">
        <div className="space-y-4">
          {/* Server Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center",
                server.is_active 
                  ? "bg-emerald-500/20 border border-emerald-500/30" 
                  : "bg-gray-500/20 border border-gray-500/30"
              )}>
                <svg xmlns="http://www.w3.org/2000/svg" 
                     width="24" height="24" viewBox="0 0 24 24" 
                     fill="none" stroke="currentColor" strokeWidth="2" 
                     strokeLinecap="round" strokeLinejoin="round" 
                     className={cn("w-5 h-5", server.is_active ? "text-emerald-400" : "text-gray-400")}>
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/>
                  <path d="M2 12h20"/>
                </svg>
              </div>
              <div>
                <h4 className="text-white font-semibold">{server.name}</h4>
                <p className="text-white/60 text-sm">{server.ip_address}:{server.port}</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {server.is_primary && (
                <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs border border-blue-500/30">
                  Primary
                </span>
              )}
              {server.is_fallback && (
                <span className="px-2 py-1 bg-orange-500/20 text-orange-400 rounded-full text-xs border border-orange-500/30">
                  Fallback
                </span>
              )}
            </div>
          </div>

          {/* Server Features */}
          <div className="grid grid-cols-3 gap-2">
            {server.supports_dnssec && (
              <div className="bg-white/5 rounded-lg p-2 text-center">
                <div className="w-4 h-4 mx-auto mb-1">
                  <svg xmlns="http://www.w3.org/2000/svg" 
                       width="24" height="24" viewBox="0 0 24 24" 
                       fill="none" stroke="currentColor" strokeWidth="2" 
                       strokeLinecap="round" strokeLinejoin="round" 
                       className="w-4 h-4 text-emerald-400">
                    <path d="M20 13c0 5-3.5 7.5-8 7.5s-8-2.5-8-7.5c0-1.3.3-2.5.8-3.5.5-1 1.2-1.9 2.2-2.6 1-0.7 2.2-1.2 3.5-1.5 1.3-0.3 2.7-0.3 4 0 1.3 0.3 2.5 0.8 3.5 1.5 1 0.7 1.7 1.6 2.2 2.6.5 1 .8 2.2.8 3.5z"/>
                  </svg>
                </div>
                <span className="text-xs text-white">DNSSEC</span>
              </div>
            )}
            {server.supports_doh && (
              <div className="bg-white/5 rounded-lg p-2 text-center">
                <div className="w-4 h-4 mx-auto mb-1">
                  <svg xmlns="http://www.w3.org/2000/svg" 
                       width="24" height="24" viewBox="0 0 24 24" 
                       fill="none" stroke="currentColor" strokeWidth="2" 
                       strokeLinecap="round" strokeLinejoin="round" 
                       className="w-4 h-4 text-blue-400">
                    <path d="M7 10v12"/>
                    <path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h0a3.13 3.13 0 0 1 3 3.88Z"/>
                  </svg>
                </div>
                <span className="text-xs text-white">DoH</span>
              </div>
            )}
            {server.supports_dot && (
              <div className="bg-white/5 rounded-lg p-2 text-center">
                <div className="w-4 h-4 mx-auto mb-1">
                  <svg xmlns="http://www.w3.org/2000/svg" 
                       width="24" height="24" viewBox="0 0 24 24" 
                       fill="none" stroke="currentColor" strokeWidth="2" 
                       strokeLinecap="round" strokeLinejoin="round" 
                       className="w-4 h-4 text-purple-400">
                    <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
                    <path d="m7 11-2-2-2 2"/>
                    <path d="m13 11-2-2-2 2"/>
                    <path d="m19 11-2-2-2 2"/>
                  </svg>
                </div>
                <span className="text-xs text-white">DoT</span>
              </div>
            )}
          </div>

          {/* Performance Stats */}
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-white/60">Yanıt Süresi:</span>
              <span className="text-white">{server.response_time_ms}ms</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/60">Güvenilirlik:</span>
              <span className="text-white">{(server.reliability_score * 100).toFixed(1)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/60">Öncelik:</span>
              <span className="text-white">{server.priority}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 pt-3 border-t border-white/10">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleTestServer(server.ip_address)}
              className="flex-1"
            >
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" 
                     width="24" height="24" viewBox="0 0 24 24" 
                     fill="none" stroke="currentColor" strokeWidth="2" 
                     strokeLinecap="round" strokeLinejoin="round" 
                     className="w-3 h-3 mr-1">
                  <path d="M14.5 2v17.5c0 1.4-1.1 2.5-2.5 2.5s-2.5-1.1-2.5-2.5V2"/>
                  <path d="M8.5 2h7"/>
                  <path d="M14.5 16a2.5 2.5 0 0 1-5 0v-4"/>
                </svg>
                <span className="truncate">Test</span>
              </div>
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setEditingServer(server);
                setFormData({
                  name: server.name,
                  description: server.description || '',
                  ip_address: server.ip_address,
                  port: server.port,
                  type: server.type as any,
                  provider: server.provider as any || 'custom',
                  is_primary: server.is_primary,
                  is_fallback: server.is_fallback,
                  doh_url: server.doh_url || '',
                  dot_hostname: server.dot_hostname || '',
                  priority: server.priority
                });
              }}
            >
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" 
                     width="24" height="24" viewBox="0 0 24 24" 
                     fill="none" stroke="currentColor" strokeWidth="2" 
                     strokeLinecap="round" strokeLinejoin="round" 
                     className="w-3 h-3">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4Z"/>
                </svg>
              </div>
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => {
                if (confirm('Bu DNS sunucusunu silmek istediğinizden emin misiniz?')) {
                  deleteServerMutation.mutate(server.id);
                }
              }}
            >
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" 
                     width="24" height="24" viewBox="0 0 24 24" 
                     fill="none" stroke="currentColor" strokeWidth="2" 
                     strokeLinecap="round" strokeLinejoin="round" 
                     className="w-3 h-3">
                  <path d="M3 6h18"/>
                  <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
                  <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                  <line x1="10" x2="10" y1="11" y2="17"/>
                  <line x1="14" x2="14" y1="11" y2="17"/>
                </svg>
              </div>
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
          <h3 className="text-xl font-bold text-white">DNS Sunucu Yönetimi</h3>
          <p className="text-white/70 text-sm">DNS çözümleyici sunucularını yapılandırın</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setShowQuickAdd(true)}>
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" 
                   width="24" height="24" viewBox="0 0 24 24" 
                   fill="none" stroke="currentColor" strokeWidth="2" 
                   strokeLinecap="round" strokeLinejoin="round" 
                   className="w-4 h-4 mr-2">
                <path d="M5 12h14"/>
                <path d="M12 5v14"/>
              </svg>
              <span className="truncate">Hızlı Ekle</span>
            </div>
          </Button>
          <Button onClick={() => setShowCreateModal(true)}>
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" 
                   width="24" height="24" viewBox="0 0 24 24" 
                   fill="none" stroke="currentColor" strokeWidth="2" 
                   strokeLinecap="round" strokeLinejoin="round" 
                   className="w-4 h-4 mr-2">
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/>
                <path d="M2 12h20"/>
              </svg>
              <span className="truncate">Özel Sunucu</span>
            </div>
          </Button>
        </div>
      </div>

      {/* DNS Servers Grid */}
      {servers.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-blue-500/20 rounded-xl flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" 
                   width="24" height="24" viewBox="0 0 24 24" 
                   fill="none" stroke="currentColor" strokeWidth="2" 
                   strokeLinecap="round" strokeLinejoin="round" 
                   className="w-8 h-8 text-blue-400">
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/>
                <path d="M2 12h20"/>
              </svg>
            </div>
            <h3 className="text-white font-semibold mb-2">Henüz DNS sunucusu bulunmuyor</h3>
            <p className="text-white/60 mb-4">İlk DNS sunucunuzu ekleyin</p>
            <div className="flex items-center gap-2 justify-center">
              <Button onClick={() => setShowQuickAdd(true)}>
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" 
                       width="24" height="24" viewBox="0 0 24 24" 
                       fill="none" stroke="currentColor" strokeWidth="2" 
                       strokeLinecap="round" strokeLinejoin="round" 
                       className="w-4 h-4 mr-2">
                    <path d="M5 12h14"/>
                    <path d="M12 5v14"/>
                  </svg>
                  <span className="truncate">Hızlı Ekle</span>
                </div>
              </Button>
              <Button variant="outline" onClick={() => setShowCreateModal(true)}>
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" 
                       width="24" height="24" viewBox="0 0 24 24" 
                       fill="none" stroke="currentColor" strokeWidth="2" 
                       strokeLinecap="round" strokeLinejoin="round" 
                       className="w-4 h-4 mr-2">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/>
                    <path d="M2 12h20"/>
                  </svg>
                  <span className="truncate">Özel Sunucu</span>
                </div>
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {servers.map((server) => (
            <ServerCard key={server.id} server={server} />
          ))}
        </div>
      )}

      {/* Quick Add Modal */}
      <Modal
        isOpen={showQuickAdd}
        onClose={() => setShowQuickAdd(false)}
        title="Popüler DNS Sunucuları"
      >
        <div className="space-y-4">
          <p className="text-white/70 text-sm">Yaygın kullanılan DNS sunucularını hızlıca ekleyin</p>
          
          {Object.entries(predefinedServers).map(([key, server]) => (
            <button
              key={key}
              onClick={() => handleQuickAdd(key as keyof typeof predefinedServers)}
              className="w-full p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:border-white/20 transition-all text-left"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-white font-medium">{server.name}</h4>
                  <p className="text-white/60 text-sm">{server.ip}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-xs">
                    DoH/DoT
                  </span>
                  <svg xmlns="http://www.w3.org/2000/svg" 
                       width="24" height="24" viewBox="0 0 24 24" 
                       fill="none" stroke="currentColor" strokeWidth="2" 
                       strokeLinecap="round" strokeLinejoin="round" 
                       className="w-4 h-4 text-white/40">
                    <path d="M5 12h14"/>
                    <path d="M12 5v14"/>
                  </svg>
                </div>
              </div>
            </button>
          ))}
        </div>
      </Modal>

      {/* Create/Edit Server Modal */}
      <Modal
        isOpen={showCreateModal || !!editingServer}
        onClose={() => {
          setShowCreateModal(false);
          setEditingServer(null);
          resetForm();
        }}
        title={editingServer ? 'DNS Sunucusu Düzenle' : 'Yeni DNS Sunucusu'}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-white text-sm font-medium mb-2">Sunucu Adı</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                placeholder="Özel DNS Sunucusu"
              />
            </div>
            <div>
              <label className="block text-white text-sm font-medium mb-2">IP Adresi</label>
              <input
                type="text"
                value={formData.ip_address}
                onChange={(e) => setFormData({ ...formData, ip_address: e.target.value })}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                placeholder="1.1.1.1"
              />
            </div>
          </div>

          <div>
            <label className="block text-white text-sm font-medium mb-2">Açıklama</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              rows={2}
              placeholder="DNS sunucusu açıklaması"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-white text-sm font-medium mb-2">Port</label>
              <input
                type="number"
                value={formData.port}
                onChange={(e) => setFormData({ ...formData, port: parseInt(e.target.value) })}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                min="1"
                max="65535"
              />
            </div>
            <div>
              <label className="block text-white text-sm font-medium mb-2">Tür</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none"
              >
                <option value="standard" className="bg-gray-800">Standart DNS</option>
                <option value="doh" className="bg-gray-800">DNS over HTTPS</option>
                <option value="dot" className="bg-gray-800">DNS over TLS</option>
                <option value="dnssec" className="bg-gray-800">DNSSEC</option>
              </select>
            </div>
          </div>

          {formData.type === 'doh' && (
            <div>
              <label className="block text-white text-sm font-medium mb-2">DoH URL</label>
              <input
                type="url"
                value={formData.doh_url}
                onChange={(e) => setFormData({ ...formData, doh_url: e.target.value })}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                placeholder="https://dns.example.com/dns-query"
              />
            </div>
          )}

          {formData.type === 'dot' && (
            <div>
              <label className="block text-white text-sm font-medium mb-2">DoT Hostname</label>
              <input
                type="text"
                value={formData.dot_hostname}
                onChange={(e) => setFormData({ ...formData, dot_hostname: e.target.value })}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                placeholder="dns.example.com"
              />
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setFormData({ ...formData, is_primary: !formData.is_primary })}
                className={cn(
                  "relative w-10 h-5 rounded-full transition-all duration-300",
                  formData.is_primary 
                    ? "bg-blue-500 shadow-lg shadow-blue-500/30" 
                    : "bg-white/20"
                )}
              >
                <div
                  className={cn(
                    "absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all duration-300 shadow-lg",
                    formData.is_primary ? "left-5" : "left-0.5"
                  )}
                />
              </button>
              <span className="text-white text-sm">Primary DNS</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setFormData({ ...formData, is_fallback: !formData.is_fallback })}
                className={cn(
                  "relative w-10 h-5 rounded-full transition-all duration-300",
                  formData.is_fallback 
                    ? "bg-orange-500 shadow-lg shadow-orange-500/30" 
                    : "bg-white/20"
                )}
              >
                <div
                  className={cn(
                    "absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all duration-300 shadow-lg",
                    formData.is_fallback ? "left-5" : "left-0.5"
                  )}
                />
              </button>
              <span className="text-white text-sm">Fallback DNS</span>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-4">
            <Button
              onClick={handleCreateServer}
              disabled={createServerMutation.isPending}
              isLoading={createServerMutation.isPending}
              className="flex-1"
            >
              {editingServer ? 'Güncelle' : 'Oluştur'}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setShowCreateModal(false);
                setEditingServer(null);
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