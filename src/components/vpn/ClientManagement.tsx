import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as Icons from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { cn, formatBytes } from '../../lib/utils';
import { 
  useWireGuardClients, 
  useWireGuardServers,
  useCreateClient, 
  useUpdateClient, 
  useDeleteClient, 
  useToggleClient,
  useGenerateClientConfig,
  useBulkEnableClients,
  useBulkDisableClients
} from '../../hooks/api/useWireGuard';
import { WireGuardClient, WireGuardServer } from '../../services/wireguardService';

interface ClientFormData {
  name: string;
  description: string;
  server_id: string;
  allowed_ips: string;
  persistent_keepalive: number;
  client_group_id?: string;
}

export const ClientManagement: React.FC = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingClient, setEditingClient] = useState<WireGuardClient | null>(null);
  const [selectedClients, setSelectedClients] = useState<string[]>([]);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [generatedConfig, setGeneratedConfig] = useState<{ config: string; qr_code: string } | null>(null);

  const { data: clients = [], isLoading } = useWireGuardClients();
  const { data: servers = [] } = useWireGuardServers();
  const createClientMutation = useCreateClient();
  const updateClientMutation = useUpdateClient();
  const deleteClientMutation = useDeleteClient();
  const toggleClientMutation = useToggleClient();
  const generateConfigMutation = useGenerateClientConfig();
  const bulkEnableMutation = useBulkEnableClients();
  const bulkDisableMutation = useBulkDisableClients();

  const [formData, setFormData] = useState<ClientFormData>({
    name: '',
    description: '',
    server_id: '',
    allowed_ips: '0.0.0.0/0',
    persistent_keepalive: 25
  });

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      server_id: '',
      allowed_ips: '0.0.0.0/0',
      persistent_keepalive: 25
    });
  };

  const handleCreateClient = async () => {
    try {
      await createClientMutation.mutateAsync(formData);
      setShowCreateModal(false);
      resetForm();
    } catch (error) {
      console.error('Create client error:', error);
    }
  };

  const handleUpdateClient = async () => {
    if (!editingClient) return;
    
    try {
      await updateClientMutation.mutateAsync({
        id: editingClient.id,
        updates: formData
      });
      setEditingClient(null);
      resetForm();
    } catch (error) {
      console.error('Update client error:', error);
    }
  };

  const handleEditClient = (client: WireGuardClient) => {
    setEditingClient(client);
    setFormData({
      name: client.name,
      description: client.description || '',
      server_id: client.server_id,
      allowed_ips: client.allowed_ips,
      persistent_keepalive: client.persistent_keepalive,
      client_group_id: client.client_group_id
    });
  };

  const handleDeleteClient = async (id: string) => {
    if (confirm('Bu istemciyi silmek istediğinizden emin misiniz?')) {
      try {
        await deleteClientMutation.mutateAsync(id);
      } catch (error) {
        console.error('Delete client error:', error);
      }
    }
  };

  const handleToggleClient = async (id: string) => {
    try {
      await toggleClientMutation.mutateAsync(id);
    } catch (error) {
      console.error('Toggle client error:', error);
    }
  };

  const handleGenerateConfig = async (clientId: string) => {
    try {
      const config = await generateConfigMutation.mutateAsync(clientId);
      setGeneratedConfig(config);
      setShowConfigModal(true);
    } catch (error) {
      console.error('Generate config error:', error);
    }
  };

  const handleDownloadConfig = () => {
    if (!generatedConfig) return;
    
    const blob = new Blob([generatedConfig.config], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'wireguard-client.conf';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleSelectClient = (clientId: string, selected: boolean) => {
    if (selected) {
      setSelectedClients([...selectedClients, clientId]);
    } else {
      setSelectedClients(selectedClients.filter(id => id !== clientId));
    }
  };

  const handleSelectAll = () => {
    if (selectedClients.length === clients.length) {
      setSelectedClients([]);
    } else {
      setSelectedClients(clients.map(c => c.id));
    }
  };

  const handleBulkEnable = async () => {
    try {
      await bulkEnableMutation.mutateAsync(selectedClients);
      setSelectedClients([]);
    } catch (error) {
      console.error('Bulk enable error:', error);
    }
  };

  const handleBulkDisable = async () => {
    try {
      await bulkDisableMutation.mutateAsync(selectedClients);
      setSelectedClients([]);
    } catch (error) {
      console.error('Bulk disable error:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'bg-emerald-400';
      case 'connecting': return 'bg-yellow-400';
      case 'error': return 'bg-red-400';
      default: return 'bg-gray-400';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'connected': return 'Bağlı';
      case 'connecting': return 'Bağlanıyor';
      case 'error': return 'Hata';
      default: return 'Bağlı Değil';
    }
  };

  const ClientCard: React.FC<{ client: WireGuardClient }> = ({ client }) => {
    const server = servers.find(s => s.id === client.server_id);
    const isSelected = selectedClients.includes(client.id);
    
    return (
      <Card className="h-full">
        <div className="space-y-4">
          {/* Client Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={isSelected}
                onChange={(e) => handleSelectClient(client.id, e.target.checked)}
                className="w-4 h-4 rounded border-white/20 bg-white/10"
              />
              <div className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center",
                client.is_enabled 
                  ? "bg-blue-500/20 border border-blue-500/30" 
                  : "bg-gray-500/20 border border-gray-500/30"
              )}>
                <Icons.Smartphone className={cn(
                  "w-4 h-4",
                  client.is_enabled ? "text-blue-400" : "text-gray-400"
                )} />
              </div>
              <div>
                <h4 className="text-white font-medium text-sm">{client.name}</h4>
                <p className="text-white/60 text-xs">{server?.name || 'Bilinmeyen Sunucu'}</p>
              </div>
            </div>
            <div className={cn("w-2 h-2 rounded-full", getStatusColor(client.connection_status))} />
          </div>

          {/* Client Info */}
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-white/60">IP:</span>
              <span className="text-white font-mono">{client.assigned_ip}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/60">Durum:</span>
              <span className="text-white">{getStatusText(client.connection_status)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/60">Son Bağlantı:</span>
              <span className="text-white">{client.last_handshake ? new Date(client.last_handshake).toLocaleString('tr-TR') : 'Hiç'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/60">Trafik:</span>
              <span className="text-white">{formatBytes(client.rx_bytes + client.tx_bytes)}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 pt-3 border-t border-white/10">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleGenerateConfig(client.id)}
              className="flex-1"
            >
              <Icons.Download className="w-3 h-3 mr-1" />
              Config
            </Button>
            <Button
              size="sm"
              variant={client.is_enabled ? "destructive" : "default"}
              onClick={() => handleToggleClient(client.id)}
            >
              {client.is_enabled ? (
                <Icons.Pause className="w-3 h-3" />
              ) : (
                <Icons.Play className="w-3 h-3" />
              )}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleEditClient(client)}
            >
              <Icons.Edit className="w-3 h-3" />
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => handleDeleteClient(client.id)}
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
          <h2 className="text-xl font-bold text-white">WireGuard İstemcileri</h2>
          <p className="text-white/70 text-sm">VPN istemci yapılandırması ve yönetimi</p>
        </div>
        <div className="flex items-center gap-2">
          {selectedClients.length > 0 && (
            <>
              <Button size="sm" variant="outline" onClick={handleBulkEnable}>
                <Icons.Play className="w-4 h-4 mr-1" />
                Etkinleştir ({selectedClients.length})
              </Button>
              <Button size="sm" variant="destructive" onClick={handleBulkDisable}>
                <Icons.Pause className="w-4 h-4 mr-1" />
                Devre Dışı ({selectedClients.length})
              </Button>
            </>
          )}
          <Button onClick={() => setShowCreateModal(true)}>
            <Icons.Plus className="w-4 h-4 mr-2" />
            Yeni İstemci
          </Button>
        </div>
      </div>

      {/* Bulk Actions */}
      {clients.length > 0 && (
        <div className="flex items-center gap-4 p-4 bg-white/5 rounded-xl border border-white/10">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={selectedClients.length === clients.length}
              onChange={handleSelectAll}
              className="w-4 h-4 rounded border-white/20 bg-white/10"
            />
            <span className="text-white text-sm">
              {selectedClients.length > 0 ? `${selectedClients.length} seçili` : 'Tümünü seç'}
            </span>
          </div>
        </div>
      )}

      {/* Clients Grid */}
      {clients.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <Icons.Users className="w-16 h-16 text-white/30 mx-auto mb-4" />
            <h3 className="text-white font-semibold mb-2">Henüz istemci bulunmuyor</h3>
            <p className="text-white/60 mb-4">İlk VPN istemcinizi oluşturun</p>
            <Button onClick={() => setShowCreateModal(true)}>
              <Icons.Plus className="w-4 h-4 mr-2" />
              İstemci Ekle
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clients.map((client) => (
            <ClientCard key={client.id} client={client} />
          ))}
        </div>
      )}

      {/* Create/Edit Client Modal */}
      <Modal
        isOpen={showCreateModal || !!editingClient}
        onClose={() => {
          setShowCreateModal(false);
          setEditingClient(null);
          resetForm();
        }}
        title={editingClient ? 'İstemci Düzenle' : 'Yeni İstemci Oluştur'}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-white text-sm font-medium mb-2">İstemci Adı</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                placeholder="Mobil Telefon"
              />
            </div>
            <div>
              <label className="block text-white text-sm font-medium mb-2">Sunucu</label>
              <select
                value={formData.server_id}
                onChange={(e) => setFormData({ ...formData, server_id: e.target.value })}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              >
                <option value="">Sunucu seçin</option>
                {servers.map((server) => (
                  <option key={server.id} value={server.id} className="bg-gray-800">
                    {server.name} ({server.interface_name})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-white text-sm font-medium mb-2">Açıklama</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              rows={2}
              placeholder="İstemci açıklaması (isteğe bağlı)"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-white text-sm font-medium mb-2">İzin Verilen IP'ler</label>
              <input
                type="text"
                value={formData.allowed_ips}
                onChange={(e) => setFormData({ ...formData, allowed_ips: e.target.value })}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                placeholder="0.0.0.0/0"
              />
            </div>
            <div>
              <label className="block text-white text-sm font-medium mb-2">Keepalive (saniye)</label>
              <input
                type="number"
                value={formData.persistent_keepalive}
                onChange={(e) => setFormData({ ...formData, persistent_keepalive: parseInt(e.target.value) })}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                min="0"
                max="3600"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-4">
            <Button
              onClick={editingClient ? handleUpdateClient : handleCreateClient}
              disabled={createClientMutation.isPending || updateClientMutation.isPending}
              isLoading={createClientMutation.isPending || updateClientMutation.isPending}
              className="flex-1"
            >
              {editingClient ? 'Güncelle' : 'Oluştur'}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setShowCreateModal(false);
                setEditingClient(null);
                resetForm();
              }}
              className="flex-1"
            >
              İptal
            </Button>
          </div>
        </div>
      </Modal>

      {/* Configuration Modal */}
      <Modal
        isOpen={showConfigModal}
        onClose={() => {
          setShowConfigModal(false);
          setGeneratedConfig(null);
        }}
        title="İstemci Yapılandırması"
      >
        {generatedConfig && (
          <div className="space-y-6">
            {/* QR Code */}
            <div className="text-center">
              <div className="inline-block p-4 bg-white rounded-lg">
                <img src={generatedConfig.qr_code} alt="QR Code" className="w-48 h-48" />
              </div>
              <p className="text-white/70 text-sm mt-2">Mobil cihazlarda QR kod ile tarayın</p>
            </div>

            {/* Configuration Text */}
            <div>
              <label className="block text-white text-sm font-medium mb-2">Yapılandırma Dosyası</label>
              <textarea
                value={generatedConfig.config}
                readOnly
                className="w-full h-48 px-3 py-2 bg-black/40 border border-white/20 rounded-lg text-white font-mono text-sm resize-none"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <Button onClick={handleDownloadConfig} className="flex-1">
                <Icons.Download className="w-4 h-4 mr-2" />
                Dosya İndir
              </Button>
              <Button
                variant="outline"
                onClick={() => navigator.clipboard.writeText(generatedConfig.config)}
                className="flex-1"
              >
                <Icons.Copy className="w-4 h-4 mr-2" />
                Kopyala
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};