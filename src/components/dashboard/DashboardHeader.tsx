import React from 'react';
import { Button } from '../ui/Button';
import * as Icons from 'lucide-react';

export const DashboardHeader: React.FC = () => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold text-white text-balance">Bağlı Cihazlar</h1>
        <p className="text-white/70 mt-1 text-balance">Ağ cihazları ve sistem kaynak izleme</p>
      </div>
      <div className="flex items-center gap-3">
        <Button variant="outline" size="sm">
          <Icons.RefreshCw className="w-4 h-4 mr-2" />
          Yenile
        </Button>
        <Button size="sm">
          <Icons.Search className="w-4 h-4 mr-2" />
          Cihaz Keşfi
        </Button>
      </div>
    </div>
  );
};