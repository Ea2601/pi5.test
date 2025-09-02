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
              {/* Comprehensive Documentation */}
              <Card title="Pi5 Supernode Kapsamlı Sistem Dokümantasyonu">
                <div className="space-y-4">
                  <h4 className="text-white font-semibold">Güncellenmiş Tam Teknik Dokümantasyon</h4>
                  <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <Button variant="outline" className="w-full justify-start h-12">
                          <div className="flex items-center">
                            <Icons.FileText className="w-4 h-4 mr-2" />
                            <div className="text-left">
                              <span className="block">Kapsamlı Dokümantasyon</span>
                              <span className="block text-xs text-white/60">Sistem analizi, kurulum, API</span>
                            </div>
                          </div>
                        </Button>
                        <Button variant="outline" className="w-full justify-start h-12">
                          <div className="flex items-center">
                            <Icons.Book className="w-4 h-4 mr-2" />
                            <div className="text-left">
                              <span className="block">Hızlı Kurulum</span>
                              <span className="block text-xs text-white/60">One-line installation</span>
                            </div>
                          </div>
                        </Button>
                        <Button variant="outline" className="w-full justify-start h-12">
                          <div className="flex items-center">
                            <Icons.Map className="w-4 h-4 mr-2" />
                            <div className="text-left">
                              <span className="block">Kaynak Haritası</span>
                              <span className="block text-xs text-white/60">Dosya konumları, API endpoints</span>
                            </div>
                          </div>
                        </Button>
                        <Button variant="outline" className="w-full justify-start h-12">
                          <div className="flex items-center">
                            <Icons.Terminal className="w-4 h-4 mr-2" />
                            <div className="text-left">
                              <span className="block">Geliştirici Kılavuzu</span>
                              <span className="block text-xs text-white/60">Workflow, test, deployment</span>
                            </div>
                          </div>
                        </Button>
                      </div>
                      
                      <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4">
                        <h5 className="text-emerald-400 font-medium mb-2">Yenilikler v2.1.4</h5>
                        <ul className="text-white/80 text-sm space-y-1">
                          <li>• <strong>Tekilleştirme:</strong> Shared utilities, unified API client</li>
                          <li>• <strong>Entegrasyon:</strong> Frontend↔Backend tam entegrasyon</li>
                          <li>• <strong>Optimizasyon:</strong> Performance monitoring, caching</li>
                          <li>• <strong>CI/CD:</strong> Makefile workflow, Docker optimization</li>
                          <li>• <strong>Dokümantasyon:</strong> Kapsamlı kaynak haritası</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <Button variant="outline" className="justify-start">
                      <div className="flex items-center">
                        <Icons.FileText className="w-4 h-4 mr-2" />
                        <span className="truncate">Tam Kurulum Kılavuzu</span>
                      </div>
                    </Button>
                    <Button variant="outline" className="justify-start">
                      <div className="flex items-center">
                        <Icons.GitBranch className="w-4 h-4 mr-2" />
                        <span className="truncate">Sistem Mimarisi</span>
                      </div>
                    </Button>
                    <Button variant="outline" className="justify-start">
                      <div className="flex items-center">
                        <Icons.Code className="w-4 h-4 mr-2" />
                        <span className="truncate">API Referansı</span>
                      </div>
                    </Button>
                  </div>
                </div>
              </Card>

              {/* Quick Commands */}
              <Card title="Hızlı Komutlar ve Workflow">
                <div className="space-y-4">
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                    <h5 className="text-blue-400 font-medium mb-3">Development Workflow</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h6 className="text-white font-medium text-sm mb-2">Kurulum</h6>
                        <code className="block bg-black/40 p-3 rounded text-sm text-emerald-400 font-mono">
                          make quick-start
                        </code>
                      </div>
                      <div>
                        <h6 className="text-white font-medium text-sm mb-2">Geliştirme</h6>
                        <code className="block bg-black/40 p-3 rounded text-sm text-emerald-400 font-mono">
                          make dev
                        </code>
                      </div>
                      <div>
                        <h6 className="text-white font-medium text-sm mb-2">Test</h6>
                        <code className="block bg-black/40 p-3 rounded text-sm text-emerald-400 font-mono">
                          make test
                        </code>
                      </div>
                      <div>
                        <h6 className="text-white font-medium text-sm mb-2">Deploy</h6>
                        <code className="block bg-black/40 p-3 rounded text-sm text-emerald-400 font-mono">
                          make deploy-prod
                        </code>
                      </div>
                    </div>
                  </div>

                  <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4">
                    <h5 className="text-purple-400 font-medium mb-3">Sistem Yönetimi</h5>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-white/60">Health Check:</span>
                        <code className="text-emerald-400 font-mono">make health</code>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60">Backup:</span>
                        <code className="text-emerald-400 font-mono">make backup</code>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60">Clean:</span>
                        <code className="text-emerald-400 font-mono">make clean</code>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60">Logs:</span>
                        <code className="text-emerald-400 font-mono">make logs</code>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Environment Variables */}
              <Card title="Environment Variables Rehberi">
                <div className="space-y-4">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-white/10">
                          <th className="text-left py-2 text-white/80">Anahtar</th>
                          <th className="text-left py-2 text-white/80">Açıklama</th>
                          <th className="text-left py-2 text-white/80">Varsayılan</th>
                          <th className="text-left py-2 text-white/80">Gerekli</th>
                        </tr>
                      </thead>
                      <tbody className="text-white/90 text-xs">
                        <tr className="border-b border-white/5">
                          <td className="py-2 font-mono">DATABASE_URL</td>
                          <td className="py-2">PostgreSQL bağlantı string'i</td>
                          <td className="py-2 text-white/60">-</td>
                          <td className="py-2 text-emerald-400">✅</td>
                        </tr>
                        <tr className="border-b border-white/5">
                          <td className="py-2 font-mono">SUPABASE_URL</td>
                          <td className="py-2">Supabase proje URL'si</td>
                          <td className="py-2 text-white/60">-</td>
                          <td className="py-2 text-emerald-400">✅</td>
                        </tr>
                        <tr className="border-b border-white/5">
                          <td className="py-2 font-mono">JWT_SECRET</td>
                          <td className="py-2">JWT imzalama anahtarı</td>
                          <td className="py-2 text-white/60">-</td>
                          <td className="py-2 text-emerald-400">✅</td>
                        </tr>
                        <tr className="border-b border-white/5">
                          <td className="py-2 font-mono">GRAFANA_PASSWORD</td>
                          <td className="py-2">Grafana admin şifresi</td>
                          <td className="py-2 text-white/60">admin</td>
                          <td className="py-2 text-orange-400">⚠️</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </Card>

              {/* System Architecture */}
              <Card title="Sistem Mimarisi Özeti">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                      <h6 className="text-blue-400 font-medium mb-2">Frontend Stack</h6>
                      <ul className="text-white/80 text-sm space-y-1">
                        <li>• React 18.3.1 + TypeScript</li>
                        <li>• Tailwind CSS + Framer Motion</li>
                        <li>• React Query + Zustand</li>
                        <li>• Vite build system</li>
                      </ul>
                    </div>
                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                      <h6 className="text-emerald-400 font-medium mb-2">Backend Stack</h6>
                      <ul className="text-white/80 text-sm space-y-1">
                        <li>• Node.js + Express mikroservisler</li>
                        <li>• PostgreSQL + Redis</li>
                        <li>• Supabase real-time</li>
                        <li>• Docker containerization</li>
                      </ul>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                    <h6 className="text-orange-400 font-medium mb-2">Tekilleştirme Sonuçları</h6>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-white/60">Önceki Durum:</span>
                        <ul className="text-white/80 mt-1 space-y-1">
                          <li>• 5 farklı logger</li>
                          <li>• 4 database service</li>
                          <li>• 3 HTTP client</li>
                          <li>• Dağınık environment</li>
                        </ul>
                      </div>
                      <div>
                        <span className="text-white/60">Optimize Edilmiş:</span>
                        <ul className="text-emerald-400 mt-1 space-y-1">
                          <li>• ✅ Tek UnifiedLogger</li>
                          <li>• ✅ Tek DatabaseManager</li>
                          <li>• ✅ Tek UnifiedApiClient</li>
                          <li>• ✅ Merkezi configuration</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Quick Links - Updated */}
              <Card title="Hızlı Erişim ve Yeni Kaynaklar">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Button variant="outline" className="justify-start">
                    <div className="flex items-center">
                      <Icons.FileText className="w-4 h-4 mr-2" />
                      <span className="truncate">Kapsamlı Dokümantasyon</span>
                    </div>
                  </Button>
                  <Button variant="outline" className="justify-start">
                    <div className="flex items-center">
                      <Icons.Zap className="w-4 h-4 mr-2" />
                      <span className="truncate">Hızlı Kurulum</span>
                    </div>
                  </Button>
                  <Button variant="outline" className="justify-start">
                    <div className="flex items-center">
                      <Icons.Map className="w-4 h-4 mr-2" />
                      <span className="truncate">Kaynak Haritası</span>
                    </div>
                  </Button>
                  <Button variant="outline" className="justify-start">
                    <div className="flex items-center">
                      <Icons.Terminal className="w-4 h-4 mr-2" />
                      <span className="truncate">Makefile Commands</span>
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