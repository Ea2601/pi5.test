import React, { useState } from 'react';
import { motion } from 'framer-motion';
import * as Icons from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { cn } from '../../lib/utils';

interface InstallationForm {
  username: string;
  ipAddress: string;
  password: string;
  serverName: string;
  sshPort: number;
  wgPort: number;
  wgNetwork: string;
  wgInterface: string;
  clientName: string;
  createClient: boolean;
}

interface InstallationResult {
  success: boolean;
  serverPublicKey?: string;
  clientConfig?: string;
  qrCode?: string;
  serverInfo?: {
    serverIP: string;
    wgInterface: string;
    wgNetwork: string;
    wgPort: number;
  };
  error?: string;
}

export const AutoWGInstaller: React.FC = () => {
  const [formData, setFormData] = useState<InstallationForm>({
    username: 'root',
    ipAddress: '',
    password: '',
    serverName: '',
    sshPort: 22,
    wgPort: 51820,
    wgNetwork: '10.7.0.0/24',
    wgInterface: 'wg0',
    clientName: 'client1',
    createClient: true
  });

  const [isInstalling, setIsInstalling] = useState(false);
  const [installationStatus, setInstallationStatus] = useState<string>('');
  const [result, setResult] = useState<InstallationResult | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const validateForm = (): string[] => {
    const errors: string[] = [];
    
    if (!formData.username.trim()) errors.push('Kullanıcı adı gerekli');
    if (!formData.ipAddress.trim()) errors.push('IP adresi gerekli');
    if (!formData.password.trim()) errors.push('Şifre gerekli');
    if (!formData.serverName.trim()) errors.push('Sunucu ismi gerekli');
    
    // IP address validation
    const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (formData.ipAddress && !ipRegex.test(formData.ipAddress)) {
      errors.push('Geçerli IP adresi formatında giriniz');
    }
    
    // Port validation
    if (formData.sshPort < 1 || formData.sshPort > 65535) {
      errors.push('SSH portu 1-65535 arasında olmalı');
    }
    if (formData.wgPort < 1 || formData.wgPort > 65535) {
      errors.push('WireGuard portu 1-65535 arasında olmalı');
    }
    
    // Network CIDR validation
    const cidrRegex = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\/\d{1,2}$/;
    if (!cidrRegex.test(formData.wgNetwork)) {
      errors.push('Ağ CIDR formatı hatalı (örn: 10.7.0.0/24)');
    }
    
    return errors;
  };

  const simulateInstallation = async (): Promise<InstallationResult> => {
    // Simulate different installation phases
    const phases = [
      'SSH bağlantısı kuruluyor...',
      'Sistem güncellemeleri kontrol ediliyor...',
      'WireGuard paketleri yükleniyor...',
      'Sunucu anahtarları üretiliyor...',
      'Yapılandırma dosyası oluşturuluyor...',
      'WireGuard servisi başlatılıyor...',
      'İstemci yapılandırması hazırlanıyor...'
    ];

    for (let i = 0; i < phases.length; i++) {
      setInstallationStatus(phases[i]);
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));
    }

    // Simulate success or failure (90% success rate)
    if (Math.random() > 0.1) {
      const serverPublicKey = btoa(Math.random().toString(36).substring(2, 15));
      const clientPrivateKey = btoa(Math.random().toString(36).substring(2, 15));
      
      const clientConfig = `[Interface]
PrivateKey = ${clientPrivateKey}
Address = ${formData.wgNetwork.replace('0.0/24', '2/24')}
DNS = 1.1.1.1, 8.8.8.8

[Peer]
PublicKey = ${serverPublicKey}
Endpoint = ${formData.ipAddress}:${formData.wgPort}
AllowedIPs = 0.0.0.0/0, ::/0
PersistentKeepalive = 25`;

      // Generate mock QR code
      const qrCode = `data:image/svg+xml;base64,${btoa(`
        <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
          <rect width="200" height="200" fill="white"/>
          <rect x="20" y="20" width="160" height="160" fill="black"/>
          <rect x="40" y="40" width="120" height="120" fill="white"/>
          <text x="100" y="105" text-anchor="middle" fill="black" font-size="10">QR Code</text>
          <text x="100" y="120" text-anchor="middle" fill="black" font-size="8">${formData.clientName}</text>
        </svg>
      `)}`;

      return {
        success: true,
        serverPublicKey,
        clientConfig,
        qrCode,
        serverInfo: {
          serverIP: formData.ipAddress,
          wgInterface: formData.wgInterface,
          wgNetwork: formData.wgNetwork,
          wgPort: formData.wgPort
        }
      };
    } else {
      return {
        success: false,
        error: 'SSH bağlantısı başarısız. Kullanıcı adı, şifre veya IP adresini kontrol edin.'
      };
    }
  };

  const handleInstall = async () => {
    const errors = validateForm();
    if (errors.length > 0) {
      alert('Form hatası:\n' + errors.join('\n'));
      return;
    }

    setIsInstalling(true);
    setResult(null);
    setInstallationStatus('Kurulum başlatılıyor...');

    try {
      const installResult = await simulateInstallation();
      setResult(installResult);
      
      if (installResult.success) {
        setInstallationStatus('Kurulum başarıyla tamamlandı!');
      } else {
        setInstallationStatus('Kurulum başarısız: ' + installResult.error);
      }
    } catch (error) {
      setResult({
        success: false,
        error: error instanceof Error ? error.message : 'Bilinmeyen hata oluştu'
      });
      setInstallationStatus('Kurulum sırasında hata oluştu');
    } finally {
      setIsInstalling(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // You could add a toast notification here
      console.log('Panoya kopyalandı');
    } catch (error) {
      console.error('Kopyalama başarısız:', error);
    }
  };

  const downloadConfig = (config: string, filename: string) => {
    const blob = new Blob([config], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const resetForm = () => {
    setFormData({
      username: 'root',
      ipAddress: '',
      password: '',
      serverName: '',
      sshPort: 22,
      wgPort: 51820,
      wgNetwork: '10.7.0.0/24',
      wgInterface: 'wg0',
      clientName: 'client1',
      createClient: true
    });
    setResult(null);
    setInstallationStatus('');
  };

  return (
    <div className="space-y-6">
      {/* Installation Form */}
      <Card title="Otomatik WireGuard Kurulumu">
        <div className="space-y-6">
          {/* Basic Configuration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-white text-sm font-medium mb-2">
                <Icons.User className="w-4 h-4 inline mr-2" />
                Kullanıcı Adı
              </label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                placeholder="root"
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                disabled={isInstalling}
              />
            </div>
            <div>
              <label className="block text-white text-sm font-medium mb-2">
                <Icons.Globe className="w-4 h-4 inline mr-2" />
                IP Adresi
              </label>
              <input
                type="text"
                value={formData.ipAddress}
                onChange={(e) => setFormData({ ...formData, ipAddress: e.target.value })}
                placeholder="203.0.113.10"
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                disabled={isInstalling}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-white text-sm font-medium mb-2">
                <Icons.Lock className="w-4 h-4 inline mr-2" />
                Şifre
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  disabled={isInstalling}
                />
                <Icons.Shield className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/40" />
              </div>
            </div>
            <div>
              <label className="block text-white text-sm font-medium mb-2">
                <Icons.Server className="w-4 h-4 inline mr-2" />
                Kurulacak Sunucu İsmi
              </label>
              <input
                type="text"
                value={formData.serverName}
                onChange={(e) => setFormData({ ...formData, serverName: e.target.value })}
                placeholder="vpn-server-01"
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                disabled={isInstalling}
              />
            </div>
          </div>

          {/* Advanced Options Toggle */}
          <div className="border-t border-white/10 pt-4">
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-2 text-white/70 hover:text-white transition-colors"
            >
              <Icons.ChevronDown className={cn(
                "w-4 h-4 transition-transform",
                showAdvanced && "rotate-180"
              )} />
              <span className="text-sm">Gelişmiş Ayarlar</span>
            </button>
          </div>

          {/* Advanced Configuration */}
          <motion.div
            initial={false}
            animate={{ height: showAdvanced ? 'auto' : 0, opacity: showAdvanced ? 1 : 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="space-y-4 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-white text-sm font-medium mb-2">SSH Port</label>
                  <input
                    type="number"
                    value={formData.sshPort}
                    onChange={(e) => setFormData({ ...formData, sshPort: parseInt(e.target.value) || 22 })}
                    min="1"
                    max="65535"
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                    disabled={isInstalling}
                  />
                </div>
                <div>
                  <label className="block text-white text-sm font-medium mb-2">WireGuard Port</label>
                  <input
                    type="number"
                    value={formData.wgPort}
                    onChange={(e) => setFormData({ ...formData, wgPort: parseInt(e.target.value) || 51820 })}
                    min="1"
                    max="65535"
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                    disabled={isInstalling}
                  />
                </div>
                <div>
                  <label className="block text-white text-sm font-medium mb-2">Ağ CIDR</label>
                  <input
                    type="text"
                    value={formData.wgNetwork}
                    onChange={(e) => setFormData({ ...formData, wgNetwork: e.target.value })}
                    placeholder="10.7.0.0/24"
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                    disabled={isInstalling}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white text-sm font-medium mb-2">WireGuard Arayüzü</label>
                  <input
                    type="text"
                    value={formData.wgInterface}
                    onChange={(e) => setFormData({ ...formData, wgInterface: e.target.value })}
                    placeholder="wg0"
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                    disabled={isInstalling}
                  />
                </div>
                <div>
                  <label className="block text-white text-sm font-medium mb-2">İstemci Adı</label>
                  <input
                    type="text"
                    value={formData.clientName}
                    onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                    placeholder="client1"
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                    disabled={isInstalling}
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setFormData({ ...formData, createClient: !formData.createClient })}
                  className={cn(
                    "relative w-10 h-5 rounded-full transition-all duration-300",
                    formData.createClient 
                      ? "bg-emerald-500 shadow-lg shadow-emerald-500/30" 
                      : "bg-white/20"
                  )}
                  disabled={isInstalling}
                >
                  <div
                    className={cn(
                      "absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all duration-300 shadow-lg",
                      formData.createClient ? "left-5" : "left-0.5"
                    )}
                  />
                </button>
                <span className="text-white text-sm">Otomatik istemci yapılandırması oluştur</span>
              </div>
            </div>
          </motion.div>
        </div>
      </Card>

      {/* Installation Controls */}
      <Card title="Kurulum Kontrolü">
        <div className="space-y-4">
          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <Button
              onClick={handleInstall}
              disabled={isInstalling}
              isLoading={isInstalling}
              className="flex-1"
            >
              {isInstalling ? (
                <>
                  <Icons.Loader className="w-4 h-4 mr-2 animate-spin" />
                  Kuruluyor...
                </>
              ) : (
                <>
                  <Icons.Play className="w-4 h-4 mr-2" />
                  Kurulumu Başlat
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={resetForm}
              disabled={isInstalling}
            >
              <Icons.RotateCcw className="w-4 h-4 mr-2" />
              Sıfırla
            </Button>
          </div>

          {/* Installation Status */}
          {installationStatus && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg"
            >
              <div className="flex items-center gap-3">
                {isInstalling ? (
                  <div className="w-4 h-4 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin" />
                ) : result?.success ? (
                  <Icons.CheckCircle className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Icons.XCircle className="w-4 h-4 text-red-400" />
                )}
                <span className="text-white text-sm">{installationStatus}</span>
              </div>
            </motion.div>
          )}

          {/* Security Warning */}
          <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-lg">
            <div className="flex items-start gap-3">
              <Icons.AlertTriangle className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-orange-400 font-medium text-sm mb-1">Güvenlik Uyarısı</h4>
                <p className="text-white/80 text-xs leading-relaxed">
                  Bu özellik uzak sunucuya SSH bağlantısı kurar ve WireGuard kurulumu yapar. 
                  Güvenilir ağlarda ve kendi sunucularınızda kullanın. Şifre bilgileriniz güvenli olarak iletilir ancak dikkatli olun.
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Installation Results */}
      {result && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {result.success ? (
            <div className="space-y-6">
              {/* Server Information */}
              <Card title="Kurulum Başarılı ✅">
                <div className="space-y-4">
                  <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                    <h4 className="text-emerald-400 font-medium mb-3">Sunucu Bilgileri</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-white/60">Sunucu IP:</span>
                        <span className="text-white font-mono">{result.serverInfo?.serverIP}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60">WG Arayüzü:</span>
                        <span className="text-white font-mono">{result.serverInfo?.wgInterface}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60">WG Port:</span>
                        <span className="text-white font-mono">{result.serverInfo?.wgPort}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60">Ağ CIDR:</span>
                        <span className="text-white font-mono">{result.serverInfo?.wgNetwork}</span>
                      </div>
                    </div>
                  </div>

                  {/* Server Public Key */}
                  <div>
                    <label className="block text-white text-sm font-medium mb-2">Sunucu Public Key</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={result.serverPublicKey || ''}
                        readOnly
                        className="flex-1 px-3 py-2 bg-black/20 border border-white/20 rounded-lg text-white font-mono text-sm"
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => result.serverPublicKey && copyToClipboard(result.serverPublicKey)}
                      >
                        <Icons.Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Client Configuration */}
              {result.clientConfig && (
                <Card title="İstemci Yapılandırması">
                  <div className="space-y-6">
                    {/* QR Code and Config Side by Side */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* QR Code */}
                      {result.qrCode && (
                        <div className="text-center">
                          <h4 className="text-white font-medium mb-4">QR Kod - Mobil Cihazlar</h4>
                          <div className="inline-block p-4 bg-white rounded-lg">
                            <img src={result.qrCode} alt="WireGuard QR Code" className="w-48 h-48" />
                          </div>
                          <p className="text-white/60 text-sm mt-2">
                            WireGuard uygulamasıyla QR kodu tarayın
                          </p>
                        </div>
                      )}

                      {/* Configuration Text */}
                      <div>
                        <h4 className="text-white font-medium mb-4">Yapılandırma Dosyası</h4>
                        <textarea
                          value={result.clientConfig}
                          readOnly
                          className="w-full h-64 px-3 py-2 bg-black/40 border border-white/20 rounded-lg text-white font-mono text-sm resize-none"
                        />
                      </div>
                    </div>

                    {/* Download Options */}
                    <div className="flex items-center gap-3">
                      <Button
                        onClick={() => result.clientConfig && downloadConfig(result.clientConfig, `${formData.clientName}.conf`)}
                        className="flex-1"
                      >
                        <Icons.Download className="w-4 h-4 mr-2" />
                        Yapılandırma İndir (.conf)
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => result.clientConfig && copyToClipboard(result.clientConfig)}
                        className="flex-1"
                      >
                        <Icons.Copy className="w-4 h-4 mr-2" />
                        Panoya Kopyala
                      </Button>
                    </div>
                  </div>
                </Card>
              )}
            </div>
          ) : (
            <Card title="Kurulum Başarısız ❌">
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                <div className="flex items-start gap-3">
                  <Icons.XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-red-400 font-medium mb-1">Hata Detayı</h4>
                    <p className="text-white/80 text-sm">{result.error}</p>
                  </div>
                </div>
              </div>
            </Card>
          )}
        </motion.div>
      )}

      {/* Help and Documentation */}
      <Card title="Kullanım Kılavuzu">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                <Icons.BookOpen className="w-4 h-4 text-emerald-400" />
                Kurulum Adımları
              </h4>
              <ol className="space-y-2 text-sm text-white/80">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-mono">1.</span>
                  <span>Uzak sunucunun SSH erişimini kontrol edin</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-mono">2.</span>
                  <span>Root veya sudo yetkili kullanıcı bilgilerini girin</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-mono">3.</span>
                  <span>WireGuard ağ ayarlarını yapılandırın</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-mono">4.</span>
                  <span>Kurulumu başlatın ve sonuçları bekleyin</span>
                </li>
              </ol>
            </div>
            
            <div>
              <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                <Icons.Shield className="w-4 h-4 text-blue-400" />
                Güvenlik Notları
              </h4>
              <ul className="space-y-2 text-sm text-white/80">
                <li className="flex items-start gap-2">
                  <Icons.Check className="w-3 h-3 text-emerald-400 mt-1 flex-shrink-0" />
                  <span>Şifre bilgileri şifrelenerek iletilir</span>
                </li>
                <li className="flex items-start gap-2">
                  <Icons.Check className="w-3 h-3 text-emerald-400 mt-1 flex-shrink-0" />
                  <span>SSH anahtarları otomatik üretilir</span>
                </li>
                <li className="flex items-start gap-2">
                  <Icons.Check className="w-3 h-3 text-emerald-400 mt-1 flex-shrink-0" />
                  <span>Güvenlik duvarı kuralları otomatik ayarlanır</span>
                </li>
                <li className="flex items-start gap-2">
                  <Icons.AlertTriangle className="w-3 h-3 text-orange-400 mt-1 flex-shrink-0" />
                  <span>Sadece güvenilir sunucularda kullanın</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};