import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import * as Icons from 'lucide-react';
import { cn } from '../../lib/utils';

interface DNSProfile {
  id: string;
  name: string;
  profile_type: 'standard' | 'family' | 'business' | 'gaming';
  ad_blocking_enabled: boolean;
  malware_blocking_enabled: boolean;
  adult_content_blocking: boolean;
  is_default: boolean;
}

interface ProfileFormData {
  name: string;
  profile_type: 'standard' | 'family' | 'business' | 'gaming';
  ad_blocking_enabled: boolean;
  malware_blocking_enabled: boolean;
  adult_content_blocking: boolean;
}

export const DNSProfileManagement: React.FC = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  // Mock data
  const [profiles] = useState<DNSProfile[]>([
    {
      id: 'profile-1',
      name: 'Standart Profil',
      profile_type: 'standard',
      ad_blocking_enabled: true,
      malware_blocking_enabled: true,
      adult_content_blocking: false,
      is_default: true
    },
    {
      id: 'profile-2',
      name: 'Aile Güvenli',
      profile_type: 'family',
      ad_blocking_enabled: true,
      malware_blocking_enabled: true,
      adult_content_blocking: true,
      is_default: false
    }
  ]);

  const [formData, setFormData] = useState<ProfileFormData>({
    name: '',
    profile_type: 'standard',
    ad_blocking_enabled: false,
    malware_blocking_enabled: false,
    adult_content_blocking: false
  });

  const resetForm = () => {
    setFormData({
      name: '',
      profile_type: 'standard',
      ad_blocking_enabled: false,
      malware_blocking_enabled: false,
      adult_content_blocking: false
    });
  };

  const handleCreateProfile = async () => {
    try {
      console.log('Creating DNS profile:', formData);
      setShowCreateModal(false);
      resetForm();
    } catch (error) {
      console.error('Create DNS profile error:', error);
    }
  };

  const getProfileTypeColor = (type: string) => {
    switch (type) {
      case 'standard': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'family': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'business': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'gaming': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const ProfileCard: React.FC<{ profile: DNSProfile }> = ({ profile }) => {
    return (
      <Card className="h-full">
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h4 className="text-white font-semibold">{profile.name}</h4>
              <span className={cn("px-2 py-1 rounded-full text-xs border", getProfileTypeColor(profile.profile_type))}>
                {profile.profile_type}
              </span>
            </div>
            {profile.is_default && (
              <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-xs border border-emerald-500/30">
                Varsayılan
              </span>
            )}
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className={cn(
              "p-2 rounded text-center text-xs",
              profile.ad_blocking_enabled ? "bg-emerald-500/20 text-emerald-400" : "bg-white/5 text-white/60"
            )}>
              <Icons.Shield className="w-3 h-3 mx-auto mb-1" />
              Ad Block
            </div>
            <div className={cn(
              "p-2 rounded text-center text-xs",
              profile.malware_blocking_enabled ? "bg-red-500/20 text-red-400" : "bg-white/5 text-white/60"
            )}>
              <Icons.AlertTriangle className="w-3 h-3 mx-auto mb-1" />
              Malware
            </div>
            <div className={cn(
              "p-2 rounded text-center text-xs",
              profile.adult_content_blocking ? "bg-orange-500/20 text-orange-400" : "bg-white/5 text-white/60"
            )}>
              <Icons.UserX className="w-3 h-3 mx-auto mb-1" />
              Adult
            </div>
          </div>

          <div className="flex items-center gap-2 pt-3 border-t border-white/10">
            <Button size="sm" variant="outline" className="flex-1">
              <Icons.Edit className="w-3 h-3 mr-1" />
              Düzenle
            </Button>
            {!profile.is_default && (
              <Button size="sm" variant="destructive">
                <Icons.Trash2 className="w-3 h-3" />
              </Button>
            )}
          </div>
        </div>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-white">DNS Profilleri</h3>
          <p className="text-white/70 text-sm">DNS güvenlik ve filtreleme profilleri</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Icons.Plus className="w-4 h-4 mr-2" />
          Yeni Profil
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {profiles.map((profile) => (
          <ProfileCard key={profile.id} profile={profile} />
        ))}
      </div>

      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          resetForm();
        }}
        title="Yeni DNS Profili"
      >
        <div className="space-y-4">
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
              <option value="family" className="bg-gray-800">Aile</option>
              <option value="business" className="bg-gray-800">İş</option>
              <option value="gaming" className="bg-gray-800">Oyun</option>
            </select>
          </div>

          <div className="space-y-3">
            <h4 className="text-white font-medium">Filtreleme Seçenekleri</h4>
            <div className="space-y-2">
              {[
                { key: 'ad_blocking_enabled', label: 'Reklam Engelleme' },
                { key: 'malware_blocking_enabled', label: 'Zararlı Yazılım Engelleme' },
                { key: 'adult_content_blocking', label: 'Yetişkin İçerik Engelleme' }
              ].map(({ key, label }) => (
                <div key={key} className="flex items-center gap-3">
                  <button
                    onClick={() => setFormData({ ...formData, [key]: !formData[key as keyof ProfileFormData] })}
                    className={cn(
                      "relative w-10 h-5 rounded-full transition-all duration-300",
                      formData[key as keyof ProfileFormData] 
                        ? "bg-emerald-500 shadow-lg shadow-emerald-500/30" 
                        : "bg-white/20"
                    )}
                  >
                    <div
                      className={cn(
                        "absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all duration-300 shadow-lg",
                        formData[key as keyof ProfileFormData] ? "left-5" : "left-0.5"
                      )}
                    />
                  </button>
                  <span className="text-white text-sm">{label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3 pt-4">
            <Button onClick={handleCreateProfile} className="flex-1">
              Oluştur
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setShowCreateModal(false);
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