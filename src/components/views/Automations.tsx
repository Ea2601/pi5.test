import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as Icons from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { MetricCard } from '../cards/MetricCard';
import { ControlCard } from '../cards/ControlCard';
import { cn } from '../../lib/utils';
import { SEOMeta } from '../SEO/SEOMeta';

interface RuleBlock {
  id: string;
  type: 'trigger' | 'action';
  category: string;
  label: string;
  icon: string;
  config?: any;
}

const Automations: React.FC = () => {
  const [activeTab, setActiveTab] = useState('rules');
  const [draggedBlock, setDraggedBlock] = useState<RuleBlock | null>(null);
  const [ruleBlocks, setRuleBlocks] = useState<RuleBlock[]>([]);

  const tabs = [
    { id: 'rules', label: 'Kural Motoru', icon: 'Zap' },
    { id: 'webhooks', label: 'Webhook Entegrasyonu', icon: 'Webhook' },
    { id: 'telegram', label: 'Telegram Bot', icon: 'MessageCircle' }
  ];

  const availableBlocks: RuleBlock[] = [
    // Tetikleyiciler
    { id: 'trigger-wan', type: 'trigger', category: 'Ağ', label: 'WAN Olayı', icon: 'Wifi' },
    { id: 'trigger-device', type: 'trigger', category: 'Cihaz', label: 'Cihaz Bağlantısı', icon: 'Smartphone' },
    { id: 'trigger-security', type: 'trigger', category: 'Güvenlik', label: 'Güvenlik Uyarısı', icon: 'Shield' },
    
    // Eylemler
    { id: 'action-notify', type: 'action', category: 'Bildirim', label: 'Uyarı Gönder', icon: 'Bell' },
    { id: 'action-webhook', type: 'action', category: 'Entegrasyon', label: 'Webhook Gönder', icon: 'Send' },
    { id: 'action-telegram', type: 'action', category: 'Bildirim', label: 'Telegram Mesajı', icon: 'MessageCircle' }
  ];

  const rules = [
    {
      id: 'rule-1',
      name: 'Yüksek Gecikme Tepkisi',
      enabled: true,
      triggers: ['WAN gecikmesi > 50ms'],
      actions: ['Konservatif QoS uygula', 'Telegram bildir']
    },
    {
      id: 'rule-2',
      name: 'Güvenlik Uyarı Sistemi',
      enabled: true,
      triggers: ['IDS uyarısı alındı'],
      actions: ['Anlık görüntü oluştur', 'Webhook gönder']
    }
  ];

  const handleDragStart = (block: RuleBlock) => {
    setDraggedBlock(block);
  };

  const handleDrop = () => {
    if (draggedBlock) {
      setRuleBlocks([...ruleBlocks, { ...draggedBlock, id: `${draggedBlock.id}-${Date.now()}` }]);
      setDraggedBlock(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Otomasyon ve Entegrasyonlar</h1>
          <p className="text-white/70 mt-1">Görsel kural oluşturucu, webhook ve bildirim entegrasyonları</p>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <MetricCard
          title="Aktif Kurallar"
          value={String(rules.filter(r => r.enabled).length)}
          subtitle={`${rules.length} toplam kuraldan`}
          icon="Zap"
          status="ok"
        />
        <MetricCard
          title="Webhook Bağlantıları"
          value="1"
          subtitle="n8n entegrasyonu"
          icon="Webhook"
          status="ok"
        />
        <MetricCard
          title="Telegram Bildirimleri"
          value="Aktif"
          subtitle="Bot durumu"
          icon="MessageCircle"
          status="ok"
        />
        <MetricCard
          title="Son Çalıştırma"
          value="5 dk önce"
          subtitle="Otomatik kural"
          icon="Clock"
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
          {activeTab === 'rules' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Block Palette */}
              <Card title="Kural Blokları" className="h-fit">
                <div className="space-y-4">
                  {['trigger', 'action'].map((type) => (
                    <div key={type}>
                      <h4 className="text-white/80 text-sm font-medium mb-2 capitalize">
                        {type === 'trigger' ? 'Tetikleyiciler' : 'Eylemler'}
                      </h4>
                      <div className="grid grid-cols-1 gap-2">
                        {availableBlocks.filter(block => block.type === type).map((block) => {
                          const IconComponent = Icons[block.icon as keyof typeof Icons] as React.ComponentType<any>;
                          return (
                            <motion.div
                              key={block.id}
                              draggable
                              onDragStart={() => handleDragStart(block)}
                              whileHover={{ scale: 1.02 }}
                              className={cn(
                                "p-3 rounded-xl border cursor-grab active:cursor-grabbing transition-all",
                                type === 'trigger' 
                                  ? "bg-blue-500/10 border-blue-500/20 hover:bg-blue-500/20"
                                  : "bg-orange-500/10 border-orange-500/20 hover:bg-orange-500/20"
                              )}
                            >
                              <div className="flex items-center gap-2">
                                <IconComponent className="w-4 h-4 text-white" />
                                <div>
                                  <p className="text-white text-sm font-medium">{block.label}</p>
                                  <p className="text-white/60 text-xs">{block.category}</p>
                                </div>
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Rule Builder */}
              <Card title="Kural Oluşturucu" className="h-fit">
                <div
                  onDrop={handleDrop}
                  onDragOver={(e) => e.preventDefault()}
                  className="min-h-48 p-4 border-2 border-dashed border-white/20 rounded-xl bg-white/5"
                >
                  {ruleBlocks.length === 0 ? (
                    <div className="text-center text-white/60 py-8">
                      <Icons.MousePointer className="w-8 h-8 mx-auto mb-2" />
                      <p>Kural oluşturmak için blokları buraya sürükleyin</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {ruleBlocks.map((block) => {
                        const IconComponent = Icons[block.icon as keyof typeof Icons] as React.ComponentType<any>;
                        return (
                          <motion.div
                            key={block.id}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className={cn(
                              "p-3 rounded-xl border flex items-center justify-between",
                              block.type === 'trigger' 
                                ? "bg-blue-500/10 border-blue-500/20"
                                : "bg-orange-500/10 border-orange-500/20"
                            )}
                          >
                            <div className="flex items-center gap-2">
                              <IconComponent className="w-4 h-4 text-white" />
                              <span className="text-white text-sm">{block.label}</span>
                            </div>
                            <button
                              onClick={() => setRuleBlocks(ruleBlocks.filter(b => b.id !== block.id))}
                              className="text-white/60 hover:text-red-400 transition-colors"
                            >
                              <Icons.X className="w-4 h-4" />
                            </button>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </Card>

              {/* Existing Rules */}
              <Card title="Aktif Kurallar" className="h-fit">
                <div className="space-y-3">
                  {rules.map((rule) => (
                    <div key={rule.id} className="p-4 rounded-xl bg-white/5 border border-white/10">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-white font-medium">{rule.name}</h4>
                        <div className={cn(
                          "w-2 h-2 rounded-full",
                          rule.enabled ? "bg-emerald-400" : "bg-white/40"
                        )} />
                      </div>
                      <div className="space-y-1">
                        <p className="text-white/70 text-xs">
                          <span className="text-blue-400">NE ZAMAN:</span> {rule.triggers.join(', ')}
                        </p>
                        <p className="text-white/70 text-xs">
                          <span className="text-orange-400">O ZAMAN:</span> {rule.actions.join(', ')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}

          {activeTab === 'webhooks' && (
            <Card title="n8n Webhook Yapılandırması">
              <div className="space-y-4">
                <div>
                  <label className="block text-white text-sm font-medium mb-2">Webhook URL</label>
                  <input
                    type="url"
                    placeholder="https://n8n.example.com/webhook/network-events"
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  />
                </div>

                <ControlCard
                  title="Webhook Ayarları"
                  controls={[
                    { id: 'webhook-enabled', type: 'toggle', label: 'Webhook Etkin', value: false, icon: 'Webhook', action: () => {} }
                  ]}
                />

                <Button variant="outline" className="w-full">
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" 
                         width="24" height="24" viewBox="0 0 24 24" 
                         fill="none" stroke="currentColor" strokeWidth="2" 
                         strokeLinecap="round" strokeLinejoin="round" 
                         className="lucide lucide-test-tube w-4 h-4 mr-2">
                      <path d="M14.5 2v17.5c0 1.4-1.1 2.5-2.5 2.5s-2.5-1.1-2.5-2.5V2"/>
                      <path d="M8.5 2h7"/>
                      <path d="M14.5 16a2.5 2.5 0 0 1-5 0v-4"/>
                    </svg>
                    <span className="truncate">Test Gönder</span>
                  </div>
                </Button>
              </div>
            </Card>
          )}

          {activeTab === 'telegram' && (
            <Card title="Telegram Bot Yapılandırması">
              <div className="space-y-4">
                <div>
                  <label className="block text-white text-sm font-medium mb-2">Bot Token</label>
                  <input
                    type="password"
                    placeholder="1234567890:ABCDefGhIJKlmNOPqrsTUVwxyZ"
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  />
                </div>

                <div>
                  <label className="block text-white text-sm font-medium mb-2">Chat ID</label>
                  <input
                    type="text"
                    placeholder="-1001234567890"
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  />
                </div>

                <ControlCard
                  title="Bot Ayarları"
                  controls={[
                    { id: 'telegram-enabled', type: 'toggle', label: 'Telegram Bot Etkin', value: false, icon: 'MessageCircle', action: () => {} }
                  ]}
                />

                <Button variant="outline" className="w-full">
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" 
                         width="24" height="24" viewBox="0 0 24 24" 
                         fill="none" stroke="currentColor" strokeWidth="2" 
                         strokeLinecap="round" strokeLinejoin="round" 
                         className="lucide lucide-test-tube w-4 h-4 mr-2">
                      <path d="M14.5 2v17.5c0 1.4-1.1 2.5-2.5 2.5s-2.5-1.1-2.5-2.5V2"/>
                      <path d="M8.5 2h7"/>
                      <path d="M14.5 16a2.5 2.5 0 0 1-5 0v-4"/>
                    </svg>
                    <span className="truncate">Test Mesajı</span>
                  </div>
                </Button>
              </div>
            </Card>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default Automations;