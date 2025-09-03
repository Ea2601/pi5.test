import React, { useState } from 'react';
import { Button } from '../ui/Button';

interface ClientFormData {
  name: string;
  server_id: string;
  allowed_ips: string;
}

interface ClientFormProps {
  onSubmit: (data: ClientFormData) => void;
  onCancel: () => void;
  servers: any[];
}

export const ClientForm: React.FC<ClientFormProps> = ({ onSubmit, onCancel, servers }) => {
  const [formData, setFormData] = useState<ClientFormData>({
    name: '',
    server_id: '',
    allowed_ips: '0.0.0.0/0'
  });

  const handleSubmit = () => {
    onSubmit(formData);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-white text-sm font-medium mb-2">İstemci Adı</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            placeholder="Mobil Cihaz"
          />
        </div>
        <div>
          <label className="block text-white text-sm font-medium mb-2">Sunucu</label>
          <select
            value={formData.server_id}
            onChange={(e) => setFormData({ ...formData, server_id: e.target.value })}
            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
          >
            <option value="">Sunucu seçin</option>
            {servers.map((server) => (
              <option key={server.id} value={server.id}>
                {server.name} ({server.interface_name})
              </option>
            ))}
          </select>
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