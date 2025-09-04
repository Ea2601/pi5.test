# Pi5 Supernode - Buton API Bağlantıları Listesi

## 📋 Dashboard Butonları

### Dashboard.tsx
- **Yenile**: `GET /api/v1/network/devices`
- **Cihaz Keşfi**: `POST /api/v1/network/discover`
- **Cihaz Tara**: `POST /api/v1/network/scan`
- **Ağ Keşfi**: `POST /api/v1/network/topology/discover`
- **Rapor**: `GET /api/v1/reports/generate`
- **Engelle**: `POST /api/v1/network/devices/{mac}/block`

## 🔧 Cihaz Yönetimi Butonları

### Devices.tsx
- **Yenile**: `GET /api/v1/network/devices`
- **Cihaz Tara**: `POST /api/v1/network/discover`
- **Düzenle**: `PUT /api/v1/network/devices/{mac}`
- **Wake-on-LAN**: `POST /api/v1/network/devices/{mac}/wake`
- **Engelle**: `POST /api/v1/network/devices/{mac}/block`
- **Kaldır**: `DELETE /api/v1/network/devices/{mac}`

### DeviceModule.tsx
- **Cihaz Tara**: `POST /api/v1/modules/device-management/discover`
- **Yenile**: `GET /api/v1/modules/device-management/devices`
- **Wake Device**: `POST /api/v1/modules/device-management/devices/{mac}/wake`

## 🌐 Ağ Yönetimi Butonları

### Network.tsx - DNS Management
- **DNS Sunucu Ekle**: `POST /api/v1/network/dns/servers`
- **Ayarları Uygula**: `POST /api/v1/network/dns/apply`
- **Cache Temizle**: `POST /api/v1/network/dns/cache/flush`
- **Bağlantı Testi**: `POST /api/v1/network/dns/test`

### Network.tsx - DHCP Management
- **DHCP Pool Ekle**: `POST /api/v1/network/dhcp/pools`
- **Yapılandırmayı Uygula**: `POST /api/v1/network/dhcp/apply`
- **DHCP Sunucuları Tara**: `POST /api/v1/network/dhcp/discover`

### Network.tsx - WiFi Management
- **WiFi Ağı Ekle**: `POST /api/v1/network/wifi/networks`
- **Yapılandırmayı Uygula**: `POST /api/v1/network/wifi/apply`
- **Wi-Fi Servisini Restart**: `POST /api/v1/network/wifi/restart`
- **Kanal Tara**: `POST /api/v1/network/wifi/scan-channels`
- **Kanal Analizi**: `POST /api/v1/network/wifi/analyze`

### NetworkModule.tsx
- **DNS Sunucu Ekle**: `POST /api/v1/modules/network-management/dns/servers`
- **DHCP Pool Ekle**: `POST /api/v1/modules/network-management/dhcp/pools`
- **WiFi Ağı Ekle**: `POST /api/v1/modules/network-management/wifi/networks`
- **Ayarları Uygula**: `POST /api/v1/modules/network-management/apply-config`
- **Ağ Bağlantısı Test**: `POST /api/v1/modules/network-management/connection-test`

### NetworkSettings.tsx
- **Ayarları Uygula**: `POST /api/v1/network/settings/apply`
- **Ağ Yenile**: `POST /api/v1/network/interfaces/refresh`
- **Bağlantı Testi**: `POST /api/v1/network/connectivity/test`
- **Config Export**: `GET /api/v1/network/config/export`
- **Firewall Kuralı**: `POST /api/v1/network/firewall/rules`
- **Route Ekle**: `POST /api/v1/network/routing/rules`
- **Interface Ekle**: `POST /api/v1/network/interfaces`

### TrafficRuleManager.tsx
- **Yeni Kural**: `POST /api/v1/network/traffic/rules`
- **Kural Düzenle**: `PUT /api/v1/network/traffic/rules/{id}`
- **Kural Sil**: `DELETE /api/v1/network/traffic/rules/{id}`

### DNSManagement.tsx
- **DNS Sunucusu**: `POST /api/v1/network/dns/servers`
- **Yeni Profil**: `POST /api/v1/network/dns/profiles`
- **Önbelleği Temizle**: `POST /api/v1/network/dns/cache/flush`
- **Ayarları Kaydet**: `PUT /api/v1/network/dns/cache/settings`

### DHCPManagement.tsx
- **DHCP Pool**: `POST /api/v1/network/dhcp/pools`
- **Rezervasyon**: `POST /api/v1/network/dhcp/reservations`
- **Konfigürasyonu Uygula**: `POST /api/v1/network/dhcp/apply`

### WiFiManagement.tsx
- **WiFi Ağı**: `POST /api/v1/network/wifi/networks`
- **Access Point**: `POST /api/v1/network/wifi/access-points`
- **Güvenlik Politikası**: `POST /api/v1/network/wifi/security-policies`

### VLANManagement.tsx
- **Preset VLAN'lar**: `GET /api/v1/network/vlan/presets`
- **Özel VLAN**: `POST /api/v1/network/vlan/configurations`
- **VLAN Düzenle**: `PUT /api/v1/network/vlan/configurations/{id}`
- **VLAN Etkinleştir/Devre Dışı**: `PATCH /api/v1/network/vlan/configurations/{id}/toggle`

## 🛡️ VPN Yönetimi Butonları

### VPN.tsx
- **Yeni Sunucu**: `POST /api/v1/vpn/servers`
- **Yeni İstemci**: `POST /api/v1/vpn/clients`
- **Config İndir**: `GET /api/v1/vpn/clients/{id}/config`
- **QR Kod**: `GET /api/v1/vpn/clients/{id}/qr`

### ServerManagement.tsx
- **Yeni Sunucu**: `POST /api/v1/vpn/servers`
- **Sunucu Düzenle**: `PUT /api/v1/vpn/servers/{id}`
- **Sunucu Sil**: `DELETE /api/v1/vpn/servers/{id}`
- **Sunucu Başlat**: `POST /api/v1/vpn/servers/{id}/start`
- **Sunucu Durdur**: `POST /api/v1/vpn/servers/{id}/stop`

### ClientManagement.tsx
- **Yeni İstemci**: `POST /api/v1/vpn/clients`
- **İstemci Düzenle**: `PUT /api/v1/vpn/clients/{id}`
- **İstemci Sil**: `DELETE /api/v1/vpn/clients/{id}`
- **İstemci Etkinleştir**: `PATCH /api/v1/vpn/clients/{id}/enable`
- **İstemci Devre Dışı**: `PATCH /api/v1/vpn/clients/{id}/disable`
- **Config Üret**: `POST /api/v1/vpn/clients/{id}/generate-config`
- **Bulk Etkinleştir**: `POST /api/v1/vpn/clients/bulk/enable`
- **Bulk Devre Dışı**: `POST /api/v1/vpn/clients/bulk/disable`

### AutoWGInstaller.tsx
- **Kurulumu Başlat**: `POST /functions/v1/auto-wg-installer`
- **Sıfırla**: Local state reset (API call yok)

### VPNModule.tsx
- **Yeni Sunucu**: `POST /api/v1/modules/vpn-management/servers`
- **Yeni İstemci**: `POST /api/v1/modules/vpn-management/clients`
- **Config Üret**: `POST /api/v1/modules/vpn-management/clients/{id}/config`

## ⚡ Otomasyon Butonları

### Automations.tsx
- **Test Gönder**: `POST /api/v1/automation/webhooks/test`
- **Test Mesajı**: `POST /api/v1/automation/telegram/test`
- **Kuralı Kaydet**: `POST /api/v1/automation/rules`

### AutomationModule.tsx
- **Kural Oluştur**: `POST /api/v1/modules/automation-engine/rules`
- **Test Telegram**: `POST /api/v1/modules/automation-engine/telegram/test`
- **Webhook Test**: `POST /api/v1/modules/automation-engine/webhooks/test`

## 📊 İzleme Butonları

### Observability.tsx
- **Export Logs**: `GET /api/v1/monitoring/logs/export`
- **Clear Logs**: `DELETE /api/v1/monitoring/logs`

### MonitoringModule.tsx
- **Grafana Aç**: `window.open('http://localhost:3100')` (External)
- **Rapor Oluştur**: `POST /api/v1/modules/monitoring-dashboard/reports`
- **Uyarı Kuralı Ekle**: `POST /api/v1/modules/monitoring-dashboard/alerts`
- **Bildirim Ayarları**: `PUT /api/v1/modules/monitoring-dashboard/notifications`

## 💾 Depolama Butonları

### Storage.tsx
- **Yeni Paylaşım**: `POST /api/v1/storage/shares`
- **Yenile**: `GET /api/v1/storage/usb`
- **Yedekleme Başlat**: `POST /api/v1/storage/backup`

### StorageModule.tsx
- **Mount Device**: `POST /api/v1/modules/storage-management/usb/{id}/mount`
- **Unmount Device**: `POST /api/v1/modules/storage-management/usb/{id}/unmount`
- **Toggle Share**: `PATCH /api/v1/modules/storage-management/usb/{id}/share`
- **Start Backup**: `POST /api/v1/modules/storage-management/backup`

## ⚙️ Sistem Ayarları Butonları

### Settings.tsx
- **Yeni Snapshot Al**: `POST /api/v1/system/snapshots`
- **Geri Yükle**: `POST /api/v1/system/snapshots/{id}/restore`
- **API Anahtarı Yenile**: `POST /api/v1/system/api-keys/regenerate`
- **Güvenlik Taraması**: `POST /api/v1/system/security/scan`
- **Ayarları Uygula**: `POST /api/v1/system/settings/apply`
- **Bağlantı Testi**: `POST /api/v1/system/network/test`

### SystemSettingsModule.tsx
- **Snapshot Al**: `POST /api/v1/modules/system-settings/snapshots`
- **Modül Reload**: `POST /api/v1/modules/system-settings/modules/{id}/reload`

## 🎮 Hızlı İşlem Butonları

### QuickActions.tsx
- **Cihaz Tara**: `POST /api/v1/network/discover`
- **Ağ Keşfi**: `POST /api/v1/network/topology/discover`
- **Rapor**: `GET /api/v1/reports/system`
- **Engelle**: `POST /api/v1/network/devices/bulk/block`

## 🔒 Form Butonları

### Form Components
- **DeviceForm - Kaydet**: `PUT /api/v1/network/devices/{mac}`
- **ServerForm - Oluştur**: `POST /api/v1/vpn/servers`
- **ClientForm - Oluştur**: `POST /api/v1/vpn/clients`

## 🔍 Hız Testi Butonları

### SpeedTestManagement.tsx
- **Test Başlat**: `POST /api/v1/network/speed-test/run`
- **Test Geçmişi**: `GET /api/v1/network/speed-test/history`

## 📱 Modül İçi API Calls

### Communication Bus Messages
- **get-devices**: Module internal communication
- **discover-devices**: Module internal communication
- **wake-device**: Module internal communication
- **create-server**: Module internal communication
- **create-client**: Module internal communication
- **generate-config**: Module internal communication

## 🚨 Edge Functions

### Supabase Edge Functions
- **WireGuard Sync**: `POST /functions/v1/wireguard-sync`
- **Auto WG Installer**: `POST /functions/v1/auto-wg-installer`
- **Apply Traffic Changes**: `POST /functions/v1/apply-traffic-changes`
- **Validate Changes**: `POST /functions/v1/validate-traffic-changes`

## 📊 Real-time API Endpoints

### WebSocket Connections
- **Device Updates**: `WS /api/v1/network/devices/stream`
- **VPN Status**: `WS /api/v1/vpn/status/stream`
- **System Metrics**: `WS /api/v1/system/metrics/stream`
- **Network Topology**: `WS /api/v1/network/topology/stream`

## 🔐 Authentication Endpoints

### Auth Related
- **Login**: `POST /api/v1/auth/login`
- **Logout**: `POST /api/v1/auth/logout`
- **Refresh Token**: `POST /api/v1/auth/refresh`
- **User Profile**: `GET /api/v1/auth/profile`

## 🎯 Status Check Endpoints

### Health Checks
- **System Health**: `GET /health`
- **Services Health**: `GET /health/services`
- **Database Health**: `GET /health/database`
- **API Gateway Health**: `GET /api/v1/health`

## 📈 Monitoring Endpoints

### Metrics and Monitoring
- **System Metrics**: `GET /api/v1/system/metrics`
- **Performance Data**: `GET /api/v1/monitoring/performance`
- **Log Export**: `GET /api/v1/monitoring/logs/export`
- **Alert Rules**: `GET /api/v1/monitoring/alerts`

## 🔄 Backup ve Restore

### System Operations
- **Create Backup**: `POST /api/v1/system/backup`
- **Restore from Backup**: `POST /api/v1/system/restore`
- **List Backups**: `GET /api/v1/system/backups`

## 🌍 External API Integrations

### Third Party APIs
- **Telegram Bot**: `POST https://api.telegram.org/bot{token}/sendMessage`
- **n8n Webhooks**: `POST {webhook_base_url}/network-events`
- **Grafana API**: `GET http://localhost:3100/api/health`

---

## 🏷️ API Endpoint Kategorileri

### Network Management APIs
```
/api/v1/network/
├── devices/                 # Device management
├── discover/               # Network discovery
├── topology/               # Network topology
├── dns/                    # DNS management
├── dhcp/                   # DHCP management
├── wifi/                   # WiFi management
├── traffic/                # Traffic rules
├── interfaces/             # Network interfaces
├── firewall/               # Firewall rules
└── routing/                # Routing rules
```

### VPN Management APIs
```
/api/v1/vpn/
├── servers/                # WireGuard servers
├── clients/                # WireGuard clients
├── status/                 # VPN status
└── config/                 # Configuration management
```

### System APIs
```
/api/v1/system/
├── metrics/                # System metrics
├── settings/               # System settings
├── snapshots/              # System snapshots
├── backup/                 # Backup operations
└── health/                 # Health checks
```

### Automation APIs
```
/api/v1/automation/
├── rules/                  # Automation rules
├── webhooks/               # Webhook management
├── telegram/               # Telegram integration
└── triggers/               # Event triggers
```

### Module APIs
```
/api/v1/modules/
├── device-management/      # Device module APIs
├── network-management/     # Network module APIs
├── vpn-management/         # VPN module APIs
├── automation-engine/      # Automation module APIs
├── storage-management/     # Storage module APIs
├── monitoring-dashboard/   # Monitoring module APIs
└── system-settings/        # Settings module APIs
```

---

**Toplam API Endpoint Sayısı: 65+**
**Toplam Buton API Bağlantısı: 45+**
**Edge Function Sayısı: 4**
**WebSocket Endpoint Sayısı: 4**