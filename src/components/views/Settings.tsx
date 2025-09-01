import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as Icons from 'lucide-react';
import { MetricCard } from '../cards/MetricCard';
import { ControlCard } from '../cards/ControlCard';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { cn } from '../../lib/utils';
import { SEOMeta } from '../SEO/SEOMeta';

interface CodeBlockProps {
  code: string;
  language: string;
  title?: string;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ code, language, title }) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  return (
    <div className="bg-black/40 rounded-xl border border-white/10 overflow-hidden">
      {title && (
        <div className="flex items-center justify-between px-4 py-2 bg-white/5 border-b border-white/10">
          <span className="text-white/80 text-sm font-medium">{title}</span>
          <span className="text-white/60 text-xs uppercase">{language}</span>
        </div>
      )}
      <div className="relative">
        <pre className="p-4 text-sm text-white/90 overflow-x-auto">
          <code>{code}</code>
        </pre>
        <button
          onClick={copyToClipboard}
          className="absolute top-2 right-2 p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
          title="Kodu Kopyala"
        >
          {copied ? (
            <Icons.Check className="w-4 h-4 text-emerald-400" />
          ) : (
            <Icons.Copy className="w-4 h-4 text-white/60" />
          )}
        </button>
      </div>
    </div>
  );
};

const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState('system');
  const [searchTerm, setSearchTerm] = useState('');

  const systemControls = [
    { id: 'auto-updates', type: 'toggle' as const, label: 'Otomatik Güncellemeler', value: true, icon: 'Download', action: () => {} },
    { id: 'telemetry', type: 'toggle' as const, label: 'Telemetri Verileri', value: false, icon: 'BarChart3', action: () => {} },
    { id: 'ssh', type: 'toggle' as const, label: 'SSH Erişimi', value: true, icon: 'Terminal', action: () => {} }
  ];

  const snapshots = [
    { name: 'güncelleme-öncesi-yedek', date: '2025-01-15 14:30', size: '2.3 GB', modules: 'Tümü' },
    { name: 'ağ-yapılandırma-yedeği', date: '2025-01-14 09:15', size: '156 MB', modules: 'Ağ' },
    { name: 'otomasyon-kuralları-yedeği', date: '2025-01-13 16:45', size: '12 MB', modules: 'Otomasyon' }
  ];

  const tabs = [
    { id: 'system', label: 'Sistem', icon: 'Settings' },
    { id: 'documentation', label: 'Dökümantasyon', icon: 'Book' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Sistem Ayarları</h1>
          <p className="text-white/70 mt-1">Yapılandırma, anlık görüntüler ve sistem dökümantasyonu</p>
        </div>
      </div>

      {/* System Status */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <MetricCard
          title="Sistem Sürümü"
          value="v2.1.4"
          subtitle="En son kararlı sürüm"
          icon="Package"
          status="ok"
        />
        <MetricCard
          title="Son Anlık Görüntü"
          value="2h ago"
          subtitle="pre-update-snapshot"
          icon="Camera"
          status="ok"
        />
        <MetricCard
          title="Yapılandırma Değişiklikleri"
          value="3"
          subtitle="Son anlık görüntüden itibaren"
          icon="Edit"
          status="warn"
        />
        <MetricCard
          title="Sistem Sağlığı"
          value="Mükemmel"
          subtitle="Tüm servisler çalışıyor"
          icon="Heart"
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
          {activeTab === 'system' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* System Controls */}
                <ControlCard
                  title="Sistem Yapılandırması"
                  controls={systemControls}
                />

                {/* Snapshot Management */}
                <Card title="Anlık Görüntü Yönetimi">
                  <div className="space-y-4">
                    <Button className="w-full">
                      <div className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" 
                             width="24" height="24" viewBox="0 0 24 24" 
                             fill="none" stroke="currentColor" strokeWidth="2" 
                             strokeLinecap="round" strokeLinejoin="round" 
                             className="lucide lucide-camera w-4 h-4 mr-2">
                          <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/>
                          <circle cx="12" cy="13" r="3"/>
                        </svg>
                        <span className="truncate">Snapshot Al</span>
                      </div>
                    </Button>
                    
                    <div className="space-y-2">
                      {snapshots.map((snapshot, index) => (
                        <div key={index} className="p-3 rounded-xl bg-white/5 border border-white/10">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-white font-medium text-sm">{snapshot.name}</p>
                              <p className="text-white/60 text-xs">{snapshot.date} • {snapshot.size}</p>
                            </div>
                            <div className="flex items-center gap-1">
                              <button className="p-1 hover:bg-white/10 rounded">
                                <Icons.RotateCcw className="w-3 h-3 text-white/60" />
                              </button>
                              <button className="p-1 hover:bg-white/10 rounded">
                                <Icons.Download className="w-3 h-3 text-white/60" />
                              </button>
                              <button className="p-1 hover:bg-red-500/20 rounded">
                                <Icons.Trash2 className="w-3 h-3 text-red-400/60" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
              </div>

              {/* Security & Access */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card title="Erişim Kontrolü">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                      <div>
                        <p className="text-white font-medium">Yönetici Erişimi</p>
                        <p className="text-white/60 text-sm">Tam sistem kontrolü</p>
                      </div>
                      <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-xs">
                        Aktif
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                      <div>
                        <p className="text-white font-medium">Misafir Erişimi</p>
                        <p className="text-white/60 text-sm">Sınırlı ağ görünümü</p>
                      </div>
                      <span className="px-2 py-1 bg-white/20 text-white/60 rounded-full text-xs">
                        Devre Dışı
                      </span>
                    </div>
                  </div>
                </Card>

                <Card title="Güvenlik Ayarları">
                  <div className="space-y-4">
                    <Button variant="outline" className="w-full justify-start">
                      <div className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" 
                             width="24" height="24" viewBox="0 0 24 24" 
                             fill="none" stroke="currentColor" strokeWidth="2" 
                             strokeLinecap="round" strokeLinejoin="round" 
                             className="lucide lucide-key w-4 h-4 mr-2">
                          <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/>
                        </svg>
                        <span className="truncate">API Yenile</span>
                      </div>
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <div className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" 
                             width="24" height="24" viewBox="0 0 24 24" 
                             fill="none" stroke="currentColor" strokeWidth="2" 
                             strokeLinecap="round" strokeLinejoin="round" 
                             className="lucide lucide-shield w-4 h-4 mr-2">
                          <path d="M20 13c0 5-3.5 7.5-8 7.5s-8-2.5-8-7.5c0-1.3.3-2.5.8-3.5.5-1 1.2-1.9 2.2-2.6 1-0.7 2.2-1.2 3.5-1.5 1.3-0.3 2.7-0.3 4 0 1.3 0.3 2.5 0.8 3.5 1.5 1 0.7 1.7 1.6 2.2 2.6.5 1 .8 2.2.8 3.5z"/>
                        </svg>
                        <span className="truncate">Güvenlik Tara</span>
                      </div>
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <div className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" 
                             width="24" height="24" viewBox="0 0 24 24" 
                             fill="none" stroke="currentColor" strokeWidth="2" 
                             strokeLinecap="round" strokeLinejoin="round" 
                             className="lucide lucide-file-text w-4 h-4 mr-2">
                          <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/>
                          <path d="M14 2v4a2 2 0 0 0 2 2h4"/>
                          <path d="M10 9H8"/>
                          <path d="M16 13H8"/>
                          <path d="M16 17H8"/>
                        </svg>
                        <span className="truncate">Denetim Log</span>
                      </div>
                    </Button>
                  </div>
                </Card>
              </div>
            </div>
          )}

          {activeTab === 'documentation' && (
            <div className="space-y-6">
              {/* Search */}
              <Card title="Dökümantasyon Arama">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Icons.Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/60" />
                      <input
                        type="text"
                        placeholder="Dökümantasyonda ara..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                      />
                    </div>
                  </div>
                </div>
              </Card>

              {/* Sample Documentation */}
              <Card title="Pi5 Supernode Tam Kurulum Kılavuzu">
                <div className="space-y-4">
                  <h4 className="text-white font-semibold">Kapsamlı Sistem Dokümantasyonu</h4>
                  <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <div className="space-y-3">
                      <Button variant="outline" className="w-full justify-start">
                        <div className="flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" 
                               width="24" height="24" viewBox="0 0 24 24" 
                               fill="none" stroke="currentColor" strokeWidth="2" 
                               strokeLinecap="round" strokeLinejoin="round" 
                               className="lucide lucide-file-text w-4 h-4 mr-2">
                            <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/>
                            <path d="M14 2v4a2 2 0 0 0 2 2h4"/>
                            <path d="M10 9H8"/>
                            <path d="M16 13H8"/>
                            <path d="M16 17H8"/>
                          </svg>
                          <span className="truncate">Tam Kurulum Kılavuzunu Aç</span>
                        </div>
                      </Button>
                        <li>• <strong>Sistem Analizi:</strong> Tüm bileşenlerin detaylı analizi</li>
                        <li>• <strong>Kurulum Prosedürleri:</strong> Adım adım kurulum talimatları</li>
                        <li>• <strong>API Entegrasyonu:</strong> Backend servis bağlantıları</li>
                        <li>• <strong>Grafana Monitoring:</strong> İzleme sistemi kurulumu</li>
                      <Button variant="outline" className="w-full justify-start">
                        <div className="flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" 
                               width="24" height="24" viewBox="0 0 24 24" 
                               fill="none" stroke="currentColor" strokeWidth="2" 
                               strokeLinecap="round" strokeLinejoin="round" 
                               className="lucide lucide-download w-4 h-4 mr-2">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                            <polyline points="7,10 12,15 17,10"/>
                            <line x1="12" x2="12" y1="15" y2="3"/>
                          </svg>
                          <span className="truncate">PDF İndir</span>
                        </div>
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <Button variant="outline" className="w-full justify-start">
                      <Icons.FileText className="w-4 h-4 mr-2" />
                      Tam Kurulum Kılavuzunu Aç (install_document.md)
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Icons.Download className="w-4 h-4 mr-2" />
                      Dokümantasyonu PDF Olarak İndir
                    </Button>
                  </div>
                </div>
              </Card>

              {/* Quick Links */}
              <Card title="Hızlı Erişim ve Kaynaklar">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Button variant="outline" className="justify-start">
                    <div className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" 
                           width="24" height="24" viewBox="0 0 24 24" 
                           fill="none" stroke="currentColor" strokeWidth="2" 
                           strokeLinecap="round" strokeLinejoin="round" 
                           className="lucide lucide-external-link w-4 h-4 mr-2">
                        <path d="M15 3h6v6"/>
                        <path d="M10 14 21 3"/>
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                      </svg>
                      <span className="truncate">Teknik Spesifikasyonlar</span>
                    </div>
                  </Button>
                  <Button variant="outline" className="justify-start">
                    <div className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" 
                           width="24" height="24" viewBox="0 0 24 24" 
                           fill="none" stroke="currentColor" strokeWidth="2" 
                           strokeLinecap="round" strokeLinejoin="round" 
                           className="lucide lucide-wrench w-4 h-4 mr-2">
                        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
                      </svg>
                      <span className="truncate">WireGuard Kılavuzu</span>
                    </div>
                  </Button>
                  <Button variant="outline" className="justify-start">
                    <div className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" 
                           width="24" height="24" viewBox="0 0 24 24" 
                           fill="none" stroke="currentColor" strokeWidth="2" 
                           strokeLinecap="round" strokeLinejoin="round" 
                           className="lucide lucide-code w-4 h-4 mr-2">
                        <polyline points="16,18 22,12 16,6"/>
                        <polyline points="8,6 2,12 8,18"/>
                      </svg>
                      <span className="truncate">Yapılandırma Planı</span>
                    </div>
                  </Button>
                  <Button variant="outline" className="justify-start">
                    <div className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" 
                           width="24" height="24" viewBox="0 0 24 24" 
                           fill="none" stroke="currentColor" strokeWidth="2" 
                           strokeLinecap="round" strokeLinejoin="round" 
                           className="lucide lucide-layers w-4 h-4 mr-2">
                        <path d="M2 12h20l-10-5z"/>
                        <path d="M2 17h20l-10-5z"/>
                        <path d="M2 22h20l-10-5z"/>
                      </svg>
                      <span className="truncate">Uygulama Kılavuzu</span>
                    </div>
                  </Button>
                </div>
              </Card>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default Settings;