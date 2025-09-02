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
    { id: 'ssh', type: 'toggle' as const, label: 'SSH Erişimi', value: true, icon: 'Terminal', action: () => {} },
    { id: 'backup', type: 'toggle' as const, label: 'Otomatik Yedekleme', value: true, icon: 'Archive', action: () => {} },
    { id: 'monitoring', type: 'toggle' as const, label: 'Sistem İzleme', value: true, icon: 'Activity', action: () => {} }
  ];

  const snapshots = [
    { name: 'güncelleme-öncesi-yedek', date: '2025-01-15 14:30', size: '2.3 GB', modules: 'Tümü' },
    { name: 'ağ-yapılandırma-yedeği', date: '2025-01-14 09:15', size: '156 MB', modules: 'Ağ' },
    { name: 'otomasyon-kuralları-yedeği', date: '2025-01-13 16:45', size: '12 MB', modules: 'Otomasyon' },
    { name: 'vpn-sunucu-yedeği', date: '2025-01-12 11:20', size: '45 MB', modules: 'VPN' },
    { name: 'dns-profil-yedeği', date: '2025-01-11 08:15', size: '8 MB', modules: 'DNS' }
  ];

  const systemDocuments = [
    {
      title: 'Kapsamlı Kurulum Kılavuzu',
      description: 'Pi5 Supernode için tam kurulum dökümanı',
      file: 'docs/install_document.md',
      size: '124 KB',
      icon: 'FileText',
      category: 'Kurulum'
    },
    {
      title: 'Sistem Mimarisi Detayları',
      description: 'Teknik mimari ve bileşen analizi',
      file: 'docs/SYSTEM_ARCHITECTURE.md',
      size: '89 KB',
      icon: 'GitBranch',
      category: 'Mimari'
    },
    {
      title: 'WireGuard VPN Kurulum',
      description: 'VPN server ve client kurulum rehberi',
      file: 'docs/WIREGUARD_SETUP.md',
      size: '67 KB',
      icon: 'Shield',
      category: 'VPN'
    },
    {
      title: 'API Referans Dokümantasyonu',
      description: 'OpenAPI 3.0 şema ve endpoint rehberi',
      file: 'shared/schemas/openapi.yaml',
      size: '156 KB',
      icon: 'Code',
      category: 'API'
    },
    {
      title: 'Geliştirici Kılavuzu',
      description: 'Development workflow ve best practices',
      file: 'IMPLEMENTATION_GUIDE.md',
      size: '78 KB',
      icon: 'Terminal',
      category: 'Geliştirme'
    },
    {
      title: 'Performans Optimizasyonu',
      description: 'Sistem optimizasyon ve tuning rehberi',
      file: 'SYSTEM_OPTIMIZATION_SUMMARY.md',
      size: '34 KB',
      icon: 'Zap',
      category: 'Optimizasyon'
    }
  ];

  const quickCommands = [
    {
      title: 'Hızlı Kurulum',
      command: 'make quick-start',
      description: 'Tüm sistemi kurup başlatır',
      category: 'Kurulum',
      icon: 'Zap'
    },
    {
      title: 'Geliştirme Başlat',
      command: 'make dev',
      description: 'Frontend ve backend geliştirme servisleri',
      category: 'Geliştirme',
      icon: 'Play'
    },
    {
      title: 'Production Build',
      command: 'make build',
      description: 'Production için optimize edilmiş build',
      category: 'Build',
      icon: 'Package'
    },
    {
      title: 'Sistem Sağlık Kontrolü',
      command: 'make health',
      description: 'Tüm servislerin durumunu kontrol eder',
      category: 'İzleme',
      icon: 'Heart'
    },
    {
      title: 'Log Görüntüleme',
      command: 'make logs',
      description: 'Sistem loglarını canlı görüntüler',
      category: 'Debug',
      icon: 'FileText'
    },
    {
      title: 'Temizlik ve Optimizasyon',
      command: 'make clean && make optimize',
      description: 'Sistem temizliği ve optimizasyon',
      category: 'Bakım',
      icon: 'RefreshCw'
    },
    {
      title: 'Production Deployment',
      command: 'make deploy-prod',
      description: 'Production ortamına deployment',
      category: 'Deploy',
      icon: 'Upload'
    },
    {
      title: 'Backup ve Restore',
      command: 'make backup',
      description: 'Sistem backup oluşturur',
      category: 'Backup',
      icon: 'Archive'
    }
  ];

  const environmentGuide = `# Pi5 Supernode Environment Variables
# Aşağıdaki değişkenleri .env dosyasında yapılandırın

# ================================
# Database Configuration (ZORUNLU)
# ================================
DATABASE_URL=postgresql://postgres:GÜÇLÜ_ŞİFRE@localhost:5432/pi5_supernode
POSTGRES_PASSWORD=güçlü_veritabanı_şifresi
REDIS_URL=redis://localhost:6379

# ================================
# Supabase Configuration (ZORUNLU)
# ================================
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

# ================================
# API Services
# ================================
API_GATEWAY_PORT=3000
NETWORK_SERVICE_PORT=3001
VPN_SERVICE_PORT=3002
AUTOMATION_SERVICE_PORT=3003

# ================================
# Security (ZORUNLU)
# ================================
JWT_SECRET=32_karakter_minimum_güvenli_anahtar
SESSION_SECRET=oturum_şifreleme_anahtarı

# ================================
# Frontend Configuration
# ================================
FRONTEND_URL=http://PI_IP_ADRESİ:5173

# ================================
# Monitoring
# ================================
GRAFANA_PASSWORD=grafana_admin_şifresi
LOG_LEVEL=info

# ================================
# External Integrations (İsteğe Bağlı)
# ================================
TELEGRAM_BOT_TOKEN=telegram_bot_anahtarı
WEBHOOK_BASE_URL=https://n8n-instance.com`;

  const installationScript = `#!/bin/bash
# Pi5 Supernode Hızlı Kurulum Script

echo "🚀 Pi5 Supernode Kurulum Başlatılıyor..."

# 1. Sistem Güncelleme
sudo apt update && sudo apt upgrade -y

# 2. Docker Kurulumu
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
newgrp docker

# 3. Node.js Kurulumu
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# 4. Proje Kurulumu
git clone https://github.com/pi5-supernode/pi5-supernode.git
cd pi5-supernode

# 5. Environment Yapılandırması
cp .env.example .env
echo "⚠️  .env dosyasını düzenleyip kuruluma devam edin"
nano .env

# 6. Hızlı Başlatma
make quick-start

echo "✅ Kurulum tamamlandı!"
echo "🌐 Ana Panel: http://localhost:5173"
echo "📊 Grafana: http://localhost:3100"
echo "🔍 API Health: http://localhost:3000/health"`;

  const tabs = [
    { id: 'system', label: 'Sistem Yapılandırması', icon: 'Settings' },
    { id: 'documentation', label: 'Dokümantasyon', icon: 'BookOpen' },
    { id: 'installation', label: 'Kurulum Rehberi', icon: 'Download' },
    { id: 'commands', label: 'Hızlı Komutlar', icon: 'Terminal' },
    { id: 'troubleshooting', label: 'Sorun Giderme', icon: 'AlertTriangle' },
    { id: 'about', label: 'Sistem Bilgisi', icon: 'Info' }
  ];

  const filteredDocuments = systemDocuments.filter(doc =>
    searchTerm === '' || 
    doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredCommands = quickCommands.filter(cmd =>
    searchTerm === '' ||
    cmd.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cmd.command.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cmd.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <SEOMeta
        title="Sistem Ayarları"
        description="Pi5 Supernode sistem yapılandırması, dokümantasyon ve yönetim"
      />
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Sistem Ayarları</h1>
          <p className="text-white/70 mt-1">Yapılandırma, dokümantasyon ve sistem yönetimi</p>
        </div>
      </div>

      {/* System Status */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <MetricCard
          title="Sistem Sürümü"
          value="v2.1.4"
          subtitle="Pi5 Supernode"
          icon="Package"
          status="ok"
        />
        <MetricCard
          title="Database Durumu"
          value="Bağlantı Yok"
          subtitle="Supabase bağlantısı gerekli"
          icon="Database"
          status="error"
        />
        <MetricCard
          title="API Gateway"
          value="Çalışıyor"
          subtitle="Port 3000"
          icon="Server"
          status="ok"
        />
        <MetricCard
          title="Frontend"
          value="Aktif"
          subtitle="Development mode"
          icon="Monitor"
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
                "relative flex items-center gap-2 px-4 py-3 rounded-xl transition-all duration-300 font-medium whitespace-nowrap",
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
                    <div className="flex items-center gap-3">
                      <Button className="flex-1">
                        <Icons.Camera className="w-4 h-4 mr-2" />
                        Yeni Snapshot Al
                      </Button>
                      <Button variant="outline">
                        <Icons.Import className="w-4 h-4 mr-2" />
                        Geri Yükle
                      </Button>
                    </div>
                    
                    <div className="space-y-2">
                      {snapshots.map((snapshot, index) => (
                        <div key={index} className="p-3 rounded-xl bg-white/5 border border-white/10">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-white font-medium text-sm">{snapshot.name}</p>
                              <p className="text-white/60 text-xs">{snapshot.date} • {snapshot.size} • {snapshot.modules}</p>
                            </div>
                            <div className="flex items-center gap-1">
                              <button className="p-1 hover:bg-white/10 rounded" title="Geri Yükle">
                                <Icons.RotateCcw className="w-3 h-3 text-white/60" />
                              </button>
                              <button className="p-1 hover:bg-white/10 rounded" title="İndir">
                                <Icons.Download className="w-3 h-3 text-white/60" />
                              </button>
                              <button className="p-1 hover:bg-red-500/20 rounded" title="Sil">
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
                <Card title="Erişim Kontrolü ve Güvenlik">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                      <div className="flex items-center gap-2">
                        <Icons.User className="w-4 h-4 text-emerald-400" />
                        <div>
                          <p className="text-white font-medium">Yönetici Erişimi</p>
                          <p className="text-white/60 text-sm">Tam sistem kontrolü</p>
                        </div>
                      </div>
                      <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-xs">
                        Aktif
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                      <div className="flex items-center gap-2">
                        <Icons.UserX className="w-4 h-4 text-orange-400" />
                        <div>
                          <p className="text-white font-medium">Misafir Erişimi</p>
                          <p className="text-white/60 text-sm">Sınırlı ağ görünümü</p>
                        </div>
                      </div>
                      <span className="px-2 py-1 bg-white/20 text-white/60 rounded-full text-xs">
                        Devre Dışı
                      </span>
                    </div>

                    <div className="flex items-center gap-3 pt-3">
                      <Button variant="outline" className="flex-1">
                        <Icons.Key className="w-4 h-4 mr-2" />
                        API Anahtarı Yenile
                      </Button>
                      <Button variant="outline" className="flex-1">
                        <Icons.Shield className="w-4 h-4 mr-2" />
                        Güvenlik Taraması
                      </Button>
                    </div>
                  </div>
                </Card>

                <Card title="Sistem Durumu ve Sağlık">
                  <div className="space-y-4">
                    <div className="space-y-3">
                      <h4 className="text-white font-medium">Servis Durumları</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between items-center">
                          <span className="text-white/60">API Gateway:</span>
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                            <span className="text-emerald-400">Çalışıyor</span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-white/60">Network Service:</span>
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                            <span className="text-red-400">Bağlantı Yok</span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-white/60">VPN Service:</span>
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                            <span className="text-red-400">Bağlantı Yok</span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-white/60">Database:</span>
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                            <span className="text-red-400">Supabase Bağlantısı Yok</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <h4 className="text-white font-medium">Sistem Bilgileri</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-white/60">Node.js Sürümü:</span>
                          <span className="text-white">18.19.0</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-white/60">TypeScript:</span>
                          <span className="text-emerald-400">5.5.3</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-white/60">React:</span>
                          <span className="text-emerald-400">18.3.1</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-white/60">Docker:</span>
                          <span className="text-emerald-400">Kurulu</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          )}

          {activeTab === 'documentation' && (
            <div className="space-y-6">
              {/* Search */}
              <div className="relative">
                <Icons.Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/40" />
                <input
                  type="text"
                  placeholder="Dokümantasyon ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
              </div>

              {/* Documentation Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredDocuments.map((doc, index) => {
                  const IconComponent = Icons[doc.icon as keyof typeof Icons] as React.ComponentType<any>;
                  return (
                    <Card key={index} className="h-full hover:border-emerald-500/30" hoverable>
                      <div className="space-y-4">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center flex-shrink-0">
                            <IconComponent className="w-5 h-5 text-emerald-400" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="text-white font-semibold text-sm leading-tight">{doc.title}</h4>
                            <p className="text-white/60 text-xs mt-1">{doc.description}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between text-xs">
                          <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full border border-blue-500/30">
                            {doc.category}
                          </span>
                          <span className="text-white/50">{doc.size}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button size="sm" className="flex-1">
                            <Icons.ExternalLink className="w-3 h-3 mr-1" />
                            Aç
                          </Button>
                          <Button size="sm" variant="outline">
                            <Icons.Download className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>

              {/* Documentation Overview */}
              <Card title="Dokümantasyon Haritası">
                <div className="space-y-4">
                  <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4">
                    <h4 className="text-emerald-400 font-medium mb-3 flex items-center gap-2">
                      <Icons.Map className="w-4 h-4" />
                      Güncellenmiş Tam Dokümantasyon Sistemi
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <h5 className="text-white font-medium mb-2">Kurulum ve Yapılandırma</h5>
                        <ul className="text-white/80 space-y-1">
                          <li>• Kapsamlı kurulum rehberi (124 KB)</li>
                          <li>• Optimized kurulum kılavuzu</li>
                          <li>• Environment değişkenleri rehberi</li>
                          <li>• Docker konfigürasyonu</li>
                        </ul>
                      </div>
                      <div>
                        <h5 className="text-white font-medium mb-2">Teknik Dokümantasyon</h5>
                        <ul className="text-white/80 space-y-1">
                          <li>• Sistem mimarisi (89 KB)</li>
                          <li>• API referans dokümantasyonu (156 KB)</li>
                          <li>• Database şema detayları</li>
                          <li>• Performance optimizasyon rehberi</li>
                        </ul>
                      </div>
                      <div>
                        <h5 className="text-white font-medium mb-2">Özel Servisler</h5>
                        <ul className="text-white/80 space-y-1">
                          <li>• WireGuard VPN kurulum (67 KB)</li>
                          <li>• Network management rehberi</li>
                          <li>• Automation yapılandırması</li>
                          <li>• Monitoring setup rehberi</li>
                        </ul>
                      </div>
                      <div>
                        <h5 className="text-white font-medium mb-2">Geliştirici Kaynakları</h5>
                        <ul className="text-white/80 space-y-1">
                          <li>• Implementation guide (78 KB)</li>
                          <li>• Development workflow</li>
                          <li>• Testing ve CI/CD</li>
                          <li>• Troubleshooting rehberi</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {activeTab === 'installation' && (
            <div className="space-y-6">
              {/* Quick Installation */}
              <Card title="Hızlı Kurulum - One Line Installation">
                <div className="space-y-4">
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                    <h4 className="text-blue-400 font-medium mb-3">Tek Komut Kurulum</h4>
                    <CodeBlock
                      title="Raspberry Pi 5 Hızlı Kurulum"
                      language="bash"
                      code="curl -fsSL https://install.pi5supernode.com/install.sh | bash"
                    />
                    <p className="text-white/80 text-sm mt-3">
                      Bu komut tüm bağımlılıkları kurar, Docker'ı yapılandırır ve sistemi başlatır.
                    </p>
                  </div>

                  <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4">
                    <h4 className="text-emerald-400 font-medium mb-3">Manuel Kurulum Script</h4>
                    <CodeBlock
                      title="Adım Adım Kurulum Script"
                      language="bash"
                      code={installationScript}
                    />
                  </div>

                  <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4">
                    <h4 className="text-orange-400 font-medium mb-3">Environment Yapılandırması</h4>
                    <CodeBlock
                      title=".env Dosyası Şablonu"
                      language="bash"
                      code={environmentGuide}
                    />
                  </div>
                </div>
              </Card>

              {/* Installation Steps */}
              <Card title="Detaylı Kurulum Adımları">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-white font-medium mb-3">Sistem Hazırlığı</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <Icons.CheckCircle className="w-4 h-4 text-emerald-400" />
                          <span className="text-white/80">Raspberry Pi OS kurulumu</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Icons.CheckCircle className="w-4 h-4 text-emerald-400" />
                          <span className="text-white/80">SSH erişimi aktifleştirme</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Icons.CheckCircle className="w-4 h-4 text-emerald-400" />
                          <span className="text-white/80">Statik IP yapılandırması</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Icons.CheckCircle className="w-4 h-4 text-emerald-400" />
                          <span className="text-white/80">Sistem güncellemeleri</span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-white font-medium mb-3">Uygulama Kurulumu</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <Icons.CheckCircle className="w-4 h-4 text-emerald-400" />
                          <span className="text-white/80">Docker ve Docker Compose</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Icons.CheckCircle className="w-4 h-4 text-emerald-400" />
                          <span className="text-white/80">Node.js 18+ kurulumu</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Icons.CheckCircle className="w-4 h-4 text-emerald-400" />
                          <span className="text-white/80">Proje repository klonlama</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Icons.AlertCircle className="w-4 h-4 text-orange-400" />
                          <span className="text-white/80">Supabase bağlantısı yapılandırması</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {activeTab === 'commands' && (
            <div className="space-y-6">
              {/* Search Commands */}
              <div className="relative">
                <Icons.Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/40" />
                <input
                  type="text"
                  placeholder="Komut ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
              </div>

              {/* Commands Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredCommands.map((command, index) => {
                  const IconComponent = Icons[command.icon as keyof typeof Icons] as React.ComponentType<any>;
                  return (
                    <Card key={index} className="h-full">
                      <div className="space-y-4">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-lg bg-purple-500/20 border border-purple-500/30 flex items-center justify-center flex-shrink-0">
                            <IconComponent className="w-4 h-4 text-purple-400" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="text-white font-semibold text-sm">{command.title}</h4>
                            <p className="text-white/60 text-xs mt-1">{command.description}</p>
                          </div>
                        </div>
                        
                        <div className="bg-black/40 rounded-lg p-3 border border-white/10">
                          <code className="text-emerald-400 font-mono text-sm">{command.command}</code>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="px-2 py-1 bg-orange-500/20 text-orange-400 rounded-full text-xs border border-orange-500/30">
                            {command.category}
                          </span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => navigator.clipboard.writeText(command.command)}
                          >
                            <Icons.Copy className="w-3 h-3 mr-1" />
                            Kopyala
                          </Button>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>

              {/* Makefile Overview */}
              <Card title="Makefile Komut Sistemi">
                <div className="space-y-4">
                  <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4">
                    <h4 className="text-purple-400 font-medium mb-3">Available Make Commands</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <h5 className="text-white font-medium mb-2">Development</h5>
                        <ul className="text-white/80 space-y-1 font-mono">
                          <li>• <code>make install</code> - Bağımlılık kurulumu</li>
                          <li>• <code>make dev</code> - Geliştirme başlat</li>
                          <li>• <code>make dev-frontend</code> - Sadece frontend</li>
                          <li>• <code>make dev-backend</code> - Sadece backend</li>
                        </ul>
                      </div>
                      <div>
                        <h5 className="text-white font-medium mb-2">Testing & Building</h5>
                        <ul className="text-white/80 space-y-1 font-mono">
                          <li>• <code>make test</code> - Tüm testler</li>
                          <li>• <code>make build</code> - Production build</li>
                          <li>• <code>make lint</code> - Code linting</li>
                          <li>• <code>make type-check</code> - TypeScript kontrol</li>
                        </ul>
                      </div>
                      <div>
                        <h5 className="text-white font-medium mb-2">Database</h5>
                        <ul className="text-white/80 space-y-1 font-mono">
                          <li>• <code>make migrate</code> - Migration uygula</li>
                          <li>• <code>make schema-generate</code> - Type generate</li>
                          <li>• <code>make db-reset</code> - Database reset</li>
                        </ul>
                      </div>
                      <div>
                        <h5 className="text-white font-medium mb-2">System Operations</h5>
                        <ul className="text-white/80 space-y-1 font-mono">
                          <li>• <code>make health</code> - Sistem kontrolü</li>
                          <li>• <code>make backup</code> - Backup oluştur</li>
                          <li>• <code>make deploy-prod</code> - Production deploy</li>
                          <li>• <code>make clean</code> - Temizlik yap</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {activeTab === 'troubleshooting' && (
            <div className="space-y-6">
              {/* Common Issues */}
              <Card title="Yaygın Sorunlar ve Çözümleri">
                <div className="space-y-6">
                  {/* Database Connection Issues */}
                  <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                    <h4 className="text-red-400 font-medium mb-3 flex items-center gap-2">
                      <Icons.Database className="w-4 h-4" />
                      Supabase Bağlantı Sorunu (Şu Anki Durum)
                    </h4>
                    <p className="text-white/80 text-sm mb-3">
                      Supabase bağlantısı yapılandırılmamış. Aşağıdaki adımları takip edin:
                    </p>
                    <div className="space-y-2">
                      <CodeBlock
                        title="1. Supabase Project Oluştur"
                        language="bash"
                        code="# https://supabase.com adresinden yeni proje oluşturun\n# Project Settings > API'den URL ve Key'i alın"
                      />
                      <CodeBlock
                        title="2. Environment Variables Ekle"
                        language="bash"
                        code={`echo "VITE_SUPABASE_URL=https://your-project.supabase.co" >> .env\necho "VITE_SUPABASE_ANON_KEY=your-anon-key" >> .env`}
                      />
                      <CodeBlock
                        title="3. Veritabanı Migration Uygula"
                        language="bash"
                        code="make migrate"
                      />
                    </div>
                  </div>

                  {/* Port Conflicts */}
                  <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                    <h4 className="text-orange-400 font-medium mb-3 flex items-center gap-2">
                      <Icons.AlertTriangle className="w-4 h-4" />
                      Port Çakışma Sorunları
                    </h4>
                    <CodeBlock
                      title="Port Kullanımını Kontrol Et"
                      language="bash"
                      code={`# Kullanılan portları kontrol et\nsudo netstat -tlnp | grep -E "(3000|3001|3002|3003|5173)"\n\n# Çakışan process'i sonlandır\nsudo pkill -f "node.*3000"\n\n# Apache/Nginx durdurun (çakışma varsa)\nsudo systemctl stop apache2\nsudo systemctl stop nginx`}
                    />
                  </div>

                  {/* Memory Issues */}
                  <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                    <h4 className="text-yellow-400 font-medium mb-3 flex items-center gap-2">
                      <Icons.Cpu className="w-4 h-4" />
                      Performance ve Memory Sorunları
                    </h4>
                    <CodeBlock
                      title="Memory Optimizasyonu"
                      language="bash"
                      code={`# Memory kullanımını kontrol et\nhtop\nfree -h\n\n# Docker resource limit ayarla\n# docker-compose.yml'de memory limits ekle\n\n# Node.js memory ayarla\nNODE_OPTIONS="--max-old-space-size=512" npm run dev`}
                    />
                  </div>

                  {/* Docker Issues */}
                  <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                    <h4 className="text-blue-400 font-medium mb-3 flex items-center gap-2">
                      <Icons.Package className="w-4 h-4" />
                      Docker Container Sorunları
                    </h4>
                    <CodeBlock
                      title="Docker Troubleshooting"
                      language="bash"
                      code={`# Container durumunu kontrol et\ndocker-compose ps\n\n# Container loglarını görüntüle\ndocker-compose logs [service-name]\n\n# Container'ları yeniden başlat\ndocker-compose restart\n\n# Tam reset (dikkat: veri kaybı)\ndocker-compose down\ndocker system prune -f\ndocker-compose up -d`}
                    />
                  </div>
                </div>
              </Card>

              {/* Emergency Procedures */}
              <Card title="Acil Durum Prosedürleri">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                      <h4 className="text-red-400 font-medium mb-3">Sistem Recovery</h4>
                      <CodeBlock
                        language="bash"
                        code={`# 1. Acil sistem durdur\nmake docker:down\n\n# 2. Backup'tan geri yükle\nmake restore BACKUP=20240115_140000\n\n# 3. Sistemi yeniden başlat\nmake quick-reset`}
                      />
                    </div>
                    
                    <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                      <h4 className="text-yellow-400 font-medium mb-3">Veri Kurtarma</h4>
                      <CodeBlock
                        language="bash"
                        code={`# Database export\ndocker-compose exec postgres pg_dump -U postgres pi5_supernode > emergency.sql\n\n# Config backup\ntar czf config-backup.tar.gz .env docker-compose.yml`}
                      />
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {activeTab === 'about' && (
            <div className="space-y-6">
              {/* System Information */}
              <Card title="Pi5 Supernode Sistem Bilgisi">
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="w-20 h-20 mx-auto mb-4 bg-emerald-500/20 rounded-2xl flex items-center justify-center">
                      <Icons.Cpu className="w-10 h-10 text-emerald-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">Pi5 Supernode</h2>
                    <p className="text-emerald-400 font-medium">Enterprise Network Management Platform</p>
                    <p className="text-white/60 text-sm mt-1">Version 2.1.4 - January 2025</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center p-4 bg-white/5 rounded-xl border border-white/10">
                      <Icons.Monitor className="w-8 h-8 text-blue-400 mx-auto mb-3" />
                      <h4 className="text-white font-semibold mb-2">Frontend</h4>
                      <ul className="text-white/70 text-sm space-y-1">
                        <li>React 18.3.1</li>
                        <li>TypeScript 5.5.3</li>
                        <li>Tailwind CSS 3.4.1</li>
                        <li>Framer Motion</li>
                      </ul>
                    </div>
                    
                    <div className="text-center p-4 bg-white/5 rounded-xl border border-white/10">
                      <Icons.Server className="w-8 h-8 text-emerald-400 mx-auto mb-3" />
                      <h4 className="text-white font-semibold mb-2">Backend</h4>
                      <ul className="text-white/70 text-sm space-y-1">
                        <li>Node.js 18+</li>
                        <li>Express.js</li>
                        <li>TypeScript</li>
                        <li>Mikroservis Mimarisi</li>
                      </ul>
                    </div>
                    
                    <div className="text-center p-4 bg-white/5 rounded-xl border border-white/10">
                      <Icons.Database className="w-8 h-8 text-purple-400 mx-auto mb-3" />
                      <h4 className="text-white font-semibold mb-2">Database</h4>
                      <ul className="text-white/70 text-sm space-y-1">
                        <li>PostgreSQL 15</li>
                        <li>Supabase</li>
                        <li>Redis Cache</li>
                        <li>Real-time Sync</li>
                      </ul>
                    </div>
                  </div>

                  <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4">
                    <h4 className="text-emerald-400 font-medium mb-3">v2.1.4 Güncellemeleri</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <h5 className="text-white font-medium mb-2">✅ Tamamlanan Optimizasyonlar</h5>
                        <ul className="text-white/80 space-y-1">
                          <li>• <strong>Tekilleştirme:</strong> 5 → 1 logger sistemi</li>
                          <li>• <strong>API Client:</strong> 3 → 1 unified client</li>
                          <li>• <strong>Database:</strong> 4 → 1 manager sistemi</li>
                          <li>• <strong>Environment:</strong> Merkezi config</li>
                          <li>• <strong>TypeScript:</strong> Birleştirilmiş tipler</li>
                        </ul>
                      </div>
                      <div>
                        <h5 className="text-white font-medium mb-2">🔄 Sonraki Adımlar</h5>
                        <ul className="text-orange-400 space-y-1">
                          <li>• Supabase bağlantısı kurulumu</li>
                          <li>• Database migration uygulaması</li>
                          <li>• Production deployment</li>
                          <li>• Performance monitoring</li>
                          <li>• Security hardening</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="text-center">
                    <div className="flex items-center justify-center gap-6 text-white/60">
                      <div className="flex items-center gap-2">
                        <Icons.Github className="w-4 h-4" />
                        <span className="text-sm">GitHub Repository</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Icons.Book className="w-4 h-4" />
                        <span className="text-sm">Documentation</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Icons.MessageCircle className="w-4 h-4" />
                        <span className="text-sm">Community Support</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* License and Credits */}
              <Card title="Lisans ve Katkıda Bulunanlar">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-white font-medium mb-3">Open Source Lisansı</h4>
                      <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                        <p className="text-white/80 text-sm mb-2">MIT License</p>
                        <p className="text-white/60 text-xs">
                          Bu yazılım MIT lisansı altında açık kaynak olarak dağıtılmaktadır. 
                          Ticari ve kişisel kullanım için serbestir.
                        </p>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-white font-medium mb-3">Teknoloji Credits</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-white/60">React:</span>
                          <span className="text-white">Meta (Facebook)</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-white/60">Supabase:</span>
                          <span className="text-white">Supabase Inc.</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-white/60">WireGuard:</span>
                          <span className="text-white">Jason A. Donenfeld</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-white/60">Tailwind CSS:</span>
                          <span className="text-white">Tailwind Labs</span>
                        </div>
                      </div>
                    </div>
                  </div>
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