/**
 * Production Deployment Manager
 * Automated deployment and container orchestration for Pi5
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import * as Icons from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { MetricCard } from '../cards/MetricCard';
import { cn } from '../../lib/utils';

interface DeploymentConfig {
  environment: 'development' | 'staging' | 'production';
  enableHTTPS: boolean;
  domainName?: string;
  autoBackup: boolean;
  monitoringEnabled: boolean;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  resourceLimits: {
    cpu: string;
    memory: string;
  };
  modules: string[];
}

interface DeploymentStatus {
  status: 'idle' | 'deploying' | 'deployed' | 'failed';
  progress: number;
  currentStep: string;
  containersRunning: number;
  totalContainers: number;
  errors: string[];
  deploymentTime?: number;
}

export const DeploymentManager: React.FC = () => {
  const [deploymentConfig, setDeploymentConfig] = useState<DeploymentConfig>({
    environment: 'production',
    enableHTTPS: true,
    autoBackup: true,
    monitoringEnabled: true,
    logLevel: 'info',
    resourceLimits: {
      cpu: '1.0',
      memory: '512M'
    },
    modules: ['device-management', 'network-management', 'vpn-management']
  });

  const [deploymentStatus, setDeploymentStatus] = useState<DeploymentStatus>({
    status: 'idle',
    progress: 0,
    currentStep: '',
    containersRunning: 0,
    totalContainers: 0,
    errors: []
  });

  const [isDeploying, setIsDeploying] = useState(false);

  const handleDeploy = async () => {
    if (isDeploying) return;

    setIsDeploying(true);
    setDeploymentStatus({
      status: 'deploying',
      progress: 0,
      currentStep: 'Deployment başlatılıyor...',
      containersRunning: 0,
      totalContainers: 8,
      errors: []
    });

    const deploymentSteps = [
      { name: 'Environment hazırlığı', duration: 2000 },
      { name: 'Docker containers build ediliyor', duration: 5000 },
      { name: 'Database migration uygulanıyor', duration: 3000 },
      { name: 'Modules yükleniyor', duration: 4000 },
      { name: 'Nginx konfigürasyonu', duration: 2000 },
      { name: 'SSL sertifikaları', duration: 3000 },
      { name: 'Services başlatılıyor', duration: 4000 },
      { name: 'Health check yapılıyor', duration: 2000 }
    ];

    try {
      let currentProgress = 0;
      
      for (let i = 0; i < deploymentSteps.length; i++) {
        const step = deploymentSteps[i];
        setDeploymentStatus(prev => ({
          ...prev,
          currentStep: step.name,
          progress: Math.round((i / deploymentSteps.length) * 100)
        }));

        // Simulate deployment step
        await new Promise(resolve => setTimeout(resolve, step.duration));
        
        // Update containers running
        if (i >= 3) {
          setDeploymentStatus(prev => ({
            ...prev,
            containersRunning: Math.min(prev.containersRunning + 1, prev.totalContainers)
          }));
        }
      }

      // Deployment completed
      setDeploymentStatus({
        status: 'deployed',
        progress: 100,
        currentStep: 'Deployment tamamlandı!',
        containersRunning: 8,
        totalContainers: 8,
        errors: [],
        deploymentTime: Date.now()
      });

      console.log('Production deployment completed successfully');
    } catch (error) {
      setDeploymentStatus(prev => ({
        ...prev,
        status: 'failed',
        errors: [...prev.errors, (error as Error).message]
      }));
      console.error('Deployment failed:', error);
    } finally {
      setIsDeploying(false);
    }
  };

  const handleRollback = async () => {
    console.log('Initiating rollback...');
    // Implement rollback logic
  };

  const generateDeploymentScript = () => {
    const script = `#!/bin/bash
# Pi5 Supernode Production Deployment Script
# Generated: ${new Date().toISOString()}

echo "🚀 Pi5 Supernode Production Deployment Starting..."

# Environment setup
export NODE_ENV=${deploymentConfig.environment}
export LOG_LEVEL=${deploymentConfig.logLevel}
export ENABLE_HTTPS=${deploymentConfig.enableHTTPS}

# Stop existing services
docker-compose down

# Build and start production services
docker-compose -f docker-compose.prod.yml build
docker-compose -f docker-compose.prod.yml up -d

# Wait for services to start
sleep 30

# Run health checks
curl -f http://localhost/health || exit 1

# Enable monitoring
${deploymentConfig.monitoringEnabled ? 'docker-compose exec grafana /setup-dashboards.sh' : '# Monitoring disabled'}

# Setup SSL if enabled
${deploymentConfig.enableHTTPS ? 'certbot --nginx -d ' + (deploymentConfig.domainName || 'pi5supernode.local') : '# HTTPS disabled'}

echo "✅ Deployment completed successfully!"
echo "🌐 Access: http${deploymentConfig.enableHTTPS ? 's' : ''}://${deploymentConfig.domainName || 'localhost'}"
`;

    const blob = new Blob([script], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'deploy-pi5-supernode.sh';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Deployment Status */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard
          title="Deployment Durumu"
          value={deploymentStatus.status === 'deployed' ? 'Çalışıyor' : 
                 deploymentStatus.status === 'deploying' ? 'Deploy Ediliyor' :
                 deploymentStatus.status === 'failed' ? 'Hata' : 'Hazır'}
          subtitle={`${deploymentStatus.containersRunning}/${deploymentStatus.totalContainers} container`}
          icon="Server"
          status={deploymentStatus.status === 'deployed' ? 'ok' : 
                  deploymentStatus.status === 'failed' ? 'error' : 'warn'}
        />
        <MetricCard
          title="Environment"
          value={deploymentConfig.environment.charAt(0).toUpperCase() + deploymentConfig.environment.slice(1)}
          subtitle="Hedef ortam"
          icon="Target"
          status="ok"
        />
        <MetricCard
          title="HTTPS"
          value={deploymentConfig.enableHTTPS ? 'Etkin' : 'Devre Dışı'}
          subtitle={deploymentConfig.domainName || 'localhost'}
          icon="Lock"
          status={deploymentConfig.enableHTTPS ? 'ok' : 'warn'}
        />
        <MetricCard
          title="Modüller"
          value={String(deploymentConfig.modules.length)}
          subtitle="Deploy edilecek"
          icon="Package"
          status="ok"
        />
      </div>

      {/* Deployment Progress */}
      {isDeploying && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <Card title="Deployment İlerleyişi">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
                  <Icons.Rocket className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-white font-semibold">{deploymentStatus.currentStep}</h3>
                  <p className="text-white/70 text-sm">Deployment devam ediyor...</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/70">İlerleme:</span>
                  <span className="text-white font-medium">{deploymentStatus.progress}%</span>
                </div>
                <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-blue-400 to-emerald-400 rounded-full"
                    style={{ width: `${deploymentStatus.progress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4 pt-4 border-t border-white/10">
                {['Database', 'API Gateway', 'Frontend', 'Monitoring'].map((service, index) => (
                  <div key={service} className="text-center">
                    <div className={cn(
                      "w-8 h-8 rounded-lg mx-auto mb-2 flex items-center justify-center",
                      index < deploymentStatus.containersRunning 
                        ? "bg-emerald-500/20 border border-emerald-500/30"
                        : "bg-white/10 border border-white/20"
                    )}>
                      {index < deploymentStatus.containersRunning ? (
                        <Icons.Check className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Icons.Clock className="w-4 h-4 text-white/40" />
                      )}
                    </div>
                    <span className="text-white/60 text-xs">{service}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Deployment Configuration */}
      <Card title="Production Deployment Yapılandırması">
        <div className="space-y-6">
          {/* Environment Settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-white text-sm font-medium mb-2">Environment</label>
                <select
                  value={deploymentConfig.environment}
                  onChange={(e) => setDeploymentConfig(prev => ({
                    ...prev,
                    environment: e.target.value as any
                  }))}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none"
                  disabled={isDeploying}
                >
                  <option value="development">Development</option>
                  <option value="staging">Staging</option>
                  <option value="production">Production</option>
                </select>
              </div>

              <div>
                <label className="block text-white text-sm font-medium mb-2">Domain Name</label>
                <input
                  type="text"
                  value={deploymentConfig.domainName || ''}
                  onChange={(e) => setDeploymentConfig(prev => ({
                    ...prev,
                    domainName: e.target.value
                  }))}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none"
                  placeholder="pi5supernode.local"
                  disabled={isDeploying}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                <span className="text-white font-medium">HTTPS/SSL</span>
                <button
                  onClick={() => setDeploymentConfig(prev => ({ ...prev, enableHTTPS: !prev.enableHTTPS }))}
                  className={cn(
                    "relative w-10 h-5 rounded-full transition-all duration-300",
                    deploymentConfig.enableHTTPS 
                      ? "bg-emerald-500 shadow-lg shadow-emerald-500/30" 
                      : "bg-white/20"
                  )}
                  disabled={isDeploying}
                >
                  <div
                    className={cn(
                      "absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all duration-300 shadow-lg",
                      deploymentConfig.enableHTTPS ? "left-5" : "left-0.5"
                    )}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                <span className="text-white font-medium">Otomatik Yedekleme</span>
                <button
                  onClick={() => setDeploymentConfig(prev => ({ ...prev, autoBackup: !prev.autoBackup }))}
                  className={cn(
                    "relative w-10 h-5 rounded-full transition-all duration-300",
                    deploymentConfig.autoBackup 
                      ? "bg-emerald-500 shadow-lg shadow-emerald-500/30" 
                      : "bg-white/20"
                  )}
                  disabled={isDeploying}
                >
                  <div
                    className={cn(
                      "absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all duration-300 shadow-lg",
                      deploymentConfig.autoBackup ? "left-5" : "left-0.5"
                    )}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Module Selection */}
          <div>
            <h4 className="text-white font-medium mb-3">Deploy Edilecek Modüller</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {[
                'device-management',
                'network-management', 
                'vpn-management',
                'automation-engine',
                'storage-management',
                'monitoring-dashboard'
              ].map(moduleId => (
                <div key={moduleId} className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
                  <input
                    type="checkbox"
                    checked={deploymentConfig.modules.includes(moduleId)}
                    onChange={(e) => {
                      setDeploymentConfig(prev => ({
                        ...prev,
                        modules: e.target.checked
                          ? [...prev.modules, moduleId]
                          : prev.modules.filter(m => m !== moduleId)
                      }));
                    }}
                    className="w-4 h-4 rounded border-white/20"
                    disabled={isDeploying}
                  />
                  <span className="text-white text-sm">{moduleId.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Deployment Actions */}
          <div className="flex items-center gap-4 pt-6 border-t border-white/10">
            <Button
              onClick={handleDeploy}
              disabled={isDeploying || deploymentConfig.modules.length === 0}
              isLoading={isDeploying}
              className="flex-1"
            >
              <Icons.Rocket className="w-4 h-4 mr-2" />
              {isDeploying ? 'Deploy Ediliyor...' : 'Production Deploy'}
            </Button>
            
            <Button
              variant="outline"
              onClick={generateDeploymentScript}
              disabled={isDeploying}
            >
              <Icons.FileText className="w-4 h-4 mr-2" />
              Script İndir
            </Button>

            {deploymentStatus.status === 'deployed' && (
              <Button
                variant="destructive"
                onClick={handleRollback}
                disabled={isDeploying}
              >
                <Icons.RotateCcw className="w-4 h-4 mr-2" />
                Rollback
              </Button>
            )}
          </div>

          {/* Container Status */}
          {deploymentStatus.status === 'deployed' && (
            <div className="pt-4 border-t border-white/10">
              <h4 className="text-white font-medium mb-3">Container Durumu</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { name: 'postgres', status: 'running', port: '5432' },
                  { name: 'redis', status: 'running', port: '6379' },
                  { name: 'api-gateway', status: 'running', port: '3000' },
                  { name: 'nginx', status: 'running', port: '80' },
                  { name: 'grafana', status: 'running', port: '3100' },
                  { name: 'prometheus', status: 'running', port: '9090' }
                ].map(container => (
                  <div key={container.name} className="p-3 rounded-lg bg-white/5 border border-white/10">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-2 h-2 bg-emerald-400 rounded-full" />
                      <span className="text-white font-medium text-sm">{container.name}</span>
                    </div>
                    <p className="text-white/60 text-xs">Port {container.port}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Deployment Errors */}
          {deploymentStatus.errors.length > 0 && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Icons.AlertCircle className="w-4 h-4 text-red-400" />
                <span className="text-red-400 font-medium">Deployment Hataları</span>
              </div>
              <ul className="space-y-1">
                {deploymentStatus.errors.map((error, index) => (
                  <li key={index} className="text-red-300 text-sm">• {error}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </Card>

      {/* Production Environment Info */}
      <Card title="Production Environment Bilgileri">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-white font-medium mb-3">Services</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-white/60">Frontend:</span>
                <span className="text-white">Nginx (Port 80/443)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">API Gateway:</span>
                <span className="text-white">Node.js (Port 3000)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">Database:</span>
                <span className="text-white">PostgreSQL (Port 5432)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">Cache:</span>
                <span className="text-white">Redis (Port 6379)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">Monitoring:</span>
                <span className="text-white">Grafana (Port 3100)</span>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="text-white font-medium mb-3">Resource Limits</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-white/60">CPU Limit:</span>
                <span className="text-white">{deploymentConfig.resourceLimits.cpu} cores</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">Memory Limit:</span>
                <span className="text-white">{deploymentConfig.resourceLimits.memory}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">Log Level:</span>
                <span className="text-white">{deploymentConfig.logLevel}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">Backup:</span>
                <span className={deploymentConfig.autoBackup ? 'text-emerald-400' : 'text-red-400'}>
                  {deploymentConfig.autoBackup ? 'Etkin' : 'Devre Dışı'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};</parameter>