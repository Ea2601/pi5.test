import React from 'react';
import * as Icons from 'lucide-react';

export const AppHeader: React.FC = () => {
  return (
    <div className="p-4 border-b border-white/10">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center flex-shrink-0">
          <Icons.Cpu className="w-4 h-4 text-emerald-400" />
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="text-white font-bold text-lg text-balance">Pi5 Süpernode</h1>
          <p className="text-white/60 text-xs">Ağ Konsolu</p>
        </div>
      </div>
    </div>
  );
};