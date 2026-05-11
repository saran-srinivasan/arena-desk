import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, CheckCircle2 } from 'lucide-react';
import { ActiveSession, PricingRule } from '../types';
import { pricingRuleApi } from '../api/pricingRuleApi';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: ActiveSession | null;
  onConfirm: (bookingId: string, finalPrice: number) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose, session, onConfirm }) => {
  const [pricingRules, setPricingRules] = useState<PricingRule[]>([]);
  const [leewayMinutes, setLeewayMinutes] = useState<number>(0);
  const [manualPrice, setManualPrice] = useState<number | ''>('');

  useEffect(() => {
    if (isOpen) {
      pricingRuleApi.getAll().then(setPricingRules).catch(console.error);
      setLeewayMinutes(0);
      setManualPrice('');
    }
  }, [isOpen]);

  if (!isOpen || !session) return null;

  const rule = pricingRules.find(r => r.sport === session.sport);
  const hourlyRate = rule ? rule.hourlyRate : 0;

  const startT = new Date(session.startTime).getTime();
  const now = Date.now();
  let totalMinutes = Math.floor((now - startT) / (1000 * 60));
  if (totalMinutes < 0) totalMinutes = 0;

  const billedMinutes = Math.max(0, totalMinutes - leewayMinutes);
  const calculatedPrice = (billedMinutes / 60) * hourlyRate;
  const finalPrice = manualPrice !== '' ? Number(manualPrice) : Math.round(calculatedPrice);

  const formatDuration = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h}h ${m}m`;
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-surface-container w-full max-w-md rounded-2xl shadow-2xl relative flex flex-col overflow-hidden border border-border-strong"
        >
          <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-surface-container-low">
            <h2 className="text-lg font-bold text-on-surface flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-primary" />
              Checkout Session
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-surface-container-high rounded-full text-on-surface-variant transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            <div className="bg-surface-container-low p-4 rounded-xl border border-border">
              <h3 className="font-bold text-on-surface mb-2">{session.customerName} - {session.sport}</h3>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-on-surface-variant">Time Spent</span>
                <span className="font-medium text-on-surface">{formatDuration(totalMinutes)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-on-surface-variant">Hourly Rate</span>
                <span className="font-medium text-on-surface">₹{hourlyRate}/hr</span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant px-1">Leeway (Minutes)</label>
                <input
                  type="number"
                  min="0"
                  value={leewayMinutes}
                  onChange={(e) => setLeewayMinutes(parseInt(e.target.value) || 0)}
                  className="w-full bg-surface-container-lowest border border-border focus:border-primary focus:ring-1 focus:ring-primary text-on-surface px-4 py-2 rounded-xl transition-all"
                  placeholder="e.g., 5 to forgive 5 minutes"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant px-1 flex justify-between">
                  <span>Manual Price Override (₹)</span>
                  <span className="text-primary font-medium">Calc: ₹{Math.round(calculatedPrice)}</span>
                </label>
                <input
                  type="number"
                  min="0"
                  value={manualPrice}
                  onChange={(e) => setManualPrice(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full bg-surface-container-lowest border border-border focus:border-primary focus:ring-1 focus:ring-primary text-on-surface px-4 py-2 rounded-xl transition-all"
                  placeholder={`Leave empty to use ₹${Math.round(calculatedPrice)}`}
                />
              </div>
            </div>

            <div className="pt-4 border-t border-border flex justify-between items-end">
              <div>
                <p className="text-xs text-on-surface-variant uppercase font-bold tracking-widest">Total to Collect</p>
                <p className="text-3xl font-black text-on-surface">₹{finalPrice}</p>
              </div>
            </div>
          </div>

          <div className="px-6 py-4 bg-surface-container-low border-t border-border flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl font-bold text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest transition-all"
            >
              Cancel
            </button>
            <button
              onClick={() => onConfirm(session.bookingId, finalPrice)}
              className="px-6 py-2.5 rounded-xl font-bold bg-primary text-on-primary hover:brightness-110 transition-all shadow-lg"
            >
              Confirm & Checkout
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
