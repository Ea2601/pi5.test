# Pi5 Supernode - Optimized Installation Guide

## 🚀 Quick Start Commands

### One-Line Installation (Recommended)
```bash
curl -fsSL https://install.pi5supernode.com/install.sh | bash
```

### Manual Installation Steps
```bash
# 1. Clone and setup
git clone https://github.com/pi5-supernode/pi5-supernode.git
cd pi5-supernode

# 2. Quick start
make quick-start

# 3. Access application
# Frontend: http://localhost:5173
# API: http://localhost:3000
# Grafana: http://localhost:3100
```

## 📋 System Requirements

### Hardware Requirements
| Component | Minimum | Recommended | Optimal |
|-----------|---------|-------------|---------|
| **Device** | Raspberry Pi 5 (4GB) | Raspberry Pi 5 (8GB) | Raspberry Pi 5 (8GB) + Cooling |
| **Storage** | 64GB microSD (Class 10) | 128GB microSD (UHS-I) | 256GB SSD + USB 3.0 |
| **Network** | 100Mbps Ethernet | Gigabit Ethernet | Gigabit + Wi-Fi 6 |
| **Power** | 5V/3A USB-C | Official Pi 5 Power Supply | Official + UPS |

### Software Prerequisites
- **OS**: Raspberry Pi OS (64-bit) - Debian Bookworm
- **Docker**: Version 24.0+
- **Node.js**: Version 18+ (for development)
- **Git**: Version 2.34+

## 🔧 Installation Methods

### Method 1: Docker Compose (Production Ready)
```bash
# Step 1: System preparation
sudo apt update && sudo apt upgrade -y
sudo apt install -y docker.io docker-compose-plugin git curl

# Step 2: Clone project
git clone https://github.com/pi5-supernode/pi5-supernode.git
cd pi5-supernode

# Step 3: Configure environment
cp .env.example .env
nano .env  # Edit configuration

# Step 4: Deploy
make deploy-prod

# Step 5: Verify
make health
```

### Method 2: Development Setup
```bash
# Step 1: Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Step 2: Clone and install
git clone https://github.com/pi5-supernode/pi5-supernode.git
cd pi5-supernode
make install

# Step 3: Start databases
docker-compose up -d postgres redis

# Step 4: Run development servers
make dev
```

### Method 3: Native Installation (Advanced)
```bash
# Step 1: Install system dependencies
sudo apt install -y postgresql-15 redis-server nginx prometheus grafana

# Step 2: Configure services
sudo systemctl enable postgresql redis-server nginx
sudo systemctl start postgresql redis-server nginx

# Step 3: Database setup
sudo -u postgres createdb pi5_supernode
sudo -u postgres psql -d pi5_supernode -f database/schema.sql

# Step 4: Application setup
npm install
npm run build
sudo npm install -g pm2
pm2 start ecosystem.config.js

# Step 5: System integration
sudo systemctl enable pi5-supernode
```

## ⚙️ Configuration Guide

### Essential Environment Variables
```env
# Database Configuration
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/pi5_supernode
POSTGRES_PASSWORD=your_secure_database_password
REDIS_URL=redis://localhost:6379

# Supabase Configuration (Required)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

# API Configuration
API_GATEWAY_PORT=3000
NETWORK_SERVICE_PORT=3001
VPN_SERVICE_PORT=3002
AUTOMATION_SERVICE_PORT=3003

# Security Configuration
JWT_SECRET=your-super-secure-jwt-secret-min-32-characters
SESSION_SECRET=your-session-secret-key

# Frontend Configuration
FRONTEND_URL=http://YOUR_PI_IP:5173

# Monitoring Configuration
GRAFANA_PASSWORD=your-grafana-admin-password
LOG_LEVEL=info

# Optional Integrations
TELEGRAM_BOT_TOKEN=your-telegram-bot-token
WEBHOOK_BASE_URL=https://your-n8n-instance.com

# SSL Configuration (Production)
ENABLE_HTTPS=true
SSL_CERT_PATH=/etc/nginx/ssl/cert.pem
SSL_KEY_PATH=/etc/nginx/ssl/key.pem
```

### Network Configuration
```bash
# Configure static IP (recommended)
sudo nano /etc/dhcpcd.conf

# Add these lines:
interface eth0
static ip_address=192.168.1.100/24
static routers=192.168.1.1
static domain_name_servers=1.1.1.1 8.8.8.8

# Restart networking
sudo systemctl restart dhcpcd
```

### Firewall Setup
```bash
# Install and configure UFW
sudo apt install -y ufw

# Configure firewall rules
sudo ufw default deny incoming
sudo ufw default allow outgoing

# Allow required services
sudo ufw allow 22/tcp      # SSH
sudo ufw allow 80/tcp      # HTTP
sudo ufw allow 443/tcp     # HTTPS
sudo ufw allow 51820/udp   # WireGuard

# Development ports (remove in production)
sudo ufw allow 5173/tcp    # Vite dev server
sudo ufw allow 3000:3003/tcp  # API services
sudo ufw allow 3100/tcp    # Grafana
sudo ufw allow 9090/tcp    # Prometheus

# Enable firewall
sudo ufw enable
```

## 🗃️ Database Setup

### Supabase Setup (Recommended)
```bash
# Option 1: Use Supabase Cloud
# 1. Create account at https://supabase.com
# 2. Create new project
# 3. Get URL and anon key from project settings
# 4. Update .env file with credentials

# Option 2: Self-hosted Supabase
docker run -d \
  --name supabase-db \
  -e POSTGRES_PASSWORD=your_password \
  -e POSTGRES_DB=pi5_supernode \
  -p 5432:5432 \
  postgres:15-alpine

# Apply migrations
npm run migration:apply
```

### Local PostgreSQL Setup
```bash
# Install PostgreSQL
sudo apt install -y postgresql-15 postgresql-contrib

# Create database and user
sudo -u postgres psql << EOF
CREATE DATABASE pi5_supernode;
CREATE USER pi5_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE pi5_supernode TO pi5_user;
\q
EOF

# Apply schema
sudo -u postgres psql -d pi5_supernode -f database/schema.sql
```

## 🔍 Verification & Testing

### System Health Check
```bash
# Automated health check
make health

# Manual verification
curl http://localhost:3000/health
curl http://localhost:3001/health
curl http://localhost:3002/health
curl http://localhost:3003/health

# Database connectivity
curl http://localhost:3000/health/database
```

### Service Status Check
```bash
# Container status
docker-compose ps

# Service logs
make logs

# System resources
htop
df -h
free -h
```

### Functional Testing
```bash
# Run test suite
make test

# API endpoint testing
curl -X GET http://localhost:3000/api/v1/network/devices
curl -X GET http://localhost:3000/api/v1/vpn/servers

# Database query testing
npm run migration:status
```

## 🛠️ Troubleshooting

### Common Issues & Solutions

#### 1. Port Conflicts
```bash
# Check port usage
sudo netstat -tlnp | grep -E "(3000|3001|3002|3003|5432|6379)"

# Kill conflicting processes
sudo pkill -f "node.*3000"
sudo systemctl stop apache2  # If Apache is running
```

#### 2. Docker Issues
```bash
# Docker daemon not running
sudo systemctl start docker
sudo systemctl enable docker

# Permission issues
sudo usermod -aG docker $USER
newgrp docker

# Container startup issues
docker-compose down
docker system prune -f
docker-compose up -d
```

#### 3. Database Connection Issues
```bash
# PostgreSQL not accessible
sudo systemctl status postgresql
sudo systemctl restart postgresql

# Connection string issues
# Check DATABASE_URL format in .env file

# Supabase connection issues
# Verify SUPABASE_URL and SUPABASE_ANON_KEY in .env
```

#### 4. WireGuard Issues
```bash
# WireGuard module not loaded
sudo modprobe wireguard
lsmod | grep wireguard

# Permission issues
sudo chmod 700 /etc/wireguard
sudo chown -R root:root /etc/wireguard

# Service issues
sudo systemctl status wg-quick@wg0
sudo wg show
```

#### 5. Performance Issues
```bash
# High memory usage
# Edit docker-compose.yml to add memory limits
# services:
#   api-gateway:
#     deploy:
#       resources:
#         limits:
#           memory: 512M

# High CPU usage
htop
# Check for runaway processes

# Disk space issues
df -h
docker system prune -f
npm run clean
```

## 📊 Performance Tuning

### Raspberry Pi 5 Optimization
```bash
# CPU governor settings
echo performance | sudo tee /sys/devices/system/cpu/cpu*/cpufreq/scaling_governor

# Memory optimization
echo "vm.swappiness=10" | sudo tee -a /etc/sysctl.conf
echo "vm.vfs_cache_pressure=50" | sudo tee -a /etc/sysctl.conf
sudo sysctl -p

# GPU memory split
echo "gpu_mem=128" | sudo tee -a /boot/firmware/config.txt

# Network optimization
echo "net.core.rmem_max = 16777216" | sudo tee -a /etc/sysctl.conf
echo "net.core.wmem_max = 16777216" | sudo tee -a /etc/sysctl.conf
```

### Docker Optimization
```bash
# Configure Docker daemon
sudo tee /etc/docker/daemon.json > /dev/null <<EOF
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  },
  "storage-driver": "overlay2",
  "default-ulimits": {
    "nofile": {
      "Name": "nofile",
      "Hard": 64000,
      "Soft": 64000
    }
  }
}
EOF

sudo systemctl restart docker
```

### PostgreSQL Optimization
```bash
# Create optimized PostgreSQL configuration
sudo tee /etc/postgresql/15/main/postgresql.conf.d/pi5-optimized.conf > /dev/null <<EOF
# Pi5 Supernode PostgreSQL Optimization
shared_buffers = 256MB
effective_cache_size = 1GB
work_mem = 4MB
maintenance_work_mem = 64MB
wal_buffers = 16MB
checkpoint_completion_target = 0.9
random_page_cost = 1.1
effective_io_concurrency = 200
min_wal_size = 1GB
max_wal_size = 4GB
EOF

sudo systemctl restart postgresql
```

## 🔐 Security Hardening

### System Security
```bash
# SSH hardening
sudo nano /etc/ssh/sshd_config
# PermitRootLogin no
# PasswordAuthentication no
# PubkeyAuthentication yes
# Port 2222

# Automatic security updates
sudo apt install -y unattended-upgrades
sudo dpkg-reconfigure -plow unattended-upgrades

# Fail2ban for SSH protection
sudo apt install -y fail2ban
sudo systemctl enable fail2ban
```

### Application Security
```bash
# SSL certificate setup (Let's Encrypt)
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com

# API security headers
# Already configured in Nginx configuration

# Database security
# Row Level Security (RLS) enabled by default
# All tables have appropriate security policies
```

## 📈 Monitoring Setup

### Grafana Dashboard Import
```bash
# Import Pi5 Supernode dashboards
curl -X POST \
  http://admin:your_password@localhost:3100/api/dashboards/db \
  -H 'Content-Type: application/json' \
  -d @infrastructure/monitoring/grafana/dashboards/pi5-overview.json
```

### Prometheus Configuration
```yaml
# Custom scrape configurations in prometheus.yml
scrape_configs:
  - job_name: 'pi5-supernode'
    static_configs:
      - targets: 
        - 'api-gateway:3000'
        - 'network-service:3001'
        - 'vpn-service:3002'
        - 'automation-service:3003'
    metrics_path: '/metrics'
    scrape_interval: 15s
```

## 🆘 Emergency Recovery

### System Recovery
```bash
# Database recovery
make restore BACKUP=20240115_140000

# Configuration rollback
docker-compose down
git checkout HEAD~1 -- docker-compose.yml .env
docker-compose up -d

# Service restart
docker-compose restart
make health
```

### Data Recovery
```bash
# Export current configuration
curl http://localhost:3000/api/v1/system/export-config > config-backup.json

# Database backup
docker-compose exec postgres pg_dump -U postgres pi5_supernode > emergency-backup.sql

# WireGuard configuration backup
sudo tar czf wireguard-backup.tar.gz /etc/wireguard/
```

## 📚 Additional Resources

### Documentation Links
- **Full Installation Guide**: [docs/install_document.md](./install_document.md)
- **Technical Specifications**: [TECHNICAL_SPECIFICATIONS.md](./TECHNICAL_SPECIFICATIONS.md)
- **WireGuard Setup**: [docs/WIREGUARD_SETUP.md](./WIREGUARD_SETUP.md)
- **API Documentation**: [shared/schemas/openapi.yaml](../shared/schemas/openapi.yaml)

### Support Channels
- **GitHub Issues**: Report bugs and feature requests
- **Community Forum**: Get help from other users
- **Documentation Wiki**: Comprehensive guides and tutorials

### Development Resources
- **Contributing Guide**: How to contribute to the project
- **Code Style Guide**: Coding standards and best practices
- **Architecture Decision Records**: Technical decision documentation

This optimized installation guide provides multiple installation paths to suit different deployment scenarios and user expertise levels.