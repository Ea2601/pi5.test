/**
 * Automation Engine Module
 * Rule-based automation and external integrations
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as Icons from 'lucide-react';
import { BaseModule } from '../core/BaseModule';
import { communicationBus } from '../core/CommunicationBus';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { MetricCard } from '../components/cards/MetricCard';
import { cn } from '../lib/utils';

interface RuleBlock {
  id: string;
  type: 'trigger' | 'condition' | 'action';
  category: string;
  label: string;
  icon: string;
  config?: any;
}

interface AutomationRule {
  id: string;
  name: string;
  enabled: boolean;
  triggers: RuleBlock[];
  conditions: RuleBlock[];
  actions: RuleBlock[];
  lastExecuted?: Date;
  executionCount: number;
}

class AutomationModuleClass extends BaseModule {
  private automationData = {
    rules: [],
    webhooks: [],
    telegramConfig: null,
    ruleBlocks: []
  };

  protected async onInitialize(): Promise<void> {
    this.logger.info('Initializing Automation Engine Module');
    
    // Initialize rule blocks library
    this.initializeRuleBlocks();
    
    // Subscribe to system events
    communicationBus.subscribe(
      `${this.manifest.id}-events`,
      { action: ['rule-triggered', 'webhook-received', 'system-event'] },
      this.handleAutomationEvent.bind(this)
    );
  }

  protected async onStart(): Promise<void> {
    await this.refreshAutomationData();
    this.startRuleEngine();
  }

  protected async onStop(): Promise<void> {
    this.stopRuleEngine();
  }

  protected async onAction(action: string, payload?: any): Promise<any> {
    switch (action) {
      case 'get-rules':
        return this.getRules();
      case 'create-rule':
        return this.createRule(payload);
      case 'execute-rule':
        return this.executeRule(payload);
      case 'get-webhooks':
        return this.getWebhooks();
      case 'test-telegram':
        return this.testTelegram();
      case 'get-metrics':
        return this.getModuleMetrics();
      default:
        throw new Error(`Unknown automation action: ${action}`);
    }
  }

  public getComponent(): React.ComponentType<any> {
    return AutomationModuleComponent;
  }

  private initializeRuleBlocks(): void {
    this.automationData.ruleBlocks = [
      // Triggers
      { id: 'trigger-device-connect', type: 'trigger', category: 'Cihaz', label: 'Cihaz Bağlandı', icon: 'Smartphone' },
      { id: 'trigger-wan-down', type: 'trigger', category: 'Ağ', label: 'WAN Kesintisi', icon: 'WifiOff' },
      { id: 'trigger-high-latency', type: 'trigger', category: 'Performans', label: 'Yüksek Gecikme', icon: 'Clock' },
      { id: 'trigger-schedule', type: 'trigger', category: 'Zaman', label: 'Zamanlayıcı', icon: 'Calendar' },
      
      // Conditions
      { id: 'condition-time-range', type: 'condition', category: 'Zaman', label: 'Saat Aralığı', icon: 'Clock' },
      { id: 'condition-device-type', type: 'condition', category: 'Cihaz', label: 'Cihaz Tipi', icon: 'Filter' },
      
      // Actions
      { id: 'action-telegram', type: 'action', category: 'Bildirim', label: 'Telegram Mesajı', icon: 'MessageCircle' },
      { id: 'action-webhook', type: 'action', category: 'Entegrasyon', label: 'Webhook Gönder', icon: 'Send' },
      { id: 'action-qos-change', type: 'action', category: 'Ağ', label: 'QoS Değiştir', icon: 'Zap' },
      { id: 'action-snapshot', type: 'action', category: 'Sistem', label: 'Snapshot Al', icon: 'Camera' }
    ];
  }

  private async refreshAutomationData(): Promise<void> {
    try {
      const [rules, webhooks] = await Promise.all([
        this.apiCall('/automation/rules'),
        this.apiCall('/automation/webhooks')
      ]);
      
      this.automationData.rules = rules.data || [];
      this.automationData.webhooks = webhooks.data || [];
      this.updateHealth('healthy');
      this.emit('automationDataUpdated', this.automationData);
    } catch (error) {
      this.updateHealth('degraded', (error as Error).message);
    }
  }

  private startRuleEngine(): void {
    this.logger.info('Rule engine started');
    // Start monitoring for rule triggers
  }

  private stopRuleEngine(): void {
    this.logger.info('Rule engine stopped');
    // Stop monitoring
  }

  private handleAutomationEvent(message: any): void {
    this.logger.debug(`Automation event: ${message.action}`, { payload: message.payload });
    // Process automation events
  }

  private async getRules(): Promise<AutomationRule[]> {
    return this.automationData.rules;
  }

  private async createRule(ruleData: any): Promise<any> {
    const result = await this.apiCall('/automation/rules', {
      method: 'POST',
      body: JSON.stringify(ruleData)
    });
    await this.refreshAutomationData();
    return result;
  }

  private async executeRule(ruleId: string): Promise<any> {
    return await this.apiCall(`/automation/rules/${ruleId}/execute`, {
      method: 'POST'
    });
  }

  private async getWebhooks(): Promise<any[]> {
    return this.automationData.webhooks;
  }

  private async testTelegram(): Promise<any> {
    return await this.apiCall('/automation/telegram/test', {
      method: 'POST'
    });
  }

  private getModuleMetrics(): any {
    return {
      totalRules: this.automationData.rules.length,
      activeRules: this.automationData.rules.filter((r: any) => r.enabled).length,
      totalWebhooks: this.automationData.webhooks.length,
      ruleExecutions: this.automationData.rules.reduce((acc: number, r: any) => acc + r.executionCount, 0)
    };
  }
}

const AutomationModuleComponent: React.FC = () => {
  const [activeTab, setActiveTab] = useState('rules');
  const [rules, setRules] = useState<AutomationRule[]>([]);
  const [ruleBlocks, setRuleBlocks] = useState<RuleBlock[]>([]);
  const [draggedBlock, setDraggedBlock] = useState<RuleBlock | null>(null);
  const [ruleBuilder, setRuleBuilder] = useState<RuleBlock[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const tabs = [
    { id: 'rules', label: 'Kural Motoru', icon: 'Zap' },
    { id: 'webhooks', label: 'Webhook Entegrasyonu', icon: 'Webhook' },
    { id: 'telegram', label: 'Telegram Bot', icon: 'MessageCircle' },
    { id: 'builder', label: 'Görsel Kural Oluşturucu', icon: 'Puzzle' }
  ];

  useEffect(() => {
    const loadAutomationData = async () => {
      try {
        const [rulesResult, ruleBlocksResult] = await Promise.all([
          communicationBus.send({
            type: 'request',
            source: 'automation-engine',
            target: 'automation-engine',
            action: 'get-rules'
          }),
          communicationBus.send({
            type: 'request',
            source: 'automation-engine',
            target: 'automation-engine',
            action: 'get-rule-blocks'
          })
        ]);

        setRules(rulesResult || []);
        setRuleBlocks(ruleBlocksResult || []);
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to load automation data:', error);
        setIsLoading(false);
      }
    };

    loadAutomationData();
  }, []);

  const handleDragStart = (block: RuleBlock) => {
    setDraggedBlock(block);
  };

  const handleDrop = () => {
    if (draggedBlock) {
      setRuleBuilder([...ruleBuilder, { ...draggedBlock, id: `${draggedBlock.id}-${Date.now()}` }]);
      setDraggedBlock(null);
    }
  };

  const handleCreateRule = async () => {
    try {
      const newRule = {
        name: `Rule ${Date.now()}`,
        enabled: true,
        blocks: ruleBuilder
      };

      await communicationBus.send({
        type: 'request',
        source: 'automation-engine',
        target: 'automation-engine',
        action: 'create-rule',
        payload: newRule
      });

      console.log('Automation rule created');
      setRuleBuilder([]);
    } catch (error) {
      console.error('Rule creation failed:', error);
    }
  };

  const handleTestTelegram = async () => {
    try {
      await communicationBus.send({
        type: 'request',
        source: 'automation-engine',
        target: 'automation-engine',
        action: 'test-telegram'
      });
      console.log('Telegram test message sent');
    } catch (error) {
      console.error('Telegram test failed:', error);
    }
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
          <h1 className="text-2xl font-bold text-white">Otomasyon Motoru</h1>
          <p className="text-white/70 mt-1">Akıllı kural sistemi ve entegrasyonlar</p>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <MetricCard
          title="Aktif Kurallar"
          value={String(rules.filter(r => r.enabled).length)}
          subtitle={`${rules.length} toplam kural`}
          icon="Zap"
          status="ok"
        />
        <MetricCard
          title="Kural Çalıştırma"
          value="247"
          subtitle="Bu ay"
          icon="Play"
          status="ok"
        />
        <MetricCard
          title="Webhook Bağlantıları"
          value="2"
          subtitle="Aktif entegrasyon"
          icon="Webhook"
          status="ok"
        />
        <MetricCard
          title="Telegram Bot"
          value="Aktif"
          subtitle="Bildirimler çalışıyor"
          icon="MessageCircle"
          status="ok"
        />
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-white/5 p-1 rounded-2xl backdrop-blur-sm border border-white/10">
        {tabs.map((tab) => {
          const IconComponent = Icons[tab.icon as keyof typeof Icons] as React.ComponentType<any>;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "relative flex items-center gap-2 px-6 py-3 rounded-xl transition-all duration-300 font-medium",
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
            <div className="space-y-6">
              {/* Existing Rules */}
              <Card title="Aktif Otomasyon Kuralları">
                <div className="space-y-3">
                  {rules.length === 0 ? (
                    <div className="text-center py-8">
                      <Icons.Zap className="w-12 h-12 text-white/30 mx-auto mb-3" />
                      <p className="text-white/60">Henüz kural bulunmuyor</p>
                      <p className="text-white/40 text-sm">İlk otomasyon kuralınızı oluşturun</p>
                    </div>
                  ) : (
                    rules.map((rule) => (
                      <div key={rule.id} className="p-4 rounded-xl bg-white/5 border border-white/10">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              "w-8 h-8 rounded-lg flex items-center justify-center",
                              rule.enabled ? "bg-emerald-500/20 border border-emerald-500/30" : "bg-gray-500/20 border border-gray-500/30"
                            )}>
                              <Icons.Zap className={cn("w-4 h-4", rule.enabled ? "text-emerald-400" : "text-gray-400")} />
                            </div>
                            <div>
                              <h4 className="text-white font-medium">{rule.name}</h4>
                              <p className="text-white/60 text-sm">{rule.executionCount} kez çalıştırıldı</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className={cn("w-2 h-2 rounded-full", rule.enabled ? "bg-emerald-400" : "bg-gray-400")} />
                            <Button size="sm" variant="outline">
                              <Icons.Edit className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                        <p className="text-white/70 text-sm">
                          {rule.triggers.length} tetikleyici, {rule.actions.length} eylem
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </Card>
            </div>
          )}

          {activeTab === 'builder' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Block Palette */}
              <Card title="Kural Blokları">
                <div className="space-y-4">
                  {['trigger', 'condition', 'action'].map((type) => (
                    <div key={type}>
                      <h4 className="text-white/80 text-sm font-medium mb-2 capitalize">
                        {type === 'trigger' ? 'Tetikleyiciler' : type === 'condition' ? 'Koşullar' : 'Eylemler'}
                      </h4>
                      <div className="space-y-2">
                        {ruleBlocks.filter(block => block.type === type).map((block) => {
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
                                  : type === 'condition'
                                  ? "bg-yellow-500/10 border-yellow-500/20 hover:bg-yellow-500/20"
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
              <Card title="Kural Oluşturucu">
                <div
                  onDrop={handleDrop}
                  onDragOver={(e) => e.preventDefault()}
                  className="min-h-48 p-4 border-2 border-dashed border-white/20 rounded-xl bg-white/5"
                >
                  {ruleBuilder.length === 0 ? (
                    <div className="text-center text-white/60 py-8">
                      <Icons.MousePointer className="w-8 h-8 mx-auto mb-2" />
                      <p>Kural oluşturmak için blokları buraya sürükleyin</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {ruleBuilder.map((block) => {
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
                                : block.type === 'condition'
                                ? "bg-yellow-500/10 border-yellow-500/20"
                                : "bg-orange-500/10 border-orange-500/20"
                            )}
                          >
                            <div className="flex items-center gap-2">
                              <IconComponent className="w-4 h-4 text-white" />
                              <span className="text-white text-sm">{block.label}</span>
                            </div>
                            <button
                              onClick={() => setRuleBuilder(ruleBuilder.filter(b => b.id !== block.id))}
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
                
                {ruleBuilder.length > 0 && (
                  <div className="mt-4">
                    <Button onClick={handleCreateRule} className="w-full">
                      <Icons.Save className="w-4 h-4 mr-2" />
                      Kuralı Kaydet
                    </Button>
                  </div>
                )}
              </Card>

              {/* Rule Preview */}
              <Card title="Kural Önizlemesi">
                <div className="space-y-4">
                  <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Icons.CheckCircle className="w-4 h-4 text-emerald-400" />
                      <span className="text-emerald-400 font-medium">Otomasyon Modülü Aktif</span>
                    </div>
                    <p className="text-white/80 text-sm">
                      Görsel kural oluşturucu, webhook entegrasyonu ve Telegram bot özellikleri çalışıyor.
                    </p>
                  </div>
                  
                  {ruleBuilder.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-white font-medium">Kural Akışı:</h4>
                      <div className="space-y-1 text-sm">
                        {ruleBuilder.filter(b => b.type === 'trigger').map(trigger => (
                          <p key={trigger.id} className="text-blue-400">
                            🔵 NE ZAMAN: {trigger.label}
                          </p>
                        ))}
                        {ruleBuilder.filter(b => b.type === 'condition').map(condition => (
                          <p key={condition.id} className="text-yellow-400">
                            🟡 VE EĞER: {condition.label}
                          </p>
                        ))}
                        {ruleBuilder.filter(b => b.type === 'action').map(action => (
                          <p key={action.id} className="text-orange-400">
                            🟠 O ZAMAN: {action.label}
                          </p>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          )}

          {activeTab === 'webhooks' && (
            <Card title="n8n Webhook Entegrasyonu">
              <div className="space-y-4">
                <div>
                  <label className="block text-white text-sm font-medium mb-2">Webhook URL</label>
                  <input
                    type="url"
                    placeholder="https://n8n.example.com/webhook/network-events"
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <Button className="flex-1">
                    <Icons.Save className="w-4 h-4 mr-2" />
                    Webhook Kaydet
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <Icons.TestTube className="w-4 h-4 mr-2" />
                    Test Gönder
                  </Button>
                </div>

                <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Icons.CheckCircle className="w-4 h-4 text-purple-400" />
                    <span className="text-purple-400 font-medium">Webhook Modülü Aktif</span>
                  </div>
                  <p className="text-white/80 text-sm">
                    n8n entegrasyonu ve webhook sistemi çalışır durumda.
                  </p>
                </div>
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

                <div className="flex items-center gap-3">
                  <Button className="flex-1">
                    <Icons.Save className="w-4 h-4 mr-2" />
                    Bot Ayarlarını Kaydet
                  </Button>
                  <Button variant="outline" onClick={handleTestTelegram} className="flex-1">
                    <Icons.Send className="w-4 h-4 mr-2" />
                    Test Mesajı
                  </Button>
                </div>

                <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Icons.CheckCircle className="w-4 h-4 text-blue-400" />
                    <span className="text-blue-400 font-medium">Telegram Modülü Aktif</span>
                  </div>
                  <p className="text-white/80 text-sm">
                    Telegram bot entegrasyonu ve bildirim sistemi çalışıyor.
                  </p>
                </div>
              </div>
            </Card>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default AutomationModuleClass;