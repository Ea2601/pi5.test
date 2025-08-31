# Pi5 Supernode Technical Specifications

## 🏗️ System Architecture Specifications

### Frontend Architecture

#### Component Hierarchy
```
App (Root)
├── Layout Components
│   ├── Navigation (Sidebar)
│   ├── Header (Top bar)
│   └── Main (Content area)
├── View Components
│   ├── Dashboard
│   ├── Devices
│   ├── Network
│   ├── VPN
│   ├── Automations
│   ├── Observability
│   ├── Storage
│   └── Settings
└── UI Components
    ├── Base (Button, Card, Input)
    ├── Composite (MetricCard, ChartCard)
    └── Feature (DeviceTable, VPNConfig)
```

#### State Management Structure
```typescript
interface AppState {
  // UI State
  ui: {
    currentView: string;
    isMenuCollapsed: boolean;
    selectedCard: string | null;
    theme: ThemeConfig;
    accessibility: AccessibilityConfig;
  };
  
  // Data State
  data: {
    devices: NetworkDevice[];
    vpnServers: WireGuardServer[];
    vpnClients: WireGuardClient[];
    metrics: SystemMetrics;
    automationRules: AutomationRule[];
  };
  
  // Cache State
  cache: {
    lastUpdated: Record<string, number>;
    queryCache: Record<string, any>;
  };
}
```

### Backend Architecture

#### Microservices Structure
```
Backend Services
├── API Gateway (Port 3000)
│   ├── Authentication
│   ├── Rate Limiting
│   ├── Request Routing
│   └── Response Aggregation
├── Network Service (Port 3001)
│   ├── Device Discovery
│   ├── Traffic Management
│   ├── DNS Configuration
│   └── DHCP Management
├── VPN Service (Port 3002)
│   ├── WireGuard Management
│   ├── Client Configuration
│   ├── Tunnel Monitoring
│   └── Certificate Management
└── Automation Service (Port 3003)
    ├── Rule Engine
    ├── Webhook Integration
    ├── Telegram Bot
    └── Scheduled Tasks
```

---

## 🗄️ Database Schema Optimization

### Enhanced Table Structures

#### Network Devices (Enhanced)
```sql
CREATE TABLE network_devices (
    -- Primary identification
    mac_address TEXT PRIMARY KEY,
    ip_address INET,
    ipv6_address INET,
    
    -- Device metadata
    device_name TEXT DEFAULT 'Unknown',
    device_type device_type_enum DEFAULT 'PC',
    device_brand TEXT DEFAULT 'Unknown',
    vendor_oui TEXT, -- MAC vendor lookup
    
    -- Network information
    hostname TEXT,
    dhcp_fingerprint TEXT,
    operating_system TEXT,
    user_agent TEXT,
    
    -- Status tracking
    is_active BOOLEAN DEFAULT TRUE,
    connection_type TEXT DEFAULT 'ethernet', -- ethernet, wifi, vpn
    signal_strength INTEGER, -- For WiFi devices
    
    -- Timestamps
    first_discovered TIMESTAMPTZ DEFAULT NOW(),
    last_seen TIMESTAMPTZ DEFAULT NOW(),
    dhcp_lease_expires TIMESTAMPTZ,
    
    -- Usage statistics
    total_bytes_sent BIGINT DEFAULT 0,
    total_bytes_received BIGINT DEFAULT 0,
    session_duration INTERVAL,
    
    -- Security
    risk_score INTEGER DEFAULT 0,
    blocked_attempts INTEGER DEFAULT 0,
    
    -- Metadata
    tags JSONB DEFAULT '[]',
    custom_config JSONB DEFAULT '{}',
    notes TEXT,
    
    -- Audit fields
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id)
);

-- Enhanced indexes
CREATE INDEX idx_network_devices_active ON network_devices(is_active, last_seen);
CREATE INDEX idx_network_devices_type ON network_devices(device_type);
CREATE INDEX idx_network_devices_ip ON network_devices USING GIST(ip_address inet_ops);
CREATE INDEX idx_network_devices_search ON network_devices USING GIN(
    to_tsvector('english', coalesce(device_name, '') || ' ' || coalesce(device_brand, ''))
);
```

#### Traffic Analytics (New)
```sql
CREATE TABLE traffic_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    device_mac TEXT REFERENCES network_devices(mac_address),
    
    -- Traffic metadata
    protocol TEXT NOT NULL, -- tcp, udp, icmp
    source_port INTEGER,
    destination_port INTEGER,
    destination_domain TEXT,
    application_type TEXT, -- web, gaming, streaming, etc.
    
    -- Volume metrics
    bytes_sent BIGINT DEFAULT 0,
    bytes_received BIGINT DEFAULT 0,
    packets_sent INTEGER DEFAULT 0,
    packets_received INTEGER DEFAULT 0,
    
    -- Quality metrics
    latency_ms INTEGER,
    packet_loss_percent DECIMAL(5,2),
    jitter_ms INTEGER,
    
    -- Time-based aggregation
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    aggregation_period INTERVAL DEFAULT '1 minute',
    
    -- Routing information
    tunnel_used UUID REFERENCES tunnel_pools(id),
    rule_applied UUID REFERENCES traffic_rules(id),
    
    -- Analysis
    anomaly_score DECIMAL(3,2) DEFAULT 0.0,
    threat_level TEXT DEFAULT 'none' -- none, low, medium, high
);

-- Partitioning for performance
CREATE INDEX idx_traffic_analytics_timestamp ON traffic_analytics(timestamp) 
WHERE timestamp >= NOW() - INTERVAL '30 days';
```

#### User Sessions (New)
```sql
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    
    -- Session metadata
    device_mac TEXT REFERENCES network_devices(mac_address),
    session_token TEXT UNIQUE NOT NULL,
    ip_address INET NOT NULL,
    user_agent TEXT,
    
    -- Session timing
    started_at TIMESTAMPTZ DEFAULT NOW(),
    last_activity TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL,
    ended_at TIMESTAMPTZ,
    
    -- Session data
    permissions JSONB DEFAULT '[]',
    preferences JSONB DEFAULT '{}',
    activity_log JSONB DEFAULT '[]',
    
    -- Security
    is_suspicious BOOLEAN DEFAULT FALSE,
    failed_attempts INTEGER DEFAULT 0,
    location_data JSONB,
    
    -- Audit
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 🔧 API Specifications

### Enhanced REST API Design

#### Device Management Endpoints
```typescript
// GET /api/v1/devices
interface GetDevicesResponse {
  success: boolean;
  data: NetworkDevice[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  aggregations: {
    byType: Record<string, number>;
    byStatus: Record<string, number>;
    byBrand: Record<string, number>;
  };
}

// POST /api/v1/devices/:mac/actions
interface DeviceActionRequest {
  action: 'wake' | 'block' | 'unblock' | 'reset' | 'update';
  parameters?: Record<string, any>;
}
```

#### Real-time WebSocket Events
```typescript
interface WebSocketEvents {
  // Device events
  'device:connected': { device: NetworkDevice; timestamp: string };
  'device:disconnected': { mac: string; timestamp: string };
  'device:updated': { device: NetworkDevice; changes: string[] };
  
  // System events
  'system:metrics': { metrics: SystemMetrics; timestamp: string };
  'system:alert': { level: string; message: string; source: string };
  
  // VPN events
  'vpn:client_connected': { client: WireGuardClient; server: string };
  'vpn:tunnel_status': { tunnel: string; status: string; metrics: TunnelMetrics };
}
```

---

## 🎨 Design System Specifications

### Color Palette Enhancement
```css
:root {
  /* Base colors */
  --color-black-base: #000000;
  --color-white-base: #ffffff;
  
  /* Glassmorphism backgrounds */
  --glass-bg-primary: rgba(0, 0, 0, 0.2);
  --glass-bg-secondary: rgba(0, 0, 0, 0.1);
  --glass-bg-tertiary: rgba(0, 0, 0, 0.05);
  
  /* Border colors */
  --glass-border-primary: rgba(255, 255, 255, 0.1);
  --glass-border-secondary: rgba(255, 255, 255, 0.05);
  
  /* Neon accent colors */
  --neon-emerald: #00A36C;
  --neon-emerald-light: #00C981;
  --neon-emerald-dark: #0b7e5d;
  
  --neon-gold: #FFD700;
  --neon-gold-light: #FFF700;
  --neon-gold-dark: #B8A700;
  
  --neon-blue: #00D4FF;
  --neon-purple: #A855F7;
  --neon-orange: #F59E0B;
  --neon-red: #EF4444;
  
  /* Status colors */
  --status-success: var(--neon-emerald);
  --status-warning: var(--neon-orange);
  --status-error: var(--neon-red);
  --status-info: var(--neon-blue);
  
  /* Shadows */
  --shadow-glow-emerald: 0 0 20px rgba(0, 163, 108, 0.3);
  --shadow-glow-gold: 0 0 20px rgba(255, 215, 0, 0.3);
  --shadow-card: 0 8px 32px rgba(0, 0, 0, 0.3);
  
  /* Typography */
  --font-heading: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --font-body: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --font-mono: 'SF Mono', Monaco, 'Cascadia Code', monospace;
}
```

### Typography Scale
```css
.text-scale {
  /* Display (Marketing headers) */
  --text-display-2xl: 4.5rem; /* 72px */
  --text-display-xl: 3.75rem; /* 60px */
  --text-display-lg: 3rem;    /* 48px */
  
  /* Headings */
  --text-heading-xl: 2.25rem; /* 36px */
  --text-heading-lg: 1.875rem; /* 30px */
  --text-heading-md: 1.5rem;   /* 24px */
  --text-heading-sm: 1.25rem;  /* 20px */
  
  /* Body text */
  --text-body-lg: 1.125rem; /* 18px */
  --text-body-md: 1rem;     /* 16px */
  --text-body-sm: 0.875rem; /* 14px */
  --text-body-xs: 0.75rem;  /* 12px */
}
```

---

## 📱 Responsive Design Specifications

### Breakpoint System
```typescript
export const breakpoints = {
  xs: '320px',   // Small mobile (iPhone SE)
  sm: '640px',   // Mobile (iPhone 12)
  md: '768px',   // Tablet (iPad Mini)
  lg: '1024px',  // Desktop (MacBook Air)
  xl: '1280px',  // Large desktop (iMac)
  '2xl': '1536px' // Extra large (Pro Display)
} as const;

export const queries = {
  xs: `(min-width: ${breakpoints.xs})`,
  sm: `(min-width: ${breakpoints.sm})`,
  md: `(min-width: ${breakpoints.md})`,
  lg: `(min-width: ${breakpoints.lg})`,
  xl: `(min-width: ${breakpoints.xl})`,
  '2xl': `(min-width: ${breakpoints['2xl']})`,
} as const;
```

### Grid System
```css
.grid-responsive {
  display: grid;
  gap: 1.5rem;
  
  /* Mobile first */
  grid-template-columns: 1fr;
  
  /* Tablet */
  @media (min-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  /* Desktop */
  @media (min-width: 1024px) {
    grid-template-columns: repeat(3, 1fr);
  }
  
  /* Large desktop */
  @media (min-width: 1280px) {
    grid-template-columns: repeat(4, 1fr);
  }
}
```

---

## 🔒 Security Specifications

### Frontend Security Headers
```typescript
// src/utils/security.ts
export const securityHeaders = {
  'Content-Security-Policy': `
    default-src 'self';
    script-src 'self' 'unsafe-inline' 'unsafe-eval';
    style-src 'self' 'unsafe-inline' fonts.googleapis.com;
    font-src 'self' fonts.gstatic.com;
    img-src 'self' data: https:;
    connect-src 'self' wss: ws:;
  `.replace(/\s+/g, ' ').trim(),
  
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
};
```

### Data Sanitization
```typescript
// src/utils/sanitization.ts
export const sanitize = {
  macAddress: (mac: string): string => {
    return mac.replace(/[^a-fA-F0-9:]/g, '').toLowerCase();
  },
  
  ipAddress: (ip: string): string => {
    const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
    return ipv4Regex.test(ip) ? ip : '';
  },
  
  deviceName: (name: string): string => {
    return name.replace(/[<>]/g, '').slice(0, 255);
  }
};
```

---

## ⚡ Performance Specifications

### Loading Performance Targets
```typescript
export const performanceTargets = {
  // Core Web Vitals
  LCP: 2500,    // Largest Contentful Paint (ms)
  FID: 100,     // First Input Delay (ms)
  CLS: 0.1,     // Cumulative Layout Shift
  
  // Custom metrics
  initialLoad: 2000,      // Time to interactive (ms)
  apiResponse: 500,       // Average API response (ms)
  componentMount: 100,    // Component mount time (ms)
  chartRender: 300,       // Chart rendering time (ms)
  
  // Bundle sizes
  initialBundle: 500,     // KB
  chunkSize: 100,         // KB per chunk
  totalAssets: 2000,      // KB total
};
```

### Optimization Strategies
```typescript
// src/utils/optimization.ts
export const optimizations = {
  // Image optimization
  lazyLoadImages: (selector: string) => {
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement;
            img.src = img.dataset.src!;
            img.classList.remove('lazy');
            imageObserver.unobserve(img);
          }
        });
      });
      
      document.querySelectorAll(selector).forEach(img => {
        imageObserver.observe(img);
      });
    }
  },
  
  // Component lazy loading
  loadComponentWhenVisible: <T extends React.ComponentType<any>>(
    factory: () => Promise<{ default: T }>,
    fallback: React.ComponentType = () => <div>Loading...</div>
  ) => {
    return lazy(factory);
  }
};
```

---

## 🧪 Testing Specifications

### Testing Strategy
```typescript
// src/utils/testing.ts
export interface TestConfig {
  unit: {
    coverage: 90;
    frameworks: ['vitest', 'testing-library'];
    patterns: ['**/*.test.{ts,tsx}'];
  };
  
  integration: {
    coverage: 80;
    frameworks: ['cypress', 'playwright'];
    scenarios: ['user-flows', 'api-integration'];
  };
  
  e2e: {
    browsers: ['chrome', 'firefox', 'safari'];
    viewports: ['mobile', 'tablet', 'desktop'];
    scenarios: ['critical-paths', 'edge-cases'];
  };
  
  performance: {
    tools: ['lighthouse', 'web-vitals'];
    thresholds: typeof performanceTargets;
  };
}
```

### Test Utilities
```typescript
// src/utils/testUtils.tsx
export const renderWithProviders = (
  ui: React.ReactElement,
  options?: {
    preloadedState?: Partial<AppState>;
    store?: AppStore;
  }
) => {
  const store = options?.store || createTestStore(options?.preloadedState);
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <StoreProvider store={store}>
        {children}
      </StoreProvider>
    </QueryClientProvider>
  );

  return render(ui, { wrapper: Wrapper });
};
```

---

## 📊 Analytics and Monitoring

### User Analytics
```typescript
// src/utils/analytics.ts
export interface AnalyticsEvent {
  event: string;
  properties: Record<string, any>;
  timestamp: number;
  sessionId: string;
  userId?: string;
}

export const analytics = {
  track: (event: string, properties?: Record<string, any>) => {
    // Implementation for tracking user interactions
  },
  
  identify: (userId: string, traits?: Record<string, any>) => {
    // User identification for personalization
  },
  
  page: (name: string, properties?: Record<string, any>) => {
    // Page view tracking
  }
};
```

### System Health Monitoring
```typescript
// src/utils/healthCheck.ts
export interface HealthCheckResult {
  service: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  latency: number;
  lastCheck: string;
  details?: Record<string, any>;
}

export const healthMonitor = {
  checkAll: async (): Promise<HealthCheckResult[]> => {
    const services = ['api-gateway', 'network-service', 'vpn-service', 'database'];
    return Promise.all(services.map(service => checkServiceHealth(service)));
  },
  
  watchSystemHealth: (callback: (health: HealthCheckResult[]) => void) => {
    // Real-time health monitoring
  }
};
```

---

## 🔄 Migration and Deployment

### Zero-Downtime Deployment Strategy
```yaml
# deployment/strategy.yml
deployment:
  strategy: blue-green
  
  phases:
    1. preparation:
        - backup_database
        - validate_environment
        - pre_migration_checks
    
    2. deployment:
        - deploy_new_version
        - run_health_checks
        - gradual_traffic_shift
    
    3. validation:
        - functionality_tests
        - performance_validation
        - user_acceptance_testing
    
    4. completion:
        - cleanup_old_version
        - update_documentation
        - post_deployment_monitoring

  rollback:
    triggers:
      - health_check_failure
      - performance_degradation
      - user_reported_issues
    
    procedure:
      - immediate_traffic_redirect
      - system_state_restoration
      - incident_documentation
```

This technical specification provides the foundation for implementing a robust, scalable, and maintainable network management platform while preserving all existing functionality and enhancing the user experience.