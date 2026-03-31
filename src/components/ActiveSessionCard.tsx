import React from 'react';
import { motion } from 'motion/react';
import { Phone, Clock, LogOut, ExternalLink } from 'lucide-react';
import { ActiveSession } from '../types';
import { cn } from '../lib/utils';

interface SessionCardProps {
  session: ActiveSession;
  onExtend: (bookingId: string) => void;
  onCheckOut: (bookingId: string) => void;
}

export const ActiveSessionCard: React.FC<SessionCardProps> = ({ session, onExtend, onCheckOut }) => {
  const isCritical = session.severity === 'red' || session.severity === 'amber';
  const isOverstay = session.isOverstay;

  const formatTime = (seconds: number) => {
    const absSec = Math.abs(seconds);
    const mins = Math.floor(absSec / 60);
    const secs = absSec % 60;
    return `${seconds < 0 ? '+' : ''}${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startDate = new Date(session.startTime);
  const endDate = new Date(session.endTime);
  const timeStr = `${startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })} – ${endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}`;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "group bg-surface-container hover:bg-surface-container-high transition-all p-5 rounded-xl flex items-center gap-6 relative overflow-hidden border border-transparent",
        isOverstay ? "bg-surface-container-highest border-error/20 shadow-lg" : "hover:border-border"
      )}
    >
      {/* Status Ribbon */}
      <div className={cn(
        "absolute left-0 top-0 bottom-0 w-1",
        isOverstay ? "bg-error" : session.severity === 'red' ? "bg-error" : session.severity === 'amber' ? "bg-tertiary" : "bg-primary"
      )} />

      <div className={cn(
        "w-14 h-14 rounded-full flex items-center justify-center shrink-0",
        isOverstay ? "bg-error/20 text-error" : isCritical ? "bg-tertiary/20 text-tertiary" : "bg-primary/20 text-primary"
      )}>
        <span className="text-2xl font-bold">{session.sport[0]}</span>
      </div>

      {/* Customer Info */}
      <div className="flex-1 min-w-[200px]">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="text-heading font-bold text-lg leading-tight">{session.customerName}</h3>
          <span className="bg-surface-container-highest text-primary px-2 py-0.5 rounded text-[10px] font-bold tracking-tight border border-primary/20">
            {session.bookingId}
          </span>
        </div>
        <div className="mt-2 flex items-center gap-3">
          <span className="bg-surface-container-highest text-on-surface px-2 py-0.5 rounded text-xs font-semibold">
            {session.resourceName}
          </span>
          <span className="text-on-surface-variant text-xs flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {timeStr}
          </span>
        </div>
      </div>

      {/* Timer */}
      <div className="flex-1 text-center">
        {isOverstay && (
          <div className="bg-error text-on-primary px-3 py-0.5 rounded-full text-[10px] font-black inline-block mb-1 tracking-widest uppercase shadow-sm">
            OVERSTAY
          </div>
        )}
        {!isOverstay && <p className="text-[10px] text-on-surface-variant mb-1 uppercase font-bold tracking-wider">Time Remaining</p>}
        <div className={cn(
          "font-mono text-3xl font-bold tracking-tighter",
          isOverstay ? "text-error" : session.severity === 'red' ? "text-error" : session.severity === 'amber' ? "text-tertiary" : "text-primary"
        )}>
          {formatTime(session.remainingSeconds)}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => onExtend(session.bookingId)}
          className="px-4 py-2 rounded-xl border border-primary/40 text-primary text-sm font-semibold hover:bg-primary hover:text-on-primary transition-all active:scale-95"
        >
          Extend
        </button>
        <button
          onClick={() => onCheckOut(session.bookingId)}
          className={cn(
            "px-5 py-2 rounded-xl text-sm font-bold transition-all active:scale-95 flex items-center gap-2 shadow-sm",
            isOverstay
              ? "bg-error text-on-primary hover:brightness-110"
              : "bg-surface-container-highest text-error hover:bg-error hover:text-on-primary border border-error/30"
          )}
        >
          <LogOut className="w-4 h-4" />
          Check Out
        </button>
      </div>
    </motion.div>
  );
};
