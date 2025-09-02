import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as Icons from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { MetricCard } from '../cards/MetricCard';
import { cn } from '../../lib/utils';

interface TrafficRule {
  id: string;
  name: string;
  description: string;
  priority: number;
  enabled: boolean;
  client_groups: string[];
  traffic_matchers: string[];
  dns_policy_id?: string;
  egress_point_id: string;
  created_at: string;
  updated_at: string;
}

interface RuleFormData {
  name: string;
  description: string;
  priority: number;
  client_groups: string[];
  egress_point_id: string;
  dns_policy_id: string;
}

export const TrafficRuleManager: React.FC = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingRule, setEditingRule] = useState<TrafficRule | null>(null);
  
  // Mock data for now
  const [rules] = useState<TrafficRule[]>([
    {
      id: 'rule-1',
      name: 'Admin Traffic',
      description: 'Admin VLAN traffic routing',
      priority: 10,
      enabled: true,
      client_groups: ['admin'],
      traffic_matchers: ['https'],
      egress_point_id: 'local_internet',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ]);

  const [formData, setFormData] = useState<RuleFormData>({
    name: '',
    description: '',
    priority: 50,
    client_groups: [],
    egress_point_id: '',
    dns_policy_id: ''
  });

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      priority: 50,
      client_groups: [],
      egress_point_id: '',
      dns_policy_id: ''
    });
  };

  const handleCreateRule = async () => {
    try {
      // In real implementation, this would call API
      console.log('Creating traffic rule:', formData);
      setShowCreateModal(false);
      resetForm();
    } catch (error) {
      console.error('Create traffic rule error:', error);
    }
  };

  const RuleCard: React.FC<{ rule: TrafficRule }> = ({ rule }) => {
    return (
      <Card className="h-full">
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center",
                rule.enabled 
                  ? "bg-emerald-500/20 border border-emerald-500/30" 
                  : "bg-gray-500/20 border border-gray-500/30"
              )}>
                <Icons.Zap className={cn(
                  "w-5 h-5",
                  rule.enabled ? "text-emerald-400" : "text-gray-400"
                )} />
              </div>
              <div>
                <h4 className="text-white font-semibold">{rule.name}</h4>
                <p className="text-white/60 text-sm">Öncelik: {rule.priority}</p>
              </div>
            </div>
            <div className={cn(
              "w-3 h-3 rounded-full",
              rule.enabled ? "bg-emerald-400" : "bg-gray-400"
            )} />
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-white/60">İstemci Grupları:</span>
              <span className="text-white">{rule.client_groups.join(', ')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/60">Çıkış Noktası:</span>
              <span className="text-white">{rule.egress_point_id}</span>
            </div>
          </div>

          <p className="text-white/70 text-sm">{rule.description}</p>

          <div className="flex items-center gap-2 pt-3 border-t border-white/10">
            <Button size="sm" variant="outline" className="flex-1">
              <Icons.Edit className="w-3 h-3 mr-1" />
              Düzenle
            </Button>
            <Button size="sm" variant="destructive">
              <Icons.Trash2 className="w-3 h-3" />
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
          <h3 className="text-xl font-bold text-white">Trafik Kuralları</h3>
          <p className="text-white/70 text-sm">Ağ trafiği yönlendirme ve politika yönetimi</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Icons.Plus className="w-4 h-4 mr-2" />
          Yeni Kural
        </Button>
      </div>

      {/* Overview Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard
          title="Aktif Kurallar"
          value={String(rules.filter(r => r.enabled).length)}
          subtitle={`${rules.length} toplam kural`}
          icon="Zap"
          status="ok"
        />
        <MetricCard
          title="Toplam Eşleşme"
          value="1,247"
          subtitle="Son 24 saat"
          icon="Target"
          status="ok"
        />
        <MetricCard
          title="Çıkış Dağılımı"
          value="3 rotalar"
          subtitle="WAN, VPN, Local"
          icon="Route"
          status="ok"
        />
        <MetricCard
          title="DNS Politikaları"
          value="2 profil"
          subtitle="Aktif kullanımda"
          icon="Globe"
          status="ok"
        />
      </div>

      {/* Traffic Rules Grid */}
      {rules.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <Icons.Zap className="w-16 h-16 text-white/30 mx-auto mb-4" />
            <h3 className="text-white font-semibold mb-2">Henüz trafik kuralı bulunmuyor</h3>
            <p className="text-white/60 mb-4">İlk trafik yönlendirme kuralınızı oluşturun</p>
            <Button onClick={() => setShowCreateModal(true)}>
              <Icons.Plus className="w-4 h-4 mr-2" />
              Kural Oluştur
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rules.map((rule) => (
            <RuleCard key={rule.id} rule={rule} />
          ))}
        </div>
      )}

      {/* Create Rule Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          resetForm();
        }}
        title="Yeni Trafik Kuralı"
        size="lg"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-white text-sm font-medium mb-2">Kural Adı</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                placeholder="Admin Traffic"
              />
            </div>
            <div>
              <label className="block text-white text-sm font-medium mb-2">Öncelik</label>
              <input
                type="number"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none"
                min="1"
                max="100"
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
              placeholder="Kural açıklaması"
            />
          </div>

          <div className="flex items-center gap-3 pt-4">
            <Button
              onClick={handleCreateRule}
              className="flex-1"
            >
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