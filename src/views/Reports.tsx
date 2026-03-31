import React from 'react';
import { motion } from 'motion/react';
import { BarChart3, TrendingUp, DollarSign, Activity, Lock } from 'lucide-react';
import { useBookings } from '../contexts/BookingContext';

export const ReportsView: React.FC = () => {
  const { bookings } = useBookings();

  const totalRevenue = bookings
    .filter(b => b.status !== 'Cancelled')
    .reduce((sum, b) => sum + (b.priceCents || 0), 0);

  const completedCount = bookings.filter(b => b.status === 'Completed').length;
  const activeCount = bookings.filter(b => b.status === 'Active').length;

  const cards = [
    { label: 'Total Revenue', value: `$${(totalRevenue / 100).toLocaleString()}`, icon: DollarSign, color: 'primary' },
    { label: 'Completed Sessions', value: completedCount.toString(), icon: TrendingUp, color: 'primary' },
    { label: 'Active Sessions', value: activeCount.toString(), icon: Activity, color: 'tertiary' },
    { label: 'Avg. Booking Value', value: bookings.length > 0 ? `$${((totalRevenue / 100) / bookings.filter(b => b.status !== 'Cancelled').length).toFixed(2)}` : '$0', icon: BarChart3, color: 'secondary' },
  ];

  return (
    <div className="flex-1 overflow-y-auto p-8 no-scrollbar space-y-8">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
          <BarChart3 className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-on-surface tracking-tight">Reports & Analytics</h2>
          <p className="text-xs text-on-surface-variant font-medium uppercase tracking-widest flex items-center gap-1">
            <Lock className="w-3 h-3" /> Super Admin Access
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((kpi, i) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-surface-container rounded-xl p-5 border-l-4 border-primary"
          >
            <p className="text-on-surface-variant text-[10px] font-bold uppercase tracking-widest mb-2">{kpi.label}</p>
            <h3 className="text-3xl font-black text-on-surface tracking-tighter">{kpi.value}</h3>
          </motion.div>
        ))}
      </div>

      {/* Placeholder Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-surface-container rounded-xl p-6 border border-border">
          <h4 className="text-xs font-bold text-heading uppercase tracking-tight mb-4">Revenue Over Time</h4>
          <div className="h-48 flex items-center justify-center text-on-surface-variant/30 italic">
            <div className="text-center">
              <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-20" />
              <p>Chart visualization coming soon</p>
            </div>
          </div>
        </div>
        <div className="bg-surface-container rounded-xl p-6 border border-border">
          <h4 className="text-xs font-bold text-heading uppercase tracking-tight mb-4">Sport Utilization Breakdown</h4>
          <div className="h-48 flex items-center justify-center text-on-surface-variant/30 italic">
            <div className="text-center">
              <Activity className="w-12 h-12 mx-auto mb-2 opacity-20" />
              <p>Chart visualization coming soon</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
