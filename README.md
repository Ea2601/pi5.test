# Pi5 Supernode - Enterprise Network Management Platform

## 🚀 Quick Start (Frontend Only)

This is a React-based network management dashboard that runs standalone with mock data.

### Development Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Mock Data Location

All mock data is located in `src/mocks/queries.ts`. This includes:
- Device information (network devices, USB storage)
- System metrics (CPU, memory, disk usage)
- Network statistics
- VPN server/client configurations

### Connecting to Real Backend

To connect to a real backend:

1. Replace imports in `src/hooks/api/usePerformance.ts` and `src/hooks/useDevices.ts`
2. Change from `import { fetchX } from '../../mocks/queries'` to actual API calls
3. Update `src/services/apiClient.ts` with your backend URL
4. Configure environment variables in `.env`

### Technology Stack


## 🔧 Configuration

### Environment Variables
```env
# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/pi5_supernode
REDIS_URL=redis://localhost:6379

# API Gateway
API_GATEWAY_PORT=3000
JWT_SECRET=your-super-secret-jwt-key

# Services
NETWORK_SERVICE_PORT=3001
VPN_SERVICE_PORT=3002
AUTOMATION_SERVICE_PORT=3003

# External Integrations
TELEGRAM_BOT_TOKEN=your-telegram-bot-token
WEBHOOK_BASE_URL=https://your-n8n-instance.com
```

### Port Configuration
- **Frontend:** 5173 (Vite dev server)
- **API Gateway:** 3000
- **Network Service:** 3001
- **VPN Service:** 3002
- **Automation Service:** 3003
- **PostgreSQL:** 5432
- **Redis:** 6379
- **Nginx:** 80, 443

## 📊 Database Schema

### Core Tables
- `network_devices` - Connected devices and their metadata
- `traffic_rules` - Traffic routing and QoS rules
- `client_groups` - Device groupings for rule application
- `tunnel_pools` - VPN server configurations
- `routing_history` - Historical routing decisions
- `tunnel_performance` - VPN performance metrics

## 🔌 API Endpoints

### Network Management
- `GET /api/v1/devices` - List network devices
- `POST /api/v1/devices` - Add new device
- `PUT /api/v1/devices/:mac` - Update device
- `DELETE /api/v1/devices/:mac` - Remove device

### VPN Management
- `GET /api/v1/vpn/servers` - List WireGuard servers
- `POST /api/v1/vpn/clients` - Create new client
- `GET /api/v1/vpn/config/:clientId` - Get client config

### Traffic Management
- `GET /api/v1/traffic/rules` - List traffic rules
- `POST /api/v1/traffic/rules` - Create new rule
- `PUT /api/v1/traffic/rules/:id` - Update rule

## 🔄 Deployment

### Production Deployment
```bash
# Build all services
docker-compose -f docker-compose.prod.yml build

# Deploy to production
docker-compose -f docker-compose.prod.yml up -d

# Health check
curl http://localhost/health
```

### Health Monitoring
- **Application Health:** `/health`
- **Database Health:** `/health/database`
- **Services Health:** `/health/services`

## 📈 Monitoring

- **Logs:** Centralized logging with ELK stack
- **Metrics:** Prometheus + Grafana dashboards
- **Alerts:** Email/Telegram notifications for critical events

## 🔒 Security

- JWT-based authentication
- RBAC (Role-Based Access Control)
- API rate limiting
- HTTPS/TLS encryption
- Input validation and sanitization
- SQL injection protection via Prisma ORM

## 🧪 Testing

```bash
# Run backend tests
cd backend && npm run test

# Run frontend tests
cd frontend && npm run test

# Run integration tests
npm run test:integration

# Run E2E tests
npm run test:e2e
```

## 📝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.