import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; retry: () => void }>;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error boundary caught error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return <FallbackComponent error={this.state.error!} retry={this.handleRetry} />;
      }

      return (
        <div className="flex items-center justify-center min-h-[400px] p-6">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 mx-auto mb-4 bg-red-500/20 rounded-xl flex items-center justify-center">
              <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.664-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Bir hata oluştu</h3>
            <p className="text-white/70 text-sm mb-4">
              Sayfa yüklenirken beklenmeyen bir hata meydana geldi.
            </p>
            <button
              onClick={this.handleRetry}
              className="px-4 py-2 bg-emerald-600/20 border border-emerald-500/30 text-white rounded-xl hover:bg-emerald-500/30 transition-colors"
            >
              Tekrar Dene
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Network-specific error fallback
export const NetworkErrorFallback: React.FC<{ error: Error; retry: () => void }> = ({ error, retry }) => (
  <div className="flex items-center justify-center min-h-[400px] p-6">
    <div className="text-center max-w-md">
      <div className="w-16 h-16 mx-auto mb-4 bg-orange-500/20 rounded-xl flex items-center justify-center">
        <svg className="w-8 h-8 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.291-1.1-5.7-2.836" />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">Ağ Bağlantı Sorunu</h3>
      <p className="text-white/70 text-sm mb-4">
        Ağ servisleri şu anda erişilebilir değil. Bağlantı kontrol ediliyor...
      </p>
      <button
        onClick={retry}
        className="px-4 py-2 bg-blue-600/20 border border-blue-500/30 text-white rounded-xl hover:bg-blue-500/30 transition-colors"
      >
        Bağlantıyı Tekrar Dene
      </button>
    </div>
  </div>
);