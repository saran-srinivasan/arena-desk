import React from 'react';
import { motion } from 'motion/react';
import { Settings as SettingsIcon, DollarSign, Users, Building2, Lock, ChevronRight } from 'lucide-react';

export const SettingsView: React.FC = () => {
  const sections = [
    {
      title: 'Pricing Rules',
      description: 'Configure hourly rates per sport and resource',
      icon: DollarSign,
      items: ['Cricket — ₹500/hr', 'Pickleball — ₹300/hr', 'Volleyball — ₹450/hr', 'Swimming — ₹350/hr', 'Basketball — ₹400/hr'],
    },
    {
      title: 'Staff Management',
      description: 'Manage staff accounts and permissions',
      icon: Users,
      items: ['Alex Rivera — Super Admin', 'Jordan Lee — Admin', 'Sam Patel — Admin'],
    },
    {
      title: 'Facility Configuration',
      description: 'Configure courts, turfs, and resource groups',
      icon: Building2,
      items: ['Turf A — Full Pitch', 'Turf B — Half Pitch', 'Court 1 — Multi-Sport (Shared)', 'Court 2 — Multi-Sport', 'Pool — Lane 1-4'],
    },
  ];

  return (
    <div className="flex-1 overflow-y-auto p-8 no-scrollbar space-y-8">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
          <SettingsIcon className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-on-surface tracking-tight">Settings</h2>
          <p className="text-xs text-on-surface-variant font-medium uppercase tracking-widest flex items-center gap-1">
            <Lock className="w-3 h-3" /> Super Admin Access
          </p>
        </div>
      </div>

      <div className="max-w-3xl space-y-6">
        {sections.map((section, i) => (
          <motion.div
            key={section.title}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-surface-container rounded-xl overflow-hidden border border-border"
          >
            <div className="p-5 border-b border-border flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <section.icon className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-on-surface">{section.title}</h3>
                <p className="text-[10px] text-on-surface-variant">{section.description}</p>
              </div>
              <button className="text-primary text-xs font-bold hover:underline">Edit</button>
            </div>
            <div className="divide-y divide-border">
              {section.items.map((item) => (
                <div key={item} className="px-5 py-3 flex items-center justify-between hover:bg-surface-container-high/30 transition-colors">
                  <span className="text-sm text-on-surface">{item}</span>
                  <ChevronRight className="w-4 h-4 text-on-surface-variant/30" />
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
