#!/bin/bash

# WireGuard Setup and Management Script
# This script handles WireGuard installation, configuration, and system integration

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
WG_CONFIG_DIR="/etc/wireguard"
WG_BACKUP_DIR="/var/backups/wireguard"
LOG_FILE="/var/log/wireguard-management.log"

# Logging function
log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOG_FILE"
}

# Print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
    log "INFO: $1"
}

print_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
    log "WARN: $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
    log "ERROR: $1"
}

# Check if running as root
check_root() {
    if [[ $EUID -ne 0 ]]; then
        print_error "This script must be run as root"
        exit 1
    fi
}

# Install WireGuard if not present
install_wireguard() {
    print_status "Checking WireGuard installation..."
    
    if ! command -v wg &> /dev/null; then
        print_status "Installing WireGuard..."
        
        # Update package list
        apt update
        
        # Install WireGuard
        apt install -y wireguard wireguard-tools
        
        # Enable IP forwarding
        echo 'net.ipv4.ip_forward = 1' >> /etc/sysctl.conf
        echo 'net.ipv6.conf.all.forwarding = 1' >> /etc/sysctl.conf
        sysctl -p
        
        print_status "WireGuard installed successfully"
    else
        print_status "WireGuard already installed"
    fi
}

# Create WireGuard directories
setup_directories() {
    print_status "Setting up directories..."
    
    mkdir -p "$WG_CONFIG_DIR"
    mkdir -p "$WG_BACKUP_DIR"
    mkdir -p "$(dirname "$LOG_FILE")"
    
    chmod 700 "$WG_CONFIG_DIR"
    chmod 700 "$WG_BACKUP_DIR"
    
    print_status "Directories created successfully"
}

# Generate WireGuard key pair
generate_keypair() {
    local key_name="$1"
    local output_dir="${2:-$WG_CONFIG_DIR}"
    
    if [[ -z "$key_name" ]]; then
        print_error "Key name is required"
        return 1
    fi
    
    print_status "Generating key pair for $key_name..."
    
    # Generate private key
    wg genkey > "$output_dir/${key_name}_private.key"
    chmod 600 "$output_dir/${key_name}_private.key"
    
    # Generate public key
    wg pubkey < "$output_dir/${key_name}_private.key" > "$output_dir/${key_name}_public.key"
    chmod 644 "$output_dir/${key_name}_public.key"
    
    print_status "Key pair generated for $key_name"
}

# Create server configuration
create_server_config() {
    local interface_name="$1"
    local listen_port="$2"
    local network_cidr="$3"
    local private_key_file="$4"
    
    local config_file="$WG_CONFIG_DIR/${interface_name}.conf"
    
    print_status "Creating server configuration: $interface_name"
    
    # Backup existing config if it exists
    if [[ -f "$config_file" ]]; then
        cp "$config_file" "$WG_BACKUP_DIR/${interface_name}.conf.$(date +%Y%m%d_%H%M%S)"
        print_warning "Existing configuration backed up"
    fi
    
    # Create server configuration
    cat > "$config_file" << EOF
[Interface]
PrivateKey = $(cat "$private_key_file")
Address = ${network_cidr%/*}.1/24
ListenPort = $listen_port
PostUp = iptables -A FORWARD -i $interface_name -j ACCEPT; iptables -A FORWARD -o $interface_name -j ACCEPT; iptables -t nat -A POSTROUTING -o eth0 -j MASQUERADE
PostDown = iptables -D FORWARD -i $interface_name -j ACCEPT; iptables -D FORWARD -o $interface_name -j ACCEPT; iptables -t nat -D POSTROUTING -o eth0 -j MASQUERADE

EOF
    
    chmod 600 "$config_file"
    print_status "Server configuration created: $config_file"
}

# Add client to server configuration
add_client_to_server() {
    local interface_name="$1"
    local client_public_key="$2"
    local client_ip="$3"
    local allowed_ips="${4:-$client_ip/32}"
    
    local config_file="$WG_CONFIG_DIR/${interface_name}.conf"
    
    if [[ ! -f "$config_file" ]]; then
        print_error "Server configuration not found: $config_file"
        return 1
    fi
    
    print_status "Adding client to $interface_name..."
    
    # Add peer configuration
    cat >> "$config_file" << EOF
[Peer]
PublicKey = $client_public_key
AllowedIPs = $allowed_ips

EOF
    
    print_status "Client added to server configuration"
}

# Remove client from server configuration
remove_client_from_server() {
    local interface_name="$1"
    local client_public_key="$2"
    
    local config_file="$WG_CONFIG_DIR/${interface_name}.conf"
    local temp_file=$(mktemp)
    
    if [[ ! -f "$config_file" ]]; then
        print_error "Server configuration not found: $config_file"
        return 1
    fi
    
    print_status "Removing client from $interface_name..."
    
    # Remove peer section
    awk -v pubkey="$client_public_key" '
        /^\[Peer\]/ { in_peer = 1; peer_lines = ""; next }
        in_peer && /^PublicKey = / {
            if ($3 == pubkey) {
                skip_peer = 1
            } else {
                print "[Peer]"
                print peer_lines
                print $0
                skip_peer = 0
            }
            next
        }
        in_peer && /^\[/ { 
            if (!skip_peer) {
                print "[Peer]"
                print peer_lines
            }
            in_peer = 0
            skip_peer = 0
            peer_lines = ""
            print $0
            next
        }
        in_peer {
            if (!skip_peer) {
                if (peer_lines) peer_lines = peer_lines "\n"
                peer_lines = peer_lines $0
            }
            next
        }
        !in_peer { print $0 }
        END {
            if (in_peer && !skip_peer) {
                print "[Peer]"
                print peer_lines
            }
        }
    ' "$config_file" > "$temp_file"
    
    mv "$temp_file" "$config_file"
    chmod 600 "$config_file"
    
    print_status "Client removed from server configuration"
}

# Start WireGuard interface
start_interface() {
    local interface_name="$1"
    
    print_status "Starting WireGuard interface: $interface_name"
    
    if systemctl is-active --quiet "wg-quick@${interface_name}"; then
        print_warning "Interface $interface_name is already active"
        return 0
    fi
    
    systemctl enable "wg-quick@${interface_name}"
    systemctl start "wg-quick@${interface_name}"
    
    if systemctl is-active --quiet "wg-quick@${interface_name}"; then
        print_status "Interface $interface_name started successfully"
    else
        print_error "Failed to start interface $interface_name"
        return 1
    fi
}

# Stop WireGuard interface
stop_interface() {
    local interface_name="$1"
    
    print_status "Stopping WireGuard interface: $interface_name"
    
    if ! systemctl is-active --quiet "wg-quick@${interface_name}"; then
        print_warning "Interface $interface_name is not active"
        return 0
    fi
    
    systemctl stop "wg-quick@${interface_name}"
    systemctl disable "wg-quick@${interface_name}"
    
    print_status "Interface $interface_name stopped successfully"
}

# Reload WireGuard configuration
reload_interface() {
    local interface_name="$1"
    
    print_status "Reloading WireGuard interface: $interface_name"
    
    if systemctl is-active --quiet "wg-quick@${interface_name}"; then
        systemctl restart "wg-quick@${interface_name}"
        print_status "Interface $interface_name reloaded successfully"
    else
        print_warning "Interface $interface_name is not active, starting instead"
        start_interface "$interface_name"
    fi
}

# Generate client configuration
generate_client_config() {
    local client_name="$1"
    local server_interface="$2"
    local client_ip="$3"
    local server_public_key="$4"
    local server_endpoint="$5"
    local allowed_ips="${6:-0.0.0.0/0}"
    local dns_servers="${7:-1.1.1.1}"
    
    local client_private_key_file="$WG_CONFIG_DIR/${client_name}_private.key"
    local client_config_file="$WG_CONFIG_DIR/${client_name}.conf"
    
    print_status "Generating client configuration for $client_name"
    
    # Generate client keys if they don't exist
    if [[ ! -f "$client_private_key_file" ]]; then
        generate_keypair "$client_name"
    fi
    
    # Create client configuration
    cat > "$client_config_file" << EOF
[Interface]
PrivateKey = $(cat "$client_private_key_file")
Address = $client_ip/32
DNS = $dns_servers

[Peer]
PublicKey = $server_public_key
Endpoint = $server_endpoint
AllowedIPs = $allowed_ips
PersistentKeepalive = 25
EOF
    
    chmod 600 "$client_config_file"
    print_status "Client configuration created: $client_config_file"
    
    # Return client public key for server configuration
    cat "$WG_CONFIG_DIR/${client_name}_public.key"
}

# Get interface status
get_interface_status() {
    local interface_name="$1"
    
    if ip link show "$interface_name" &> /dev/null; then
        echo "active"
    else
        echo "inactive"
    fi
}

# Get peer statistics
get_peer_stats() {
    local interface_name="$1"
    local peer_public_key="$2"
    
    if ! ip link show "$interface_name" &> /dev/null; then
        echo "interface_down"
        return 1
    fi
    
    wg show "$interface_name" | grep -A 5 "$peer_public_key" || echo "peer_not_found"
}

# Backup all configurations
backup_configs() {
    local backup_name="wireguard_backup_$(date +%Y%m%d_%H%M%S)"
    local backup_path="$WG_BACKUP_DIR/$backup_name"
    
    print_status "Creating backup: $backup_name"
    
    mkdir -p "$backup_path"
    cp -r "$WG_CONFIG_DIR"/* "$backup_path/" 2>/dev/null || true
    
    # Create backup metadata
    cat > "$backup_path/backup_info.txt" << EOF
Backup Created: $(date)
WireGuard Version: $(wg --version | head -n1)
System: $(uname -a)
Active Interfaces: $(wg show interfaces)
EOF
    
    print_status "Backup created: $backup_path"
}

# Restore from backup
restore_configs() {
    local backup_name="$1"
    local backup_path="$WG_BACKUP_DIR/$backup_name"
    
    if [[ ! -d "$backup_path" ]]; then
        print_error "Backup not found: $backup_name"
        return 1
    fi
    
    print_warning "Restoring from backup: $backup_name"
    print_warning "This will overwrite current configurations!"
    
    read -p "Continue? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_status "Restore cancelled"
        return 0
    fi
    
    # Stop all WireGuard interfaces
    for interface in $(wg show interfaces); do
        stop_interface "$interface"
    done
    
    # Backup current configs
    backup_configs
    
    # Restore configurations
    cp -r "$backup_path"/* "$WG_CONFIG_DIR/"
    chmod 600 "$WG_CONFIG_DIR"/*.conf
    
    print_status "Configurations restored from backup"
}

# Main function
main() {
    case "$1" in
        "install")
            check_root
            install_wireguard
            setup_directories
            ;;
        "generate-keys")
            check_root
            generate_keypair "$2" "$3"
            ;;
        "create-server")
            check_root
            create_server_config "$2" "$3" "$4" "$5"
            ;;
        "add-client")
            check_root
            add_client_to_server "$2" "$3" "$4" "$5"
            ;;
        "remove-client")
            check_root
            remove_client_from_server "$2" "$3"
            ;;
        "start")
            check_root
            start_interface "$2"
            ;;
        "stop")
            check_root
            stop_interface "$2"
            ;;
        "reload")
            check_root
            reload_interface "$2"
            ;;
        "status")
            get_interface_status "$2"
            ;;
        "stats")
            get_peer_stats "$2" "$3"
            ;;
        "backup")
            check_root
            backup_configs
            ;;
        "restore")
            check_root
            restore_configs "$2"
            ;;
        "generate-client-config")
            check_root
            generate_client_config "$2" "$3" "$4" "$5" "$6" "$7" "$8"
            ;;
        *)
            echo "Usage: $0 {install|generate-keys|create-server|add-client|remove-client|start|stop|reload|status|stats|backup|restore|generate-client-config}"
            echo ""
            echo "Commands:"
            echo "  install                                           - Install WireGuard and setup directories"
            echo "  generate-keys <name> [output_dir]                - Generate key pair"
            echo "  create-server <interface> <port> <cidr> <keyfile> - Create server configuration"
            echo "  add-client <interface> <pubkey> <ip> [allowed]   - Add client to server"
            echo "  remove-client <interface> <pubkey>               - Remove client from server"
            echo "  start <interface>                                - Start WireGuard interface"
            echo "  stop <interface>                                 - Stop WireGuard interface"
            echo "  reload <interface>                               - Reload WireGuard interface"
            echo "  status <interface>                               - Get interface status"
            echo "  stats <interface> <pubkey>                       - Get peer statistics"
            echo "  backup                                           - Backup all configurations"
            echo "  restore <backup_name>                           - Restore from backup"
            echo "  generate-client-config <name> <server_iface> <ip> <server_pubkey> <endpoint> [allowed] [dns]"
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@"