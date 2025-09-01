import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as Icons from 'lucide-react';
import { cn, formatBytes } from '../../lib/utils';
import { MetricCard } from '../cards/MetricCard';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { TableCard } from '../cards/TableCard';
import { SEOMeta } from '../SEO/SEOMeta';
interface USBDevice {
  id: string;
  name: string;
  device: string;
  mountPoint: string;
  fileSystem: string;
  totalSize: number;
  usedSize: number;
  freeSize: number;
  status: 'connected' | 'disconnected' | 'error';
  isShared: boolean;
  shareName: string;
  permissions: 'read-only' | 'read-write' | 'admin-only';
  connectedUsers: number;
  lastAccessed: string;
  vendor: string;
}

const Storage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('devices');

  const [usbDevices, setUsbDevices] = useState<USBDevice[]>([
    {
      id: 'usb-1',
      name: 'Samsung T7 Portable SSD',
      device: '/dev/sda1',
      mountPoint: '/media/usb1',
      fileSystem: 'ext4',
      totalSize: 1024 * 1024 * 1024 * 1000, // 1TB
      usedSize: 1024 * 1024 * 1024 * 650, // 650GB
      freeSize: 1024 * 1024 * 1024 * 350, // 350GB
      status: 'connected',
      isShared: true,
      shareName: 'Media_Drive',
      permissions: 'read-write',
      connectedUsers: 3,
      lastAccessed: '2 dakika önce',
      vendor: 'Samsung'
    },
    {
      id: 'usb-2',
      name: 'SanDisk Ultra USB 3.0',
      device: '/dev/sdb1',
      mountPoint: '/media/usb2',
      fileSystem: 'ntfs',
      totalSize: 1024 * 1024 * 1024 * 128, // 128GB
      usedSize: 1024 * 1024 * 1024 * 45, // 45GB
      freeSize: 1024 * 1024 * 1024 * 83, // 83GB
      status: 'connected',
      isShared: false,
      shareName: 'Backup_Drive',
      permissions: 'admin-only',
      connectedUsers: 0,
      lastAccessed: '1 saat önce',
      vendor: 'SanDisk'
    }
  ]);

  const tabs = [
    { id: 'devices', label: 'USB Cihazları', icon: 'HardDrive' },
    { id: 'shares', label: 'Ağ Paylaşımları', icon: 'Share2' },
    { id: 'backup', label: 'Yedekleme', icon: 'Archive' }
  ];

  const toggleShare = (deviceId: string) => {
    setUsbDevices(devices => 
      devices.map(device => 
        device.id === deviceId ? { ...device, isShared: !device.isShared } : device
      )
    );
  };

  const getFileSystemIcon = (fs: string) => {
    switch (fs.toLowerCase()) {
      case 'ext4': return Icons.HardDrive;
      case 'ntfs': return Icons.Monitor;
      case 'fat32': return Icons.Usb;
      default: return Icons.HelpCircle;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'bg-emerald-400';
      case 'error': return 'bg-red-400';
      default: return 'bg-gray-400';
    }
  };

  const DeviceCard: React.FC<{ device: USBDevice }> = ({ device }) => {
    const FSIcon = getFileSystemIcon(device.fileSystem);
    const usagePercent = Math.round((device.usedSize / device.totalSize) * 100);
    
    return (
      <Card className="h-full">
        <div className="space-y-4">
          {/* Device Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center",
                device.status === 'connected' ? "bg-emerald-500/20 border border-emerald-500/30" :
                device.status === 'error' ? "bg-red-500/20 border border-red-500/30" :
                "bg-gray-500/20 border border-gray-500/30"
              )}>
                <FSIcon className={cn(
                  "w-5 h-5",
                  device.status === 'connected' ? "text-emerald-400" :
                  device.status === 'error' ? "text-red-400" : "text-gray-400"
                )} />
              </div>
              <div>
                <h4 className="text-white font-medium">{device.name}</h4>
                <p className="text-white/60 text-xs">{device.vendor}</p>
              </div>
            </div>
            <div className={cn("w-3 h-3 rounded-full", getStatusColor(device.status))} />
          </div>

          {/* Device Info */}
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-white/60">Cihaz:</span>
              <span className="text-white font-mono">{device.device}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/60">Toplam Boyut:</span>
              <span className="text-white">{formatBytes(device.totalSize)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/60">Kullanılan:</span>
              <span className="text-white">{formatBytes(device.usedSize)} ({usagePercent}%)</span>
            </div>
          </div>

          {/* Usage Bar */}
          <div className="space-y-1">
            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
              <div 
                className={cn(
                  "h-full rounded-full transition-all duration-300",
                  usagePercent > 90 ? "bg-red-400" :
                  usagePercent > 75 ? "bg-orange-400" : "bg-emerald-400"
                )}
                style={{ width: `${usagePercent}%` }}
              />
            </div>
          </div>

          {/* Share Toggle */}
          <div className="pt-3 border-t border-white/10">
            <div className="flex items-center justify-between">
              <span className="text-white font-medium text-sm">Ağ Paylaşımı</span>
              <button
                onClick={() => toggleShare(device.id)}
                className={cn(
                  "relative w-10 h-5 rounded-full transition-all duration-300",
                  device.isShared 
                    ? "bg-emerald-500 shadow-lg shadow-emerald-500/30" 
                    : "bg-white/20"
                )}
              >
                <div
                  className={cn(
                    "absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all duration-300 shadow-lg",
                    device.isShared ? "left-5" : "left-0.5"
                  )}
                />
              </button>
            </div>
          </div>
        </div>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <SEOMeta
        title="Depolama Yönetimi"
        description="USB cihazları, ağ paylaşımları ve yedekleme"
      />
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Depolama Yönetimi</h1>
          <p className="text-white/70 mt-1">USB cihazları, ağ paylaşımları ve yedekleme</p>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard
          title="Bağlı USB Cihazları"
          value={String(usbDevices.filter(d => d.status === 'connected').length)}
          subtitle={`${usbDevices.length} toplam cihazdan`}
          icon="Usb"
          status="ok"
        />
        <MetricCard
          title="Aktif Paylaşımlar"
          value={String(usbDevices.filter(d => d.isShared).length)}
          subtitle="Ağda paylaşılan"
          icon="Share2"
          status="ok"
        />
        <MetricCard
          title="Toplam Depolama"
          value={formatBytes(usbDevices.reduce((acc, d) => acc + d.totalSize, 0))}
          subtitle="Tüm USB cihazlar"
          icon="HardDrive"
          status="ok"
        />
        <MetricCard
          title="Bağlı Kullanıcılar"
          value={String(usbDevices.reduce((acc, d) => acc + d.connectedUsers, 0))}
          subtitle="Şu anda erişimde"
          icon="Users"
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
          {activeTab === 'devices' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {usbDevices.map((device) => (
                <DeviceCard key={device.id} device={device} />
              ))}
            </div>
          )}

          {activeTab === 'shares' && (
            <TableCard
              title="Aktif Ağ Paylaşımları"
              columns={[
                { key: 'shareName', label: 'Paylaşım Adı' },
                { key: 'device', label: 'Cihaz' },
                { key: 'permissions', label: 'İzinler' },
                { 
                  key: 'isShared', 
                  label: 'Durum',
                  render: (value: boolean) => (
                    <span className={cn(
                      "px-2 py-1 rounded-full text-xs font-medium",
                      value 
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" 
                        : "bg-red-500/20 text-red-400 border border-red-500/30"
                    )}>
                      {value ? 'Etkin' : 'Pasif'}
                    </span>
                  )
                }
              ]}
              data={usbDevices.filter(d => d.isShared)}
            />
          )}

          {activeTab === 'backup' && (
            <Card title="Otomatik Yedekleme">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { name: 'sistem-yedek-2025-01-15.tar.gz', size: '2.3 GB', date: '15 Oca 2025', status: 'Başarılı' },
                    { name: 'medya-yedek-2025-01-14.tar.gz', size: '45 GB', date: '14 Oca 2025', status: 'Başarılı' },
                    { name: 'config-yedek-2025-01-13.tar.gz', size: '156 MB', date: '13 Oca 2025', status: 'Başarısız' }
                  ].map((backup, index) => (
                    <div key={index} className="p-4 rounded-xl bg-white/5 border border-white/10">
                      <div className="mb-2">
                        <p className="text-white font-medium text-sm">{backup.name}</p>
                        <p className="text-white/60 text-xs">{backup.date} • {backup.size}</p>
                      </div>
                      <span className={cn(
                        "px-2 py-1 rounded text-xs font-medium",
                        backup.status === 'Başarılı' 
                          ? "bg-emerald-500/20 text-emerald-400" 
                          : "bg-red-500/20 text-red-400"
                      )}>
                        {backup.status}
                      </span>
                    </div>
                  ))}
                </div>
                
                <Button className="w-full">
                  <Icons.Archive className="w-4 h-4 mr-2" />
                  Yedekle
                </Button>
              </div>
            </Card>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default Storage;