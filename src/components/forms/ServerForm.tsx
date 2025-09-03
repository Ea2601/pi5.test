import React, { useState } from 'react';
import { Button } from '../ui/Button';

interface ServerFormData {
  name: string;
  interface_name: string;
  listen_port: number;
  network_cidr: string;
  endpoint: string;
}

interface ServerFormProps {
  onSubmit: (data: ServerFormData) => void;
  onCancel: () => void;
}

export const ServerForm: React.FC<ServerFormProps> = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState<ServerFormData>({
    name: '',
    interface_name: 'wg0',
    listen_port: 51820,
    network_cidr: '10.0.0.0/24',
    endpoint: ''
  });

  const handleSubmit = () => {
    onSubmit(formData);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-white text-sm font-medium mb-2">Sunucu Adı</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            placeholder="VPN Sunucusu"
          />
        </div>
        <div>
          <label className="block text-white text-sm font-medium mb-2">Arayüz Adı</label>
          <input
            type="text"
            value={formData.interface_name}
            onChange={(e) => setFormData({ ...formData, interface_name: e.target.value })}
            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            placeholder="wg0"
          />
        </div>
      </div>

      <div className="flex items-center gap-3 pt-4">
        <Button onClick={handleSubmit} className="flex-1">
          Oluştur
        </Button>
        <Button variant="outline" onClick={onCancel} className="flex-1">
          İptal
        </Button>
      </div>
    </div>
  );
};