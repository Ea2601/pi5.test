/**
 * Automated Installation Wizard
 * Zero-configuration setup interface for Pi5 Supernode
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as Icons from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { cn } from '../../lib/utils';
import { autoInstaller, InstallationConfig, InstallationStep } from '../../core/AutoInstaller';

export const AutoInstallWizard: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [installationSteps, setInstallationSteps] = useState<InstallationStep[]>([]);
  const [isInstalling, setIsInstalling] = useState(false);
  const [installationComplete, setInstallationComplete] = useState(false);
  
  const [config, setConfig] = useState<InstallationConfig>({
    platform: 'pi5',
    modules: ['device-management', 'network-management', 'vpn-management'],
    databaseConfig: {
      type: 'supabase',
      autoSetup: true
    },
    networkConfig: {
      hostname: 'pi5-supernode',
      timezone: 'Europe/Istanbul'
    },
    securityConfig: {
      generateCerts: true,
      enableFirewall: true,
      sshConfig: true
    }
  });

  const wizardSteps = [
    {
      id: 'platform',
      title: 'Platform Seçimi',
      description: 'Hedef platform ve donanım yapılandırması'
    },
    {
      id: 'modules',
      title: 'Modül Seçimi', 
      description: 'Kurulacak modülleri seçin'
    },
    {
      id: 'database',
      title: 'Database Yapılandırması',
      description: 'Veritabanı bağlantısı ve ayarları'
    },
    {
      id: 'network',
      title: 'Ağ Ayarları',
      description: 'Hostname, IP ve ağ yapılandırması'
    },
    {
      id: 'security',
      title: 'Güvenlik Yapılandırması',
      description: 'SSL, firewall ve güvenlik ayarları'
    },
    {
      id: 'installation',
      title: 'Kurulum',
      description: 'Otomatik kurulum sürecini başlatın'
    }
  ];

  useEffect(() => {
    // Listen for installation progress
    const handleProgress = (event: CustomEvent<InstallationStep>) => {
      setInstallationSteps(prev => {
        const updated = [...prev];
        const existingIndex = updated.findIndex(s => s.id === event.detail.id);
        
        if (existingIndex >= 0) {
          updated[existingIndex] = event.detail;
        } else {
          updated.push(event.detail);
        }
        
        return updated;
      });
    };

    window.addEventListener('installationProgress' as any, handleProgress);
    return () => window.removeEventListener('installationProgress' as any, handleProgress);
  }, []);

  const handleStartInstallation = async () => {
    setIsInstalling(true);
    setInstallationSteps([]);

    try {
      await autoInstaller.startInstallation(config);
      setInstallationComplete(true);
    } catch (error) {
      console.error('Installation failed:', error);
    } finally {
      setIsInstalling(false);
    }
  };

  const handleNext = () => {
    if (currentStep < wizardSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStepContent = () => {
    const step = wizardSteps[currentStep];

    switch (step.id) {
      case 'platform':
        return (
          <div className="space-y-4">
            <h3 className="text-white font-semibold mb-4">Platform Seçimi</h3>
            <div className="space-y-3">
              {[
                { value: 'pi5', label: 'Raspberry Pi 5', recommended: true, description: 'En iyi performans ve özellik desteği' },
                { value: 'generic-linux', label: 'Generic Linux', recommended: false, description: 'Genel Linux sistemler (Ubuntu, Debian)' },
                { value: 'development', label: 'Development', recommended: false, description: 'Geliştirme ve test ortamı' }
              ].map(platform => (
                <button
                  key={platform.value}
                  onClick={() => setConfig(prev => ({ ...prev, platform: platform.value as any }))}
                  className={cn(
                    "w-full p-4 rounded-xl border transition-all text-left",
                    config.platform === platform.value
                      ? "bg-emerald-500/20 border-emerald-500/30 text-white"
                      : "bg-white/5 border-white/10 text-white/80 hover:bg-white/10"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-3 h-3 rounded-full",
                      config.platform === platform.value ? "bg-emerald-400" : "bg-white/30"
                    )} />
                    <div>
                      <h4 className="font-medium">{platform.label}</h4>
                      {platform.recommended && (
                        <span className="inline-block px-2 py-1 bg-emerald-500/20 text-emerald-400 text-xs rounded mt-1">
                          Önerilen
                        </span>
                      )}
                      <p className="text-sm text-white/60 mt-1">{platform.description}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        );

      case 'modules':
        return (
          <div className="space-y-4">
            <h3 className="text-white font-semibold mb-4">Kurulacak Modüller</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                { id: 'device-management', name: 'Device Management', essential: true },
                { id: 'network-management', name: 'Network Management', essential: true },
                { id: 'vpn-management', name: 'VPN Management', essential: false },
                { id: 'automation-engine', name: 'Automation Engine', essential: false },
                { id: 'storage-management', name: 'Storage Management', essential: false },
                { id: 'monitoring-dashboard', name: 'Monitoring Dashboard', essential: false }
              ].map(module => (
                <div key={module.id} className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
                  <input
                    type="checkbox"
                    checked={config.modules.includes(module.id)}
                    onChange={(e) => {
                      setConfig(prev => ({
                        ...prev,
                        modules: e.target.checked
                          ? [...prev.modules, module.id]
                          : prev.modules.filter(m => m !== module.id)
                      }));
                    }}
                    className="w-4 h-4"
                    disabled={module.essential}
                  />
                  <div>
                    <span className="text-white">{module.name}</span>
                    {module.essential && (
                      <span className="ml-2 px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded">
                        Zorunlu
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'database':
        return (
          <div className="space-y-4">
            <h3 className="text-white font-semibold mb-4">Database Yapılandırması</h3>
            <div className="space-y-3">
              {[
                { value: 'supabase', label: 'Supabase Cloud', description: 'Managed PostgreSQL with real-time features (Önerilen)' },
                { value: 'postgresql', label: 'Local PostgreSQL', description: 'Pi5 üzerinde yerel PostgreSQL kurulumu' },
                { value: 'sqlite', label: 'SQLite', description: 'Hafif file-based database (Test için)' }
              ].map(db => (
                <button
                  key={db.value}
                  onClick={() => setConfig(prev => ({
                    ...prev,
                    databaseConfig: { ...prev.databaseConfig, type: db.value as any }
                  }))}
                  className={cn(
                    "w-full p-4 rounded-xl border transition-all text-left",
                    config.databaseConfig.type === db.value
                      ? "bg-emerald-500/20 border-emerald-500/30"
                      : "bg-white/5 border-white/10 hover:bg-white/10"
                  )}
                >
                  <h4 className="text-white font-medium">{db.label}</h4>
                  <p className="text-white/60 text-sm mt-1">{db.description}</p>
                </button>
              ))}
            </div>
          </div>
        );

      case 'network':
        return (
          <div className="space-y-4">
            <h3 className="text-white font-semibold mb-4">Ağ Yapılandırması</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-white text-sm font-medium mb-2">Hostname</label>
                <input
                  type="text"
                  value={config.networkConfig.hostname}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    networkConfig: { ...prev.networkConfig, hostname: e.target.value }
                  }))}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none"
                  placeholder="pi5-supernode"
                />
              </div>
              <div>
                <label className="block text-white text-sm font-medium mb-2">Static IP (isteğe bağlı)</label>
                <input
                  type="text"
                  value={config.networkConfig.staticIP || ''}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    networkConfig: { ...prev.networkConfig, staticIP: e.target.value }
                  }))}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none"
                  placeholder="192.168.1.100"
                />
              </div>
            </div>
          </div>
        );

      case 'security':
        return (
          <div className="space-y-4">
            <h3 className="text-white font-semibold mb-4">Güvenlik Yapılandırması</h3>
            <div className="space-y-3">
              {[
                { key: 'generateCerts', label: 'SSL Sertifikaları Oluştur' },
                { key: 'enableFirewall', label: 'Güvenlik Duvarını Etkinleştir' },
                { key: 'sshConfig', label: 'SSH Güvenlik Sertleştirmesi' }
              ].map(option => (
                <div key={option.key} className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
                  <input
                    type="checkbox"
                    checked={config.securityConfig[option.key as keyof typeof config.securityConfig]}
                    onChange={(e) => setConfig(prev => ({
                      ...prev,
                      securityConfig: {
                        ...prev.securityConfig,
                        [option.key]: e.target.checked
                      }
                    }))}
                    className="w-4 h-4"
                  />
                  <span className="text-white">{option.label}</span>
                </div>
              ))}
            </div>
          </div>
        );

      case 'installation':
        return (
          <div className="space-y-6">
            <h3 className="text-white font-semibold mb-4">Kurulum Hazır</h3>
            
            {/* Configuration Summary */}
            <div className="p-4 bg-white/5 rounded-lg border border-white/10">
              <h4 className="text-white font-medium mb-3">Kurulum Özeti</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-white/60">Platform:</span>
                  <span className="text-white ml-2">{config.platform}</span>
                </div>
                <div>
                  <span className="text-white/60">Modüller:</span>
                  <span className="text-white ml-2">{config.modules.length}</span>
                </div>
                <div>
                  <span className="text-white/60">Database:</span>
                  <span className="text-white ml-2">{config.databaseConfig.type}</span>
                </div>
                <div>
                  <span className="text-white/60">SSL:</span>
                  <span className="text-white ml-2">{config.securityConfig.generateCerts ? 'Etkin' : 'Devre Dışı'}</span>
                </div>
              </div>
            </div>

            {/* Installation Progress */}
            {isInstalling && (
              <div className="space-y-4">
                <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <div className="flex items-center gap-3 mb-3">
                    <Icons.Download className="w-5 h-5 text-blue-400" />
                    <div>
                      <h4 className="text-white font-medium">Otomatik Kurulum Devam Ediyor</h4>
                      <p className="text-white/60 text-sm">Lütfen işlem tamamlanana kadar bekleyin...</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  {installationSteps.map((step) => (
                    <motion.div
                      key={step.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center gap-3 p-3 rounded-lg bg-white/5"
                    >
                      <div className={cn(
                        "w-6 h-6 rounded-lg flex items-center justify-center",
                        step.status === 'completed' ? "bg-emerald-500/20 border border-emerald-500/30" :
                        step.status === 'running' ? "bg-blue-500/20 border border-blue-500/30" :
                        step.status === 'failed' ? "bg-red-500/20 border border-red-500/30" :
                        "bg-white/10"
                      )}>
                        {step.status === 'completed' ? (
                          <Icons.Check className="w-3 h-3 text-emerald-400" />
                        ) : step.status === 'running' ? (
                          <Icons.Loader className="w-3 h-3 text-blue-400 animate-spin" />
                        ) : step.status === 'failed' ? (
                          <Icons.X className="w-3 h-3 text-red-400" />
                        ) : (
                          <Icons.Clock className="w-3 h-3 text-white/40" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="text-white font-medium text-sm">{step.name}</h4>
                        <p className="text-white/60 text-xs">{step.description}</p>
                      </div>
                      {step.duration && (
                        <span className="text-white/40 text-xs">{step.duration}ms</span>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Installation Complete */}
            {installationComplete && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-center"
              >
                <Icons.CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
                <h3 className="text-white font-semibold text-xl mb-2">Kurulum Tamamlandı!</h3>
                <p className="text-white/70 mb-6">
                  Pi5 Supernode başarıyla kuruldu ve tüm modüller aktif durumda.
                </p>
                <Button onClick={onComplete} size="lg">
                  <Icons.Rocket className="w-5 h-5 mr-2" />
                  Sistemi Başlat
                </Button>
              </motion.div>
            )}
          </div>
        );

      default:
        return (
          <div className="text-center py-8">
            <Icons.Settings className="w-12 h-12 text-white/30 mx-auto mb-4" />
            <p className="text-white/60">Yapılandırma adımı hazırlanıyor...</p>
          </div>
        );
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Progress Indicator */}
      <div className="flex items-center justify-between mb-8">
        {wizardSteps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <div className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center transition-all",
              index <= currentStep 
                ? "bg-emerald-500/20 border border-emerald-500/30 text-emerald-400"
                : "bg-white/10 border border-white/20 text-white/40"
            )}>
              {index < currentStep ? (
                <Icons.Check className="w-4 h-4" />
              ) : (
                <span className="text-sm">{index + 1}</span>
              )}
            </div>
            {index < wizardSteps.length - 1 && (
              <div className={cn(
                "w-16 h-0.5 mx-2",
                index < currentStep ? "bg-emerald-400" : "bg-white/20"
              )} />
            )}
          </div>
        ))}
      </div>

      {/* Current Step Content */}
      <Card>
        <div className="p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderStepContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </Card>

      {/* Navigation */}
      {!isInstalling && !installationComplete && (
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 0}
          >
            <Icons.ChevronLeft className="w-4 h-4 mr-2" />
            Önceki
          </Button>

          {currentStep === wizardSteps.length - 1 ? (
            <Button
              onClick={handleStartInstallation}
              disabled={isInstalling}
            >
              <Icons.Download className="w-4 h-4 mr-2" />
              Kurulumu Başlat
            </Button>
          ) : (
            <Button onClick={handleNext}>
              Sonraki
              <Icons.ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      )}
    </div>
  );
};</parameter>