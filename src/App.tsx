import React, { Suspense } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HelmetProvider } from 'react-helmet-async';
import { Navigation } from './components/layout/Navigation';
import { SEOMeta } from './components/SEO/SEOMeta';
import { useAppStore } from './store';
import { cn } from './lib/utils';
import { useAccessibility } from './hooks/ui/useAccessibility';

// Lazy load views for better performance
const Dashboard = React.lazy(() => import('./components/views/Dashboard'));
const Devices = React.lazy(() => import('./components/views/Devices'));
const Network = React.lazy(() => import('./components/views/Network'));
const VPN = React.lazy(() => import('./components/views/VPN'));
const Automations = React.lazy(() => import('./components/views/Automations'));
const Observability = React.lazy(() => import('./components/views/Observability'));
const Settings = React.lazy(() => import('./components/views/Settings'));
const Storage = React.lazy(() => import('./components/views/Storage'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30000, // 30 seconds
      cacheTime: 300000, // 5 minutes
      refetchOnWindowFocus: false,
      retry: 3,
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000)
    }
  }
});

// Loading component
const LoadingSpinner: React.FC = () => (
  <div className="flex items-center justify-center h-96">
    <div className="w-8 h-8 border-2 border-white/30 border-t-emerald-400 rounded-full animate-spin" />
  </div>
);

// Error Boundary Component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  state = { hasError: false, error: undefined };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('UI Error Boundary caught error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          height: '50vh', 
          padding: '24px',
          color: 'white'
        }}>
          <div style={{ textAlign: 'center' }}>
            <h2 style={{ fontSize: '24px', marginBottom: '16px' }}>Bir şeyler ters gitti</h2>
            <p style={{ marginBottom: '24px', opacity: 0.7 }}>
              Sayfa yüklenirken bir hata oluştu. Lütfen sayfayı yenileyin.
            </p>
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: '8px 16px',
                background: 'rgba(0, 163, 108, 0.2)',
                border: '1px solid rgba(0, 163, 108, 0.3)',
                borderRadius: '8px',
                color: 'rgb(52, 211, 153)',
                cursor: 'pointer'
              }}
            >
              Sayfayı Yenile
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

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

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <Dashboard />
        );
      case 'devices':
        return (
          <Devices />
        );
      case 'network':
        return (
          <Network />
        );
      case 'vpn':
        return (
          <VPN />
        );
      case 'automations':
        return (
          <Automations />
        );
      case 'observability':
        return (
          <Observability />
        );
      case 'storage':
        return (
          <Storage />
        );
      case 'nvr':
        return <PlaceholderView title="Ağ Video Kaydedici" description="Frigate video yönetimi ve güvenlik kameraları" />;
      case 'ai':
        return <PlaceholderView title="Yapay Zeka Asistanı" description="Akıllı ağ yardımı ve otomasyon" />;
      case 'settings':
        return (
          <Settings />
        );
      default:
        return (
          <Dashboard />
        );
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
      <QueryClientProvider client={queryClient}>
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
              <ErrorBoundary key={currentView}>
                <Suspense fallback={<LoadingSpinner />}>
                  {renderView()}
                </Suspense>
              </ErrorBoundary>
            </div>
          </main>
        </div>
      </QueryClientProvider>
    </HelmetProvider>
  );
}

export default App;