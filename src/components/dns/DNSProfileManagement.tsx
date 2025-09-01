import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { cn } from '../../lib/utils';
import { useDNSProfiles, useCreateDNSProfile, useUpdateDNSProfile } from '../../hooks/api/useDNS';
import { DNSProfile } from '../../types/dns';

interface ProfileFormData {
  name: string;
  description: string;
  profile_type: 'standard' | 'family' | 'business' | 'gaming';
  ad_blocking_enabled: boolean;
  malware_blocking_enabled: boolean;
  adult_content_blocking: boolean;
  social_media_blocking: boolean;
  gaming_blocking: boolean;
  safe_search_enabled: boolean;
  logging_enabled: boolean;
  whitelist_domains: string;
  blacklist_domains: string;
}

export const DNSProfileManagement: React.FC = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingProfile, setEditingProfile] = useState<DNSProfile | null>(null);
  
  const { data: profiles = [], isLoading } = useDNSProfiles();
  const createProfileMutation = useCreateDNSProfile();
  const updateProfileMutation = useUpdateDNSProfile();

  const [formData, setFormData] = useState<ProfileFormData>({
    name: '',
    description: '',
    profile_type: 'standard',
    ad_blocking_enabled: false,
    malware_blocking_enabled: false,
    adult_content_blocking: false,
    social_media_blocking: false,
    gaming_blocking: false,
    safe_search_enabled: false,
    logging_enabled: true,
    whitelist_domains: '',
    blacklist_domains: ''
  });

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      profile_type: 'standard',
      ad_blocking_enabled: false,
      malware_blocking_enabled: false,
      adult_content_blocking: false,
      social_media_blocking: false,
      gaming_blocking: false,
      safe_search_enabled: false,
      logging_enabled: true,
      whitelist_domains: '',
      blacklist_domains: ''
    });
  };

  const profileTypeLabels = {
    standard: { label: 'Standart', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
    family: { label: 'Aile', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
    business: { label: 'İş', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
    gaming: { label: 'Oyun', color: 'bg-orange-500/20 text-orange-400 border-orange-500/30' }
  };

  const ProfileCard: React.FC<{ profile: DNSProfile }> = ({ profile }) => {
    const typeConfig = profileTypeLabels[profile.profile_type];
    
    return (
      <Card className="h-full">
        <div className="space-y-4">
          {/* Profile Header */}
          <div className="flex items-start justify-between">
            <div>
              <h4 className="text-white font-semibold">{profile.name}</h4>
              <p className="text-white/60 text-sm">{profile.description}</p>
            </div>
            <span className={cn("px-2 py-1 rounded-full text-xs border", typeConfig.color)}>
              {typeConfig.label}
            </span>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-2 gap-2">
            {[
              { key: 'ad_blocking_enabled', label: 'Ad Block', icon: 'Shield' },
              { key: 'malware_blocking_enabled', label: 'Malware', icon: 'AlertTriangle' },
              { key: 'adult_content_blocking', label: 'Adult', icon: 'UserX' },
              { key: 'social_media_blocking', label: 'Social', icon: 'Users' },
              { key: 'gaming_blocking', label: 'Gaming', icon: 'Gamepad2' },
              { key: 'safe_search_enabled', label: 'Safe Search', icon: 'Search' }
            ].map(({ key, label, icon }) => {
              const isEnabled = profile[key as keyof DNSProfile] as boolean;
              return (
                <div key={key} className={cn(
                  "p-2 rounded-lg text-center",
                  isEnabled ? "bg-emerald-500/20 border border-emerald-500/30" : "bg-white/5 border border-white/10"
                )}>
                  <div className="w-4 h-4 mx-auto mb-1">
                    <svg xmlns="http://www.w3.org/2000/svg" 
                         width="24" height="24" viewBox="0 0 24 24" 
                         fill="none" stroke="currentColor" strokeWidth="2" 
                         strokeLinecap="round" strokeLinejoin="round" 
                         className={cn("w-4 h-4", isEnabled ? "text-emerald-400" : "text-white/40")}>
                      {icon === 'Shield' && <path d="M20 13c0 5-3.5 7.5-8 7.5s-8-2.5-8-7.5c0-1.3.3-2.5.8-3.5.5-1 1.2-1.9 2.2-2.6 1-0.7 2.2-1.2 3.5-1.5 1.3-0.3 2.7-0.3 4 0 1.3 0.3 2.5 0.8 3.5 1.5 1 0.7 1.7 1.6 2.2 2.6.5 1 .8 2.2.8 3.5z"/>}
                      {icon === 'AlertTriangle' && <><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></>}
                      {icon === 'UserX' && <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="17" x2="22" y1="8" y2="13"/><line x1="22" x2="17" y1="8" y2="13"/></>}
                    </svg>
                  </div>
                  <span className={cn("text-xs", isEnabled ? "text-white" : "text-white/60")}>{label}</span>
                </div>
              );
            })}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 pt-3 border-t border-white/10">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setEditingProfile(profile);
                setFormData({
                  name: profile.name,
                  description: profile.description || '',
                  profile_type: profile.profile_type,
                  ad_blocking_enabled: profile.ad_blocking_enabled,
                  malware_blocking_enabled: profile.malware_blocking_enabled,
                  adult_content_blocking: profile.adult_content_blocking,
                  social_media_blocking: profile.social_media_blocking,
                  gaming_blocking: profile.gaming_blocking,
                  safe_search_enabled: profile.safe_search_enabled,
                  logging_enabled: profile.logging_enabled,
                  whitelist_domains: profile.whitelist_domains.join(', '),
                  blacklist_domains: profile.blacklist_domains.join(', ')
                });
              }}
              className="flex-1"
            >
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" 
                     width="24" height="24" viewBox="0 0 24 24" 
                     fill="none" stroke="currentColor" strokeWidth="2" 
                     strokeLinecap="round" strokeLinejoin="round" 
                     className="w-3 h-3 mr-1">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4Z"/>
                </svg>
                <span className="truncate">Düzenle</span>
              </div>
            </Button>
            {!profile.is_default && (
              <Button
                size="sm"
                variant="destructive"
              >
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" 
                       width="24" height="24" viewBox="0 0 24 24" 
                       fill="none" stroke="currentColor" strokeWidth="2" 
                       strokeLinecap="round" strokeLinejoin="round" 
                       className="w-3 h-3">
                    <path d="M3 6h18"/>
                    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
                    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                    <line x1="10" x2="10" y1="11" y2="17"/>
                    <line x1="14" x2="14" y1="11" y2="17"/>
                  </svg>
                </div>
              </Button>
            )}
          </div>
        </div>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-white">DNS Güvenlik Profilleri</h3>
          <p className="text-white/70 text-sm">Filtreleme ve güvenlik ayarları</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" 
                 width="24" height="24" viewBox="0 0 24 24" 
                 fill="none" stroke="currentColor" strokeWidth="2" 
                 strokeLinecap="round" strokeLinejoin="round" 
                 className="w-4 h-4 mr-2">
              <path d="M5 12h14"/>
              <path d="M12 5v14"/>
            </svg>
            <span className="truncate">Yeni Profil</span>
          </div>
        </Button>
      </div>

      {/* Profiles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {profiles.map((profile) => (
          <ProfileCard key={profile.id} profile={profile} />
        ))}
      </div>

      {/* Create/Edit Profile Modal */}
      <Modal
        isOpen={showCreateModal || !!editingProfile}
        onClose={() => {
          setShowCreateModal(false);
          setEditingProfile(null);
          resetForm();
        }}
        title={editingProfile ? 'DNS Profili Düzenle' : 'Yeni DNS Profili'}
        size="lg"
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-white text-sm font-medium mb-2">Profil Adı</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                placeholder="Güvenlik Profili"
              />
            </div>
            <div>
              <label className="block text-white text-sm font-medium mb-2">Profil Türü</label>
              <select
                value={formData.profile_type}
                onChange={(e) => setFormData({ ...formData, profile_type: e.target.value as any })}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none"
              >
                <option value="standard" className="bg-gray-800">Standart</option>
                <option value="family" className="bg-gray-800">Aile Güvenli</option>
                <option value="business" className="bg-gray-800">İş Ağı</option>
                <option value="gaming" className="bg-gray-800">Oyun Optimize</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-white text-sm font-medium mb-2">Açıklama</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              rows={2}
              placeholder="Profil açıklaması"
            />
          </div>

          {/* Security Features */}
          <div>
            <h4 className="text-white font-medium mb-3">Güvenlik ve Filtreleme</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { key: 'ad_blocking_enabled', label: 'Reklam Engelleme', desc: 'Reklam sitelerini engelle' },
                { key: 'malware_blocking_enabled', label: 'Zararlı Yazılım Engelleme', desc: 'Bilinen zararlı siteleri engelle' },
                { key: 'adult_content_blocking', label: 'Yetişkin İçerik Engelleme', desc: '18+ içeriği filtrele' },
                { key: 'social_media_blocking', label: 'Sosyal Medya Engelleme', desc: 'Facebook, Twitter vb.' },
                { key: 'gaming_blocking', label: 'Oyun Siteleri Engelleme', desc: 'Online oyun platformları' },
                { key: 'safe_search_enabled', label: 'Güvenli Arama', desc: 'Arama motorlarında güvenli mod' }
              ].map(({ key, label, desc }) => (
                <div key={key} className="p-3 bg-white/5 rounded-lg border border-white/10">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-white text-sm font-medium">{label}</span>
                    <button
                      onClick={() => setFormData({ ...formData, [key]: !formData[key as keyof ProfileFormData] })}
                      className={cn(
                        "relative w-8 h-4 rounded-full transition-all duration-300",
                        formData[key as keyof ProfileFormData] 
                          ? "bg-emerald-500 shadow-lg shadow-emerald-500/30" 
                          : "bg-white/20"
                      )}
                    >
                      <div
                        className={cn(
                          "absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all duration-300 shadow-lg",
                          formData[key as keyof ProfileFormData] ? "left-4" : "left-0.5"
                        )}
                      />
                    </button>
                  </div>
                  <p className="text-white/60 text-xs">{desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Domain Lists */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-white text-sm font-medium mb-2">Whitelist Domain'ler</label>
              <textarea
                value={formData.whitelist_domains}
                onChange={(e) => setFormData({ ...formData, whitelist_domains: e.target.value })}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none"
                rows={3}
                placeholder="example.com, trusted-site.org"
              />
            </div>
            <div>
              <label className="block text-white text-sm font-medium mb-2">Blacklist Domain'ler</label>
              <textarea
                value={formData.blacklist_domains}
                onChange={(e) => setFormData({ ...formData, blacklist_domains: e.target.value })}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none"
                rows={3}
                placeholder="blocked-site.com, spam-domain.net"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-4">
            <Button
              onClick={async () => {
                const profileData = {
                  ...formData,
                  whitelist_domains: formData.whitelist_domains.split(',').map(d => d.trim()).filter(Boolean),
                  blacklist_domains: formData.blacklist_domains.split(',').map(d => d.trim()).filter(Boolean)
                };

                try {
                  if (editingProfile) {
                    await updateProfileMutation.mutateAsync({ id: editingProfile.id, updates: profileData });
                  } else {
                    await createProfileMutation.mutateAsync(profileData);
                  }
                  setShowCreateModal(false);
                  setEditingProfile(null);
                  resetForm();
                } catch (error) {
                  console.error('Profile operation error:', error);
                }
              }}
              disabled={createProfileMutation.isPending || updateProfileMutation.isPending}
              className="flex-1"
            >
              {editingProfile ? 'Güncelle' : 'Oluştur'}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setShowCreateModal(false);
                setEditingProfile(null);
                resetForm();
              }}
              className="flex-1"
            >
              İptal
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};