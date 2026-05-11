import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  CreditCard, Crown, Plus, Search, Edit3, X, Check, Users,
  Calendar, Star, Shield, Zap, ChevronDown, Ban
} from 'lucide-react';
import { cn } from '../lib/utils';
import { membershipPlanApi } from '../api/membershipPlanApi';
import { membershipApi } from '../api/membershipApi';
import { paymentApi } from '../api/paymentApi';
import { customerApi } from '../api/customerApi';
import type { MembershipPlan, Membership, Customer, Payment } from '../types';

const tc = { color: 'text-primary', bg: 'bg-primary/10', border: 'border-primary/20', icon: <Star className="w-5 h-5" /> };

const paymentStatusColors: Record<string, string> = {
  Paid: 'bg-green-500/10 text-green-400 border-green-500/20',
  Pending: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  Overdue: 'bg-red-500/10 text-red-400 border-red-500/20',
};

const membershipStatusColors: Record<string, string> = {
  Active: 'bg-green-500/10 text-green-400 border-green-500/20',
  Expired: 'bg-red-500/10 text-red-400 border-red-500/20',
  Cancelled: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
  Frozen: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
};

type TabType = 'plans' | 'members';

export const MembershipsView: React.FC = () => {
  const [tab, setTab] = React.useState<TabType>('plans');
  const [plans, setPlans] = React.useState<MembershipPlan[]>([]);
  const [memberships, setMemberships] = React.useState<Membership[]>([]);
  const [customers, setCustomers] = React.useState<Customer[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchTerm, setSearchTerm] = React.useState('');

  // Modals
  const [showPlanModal, setShowPlanModal] = React.useState(false);
  const [editingPlan, setEditingPlan] = React.useState<MembershipPlan | null>(null);
  const [showMemberModal, setShowMemberModal] = React.useState(false);

  // Plan form state
  const [planForm, setPlanForm] = React.useState({
    name: '', durationMonths: 1, price: 0,
    sportsAccess: ['All'], description: '',
  });

  // Member form state
  const [memberForm, setMemberForm] = React.useState({
    customerId: '', planId: '', startDate: new Date().toISOString().slice(0, 10), autoRenew: false, notes: '',
  });

  React.useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [p, m, c] = await Promise.all([
        membershipPlanApi.getAll(),
        membershipApi.getAll(),
        customerApi.getAll(),
      ]);
      setPlans(p);
      setMemberships(m);
      setCustomers(c);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const openCreatePlan = () => {
    setEditingPlan(null);
    setPlanForm({ name: '', durationMonths: 1, price: 0, sportsAccess: ['All'], description: '' });
    setShowPlanModal(true);
  };

  const openEditPlan = (plan: MembershipPlan) => {
    setEditingPlan(plan);
    setPlanForm({
      name: plan.name, durationMonths: plan.durationMonths,
      price: plan.price, sportsAccess: plan.sportsAccess, description: plan.description || '',
    });
    setShowPlanModal(true);
  };

  const savePlan = async () => {
    try {
      if (editingPlan) {
        await membershipPlanApi.update(editingPlan.id, planForm);
      } else {
        await membershipPlanApi.create(planForm);
      }
      setShowPlanModal(false);
      loadData();
    } catch (err) { console.error(err); }
  };

  const deactivatePlan = async (id: string) => {
    try {
      await membershipPlanApi.deactivate(id);
      loadData();
    } catch (err) { console.error(err); }
  };

  const assignMembership = async () => {
    try {
      await membershipApi.create(memberForm);
      setShowMemberModal(false);
      loadData();
    } catch (err) { console.error(err); }
  };

  const cancelMembership = async (id: string) => {
    try {
      await membershipApi.cancel(id);
      loadData();
    } catch (err) { console.error(err); }
  };

  const filteredMemberships = memberships.filter(m => {
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return (m.customerName?.toLowerCase().includes(q) || m.planName?.toLowerCase().includes(q));
  });

  const tabs: { id: TabType; label: string; count: number }[] = [
    { id: 'plans', label: 'Plans', count: plans.length },
    { id: 'members', label: 'Members', count: memberships.filter(m => m.status === 'Active').length },
  ];

  return (
    <div className="flex-1 overflow-y-auto p-8 no-scrollbar space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <CreditCard className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-on-surface tracking-tight">Memberships</h2>
            <p className="text-xs text-on-surface-variant font-medium uppercase tracking-widest">
              {plans.length} plans · {memberships.filter(m => m.status === 'Active').length} active members
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {tab === 'members' && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
              <input
                value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search members..."
                className="bg-surface-container-low border border-border rounded-xl pl-10 pr-4 py-2 text-sm text-on-surface focus:border-primary focus:ring-0 transition-all w-60"
              />
            </div>
          )}
          <button
            onClick={tab === 'plans' ? openCreatePlan : () => setShowMemberModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary text-on-primary rounded-xl text-sm font-bold hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-primary/20"
          >
            <Plus className="w-4 h-4" />
            {tab === 'plans' ? 'New Plan' : 'Assign Membership'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-surface-container-high rounded-xl p-1">
        {tabs.map((t) => (
          <button
            key={t.id} onClick={() => setTab(t.id)}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all",
              tab === t.id ? "bg-primary text-on-primary shadow" : "text-on-surface-variant hover:text-on-surface"
            )}
          >
            {t.label}
            <span className={cn("text-[10px] px-1.5 py-0.5 rounded-full", tab === t.id ? "bg-on-primary/20" : "bg-surface-container-highest")}>{t.count}</span>
          </button>
        ))}
      </div>

      {/* Plans Tab */}
      {tab === 'plans' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {plans.map((plan, i) => {
            return (
              <motion.div
                key={plan.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className={cn("bg-surface-container rounded-xl p-6 border transition-all relative group", tc.border, !plan.isActive && "opacity-50")}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", tc.bg, tc.color)}>
                    {tc.icon}
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openEditPlan(plan)} className="p-1.5 rounded-lg hover:bg-surface-container-high text-on-surface-variant"><Edit3 className="w-3.5 h-3.5" /></button>
                    {plan.isActive && <button onClick={() => deactivatePlan(plan.id)} className="p-1.5 rounded-lg hover:bg-error/10 text-error"><Ban className="w-3.5 h-3.5" /></button>}
                  </div>
                </div>
                <h3 className="text-base font-bold text-on-surface">{plan.name}</h3>
                {plan.description && <p className="text-xs text-on-surface-variant mt-2 line-clamp-2">{plan.description}</p>}

                <div className="mt-4 pt-4 border-t border-border space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-on-surface-variant">Price</span>
                    <span className="font-bold text-on-surface">₹{(plan.price).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-on-surface-variant">Duration</span>
                    <span className="font-bold text-on-surface">{plan.durationMonths} month{plan.durationMonths > 1 ? 's' : ''}</span>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {plan.sportsAccess.map(s => (
                      <span key={s} className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-primary/10 text-primary">{s}</span>
                    ))}
                  </div>
                </div>
                {!plan.isActive && (
                  <div className="absolute top-3 right-3 text-[9px] font-black text-error bg-error/10 px-2 py-0.5 rounded">INACTIVE</div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Members Tab */}
      {tab === 'members' && (
        <div className="space-y-3">
          {filteredMemberships.map((mem, i) => {
            return (
              <motion.div
                key={mem.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="bg-surface-container rounded-xl p-5 border border-border hover:border-primary/20 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={cn("w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ring-2", tc.bg, tc.color, tc.border.replace('border', 'ring'))}>
                      {mem.customerName?.split(' ').map(n => n[0]).join('').slice(0, 2) || '??'}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-on-surface">{mem.customerName}</h4>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-lg border", tc.bg, tc.color, tc.border)}>
                          {mem.planName}
                        </span>
                        <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-lg border", membershipStatusColors[mem.status])}>
                          {mem.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <div className="text-[10px] text-on-surface-variant uppercase tracking-wider">Period</div>
                      <div className="text-xs font-bold text-on-surface">
                        {new Date(mem.startDate).toLocaleDateString([], { month: 'short', day: 'numeric' })} — {new Date(mem.endDate).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                    </div>
                    <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-lg border", paymentStatusColors[mem.paymentStatus])}>
                      {mem.paymentStatus}
                    </span>
                    {mem.autoRenew && <span className="text-[9px] font-black text-primary bg-primary/10 px-2 py-0.5 rounded">AUTO-RENEW</span>}
                    {mem.status === 'Active' && (
                      <button onClick={() => cancelMembership(mem.id)} className="p-1.5 rounded-lg hover:bg-error/10 text-on-surface-variant hover:text-error transition-colors">
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
          {filteredMemberships.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-on-surface-variant/30">
              <Users className="w-16 h-16 mb-4 opacity-10" />
              <p className="text-lg font-medium italic">No memberships found.</p>
            </div>
          )}
        </div>
      )}

      {/* Plan Modal */}
      <AnimatePresence>
        {showPlanModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[200]" onClick={() => setShowPlanModal(false)}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-surface-container rounded-2xl p-8 w-full max-w-lg shadow-2xl border border-border" onClick={e => e.stopPropagation()}>
              <h3 className="text-lg font-bold text-on-surface mb-6">{editingPlan ? 'Edit Plan' : 'Create Plan'}</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Plan Name</label>
                  <input value={planForm.name} onChange={e => setPlanForm(p => ({ ...p, name: e.target.value }))}
                    className="w-full mt-1 bg-surface-container-lowest border border-border rounded-lg px-4 py-2.5 text-sm text-on-surface focus:border-primary focus:ring-0" placeholder="e.g. Gold Quarterly" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Duration (months)</label>
                    <input type="number" value={planForm.durationMonths} onChange={e => setPlanForm(p => ({ ...p, durationMonths: parseInt(e.target.value) || 1 }))}
                      className="w-full mt-1 bg-surface-container-lowest border border-border rounded-lg px-4 py-2.5 text-sm text-on-surface focus:border-primary focus:ring-0" />
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Price (₹)</label>
                    <input type="number" value={planForm.price} onChange={e => setPlanForm(p => ({ ...p, price: (parseFloat(e.target.value) || 0) }))}
                      className="w-full mt-1 bg-surface-container-lowest border border-border rounded-lg px-4 py-2.5 text-sm text-on-surface focus:border-primary focus:ring-0" />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Description</label>
                  <textarea value={planForm.description} onChange={e => setPlanForm(p => ({ ...p, description: e.target.value }))} rows={2}
                    className="w-full mt-1 bg-surface-container-lowest border border-border rounded-lg px-4 py-2.5 text-sm text-on-surface focus:border-primary focus:ring-0 resize-none" />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button onClick={() => setShowPlanModal(false)} className="px-5 py-2.5 rounded-xl text-sm font-bold text-on-surface hover:bg-surface-container-high transition-colors">Cancel</button>
                <button onClick={savePlan} className="px-6 py-2.5 rounded-xl text-sm font-bold bg-primary text-on-primary hover:brightness-110 active:scale-95 transition-all">
                  {editingPlan ? 'Update' : 'Create'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Assign Membership Modal */}
      <AnimatePresence>
        {showMemberModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[200]" onClick={() => setShowMemberModal(false)}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-surface-container rounded-2xl p-8 w-full max-w-lg shadow-2xl border border-border" onClick={e => e.stopPropagation()}>
              <h3 className="text-lg font-bold text-on-surface mb-6">Assign Membership</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Customer</label>
                  <select value={memberForm.customerId} onChange={e => setMemberForm(p => ({ ...p, customerId: e.target.value }))}
                    className="w-full mt-1 bg-surface-container-lowest border border-border rounded-lg px-4 py-2.5 text-sm text-on-surface focus:border-primary focus:ring-0">
                    <option value="">Select customer...</option>
                    {customers.map(c => <option key={c.id} value={c.id}>{c.name} ({c.email})</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Plan</label>
                  <select value={memberForm.planId} onChange={e => setMemberForm(p => ({ ...p, planId: e.target.value }))}
                    className="w-full mt-1 bg-surface-container-lowest border border-border rounded-lg px-4 py-2.5 text-sm text-on-surface focus:border-primary focus:ring-0">
                    <option value="">Select plan...</option>
                    {plans.filter(p => p.isActive).map(p => <option key={p.id} value={p.id}>{p.name} — ₹{(p.price).toLocaleString()} / {p.durationMonths}mo</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Start Date</label>
                    <input type="date" value={memberForm.startDate} onChange={e => setMemberForm(p => ({ ...p, startDate: e.target.value }))}
                      className="w-full mt-1 bg-surface-container-lowest border border-border rounded-lg px-4 py-2.5 text-sm text-on-surface focus:border-primary focus:ring-0" />
                  </div>
                  <div className="flex items-end pb-1">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={memberForm.autoRenew} onChange={e => setMemberForm(p => ({ ...p, autoRenew: e.target.checked }))}
                        className="rounded border-border text-primary focus:ring-primary" />
                      <span className="text-sm font-medium text-on-surface">Auto-renew</span>
                    </label>
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button onClick={() => setShowMemberModal(false)} className="px-5 py-2.5 rounded-xl text-sm font-bold text-on-surface hover:bg-surface-container-high transition-colors">Cancel</button>
                <button onClick={assignMembership} disabled={!memberForm.customerId || !memberForm.planId}
                  className="px-6 py-2.5 rounded-xl text-sm font-bold bg-primary text-on-primary hover:brightness-110 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed">
                  Assign
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
