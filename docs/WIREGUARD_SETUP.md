# WireGuard VPN Management System Setup Guide

## 🚀 Quick Start

This guide walks you through setting up the complete WireGuard VPN management system with full CRUD operations, client groups, and system integration.

## 📋 Prerequisites

### System Requirements
- Raspberry Pi 5 with 4GB+ RAM
- Raspberry Pi OS (64-bit) or Ubuntu 22.04+
- Root access for WireGuard installation
- Port 51820 (or custom) open in firewall
- Valid domain name (optional, for endpoint configuration)

### Network Requirements
- Static IP address or DDNS setup
- Router port forwarding configured
- Firewall rules allowing WireGuard traffic

## 🔧 Installation Steps

### Step 1: Install WireGuard
```bash
# Run the setup script
sudo chmod +x scripts/wireguard-setup.sh
sudo ./scripts/wireguard-setup.sh install
```

### Step 2: Database Setup
The database schema is automatically applied when you connect to Supabase. The migration includes:
- WireGuard servers table
- WireGuard clients table
- Configuration templates
- Connection history tracking

### Step 3: Environment Configuration
```bash
# Copy environment template
cp .env.example .env

# Edit environment variables
nano .env
```

Required environment variables:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Step 4: Start the Application
```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

## 🖥️ Usage Guide

### Server Management

#### Creating a New Server
1. Navigate to VPN → Servers tab
2. Click "Yeni Sunucu" (New Server)
3. Fill in server details:
   - **Name**: Descriptive server name
   - **Interface**: Network interface (e.g., wg0)
   - **Port**: UDP listen port (default: 51820)
   - **Network CIDR**: VPN network range (e.g., 10.0.0.0/24)
   - **Endpoint**: Public server address
   - **DNS**: DNS servers for clients
   - **Max Clients**: Maximum client limit

#### Server Operations
- **Start/Stop**: Toggle server active status
- **Edit**: Modify server configuration
- **Delete**: Remove server (stops service and removes config)

### Client Management

#### Adding Clients
1. Navigate to VPN → Clients tab
2. Click "Yeni İstemci" (New Client)
3. Configure client settings:
   - **Name**: Client device name
   - **Server**: Target WireGuard server
   - **Allowed IPs**: Traffic routing rules
   - **Keepalive**: Connection persistence

#### Client Operations
- **Generate Config**: Create configuration file and QR code
- **Enable/Disable**: Toggle client access
- **Edit**: Modify client settings
- **Bulk Operations**: Select multiple clients for batch actions

#### Configuration Download
- **QR Code**: Scan with mobile WireGuard app
- **Config File**: Download .conf file for desktop clients
- **Copy**: Copy configuration text to clipboard

### Advanced Features

#### Client Groups
Create groups to organize and manage clients:
```sql
-- Example: Create work devices group
INSERT INTO client_groups (name, description) 
VALUES ('Work Devices', 'Corporate laptops and mobile devices');
```

#### Bulk Operations
- Select multiple clients using checkboxes
- Apply bulk enable/disable operations
- Assign clients to groups simultaneously

#### Traffic Monitoring
- Real-time connection status
- Bandwidth usage statistics
- Connection history tracking
- Last handshake timestamps

## 🔐 Security Configuration

### Key Management
- Automatic key pair generation
- Secure key storage in database
- Key regeneration for compromised clients
- Regular key rotation support

### Access Control
- Row Level Security (RLS) enabled
- Authentication required for all operations
- Audit logging for configuration changes
- Client group-based permissions

### Network Security
- iptables integration for traffic forwarding
- NAT configuration for internet access
- DNS leak prevention
- Kill switch support

## 🔧 System Integration

### Configuration Files
Server configurations are stored in `/etc/wireguard/`:
```
/etc/wireguard/
├── wg0.conf          # Main server configuration
├── wg1.conf          # Additional server
├── server_private.key # Server private key
└── server_public.key  # Server public key
```

### Service Management
```bash
# Check service status
sudo systemctl status wg-quick@wg0

# View interface status
sudo wg show

# Monitor logs
sudo journalctl -u wg-quick@wg0 -f
```

### System Scripts
The management system integrates with system-level scripts:
```bash
# Start/stop interfaces
sudo ./scripts/wireguard-setup.sh start wg0
sudo ./scripts/wireguard-setup.sh stop wg0

# Backup configurations
sudo ./scripts/wireguard-setup.sh backup

# Generate client configuration
sudo ./scripts/wireguard-setup.sh generate-client-config client1 wg0 10.0.0.2 server_pubkey vpn.example.com:51820
```

## 📊 Monitoring and Troubleshooting

### Health Checks
The system provides comprehensive health monitoring:
- Server availability status
- Client connection status
- Traffic statistics
- Performance metrics

### Log Files
Monitor system activity through logs:
```bash
# WireGuard management logs
sudo tail -f /var/log/wireguard-management.log

# System journal
sudo journalctl -u wg-quick@wg0 -f

# Application logs
tail -f logs/application.log
```

### Common Issues

#### 1. Connection Failures
```bash
# Check interface status
sudo wg show

# Verify configuration
sudo wg-quick up wg0 --dry-run

# Check firewall
sudo ufw status
```

#### 2. DNS Issues
```bash
# Test DNS resolution
nslookup google.com

# Check DNS configuration in client config
cat /etc/wireguard/client.conf
```

#### 3. Routing Problems
```bash
# Check routing table
ip route show

# Verify IP forwarding
cat /proc/sys/net/ipv4/ip_forward
```

## 🔄 API Integration

### Edge Functions
The system includes Supabase edge functions for system integration:

#### WireGuard Sync Function
- **Endpoint**: `/functions/v1/wireguard-sync`
- **Purpose**: Synchronize database changes with system configuration
- **Actions**: create, update, delete, start, stop

### Usage Example
```typescript
const response = await fetch(`${supabaseUrl}/functions/v1/wireguard-sync`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${supabaseKey}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    server_id: 'uuid',
    action: 'start',
    config_data: serverConfig
  })
});
```

## 🔒 Production Deployment

### Security Hardening
1. **Firewall Configuration**:
   ```bash
   sudo ufw allow 51820/udp
   sudo ufw enable
   ```

2. **SSH Key Management**:
   ```bash
   sudo ssh-keygen -t ed25519 -C "wireguard-management"
   ```

3. **SSL Certificate Setup**:
   ```bash
   sudo certbot --nginx -d vpn.yourdomain.com
   ```

### Performance Optimization
1. **Kernel Module**: Ensure WireGuard kernel module is loaded
2. **CPU Scaling**: Configure governor for performance
3. **Network Buffers**: Optimize network buffer sizes
4. **Memory**: Allocate sufficient RAM for connection tracking

### Monitoring Setup
1. **Prometheus Metrics**: Enable WireGuard exporter
2. **Grafana Dashboards**: Import VPN monitoring dashboards
3. **Alerts**: Configure alerts for connection failures
4. **Log Rotation**: Setup log rotation for WireGuard logs

## 📱 Client Setup

### Mobile Devices (iOS/Android)
1. Install WireGuard app from App Store/Play Store
2. Scan QR code generated by management interface
3. Activate tunnel in WireGuard app

### Desktop Clients
1. Install WireGuard desktop client
2. Download .conf file from management interface
3. Import configuration into WireGuard client
4. Activate tunnel

### Command Line (Linux)
```bash
# Copy configuration
sudo cp client.conf /etc/wireguard/

# Start tunnel
sudo wg-quick up client

# Check status
sudo wg show
```

## 🛠️ Maintenance

### Regular Tasks
- Monitor connection statistics
- Review client access logs
- Update WireGuard versions
- Rotate client keys periodically
- Backup configurations weekly

### Performance Monitoring
- Track bandwidth usage per client
- Monitor server resource utilization
- Check tunnel latency and stability
- Review security logs for anomalies

This comprehensive setup provides a complete WireGuard VPN management solution with enterprise-grade features, security, and monitoring capabilities.