import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as Icons from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { cn, formatBytes } from '../../lib/utils';
import { useWireGuardServers, useCreateServer, useUpdateServer, useDeleteServer, useToggleServer, useServerStats } from '../../hooks/api/useWireGuard';
import { WireGuardServer } from '../../services/wireguardService';

interface ServerFormData {
  name: string;
  description: string;
  interface_name: string;
  listen_port: number;
  network_cidr: string;
  endpoint: string;
  dns_servers: string;
  max_clients: number;
}

export const ServerManagement: React.FC = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingServer, setEditingServer] = useState<WireGuardServer | null>(null);
  const [selectedServer, setSelectedServer] = useState<string | null>(null);

  const { data: servers = [], isLoading } = useWireGuardServers();
  const createServerMutation = useCreateServer();
  const updateServerMutation = useUpdateServer();
  const deleteServerMutation = useDeleteServer();
  const toggleServerMutation = useToggleServer();

  const [formData, setFormData] = useState<ServerFormData>({
    name: '',
    description: '',
    interface_name: 'wg0',
    listen_port: 51820,
    network_cidr: '10.0.0.0/24',
    endpoint: '',
    dns_servers: '1.1.1.1, 8.8.8.8',
    max_clients: 100
  });

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      interface_name: 'wg0',
      listen_port: 51820,
      network_cidr: '10.0.0.0/24',
      endpoint: '',
      dns_servers: '1.1.1.1, 8.8.8.8',
      max_clients: 100
    });
  };

  const handleCreateServer = async () => {
    try {
      await createServerMutation.mutateAsync({
        ...formData,
        dns_servers: formData.dns_servers.split(',').map(dns => dns.trim())
      });
      setShowCreateModal(false);
      resetForm();
    } catch (error) {
      console.error('Create server error:', error);
    }
  };

  const handleUpdateServer = async () => {
    if (!editingServer) return;
    
    try {
      await updateServerMutation.mutateAsync({
        id: editingServer.id,
        updates: {
          ...formData,
          dns_servers: formData.dns_servers.split(',').map(dns => dns.trim())
        }
      });
      setEditingServer(null);
      resetForm();
    } catch (error) {
      console.error('Update server error:', error);
    }
  };

  const handleEditServer = (server: WireGuardServer) => {
    setEditingServer(server);
    setFormData({
      name: server.name,
      description: server.description || '',
      interface_name: server.interface_name,
      listen_port: server.listen_port,
      network_cidr: server.network_cidr,
      endpoint: server.endpoint || '',
      dns_servers: (server.dns_servers as string[]).join(', '),
      max_clients: server.max_clients
    });
  };

  const handleDeleteServer = async (id: string) => {
    if (confirm('Bu sunucuyu silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.')) {
      try {
        await deleteServerMutation.mutateAsync(id);
      } catch (error) {
        console.error('Delete server error:', error);
      }
    }
  };

  const handleToggleServer = async (id: string) => {
    try {
      await toggleServerMutation.mutateAsync(id);
    } catch (error) {
      console.error('Toggle server error:', error);
    }
  };

  const ServerCard: React.FC<{ server: WireGuardServer }> = ({ server }) => {
    const { data: stats } = useServerStats(server.id);
    
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
                <Icons.Server className={cn(
                  "w-5 h-5",
                  server.is_active ? "text-emerald-400" : "text-gray-400"
                )} />
              </div>
              <div>
                <h4 className="text-white font-semibold">{server.name}</h4>
                <p className="text-white/60 text-sm">{server.interface_name} • Port {server.listen_port}</p>
              </div>
            </div>
            <div className={cn(
              "w-3 h-3 rounded-full",
              server.is_active ? "bg-emerald-400 shadow-lg shadow-emerald-400/50" : "bg-gray-400"
            )} />
          </div>

          {/* Server Stats */}
          {stats && (
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/5 rounded-lg p-3">
                <p className="text-white/60 text-xs">İstemciler</p>
                <p className="text-white font-semibold">{stats.active_clients} / {stats.total_clients}</p>
              </div>
              <div className="bg-white/5 rounded-lg p-3">
                <p className="text-white/60 text-xs">Toplam Trafik</p>
                <p className="text-white font-semibold">{formatBytes(stats.total_rx_bytes + stats.total_tx_bytes)}</p>
              </div>
            </div>
          )}

          {/* Server Info */}
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-white/60">Ağ:</span>
              <span className="text-white font-mono">{server.network_cidr}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/60">Endpoint:</span>
              <span className="text-white font-mono text-xs">{server.endpoint || 'Belirtilmemiş'}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 pt-3 border-t border-white/10">
            <Button
              size="sm"
              variant={server.is_active ? "destructive" : "default"}
              onClick={() => handleToggleServer(server.id)}
              className="flex-1"
            >
              {server.is_active ? (
                <>
                  <Icons.Square className="w-3 h-3 mr-1" />
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
              onClick={() => handleEditServer(server)}
            >
              <Icons.Edit className="w-3 h-3" />
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => handleDeleteServer(server.id)}
            >
              <Icons.Trash2 className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </Card>
    );
  };

  if (isLoading) {
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
          <h2 className="text-xl font-bold text-white">WireGuard Sunucuları</h2>
          <p className="text-white/70 text-sm">VPN sunucu yapılandırması ve yönetimi</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Icons.Plus className="w-4 h-4 mr-2" />
          Yeni Sunucu
        </Button>
      </div>

      {/* Servers Grid */}
      {servers.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <Icons.Server className="w-16 h-16 text-white/30 mx-auto mb-4" />
            <h3 className="text-white font-semibold mb-2">Henüz sunucu bulunmuyor</h3>
            <p className="text-white/60 mb-4">İlk WireGuard sunucunuzu oluşturun</p>
            <Button onClick={() => setShowCreateModal(true)}>
              <Icons.Plus className="w-4 h-4 mr-2" />
              Sunucu Ekle
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {servers.map((server) => (
            <ServerCard key={server.id} server={server} />
          ))}
        </div>
      )}

      {/* Create/Edit Server Modal */}
      <Modal
        isOpen={showCreateModal || !!editingServer}
        onClose={() => {
          setShowCreateModal(false);
          setEditingServer(null);
          resetForm();
        }}
        title={editingServer ? 'Sunucu Düzenle' : 'Yeni Sunucu Oluştur'}
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
                placeholder="VPN Sunucusu"
              />
            </div>
            <div>
              <label className="block text-white text-sm font-medium mb-2">Arayüz Adı</label>
              <input
                type="text"
                value={formData.interface_name}
                onChange={(e) => setFormData({ ...formData, interface_name: e.target.value })}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                placeholder="wg0"
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
              placeholder="Sunucu açıklaması (isteğe bağlı)"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-white text-sm font-medium mb-2">Dinleme Portu</label>
              <input
                type="number"
                value={formData.listen_port}
                onChange={(e) => setFormData({ ...formData, listen_port: parseInt(e.target.value) })}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                min="1024"
                max="65535"
              />
            </div>
            <div>
              <label className="block text-white text-sm font-medium mb-2">Ağ CIDR</label>
              <input
                type="text"
                value={formData.network_cidr}
                onChange={(e) => setFormData({ ...formData, network_cidr: e.target.value })}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                placeholder="10.0.0.0/24"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-white text-sm font-medium mb-2">Sunucu Endpoint</label>
              <input
                type="text"
                value={formData.endpoint}
                onChange={(e) => setFormData({ ...formData, endpoint: e.target.value })}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                placeholder="vpn.example.com:51820"
              />
            </div>
            <div>
              <label className="block text-white text-sm font-medium mb-2">Maksimum İstemci</label>
              <input
                type="number"
                value={formData.max_clients}
                onChange={(e) => setFormData({ ...formData, max_clients: parseInt(e.target.value) })}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                min="1"
                max="1000"
              />
            </div>
          </div>

          <div>
            <label className="block text-white text-sm font-medium mb-2">DNS Sunucuları</label>
            <input
              type="text"
              value={formData.dns_servers}
              onChange={(e) => setFormData({ ...formData, dns_servers: e.target.value })}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              placeholder="1.1.1.1, 8.8.8.8"
            />
          </div>

          <div className="flex items-center gap-3 pt-4">
            <Button
              onClick={editingServer ? handleUpdateServer : handleCreateServer}
              disabled={createServerMutation.isPending || updateServerMutation.isPending}
              isLoading={createServerMutation.isPending || updateServerMutation.isPending}
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