import React from 'react';
import { motion } from 'motion/react';
import { Search, Users, Phone, Mail, Star, Calendar, Edit3, Trash2, Crown, GraduationCap, UserCheck } from 'lucide-react';
import { useBookings } from '../contexts/BookingContext';
import { cn } from '../lib/utils';
import type { CustomerType } from '../types';

const sportColors: Record<string, string> = {
  Cricket: 'bg-green-500/10 text-green-400 border-green-500/20',
  Pickleball: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  Volleyball: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  Swimming: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  Basketball: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
};

const typeConfig: Record<CustomerType, { color: string; bg: string; border: string; icon: React.ReactNode }> = {
  Member: { color: 'text-yellow-400', bg: 'bg-yellow-400/10', border: 'border-yellow-400/20', icon: <Crown className="w-3 h-3" /> },
  Student: { color: 'text-cyan-400', bg: 'bg-cyan-400/10', border: 'border-cyan-400/20', icon: <GraduationCap className="w-3 h-3" /> },
  'Walk-in': { color: 'text-slate-400', bg: 'bg-slate-400/10', border: 'border-slate-400/20', icon: <UserCheck className="w-3 h-3" /> },
};

export const CustomersListView: React.FC = () => {
  const { customers, bookings, updateCustomer, deleteCustomer } = useBookings();
  const [searchTerm, setSearchTerm] = React.useState('');
  const [typeFilter, setTypeFilter] = React.useState<CustomerType | 'All'>('All');

  const filtered = customers.filter(c => {
    if (typeFilter !== 'All' && c.customerType !== typeFilter) return false;
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.phone.includes(q) ||
      c.email.toLowerCase().includes(q) ||
      c.preferredSport.toLowerCase().includes(q)
    );
  });

  const bookingCounts = React.useMemo(() => {
    const counts: Record<string, number> = {};
    bookings.forEach(b => {
      counts[b.customerId] = (counts[b.customerId] || 0) + 1;
    });
    return counts;
  }, [bookings]);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete customer "${name}"? This cannot be undone.`)) return;
    try {
      await deleteCustomer(id);
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  const typeFilters: (CustomerType | 'All')[] = ['All', 'Member', 'Student', 'Walk-in'];

  return (
    <div className="flex-1 overflow-y-auto p-8 no-scrollbar space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-on-surface tracking-tight">Customers</h2>
            <p className="text-xs text-on-surface-variant font-medium uppercase tracking-widest">
              {customers.length} registered customers
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Type filter pills */}
          <div className="flex gap-1 bg-surface-container-high rounded-xl p-1">
            {typeFilters.map(t => (
              <button key={t} onClick={() => setTypeFilter(t)}
                className={cn("px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all",
                  typeFilter === t ? "bg-primary text-on-primary" : "text-on-surface-variant hover:text-on-surface")}>
                {t}
              </button>
            ))}
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, phone, email..."
              className="bg-surface-container-low border border-border rounded-xl pl-10 pr-4 py-2 text-sm text-on-surface focus:border-primary focus:ring-0 transition-all w-72"
            />
          </div>
        </div>
      </div>

      {/* Customer Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((customer, i) => {
          const tc = typeConfig[customer.customerType || 'Walk-in'];
          return (
            <motion.div
              key={customer.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-surface-container rounded-xl p-5 border border-border hover:border-primary/20 transition-all group"
            >
              <div className="flex items-start gap-4">
                {/* Avatar */}
                <div className="w-12 h-12 rounded-full bg-surface-container-highest flex items-center justify-center shrink-0 text-primary font-bold text-lg ring-2 ring-primary/20">
                  {customer?.photoUrl ? <img src={customer?.photoUrl} alt="Captured" className="w-full h-full rounded-full object-cover" /> : customer.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-on-surface truncate">{customer.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-lg border', sportColors[customer.preferredSport] || 'text-on-surface-variant')}>
                      {customer.preferredSport}
                    </span>
                    <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-lg border flex items-center gap-1', tc.bg, tc.color, tc.border)}>
                      {tc.icon}{customer.customerType || 'Walk-in'}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  <button onClick={() => handleDelete(customer.id, customer.name)}
                    className="p-1.5 rounded-lg hover:bg-error/10 text-on-surface-variant hover:text-error transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                <div className="flex items-center gap-2 text-on-surface-variant text-xs">
                  <Phone className="w-3 h-3 shrink-0" />
                  <span className="truncate">{customer.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-on-surface-variant text-xs">
                  <Mail className="w-3 h-3 shrink-0" />
                  <span className="truncate">{customer.email}</span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
                <div className="flex items-center gap-1 text-[10px] text-on-surface-variant font-medium">
                  <Calendar className="w-3 h-3" />
                  <span>{bookingCounts[customer.id] || 0} bookings</span>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-primary font-bold">
                  <Star className="w-3 h-3" />
                  <span>Since {new Date(customer.createdAt).toLocaleDateString([], { month: 'short', year: 'numeric' })}</span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-on-surface-variant/30">
          <Users className="w-16 h-16 mb-4 opacity-10" />
          <p className="text-lg font-medium italic">No customers found.</p>
        </div>
      )}
    </div>
  );
};
