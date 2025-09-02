# Pi5 Supernode - Kapsamlı Sistem Dokümantasyonu

## 📋 İçindekiler

1. [Sistem Envanteri ve Analizi](#sistem-envanteri-ve-analizi)
2. [Hızlı Kurulum](#hızlı-kurulum)
3. [Kaynak Haritası](#kaynak-haritası)
4. [Teknik Detaylar](#teknik-detaylar)
5. [API Referansı](#api-referansı)
6. [Veritabanı Şeması](#veritabanı-şeması)
7. [Geliştirici Kılavuzu](#geliştirici-kılavuzu)
8. [Sorun Giderme](#sorun-giderme)

---

## Sistem Envanteri ve Analizi

### 🏗️ Proje Yapısı

```
Pi5 Supernode v2.1.4
├── Frontend (React + TypeScript)
│   ├── 📁 src/components/
│   │   ├── ui/ (8 dosya) - Temel UI sistemi
│   │   ├── views/ (10 dosya) - Ana görünümler
│   │   ├── cards/ (5 dosya) - Özelleşmiş kartlar
│   │   ├── layout/ (1 dosya) - Düzen bileşenleri
│   │   ├── network/ (5 dosya) - Ağ yönetimi
│   │   ├── vpn/ (3 dosya) - VPN yönetimi
│   │   └── [diğer modüller]
│   ├── 📁 hooks/api/ (12 dosya) - API entegrasyonu
│   ├── 📁 services/ (3 dosya) - Birleştirilmiş API
│   ├── 📁 types/ (8 dosya) - TypeScript tipleri
│   └── 📁 styles/ (2 dosya) - Global stiller
├── Backend (Node.js Mikroservisler)
│   ├── api-gateway/ (Port 3000) - Ana API gateway
│   ├── network-service/ (Port 3001) - Ağ yönetimi
│   ├── vpn-service/ (Port 3002) - VPN servisi
│   └── automation-service/ (Port 3003) - Otomasyon
├── Shared (Birleştirilmiş Kütüphaneler)
│   ├── utils/ - Logger, database, validation
│   ├── types/ - Ortak tip tanımları
│   ├── config/ - Environment yönetimi
│   └── schemas/ - OpenAPI şema
├── Infrastructure
│   ├── docker-compose.yml - Container orkestrasyon
│   ├── nginx/ - Reverse proxy yapılandırması
│   ├── monitoring/ - Prometheus + Grafana
│   └── logging/ - Log toplama sistemi
└── Database (Supabase + PostgreSQL)
    ├── migrations/ (7 dosya) - Veritabanı şeması
    ├── functions/ (3 dosya) - Edge functions
    └── triggers/ - Real-time tetikleyiciler
```

### 🔧 Tekilleştirme Sonuçları

**Önce:**
- ❌ 5 farklı logger implementasyonu
- ❌ 4 farklı database service
- ❌ 3 farklı HTTP client
- ❌ Dağınık environment variables
- ❌ Çoklanan TypeScript tipleri

**Sonra:**
- ✅ Tek UnifiedLogger sistemi
- ✅ Tek DatabaseManager
- ✅ Tek UnifiedApiClient
- ✅ Merkezi environment config
- ✅ Birleştirilmiş tip tanımları

---

## Hızlı Kurulum

### 🚀 One-Line Installation

```bash
# Tüm sistemi kurup başlatır
make quick-start
```

### 📦 Manuel Kurulum

```bash
# 1. Depoyu klonlayın
git clone https://github.com/pi5-supernode/pi5-supernode.git
cd pi5-supernode

# 2. Bağımlılıkları kurun
make install

# 3. Environment ayarlayın
cp .env.example .env
nano .env  # Gerekli ayarları yapın

# 4. Veritabanını başlatın
make migrate

# 5. Geliştirme sunucusunu başlatın
make dev
```

### 🐳 Docker ile Kurulum

```bash
# Tek komutla production kurulum
make deploy-prod

# Veya development için
make docker:up
```

---

## Kaynak Haritası

### 📍 Environment Variables (.env)

| Anahtar | Açıklama | Varsayılan | Gerekli |
|---------|----------|------------|---------|
| **Database** | | | |
| `DATABASE_URL` | PostgreSQL bağlantı string'i | - | ✅ |
| `POSTGRES_PASSWORD` | PostgreSQL şifresi | postgres | ✅ |
| `REDIS_URL` | Redis bağlantı string'i | redis://localhost:6379 | ✅ |
| `SUPABASE_URL` | Supabase proje URL'si | - | ✅ |
| `SUPABASE_ANON_KEY` | Supabase anon anahtarı | - | ✅ |
| **API Services** | | | |
| `API_GATEWAY_PORT` | API Gateway portu | 3000 | - |
| `NETWORK_SERVICE_PORT` | Network Service portu | 3001 | - |
| `VPN_SERVICE_PORT` | VPN Service portu | 3002 | - |
| `AUTOMATION_SERVICE_PORT` | Automation Service portu | 3003 | - |
| **Security** | | | |
| `JWT_SECRET` | JWT imzalama anahtarı | - | ✅ |
| `SESSION_SECRET` | Oturum şifreleme anahtarı | - | ✅ |
| **External** | | | |
| `TELEGRAM_BOT_TOKEN` | Telegram bot anahtarı | - | ❌ |
| `WEBHOOK_BASE_URL` | n8n webhook URL'si | - | ❌ |
| **Monitoring** | | | |
| `GRAFANA_PASSWORD` | Grafana admin şifresi | admin | ✅ |
| `LOG_LEVEL` | Log seviyesi | info | - |

### 📂 Dosya Konumları

| Özellik | Konum | Açıklama |
|---------|-------|----------|
| **Frontend** | | |
| Ana uygulama | `src/App.tsx` | React ana bileşeni |
| Navigasyon | `src/components/layout/Navigation.tsx` | Sidebar navigasyonu |
| Cihaz yönetimi | `src/components/views/Devices.tsx` | Cihaz listesi ve yönetimi |
| VPN yönetimi | `src/components/views/VPN.tsx` | WireGuard yönetimi |
| Ağ ayarları | `src/components/views/Network.tsx` | DNS/DHCP/Wi-Fi |
| **Backend** | | |
| API Gateway | `backend/api-gateway/src/index.ts` | Ana API rotası |
| Network Service | `backend/network-service/src/index.ts` | Ağ işlemleri |
| VPN Service | `backend/vpn-service/src/index.ts` | WireGuard yönetimi |
| **Database** | | |
| Şema | `supabase/migrations/` | Veritabanı şeması |
| Edge Functions | `supabase/functions/` | Supabase fonksiyonları |
| **Configuration** | | |
| Docker | `docker-compose.yml` | Container yapılandırması |
| Nginx | `infrastructure/nginx/` | Reverse proxy |
| Monitoring | `infrastructure/monitoring/` | Prometheus/Grafana |

### 🔗 API Endpoints

| Service | Endpoint | Açıklama |
|---------|----------|----------|
| **Health Checks** | | |
| System Health | `GET /health` | Genel sistem durumu |
| Services Health | `GET /health/services` | Tüm servis durumu |
| **Network Management** | | |
| Device List | `GET /api/v1/network/devices` | Ağ cihazları listesi |
| Device Create | `POST /api/v1/network/devices` | Yeni cihaz ekle |
| Device Update | `PUT /api/v1/network/devices/{mac}` | Cihaz güncelle |
| Device Discovery | `POST /api/v1/network/discover` | Ağ taraması |
| **DHCP Management** | | |
| DHCP Pools | `GET /api/v1/network/dhcp/pools` | IP havuzları |
| Active Leases | `GET /api/v1/network/dhcp/leases` | Aktif IP atamaları |
| Reservations | `GET /api/v1/network/dhcp/reservations` | Statik IP'ler |
| **DNS Management** | | |
| DNS Servers | `GET /api/v1/network/dns/servers` | DNS sunucuları |
| DNS Profiles | `GET /api/v1/network/dns/profiles` | Güvenlik profilleri |
| Query Logs | `GET /api/v1/network/dns/query-logs` | DNS sorgu logları |
| **VPN Management** | | |
| WG Servers | `GET /api/v1/vpn/servers` | WireGuard sunucuları |
| WG Clients | `GET /api/v1/vpn/clients` | WireGuard istemcileri |
| Generate Config | `POST /api/v1/vpn/clients/{id}/config` | İstemci config üret |

---

## Teknik Detaylar

### 🔧 Sistem Gereksinimleri

**Donanım:**
- **CPU**: Raspberry Pi 5 (ARM Cortex-A76)
- **RAM**: 4GB minimum, 8GB önerilen
- **Depolama**: 64GB+ microSD (Class 10/UHS-I)
- **Ağ**: Gigabit Ethernet + Wi-Fi 6

**Yazılım:**
- **OS**: Raspberry Pi OS (64-bit) - Debian Bookworm
- **Docker**: Version 24.0+
- **Node.js**: Version 18+ (geliştirme için)
- **Python**: 3.11+ (scripts için)

### 📊 Performans Hedefleri

| Metrik | Hedef | Ölçüm |
|--------|-------|-------|
| **Frontend** | | |
| İlk Yükleme | < 2s | Lighthouse |
| Bundle Boyutu | < 500KB | Vite Bundle Analyzer |
| Component Mount | < 100ms | Performance API |
| **Backend** | | |
| API Response | < 500ms | Express middleware |
| DB Query | < 200ms | PostgreSQL EXPLAIN |
| Memory Usage | < 512MB | Docker stats |
| **System** | | |
| CPU Usage | < 60% | htop/Prometheus |
| Memory Usage | < 4GB | free -h |
| Disk I/O | < 80% | iostat |

### 🔒 Güvenlik Özellikleri

**Authentication & Authorization:**
- JWT token tabanlı kimlik doğrulama
- Row Level Security (RLS) veritabanında
- API key yönetimi servisler arası
- Rate limiting DDoS koruması

**Network Security:**
- HTTPS/TLS end-to-end şifreleme
- Input validation ve sanitization
- SQL injection koruması
- XSS koruması (CSP headers)
- CORS yapılandırması

**VPN Security:**
- WireGuard modern şifreleme
- Otomatik key rotation
- Perfect Forward Secrecy
- Network segmentation (VLAN)

---

## API Referansı

### 📡 OpenAPI Specification

Full API dokümantasyonu: `shared/schemas/openapi.yaml`

**Base URL**: `http://localhost:3000/api/v1`

**Authentication**: Bearer Token
```bash
curl -H "Authorization: Bearer your-jwt-token" \
     http://localhost:3000/api/v1/network/devices
```

### 🔍 Örnek API Çağrıları

**Cihaz Listesi:**
```bash
curl -X GET "http://localhost:3000/api/v1/network/devices?active=true&type=Mobile"
```

**Yeni Cihaz Ekleme:**
```bash
curl -X POST "http://localhost:3000/api/v1/network/devices" \
  -H "Content-Type: application/json" \
  -d '{
    "mac_address": "00:1A:2B:3C:4D:5E",
    "device_name": "iPhone 14 Pro",
    "device_type": "Mobile",
    "device_brand": "Apple"
  }'
```

**VPN İstemci Config:**
```bash
curl -X POST "http://localhost:3000/api/v1/vpn/clients/client-id/config"
```

---

## Veritabanı Şeması

### 📊 Ana Tablolar

| Tablo | Açıklama | Kayıt Sayısı (Tahmini) |
|-------|----------|------------------------|
| `network_devices` | Ağ cihazları envanteri | 50-200 |
| `traffic_rules` | Trafik routing kuralları | 10-50 |
| `client_groups` | Cihaz gruplandırma | 5-20 |
| `tunnel_pools` | VPN tünel yapılandırması | 3-10 |
| `routing_history` | Routing geçmişi (log) | 10K-100K |
| `tunnel_performance` | VPN performans metrikleri | 1K-10K |
| `dns_servers` | DNS sunucu yapılandırması | 5-15 |
| `dns_profiles` | DNS güvenlik profilleri | 3-10 |
| `dns_query_logs` | DNS sorgu logları | 100K-1M |
| `dhcp_pools` | DHCP IP havuzları | 5-20 |
| `dhcp_reservations` | Statik IP atamaları | 10-100 |
| `dhcp_leases` | Aktif IP kiraları | 20-200 |
| `wifi_access_points` | Wi-Fi AP cihazları | 1-10 |
| `wifi_networks` | SSID yapılandırmaları | 3-20 |
| `wifi_clients` | Wi-Fi istemci durumu | 20-100 |

### 🔄 İlişkiler

```sql
-- Cihaz → Grup → Kural ilişkisi
network_devices.mac_address → traffic_rules.client_group_id → client_groups.id

-- VLAN → DHCP ilişkisi  
vlan_catalog.vlan_id → dhcp_pools.vlan_id

-- Wi-Fi → VLAN ilişkisi
wifi_networks.vlan_id → vlan_catalog.vlan_id

-- DNS → Cihaz ilişkisi
dns_device_assignments.device_mac → network_devices.mac_address
```

---

## Geliştirici Kılavuzu

### 🛠️ Development Workflow

```bash
# 1. Proje hazırlığı
git clone [repo-url]
cd pi5-supernode
make install

# 2. Geliştirme başlat
make dev

# 3. Test çalıştır
make test

# 4. Build ve deploy
make build
make deploy-dev
```

### 📝 Code Standards

**TypeScript:**
- Strict mode enabled
- No `any` types (prefer unknown)
- Explicit return types
- Proper error handling

**React:**
- Functional components only
- Custom hooks for logic
- Proper dependency arrays
- Error boundaries

**API:**
- RESTful conventions
- Consistent response format
- Input validation
- Error standardization

### 🧪 Testing Strategy

```bash
# Unit tests
npm run test

# Integration tests
npm run test:integration

# E2E tests  
npm run test:e2e

# Performance tests
npm run test:performance
```

---

## Sorun Giderme

### 🚨 Yaygın Sorunlar

#### 1. Port Çakışması
```bash
# Problemi tespit et
sudo netstat -tlnp | grep -E "(3000|3001|3002|3003)"

# Çakışan process'i sonlandır
sudo pkill -f "node.*3000"

# Alternatif port kullan
PORT=3010 npm run dev
```

#### 2. Database Bağlantı Hatası
```bash
# PostgreSQL durumunu kontrol et
docker-compose ps postgres
docker-compose logs postgres

# Bağlantı testi
docker-compose exec postgres psql -U postgres -d pi5_supernode -c "SELECT version();"

# Veritabanını yeniden başlat
docker-compose restart postgres
```

#### 3. Memory Sorunları
```bash
# Memory kullanımını kontrol et
htop
docker stats

# Container memory limitlerini ayarla
# docker-compose.yml'de memory limits ekle

# Node.js memory ayarla
NODE_OPTIONS="--max-old-space-size=512" npm run dev
```

#### 4. WireGuard Sorunları
```bash
# WireGuard modülünü kontrol et
lsmod | grep wireguard

# Servisi kontrol et
sudo systemctl status wg-quick@wg0

# Interface durumunu gör
sudo wg show

# Config dosyasını doğrula
sudo wg-quick up wg0 --dry-run
```

### 🔧 Sistem Komutları

```bash
# Sistem durumu
make health
make status

# Log'ları görüntüle
make logs
make logs-api
make logs-network

# Backup al
make backup

# Temizlik yap
make clean
make clean-full

# Optimizasyon
make optimize
make analyze
```

### 📊 Monitoring Endpoints

| URL | Açıklama |
|-----|----------|
| http://localhost:3100 | Grafana Dashboard |
| http://localhost:9090 | Prometheus Metrics |
| http://localhost:3000/health | API Health Check |
| http://localhost:5173 | Frontend (Development) |

---

## 🔄 CI/CD Pipeline

### GitHub Actions Workflow

```yaml
# .github/workflows/ci.yml
name: Pi5 Supernode CI/CD

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: make install
      - run: make test
      - run: make build
      
  deploy:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - run: make deploy-prod
```

### 📦 Release Process

```bash
# 1. Version bump
npm version patch  # or minor/major

# 2. Update changelog
git add CHANGELOG.md

# 3. Create release
git tag v2.1.5
git push origin v2.1.5

# 4. Deploy
make deploy-prod
```

---

## 📋 Maintenance Checklist

### Günlük
- [ ] Sistem health check (`make health`)
- [ ] Log review (`make logs`)
- [ ] Resource usage (`docker stats`)

### Haftalık  
- [ ] Security updates (`make security-scan`)
- [ ] Performance review (`make analyze`)
- [ ] Backup verification (`make backup`)

### Aylık
- [ ] Dependency updates (`npm audit`)
- [ ] Log rotation ve cleanup (`make clean`)
- [ ] Documentation update

---

## 📞 Destek

**GitHub Issues**: https://github.com/pi5-supernode/issues
**Documentation**: https://docs.pi5supernode.com  
**Community**: https://community.pi5supernode.com

**Emergency Contact**: 
- System Admin: admin@pi5supernode.com
- Technical Support: support@pi5supernode.com

---

*Bu dokümantasyon Pi5 Supernode v2.1.4 için hazırlanmıştır. Son güncelleme: 2025-01-15*