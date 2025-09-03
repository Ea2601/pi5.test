import React, { useState } from 'react';
import { Button } from '../ui/Button';

interface DeviceFormData {
  name: string;
  type: string;
  brand: string;
}

interface DeviceFormProps {
  onSubmit: (data: DeviceFormData) => void;
  onCancel: () => void;
  initialData?: Partial<DeviceFormData>;
}

export const DeviceForm: React.FC<DeviceFormProps> = ({ 
  onSubmit, 
  onCancel, 
  initialData = {} 
}) => {
  const [formData, setFormData] = useState<DeviceFormData>({
    name: initialData.name || '',
    type: initialData.type || 'PC',
    brand: initialData.brand || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-white text-sm font-medium mb-2">
          Cihaz Adı
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
          required
        />
      </div>
      
      <div className="flex gap-3">
        <Button type="submit" className="flex-1">
          Kaydet
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          İptal
        </Button>
      </div>
    </form>
  );
};