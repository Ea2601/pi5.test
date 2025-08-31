import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as Icons from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { cn } from '../../lib/utils';
import { DraftChange } from '../../types/traffic';

interface DraftManagerProps {
  draftChanges: DraftChange[];
  onApplyChanges: () => void;
  onClearDrafts: () => void;
  isApplying: boolean;
}

export const DraftManager: React.FC<DraftManagerProps> = ({
  draftChanges,
  onApplyChanges,
  onClearDrafts,
  isApplying
}) => {
  if (draftChanges.length === 0) {
    return null;
  }

  const getChangeIcon = (type: string, action: string) => {
    if (action === 'create') return Icons.Plus;
    if (action === 'update') return Icons.Edit;
    if (action === 'delete') return Icons.Trash2;
    return Icons.GitBranch;
  };

  const getChangeColor = (action: string) => {
    switch (action) {
      case 'create': return 'text-emerald-400';
      case 'update': return 'text-blue-400';
      case 'delete': return 'text-red-400';
      default: return 'text-white/60';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6"
    >
      <Card title="Taslak Değişiklikler" className="border-orange-500/30 bg-orange-500/5">
        <div className="space-y-4">
          {/* Changes Summary */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Icons.GitBranch className="w-5 h-5 text-orange-400" />
              <span className="text-white font-medium">
                {draftChanges.length} değişiklik bekliyor
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={onClearDrafts}
                disabled={isApplying}
              >
                <Icons.X className="w-4 h-4 mr-1" />
                Temizle
              </Button>
              <Button
                size="sm"
                onClick={onApplyChanges}
                isLoading={isApplying}
                disabled={isApplying}
              >
                <Icons.Check className="w-4 h-4 mr-1" />
                Uygula
              </Button>
            </div>
          </div>

          {/* Changes List */}
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {draftChanges.map((change) => {
              const ChangeIcon = getChangeIcon(change.type, change.action);
              return (
                <div key={change.id} className="flex items-center gap-3 p-2 bg-white/5 rounded-lg">
                  <ChangeIcon className={cn("w-4 h-4", getChangeColor(change.action))} />
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm truncate">
                      {change.action === 'create' && 'Yeni '}
                      {change.action === 'update' && 'Güncelle '}
                      {change.action === 'delete' && 'Sil '}
                      {change.type === 'policy' && 'politika'}
                      {change.type === 'device' && 'cihaz'}
                      {change.type === 'reservation' && 'rezervasyon'}
                      : {change.target}
                    </p>
                  </div>
                  <span className="text-white/50 text-xs">
                    {new Date(change.timestamp).toLocaleTimeString('tr-TR')}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </Card>
    </motion.div>
  );
};