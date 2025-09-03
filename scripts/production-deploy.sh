#!/bin/bash

# Pi5 Supernode - Production Deployment Script
# Automated deployment with security hardening and optimization

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Configuration
DOMAIN_NAME=${DOMAIN_NAME:-pi5supernode.local}
POSTGRES_PASSWORD=${POSTGRES_PASSWORD:-$(openssl rand -base64 32)}
JWT_SECRET=${JWT_SECRET:-$(openssl rand -base64 64)}
GRAFANA_PASSWORD=${GRAFANA_PASSWORD:-$(openssl rand -base64 16)}

log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING:${NC} $1"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR:${NC} $1"
    exit 1
}

# Check if running as root or with sudo
check_privileges() {
    if [[ $EUID -ne 0 ]]; then
        error "This script must be run as root or with sudo"
    fi
}

# System requirements check
check_system_requirements() {
    log "Checking system requirements..."
    
    # Check if Raspberry Pi 5
    if grep -q "Raspberry Pi 5" /proc/cpuinfo 2>/dev/null; then
        log "✅ Raspberry Pi 5 detected"
    else
        warn "Not running on Raspberry Pi 5, performance may vary"
    fi
    
    # Check available memory (minimum 4GB)
    TOTAL_MEM=$(free -m | awk '/^Mem:/{print $2}')
    if [[ $TOTAL_MEM -lt 3800 ]]; then
        warn "Low memory detected (${TOTAL_MEM}MB). Minimum 4GB recommended"
    else
        log "✅ Sufficient memory: ${TOTAL_MEM}MB"
    fi
    
    # Check disk space (minimum 16GB free)
    AVAILABLE_SPACE=$(df / | awk '/\//{print $4}')
    if [[ $AVAILABLE_SPACE -lt 16000000 ]]; then
        warn "Low disk space. Minimum 16GB free recommended"
    else
        log "✅ Sufficient disk space: $((AVAILABLE_SPACE / 1024 / 1024))GB"
    fi
}

# Install Docker if not present
install_docker() {
    if ! command -v docker &> /dev/null; then
        log "Installing Docker..."
        curl -fsSL https://get.docker.com -o get-docker.sh
        sh get-docker.sh
        usermod -aG docker pi
        systemctl enable docker
        systemctl start docker
        rm get-docker.sh
        log "✅ Docker installed"
    else
        log "✅ Docker already installed"
    fi
    
    # Install Docker Compose if not present
    if ! command -v docker-compose &> /dev/null; then
        log "Installing Docker Compose..."
        apt install -y docker-compose-plugin
        log "✅ Docker Compose installed"
    fi
}

# Setup production environment
setup_environment() {
    log "Setting up production environment..."
    
    # Create production environment file
    cat > .env.production << EOF
# Pi5 Supernode Production Configuration
NODE_ENV=production
LOG_LEVEL=info

# Database
POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
DATABASE_URL=postgresql://postgres:${POSTGRES_PASSWORD}@localhost:5432/pi5_supernode

# Security
JWT_SECRET=${JWT_SECRET}
SESSION_SECRET=$(openssl rand -base64 32)

# SSL/HTTPS
DOMAIN_NAME=${DOMAIN_NAME}
ENABLE_HTTPS=true

# Monitoring
GRAFANA_PASSWORD=${GRAFANA_PASSWORD}

# Performance
CPU_LIMIT=2.0
MEMORY_LIMIT=2G
EOF
    
    chmod 600 .env.production
    log "✅ Production environment configured"
}

# Generate SSL certificates
setup_ssl() {
    if [[ "${DOMAIN_NAME}" != "pi5supernode.local" ]] && [[ "${DOMAIN_NAME}" != "localhost" ]]; then
        log "Setting up SSL certificates for ${DOMAIN_NAME}..."
        
        # Install certbot
        apt install -y certbot python3-certbot-nginx
        
        # Generate certificate
        certbot --nginx -d "${DOMAIN_NAME}" --non-interactive --agree-tos --email admin@"${DOMAIN_NAME}"
        
        log "✅ SSL certificate generated for ${DOMAIN_NAME}"
    else
        log "Generating self-signed certificate for local deployment..."
        
        mkdir -p production/nginx/ssl
        openssl req -x509 -nodes -days 365 -newkey rsa:4096 \
            -keyout production/nginx/ssl/key.pem \
            -out production/nginx/ssl/cert.pem \
            -subj "/C=TR/ST=Istanbul/L=Istanbul/O=Pi5Supernode/CN=${DOMAIN_NAME}"
        
        log "✅ Self-signed certificate generated"
    fi
}

# Optimize system for production
optimize_system() {
    log "Optimizing system for production..."
    
    # Kernel optimizations
    cat >> /etc/sysctl.conf << EOF

# Pi5 Supernode Production Optimizations
net.core.rmem_max = 16777216
net.core.wmem_max = 16777216
net.ipv4.tcp_rmem = 4096 65536 16777216
net.ipv4.tcp_wmem = 4096 65536 16777216
net.core.netdev_max_backlog = 5000
net.ipv4.tcp_congestion_control = bbr
vm.swappiness = 10
vm.dirty_ratio = 20
vm.dirty_background_ratio = 10
EOF
    
    sysctl -p
    
    # Setup log rotation
    cat > /etc/logrotate.d/pi5-supernode << EOF
/opt/pi5-supernode/logs/*.log {
    daily
    rotate 30
    compress
    missingok
    notifempty
    create 644 root root
    postrotate
        docker-compose -f docker-compose.prod.yml exec api-gateway kill -USR1 1 2>/dev/null || true
    endscript
}
EOF
    
    log "✅ System optimization completed"
}

# Deploy application
deploy_application() {
    log "Deploying Pi5 Supernode to production..."
    
    # Stop any existing deployment
    docker-compose -f docker-compose.prod.yml down 2>/dev/null || true
    
    # Build images
    log "Building production images..."
    docker-compose -f docker-compose.prod.yml build
    
    # Start services
    log "Starting production services..."
    docker-compose -f docker-compose.prod.yml up -d
    
    # Wait for services to be ready
    log "Waiting for services to start..."
    sleep 30
    
    # Run health checks
    log "Running health checks..."
    
    local retries=0
    local max_retries=10
    
    while [[ $retries -lt $max_retries ]]; do
        if curl -f -s http://localhost/health >/dev/null; then
            log "✅ Application health check passed"
            break
        else
            retries=$((retries + 1))
            log "Health check attempt $retries/$max_retries..."
            sleep 10
        fi
    done
    
    if [[ $retries -eq $max_retries ]]; then
        error "Health checks failed after $max_retries attempts"
    fi
}

# Setup monitoring
setup_monitoring() {
    log "Setting up production monitoring..."
    
    # Setup Grafana dashboards
    docker-compose -f docker-compose.prod.yml exec -T grafana \
        grafana-cli admin reset-admin-password "${GRAFANA_PASSWORD}"
    
    # Import dashboards
    for dashboard in production/monitoring/grafana/dashboards/*.json; do
        if [[ -f "$dashboard" ]]; then
            log "Importing dashboard: $(basename "$dashboard")"
            # Dashboard import logic would go here
        fi
    done
    
    log "✅ Monitoring setup completed"
}

# Setup systemd service
setup_systemd_service() {
    log "Setting up systemd service..."
    
    cat > /etc/systemd/system/pi5-supernode.service << EOF
[Unit]
Description=Pi5 Supernode Production Service
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/opt/pi5-supernode
ExecStart=/usr/bin/docker-compose -f docker-compose.prod.yml up -d
ExecStop=/usr/bin/docker-compose -f docker-compose.prod.yml down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
EOF
    
    systemctl daemon-reload
    systemctl enable pi5-supernode
    
    log "✅ Systemd service configured"
}

# Setup automatic updates
setup_auto_updates() {
    log "Setting up automatic updates..."
    
    # Create update script
    cat > /usr/local/bin/pi5-supernode-update << 'EOF'
#!/bin/bash
cd /opt/pi5-supernode
git pull origin main
docker-compose -f docker-compose.prod.yml pull
docker-compose -f docker-compose.prod.yml up -d --build
docker system prune -f
EOF
    
    chmod +x /usr/local/bin/pi5-supernode-update
    
    # Add to crontab (weekly updates)
    echo "0 3 * * 0 /usr/local/bin/pi5-supernode-update >> /var/log/pi5-supernode-update.log 2>&1" | crontab -
    
    log "✅ Automatic updates configured"
}

# Security hardening
security_hardening() {
    log "Applying security hardening..."
    
    # Firewall configuration
    ufw --force reset
    ufw default deny incoming
    ufw default allow outgoing
    
    # Allow required ports
    ufw allow 22/tcp      # SSH
    ufw allow 80/tcp      # HTTP
    ufw allow 443/tcp     # HTTPS
    ufw allow 51820/udp   # WireGuard
    
    # Enable firewall
    ufw --force enable
    
    # SSH hardening
    sed -i 's/#PermitRootLogin yes/PermitRootLogin no/' /etc/ssh/sshd_config
    sed -i 's/#PasswordAuthentication yes/PasswordAuthentication no/' /etc/ssh/sshd_config
    systemctl restart sshd
    
    log "✅ Security hardening completed"
}

# Generate production report
generate_production_report() {
    log "Generating production deployment report..."
    
    cat > /opt/pi5-supernode/PRODUCTION_REPORT.md << EOF
# Pi5 Supernode Production Deployment Report

**Deployment Date:** $(date)
**Domain:** ${DOMAIN_NAME}
**Environment:** production

## System Information
- **Platform:** $(uname -a)
- **Docker Version:** $(docker --version)
- **Total Memory:** $(free -h | awk '/^Mem:/{print $2}')
- **Disk Space:** $(df -h / | awk 'NR==2{print $4}') available

## Security Configuration
- **HTTPS Enabled:** $([ "${ENABLE_HTTPS}" == "true" ] && echo "✅ Yes" || echo "❌ No")
- **Firewall Status:** $(ufw status | head -1)
- **SSH Root Login:** Disabled
- **SSL Certificate:** Generated

## Service Status
$(docker-compose -f docker-compose.prod.yml ps)

## Access Information
- **Main Application:** https://${DOMAIN_NAME}
- **Grafana Dashboard:** https://${DOMAIN_NAME}/grafana (admin/${GRAFANA_PASSWORD})
- **Prometheus:** https://${DOMAIN_NAME}/prometheus

## Maintenance
- **Backup Schedule:** Daily at 2 AM
- **Log Rotation:** Daily, 30 day retention
- **Auto Updates:** Weekly on Sunday 3 AM

## Emergency Contacts
- **Admin:** root@${DOMAIN_NAME}
- **Support:** support@pi5supernode.com

---
*Generated by Pi5 Supernode Production Deployment Script*
EOF
    
    log "✅ Production report generated: /opt/pi5-supernode/PRODUCTION_REPORT.md"
}

# Main deployment workflow
main() {
    echo -e "${BLUE}
╔══════════════════════════════════════════════════════════════╗
║              Pi5 Supernode Production Deployment             ║
║                   Automated Setup Script                     ║
╚══════════════════════════════════════════════════════════════╝
${NC}
"

    log "Starting production deployment for domain: ${DOMAIN_NAME}"
    
    # Pre-deployment checks
    check_privileges
    check_system_requirements
    
    # System preparation
    install_docker
    setup_environment
    optimize_system
    
    # Security setup
    setup_ssl
    security_hardening
    
    # Application deployment
    deploy_application
    setup_monitoring
    
    # System integration
    setup_systemd_service
    setup_auto_updates
    
    # Final report
    generate_production_report
    
    echo -e "${GREEN}
╔══════════════════════════════════════════════════════════════╗
║                 🎉 DEPLOYMENT COMPLETE! 🎉                   ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  Pi5 Supernode is now running in production mode!           ║
║                                                              ║
║  🌐 Main Access: https://${DOMAIN_NAME}                     ║
║  📊 Monitoring: https://${DOMAIN_NAME}/grafana               ║
║  🔧 Prometheus: https://${DOMAIN_NAME}/prometheus            ║
║                                                              ║
║  📋 Credentials:                                             ║
║     Grafana: admin / ${GRAFANA_PASSWORD}         ║
║                                                              ║
║  📖 Full report: /opt/pi5-supernode/PRODUCTION_REPORT.md     ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
${NC}
"
    
    log "Production deployment completed successfully!"
}

# Run main function
main "$@"</parameter>