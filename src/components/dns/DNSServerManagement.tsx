import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import * as Icons from 'lucide-react';
import { cn } from '../../lib/utils';

interface DNSServer {
  id: string;
  name: string;
  ip_address: string;
  port: number;
  type: 'standard' | 'doh' | 'dot';
  is_active: boolean;
  response_time_ms: number;
}

interface DNSServerFormData {
  name: string;
  ip_address: string;
  port: number;
  type: 'standard' | 'doh' | 'dot';
}

export const DNSServerManagement: React.FC = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  // Mock data
  const [servers] = useState<DNSServer[]>([
    {
      id: 'dns-1',
      name: 'Cloudflare Primary',
      ip_address: '1.1.1.1',
      port: 53,
      type: 'standard',
      is_active: true,
      response_time_ms: 15
    },
    {
      id: 'dns-2',
      name: 'Google DNS',
      ip_address: '8.8.8.8',
      port: 53,
      type: 'standard',
      is_active: true,
      response_time_ms: 22
    }
  ]);

  const [formData, setFormData] = useState<DNSServerFormData>({
    name: '',
    ip_address: '',
    port: 53,
    type: 'standard'
  });

  const resetForm = () => {
    setFormData({
      name: '',
      ip_address: '',
      port: 53,
      type: 'standard'
    });
  };

  const handleCreateServer = async () => {
    try {
      console.log('Creating DNS server:', formData);
      setShowCreateModal(false);
      resetForm();
    } catch (error) {
      console.error('Create DNS server error:', error);
    }
  };

  const ServerCard: React.FC<{ server: DNSServer }> = ({ server }) => {
    return (
      <Card className="h-full">
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center",
                server.is_active 
                  ? "bg-emerald-500/20 border border-emerald-500/30" 
                  : "bg-gray-500/20 border border-gray-500/30"
              )}>
                <Icons.Globe className={cn(
                  "w-5 h-5",
                  server.is_active ? "text-emerald-400" : "text-gray-400"
                )} />
              </div>
              <div>
                <h4 className="text-white font-semibold">{server.name}</h4>
                <p className="text-white/60 text-sm">{server.ip_address}:{server.port}</p>
              </div>
            </div>
            <div className={cn(
              "w-3 h-3 rounded-full",
              server.is_active ? "bg-emerald-400" : "bg-gray-400"
            )} />
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-white/60">Tip:</span>
              <span className="text-white">{server.type.toUpperCase()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/60">Yanıt Süresi:</span>
              <span className="text-white">{server.response_time_ms}ms</span>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-3 border-t border-white/10">
            <Button size="sm" variant="outline" className="flex-1">
              <Icons.TestTube className="w-3 h-3 mr-1" />
              Test
            </Button>
            <Button size="sm" variant="outline">
              <Icons.Edit className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-white">DNS Sunucuları</h3>
          <p className="text-white/70 text-sm">DNS çözümleyici yapılandırması</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Icons.Plus className="w-4 h-4 mr-2" />
          DNS Sunucusu
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {servers.map((server) => (
          <ServerCard key={server.id} server={server} />
        ))}
      </div>

      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          resetForm();
        }}
        title="Yeni DNS Sunucusu"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-white text-sm font-medium mb-2">Sunucu Adı</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              placeholder="Cloudflare DNS"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
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
            <div>
              <label className="block text-white text-sm font-medium mb-2">Port</label>
              <input
                type="number"
                value={formData.port}
                onChange={(e) => setFormData({ ...formData, port: parseInt(e.target.value) })}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none"
                min="1"
                max="65535"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-4">
            <Button onClick={handleCreateServer} className="flex-1">
              Oluştur
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