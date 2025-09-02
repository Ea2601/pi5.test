# Pi5 Supernode - Complete System Architecture

## 🏗️ Architecture Overview

Pi5 Supernode is a comprehensive network management platform built with modern microservices architecture, designed for enterprise-grade network administration on Raspberry Pi 5 hardware.

### System Components

```
┌─────────────────────────────────────────────────────────────────┐
│                    Pi5 Supernode Architecture                   │
├─────────────────────────────────────────────────────────────────┤
│ Frontend Layer (React + TypeScript)                            │
│ ├── React 18.3.1 with TypeScript 5.5.3                        │
│ ├── Tailwind CSS 3.4.1 for styling                            │
│ ├── Framer Motion 12.23.12 for animations                     │
│ ├── React Query 5.85.5 for data fetching                      │
│ ├── Zustand 5.0.8 for state management                        │
│ └── Recharts 3.1.2 for data visualization                     │
├─────────────────────────────────────────────────────────────────┤
│ Backend Services (Node.js + Express)                           │
│ ├── API Gateway (Port 3000) - Request routing & auth          │
│ ├── Network Service (Port 3001) - Device & traffic mgmt       │
│ ├── VPN Service (Port 3002) - WireGuard management            │
│ └── Automation Service (Port 3003) - Rules & integrations     │
├─────────────────────────────────────────────────────────────────┤
│ Database Layer                                                  │
│ ├── PostgreSQL 15 (Primary database)                          │
│ ├── Redis 7 (Caching & sessions)                              │
│ └── Supabase (Database management & real-time)                │
├─────────────────────────────────────────────────────────────────┤
│ Infrastructure & Monitoring                                    │
│ ├── Nginx (Reverse proxy & load balancer)                     │
│ ├── Prometheus (Metrics collection)                           │
│ ├── Grafana (Monitoring dashboards)                           │
│ ├── Loki (Log aggregation)                                    │
│ └── Docker Compose (Container orchestration)                  │
└─────────────────────────────────────────────────────────────────┘
```

## 📁 Project Structure

### Frontend Structure
```
src/
├── components/
│   ├── ui/                    # Base design system components
│   │   ├── Button.tsx         # Unified button component
│   │   ├── Card.tsx           # Glass-morphism card container
│   │   ├── Modal.tsx          # Modal dialog component
│   │   └── types.ts           # Component type definitions
│   ├── views/                 # Main application views
│   │   ├── Dashboard.tsx      # System overview & metrics
│   │   ├── Devices.tsx        # Network device management
│   │   ├── Network.tsx        # Network configuration hub
│   │   ├── VPN.tsx            # VPN server/client management
│   │   ├── Automations.tsx    # Rule engine & integrations
│   │   ├── Observability.tsx  # Monitoring & analytics
│   │   ├── Storage.tsx        # USB & network storage
│   │   └── Settings.tsx       # System configuration
│   ├── cards/                 # Specialized card components
│   │   ├── MetricCard.tsx     # KPI display cards
│   │   ├── TableCard.tsx      # Data table containers
│   │   ├── ChartCard.tsx      # Chart visualization
│   │   ├── LogCard.tsx        # Real-time log display
│   │   └── ControlCard.tsx    # Interactive controls
│   ├── layout/                # Layout components
│   │   └── Navigation.tsx     # Responsive sidebar navigation
│   ├── network/               # Network management components
│   │   ├── NetworkSettings.tsx # Network configuration
│   │   ├── DNSManagement.tsx   # DNS server management
│   │   ├── DHCPManagement.tsx  # DHCP pool management
│   │   └── WiFiManagement.tsx  # Wi-Fi configuration
│   ├── vpn/                   # VPN management components
│   │   ├── ServerManagement.tsx # WireGuard servers
│   │   ├── ClientManagement.tsx # WireGuard clients
│   │   └── AutoWGInstaller.tsx  # Automated installation
│   └── topology/              # Network topology components
│       ├── NetworkTopology.tsx  # Visual network map
│       ├── VLANManagement.tsx   # VLAN configuration
│       └── TrafficFlow.tsx      # Traffic visualization
├── hooks/
│   ├── api/                   # API integration hooks
│   │   ├── useDevices.ts      # Device management
│   │   ├── useDHCP.ts         # DHCP operations
│   │   ├── useDNS.ts          # DNS management
│   │   ├── useWiFi.ts         # Wi-Fi operations
│   │   ├── useWireGuard.ts    # VPN management
│   │   └── usePerformance.ts  # System metrics
│   └── ui/                    # UI state management
│       └── useAccessibility.ts # Accessibility features
├── services/                  # External service integrations
│   ├── unifiedApiClient.ts    # Centralized API client
│   └── index.ts               # Service exports
├── types/                     # TypeScript definitions
│   ├── index.ts               # Common types
│   ├── dns.ts                 # DNS-specific types
│   ├── dhcp.ts                # DHCP-specific types
│   ├── wifi.ts                # Wi-Fi-specific types
│   ├── topology.ts            # Network topology types
│   └── speedTest.ts           # Performance testing types
├── store/                     # State management
│   └── index.ts               # Zustand store configuration
├── utils/                     # Utility functions
│   ├── performance.ts         # Performance monitoring
│   └── [other utilities]
└── styles/                    # Global styles & design system
    ├── globals.css            # Global styles & variables
    └── cta-buttons.css        # Button design system
```

### Backend Structure
```
backend/
├── shared/                    # Shared utilities & types
│   ├── types/                 # Common TypeScript types
│   ├── config/                # Environment configuration
│   └── utils/                 # Shared utility functions
├── api-gateway/               # Main API gateway service
│   ├── src/
│   │   ├── routes/            # API route definitions
│   │   ├── middleware/        # Express middleware
│   │   ├── services/          # Business logic services
│   │   └── index.ts           # Main application entry
│   ├── Dockerfile.optimized   # Optimized Docker build
│   └── package.json           # Service dependencies
├── network-service/           # Network management service
│   ├── src/
│   │   ├── controllers/       # Request handlers
│   │   ├── services/          # Network operations
│   │   └── routes/            # Network API routes
│   └── [similar structure]
├── vpn-service/               # WireGuard VPN service
│   ├── src/
│   │   ├── controllers/       # VPN operations
│   │   ├── services/          # WireGuard integration
│   │   └── scripts/           # System integration scripts
│   └── [similar structure]
└── automation-service/        # Automation & integrations
    ├── src/
    │   ├── controllers/       # Automation handlers
    │   ├── services/          # External integrations
    │   ├── jobs/              # Scheduled tasks
    │   └── webhooks/          # Webhook handlers
    └── [similar structure]
```

### Database Schema
```
Supabase Database Tables:
├── network_devices           # Connected device inventory
├── traffic_rules            # Traffic routing policies
├── client_groups            # Device grouping for policies
├── tunnel_pools             # VPN tunnel configurations
├── routing_history          # Historical routing decisions
├── tunnel_performance       # VPN performance metrics
├── dns_servers              # DNS server configurations
├── dns_profiles             # DNS filtering profiles
├── dns_query_logs           # DNS query logging
├── dhcp_pools               # DHCP IP pool definitions
├── dhcp_reservations        # Static IP assignments
├── dhcp_leases              # Active DHCP leases
├── wifi_access_points       # Wi-Fi hardware management
├── wifi_networks            # SSID configurations
├── wifi_clients             # Connected Wi-Fi devices
├── device_configurations    # System device configurations
├── wan_profiles             # WAN connection profiles
├── vlan_catalog             # VLAN definitions
├── security_policies        # Security rule definitions
└── auto_wg_installations    # WireGuard installation history
```

## 🔧 Technology Stack

### Frontend Technologies
- **React 18.3.1**: Component-based UI framework
- **TypeScript 5.5.3**: Static type checking
- **Vite 5.4.2**: Build tool and development server
- **Tailwind CSS 3.4.1**: Utility-first CSS framework
- **Framer Motion 12.23.12**: Animation library
- **React Query 5.85.5**: Server state management
- **Zustand 5.0.8**: Client state management
- **Recharts 3.1.2**: Data visualization
- **Lucide React 0.344.0**: Icon system
- **React Helmet Async 2.0.5**: SEO management

### Backend Technologies
- **Node.js 18+**: Runtime environment
- **Express.js 4.19.2**: Web application framework
- **TypeScript 5.5.3**: Type safety
- **Joi 17.13.3**: Data validation
- **Winston 3.13.0**: Logging framework
- **Axios 1.11.0**: HTTP client
- **CORS 2.8.5**: Cross-origin resource sharing
- **Helmet 7.1.0**: Security middleware
- **Express Rate Limit 7.3.1**: Rate limiting

### Database & Infrastructure
- **PostgreSQL 15**: Primary database
- **Redis 7**: Caching and session storage
- **Supabase**: Database management and real-time features
- **Docker & Docker Compose**: Containerization
- **Nginx**: Reverse proxy and load balancer
- **Prometheus**: Metrics collection
- **Grafana**: Monitoring dashboards
- **Loki**: Log aggregation

### Development Tools
- **ESLint 9.9.1**: Code linting
- **Prettier**: Code formatting
- **Husky**: Git hooks
- **Commitlint**: Commit message linting
- **Vitest**: Testing framework
- **Playwright**: E2E testing

## 🌐 API Architecture

### RESTful API Design
All services follow consistent RESTful API principles:

- **Standardized Response Format**: All endpoints return uniform `ApiResponse<T>` format
- **Error Handling**: Consistent error codes and messages across services
- **Authentication**: JWT-based authentication with refresh token support
- **Rate Limiting**: Configurable rate limits per endpoint
- **Validation**: Joi schema validation for all inputs
- **Documentation**: OpenAPI 3.0 specification for all endpoints

### Service Communication
```
Frontend ←→ API Gateway ←→ Microservices ←→ Database
    ↓           ↓              ↓              ↓
WebSocket   Load Balancer   Service Mesh   Connection Pool
```

### Real-time Features
- **WebSocket Connections**: Real-time device status updates
- **Server-Sent Events**: Live metrics streaming
- **Database Triggers**: Automatic change notifications
- **Event Sourcing**: Audit trail for all configuration changes

## 🔒 Security Architecture

### Authentication & Authorization
- **JWT Tokens**: Secure token-based authentication
- **Role-Based Access Control (RBAC)**: Granular permission system
- **Row Level Security (RLS)**: Database-level access control
- **API Key Management**: Service-to-service authentication
- **Session Management**: Secure session handling with Redis

### Network Security
- **HTTPS/TLS**: End-to-end encryption
- **CORS Configuration**: Secure cross-origin requests
- **Input Validation**: All user inputs validated and sanitized
- **SQL Injection Prevention**: Parameterized queries only
- **XSS Protection**: Content Security Policy implementation
- **Rate Limiting**: DDoS protection and abuse prevention

### VPN Security
- **WireGuard Protocol**: Modern, secure VPN implementation
- **Key Rotation**: Automatic key rotation for enhanced security
- **Perfect Forward Secrecy**: Each session uses unique keys
- **Network Segmentation**: VLAN-based traffic isolation
- **Firewall Integration**: Automatic iptables rule management

## 📊 Performance Optimization

### Frontend Optimization
- **Code Splitting**: Lazy loading of route components
- **Tree Shaking**: Elimination of unused code
- **Bundle Analysis**: Regular bundle size monitoring
- **Caching Strategy**: Aggressive caching of static assets
- **Image Optimization**: WebP format with fallbacks
- **Service Worker**: Offline capability and caching

### Backend Optimization
- **Connection Pooling**: Efficient database connections
- **Query Optimization**: Indexed queries and query analysis
- **Caching Layers**: Redis for frequently accessed data
- **Compression**: Gzip/Brotli compression for API responses
- **Resource Limits**: Container resource management
- **Health Checks**: Proactive service monitoring

### Database Optimization
- **Indexing Strategy**: Optimized indexes for common queries
- **Partitioning**: Time-based partitioning for logs
- **Archival Strategy**: Automated old data archival
- **Connection Limits**: Optimized connection pooling
- **Query Analysis**: Regular EXPLAIN ANALYZE reviews
- **Backup Strategy**: Automated backup and retention

## 🔄 Data Flow Architecture

### Request Flow
```
1. User Request → Frontend (React)
2. API Call → Unified API Client
3. Authentication → JWT Validation
4. Rate Limiting → Request Throttling
5. Load Balancing → Service Selection
6. Business Logic → Service Processing
7. Database Query → PostgreSQL/Supabase
8. Cache Layer → Redis/In-Memory
9. Response → JSON API Response
10. UI Update → React State Update
```

### Real-time Data Flow
```
1. Database Change → PostgreSQL Trigger
2. Event Generation → Supabase Real-time
3. WebSocket Push → Frontend Subscription
4. State Update → Zustand Store
5. UI Refresh → React Component Re-render
```

## 🚀 Deployment Architecture

### Development Environment
- **Local Development**: Vite dev server + Docker services
- **Hot Reloading**: Instant code changes reflection
- **Mock Data**: Development-friendly mock data system
- **Debug Tools**: Comprehensive logging and debugging

### Production Environment
- **Container Orchestration**: Docker Compose with health checks
- **Load Balancing**: Nginx reverse proxy
- **SSL Termination**: Automatic certificate management
- **Monitoring Stack**: Prometheus + Grafana + Loki
- **Backup System**: Automated database and configuration backups

### Scaling Strategy
- **Horizontal Scaling**: Service replication capability
- **Database Scaling**: Read replicas and connection pooling
- **Caching Strategy**: Multi-layer caching implementation
- **CDN Integration**: Static asset distribution
- **Load Testing**: Regular performance testing

## 📈 Monitoring & Observability

### Application Monitoring
- **Performance Metrics**: Response times, throughput, error rates
- **Business Metrics**: Device counts, VPN usage, network health
- **Custom Dashboards**: Role-specific monitoring views
- **Alert Management**: Automated alert routing and escalation

### Infrastructure Monitoring
- **System Metrics**: CPU, memory, disk, network utilization
- **Container Metrics**: Docker container health and performance
- **Database Metrics**: Query performance, connection pools
- **Network Metrics**: Bandwidth usage, latency, packet loss

### Log Management
- **Centralized Logging**: All services log to unified system
- **Log Aggregation**: Loki-based log collection
- **Log Analysis**: Structured logging with searchable fields
- **Log Retention**: Automated log rotation and archival

## 🔧 Configuration Management

### Environment Configuration
- **Environment Variables**: Centralized configuration management
- **Secret Management**: Secure handling of sensitive data
- **Configuration Validation**: Startup-time validation
- **Hot Reloading**: Configuration changes without restart

### Feature Flags
- **Progressive Rollout**: Gradual feature deployment
- **A/B Testing**: User experience optimization
- **Emergency Switches**: Quick feature disable capability
- **User Segmentation**: Role-based feature access

## 🛠️ Development Workflow

### Code Quality
- **TypeScript**: Static type checking across all components
- **ESLint**: Code style and quality enforcement
- **Prettier**: Consistent code formatting
- **Husky**: Pre-commit hooks for quality gates

### Testing Strategy
- **Unit Tests**: Component and function testing
- **Integration Tests**: Service-to-service communication testing
- **E2E Tests**: Complete user workflow testing
- **Performance Tests**: Load and stress testing

### CI/CD Pipeline
- **Continuous Integration**: Automated testing on every commit
- **Continuous Deployment**: Automated deployment to staging
- **Release Management**: Semantic versioning and change logs
- **Rollback Strategy**: Quick rollback capability for failed deployments

This architecture provides a solid foundation for enterprise-grade network management while maintaining flexibility for future enhancements and scaling requirements.