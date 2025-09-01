# Pi5 Supernode - Complete Installation & Configuration Guide

**Document Version:** 2.1.4  
**Target System:** Raspberry Pi 5  
**Platform:** Pi5 Supernode Enterprise Network Management  
**Last Updated:** January 2025  

---

## 📋 Table of Contents

1. [System Overview & Component Analysis](#1-system-overview--component-analysis)
2. [Hardware Requirements & Prerequisites](#2-hardware-requirements--prerequisites)
3. [Raspberry Pi 5 Base Installation](#3-raspberry-pi-5-base-installation)
4. [Frontend Component Analysis](#4-frontend-component-analysis)
5. [Backend Services Installation](#5-backend-services-installation)
6. [Database Configuration](#6-database-configuration)
7. [Mock Data Removal & Production Setup](#7-mock-data-removal--production-setup)
8. [API Integration & Configuration](#8-api-integration--configuration)
9. [Grafana Monitoring Integration](#9-grafana-monitoring-integration)
10. [WireGuard VPN System Setup](#10-wireguard-vpn-system-setup)
11. [System Verification & Testing](#11-system-verification--testing)
12. [Troubleshooting & Error Prevention](#12-troubleshooting--error-prevention)
13. [Production Deployment](#13-production-deployment)
14. [Maintenance & Updates](#14-maintenance--updates)

---

## 1. System Overview & Component Analysis

### 1.1 Architecture Overview

The Pi5 Supernode is a comprehensive network management platform with the following components:

```
┌─────────────────────────────────────────────────────────┐
│                    Pi5 Supernode Architecture           │
├─────────────────────────────────────────────────────────┤
│ Frontend (React + TypeScript)                          │
│ ├── Dashboard View                                      │
│ ├── Device Management                                   │
│ ├── Network Configuration                               │
│ ├── VPN Management                                      │
│ ├── Automation Engine                                   │
│ ├── Observability Dashboard                             │
│ ├── Storage Management                                  │
│ └── Settings & Documentation                            │
├─────────────────────────────────────────────────────────┤
│ Backend Services (Node.js Microservices)               │
│ ├── API Gateway (Port 3000)                            │
│ ├── Network Service (Port 3001)                        │
│ ├── VPN Service (Port 3002)                            │
│ └── Automation Service (Port 3003)                     │
├─────────────────────────────────────────────────────────┤
│ Database Layer                                          │
│ ├── PostgreSQL (Primary Database)                      │
│ ├── Redis (Caching & Sessions)                         │
│ └── Supabase (Database Management)                     │
├─────────────────────────────────────────────────────────┤
│ Infrastructure Services                                 │
│ ├── Nginx (Reverse Proxy)                              │
│ ├── Prometheus (Metrics Collection)                    │
│ ├── Grafana (Monitoring Dashboard)                     │
│ └── Docker (Container Management)                      │
└─────────────────────────────────────────────────────────┘
```

### 1.2 Frontend Component Mapping

#### Dashboard Components (`src/components/views/Dashboard.tsx`)
- **Location:** Main dashboard view
- **Purpose:** Real-time system overview and quick actions
- **Properties:**
  - System metrics cards (CPU, Memory, Disk, Network)
  - Device status overview
  - Quick action buttons
  - Real-time charts for bandwidth and resource usage
  - Connected devices table with action buttons

#### Device Management (`src/components/views/Devices.tsx`)
- **Location:** Device management interface
- **Purpose:** Network device discovery, configuration, and control
- **Properties:**
  - Device discovery functionality
  - Device table with edit/block/delete actions
  - Network topology visualization
  - Device grouping and categorization
  - Wake-on-LAN capabilities

#### Network Management (`src/components/views/Network.tsx`)
- **Purpose:** DNS, DHCP, and traffic rule management
- **Properties:**
  - Traffic rule matrix system
  - VLAN configuration
  - DNS profile management
  - User group administration
  - Policy application system

#### VPN Management (`src/components/views/VPN.tsx`)
- **Purpose:** WireGuard VPN server and client management
- **Properties:**
  - Server creation and configuration
  - Client key generation and management
  - QR code generation for mobile clients
  - Auto WG installation for remote servers
  - Connection monitoring and statistics

#### Storage Management (`src/components/views/Storage.tsx`)
- **Purpose:** USB device and network share management
- **Properties:**
  - USB device detection and mounting
  - Network share configuration
  - Backup system management
  - Storage usage monitoring

#### Settings & Documentation (`src/components/views/Settings.tsx`)
- **Purpose:** System configuration and documentation access
- **Properties:**
  - System snapshot management
  - Security configuration
  - Access control settings
  - Documentation browser
  - System health monitoring

### 1.3 Backend Service Analysis

#### API Gateway (`backend/api-gateway/`)
- **Purpose:** Central request routing and authentication
- **Port:** 3000
- **Properties:**
  - JWT authentication
  - Rate limiting
  - Request proxying to microservices
  - CORS handling
  - Health monitoring

#### Network Service (`backend/network-service/`)
- **Purpose:** Network device and traffic management
- **Port:** 3001
- **Properties:**
  - Device discovery and monitoring
  - Traffic rule application
  - Network topology management
  - DHCP lease management

#### VPN Service (`backend/vpn-service/`)
- **Purpose:** WireGuard VPN management
- **Port:** 3002
- **Properties:**
  - WireGuard configuration generation
  - Key pair management
  - Client/server lifecycle management
  - Connection monitoring

#### Automation Service (`backend/automation-service/`)
- **Purpose:** Rule engine and external integrations
- **Port:** 3003
- **Properties:**
  - Telegram bot integration
  - Webhook management
  - Automated rule execution
  - System event handling

---

## 2. Hardware Requirements & Prerequisites

### 2.1 Raspberry Pi 5 Specifications

**Minimum Requirements:**
- **Model:** Raspberry Pi 5 (4GB RAM minimum)
- **Storage:** 64GB microSD card (Class 10 or UHS-I)
- **Network:** Gigabit Ethernet connection
- **Power:** Official Raspberry Pi 5 power adapter (5V/5A)
- **Cooling:** Active cooling recommended (official fan)

**Recommended Configuration:**
- **Model:** Raspberry Pi 5 (8GB RAM)
- **Storage:** 128GB+ high-speed microSD card
- **Network:** Wired Gigabit Ethernet + Wi-Fi capability
- **Cooling:** Raspberry Pi 5 Active Cooler
- **Case:** Official Raspberry Pi 5 case with fan mount

### 2.2 Network Prerequisites

**Network Configuration:**
- Static IP address assignment (recommended)
- Router admin access for port forwarding
- Domain name (optional, for SSL/HTTPS)
- Firewall access for required ports

**Required Ports:**
```bash
# Application Ports
5173    # Frontend Development Server
3000    # API Gateway
3001    # Network Service
3002    # VPN Service
3003    # Automation Service

# Database Ports
5432    # PostgreSQL
6379    # Redis

# Monitoring Ports
9090    # Prometheus
3100    # Grafana (mapped from 3000)

# VPN Ports
51820   # WireGuard (UDP)

# Web Server Ports
80      # HTTP
443     # HTTPS (Production)
```

---

## 3. Raspberry Pi 5 Base Installation

### 3.1 Operating System Installation

**Step 1: Download and Install Raspberry Pi OS**
```bash
# Use Raspberry Pi Imager to flash OS to microSD card
# Select: "Raspberry Pi OS (64-bit)" - Debian Bookworm based
# Enable SSH and configure WiFi if needed
```

**Step 2: Initial Boot and SSH Connection**
```bash
# Connect via SSH
ssh pi@<raspberry_pi_ip>

# Default username: pi
# Change default password immediately
passwd
```

**Step 3: System Update and Preparation**
```bash
# Update package repositories
sudo apt update && sudo apt upgrade -y

# Install essential packages
sudo apt install -y curl wget git vim nano htop tree unzip build-essential

# Install network tools
sudo apt install -y nmap arp-scan iptables-persistent net-tools

# Firmware update
sudo rpi-update

# Reboot to apply updates
sudo reboot
```

### 3.2 System Optimization for Pi5

**Step 1: GPU Memory Optimization**
```bash
# Edit boot configuration
sudo nano /boot/firmware/config.txt

# Add these lines:
gpu_mem=128
arm_64bit=1
dtparam=audio=on
```

**Step 2: Performance Optimization**
```bash
# Set CPU governor to performance
echo performance | sudo tee /sys/devices/system/cpu/cpu*/cpufreq/scaling_governor

# Make permanent
echo 'GOVERNOR="performance"' | sudo tee -a /etc/default/cpufrequtils

# Optimize swappiness
echo "vm.swappiness=10" | sudo tee -a /etc/sysctl.conf
echo "vm.vfs_cache_pressure=50" | sudo tee -a /etc/sysctl.conf

# Apply changes
sudo sysctl -p
```

### 3.3 Security Hardening

**Step 1: SSH Security**
```bash
# Edit SSH configuration
sudo nano /etc/ssh/sshd_config

# Recommended settings:
# Port 2222
# PermitRootLogin no
# PasswordAuthentication no  # Use keys only
# PubkeyAuthentication yes
# MaxAuthTries 3

# Restart SSH service
sudo systemctl restart ssh
```

**Step 2: Firewall Configuration**
```bash
# Install and configure UFW
sudo apt install -y ufw

# Default policies
sudo ufw default deny incoming
sudo ufw default allow outgoing

# Allow required services
sudo ufw allow 2222/tcp    # SSH (custom port)
sudo ufw allow 80/tcp      # HTTP
sudo ufw allow 443/tcp     # HTTPS
sudo ufw allow 51820/udp   # WireGuard

# Development ports (disable in production)
sudo ufw allow 5173/tcp    # Vite dev server
sudo ufw allow 3000:3003/tcp  # API services

# Enable firewall
sudo ufw enable
```

---

## 4. Frontend Component Analysis

### 4.1 React Application Structure

**Component Hierarchy:**
```
src/
├── App.tsx                     # Main application wrapper
├── main.tsx                    # Application entry point
├── components/
│   ├── ui/                     # Base UI components
│   │   ├── Button.tsx          # Primary button component
│   │   ├── Card.tsx            # Card container component
│   │   ├── Modal.tsx           # Modal dialog component
│   │   └── types.ts            # TypeScript definitions
│   ├── views/                  # Page view components
│   │   ├── Dashboard.tsx       # Main dashboard
│   │   ├── Devices.tsx         # Device management
│   │   ├── Network.tsx         # Network configuration
│   │   ├── VPN.tsx             # VPN management
│   │   ├── Automations.tsx     # Automation rules
│   │   ├── Observability.tsx   # Monitoring dashboard
│   │   ├── Storage.tsx         # Storage management
│   │   └── Settings.tsx        # System settings
│   ├── cards/                  # Specialized card components
│   │   ├── MetricCard.tsx      # Metric display cards
│   │   ├── TableCard.tsx       # Data table cards
│   │   ├── ChartCard.tsx       # Chart visualization
│   │   ├── LogCard.tsx         # Log display cards
│   │   └── ControlCard.tsx     # Control interface cards
│   ├── layout/                 # Layout components
│   │   └── Navigation.tsx      # Sidebar navigation
│   ├── vpn/                    # VPN-specific components
│   │   ├── ServerManagement.tsx # WG server management
│   │   ├── ClientManagement.tsx # WG client management
│   │   └── AutoWGInstaller.tsx  # Auto installation tool
│   └── traffic/                # Traffic management
│       ├── TrafficRuleManager.tsx # Rule management
│       ├── PolicyMatrix.tsx     # Policy configuration
│       └── DraftManager.tsx     # Change management
├── hooks/                      # Custom React hooks
│   ├── api/                    # API integration hooks
│   └── ui/                     # UI state management hooks
├── services/                   # External service integrations
├── store/                      # Zustand state management
├── types/                      # TypeScript type definitions
├── utils/                      # Utility functions
└── styles/                     # Global styles and design system
```

### 4.2 Key Component Properties & Functions

#### Navigation System (`src/components/layout/Navigation.tsx`)
**Properties:**
- **Position:** Fixed sidebar, left side
- **Width:** 256px (expanded) / 64px (collapsed)
- **Items:** 10 navigation items with icons and labels
- **State Management:** Zustand store for collapse/expand
- **Responsive:** Mobile drawer overlay for small screens

**Functions:**
- View switching between different management sections
- Real-time system status indicator
- Mobile-responsive navigation drawer
- Keyboard navigation support

#### Button System (`src/components/ui/Button.tsx`)
**Properties:**
- **Variants:** default, outline, destructive, ghost
- **Sizes:** sm (36px), md (48px), lg (56px)
- **States:** normal, hover, active, disabled, loading
- **Accessibility:** Focus rings, touch targets, ARIA labels

**Functions:**
- Single-line content enforcement
- Icon + text combinations
- Loading state animations
- Neon glow effects on interaction

#### Card System (`src/components/ui/Card.tsx`)
**Properties:**
- **Background:** Glassmorphism with backdrop blur
- **Borders:** Semi-transparent white borders
- **Shadows:** Multi-layer shadow system
- **Animation:** Entry animations and hover effects

**Functions:**
- Content containerization
- Drag-and-drop support for dashboard
- Header with title and action buttons
- Responsive layout adaptation

---

## 5. Backend Services Installation

### 5.1 Docker Installation

**Step 1: Install Docker Engine**
```bash
# Download and run Docker installation script
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add pi user to docker group
sudo usermod -aG docker pi

# Apply group changes
newgrp docker

# Enable Docker service
sudo systemctl enable docker
sudo systemctl start docker

# Verify installation
docker --version
docker run hello-world
```

**Step 2: Install Docker Compose**
```bash
# Install Docker Compose plugin
sudo apt install -y docker-compose-plugin

# Verify installation
docker compose version
```

### 5.2 Project Setup

**Step 1: Clone Project Repository**
```bash
# Navigate to home directory
cd ~

# Clone project (replace with actual repository URL)
git clone https://github.com/youruser/pi5-supernode.git
cd pi5-supernode

# Or upload project files manually to ~/pi5-supernode/
```

**Step 2: Environment Configuration**
```bash
# Copy environment template
cp .env.example .env

# Edit environment variables
nano .env
```

**Critical Environment Variables:**
```env
# Database Configuration
DATABASE_URL=postgresql://postgres:YOUR_SECURE_PASSWORD@localhost:5432/pi5_supernode
POSTGRES_PASSWORD=YOUR_SECURE_PASSWORD_HERE
REDIS_URL=redis://localhost:6379

# API Gateway Configuration
API_GATEWAY_PORT=3000
JWT_SECRET=YOUR_SUPER_SECRET_JWT_KEY_CHANGE_THIS_IN_PRODUCTION
FRONTEND_URL=http://YOUR_PI_IP:5173

# Microservices Configuration
NETWORK_SERVICE_PORT=3001
VPN_SERVICE_PORT=3002
AUTOMATION_SERVICE_PORT=3003

# Monitoring Configuration
GRAFANA_PASSWORD=YOUR_GRAFANA_ADMIN_PASSWORD
LOG_LEVEL=info

# External Integrations (Optional)
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
WEBHOOK_BASE_URL=https://your-n8n-instance.com

# Production Configuration
NODE_ENV=production
SSL_CERT_PATH=/etc/nginx/ssl/cert.pem
SSL_KEY_PATH=/etc/nginx/ssl/key.pem
```

### 5.3 Database Services Setup

**Step 1: Start Database Services**
```bash
# Start PostgreSQL and Redis
docker compose up -d postgres redis

# Verify containers are running
docker compose ps

# Check logs
docker compose logs postgres
docker compose logs redis
```

**Step 2: Database Connection Test**
```bash
# Test PostgreSQL connection
docker compose exec postgres psql -U postgres -d pi5_supernode -c "SELECT version();"

# Test Redis connection
docker compose exec redis redis-cli ping
# Should return: PONG
```

---

## 6. Database Configuration

### 6.1 Supabase Setup

**Manual Supabase Configuration:**
```bash
# If using Supabase Cloud:
# 1. Create new Supabase project at https://supabase.com
# 2. Get project URL and anon key
# 3. Update environment variables:

# Update .env file
echo "VITE_SUPABASE_URL=https://your-project.supabase.co" >> .env
echo "VITE_SUPABASE_ANON_KEY=your-anon-key" >> .env
```

**Database Schema Application:**
The project includes pre-configured database migrations in `supabase/migrations/` that will be automatically applied when connecting to Supabase. These include:

- Network devices table with device tracking
- Traffic rules and policies
- Client groups and VLAN management
- Tunnel pools for VPN configuration
- Routing history for analytics
- Tunnel performance metrics

### 6.2 Local Database Setup (Alternative)

**If using local PostgreSQL:**
```bash
# Apply database schema manually
docker compose exec postgres psql -U postgres -d pi5_supernode -f /docker-entrypoint-initdb.d/01-schema.sql

# Verify tables were created
docker compose exec postgres psql -U postgres -d pi5_supernode -c "\dt"
```

---

## 7. Mock Data Removal & Production Setup

### 7.1 Identifying Mock Data Components

**Mock Data Locations:**
- `src/mocks/queries.ts` - All mock API responses
- Component imports from mock services
- Hardcoded demo data in views

### 7.2 Production Data Integration

**Step 1: Replace Mock Imports**

**In `src/hooks/useDevices.ts`:**
```typescript
// REMOVE:
import { fetchDevices, fetchDevice, createDevice, updateDevice, deleteDevice, wakeDevice } from '../mocks/queries';

// REPLACE WITH:
import { apiClient } from '../services/apiClient';

// Update hook implementation:
export const useDevices = (filters?: UseDevicesFilters) => {
  return useQuery({
    queryKey: ['devices', filters],
    queryFn: () => apiClient.getDevices(filters), // Real API call
    refetchInterval: 30000,
    staleTime: 15000,
    retry: 1
  });
};
```

**Step 2: Configure API Client**

**Update `src/services/apiClient.ts`:**
```typescript
class ApiClient {
  constructor() {
    this.client = axios.create({
      baseURL: `http://${window.location.hostname}:3000`, // Use Pi's IP
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
}
```

### 7.3 Remove Mock Data Files

**Step 1: Backup Mock Data (Optional)**
```bash
# Create backup of mock data for reference
cp src/mocks/queries.ts backup/mock-queries-backup.ts
```

**Step 2: Update Component Imports**
```bash
# Search for mock imports across the project
grep -r "from.*mocks" src/

# Replace with real API calls
# This affects:
# - src/hooks/api/usePerformance.ts
# - src/hooks/useDevices.ts
# - Any component importing mock data
```

---

## 8. API Integration & Configuration

### 8.1 Backend Service Installation

**Step 1: Install Backend Dependencies**
```bash
# Navigate to backend directory
cd backend

# Install dependencies for all services
for service in api-gateway network-service vpn-service automation-service; do
  echo "Installing dependencies for $service..."
  cd $service
  npm install
  cd ..
done
```

**Step 2: Build and Start Services**
```bash
# Build all services
npm run build

# Start services using Docker Compose
cd ..
docker compose up -d api-gateway network-service vpn-service automation-service

# Verify services are running
docker compose ps
```

### 8.2 API Endpoint Configuration

**Health Check Verification:**
```bash
# Test API Gateway
curl http://localhost:3000/health

# Test individual services
curl http://localhost:3001/health  # Network Service
curl http://localhost:3002/health  # VPN Service
curl http://localhost:3003/health  # Automation Service
```

**Expected Response:**
```json
{
  "success": true,
  "service": "api-gateway",
  "status": "healthy",
  "timestamp": "2025-01-15T12:00:00.000Z",
  "version": "2.1.4"
}
```

### 8.3 Authentication Setup

**Step 1: JWT Configuration**
```bash
# Generate secure JWT secret
openssl rand -base64 64

# Update .env file with generated secret
echo "JWT_SECRET=your_generated_secret_here" >> .env
```

**Step 2: Create Admin User**
```bash
# Using API Gateway auth endpoint
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@pi5supernode.local",
    "password": "your_secure_password",
    "role": "admin"
  }'
```

---

## 9. Grafana Monitoring Integration

### 9.1 Grafana Installation and Configuration

**Step 1: Start Grafana Service**
```bash
# Start Grafana container
docker compose up -d grafana

# Check if Grafana is running
docker compose logs grafana

# Access Grafana at http://pi_ip:3100
# Default credentials: admin / admin (change immediately)
```

**Step 2: Prometheus Data Source Configuration**
```bash
# Access Grafana web interface
# Navigate to Configuration > Data Sources
# Add Prometheus data source with URL: http://prometheus:9090
```

**Grafana Data Source Configuration (JSON):**
```json
{
  "name": "Pi5 Prometheus",
  "type": "prometheus",
  "url": "http://prometheus:9090",
  "access": "proxy",
  "basicAuth": false,
  "scrapeInterval": "15s",
  "httpMethod": "POST"
}
```

### 9.2 Dashboard Import and Setup

**Step 1: Import Pi5 Supernode Dashboards**
```bash
# Copy dashboard configurations
sudo mkdir -p /var/lib/grafana/dashboards
sudo cp infrastructure/monitoring/grafana/dashboards/* /var/lib/grafana/dashboards/

# Restart Grafana to load dashboards
docker compose restart grafana
```

**Step 2: Configure Dashboard Provisioning**

**Create provisioning config:**
```yaml
# infrastructure/monitoring/grafana/provisioning/dashboards/pi5-dashboards.yml
apiVersion: 1

providers:
  - name: 'Pi5 Supernode Dashboards'
    type: file
    disableDeletion: false
    updateIntervalSeconds: 10
    allowUiUpdates: true
    options:
      path: /etc/grafana/provisioning/dashboards
```

### 9.3 Metrics Collection Setup

**Prometheus Configuration for Pi5:**
```yaml
# infrastructure/monitoring/prometheus.yml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: 'pi5-supernode-services'
    static_configs:
      - targets: 
        - 'api-gateway:3000'
        - 'network-service:3001' 
        - 'vpn-service:3002'
        - 'automation-service:3003'
    metrics_path: '/metrics'
    scrape_interval: 30s

  - job_name: 'pi5-system-metrics'
    static_configs:
      - targets: ['node-exporter:9100']
    scrape_interval: 10s

  - job_name: 'pi5-database'
    static_configs:
      - targets: ['postgres-exporter:9187']
```

---

## 10. WireGuard VPN System Setup

### 10.1 WireGuard Installation

**Step 1: Install WireGuard**
```bash
# Install WireGuard packages
sudo apt install -y wireguard wireguard-tools

# Enable IP forwarding
echo 'net.ipv4.ip_forward=1' | sudo tee -a /etc/sysctl.conf
echo 'net.ipv6.conf.all.forwarding=1' | sudo tee -a /etc/sysctl.conf
sudo sysctl -p

# Verify kernel module
lsmod | grep wireguard
```

**Step 2: Setup WireGuard Management**
```bash
# Make setup script executable
chmod +x scripts/wireguard-setup.sh

# Run initial setup
sudo ./scripts/wireguard-setup.sh install

# Create WireGuard directories
sudo mkdir -p /etc/wireguard
sudo chmod 700 /etc/wireguard
```

### 10.2 WireGuard Service Integration

**Step 1: Configure Supabase Edge Functions**

The WireGuard management system uses Supabase Edge Functions for system integration:

**Available Functions:**
- `wireguard-sync`: Synchronizes database changes with system configuration
- `auto-wg-installer`: Automatically installs WireGuard on remote servers

**Step 2: Test WireGuard Integration**
```bash
# Test key generation
sudo ./scripts/wireguard-setup.sh generate-keys test-server

# Verify keys were created
sudo ls -la /etc/wireguard/test-server*

# Test server creation
sudo ./scripts/wireguard-setup.sh create-server wg0 51820 10.0.0.0/24 /etc/wireguard/test-server_private.key
```

---

## 11. System Verification & Testing

### 11.1 Frontend Verification

**Step 1: Start Development Server**
```bash
# Install frontend dependencies
npm install

# Start development server
npm run dev

# Verify frontend is accessible at http://pi_ip:5173
```

**Step 2: Component Function Testing**

**Dashboard Verification:**
- [ ] System metrics display correctly
- [ ] Device count updates in real-time
- [ ] Quick action buttons are functional
- [ ] Charts render without errors

**Device Management Verification:**
- [ ] Device table loads data
- [ ] Add/Edit/Delete buttons work
- [ ] Device discovery functionality
- [ ] Wake-on-LAN testing

**VPN Management Verification:**
- [ ] Server creation functionality
- [ ] Client configuration generation
- [ ] QR code generation works
- [ ] Auto WG installer responds

### 11.2 Backend Service Verification

**Step 1: Service Health Checks**
```bash
# Test all service endpoints
echo "Testing API Gateway..."
curl -s http://localhost:3000/health | jq

echo "Testing Network Service..."
curl -s http://localhost:3001/health | jq

echo "Testing VPN Service..."
curl -s http://localhost:3002/health | jq

echo "Testing Automation Service..."
curl -s http://localhost:3003/health | jq
```

**Step 2: Database Connectivity Test**
```bash
# Test database operations
curl -X GET http://localhost:3000/api/v1/devices \
  -H "Authorization: Bearer your_jwt_token"

# Expected: JSON response with device data
```

### 11.3 Monitoring System Verification

**Step 1: Prometheus Metrics**
```bash
# Check Prometheus targets
curl -s http://localhost:9090/api/v1/targets | jq '.data.activeTargets[] | {job, health}'

# Query system metrics
curl -s "http://localhost:9090/api/v1/query?query=up" | jq
```

**Step 2: Grafana Dashboard Access**
```bash
# Verify Grafana is accessible
curl -I http://localhost:3100

# Check dashboard provisioning
curl -s http://admin:your_password@localhost:3100/api/dashboards/home
```

---

## 12. Troubleshooting & Error Prevention

### 12.1 Common Installation Issues

#### Issue 1: Docker Permission Errors
**Symptoms:** `permission denied while trying to connect to the Docker daemon`

**Solution:**
```bash
# Add user to docker group
sudo usermod -aG docker $USER

# Apply group changes
newgrp docker

# Verify permissions
docker run hello-world
```

#### Issue 2: Port Conflicts
**Symptoms:** `Port already in use` errors

**Solution:**
```bash
# Check what's using the port
sudo netstat -tlnp | grep :3000

# Stop conflicting services
sudo systemctl stop apache2  # If Apache is running
sudo systemctl stop nginx   # If Nginx is running

# Or change ports in docker-compose.yml
```

#### Issue 3: Database Connection Failures
**Symptoms:** `Connection refused` or timeout errors

**Solution:**
```bash
# Check PostgreSQL container logs
docker compose logs postgres

# Verify network connectivity
docker compose exec postgres pg_isready -U postgres

# Reset database container
docker compose down postgres
docker volume rm pi5-supernode_postgres_data
docker compose up -d postgres
```

#### Issue 4: WireGuard Module Not Loading
**Symptoms:** `wireguard module not found`

**Solution:**
```bash
# Update kernel headers
sudo apt install -y raspberrypi-kernel-headers

# Rebuild WireGuard module
sudo apt install -y wireguard-dkms

# Load module manually
sudo modprobe wireguard

# Verify module is loaded
lsmod | grep wireguard
```

### 12.2 Frontend Troubleshooting

#### Issue 1: Build Failures
**Symptoms:** `npm run build` fails with TypeScript errors

**Solution:**
```bash
# Clear node modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Type check
npm run type-check

# Build with verbose output
npm run build -- --verbose
```

#### Issue 2: API Connection Errors
**Symptoms:** Frontend can't connect to backend

**Solution:**
```bash
# Verify API Gateway is running
curl http://localhost:3000/health

# Check CORS configuration
# Update FRONTEND_URL in .env to match your Pi's IP

# Test direct API call
curl -X GET http://localhost:3000/api/v1/devices \
  -H "Content-Type: application/json"
```

### 12.3 Production Deployment Issues

#### Issue 1: SSL/HTTPS Configuration
**Solution:**
```bash
# Install Certbot for SSL certificates
sudo apt install -y certbot python3-certbot-nginx

# Generate SSL certificate
sudo certbot --nginx -d your-domain.com

# Verify certificate
openssl x509 -in /etc/letsencrypt/live/your-domain.com/fullchain.pem -text -noout
```

#### Issue 2: Performance Optimization
**Solution:**
```bash
# Optimize Docker for Pi5
echo '{"log-driver": "json-file", "log-opts": {"max-size": "10m", "max-file": "3"}}' | sudo tee /etc/docker/daemon.json

# Restart Docker
sudo systemctl restart docker

# Monitor resource usage
htop
docker stats
```

---

## 13. Production Deployment

### 13.1 Frontend Production Build

**Step 1: Build for Production**
```bash
# Create production build
npm run build

# Verify build output
ls -la dist/

# Test production preview
npm run preview
```

**Step 2: Nginx Configuration**
```bash
# Start Nginx reverse proxy
docker compose up -d nginx

# Verify Nginx configuration
docker compose exec nginx nginx -t

# Access application at http://pi_ip
```

### 13.2 Service Monitoring Setup

**Step 1: Enable System Monitoring**
```bash
# Create systemd service for Pi5 Supernode
sudo tee /etc/systemd/system/pi5-supernode.service > /dev/null <<EOF
[Unit]
Description=Pi5 Supernode Network Management Platform
After=docker.service
Requires=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/home/pi/pi5-supernode
ExecStart=/usr/bin/docker compose up -d
ExecStop=/usr/bin/docker compose down
User=pi
Group=docker

[Install]
WantedBy=multi-user.target
EOF

# Enable and start service
sudo systemctl daemon-reload
sudo systemctl enable pi5-supernode.service
sudo systemctl start pi5-supernode.service
```

**Step 2: Log Management**
```bash
# Configure log rotation
sudo tee /etc/logrotate.d/pi5-supernode > /dev/null <<EOF
/home/pi/pi5-supernode/logs/*.log {
    daily
    rotate 7
    compress
    missingok
    notifempty
    create 644 pi pi
}
EOF
```

---

## 14. Maintenance & Updates

### 14.1 System Updates

**Weekly Maintenance Script:**
```bash
#!/bin/bash
# weekly-maintenance.sh

echo "Starting Pi5 Supernode weekly maintenance..."

# System updates
sudo apt update && sudo apt upgrade -y

# Docker cleanup
docker system prune -f
docker volume prune -f

# Log cleanup
sudo journalctl --vacuum-time=7d

# Database backup
docker compose exec postgres pg_dump -U postgres pi5_supernode > backup_$(date +%Y%m%d).sql
gzip backup_$(date +%Y%m%d).sql

# Health check
curl -s http://localhost:3000/health > /dev/null && echo "✅ System healthy" || echo "❌ System issues detected"

echo "Maintenance completed."
```

### 14.2 Backup Strategy

**Automated Backup Configuration:**
```bash
# Create backup script
sudo tee /usr/local/bin/pi5-backup.sh > /dev/null <<'EOF'
#!/bin/bash
BACKUP_DIR="/media/backup"
DATE=$(date +%Y%m%d_%H%M%S)

# Database backup
docker compose exec postgres pg_dump -U postgres pi5_supernode > "$BACKUP_DIR/db_$DATE.sql"

# Configuration backup
tar czf "$BACKUP_DIR/config_$DATE.tar.gz" \
  /home/pi/pi5-supernode/.env \
  /home/pi/pi5-supernode/docker-compose.yml \
  /etc/wireguard/

# Cleanup old backups (keep 30 days)
find "$BACKUP_DIR" -name "*.sql" -o -name "*.tar.gz" | head -n -30 | xargs rm -f
EOF

chmod +x /usr/local/bin/pi5-backup.sh

# Add to crontab
echo "0 2 * * * /usr/local/bin/pi5-backup.sh" | sudo crontab -
```

---

## 15. Component Activation Procedures

### 15.1 Activating Real Device Discovery

**Replace Mock Device Service:**
```typescript
// In src/hooks/useDevices.ts
// Update imports to use real API client instead of mocks

// Enable real network scanning
export const useDiscoverDevices = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      // Real implementation using nmap or arp-scan
      const response = await apiClient.request({
        method: 'POST',
        url: '/api/v1/network/discover'
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['devices'] });
    }
  });
};
```

### 15.2 Activating VPN System Integration

**Enable System WireGuard Commands:**
```bash
# Test WireGuard system integration
sudo ./scripts/wireguard-setup.sh generate-keys main-server

# Create first server configuration
sudo ./scripts/wireguard-setup.sh create-server wg0 51820 10.0.0.0/24 /etc/wireguard/main-server_private.key

# Start WireGuard service
sudo systemctl enable wg-quick@wg0
sudo systemctl start wg-quick@wg0

# Verify WireGuard is running
sudo wg show
```

### 15.3 Activating Monitoring and Alerts

**Enable Real System Metrics:**
```bash
# Install node_exporter for system metrics
docker run -d --name node-exporter \
  --net="host" \
  --pid="host" \
  -v "/:/host:ro,rslave" \
  prom/node-exporter:latest \
  --path.rootfs=/host

# Configure Prometheus to scrape real metrics
# Update prometheus.yml to include node-exporter target
```

---

## 16. Final System Configuration

### 16.1 Complete System Startup

**Production Startup Sequence:**
```bash
# Start all services in correct order
docker compose up -d postgres redis
sleep 10
docker compose up -d api-gateway network-service vpn-service automation-service
sleep 5
docker compose up -d prometheus grafana nginx

# Verify all services are running
docker compose ps

# Check system health
curl http://localhost:3000/health/services
```

### 16.2 Access Points Summary

**Web Interfaces:**
- **Main Application:** `http://pi_ip:5173` (Development) / `http://pi_ip` (Production)
- **API Gateway:** `http://pi_ip:3000`
- **Grafana Monitoring:** `http://pi_ip:3100`
- **Prometheus Metrics:** `http://pi_ip:9090`

**Credentials:**
- **Admin Panel:** Created during authentication setup
- **Grafana:** admin / your_grafana_password
- **Database:** postgres / your_postgres_password

### 16.3 System Status Verification

**Complete System Check:**
```bash
#!/bin/bash
# system-check.sh

echo "=== Pi5 Supernode System Status ==="

# Container status
echo "Container Status:"
docker compose ps

# Service health
echo -e "\nService Health:"
services=("3000" "3001" "3002" "3003")
for port in "${services[@]}"; do
  if curl -s http://localhost:$port/health > /dev/null; then
    echo "✅ Service on port $port: Healthy"
  else
    echo "❌ Service on port $port: Not responding"
  fi
done

# Database connectivity
echo -e "\nDatabase Status:"
if docker compose exec postgres pg_isready -U postgres > /dev/null 2>&1; then
  echo "✅ PostgreSQL: Connected"
else
  echo "❌ PostgreSQL: Connection failed"
fi

if docker compose exec redis redis-cli ping > /dev/null 2>&1; then
  echo "✅ Redis: Connected"
else
  echo "❌ Redis: Connection failed"
fi

# WireGuard status
echo -e "\nWireGuard Status:"
if sudo wg show interfaces > /dev/null 2>&1; then
  echo "✅ WireGuard: $(sudo wg show interfaces | wc -l) interfaces active"
else
  echo "❌ WireGuard: No interfaces active"
fi

# System resources
echo -e "\nSystem Resources:"
echo "CPU Load: $(uptime | awk -F'load average:' '{print $2}')"
echo "Memory: $(free -h | awk '/Mem:/ {print $3 "/" $2}')"
echo "Disk: $(df -h / | awk 'NR==2 {print $3 "/" $2 " (" $5 ")"}')"

echo -e "\n=== System Check Complete ==="
```

---

## 17. Security & Access Control

### 17.1 Production Security Configuration

**Step 1: Secure Environment Variables**
```bash
# Set secure file permissions
chmod 600 .env

# Generate secure secrets
openssl rand -hex 32  # For JWT_SECRET
openssl rand -hex 16  # For additional secrets
```

**Step 2: Database Security**
```bash
# Create database backup user (read-only)
docker compose exec postgres psql -U postgres -d pi5_supernode -c "
CREATE USER backup_user WITH PASSWORD 'backup_password';
GRANT CONNECT ON DATABASE pi5_supernode TO backup_user;
GRANT USAGE ON SCHEMA public TO backup_user;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO backup_user;
"
```

### 17.2 Access Control Implementation

**Row Level Security Policies:**
The system includes comprehensive RLS policies for:
- Network device access control
- VPN configuration security
- Traffic rule management
- User session management

**API Rate Limiting:**
- 100 requests per 15 minutes per IP
- 5 login attempts per minute per IP
- Special limits for auth endpoints

---

## 18. Documentation Integration

### 18.1 In-App Documentation Access

This documentation is accessible through:
1. **Settings View:** Documentation tab
2. **Help System:** Context-sensitive help
3. **API Documentation:** Integrated Swagger/OpenAPI docs

### 18.2 Additional Resources

**External Documentation:**
- WireGuard official documentation
- Raspberry Pi 5 hardware guide
- Docker Compose reference
- Supabase documentation

**Community Resources:**
- GitHub repository with issues and discussions
- Community forum for troubleshooting
- Video tutorials for common tasks

---

## 19. Post-Installation Checklist

### ✅ Complete Installation Verification

- [ ] **Hardware Setup Complete**
  - [ ] Raspberry Pi 5 booted successfully
  - [ ] Network connectivity established
  - [ ] SSH access configured

- [ ] **Base System Configured**
  - [ ] Operating system updated
  - [ ] Docker installed and running
  - [ ] Firewall configured
  - [ ] Performance optimizations applied

- [ ] **Application Services Running**
  - [ ] All Docker containers started
  - [ ] Database connectivity verified
  - [ ] API services responding to health checks
  - [ ] Frontend accessible via web browser

- [ ] **WireGuard VPN Operational**
  - [ ] WireGuard kernel module loaded
  - [ ] Server configuration created
  - [ ] Client generation working
  - [ ] VPN traffic routing functional

- [ ] **Monitoring Systems Active**
  - [ ] Prometheus collecting metrics
  - [ ] Grafana dashboards loaded
  - [ ] Log aggregation working
  - [ ] Alert rules configured

- [ ] **Security Measures Implemented**
  - [ ] Default passwords changed
  - [ ] JWT secrets configured
  - [ ] SSL certificates installed (production)
  - [ ] Access control policies active

- [ ] **Production Features Enabled**
  - [ ] Mock data removed
  - [ ] Real API endpoints connected
  - [ ] System monitoring operational
  - [ ] Backup procedures configured

---

## 20. Support & Maintenance

### 20.1 Regular Maintenance Tasks

**Daily:**
- Monitor system health via Grafana
- Check application logs for errors
- Verify backup completion

**Weekly:**
- Update system packages
- Clean Docker unused containers/images
- Review security logs
- Test backup restoration

**Monthly:**
- Full system backup
- Security audit
- Performance optimization review
- Documentation updates

### 20.2 Emergency Procedures

**System Recovery:**
```bash
# Emergency system restart
sudo systemctl restart pi5-supernode.service

# Database recovery from backup
docker compose exec postgres psql -U postgres -d pi5_supernode < backup_latest.sql

# Container recreation
docker compose down
docker compose up -d --force-recreate
```

**Contact Information:**
- **System Administrator:** Your contact information
- **Emergency Contact:** Backup administrator
- **Documentation Repository:** GitHub or internal docs
- **Support Forum:** Community support links

---

*This document provides complete installation and configuration procedures for the Pi5 Supernode system on Raspberry Pi 5. Follow all steps in sequence for optimal results.*

**Document Classification:** Technical Implementation Guide  
**Audience:** System Administrators, Network Engineers  
**Maintenance Schedule:** Updated with each system version release