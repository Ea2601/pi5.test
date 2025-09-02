import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as Icons from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { cn } from '../../lib/utils';
import { SEOMeta } from '../SEO/SEOMeta';
import { ErrorBoundary, NetworkErrorFallback } from '../ui/ErrorBoundary';
import { TrafficRuleManager } from '../traffic/TrafficRuleManager';
import DNSManagement from '../dns/DNSManagement';
import DHCPManagement from '../dhcp/DHCPManagement';
import NetworkTopology from '../topology/NetworkTopology';
import WiFiManagement from '../wifi/WiFiManagement';
import SpeedTestManagement from '../speedTest/SpeedTestManagement';
import NetworkSettings from '../network/NetworkSettings';


const Network: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dns');

  const tabs = [
    { id: 'dns', label: 'DNS', icon: 'Globe' },
    { id: 'dhcp', label: 'DHCP', icon: 'Network' },
    { id: 'wifi', label: 'WiFi', icon: 'Wifi' },
    { id: 'settings', label: 'Ağ Ayarları', icon: 'Settings' },
    { id: 'traffic', label: 'Trafik Kuralları', icon: 'Shield' },
    { id: 'speedtest', label: 'Hız Testi', icon: 'Zap' },
    { id: 'topology', label: 'Ağ Topolojisi', icon: 'GitBranch' }
  ];
  const renderTabContent = () => {
    switch (activeTab) {
      case 'dns':
        return <DNSManagement />;
      case 'dhcp':
        return <DHCPManagement />;
      case 'wifi':
        return <WiFiManagement />;
      case 'settings':
        return <NetworkSettings />;
      case 'traffic':
        return <TrafficRuleManager />;
      case 'speedtest':
        return <SpeedTestManagement />;
      case 'topology':
        return <NetworkTopology />;
      default:
        return <DNSManagement />;
    }
  };

  return (
    <div className="space-y-6">
      <SEOMeta 
        title="Ağ Yönetimi"
        description="DNS, DHCP, WiFi ve ağ topolojisi yönetimi"
      />
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Ağ Yönetimi</h1>
          <p className="text-white/70 mt-1">DNS, DHCP, WiFi ve ağ topolojisi yönetimi</p>
        </div>
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
      <ErrorBoundary fallback={NetworkErrorFallback}>
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
      </ErrorBoundary>
    </div>
  );
};

export default Network;