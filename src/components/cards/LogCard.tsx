import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Card } from '../ui/Card';
import { cn } from '../../lib/utils';

interface LogEntry {
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  source?: string;
}

interface LogCardProps {
  title: string;
  logs: LogEntry[];
  isDragging?: boolean;
  maxLines?: number;
}

export const LogCard: React.FC<LogCardProps> = ({
  title,
  logs = [], // Default to empty array
  isDragging,
  maxLines = 10
}) => {
  const logContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  const levelColors = {
    info: 'text-emerald-400',
    warn: 'text-yellow-400',
    error: 'text-red-400',
    debug: 'text-white/60'
  };

  // Ensure logs is valid array and slice safely
  const validLogs = Array.isArray(logs) ? logs : [];
  const displayLogs = validLogs.slice(-maxLines);

  return (
    <Card title={title} isDragging={isDragging} className="h-full">
      <div 
        ref={logContainerRef}
        className="h-48 overflow-y-auto space-y-1 bg-black/20 rounded-xl p-3 border border-white/5"
      >
        {displayLogs.length === 0 ? (
          <div className="flex items-center justify-center h-full text-white/50 text-sm">
            Henüz log bulunmuyor
          </div>
        ) : (
          displayLogs.map((log, index) => (
            <motion.div
              key={`${log.timestamp}-${index}`} // Stable key
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-start gap-2 text-xs font-mono"
            >
              <span className="text-white/50 flex-shrink-0">
                {new Date(log.timestamp).toLocaleTimeString()}
              </span>
              <span className={cn("flex-shrink-0 uppercase font-bold", levelColors[log.level] || 'text-white/60')}>
                {log.level}
              </span>
              <span className="text-white flex-1">{log.message || ''}</span>
            </motion.div>
          ))
        )}
      </div>
    </Card>
  );
};