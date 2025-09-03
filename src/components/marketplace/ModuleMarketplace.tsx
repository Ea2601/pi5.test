/**
 * Module Marketplace UI
 * Browse, download, and manage modules
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as Icons from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { cn } from '../../lib/utils';
import { moduleMarketplace, MarketplaceModule, InstallationProgress } from '../../core/ModuleMarketplace';
import { moduleManager } from '../../core/ModuleManager';

export const ModuleMarketplace: React.FC = () => {
  const [modules, setModules] = useState<MarketplaceModule[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedModule, setSelectedModule] = useState<MarketplaceModule | null>(null);
  const [installationProgress, setInstallationProgress] = useState<Record<string, InstallationProgress>>({});
  const [isLoading, setIsLoading] = useState(true);

  const categories = ['all', 'network', 'security', 'automation', 'monitoring', 'storage', 'media', 'iot'];

  useEffect(() => {
    loadMarketplaceModules();
  }, []);

  const loadMarketplaceModules = async () => {
    try {
      const availableModules = await moduleMarketplace.discoverModules();
      setModules(availableModules);
      setIsLoading(false);
    } catch (error) {
      console.error('Failed to load marketplace modules:', error);
      setIsLoading(false);
    }
  };

  const filteredModules = modules.filter(module => {
    const matchesSearch = module.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         module.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || module.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const handleInstallModule = async (moduleId: string) => {
    try {
      await moduleMarketplace.downloadAndInstallModule(
        moduleId,
        (progress) => {
          setInstallationProgress(prev => ({
            ...prev,
            [moduleId]: progress
          }));
        }
      );
      
      // Refresh installed modules
      await loadMarketplaceModules();
    } catch (error) {
      console.error('Module installation failed:', error);
    }
  };

  const isModuleInstalled = (moduleId: string): boolean => {
    return !!moduleManager.getModule(moduleId);
  };

  const getModuleStatus = (moduleId: string): string => {
    const progress = installationProgress[moduleId];
    if (progress) {
      return progress.status;
    }
    
    return isModuleInstalled(moduleId) ? 'installed' : 'available';
  };

  const ModuleCard: React.FC<{ module: MarketplaceModule }> = ({ module }) => {
    const status = getModuleStatus(module.id);
    const progress = installationProgress[module.id];
    
    return (
      <Card className="h-full cursor-pointer" onClick={() => setSelectedModule(module)}>
        <div className="space-y-4">
          {/* Module Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-blue-500/20 border border-emerald-500/30 flex items-center justify-center">
                <Icons.Package className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <h4 className="text-white font-semibold text-lg">{module.name}</h4>
                <div className="flex items-center gap-2">
                  <span className="text-emerald-400 text-sm">v{module.version}</span>
                  {module.verified && (
                    <div className="flex items-center gap-1">
                      <Icons.ShieldCheck className="w-3 h-3 text-blue-400" />
                      <span className="text-blue-400 text-xs">Verified</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className={cn(
              "px-2 py-1 rounded-full text-xs border",
              status === 'installed' ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" :
              status === 'downloading' || status === 'installing' ? "bg-blue-500/20 text-blue-400 border-blue-500/30" :
              "bg-gray-500/20 text-gray-400 border-gray-500/30"
            )}>
              {status === 'installed' ? 'Yüklü' :
               status === 'downloading' ? 'İndiriliyor' :
               status === 'installing' ? 'Kuruluyor' :
               'Mevcut'}
            </div>
          </div>

          {/* Module Description */}
          <p className="text-white/70 text-sm line-clamp-3">{module.description}</p>

          {/* Module Stats */}
          <div className="flex items-center justify-between text-xs text-white/60">
            <div className="flex items-center gap-2">
              <Icons.Download className="w-3 h-3" />
              <span>{module.downloads.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-2">
              <Icons.Star className="w-3 h-3 text-yellow-400" />
              <span>{module.rating.toFixed(1)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Icons.HardDrive className="w-3 h-3" />
              <span>{(module.size / 1024 / 1024).toFixed(1)} MB</span>
            </div>
          </div>

          {/* Installation Progress */}
          {progress && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-2"
            >
              <div className="flex items-center justify-between text-sm">
                <span className="text-white/70">{progress.message}</span>
                <span className="text-white">{progress.progress}%</span>
              </div>
              <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-emerald-400 to-blue-400 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress.progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </motion.div>
          )}

          {/* Action Button */}
          <div className="pt-3 border-t border-white/10">
            {status === 'installed' ? (
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" className="flex-1">
                  <Icons.Settings className="w-3 h-3 mr-1" />
                  Yapılandır
                </Button>
                <Button size="sm" variant="destructive">
                  <Icons.Trash2 className="w-3 h-3" />
                </Button>
              </div>
            ) : status === 'downloading' || status === 'installing' ? (
              <Button size="sm" disabled className="w-full">
                <Icons.Loader className="w-3 h-3 mr-2 animate-spin" />
                {status === 'downloading' ? 'İndiriliyor...' : 'Kuruluyor...'}
              </Button>
            ) : (
              <Button 
                size="sm" 
                onClick={(e) => {
                  e.stopPropagation();
                  handleInstallModule(module.id);
                }} 
                className="w-full"
              >
                <Icons.Download className="w-3 h-3 mr-2" />
                Yükle
              </Button>
            )}
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
          <h1 className="text-2xl font-bold text-white">Module Marketplace</h1>
          <p className="text-white/70 mt-1">Ek modülleri keşfedin ve sisteminizi genişletin</p>
        </div>
        <Button onClick={loadMarketplaceModules}>
          <Icons.RefreshCw className="w-4 h-4 mr-2" />
          Yenile
        </Button>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Icons.Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/40" />
          <input
            type="text"
            placeholder="Modül ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
          />
        </div>
        
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
        >
          {categories.map(cat => (
            <option key={cat} value={cat} className="bg-gray-800">
              {cat === 'all' ? 'Tüm Kategoriler' : cat.charAt(0).toUpperCase() + cat.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {/* Module Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center h-96">
          <div className="w-8 h-8 border-2 border-white/30 border-t-emerald-400 rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredModules.map((module) => (
            <ModuleCard key={module.id} module={module} />
          ))}
        </div>
      )}

      {/* Module Detail Modal */}
      {selectedModule && (
        <Modal
          isOpen={!!selectedModule}
          onClose={() => setSelectedModule(null)}
          title={selectedModule.name}
          size="xl"
        >
          <div className="space-y-6">
            {/* Module Header */}
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-blue-500/20 border border-emerald-500/30 flex items-center justify-center flex-shrink-0">
                <Icons.Package className="w-8 h-8 text-emerald-400" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-2xl font-bold text-white">{selectedModule.name}</h3>
                  <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-sm border border-emerald-500/30">
                    v{selectedModule.version}
                  </span>
                  {selectedModule.verified && (
                    <div className="flex items-center gap-1">
                      <Icons.ShieldCheck className="w-4 h-4 text-blue-400" />
                      <span className="text-blue-400 text-sm">Doğrulanmış</span>
                    </div>
                  )}
                </div>
                <p className="text-white/70">{selectedModule.description}</p>
                <div className="flex items-center gap-4 mt-3 text-sm text-white/60">
                  <span>Yazar: {selectedModule.author}</span>
                  <span>•</span>
                  <span>{selectedModule.downloads.toLocaleString()} indirme</span>
                  <span>•</span>
                  <span>{(selectedModule.size / 1024 / 1024).toFixed(1)} MB</span>
                </div>
              </div>
            </div>

            {/* Module Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h4 className="text-white font-semibold mb-2">Özellikler</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Icons.Check className="w-4 h-4 text-emerald-400" />
                      <span className="text-white/80">Plug-and-play kurulum</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Icons.Check className="w-4 h-4 text-emerald-400" />
                      <span className="text-white/80">Pi5 için optimize edilmiş</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Icons.Check className="w-4 h-4 text-emerald-400" />
                      <span className="text-white/80">Otomatik güncelleme desteği</span>
                    </div>
                  </div>
                </div>

                {selectedModule.dependencies.length > 0 && (
                  <div>
                    <h4 className="text-white font-semibold mb-2">Bağımlılıklar</h4>
                    <div className="space-y-1">
                      {selectedModule.dependencies.map(dep => (
                        <div key={dep} className="flex items-center gap-2">
                          <Icons.ArrowRight className="w-3 h-3 text-white/40" />
                          <span className="text-white/70 text-sm">{dep}</span>
                          {moduleManager.getModule(dep) ? (
                            <Icons.Check className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <Icons.AlertCircle className="w-3 h-3 text-orange-400" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="text-white font-semibold mb-2">Uyumluluk</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-white/60">Minimum Sürüm:</span>
                      <span className="text-white">{selectedModule.compatibility.minVersion}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Platform:</span>
                      <span className="text-white">{selectedModule.compatibility.platforms.join(', ')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Son Güncelleme:</span>
                      <span className="text-white">
                        {new Date(selectedModule.lastUpdated).toLocaleDateString('tr-TR')}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-white font-semibold mb-2">Değerlendirme</h4>
                  <div className="flex items-center gap-2">
                    <div className="flex">
                      {Array.from({ length: 5 }, (_, i) => (
                        <Icons.Star
                          key={i}
                          className={cn(
                            "w-4 h-4",
                            i < Math.floor(selectedModule.rating) ? "text-yellow-400 fill-current" : "text-white/20"
                          )}
                        />
                      ))}
                    </div>
                    <span className="text-white font-medium">{selectedModule.rating.toFixed(1)}</span>
                    <span className="text-white/60 text-sm">({selectedModule.downloads} değerlendirme)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Installation Progress */}
            {installationProgress[selectedModule.id] && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl"
              >
                <div className="flex items-center gap-3 mb-3">
                  <Icons.Download className="w-5 h-5 text-blue-400" />
                  <div>
                    <h4 className="text-white font-medium">{installationProgress[selectedModule.id].message}</h4>
                    <p className="text-white/60 text-sm">Module yükleniyor...</p>
                  </div>
                </div>
                <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-blue-400 to-emerald-400 rounded-full"
                    style={{ width: `${installationProgress[selectedModule.id].progress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </motion.div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-3">
              {isModuleInstalled(selectedModule.id) ? (
                <>
                  <Button variant="outline" className="flex-1">
                    <Icons.Settings className="w-4 h-4 mr-2" />
                    Yapılandır
                  </Button>
                  <Button variant="destructive" className="flex-1">
                    <Icons.Trash2 className="w-4 h-4 mr-2" />
                    Kaldır
                  </Button>
                </>
              ) : (
                <Button 
                  onClick={() => handleInstallModule(selectedModule.id)}
                  disabled={!!installationProgress[selectedModule.id]}
                  className="flex-1"
                >
                  <Icons.Download className="w-4 h-4 mr-2" />
                  Yükle
                </Button>
              )}
              <Button variant="outline">
                <Icons.ExternalLink className="w-4 h-4 mr-2" />
                GitHub
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};</parameter>