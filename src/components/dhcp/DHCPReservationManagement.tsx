import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { cn } from '../../lib/utils';
import { 
  useDHCPReservations, 
  useCreateDHCPReservation, 
  useUpdateDHCPReservation, 
  useDeleteDHCPReservation,
  useDHCPPools,
  useDHCPDeviceGroups 
} from '../../hooks/api/useDHCP';
import { DHCPReservation } from '../../types/dhcp';

interface ReservationFormData {
  mac_address: string;
  ip_address: string;
  hostname: string;
  device_group_id: string;
  dhcp_pool_id: string;
  description: string;
  lease_time_override: string;
  custom_dns_servers: string;
}

export const DHCPReservationManagement: React.FC = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingReservation, setEditingReservation] = useState<DHCPReservation | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<string>('');
  
  const { data: reservations = [], isLoading } = useDHCPReservations({ group_id: selectedGroup });
  const { data: pools = [] } = useDHCPPools();
  const { data: deviceGroups = [] } = useDHCPDeviceGroups();
  const createReservationMutation = useCreateDHCPReservation();
  const updateReservationMutation = useUpdateDHCPReservation();
  const deleteReservationMutation = useDeleteDHCPReservation();

  const [formData, setFormData] = useState<ReservationFormData>({
    mac_address: '',
    ip_address: '',
    hostname: '',
    device_group_id: '',
    dhcp_pool_id: '',
    description: '',
    lease_time_override: '',
    custom_dns_servers: ''
  });

  const resetForm = () => {
    setFormData({
      mac_address: '',
      ip_address: '',
      hostname: '',
      device_group_id: '',
      dhcp_pool_id: '',
      description: '',
      lease_time_override: '',
      custom_dns_servers: ''
    });
  };

  const handleCreateReservation = async () => {
    try {
      const reservationData = {
        ...formData,
        custom_dns_servers: formData.custom_dns_servers 
          ? formData.custom_dns_servers.split(',').map(dns => dns.trim())
          : undefined,
        lease_time_override: formData.lease_time_override || undefined
      };

      await createReservationMutation.mutateAsync(reservationData);
      setShowCreateModal(false);
      resetForm();
    } catch (error) {
      console.error('Create DHCP reservation error:', error);
    }
  };

  const getGroupTypeColor = (groupType?: string) => {
    switch (groupType) {
      case 'admin': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'iot': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'guest': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'gaming': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'voip': return 'bg-pink-500/20 text-pink-400 border-pink-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const ReservationCard: React.FC<{ reservation: DHCPReservation & { device_group?: any; dhcp_pool?: any } }> = ({ reservation }) => {
    return (
      <Card className="h-full">
        <div className="space-y-4">
          {/* Reservation Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center",
                reservation.is_active 
                  ? "bg-emerald-500/20 border border-emerald-500/30" 
                  : "bg-gray-500/20 border border-gray-500/30"
              )}>
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" 
                       width="24" height="24" viewBox="0 0 24 24" 
                       fill="none" stroke="currentColor" strokeWidth="2" 
                       strokeLinecap="round" strokeLinejoin="round" 
                       className={cn("w-5 h-5", reservation.is_active ? "text-emerald-400" : "text-gray-400")}>
                    <path d="M9 12l2 2 4-4"/>
                    <path d="M21 12c.552 0 1-.448 1-1V8a2 2 0 0 0-2-2h-1l-1-2h-3l-1 2H9L8 4H5a2 2 0 0 0-2 2v3c0 .552.448 1 1 1"/>
                    <path d="M3 12h6v9H3z"/>
                    <path d="M13 12h8v9h-8z"/>
                  </svg>
                </div>
              </div>
              <div>
                <h4 className="text-white font-semibold">{reservation.hostname || 'Unnamed Device'}</h4>
                <p className="text-white/60 text-sm">
                  VLAN {reservation.dhcp_pool?.vlan_id || 'N/A'} • {reservation.dhcp_pool?.name || 'No Pool'}
                </p>
              </div>
            </div>
            {reservation.device_group && (
              <span className={cn("px-2 py-1 rounded-full text-xs border", getGroupTypeColor(reservation.device_group.group_type))}>
                {reservation.device_group.name}
              </span>
            )}
          </div>

          {/* Reservation Info */}
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-white/60">MAC Address:</span>
              <span className="text-white font-mono">{reservation.mac_address}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/60">IP Address:</span>
              <span className="text-white font-mono">{reservation.ip_address}</span>
            </div>
            {reservation.custom_dns_servers && reservation.custom_dns_servers.length > 0 && (
              <div className="flex justify-between">
                <span className="text-white/60">Custom DNS:</span>
                <span className="text-white font-mono text-xs">{reservation.custom_dns_servers.join(', ')}</span>
              </div>
            )}
            {reservation.lease_time_override && (
              <div className="flex justify-between">
                <span className="text-white/60">Custom Lease:</span>
                <span className="text-white">{reservation.lease_time_override}</span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 pt-3 border-t border-white/10">
            <Button
              size="sm"
              variant={reservation.is_active ? "destructive" : "default"}
              onClick={() => updateReservationMutation.mutate({ 
                id: reservation.id, 
                updates: { is_active: !reservation.is_active } 
              })}
              className="flex-1"
            >
              <div className="flex items-center">
                {reservation.is_active ? (
                  <svg xmlns="http://www.w3.org/2000/svg" 
                       width="24" height="24" viewBox="0 0 24 24" 
                       fill="none" stroke="currentColor" strokeWidth="2" 
                       strokeLinecap="round" strokeLinejoin="round" 
                       className="w-3 h-3 mr-1">
                    <rect x="6" y="4" width="4" height="16"/>
                    <rect x="14" y="4" width="4" height="16"/>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" 
                       width="24" height="24" viewBox="0 0 24 24" 
                       fill="none" stroke="currentColor" strokeWidth="2" 
                       strokeLinecap="round" strokeLinejoin="round" 
                       className="w-3 h-3 mr-1">
                    <polygon points="6,3 20,12 6,21"/>
                  </svg>
                )}
                <span className="truncate">{reservation.is_active ? 'Devre Dışı' : 'Etkinleştir'}</span>
              </div>
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setEditingReservation(reservation);
                setFormData({
                  mac_address: reservation.mac_address,
                  ip_address: reservation.ip_address,
                  hostname: reservation.hostname || '',
                  device_group_id: reservation.device_group_id || '',
                  dhcp_pool_id: reservation.dhcp_pool_id || '',
                  description: reservation.description || '',
                  lease_time_override: reservation.lease_time_override || '',
                  custom_dns_servers: reservation.custom_dns_servers?.join(', ') || ''
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
                if (confirm('Bu statik IP atamasını silmek istediğinizden emin misiniz?')) {
                  deleteReservationMutation.mutate(reservation.id);
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
          <h3 className="text-xl font-bold text-white">Statik IP Atamaları (MAC Binding)</h3>
          <p className="text-white/70 text-sm">Cihazlara sabit IP adresleri atayın</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={selectedGroup}
            onChange={(e) => setSelectedGroup(e.target.value)}
            className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none"
          >
            <option value="">Tüm Gruplar</option>
            {deviceGroups.map((group) => (
              <option key={group.id} value={group.id} className="bg-gray-800">
                {group.name}
              </option>
            ))}
          </select>
          <Button onClick={() => setShowCreateModal(true)}>
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" 
                   width="24" height="24" viewBox="0 0 24 24" 
                   fill="none" stroke="currentColor" strokeWidth="2" 
                   strokeLinecap="round" strokeLinejoin="round" 
                   className="w-4 h-4 mr-2">
                <path d="M5 12h14"/>
                <path d="M12 5v14"/>
              </svg>
              <span className="truncate">Yeni Rezervasyon</span>
            </div>
          </Button>
        </div>
      </div>

      {/* Group Summary */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {deviceGroups.map((group) => {
          const groupReservations = reservations.filter(r => r.device_group_id === group.id);
          const activeReservations = groupReservations.filter(r => r.is_active);
          
          return (
            <div key={group.id} className="p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="flex items-center gap-2 mb-2">
                <div className={cn("w-3 h-3 rounded-full", getGroupTypeColor(group.group_type).split(' ')[0])} />
                <span className="text-white font-medium text-sm">{group.name}</span>
              </div>
              <p className="text-white text-xl font-bold">{activeReservations.length}</p>
              <p className="text-white/60 text-xs">aktif rezervasyon</p>
            </div>
          );
        })}
      </div>

      {/* Reservations Grid */}
      {reservations.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-blue-500/20 rounded-xl flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" 
                   width="24" height="24" viewBox="0 0 24 24" 
                   fill="none" stroke="currentColor" strokeWidth="2" 
                   strokeLinecap="round" strokeLinejoin="round" 
                   className="w-8 h-8 text-blue-400">
                <path d="M9 12l2 2 4-4"/>
                <path d="M21 12c.552 0 1-.448 1-1V8a2 2 0 0 0-2-2h-1l-1-2h-3l-1 2H9L8 4H5a2 2 0 0 0-2 2v3c0 .552.448 1 1 1"/>
                <path d="M3 12h6v9H3z"/>
                <path d="M13 12h8v9h-8z"/>
              </svg>
            </div>
            <h3 className="text-white font-semibold mb-2">Henüz statik IP ataması bulunmuyor</h3>
            <p className="text-white/60 mb-4">İlk IP rezervasyonunuzu oluşturun</p>
            <Button onClick={() => setShowCreateModal(true)}>
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" 
                     width="24" height="24" viewBox="0 0 24 24" 
                     fill="none" stroke="currentColor" strokeWidth="2" 
                     strokeLinecap="round" strokeLinejoin="round" 
                     className="w-4 h-4 mr-2">
                  <path d="M5 12h14"/>
                  <path d="M12 5v14"/>
                </svg>
                <span className="truncate">IP Rezervasyonu Ekle</span>
              </div>
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reservations.map((reservation) => (
            <ReservationCard key={reservation.id} reservation={reservation} />
          ))}
        </div>
      )}

      {/* Create/Edit Reservation Modal */}
      <Modal
        isOpen={showCreateModal || !!editingReservation}
        onClose={() => {
          setShowCreateModal(false);
          setEditingReservation(null);
          resetForm();
        }}
        title={editingReservation ? 'Rezervasyon Düzenle' : 'Yeni IP Rezervasyonu'}
        size="lg"
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-white text-sm font-medium mb-2">MAC Address</label>
              <input
                type="text"
                value={formData.mac_address}
                onChange={(e) => setFormData({ ...formData, mac_address: e.target.value })}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                placeholder="00:1A:2B:3C:4D:5E"
              />
            </div>
            <div>
              <label className="block text-white text-sm font-medium mb-2">IP Address</label>
              <input
                type="text"
                value={formData.ip_address}
                onChange={(e) => setFormData({ ...formData, ip_address: e.target.value })}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                placeholder="192.168.10.50"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-white text-sm font-medium mb-2">Hostname</label>
              <input
                type="text"
                value={formData.hostname}
                onChange={(e) => setFormData({ ...formData, hostname: e.target.value })}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                placeholder="admin-pc.local"
              />
            </div>
            <div>
              <label className="block text-white text-sm font-medium mb-2">Cihaz Grubu</label>
              <select
                value={formData.device_group_id}
                onChange={(e) => setFormData({ ...formData, device_group_id: e.target.value })}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none"
              >
                <option value="">Grup seçin</option>
                {deviceGroups.map((group) => (
                  <option key={group.id} value={group.id} className="bg-gray-800">
                    {group.name} ({group.group_type})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-white text-sm font-medium mb-2">DHCP Pool</label>
            <select
              value={formData.dhcp_pool_id}
              onChange={(e) => setFormData({ ...formData, dhcp_pool_id: e.target.value })}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none"
            >
              <option value="">Pool seçin</option>
              {pools.map((pool) => (
                <option key={pool.id} value={pool.id} className="bg-gray-800">
                  {pool.name} (VLAN {pool.vlan_id}) - {pool.network_cidr}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-white text-sm font-medium mb-2">Açıklama</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              rows={2}
              placeholder="Rezervasyon açıklaması"
            />
          </div>

          {/* Advanced Options */}
          <div className="space-y-4">
            <h4 className="text-white font-medium">Gelişmiş Ayarlar</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-white text-sm font-medium mb-2">Özel Lease Süresi</label>
                <select
                  value={formData.lease_time_override}
                  onChange={(e) => setFormData({ ...formData, lease_time_override: e.target.value })}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none"
                >
                  <option value="">Varsayılan kullan</option>
                  <option value="2 hours" className="bg-gray-800">2 saat</option>
                  <option value="12 hours" className="bg-gray-800">12 saat</option>
                  <option value="24 hours" className="bg-gray-800">24 saat</option>
                  <option value="7 days" className="bg-gray-800">7 gün</option>
                  <option value="30 days" className="bg-gray-800">30 gün</option>
                </select>
              </div>
              <div>
                <label className="block text-white text-sm font-medium mb-2">Özel DNS Sunucuları</label>
                <input
                  type="text"
                  value={formData.custom_dns_servers}
                  onChange={(e) => setFormData({ ...formData, custom_dns_servers: e.target.value })}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  placeholder="1.1.1.3, 1.0.0.3"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-4">
            <Button
              onClick={handleCreateReservation}
              disabled={createReservationMutation.isPending}
              isLoading={createReservationMutation.isPending}
              className="flex-1"
            >
              {editingReservation ? 'Güncelle' : 'Oluştur'}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setShowCreateModal(false);
                setEditingReservation(null);
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

function getGroupTypeColor(groupType?: string) {
  switch (groupType) {
    case 'admin': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    case 'iot': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
    case 'guest': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
    case 'gaming': return 'bg-green-500/20 text-green-400 border-green-500/30';
    case 'voip': return 'bg-pink-500/20 text-pink-400 border-pink-500/30';
    default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  }
}