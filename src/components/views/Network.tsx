import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wifi, Network as NetworkIcon, Globe, Zap, Settings } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { cn } from '../../lib/utils';
import { SEOMeta } from '../SEO/SEOMeta';
import { TrafficRuleManager } from '../traffic/TrafficRuleManager';

interface TabConfig {
  id: string;
  label: string;
  icon: React.ElementType;
}

const tabs: TabConfig[] = [
  { id: 'dns', label: 'DNS', icon: Globe },
  { id: 'dhcp', label: 'DHCP', icon: NetworkIcon },
  { id: 'topology', label: 'Ağ Topolojisi', icon: NetworkIcon },
  { id: 'wifi', label: 'Wi-Fi', icon: Wifi },
  { id: 'traffic', label: 'Trafik Kuralları', icon: Zap },
  { id: 'settings', label: 'Ayarlar', icon: Settings }
];

const Network: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dns');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dns':
        return (
          <Card title="DNS Yönetimi">
            <div className="space-y-4">
              <p className="text-white/70">DNS ayarları yakında eklenecek...</p>
              <Button variant="outline" className="w-full">
                <Globe className="w-4 h-4 mr-2" />
                DNS Yapılandırması
              </Button>
            </div>
          </Card>
        );
      case 'dhcp':
        return (
          <Card title="DHCP Yönetimi">
            <div className="space-y-4">
              <p className="text-white/70">DHCP ayarları yakında eklenecek...</p>
              <Button variant="outline" className="w-full">
                <NetworkIcon className="w-4 h-4 mr-2" />
                DHCP Yapılandırması
              </Button>
            </div>
          </Card>
        );
      case 'topology':
        return (
          <Card title="Ağ Topolojisi">
            <div className="space-y-4">
              <p className="text-white/70">Ağ topolojisi görünümü yakında eklenecek...</p>
              <Button variant="outline" className="w-full">
                <NetworkIcon className="w-4 h-4 mr-2" />
                Topoloji Görünümü
              </Button>
            </div>
          </Card>
        );
      case 'wifi':
        return (
          <Card title="Wi-Fi Yönetimi">
            <div className="space-y-4">
              <p className="text-white/70">Wi-Fi ayarları yakında eklenecek...</p>
              <Button variant="outline" className="w-full">
                <Wifi className="w-4 h-4 mr-2" />
                Wi-Fi Yapılandırması
              </Button>
            </div>
          </Card>
        );
      case 'traffic':
        return <TrafficRuleManager />;
      case 'settings':
        return (
          <Card title="Ağ Ayarları">
            <div className="space-y-4">
              <p className="text-white/70">Ağ ayarları yakında eklenecek...</p>
              <Button variant="outline" className="w-full">
                <Settings className="w-4 h-4 mr-2" />
                Genel Ayarlar
              </Button>
            </div>
          </Card>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <SEOMeta
        title="Ağ Yönetimi"
        description="DNS, DHCP, Wi-Fi ve trafik kuralları yönetimi"
      />
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Ağ Yönetimi</h1>
          <p className="text-white/70 mt-1">DNS, DHCP, Wi-Fi ve trafik kuralları</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-white/5 p-1 rounded-2xl backdrop-blur-sm border border-white/10 overflow-x-auto">
        {tabs.map((tab) => {
          const IconComponent = tab.icon;
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
          {renderTabContent()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default Network;