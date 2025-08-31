# Pi5 Süpernode Kurulum Kılavuzu

## 🎯 Kurulacak Sistem Genel Bakış

Bu kılavuz, Raspberry Pi 5 üzerinde **Pi5 Süpernode Enterprise Ağ Yönetimi Platformu**'nu kurmak için gereken tüm adımları içerir. Sistem şunları içerir:

- **Frontend**: React + TypeScript web arayüzü
- **Backend**: Node.js mikroservis mimarisi
- **Veritabanı**: PostgreSQL + Redis
- **Konteyner Yönetimi**: Docker + Docker Compose
- **VPN Yönetimi**: WireGuard entegrasyonu
- **İzleme**: Prometheus + Grafana
- **Reverse Proxy**: Nginx
- **Güvenlik**: JWT kimlik doğrulama + RBAC

---

## 📋 1. Sistem Gereksinimleri

### Donanım Gereksinimleri
- **Raspberry Pi 5** (4GB RAM minimum, 8GB önerilen)
- **MicroSD Kart**: Minimum 64GB (Class 10/UHS-I)
- **Ethernet Bağlantısı**: Gigabit önerilen
- **Güç Kaynağı**: Resmi Raspberry Pi 5 adaptörü (5V/5A)
- **Soğutma**: Aktif soğutma (fan) önerilen

### Yazılım Gereksinimleri
- **İşletim Sistemi**: Raspberry Pi OS (64-bit) - Debian Bookworm tabanlı
- **SSH Erişimi**: Uzaktan yönetim için etkinleştirilmiş
- **İnternet Bağlantısı**: Paket indirme ve güncelleme için

---

## 🚀 2. İlk Sistem Kurulumu

### Adım 2.1: Raspberry Pi OS Kurulumu

```bash
# Raspberry Pi Imager ile microSD karta Raspberry Pi OS (64-bit) yazın
# SSH'yi etkinleştirin ve WiFi ayarlarını yapın (eğer gerekiyorsa)
```

### Adım 2.2: İlk Boot ve SSH Bağlantısı

```bash
# SSH ile Pi'ye bağlanın
ssh pi@<pi_ip_adresi>

# Varsayılan şifre: raspberry (değiştirmenizi öneririz)
```

### Adım 2.3: Sistem Güncellemesi

```bash
# Sistem paketlerini güncelleyin
sudo apt update
sudo apt upgrade -y

# Firmware güncellemesi
sudo rpi-update

# Yeniden başlatın
sudo reboot
```

### Adım 2.4: Temel Araçların Kurulumu

```bash
# Gerekli araçları kurun
sudo apt install -y curl wget git vim htop tree unzip

# Build araçları
sudo apt install -y build-essential

# Python ve pip (bazı scriptler için)
sudo apt install -y python3 python3-pip

# Network araçları
sudo apt install -y nmap arp-scan iptables-persistent
```

---

## 🐳 3. Docker Kurulumu

### Adım 3.1: Docker Engine Kurulumu

```bash
# Docker'ın resmi kurulum scriptini çalıştırın
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Pi kullanıcısını docker grubuna ekleyin
sudo usermod -aG docker pi

# Değişikliklerin etkili olması için oturumu yenileyin
newgrp docker

# Docker servisini etkinleştirin
sudo systemctl enable docker
sudo systemctl start docker
```

### Adım 3.2: Docker Compose Kurulumu

```bash
# Docker Compose Plugin'i kurun
sudo apt install -y docker-compose-plugin

# Kurulumu doğrulayın
docker --version
docker compose version
```

### Adım 3.3: Docker Kurulumu Doğrulama

```bash
# Test container çalıştırın
docker run hello-world

# Docker sistem bilgilerini kontrol edin
docker system info
```

---

## 🔧 4. Pi5 Süpernode Kurulumu

### Adım 4.1: Proje Dosyalarını İndirme

```bash
# Ev dizinine gidin
cd ~

# Projeyi GitHub'dan klonlayın (ya da dosyaları kopyalayın)
git clone https://github.com/yourusername/pi5-supernode.git
cd pi5-supernode

# Alternatif: Dosyaları manuel olarak kopyalayın
# mkdir pi5-supernode
# cd pi5-supernode
# (Proje dosyalarını buraya kopyalayın)
```

### Adım 4.2: Çevre Değişkenlerini Yapılandırma

```bash
# Environment dosyasını oluşturun
cp .env.example .env

# Dosyayı düzenleyin
nano .env
```

**Önemli ayarlar (.env dosyasında):**

```env
# Güçlü şifreler belirlleyin
POSTGRES_PASSWORD=your_secure_password_here
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
GRAFANA_PASSWORD=your_grafana_admin_password

# Pi'nin IP adresini girin
FRONTEND_URL=http://192.168.1.XXX:5173

# Telegram bot (isteğe bağlı)
TELEGRAM_BOT_TOKEN=your_telegram_bot_token

# n8n webhook (isteğe bağlı)
WEBHOOK_BASE_URL=https://your-n8n-instance.com
```

### Adım 4.3: Dizin İzinlerini Ayarlama

```bash
# Log dizinlerini oluşturun
sudo mkdir -p /var/log/pi5-supernode
sudo chown pi:pi /var/log/pi5-supernode

# WireGuard dizinini hazırlayın
sudo mkdir -p /etc/wireguard
sudo chmod 700 /etc/wireguard

# Docker volume dizinlerini oluşturun
mkdir -p docker-volumes/{postgres,redis,grafana,prometheus}
```

---

## 🗄️ 5. Veritabanı Kurulumu

### Adım 5.1: PostgreSQL Container'ını Başlatma

```bash
# Sadece PostgreSQL'i başlatın
docker compose up -d postgres

# Container'ın çalıştığını doğrulayın
docker compose ps
docker compose logs postgres
```

### Adım 5.2: Veritabanı Bağlantısını Test Etme

```bash
# PostgreSQL'e bağlanın
docker compose exec postgres psql -U postgres -d pi5_supernode

# Bağlantı başarılıysa şu komutla çıkın:
\q
```

### Adım 5.3: Redis Cache Kurulumu

```bash
# Redis container'ını başlatın
docker compose up -d redis

# Redis bağlantısını test edin
docker compose exec redis redis-cli ping
# PONG dönmeli
```

---

## 🖥️ 6. Backend Servisleri Kurulumu

### Adım 6.1: Backend Dependencies Kurulumu

```bash
# Backend dizinine gidin
cd backend

# Tüm servislerde dependency'leri kurun
for service in api-gateway network-service vpn-service automation-service; do
  echo "Installing dependencies for $service..."
  cd $service
  npm install
  cd ..
done

# Ana dizine dönün
cd ..
```

### Adım 6.2: API Gateway Kurulumu

```bash
# API Gateway'i başlatın
docker compose up -d api-gateway

# Log'ları kontrol edin
docker compose logs -f api-gateway
```

### Adım 6.3: Mikroservisleri Başlatma

```bash
# Tüm backend servislerini başlatın
docker compose up -d network-service vpn-service automation-service

# Servislerin durumunu kontrol edin
docker compose ps
```

---

## 🌐 7. Frontend Kurulumu

### Adım 7.1: Node.js ve npm Kurulumu

```bash
# Node.js 18 kurulumu
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Kurulumu doğrulayın
node --version
npm --version
```

### Adım 7.2: Frontend Dependencies

```bash
# Ana proje dizininde frontend bağımlılıklarını kurun
npm install

# Build işlemini test edin
npm run build
```

### Adım 7.3: Development Server'ı Başlatma

```bash
# Development server'ı başlatın
npm run dev

# Alternatif: Production için build
npm run build
npm run preview
```

---

## 🔌 8. WireGuard Entegrasyonu

### Adım 8.1: WireGuard Kurulumu

```bash
# WireGuard paketlerini kurun
sudo apt install -y wireguard wireguard-tools

# IP forwarding'i etkinleştirin
echo 'net.ipv4.ip_forward=1' | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

### Adım 8.2: WireGuard Yönetim Scriptini Hazırlama

```bash
# Script'i çalıştırılabilir yapın
chmod +x scripts/wireguard-setup.sh

# WireGuard dizinlerini oluşturun
sudo ./scripts/wireguard-setup.sh install
```

---

## 📊 9. İzleme Sistemi Kurulumu

### Adım 9.1: Prometheus ve Grafana

```bash
# İzleme stack'ini başlatın
docker compose up -d prometheus grafana

# Grafana'ya erişimi kontrol edin
# URL: http://pi_ip_adresi:3100
# Kullanıcı: admin
# Şifre: .env dosyasındaki GRAFANA_PASSWORD
```

### Adım 9.2: Nginx Reverse Proxy

```bash
# Nginx'i başlatın
docker compose up -d nginx

# Ana sisteme erişimi kontrol edin
# URL: http://pi_ip_adresi
```

---

## ⚙️ 10. Settings Bölümü Yapılandırması

### Adım 10.1: Sistem Ayarları

Tarayıcıdan `http://pi_ip_adresi:5173` adresine gidin ve Settings sekmesini açın:

1. **Sistem Yapılandırması**:
   - Otomatik güncellemeleri etkinleştirin
   - SSH erişimini kontrol edin
   - Telemetri ayarlarını yapın

2. **Güvenlik Ayarları**:
   - API anahtarlarını yenileyin
   - Güvenlik taraması çalıştırın
   - Audit loglarını kontrol edin

3. **Yedekleme Ayarları**:
   - Otomatik snapshot oluşturmayı etkinleştirin
   - Yedekleme sıklığını ayarlayın

### Adım 10.2: VPN Ayarları

VPN sekmesinden:

1. **İlk WireGuard Sunucusu**:
   - "Yeni Sunucu" butonuna tıklayın
   - Sunucu adı: "Ana VPN Sunucusu"
   - Interface: wg0
   - Port: 51820
   - Ağ CIDR: 10.0.0.0/24

2. **İlk İstemci**:
   - "Yeni İstemci" butonuna tıklayın
   - İstemci adı girin
   - QR kod veya config dosyasını indirin

### Adım 10.3: Ağ Ayarları

Network sekmesinden:

1. **DNS Ayarları**:
   - Upstream DNS sunucularını yapılandırın
   - DNS filtreleme ayarlarını etkinleştirin

2. **DHCP Ayarları**:
   - IP aralığını belirleyin
   - Rezervasyonları yapın

---

## ✅ 11. Kurulum Doğrulama

### Adım 11.1: Servis Durumu Kontrolü

```bash
# Tüm container'ların durumunu kontrol edin
docker compose ps

# Servis health check'lerini çalıştırın
curl http://localhost:3000/health
curl http://localhost:3000/health/services
```

### Adım 11.2: Ağ Bağlantısı Testi

```bash
# Frontend erişimini test edin
curl -I http://localhost:5173

# API Gateway'e erişimi test edin
curl http://localhost:3000/health
```

### Adım 11.3: Veritabanı Bağlantısı Testi

```bash
# PostgreSQL bağlantısını test edin
docker compose exec postgres psql -U postgres -d pi5_supernode -c "SELECT version();"

# Redis bağlantısını test edin
docker compose exec redis redis-cli ping
```

### Adım 11.4: WireGuard Fonksiyon Testi

```bash
# WireGuard durumunu kontrol edin
sudo wg show

# Network interfaces kontrol edin
ip link show
```

---

## 🌐 12. Web Arayüzü İlk Erişim

### Adım 12.1: Tarayıcı Erişimi

1. **Ana Panel**: `http://pi_ip_adresi:5173`
2. **API Health**: `http://pi_ip_adresi:3000/health`
3. **Grafana**: `http://pi_ip_adresi:3100`
4. **Prometheus**: `http://pi_ip_adresi:9090`

### Adım 12.2: İlk Kullanıcı Oluşturma

Web arayüzünden:
1. Settings → Erişim Kontrolü
2. Yönetici hesabı oluşturun
3. Güvenlik ayarlarını yapın

---

## 🔧 13. Gelişmiş Yapılandırma

### Adım 13.1: Nginx SSL Sertifikası (Production için)

```bash
# Certbot kurulumu
sudo apt install -y certbot python3-certbot-nginx

# SSL sertifikası oluşturun
sudo certbot --nginx -d yourdomain.com

# Otomatik yenileme için cron job
sudo crontab -e
# Şu satırı ekleyin:
# 0 12 * * * /usr/bin/certbot renew --quiet
```

### Adım 13.2: Firewall Yapılandırması

```bash
# UFW firewall kurun ve yapılandırın
sudo apt install -y ufw

# Temel kurallar
sudo ufw default deny incoming
sudo ufw default allow outgoing

# SSH erişimi
sudo ufw allow ssh

# HTTP/HTTPS
sudo ufw allow 80
sudo ufw allow 443

# WireGuard
sudo ufw allow 51820/udp

# Development (gerekirse)
sudo ufw allow 5173
sudo ufw allow 3000

# Firewall'u etkinleştirin
sudo ufw enable
```

### Adım 13.3: Sistem Servisi Olarak Çalıştırma

```bash
# Systemd servis dosyası oluşturun
sudo tee /etc/systemd/system/pi5-supernode.service > /dev/null <<EOF
[Unit]
Description=Pi5 Supernode Network Management
After=docker.service
Requires=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/home/pi/pi5-supernode
ExecStart=/usr/bin/docker compose up -d
ExecStop=/usr/bin/docker compose down
User=pi

[Install]
WantedBy=multi-user.target
EOF

# Servisi etkinleştirin
sudo systemctl daemon-reload
sudo systemctl enable pi5-supernode.service
```

---

## 🔍 14. Kurulum Doğrulama ve Test

### Adım 14.1: Sistem Sağlık Kontrolü

```bash
# Tüm servislerin durumunu kontrol edin
docker compose ps

# Her servisin health endpoint'ini test edin
echo "API Gateway Health:"
curl -s http://localhost:3000/health | jq

echo "Network Service Health:"
curl -s http://localhost:3001/health | jq

echo "VPN Service Health:"
curl -s http://localhost:3002/health | jq

echo "Automation Service Health:"
curl -s http://localhost:3003/health | jq
```

### Adım 14.2: Ağ Keşfi Testi

```bash
# Ağdaki cihazları tarayın
sudo nmap -sn 192.168.1.0/24

# ARP tablosunu kontrol edin
arp -a

# DHCP kiralamalarını görüntüleyin (Kea kuruluysa)
# sudo dhcp-lease-list
```

### Adım 14.3: VPN Fonksiyon Testi

```bash
# WireGuard arayüzlerini listeleyin
sudo wg show interfaces

# Konfigürasyon dosyalarını kontrol edin
sudo ls -la /etc/wireguard/
```

---

## 🛠️ 15. Sorun Giderme

### Yaygın Sorunlar ve Çözümleri

#### Sorun 1: Docker Container'ları Başlamıyor

```bash
# Log'ları kontrol edin
docker compose logs [servis_adı]

# Disk alanını kontrol edin
df -h

# Bellek kullanımını kontrol edin
free -h

# Container'ları yeniden başlatın
docker compose restart [servis_adı]
```

#### Sorun 2: Frontend Erişilemiyor

```bash
# Port'un dinlendiğini kontrol edin
sudo netstat -tlnp | grep :5173

# Development server'ı manuel başlatın
npm run dev

# Build hatalarını kontrol edin
npm run build
```

#### Sorun 3: Database Bağlantı Hatası

```bash
# PostgreSQL container'ının çalıştığını kontrol edin
docker compose ps postgres

# Database log'larını inceleyin
docker compose logs postgres

# Manuel bağlantı testi
docker compose exec postgres psql -U postgres -l
```

#### Sorun 4: WireGuard Çalışmıyor

```bash
# Kernel modülünü kontrol edin
lsmod | grep wireguard

# WireGuard servisi durumu
sudo systemctl status wg-quick@wg0

# Konfigurasyon dosyası kontrolü
sudo wg-quick up wg0 --dry-run

# Log kontrolü
sudo journalctl -u wg-quick@wg0 -f
```

#### Sorun 5: Yavaş Performans

```bash
# CPU kullanımını kontrol edin
htop

# Disk I/O kontrolü
sudo iotop

# Bellek kullanımı
free -h && sync && echo 3 | sudo tee /proc/sys/vm/drop_caches && free -h

# Docker resource kullanımı
docker stats
```

---

## 🔄 16. Sistem Bakımı

### Günlük Bakım

```bash
# Container log'larını temizleyin
docker system prune -f

# Disk alanını kontrol edin
df -h

# Sistem log'larını kontrol edin
sudo journalctl --disk-usage
sudo journalctl --vacuum-time=7d
```

### Haftalık Bakım

```bash
# Sistem güncellemelerini kontrol edin
sudo apt update && sudo apt list --upgradable

# Docker image'larını güncelleyin
docker compose pull
docker compose up -d --force-recreate

# Veritabanı backup'ı alın
docker compose exec postgres pg_dump -U postgres pi5_supernode > backup_$(date +%Y%m%d).sql
```

### Aylık Bakım

```bash
# Tam sistem backup'ı
sudo rsync -av --exclude=docker-volumes /home/pi/pi5-supernode/ /media/backup/

# Log rotasyonu
sudo logrotate -f /etc/logrotate.conf

# Disk defragmentasyonu (gerekirse)
sudo e4defrag /
```

---

## 📈 17. Performans Optimizasyonu

### Adım 17.1: Raspberry Pi 5 Optimizasyonu

```bash
# GPU bellek ayarı (config.txt'e ekleyin)
echo "gpu_mem=128" | sudo tee -a /boot/config.txt

# CPU governor ayarı
echo performance | sudo tee /sys/devices/system/cpu/cpu*/cpufreq/scaling_governor

# Swappiness azaltın
echo "vm.swappiness=10" | sudo tee -a /etc/sysctl.conf
```

### Adım 17.2: Docker Optimizasyonu

```bash
# Docker daemon ayarları
sudo tee /etc/docker/daemon.json > /dev/null <<EOF
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  },
  "storage-driver": "overlay2"
}
EOF

# Docker'ı yeniden başlatın
sudo systemctl restart docker
```

---

## 🔒 18. Güvenlik Sıkılaştırması

### Adım 18.1: SSH Güvenliği

```bash
# SSH ayarlarını düzenleyin
sudo nano /etc/ssh/sshd_config

# Şu ayarları yapın:
# PermitRootLogin no
# PasswordAuthentication no  # Sadece key kullanın
# Port 2222  # Varsayılan port değiştirin

# SSH servisini yeniden başlatın
sudo systemctl restart ssh
```

### Adım 18.2: Sistem Güncellemeleri

```bash
# Otomatik güvenlik güncellemelerini etkinleştirin
sudo apt install -y unattended-upgrades

sudo dpkg-reconfigure -plow unattended-upgrades
```

---

## 🎉 19. Kurulum Tamamlandı!

Kurulum başarıyla tamamlandıysa:

1. **Ana Panel**: `http://pi_ip_adresi:5173` adresinden erişebilirsiniz
2. **İlk kez girişte** Settings bölümünden sistem yapılandırmasını tamamlayın
3. **VPN kurulumu** için VPN sekmesinden WireGuard ayarlarını yapın
4. **Cihaz keşfi** için Devices sekmesinden ağ taraması başlatın

### Sonraki Adımlar

1. **Domain yapılandırması**: DNS ayarlarını yapın
2. **SSL sertifikası**: HTTPS için SSL kurun
3. **Monitoring**: Grafana dashboard'larını özelleştirin
4. **Backup stratejisi**: Düzenli yedekleme planı oluşturun

---

## 📞 Destek ve Dokümantasyon

**Loglar**: `/var/log/pi5-supernode/` dizininde
**Konfigürasyon**: `docker-compose.yml` ve `.env` dosyaları
**WireGuard**: `/etc/wireguard/` dizini
**Veritabanı**: PostgreSQL container içinde

**İletişim**: Sorunlar için GitHub Issues veya community forum kullanın.

---

*Bu kurulum kılavuzu Raspberry Pi 5 ve Pi5 Süpernode v2.1.4 için hazırlanmıştır.*