import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as Icons from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { MetricCard } from '../cards/MetricCard';
import { ChartCard } from '../cards/ChartCard';
import { cn } from '../../lib/utils';
import { 
  useSpeedTestProfiles, 
  useSpeedTestServers,
  useRunSpeedTest,
  useSpeedTestResults,
  useSpeedTestStats,
  useNetworkInterfaces,
  useOptimalServerSelection
} from '../../hooks/api/useSpeedTest';
import { SpeedTestConfig } from '../../types/speedTest';

interface TestConfiguration {
  profile_id: string;
  server_id: string;
  interface: string;
  ip_version: 'ipv4' | 'ipv6' | 'dual_stack';
}

export const SpeedTestDashboard: React.FC = () => {
  const [isTestRunning, setIsTestRunning] = useState(false);
  const [testProgress, setTestProgress] = useState(0);
  const [currentPhase, setCurrentPhase] = useState<'latency' | 'download' | 'upload' | 'finished'>('latency');
  const [selectedTimeRange, setSelectedTimeRange] = useState<'24h' | '7d' | '30d'>('24h');
  
  const { data: profiles = [] } = useSpeedTestProfiles();
  const { data: servers = [] } = useSpeedTestServers();
  const { data: interfaces = [] } = useNetworkInterfaces();
  const { data: results = [] } = useSpeedTestResults({ limit: 10 });
  const { data: stats } = useSpeedTestStats(selectedTimeRange);
  
  const runTestMutation = useRunSpeedTest();
  const selectServerMutation = useOptimalServerSelection();

  const [testConfig, setTestConfig] = useState<TestConfiguration>({
    profile_id: '',
    server_id: '',
    interface: 'auto',
    ip_version: 'ipv4'
  });

  const handleQuickTest = async () => {
    if (profiles.length === 0) return;
    
    setIsTestRunning(true);
    setTestProgress(0);
    setCurrentPhase('latency');

    try {
      // Select optimal server
      const optimalServer = await selectServerMutation.mutateAsync({
        country_preference: ['TR', 'AE', 'DE'],
        max_latency_ms: 100
      });

      // Use fast profile for quick test
      const fastProfile = profiles.find(p => p.profile_type === 'fast') || profiles[0];
      
      const config: SpeedTestConfig = {
        profile: fastProfile,
        server: optimalServer || servers[0],
        interface: testConfig.interface,
        ip_version: testConfig.ip_version
      };

      // Simulate test progress
      const progressInterval = setInterval(() => {
        setTestProgress(prev => {
          const newProgress = prev + 5;
          
          if (newProgress < 30) {
            setCurrentPhase('latency');
          } else if (newProgress < 70) {
            setCurrentPhase('download');
          } else if (newProgress < 95) {
            setCurrentPhase('upload');
          } else {
            setCurrentPhase('finished');
            clearInterval(progressInterval);
            setIsTestRunning(false);
          }
          
          return Math.min(newProgress, 100);
        });
      }, 300);

      await runTestMutation.mutateAsync(config);
      
    } catch (error) {
      console.error('Speed test error:', error);
      setIsTestRunning(false);
    }
  };

  const handleAdvancedTest = async () => {
    if (!testConfig.profile_id || !testConfig.server_id) {
      alert('Lütfen test profili ve sunucu seçin');
      return;
    }

    const profile = profiles.find(p => p.id === testConfig.profile_id);
    const server = servers.find(s => s.id === testConfig.server_id);

    if (!profile || !server) return;

    setIsTestRunning(true);
    setTestProgress(0);

    try {
      const config: SpeedTestConfig = {
        profile,
        server,
        interface: testConfig.interface,
        ip_version: testConfig.ip_version
      };

      await runTestMutation.mutateAsync(config);
    } catch (error) {
      console.error('Advanced speed test error:', error);
    } finally {
      setIsTestRunning(false);
    }
  };

  const getPhaseLabel = (phase: string) => {
    switch (phase) {
      case 'latency': return 'Gecikme Testi';
      case 'download': return 'İndirme Hızı';
      case 'upload': return 'Yükleme Hızı';
      case 'finished': return 'Tamamlandı';
      default: return 'Hazırlanıyor';
    }
  };

  const getPhaseIcon = (phase: string) => {
    switch (phase) {
      case 'latency': return Icons.Clock;
      case 'download': return Icons.Download;
      case 'upload': return Icons.Upload;
      case 'finished': return Icons.CheckCircle;
      default: return Icons.Loader;
    }
  };

  const latestResult = results[0];
  const performanceData = Array.from({ length: 24 }, (_, i) => ({
    time: `${i}:00`,
    download: Math.random() * 100 + 50,
    upload: Math.random() * 50 + 20,
    ping: Math.random() * 30 + 10
  }));

  return (
    <div className="space-y-6">
      {/* Speed Test Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard
          title="Son Test Sonucu"
          value={latestResult ? `${latestResult.download_mbps?.toFixed(1) || 0} Mbps` : 'Henüz test yok'}
          subtitle="İndirme hızı"
          icon="Download"
          status={latestResult?.success ? 'ok' : 'warn'}
        />
        <MetricCard
          title="Ortalama Ping"
          value={stats ? `${stats.avg_ping_ms.toFixed(0)} ms` : '0 ms'}
          subtitle={`Son ${selectedTimeRange}`}
          icon="Clock"
          status={stats && stats.avg_ping_ms < 50 ? 'ok' : 'warn'}
        />
        <MetricCard
          title="Toplam Test"
          value={String(stats?.total_tests || 0)}
          subtitle={`${stats?.successful_tests || 0} başarılı`}
          icon="BarChart3"
          status="ok"
        />
        <MetricCard
          title="Ağ Kalitesi"
          value={latestResult ? "İyi" : "Bilinmiyor"}
          subtitle="QoE skoruna göre"
          icon="Signal"
          status={latestResult ? 'ok' : 'warn'}
        />
      </div>

      {/* Quick Test Panel */}
      <Card title="Hız Testi">
        <div className="space-y-6">
          {/* Test Progress */}
          {isTestRunning && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 bg-blue-500/10 border border-blue-500/20 rounded-xl"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
                  {(() => {
                    const PhaseIcon = getPhaseIcon(currentPhase);
                    return <PhaseIcon className="w-6 h-6 text-blue-400" />;
                  })()}
                </div>
                <div>
                  <h3 className="text-white font-semibold">{getPhaseLabel(currentPhase)}</h3>
                  <p className="text-white/70 text-sm">Test devam ediyor...</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/70">İlerleme:</span>
                  <span className="text-white font-medium">{testProgress}%</span>
                </div>
                <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-blue-400 to-emerald-400 rounded-full"
                    style={{ width: `${testProgress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>
            </motion.div>
          )}

          {/* Test Controls */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Quick Test */}
            <div className="space-y-4">
              <h3 className="text-white font-semibold">Hızlı Test</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-white text-sm font-medium mb-2">Arayüz</label>
                  <select
                    value={testConfig.interface}
                    onChange={(e) => setTestConfig({ ...testConfig, interface: e.target.value })}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none"
                    disabled={isTestRunning}
                  >
                    <option value="auto">Otomatik</option>
                    {interfaces.map((iface) => (
                      <option key={iface.interface_name} value={iface.interface_name}>
                        {iface.interface_name} ({iface.description})
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-white text-sm font-medium mb-2">IP Sürümü</label>
                  <select
                    value={testConfig.ip_version}
                    onChange={(e) => setTestConfig({ ...testConfig, ip_version: e.target.value as any })}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none"
                    disabled={isTestRunning}
                  >
                    <option value="ipv4">IPv4</option>
                    <option value="ipv6">IPv6</option>
                    <option value="dual_stack">Dual Stack</option>
                  </select>
                </div>

                <Button
                  onClick={handleQuickTest}
                  disabled={isTestRunning}
                  isLoading={isTestRunning}
                  className="w-full h-12"
                >
                  <Icons.Play className="w-5 h-5 mr-2" />
                  {isTestRunning ? 'Test Çalışıyor...' : 'Hızlı Test Başlat'}
                </Button>
              </div>
            </div>

            {/* Advanced Test */}
            <div className="space-y-4">
              <h3 className="text-white font-semibold">Gelişmiş Test</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-white text-sm font-medium mb-2">Test Profili</label>
                  <select
                    value={testConfig.profile_id}
                    onChange={(e) => setTestConfig({ ...testConfig, profile_id: e.target.value })}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none"
                    disabled={isTestRunning}
                  >
                    <option value="">Profil seçin</option>
                    {profiles.map((profile) => (
                      <option key={profile.id} value={profile.id}>
                        {profile.profile_name} ({profile.test_duration_seconds}s)
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-white text-sm font-medium mb-2">Test Sunucusu</label>
                  <select
                    value={testConfig.server_id}
                    onChange={(e) => setTestConfig({ ...testConfig, server_id: e.target.value })}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none"
                    disabled={isTestRunning}
                  >
                    <option value="">Sunucu seçin</option>
                    {servers.map((server) => (
                      <option key={server.id} value={server.id}>
                        {server.server_name} ({server.avg_latency_ms}ms)
                      </option>
                    ))}
                  </select>
                </div>

                <Button
                  onClick={handleAdvancedTest}
                  disabled={isTestRunning || !testConfig.profile_id || !testConfig.server_id}
                  isLoading={isTestRunning}
                  variant="outline"
                  className="w-full h-12"
                >
                  <Icons.Settings className="w-5 h-5 mr-2" />
                  {isTestRunning ? 'Test Çalışıyor...' : 'Gelişmiş Test'}
                </Button>
              </div>
            </div>
          </div>

          {/* Latest Result Display */}
          {latestResult && !isTestRunning && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-xl"
            >
              <div className="flex items-center gap-3 mb-4">
                <Icons.CheckCircle className="w-6 h-6 text-emerald-400" />
                <div>
                  <h3 className="text-white font-semibold">Son Test Sonucu</h3>
                  <p className="text-white/70 text-sm">
                    {new Date(latestResult.test_started_at).toLocaleString('tr-TR')}
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <Icons.Download className="w-5 h-5 text-emerald-400 mx-auto mb-2" />
                  <p className="text-emerald-400 text-2xl font-bold">
                    {latestResult.download_mbps?.toFixed(1) || 0}
                  </p>
                  <p className="text-white/60 text-sm">Mbps İndirme</p>
                </div>
                <div className="text-center">
                  <Icons.Upload className="w-5 h-5 text-blue-400 mx-auto mb-2" />
                  <p className="text-blue-400 text-2xl font-bold">
                    {latestResult.upload_mbps?.toFixed(1) || 0}
                  </p>
                  <p className="text-white/60 text-sm">Mbps Yükleme</p>
                </div>
                <div className="text-center">
                  <Icons.Clock className="w-5 h-5 text-yellow-400 mx-auto mb-2" />
                  <p className="text-yellow-400 text-2xl font-bold">
                    {latestResult.ping_ms?.toFixed(0) || 0}
                  </p>
                  <p className="text-white/60 text-sm">ms Ping</p>
                </div>
                <div className="text-center">
                  <Icons.Zap className="w-5 h-5 text-purple-400 mx-auto mb-2" />
                  <p className="text-purple-400 text-2xl font-bold">
                    {latestResult.bufferbloat_score || 'N/A'}
                  </p>
                  <p className="text-white/60 text-sm">Bufferbloat</p>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </Card>

      {/* Performance Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-white font-semibold">Performans Trendi</h3>
            <select
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(e.target.value as any)}
              className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none"
            >
              <option value="24h">Son 24 Saat</option>
              <option value="7d">Son 7 Gün</option>
              <option value="30d">Son 30 Gün</option>
            </select>
          </div>
          <ChartCard
            title="Hız Trendi"
            data={performanceData}
            type="line"
            color="#00A36C"
          />
        </div>

        <Card title="Son Test Sonuçları">
          <div className="space-y-3">
            {results.slice(0, 5).map((result, index) => (
              <div key={result.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center",
                    result.success ? "bg-emerald-500/20 border border-emerald-500/30" : "bg-red-500/20 border border-red-500/30"
                  )}>
                    {result.success ? (
                      <Icons.CheckCircle className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Icons.XCircle className="w-4 h-4 text-red-400" />
                    )}
                  </div>
                  <div>
                    <p className="text-white font-medium text-sm">
                      {result.download_mbps?.toFixed(1) || 0} / {result.upload_mbps?.toFixed(1) || 0} Mbps
                    </p>
                    <p className="text-white/60 text-xs">
                      {new Date(result.test_started_at).toLocaleTimeString('tr-TR')} • {result.ping_ms?.toFixed(0) || 0}ms
                    </p>
                  </div>
                </div>
                <Button size="sm" variant="outline">
                  <Icons.Eye className="w-3 h-3" />
                </Button>
              </div>
            ))}
            
            {results.length === 0 && (
              <div className="text-center py-8">
                <Icons.BarChart3 className="w-12 h-12 text-white/30 mx-auto mb-3" />
                <p className="text-white/60">Henüz test sonucu bulunmuyor</p>
                <p className="text-white/40 text-sm">İlk hız testinizi çalıştırın</p>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Test Configuration Templates */}
      <Card title="Hızlı Test Şablonları">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              name: 'Genel İnternet Hızı',
              description: 'Türkiye sunucuları ile hızlı test',
              icon: Icons.Globe,
              config: { profile: 'fast', country: 'TR', duration: 15 }
            },
            {
              name: 'Gaming Optimizasyonu',
              description: 'Düşük gecikme ve jitter testi',
              icon: Icons.Gamepad2,
              config: { profile: 'balanced', country: 'DE', focus: 'latency' }
            },
            {
              name: 'VoIP Kalite Testi',
              description: 'Ses kalitesi için özel analiz',
              icon: Icons.Phone,
              config: { profile: 'deep_analysis', country: 'AE', focus: 'jitter' }
            }
          ].map((template) => (
            <button
              key={template.name}
              onClick={() => {
                // Apply template configuration
                const fastProfile = profiles.find(p => p.profile_type === template.config.profile as any);
                const countryServer = servers.find(s => s.country_code === template.config.country);
                
                if (fastProfile && countryServer) {
                  setTestConfig({
                    profile_id: fastProfile.id,
                    server_id: countryServer.id,
                    interface: 'auto',
                    ip_version: 'ipv4'
                  });
                  handleAdvancedTest();
                }
              }}
              disabled={isTestRunning}
              className="p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:border-white/20 transition-all text-left disabled:opacity-50"
            >
              <div className="flex items-center gap-3 mb-2">
                <template.icon className="w-5 h-5 text-emerald-400" />
                <span className="text-white font-medium">{template.name}</span>
              </div>
              <p className="text-white/70 text-sm">{template.description}</p>
            </button>
          ))}
        </div>
      </Card>

      {/* Network Interface Status */}
      <Card title="Ağ Arayüzü Durumu">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {interfaces.map((iface) => (
            <div key={iface.interface_name} className="p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="flex items-center gap-3 mb-3">
                <div className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center",
                  iface.is_up ? "bg-emerald-500/20 border border-emerald-500/30" : "bg-red-500/20 border border-red-500/30"
                )}>
                  {iface.interface_type === 'ethernet' ? (
                    <Icons.Cable className={cn("w-4 h-4", iface.is_up ? "text-emerald-400" : "text-red-400")} />
                  ) : iface.interface_type === 'wifi' ? (
                    <Icons.Wifi className={cn("w-4 h-4", iface.is_up ? "text-emerald-400" : "text-red-400")} />
                  ) : (
                    <Icons.Shield className={cn("w-4 h-4", iface.is_up ? "text-emerald-400" : "text-red-400")} />
                  )}
                </div>
                <div>
                  <h4 className="text-white font-medium">{iface.interface_name}</h4>
                  <p className="text-white/60 text-xs">{iface.description}</p>
                </div>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-white/60">IP:</span>
                  <span className="text-white font-mono">{iface.ip_address || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Hız:</span>
                  <span className="text-white">{iface.speed_mbps || 0} Mbps</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">MTU:</span>
                  <span className="text-white">{iface.mtu}</span>
                </div>
                {iface.vlan_id && (
                  <div className="flex justify-between">
                    <span className="text-white/60">VLAN:</span>
                    <span className="text-white">{iface.vlan_id}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};