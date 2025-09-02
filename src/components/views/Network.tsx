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

interface TabConfig {
  id: string;
  label: string;
  icon: React.ElementType;
}

const tabs: TabConfig[] = [
  { id: 'dns', label: 'DNS', icon: Icons.Globe },
  { id: 'dhcp', label: 'DHCP', icon: Icons.Network },
  { id: 'wifi', label: 'WiFi', icon: Icons.Wifi },
  { id: 'settings', label: 'Ağ Ayarları', icon: Icons.Settings },
  { id: 'traffic', label: 'Trafik Kuralları', icon: Icons.Shield },
  { id: 'speedtest', label: 'Hız Testi', icon: Icons.Zap },
  { id: 'topology', label: 'Ağ Topolojisi', icon: Icons.Network }
];

const Network: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dns');

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
      
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Ağ Yönetimi
        </h1>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors',
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                )}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
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