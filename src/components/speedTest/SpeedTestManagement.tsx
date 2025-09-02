import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { MetricCard } from '../cards/MetricCard';
import * as Icons from 'lucide-react';

const SpeedTestManagement: React.FC = () => {
  const [isTestRunning, setIsTestRunning] = useState(false);
  const [testResults, setTestResults] = useState({
    download: 0,
    upload: 0,
    ping: 0
  });

  const handleRunTest = async () => {
    setIsTestRunning(true);
    
    // Simulate speed test
    setTimeout(() => {
      setTestResults({
        download: Math.floor(Math.random() * 200) + 50,
        upload: Math.floor(Math.random() * 50) + 20,
        ping: Math.floor(Math.random() * 30) + 10
      });
      setIsTestRunning(false);
    }, 3000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-white">Hız Testi</h3>
        <p className="text-white/70 text-sm">İnternet bağlantısı hız analizi</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard
          title="İndirme Hızı"
          value={`${testResults.download} Mbps`}
          subtitle="Son test"
          icon="Download"
          status="ok"
        />
        <MetricCard
          title="Yükleme Hızı"
          value={`${testResults.upload} Mbps`}
          subtitle="Son test"
          icon="Upload"
          status="ok"
        />
        <MetricCard
          title="Ping"
          value={`${testResults.ping} ms`}
          subtitle="Gecikme"
          icon="Clock"
          status="ok"
        />
      </div>

      <Card title="Hız Testi">
        <div className="space-y-4">
          <div className="text-center">
            <div className="w-24 h-24 mx-auto mb-4 bg-emerald-500/20 rounded-full flex items-center justify-center">
              {isTestRunning ? (
                <div className="w-8 h-8 border-2 border-emerald-400/30 border-t-emerald-400 rounded-full animate-spin" />
              ) : (
                <Icons.Zap className="w-12 h-12 text-emerald-400" />
              )}
            </div>
            
            {isTestRunning ? (
              <div>
                <h3 className="text-white font-semibold mb-2">Test Çalışıyor...</h3>
                <p className="text-white/60">Lütfen bekleyin</p>
              </div>
            ) : (
              <div>
                <h3 className="text-white font-semibold mb-2">Hız Testi Hazır</h3>
                <p className="text-white/60 mb-6">İnternet bağlantınızı test edin</p>
                <Button onClick={handleRunTest} size="lg">
                  <Icons.Play className="w-5 h-5 mr-2" />
                  Test Başlat
                </Button>
              </div>
            )}
          </div>

          {testResults.download > 0 && !isTestRunning && (
            <div className="grid grid-cols-3 gap-4 p-4 bg-white/5 rounded-lg border border-white/10">
              <div className="text-center">
                <Icons.Download className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
                <p className="text-emerald-400 text-xl font-bold">{testResults.download}</p>
                <p className="text-white/60 text-sm">Mbps İndirme</p>
              </div>
              <div className="text-center">
                <Icons.Upload className="w-5 h-5 text-blue-400 mx-auto mb-1" />
                <p className="text-blue-400 text-xl font-bold">{testResults.upload}</p>
                <p className="text-white/60 text-sm">Mbps Yükleme</p>
              </div>
              <div className="text-center">
                <Icons.Clock className="w-5 h-5 text-yellow-400 mx-auto mb-1" />
                <p className="text-yellow-400 text-xl font-bold">{testResults.ping}</p>
                <p className="text-white/60 text-sm">ms Ping</p>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default SpeedTestManagement;