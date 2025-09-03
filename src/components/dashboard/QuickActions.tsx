import React from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import * as Icons from 'lucide-react';

export const QuickActions: React.FC = () => {
  return (
    <Card title="Hızlı İşlemler">
      <div className="space-y-3">
        <Button className="w-full justify-start">
          <Icons.Search className="w-4 h-4 mr-2" />
          Cihaz Tara
        </Button>
        <Button variant="outline" className="w-full justify-start">
          <Icons.Scan className="w-4 h-4 mr-2" />
          Ağ Keşfi
        </Button>
        <Button variant="outline" className="w-full justify-start">
          <Icons.BarChart3 className="w-4 h-4 mr-2" />
          Rapor
        </Button>
        <Button variant="outline" className="w-full justify-start">
          <Icons.UserX className="w-4 h-4 mr-2" />
          Engelle
        </Button>
      </div>
    </Card>
  );
};