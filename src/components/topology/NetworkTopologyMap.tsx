import React from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import * as Icons from 'lucide-react';

export const NetworkTopologyMap: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-white">Ağ Topolojisi</h3>
          <p className="text-white/70 text-sm">Ağ yapısı görselleştirmesi</p>
        </div>
        <Button>
          <Icons.Search className="w-4 h-4 mr-2" />
          Topoloji Tara
        </Button>
      </div>

      <Card>
        <div className="h-96 bg-black/20 rounded-xl border border-white/10 flex items-center justify-center">
          <div className="text-center">
            <Icons.Network className="w-16 h-16 text-white/30 mx-auto mb-4" />
            <h3 className="text-white font-semibold mb-2">Ağ Topoloji Haritası</h3>
            <p className="text-white/60">Ağ keşfi başlatılınca topoloji burada görünecek</p>
          </div>
        </div>
      </Card>
    </div>
  );
};