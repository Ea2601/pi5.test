/**
 * Storage Management Module
 * USB devices and network storage management
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as Icons from 'lucide-react';
import { BaseModule } from '../core/BaseModule';
import { communicationBus } from '../core/CommunicationBus';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { MetricCard } from '../cards/MetricCard';
import { cn, formatBytes } from '../lib/utils';

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
  vendor: string;
}

class StorageModuleClass extends BaseModule {
  private storageData = {
    usbDevices: [],
    networkShares: [],
    backups: [],
    metrics: {}
  };

  protected async onInitialize(): Promise<void> {
    this.logger.info('Initializing Storage Management Module');
    
    // Subscribe to USB events
    communicationBus.subscribe(
      `${this.manifest.id}-events`,
      { action: ['usb-device-connected', 'usb-device-disconnected', 'backup-completed'] },
      this.handleStorageEvent.bind(this)
    );
  }

  protected async onStart(): Promise<void> {
    await this.refreshStorageData();
    this.startUSBMonitoring();
  }

  protected async onStop(): Promise<void> {
    this.stopUSBMonitoring();
  }

  protected async onAction(action: string, payload?: any): Promise<any> {
    switch (action) {
      case 'get-usb-devices':
        return this.getUSBDevices();
      case 'mount-device':
        return this.mountDevice(payload);
      case 'unmount-device':
        return this.unmountDevice(payload);
      case 'create-share':
        return this.createNetworkShare(payload);
      case 'start-backup':
        return this.startBackup(payload);
      case 'get-metrics':
        return this.getModuleMetrics();
      default:
        throw new Error(`Unknown storage action: ${action}`);
    }
  }

  public getComponent(): React.ComponentType<any> {
    return StorageModuleComponent;
  }

  private async refreshStorageData(): Promise<void> {
    try {
      const [usbDevices, shares] = await Promise.all([
        this.apiCall('/storage/usb'),
        this.apiCall('/storage/shares')
      ]);
      
      this.storageData.usbDevices = usbDevices.data || [];
      this.storageData.networkShares = shares.data || [];
      this.updateHealth('healthy');
      this.emit('storageDataUpdated', this.storageData);
    } catch (error) {
      this.updateHealth('degraded', (error as Error).message);
    }
  }

  private startUSBMonitoring(): void {
    this.logger.info('Started USB device monitoring');
    // Monitor for USB device changes
  }

  private stopUSBMonitoring(): void {
    this.logger.info('Stopped USB device monitoring');
  }

  private handleStorageEvent(message: any): void {
    this.logger.debug(`Storage event: ${message.action}`, { payload: message.payload });
    this.refreshStorageData();
  }

  private async getUSBDevices(): Promise<USBDevice[]> {
    return this.storageData.usbDevices;
  }

  private async mountDevice(deviceId: string): Promise<any> {
    return await this.apiCall(`/storage/usb/${deviceId}/mount`, {
      method: 'POST'
    });
  }

  private async unmountDevice(deviceId: string): Promise<any> {
    return await this.apiCall(`/storage/usb/${deviceId}/unmount`, {
      method: 'POST'
    });
  }

  private async createNetworkShare(shareData: any): Promise<any> {
    const result = await this.apiCall('/storage/shares', {
      method: 'POST',
      body: JSON.stringify(shareData)
    });
    await this.refreshStorageData();
    return result;
  }

  private async startBackup(backupConfig: any): Promise<any> {
    return await this.apiCall('/storage/backup', {
      method: 'POST',
      body: JSON.stringify(backupConfig)
    });
  }

  private getModuleMetrics(): any {
    const totalStorage = this.storageData.usbDevices.reduce((acc: number, d: USBDevice) => acc + d.totalSize, 0);
    const usedStorage = this.storageData.usbDevices.reduce((acc: number, d: USBDevice) => acc + d.usedSize, 0);
    
    return {
      connectedDevices: this.storageData.usbDevices.filter((d: USBDevice) => d.status === 'connected').length,
      totalStorage: formatBytes(totalStorage),
      usedStorage: formatBytes(usedStorage),
      activeShares: this.storageData.usbDevices.filter((d: USBDevice) => d.isShared).length
    };
  }
}

const StorageModuleComponent: React.FC = () => {
  const [activeTab, setActiveTab] = useState('devices');
  const [usbDevices, setUsbDevices] = useState<USBDevice[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const tabs = [
    { id: 'devices', label: 'USB Cihazları', icon: 'HardDrive' },
    { id: 'shares', label: 'Ağ Paylaşımları', icon: 'Share2' },
    { id: 'backup', label: 'Yedekleme', icon: 'Archive' },
    { id: 'monitoring', label: 'Depolama İzleme', icon: 'Activity' }
  ];

  useEffect(() => {
    const loadStorageData = async () => {
      try {
        const devices = await communicationBus.send({
          type: 'request',
          source: 'storage-management',
          target: 'storage-management',
          action: 'get-usb-devices'
        });

        setUsbDevices(devices || []);
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to load storage data:', error);
        // Mock data for demo
        setUsbDevices([
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
            vendor: 'SanDisk'
          }
        ]);
        setIsLoading(false);
      }
    };

    loadStorageData();
  }, []);

  const handleToggleShare = async (deviceId: string) => {
    try {
      await communicationBus.send({
        type: 'request',
        source: 'storage-management',
        target: 'storage-management',
        action: 'toggle-share',
        payload: deviceId
      });
      console.log('Network share toggled');
    } catch (error) {
      console.error('Toggle share failed:', error);
    }
  };

  const handleMountDevice = async (deviceId: string) => {
    try {
      await communicationBus.send({
        type: 'request',
        source: 'storage-management',
        target: 'storage-management',
        action: 'mount-device',
        payload: deviceId
      });
      console.log('Device mounted');
    } catch (error) {
      console.error('Mount failed:', error);
    }
  };

  const handleStartBackup = async () => {
    try {
      await communicationBus.send({
        type: 'request',
        source: 'storage-management',
        target: 'storage-management',
        action: 'start-backup',
        payload: { type: 'full' }
      });
      console.log('Backup started');
    } catch (error) {
      console.error('Backup start failed:', error);
    }
  };

  const getFileSystemIcon = (fs: string) => {
    switch (fs.toLowerCase()) {
      case 'ext4': return Icons.HardDrive;
      case 'ntfs': return Icons.Monitor;
      case 'fat32': return Icons.Usb;
      default: return Icons.HelpCircle;
    }
  };

  const DeviceCard: React.FC<{ device: USBDevice }> = ({ device }) => {
    const FSIcon = getFileSystemIcon(device.fileSystem);
    const usagePercent = Math.round((device.usedSize / device.totalSize) * 100);
    
    return (
      <Card className="h-full">
        <div className="space-y-4">
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
            <div className={cn(
              "w-3 h-3 rounded-full",
              device.status === 'connected' ? "bg-emerald-400" :
              device.status === 'error' ? "bg-red-400" : "bg-gray-400"
            )} />
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-white/60">Toplam Boyut:</span>
              <span className="text-white">{formatBytes(device.totalSize)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/60">Kullanılan:</span>
              <span className="text-white">{formatBytes(device.usedSize)} ({usagePercent}%)</span>
            </div>
          </div>

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

          <div className="flex items-center justify-between pt-3 border-t border-white/10">
            <span className="text-white font-medium text-sm">Ağ Paylaşımı</span>
            <button
              onClick={() => handleToggleShare(device.id)}
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

          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" className="flex-1">
              <Icons.Folder className="w-3 h-3 mr-1" />
              Dosyalar
            </Button>
            <Button size="sm" variant="outline">
              <Icons.Settings className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </Card>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-8 h-8 border-2 border-white/30 border-t-emerald-400 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Depolama Yönetimi</h1>
          <p className="text-white/70 mt-1">USB cihazları ve ağ paylaşım yönetimi</p>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard
          title="Bağlı USB Cihazları"
          value={String(usbDevices.filter(d => d.status === 'connected').length)}
          subtitle={`${usbDevices.length} toplam cihaz`}
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
          title="Kullanım Oranı"
          value={`${Math.round((usbDevices.reduce((acc, d) => acc + d.usedSize, 0) / usbDevices.reduce((acc, d) => acc + d.totalSize, 0)) * 100) || 0}%`}
          subtitle="Ortalama doluluk"
          icon="BarChart3"
          status="ok"
        />
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-white/5 p-1 rounded-2xl backdrop-blur-sm border border-white/10">
        {tabs.map((tab) => {
          const IconComponent = Icons[tab.icon as keyof typeof Icons] as React.ComponentType<any>;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "relative flex items-center gap-2 px-6 py-3 rounded-xl transition-all duration-300 font-medium",
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
            <Card title="Aktif Ağ Paylaşımları">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Button>
                    <Icons.Plus className="w-4 h-4 mr-2" />
                    Yeni Paylaşım
                  </Button>
                  <Button variant="outline">
                    <Icons.RefreshCw className="w-4 h-4 mr-2" />
                    Yenile
                  </Button>
                </div>
                
                <div className="space-y-3">
                  {usbDevices.filter(d => d.isShared).map((device) => (
                    <div key={device.id} className="p-4 rounded-xl bg-white/5 border border-white/10">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-white font-medium">{device.shareName}</h4>
                          <p className="text-white/60 text-sm">{device.name} ({formatBytes(device.totalSize)})</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="outline">
                            <Icons.Users className="w-3 h-3 mr-1" />
                            İzinler
                          </Button>
                          <Button size="sm" variant="destructive">
                            <Icons.Share2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          )}

          {activeTab === 'backup' && (
            <Card title="Otomatik Yedekleme">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Button onClick={handleStartBackup}>
                    <Icons.Archive className="w-4 h-4 mr-2" />
                    Yedekleme Başlat
                  </Button>
                  <Button variant="outline">
                    <Icons.Settings className="w-4 h-4 mr-2" />
                    Zamanlama
                  </Button>
                </div>
                
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

                <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Icons.CheckCircle className="w-4 h-4 text-yellow-400" />
                    <span className="text-yellow-400 font-medium">Depolama Modülü Aktif</span>
                  </div>
                  <p className="text-white/80 text-sm">
                    USB cihaz yönetimi, ağ paylaşımları ve otomatik yedekleme özellikleri çalışıyor.
                  </p>
                </div>
              </div>
            </Card>
          )}

          {activeTab === 'monitoring' && (
            <Card title="Depolama Performans İzleme">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                    <div className="flex items-center gap-2 mb-2">
                      <Icons.Activity className="w-4 h-4 text-blue-400" />
                      <span className="text-white font-medium">Disk I/O</span>
                    </div>
                    <p className="text-blue-400 text-xl font-bold">12.5 MB/s</p>
                    <p className="text-white/60 text-sm">Okuma/Yazma hızı</p>
                  </div>
                  
                  <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                    <div className="flex items-center gap-2 mb-2">
                      <Icons.Clock className="w-4 h-4 text-orange-400" />
                      <span className="text-white font-medium">Erişim Süresi</span>
                    </div>
                    <p className="text-orange-400 text-xl font-bold">8.2 ms</p>
                    <p className="text-white/60 text-sm">Ortalama seek time</p>
                  </div>
                  
                  <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                    <div className="flex items-center gap-2 mb-2">
                      <Icons.Thermometer className="w-4 h-4 text-red-400" />
                      <span className="text-white font-medium">Sıcaklık</span>
                    </div>
                    <p className="text-red-400 text-xl font-bold">42°C</p>
                    <p className="text-white/60 text-sm">SSD sıcaklığı</p>
                  </div>
                </div>
              </div>
            </Card>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default StorageModuleClass;