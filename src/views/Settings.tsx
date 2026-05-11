import React from 'react';
import { Settings as SettingsIcon, Lock } from 'lucide-react';
import { PricingRulesSection } from '../components/settings/PricingRulesSection';
import { StaffManagementSection } from '../components/settings/StaffManagementSection';
import { FacilityConfigurationSection } from '../components/settings/FacilityConfigurationSection';

export const SettingsView: React.FC = () => {
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
        <PricingRulesSection />
        <StaffManagementSection />
        <FacilityConfigurationSection />
      </div>
    </div>
  );
};
