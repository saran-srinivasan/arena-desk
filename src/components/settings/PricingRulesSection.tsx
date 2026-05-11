import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { DollarSign, Plus, Trash2, Edit2, X } from 'lucide-react';
import { PricingRule, SportType } from '../../types';
import { pricingRuleApi } from '../../api/pricingRuleApi';

export const PricingRulesSection: React.FC = () => {
  const [rules, setRules] = useState<PricingRule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<PricingRule | null>(null);

  const fetchRules = async () => {
    setIsLoading(true);
    try {
      const data = await pricingRuleApi.getAll();
      setRules(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRules();
  }, []);

  const handleDelete = async (id: string) => {
    if (confirm('Delete this pricing rule?')) {
      await pricingRuleApi.delete(id);
      fetchRules();
    }
  };

  return (
    <motion.div className="bg-surface-container rounded-xl overflow-hidden border border-border">
      <div className="p-5 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-on-surface">Pricing Rules</h3>
            <p className="text-[10px] text-on-surface-variant">Configure hourly rates per sport</p>
          </div>
        </div>
        <button
          onClick={() => { setEditingRule(null); setIsModalOpen(true); }}
          className="text-primary text-xs font-bold hover:underline flex items-center gap-1"
        >
          <Plus className="w-4 h-4" /> Add
        </button>
      </div>
      <div className="divide-y divide-border">
        {isLoading ? (
          <div className="p-5 text-sm text-on-surface-variant">Loading...</div>
        ) : rules.length === 0 ? (
          <div className="p-5 text-sm text-on-surface-variant">No pricing rules found.</div>
        ) : (
          rules.map(rule => (
            <div key={rule.id} className="px-5 py-3 flex items-center justify-between hover:bg-surface-container-high/30 transition-colors">
              <span className="text-sm text-on-surface font-medium">{rule.sport}</span>
              <div className="flex items-center gap-4">
                <span className="text-sm text-on-surface-variant">₹{rule.hourlyRate}/hr</span>
                <div className="flex items-center gap-2">
                  <button onClick={() => { setEditingRule(rule); setIsModalOpen(true); }} className="text-primary hover:text-primary/80">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(rule.id)} className="text-error hover:text-error/80">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <PricingRuleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        ruleToEdit={editingRule}
        onSaved={fetchRules}
      />
    </motion.div>
  );
};

const PricingRuleModal: React.FC<{ isOpen: boolean; onClose: () => void; ruleToEdit: PricingRule | null; onSaved: () => void; }> = ({ isOpen, onClose, ruleToEdit, onSaved }) => {
  const [sport, setSport] = useState<SportType>('Cricket');
  const [price, setPrice] = useState('500');

  useEffect(() => {
    if (isOpen) {
      if (ruleToEdit) {
        setSport(ruleToEdit.sport);
        setPrice((ruleToEdit.hourlyRate).toString());
      } else {
        setSport('Cricket');
        setPrice('500');
      }
    }
  }, [isOpen, ruleToEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const dto = { sport, hourlyRate: Math.round(parseFloat(price)) };
    try {
      if (ruleToEdit) {
        await pricingRuleApi.update(ruleToEdit.id, dto);
      } else {
        await pricingRuleApi.create(dto);
      }
      onSaved();
      onClose();
    } catch (e) {
      console.error(e);
      alert('Failed to save. Make sure the sport is unique.');
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
        <div className="bg-surface-container w-full max-w-sm rounded-2xl relative flex flex-col overflow-hidden border border-border-strong">
          <div className="px-6 py-4 border-b border-border flex items-center justify-between">
            <h2 className="text-lg font-bold">{ruleToEdit ? 'Edit Pricing Rule' : 'New Pricing Rule'}</h2>
            <button onClick={onClose}><X className="w-5 h-5" /></button>
          </div>
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-on-surface-variant">Sport</label>
              <select value={sport} onChange={e => setSport(e.target.value as SportType)} className="w-full bg-surface-container-lowest border border-border px-4 py-3 rounded-xl" required disabled={!!ruleToEdit}>
                {['Cricket', 'Pickleball', 'Volleyball', 'Basketball', 'Swimming'].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-on-surface-variant">Hourly Rate (₹)</label>
              <input type="number" step="0.01" value={price} onChange={e => setPrice(e.target.value)} className="w-full bg-surface-container-lowest border border-border px-4 py-3 rounded-xl" required />
            </div>
            <button type="submit" className="w-full bg-primary text-on-primary py-3 rounded-xl font-bold">Save</button>
          </form>
        </div>
      </div>
    </AnimatePresence>
  );
};
