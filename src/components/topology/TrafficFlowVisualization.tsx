import React from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import * as Icons from 'lucide-react';

export const TrafficFlowVisualization: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-white">Trafik Akışı</h3>
          <p className="text-white/70 text-sm">Ağ trafiği görselleştirmesi</p>
        </div>
        <Button>
          <Icons.Activity className="w-4 h-4 mr-2" />
          Canlı İzleme
        </Button>
      </div>

      <Card>
        <div className="h-96 bg-black/20 rounded-xl border border-white/10 flex items-center justify-center">
          <div className="text-center">
            <Icons.Activity className="w-16 h-16 text-white/30 mx-auto mb-4" />
            <h3 className="text-white font-semibold mb-2">Trafik Akışı Görselleştirmesi</h3>
            <p className="text-white/60">Ağ trafiği analizi burada görünecek</p>
          </div>
        </div>
      </Card>
    </div>
  );
};