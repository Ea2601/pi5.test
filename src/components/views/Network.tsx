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
import NetworkSettings from '../network/NetworkSettings';

interface TabConfig {
  id: string;
  label: string;
  icon: React.ElementType;
}

const tabs: TabConfig[] = [
  { id: 'dns', label: 'DNS', icon: Icons.Globe },
  { id: 'dhcp', label: 'DHCP', icon: Icons.Network },
          <NetworkSettings />
  { id: 'topology', label: 'Ağ Topolojisi', icon: Icons.Network },
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