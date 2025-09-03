#!/bin/bash

# Pi5 Supernode - Complete Zero-Configuration Setup
# One-command installation for Raspberry Pi 5

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'
BRIGHT='\033[1m'

log() {
    echo -e "${GREEN}[$(date +'%H:%M:%S')]${NC} $1"
}

warn() {
    echo -e "${YELLOW}[$(date +'%H:%M:%S')] WARNING:${NC} $1"
}

error() {
    echo -e "${RED}[$(date +'%H:%M:%S')] ERROR:${NC} $1"
    exit 1
}

# Display banner
echo -e "${BRIGHT}${BLUE}
╔═══════════════════════════════════════════════════════════════════╗
║                    Pi5 Supernode Complete Setup                   ║
║                Ultra-Modular Network Management                    ║
║                    Zero Configuration Required                     ║
╚═══════════════════════════════════════════════════════════════════╝
${NC}
"

# Check if running on Pi5
check_pi5() {
    if grep -q "Raspberry Pi 5" /proc/cpuinfo 2>/dev/null; then
        log "✅ Raspberry Pi 5 detected"
    else
        warn "Not running on Raspberry Pi 5. Continuing with generic Linux setup..."
    fi
}

# Phase 1: System Preparation
setup_system() {
    log "Phase 1/6: System preparation..."
    
    # Update system
    sudo apt update && sudo apt upgrade -y
    
    # Install essential packages
    sudo apt install -y curl wget git vim htop tree build-essential
    
    # Install Node.js 18
    if ! command -v node &> /dev/null || [[ $(node -v | cut -d'v' -f2 | cut -d'.' -f1) -lt 18 ]]; then
        log "Installing Node.js 18..."
        curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
        sudo apt install -y nodejs
    fi
    
    log "✅ System preparation completed"
}

# Phase 2: Install Docker
install_docker() {
    log "Phase 2/6: Docker installation..."
    
    if ! command -v docker &> /dev/null; then
        curl -fsSL https://get.docker.com -o get-docker.sh
        sudo sh get-docker.sh
        sudo usermod -aG docker $USER
        rm get-docker.sh
        log "Docker installed successfully"
    else
        log "Docker already installed"
    fi
    
    # Install Docker Compose
    if ! command -v docker-compose &> /dev/null; then
        sudo apt install -y docker-compose-plugin
    fi
    
    log "✅ Docker setup completed"
}

# Phase 3: Setup Pi5 Supernode
setup_application() {
    log "Phase 3/6: Setting up Pi5 Supernode application..."
    
    # Install frontend dependencies
    npm install
    
    # Setup backend services
    cd backend
    for service in api-gateway network-service vpn-service automation-service; do
        if [[ -d "$service" ]]; then
            log "Setting up $service..."
            cd "$service"
            npm install
            cd ..
        fi
    done
    cd ..
    
    # Create environment file with auto-generated secrets
    if [[ ! -f .env ]]; then
        log "Generating secure environment configuration..."
        cat > .env << EOF
# Pi5 Supernode Auto-Generated Configuration
NODE_ENV=development

# Auto-generated security keys
JWT_SECRET=$(openssl rand -base64 64)
SESSION_SECRET=$(openssl rand -base64 32)

# Database (configure Supabase in Settings)
# VITE_SUPABASE_URL=your-project-url
# VITE_SUPABASE_ANON_KEY=your-anon-key

# API Configuration
API_GATEWAY_PORT=3000
FRONTEND_URL=http://$(hostname -I | awk '{print $1}'):5173

# Services
NETWORK_SERVICE_PORT=3001
VPN_SERVICE_PORT=3002
AUTOMATION_SERVICE_PORT=3003

# Monitoring
GRAFANA_PASSWORD=$(openssl rand -base64 16)
LOG_LEVEL=info
EOF
        chmod 600 .env
    fi
    
    log "✅ Application setup completed"
}

# Phase 4: Initialize Modular System
setup_modules() {
    log "Phase 4/6: Initializing modular architecture..."
    
    # Run automated installation
    node scripts/automated-install.js
    
    # Install all core modules
    node scripts/module-installer.js install-all
    
    log "✅ Modular system initialized"
}

# Phase 5: Security and Optimization
setup_security() {
    log "Phase 5/6: Security and optimization..."
    
    # Basic firewall setup
    if command -v ufw &> /dev/null; then
        sudo ufw --force reset
        sudo ufw default deny incoming
        sudo ufw default allow outgoing
        
        # Allow essential services
        sudo ufw allow 22/tcp      # SSH
        sudo ufw allow 80/tcp      # HTTP
        sudo ufw allow 443/tcp     # HTTPS
        sudo ufw allow 5173/tcp    # Development server
        sudo ufw allow 3000/tcp    # API Gateway
        sudo ufw allow 3100/tcp    # Grafana
        sudo ufw allow 51820/udp   # WireGuard
        
        sudo ufw --force enable
        log "Basic firewall configured"
    fi
    
    # System optimizations for Pi5
    if grep -q "Raspberry Pi 5" /proc/cpuinfo 2>/dev/null; then
        # CPU governor for performance
        echo performance | sudo tee /sys/devices/system/cpu/cpu*/cpufreq/scaling_governor
        
        # Memory optimizations
        echo "vm.swappiness=10" | sudo tee -a /etc/sysctl.conf
        echo "vm.vfs_cache_pressure=50" | sudo tee -a /etc/sysctl.conf
        sudo sysctl -p
        
        log "Pi5 performance optimizations applied"
    fi
    
    log "✅ Security and optimization completed"
}

# Phase 6: Start Services and Verify
start_services() {
    log "Phase 6/6: Starting services and verification..."
    
    # Start database services
    docker-compose up -d postgres redis
    sleep 10
    
    # Start backend services
    docker-compose up -d api-gateway
    sleep 5
    
    # Build and start frontend
    npm run build
    
    # Health checks
    local max_attempts=10
    local attempt=1
    
    log "Waiting for services to be ready..."
    while [[ $attempt -le $max_attempts ]]; do
        if curl -f -s http://localhost:3000/health >/dev/null; then
            log "✅ API Gateway is healthy"
            break
        else
            log "Health check attempt $attempt/$max_attempts..."
            sleep 5
            attempt=$((attempt + 1))
        fi
    done
    
    if [[ $attempt -gt $max_attempts ]]; then
        warn "API Gateway health check failed, but continuing..."
    fi
    
    log "✅ Service verification completed"
}

# Generate completion report
generate_completion_report() {
    local pi_ip=$(hostname -I | awk '{print $1}')
    
    echo -e "${GREEN}
╔═══════════════════════════════════════════════════════════════════╗
║                   🎉 SETUP COMPLETE! 🎉                           ║
╠═══════════════════════════════════════════════════════════════════╣
║                                                                   ║
║  Pi5 Supernode is ready with modular architecture!               ║
║                                                                   ║
║  🌐 Frontend: http://${pi_ip}:5173                                ║
║  📊 API Health: http://${pi_ip}:3000/health                       ║
║  📈 Grafana: http://${pi_ip}:3100                                 ║
║                                                                   ║
║  🔧 Development Commands:                                         ║
║     make dev           - Start development servers               ║
║     make module-status - Check module status                     ║
║     make health        - System health check                     ║
║                                                                   ║
║  📋 Next Steps:                                                   ║
║     1. Open http://${pi_ip}:5173 in browser                      ║
║     2. Complete Supabase setup in Settings                       ║
║     3. Configure modules as needed                               ║
║     4. Run 'make production-deploy' when ready                   ║
║                                                                   ║
╚═══════════════════════════════════════════════════════════════════╝
${NC}
"
    
    # Save setup info
    cat > PI5_SETUP_INFO.md << EOF
# Pi5 Supernode Setup Complete

**Setup Date:** $(date)
**IP Address:** ${pi_ip}
**Hostname:** $(hostname)

## Access Points
- Frontend: http://${pi_ip}:5173
- API Gateway: http://${pi_ip}:3000
- Grafana: http://${pi_ip}:3100

## Installed Modules
$(node scripts/module-installer.js status 2>/dev/null || echo "Module status check pending")

## Environment
- Node.js: $(node --version)
- Docker: $(docker --version)
- Platform: $(uname -a)

## Next Steps
1. Configure Supabase connection in Settings
2. Customize modules as needed
3. Run production deployment when ready

---
*Generated by Pi5 Supernode Auto Setup*
EOF
    
    log "Setup information saved to PI5_SETUP_INFO.md"
}

# Main execution
main() {
    log "Starting Pi5 Supernode complete setup..."
    
    check_pi5
    setup_system
    install_docker
    setup_application
    setup_modules
    setup_security
    start_services
    generate_completion_report
    
    log "🚀 Pi5 Supernode modular system setup completed successfully!"
}

# Execute main function
main "$@"</parameter>