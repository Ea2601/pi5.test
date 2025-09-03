import React, { Suspense } from 'react';
import { QueryProvider } from './components/providers/QueryProvider';
import { HelmetProvider } from './components/providers/HelmetProvider';
import { Navigation } from './components/layout/Navigation';
import { SEOMeta } from './components/SEO/SEOMeta';
import { Card } from './components/ui/Card';
import { Icons } from './components/ui';
import { useAppStore } from './store';
import { moduleManager } from './core/ModuleManager';
import { moduleRegistry } from './core/ModuleRegistry';
import { cn } from './lib/utils';
import { useAccessibility } from './hooks/ui/useAccessibility';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import { LoadingSpinner } from './components/loading';

// Lazy load views for better performance
const Dashboard = React.lazy(() => import('./components/views/Dashboard'));
const Devices = React.lazy(() => import('./components/views/Devices'));
const Network = React.lazy(() => import('./components/views/Network'));
const VPN = React.lazy(() => import('./components/views/VPN'));
const Automations = React.lazy(() => import('./components/views/Automations'));
const Observability = React.lazy(() => import('./components/views/Observability'));
const Settings = React.lazy(() => import('./components/views/Settings'));
const Storage = React.lazy(() => import('./components/views/Storage'));

// Import modular components
const NetworkModule = React.lazy(() => import('./modules/NetworkModule'));
const VPNModule = React.lazy(() => import('./modules/VPNModule'));
const AutomationModule = React.lazy(() => import('./modules/AutomationModule'));
const StorageModule = React.lazy(() => import('./modules/StorageModule'));
const MonitoringModule = React.lazy(() => import('./modules/MonitoringModule'));
const SystemSettingsModule = React.lazy(() => import('./modules/SystemSettingsModule'));

// Placeholder component for unimplemented views
const PlaceholderView: React.FC<{ title: string; description: string }> = ({ title, description }) => (
  <div className="flex items-center justify-center h-96">
    <div className="text-center">
      <h1 className="text-2xl font-bold text-white mb-2">{title}</h1>
      <p className="text-white/70">{description}</p>
    </div>
  </div>
);

function App() {
  const { currentView, isMenuCollapsed } = useAppStore();
  const { isReducedMotion } = useAccessibility();
  const [isModularSystemReady, setIsModularSystemReady] = React.useState(false);

  // Initialize module system
  React.useEffect(() => {
    const initializeModularSystem = async () => {
      try {
        await moduleRegistry.initialize();
        
        // Make module manager globally available
        (window as any).moduleManager = moduleManager;
        
        setIsModularSystemReady(true);
      } catch (error) {
        console.error('Failed to initialize modular system:', error);
        setIsModularSystemReady(true); // Continue with fallback
      }
    };

    initializeModularSystem();
  }, []);

  const renderView = () => {
    // If modular system is ready, use modular components
    if (isModularSystemReady) {
      return renderModularView();
    }
    
    // Fallback to original components during loading
    return renderFallbackView();
  };

  const renderModularView = () => {
    try {
      switch (currentView) {
        case 'dashboard':
          return <Dashboard />;
        case 'devices':
          return <ModularComponent moduleId="device-management" />;
        case 'network':
          return <ModularComponent moduleId="network-management" />;
        case 'vpn':
          return <ModularComponent moduleId="vpn-management" />;
        case 'automations':
          return <ModularComponent moduleId="automation-engine" />;
        case 'observability':
          return <ModularComponent moduleId="monitoring-dashboard" />;
        case 'storage':
          return <ModularComponent moduleId="storage-management" />;
        case 'nvr':
          return <PlaceholderView title="Ağ Video Kaydedici" description="Frigate video yönetimi ve güvenlik kameraları" />;
        case 'ai':
          return <PlaceholderView title="Yapay Zeka Asistanı" description="Akıllı ağ yardımı ve otomasyon" />;
        case 'settings':
          return <ModularComponent moduleId="system-settings" fallback={<Settings />} />;
        default:
          return <Dashboard />;
      }
    } catch (error) {
      console.error('Modular view error:', error);
      return renderFallbackView();
    }
  };

  const renderFallbackView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />;
      case 'devices':
        return <Devices />;
      case 'network':
        return <Network />;
      case 'vpn':
        return <VPN />;
      case 'automations':
        return <Automations />;
      case 'observability':
        return <Observability />;
      case 'storage':
        return <Storage />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  const getPageMeta = () => {
    const viewMeta = {
      dashboard: {
        title: 'Panel',
        description: 'Pi5 Süpernode ağ yönetimi paneli - Canlı sistem metrikleri ve cihaz izleme'
      },
      devices: {
        title: 'Cihaz Yönetimi',
        description: 'Ağ cihazları yönetimi, keşfi ve yapılandırması'
      },
      network: {
        title: 'Ağ Yönetimi',
        description: 'DNS, DHCP, Wi-Fi ve ağ topolojisi yönetimi'
      },
      vpn: {
        title: 'VPN Yönetimi',
        description: 'WireGuard VPN sunucu ve istemci yönetimi'
      },
      automations: {
        title: 'Otomasyon',
        description: 'Akıllı ağ otomasyonu ve entegrasyon yönetimi'
      },
      observability: {
        title: 'Sistem İzleme',
        description: 'Grafana, Prometheus ve sistem metrik izleme'
      },
      storage: {
        title: 'Depolama Yönetimi',
        description: 'USB cihazları ve ağ paylaşım yönetimi'
      },
      settings: {
        title: 'Sistem Ayarları',
        description: 'Sistem yapılandırması ve dökümantasyon'
      }
    };

    return viewMeta[currentView as keyof typeof viewMeta] || viewMeta.dashboard;
  };

  return (
    <HelmetProvider>
      <QueryProvider>
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-emerald-900">
          {/* SEO Meta Tags */}
          <SEOMeta
            title={getPageMeta().title}
            description={getPageMeta().description}
            keywords={['raspberry pi', 'network management', 'vpn', 'enterprise']}
          />

          {/* Background Pattern */}
          <div className="fixed inset-0 opacity-30">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%23ffffff%22 fill-opacity=%220.02%22%3E%3Cpath d=%22M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20" />
          </div>

          {/* Navigation */}
          <Navigation />

          {/* Main Content */}
          <main 
            className={cn(
              "transition-all duration-300 min-h-screen",
              "md:ml-64", // Desktop margin
              isMenuCollapsed && "md:ml-16" // Collapsed desktop margin
            )}
            style={{
              marginLeft: window.innerWidth < 768 ? 0 : undefined // Mobile: no margin
            }}
          >
            <div className="p-4 md:p-6">
              <ErrorBoundary>
                <Suspense fallback={<LoadingSpinner />}>
                  {renderView()}
                </Suspense>
              </ErrorBoundary>
            </div>
          </main>
        </div>
      </QueryProvider>
    </HelmetProvider>
  );
}

// Modular Component Renderer
const ModularComponent: React.FC<{ 
  moduleId: string; 
  fallback?: React.ComponentType<any> 
}> = ({ moduleId, fallback: Fallback }) => {
  const [moduleComponent, setModuleComponent] = React.useState<React.ComponentType<any> | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const loadModule = async () => {
      try {
        const module = (window as any).moduleManager?.getModule(moduleId);
        if (module) {
          const Component = module.getComponent();
          setModuleComponent(() => Component);
        } else if (Fallback) {
          setModuleComponent(() => Fallback);
        } else {
          setError(`Module not found: ${moduleId}`);
        }
      } catch (error) {
        setError((error as Error).message);
        if (Fallback) {
          setModuleComponent(() => Fallback);
        }
      }
    };
    loadModule();
  }, [moduleId, Fallback]);

  if (error && !Fallback) {
    return (
      <div className="flex items-center justify-center h-96">
        <Card>
          <div className="text-center p-6">
            <Icons.AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h3 className="text-white font-semibold mb-2">Modül Yüklenemedi</h3>
            <p className="text-white/70 text-sm">{error}</p>
          </div>
        </Card>
      </div>
    );
  }

  if (!moduleComponent) {
    return <LoadingSpinner />;
  }

  const Component = moduleComponent;
  return <Component />;
};

// Placeholder component for unimplemented views

export default App;