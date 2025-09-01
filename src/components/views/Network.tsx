import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as Icons from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { cn } from '../../lib/utils';
import { SEOMeta } from '../SEO/SEOMeta';
import { TrafficRuleManager } from '../traffic/TrafficRuleManager';
import DNSManagement from '../dns/DNSManagement';
import DHCPManagement from '../dhcp/DHCPManagement';
import NetworkTopology from '../topology/NetworkTopology';
import WiFiManagement from '../wifi/WiFiManagement';
import SpeedTestManagement from '../speedTest/SpeedTestManagement';

interface TabConfig {
  id: string;
  label: string;
  icon: React.ElementType;
}

const tabs: TabConfig[] = [
  { id: 'dns', label: 'DNS', icon: Icons.Globe },
  { id: 'dhcp', label: 'DHCP', icon: Icons.Network },
  { id: 'topology', label: 'Ağ Topolojisi', icon: Icons.Network },
  { id: 'wifi', label: 'Wi-Fi', icon: Icons.Wifi },
  { id: 'speed-test', label: 'Hız Testi', icon: Icons.Gauge },
  { id: 'traffic', label: 'Trafik Kuralları', icon: Icons.Zap },
  { id: 'settings', label: 'Ayarlar', icon: Icons.Settings }
];

const Network: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dns');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dns':
        return <DNSManagement />;
      case 'dhcp':
        return <DHCPManagement />;
      case 'topology':
        return <NetworkTopology />;
      case 'wifi':
        return <WiFiManagement />;
      case 'speed-test':
        return <SpeedTestManagement />;
      case 'traffic':
        return <TrafficRuleManager />;
      case 'settings':
        return (
          <Card title="Ağ Ayarları">
            <div className="space-y-4">
              <p className="text-white/70">Ağ ayarları yakında eklenecek...</p>
              <Button variant="outline" className="w-full">
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" 
                       width="24" height="24" viewBox="0 0 24 24" 
                       fill="none" stroke="currentColor" strokeWidth="2" 
                       strokeLinecap="round" strokeLinejoin="round" 
                       className="lucide lucide-settings w-4 h-4 mr-2">
                    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                  <span className="truncate">Genel Ayarlar</span>
                </div>
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