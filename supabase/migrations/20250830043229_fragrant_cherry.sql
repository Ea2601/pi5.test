/*
  # Sample Data for Traffic Routing System

  1. Sample Data
    - Pre-configured traffic classifications
    - Example client groups
    - Sample tunnel pools
    - Default routing rules
    - Mock performance data

  2. Purpose
    - Provides working examples for immediate testing
    - Demonstrates system capabilities
    - Shows best practice configurations
*/

-- Insert traffic classifications for common traffic types
INSERT INTO traffic_classifications (name, category, protocols, ports, domains, signatures) VALUES
('Web Browsing', 'Web', '["http", "https"]', '[80, 443, 8080, 8443]', '["*.com", "*.org", "*.net"]', '["GET /", "POST /"]'),
('Video Streaming', 'Media', '["http", "https", "rtmp"]', '[80, 443, 1935, 8080]', '["*.youtube.com", "*.netflix.com", "*.twitch.tv", "*.vimeo.com"]', '["video/", "stream"]'),
('Social Media', 'Social', '["http", "https"]', '[80, 443]', '["*.facebook.com", "*.twitter.com", "*.instagram.com", "*.tiktok.com"]', '["api/v1/", "graph"]'),
('Gaming', 'Gaming', '["tcp", "udp"]', '[27015, 3478, 3479, 3480]', '["*.steam.com", "*.epicgames.com", "*.battle.net"]', '["steam", "origin"]'),
('VoIP/Video Calls', 'Communication', '["udp", "tcp"]', '[3478, 5060, 5061, 8000]', '["*.zoom.us", "*.teams.microsoft.com", "*.meet.google.com"]', '["rtp/", "sip/"]'),
('File Transfer', 'Downloads', '["http", "https", "ftp"]', '[21, 80, 443]', '["*.torrent", "*.p2p"]', '["BitTorrent", "magnet:"]'),
('Email Services', 'Email', '["smtp", "imap", "pop3"]', '[25, 110, 143, 587, 993, 995]', '["*.gmail.com", "*.outlook.com"]', '["SMTP", "IMAP"]'),
('Cloud Storage', 'Cloud', '["http", "https"]', '[80, 443]', '["*.dropbox.com", "*.icloud.com", "*.drive.google.com"]', '["sync", "backup"]');

-- Insert client groups
INSERT INTO client_groups (name, description, criteria, bandwidth_limit, priority) VALUES
('Yönetici Cihazları', 'Sistem yöneticilerinin cihazları', '{"device_types": ["PC"], "users": ["admin"], "priority": "high"}', NULL, 90),
('Mobil Cihazlar', 'Akıllı telefon ve tabletler', '{"device_types": ["Mobile"], "os": ["iOS", "Android"]}', 50, 70),
('IoT Cihazları', 'Nesnelerin interneti cihazları', '{"device_types": ["IoT"], "protocols": ["mqtt", "http"]}', 10, 30),
('Oyun Konsolları', 'Oyun cihazları ve gaming PC''ler', '{"device_types": ["Game Console", "PC"], "traffic_types": ["Gaming"]}', 100, 80),
('Ofis Bilgisayarları', 'İş amaçlı kullanılan bilgisayarlar', '{"device_types": ["PC"], "ip_range": "192.168.1.100-150"}', 75, 60),
('Misafir Cihazları', 'Geçici erişim cihazları', '{"networks": ["guest"], "temporary": true}', 25, 20);

-- Insert tunnel pools
INSERT INTO tunnel_pools (name, description, tunnel_type, endpoints, load_balance_method, health_check_enabled) VALUES
('US East Pool', 'Amerika Doğu kıyısı sunucuları', 'wireguard', '[
  {"name": "US-East-1", "endpoint": "us-east-1.vpn.com:51820", "public_key": "abc123", "location": "New York"},
  {"name": "US-East-2", "endpoint": "us-east-2.vpn.com:51820", "public_key": "def456", "location": "Miami"}
]', 'round_robin', true),
('EU West Pool', 'Avrupa Batı sunucuları', 'wireguard', '[
  {"name": "EU-West-1", "endpoint": "eu-west-1.vpn.com:51820", "public_key": "ghi789", "location": "London"},
  {"name": "EU-West-2", "endpoint": "eu-west-2.vpn.com:51820", "public_key": "jkl012", "location": "Frankfurt"}
]', 'latency_based', true),
('Asia Pacific Pool', 'Asya Pasifik sunucuları', 'wireguard', '[
  {"name": "AP-1", "endpoint": "ap-1.vpn.com:51820", "public_key": "mno345", "location": "Singapore"},
  {"name": "AP-2", "endpoint": "ap-2.vpn.com:51820", "public_key": "pqr678", "location": "Tokyo"}
]', 'round_robin', true),
('Local Bypass', 'Yerel trafik bypass', 'direct', '[
  {"name": "Direct", "endpoint": "local", "type": "bypass", "location": "Local"}
]', 'direct', false);

-- Insert traffic routing rules
INSERT INTO traffic_rules (name, description, priority, conditions, actions, client_group_id, tunnel_pool_id) VALUES
('Gaming Traffic Priority', 'Oyun trafiğini düşük gecikme sunucularına yönlendir', 95, 
'{"traffic_types": ["Gaming"], "latency_threshold": 50, "time_range": "19:00-02:00"}', 
'{"tunnel_selection": "latency_based", "qos_priority": "high", "bandwidth_guarantee": "50%"}', 
(SELECT id FROM client_groups WHERE name = 'Oyun Konsolları'), 
(SELECT id FROM tunnel_pools WHERE name = 'EU West Pool')),

('Streaming Optimization', 'Video streaming için bant genişliği optimizasyonu', 85, 
'{"traffic_types": ["Video Streaming"], "bandwidth_usage": ">10MB/s"}', 
'{"tunnel_selection": "bandwidth_based", "qos_priority": "medium", "compression": false}', 
NULL, 
(SELECT id FROM tunnel_pools WHERE name = 'US East Pool')),

('Mobile Data Saver', 'Mobil cihazlar için veri tasarrufu', 70, 
'{"client_groups": ["Mobil Cihazlar"], "data_usage": ">1GB/day"}', 
'{"compression": true, "image_optimization": true, "tunnel_selection": "cost_effective"}', 
(SELECT id FROM client_groups WHERE name = 'Mobil Cihazlar'), 
(SELECT id FROM tunnel_pools WHERE name = 'Asia Pacific Pool')),

('Local Bypass Rule', 'Yerel trafiği bypass et', 99, 
'{"destinations": ["192.168.*", "10.*", "172.16.*"], "traffic_types": ["Local"]}', 
'{"action": "bypass", "tunnel": "none", "qos_priority": "normal"}', 
NULL, 
(SELECT id FROM tunnel_pools WHERE name = 'Local Bypass')),

('Business Hours Restriction', 'İş saatleri trafik kısıtlaması', 60, 
'{"time_range": "09:00-17:00", "traffic_types": ["Social Media", "Gaming"], "weekdays": true}', 
'{"bandwidth_limit": "5MB/s", "blocked_domains": ["*.facebook.com", "*.instagram.com"]}', 
(SELECT id FROM client_groups WHERE name = 'Ofis Bilgisayarları'), 
NULL),

('Guest Network Control', 'Misafir ağı trafik kontrolü', 40, 
'{"client_groups": ["Misafir Cihazları"]}', 
'{"bandwidth_limit": "10MB/s", "blocked_ports": [22, 23, 3389], "dns_filter": "strict"}', 
(SELECT id FROM client_groups WHERE name = 'Misafir Cihazları'), 
(SELECT id FROM tunnel_pools WHERE name = 'Asia Pacific Pool'));

-- Insert sample tunnel performance data
INSERT INTO tunnel_performance (tunnel_id, tunnel_name, endpoint, latency_ms, packet_loss_percent, bandwidth_mbps, active_connections, is_healthy) VALUES
(gen_random_uuid(), 'US-East-1', 'us-east-1.vpn.com:51820', 45, 0.1, 157.8, 12, true),
(gen_random_uuid(), 'US-East-2', 'us-east-2.vpn.com:51820', 52, 0.2, 143.2, 8, true),
(gen_random_uuid(), 'EU-West-1', 'eu-west-1.vpn.com:51820', 23, 0.0, 189.5, 15, true),
(gen_random_uuid(), 'EU-West-2', 'eu-west-2.vpn.com:51820', 28, 0.1, 176.3, 11, true),
(gen_random_uuid(), 'AP-1', 'ap-1.vpn.com:51820', 78, 0.3, 98.7, 6, true),
(gen_random_uuid(), 'AP-2', 'ap-2.vpn.com:51820', 71, 0.2, 112.4, 9, true);

-- Insert sample routing history
INSERT INTO routing_history (source_ip, destination_ip, destination_domain, traffic_type, bandwidth_used, latency_ms, success) VALUES
('192.168.1.101', '142.250.74.142', 'youtube.com', 'Video Streaming', 15728640, 45, true),
('192.168.1.102', '13.107.42.14', 'teams.microsoft.com', 'VoIP/Video Calls', 2097152, 23, true),
('192.168.1.103', '104.16.249.249', 'discord.com', 'Gaming', 524288, 28, true),
('192.168.1.104', '157.240.15.35', 'facebook.com', 'Social Media', 1048576, 52, true),
('192.168.1.105', '8.8.8.8', 'google.com', 'Web Browsing', 262144, 15, true);