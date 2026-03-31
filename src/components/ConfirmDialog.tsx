import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, X } from 'lucide-react';
import { cn } from '../lib/utils';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  type?: 'danger' | 'warning';
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onClose: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  type = 'danger',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onClose
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="bg-surface-container-high w-full max-w-sm rounded-2xl shadow-2xl relative flex flex-col overflow-hidden border border-border-strong"
        >
          <div className="p-6">
            <div className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center mb-5",
              type === 'danger' ? "bg-error/10 text-error" : "bg-tertiary/10 text-tertiary"
            )}>
              <AlertTriangle className="w-6 h-6" />
            </div>
            
            <h3 className="text-xl font-bold text-on-surface mb-2 tracking-tight">{title}</h3>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              {message}
            </p>
          </div>

          <div className="px-6 py-4 bg-surface-container flex items-center justify-end gap-3 border-t border-border">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-bold text-on-surface-variant hover:text-on-surface transition-colors"
            >
              {cancelText}
            </button>
            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className={cn(
                "px-5 py-2 rounded-xl text-sm font-bold text-on-primary transition-all shadow-lg hover:brightness-110",
                type === 'danger' ? "bg-error" : "bg-tertiary"
              )}
            >
              {confirmText}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
