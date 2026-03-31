import React from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  Receipt,
  Star,
  Activity,
  Calendar as CalendarIcon,
  AlertTriangle,
  ArrowUpRight
} from 'lucide-react';
import { useBookings } from '../contexts/BookingContext';
import { useSessions } from '../contexts/SessionContext';
import { useToast } from '../contexts/ToastContext';
import { ActiveSessionCard } from '../components/ActiveSessionCard';
import { ConfirmDialog } from '../components/ConfirmDialog';

export const DashboardView: React.FC = () => {
  const { bookings, completeBooking } = useBookings();
  const { sessions, checkOut, extend } = useSessions();
  const { success } = useToast();
  const navigate = useNavigate();
  const [checkoutTarget, setCheckoutTarget] = React.useState<string | null>(null);

  // Derive KPIs from real data
  const totalRevenue = bookings
    .filter(b => b.status !== 'Cancelled')
    .reduce((sum, b) => sum + (b.priceCents || 0), 0);

  const avgBooking = bookings.filter(b => b.status !== 'Cancelled').length > 0
    ? totalRevenue / bookings.filter(b => b.status !== 'Cancelled').length
    : 0;

  // Most popular sport
  const sportCounts: Record<string, number> = {};
  bookings.filter(b => b.status !== 'Cancelled').forEach(b => {
    sportCounts[b.sport] = (sportCounts[b.sport] || 0) + 1;
  });
  const popularSport = Object.entries(sportCounts).sort((a, b) => b[1] - a[1])[0];

  // Utilization: active + confirmed as % of total non-cancelled
  const activeTotal = bookings.filter(b => b.status === 'Active' || b.status === 'Confirmed').length;
  const utilPct = bookings.length > 0 ? Math.round((activeTotal / bookings.filter(b => b.status !== 'Cancelled').length) * 100) : 0;

  const kpis = [
    { label: 'Total Revenue', value: `$${(totalRevenue / 100).toLocaleString()}`, trend: 'From bookings', icon: TrendingUp, color: 'primary' },
    { label: 'Avg. Booking', value: `$${(avgBooking / 100).toFixed(2)}`, trend: 'Per session', icon: Receipt, color: 'secondary' },
    { label: 'Popular Sport', value: popularSport?.[0] || 'N/A', trend: `${popularSport?.[1] || 0} bookings`, icon: Star, color: 'tertiary' },
    { label: 'Utilization', value: `${utilPct}%`, trend: `${activeTotal} active slots`, icon: Activity, color: 'primary' },
  ];

  // Upcoming bookings for alerts
  const upcomingBookings = bookings
    .filter(b => b.status === 'Confirmed')
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
    .slice(0, 3);

  const handleCheckOut = (bookingId: string) => {
    checkOut(bookingId);
    completeBooking(bookingId);
    success('Session Completed', 'Customer has been checked out successfully.');
    setCheckoutTarget(null);
  };

  const handleExtend = (bookingId: string) => {
    extend(bookingId, 15);
    success('Session Extended', 'Added 15 minutes to the session.');
  };

  return (
    <div className="flex-1 overflow-y-auto p-8 no-scrollbar space-y-8">
      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, i) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-surface-container rounded-xl p-5 border-l-4 border-primary relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
              <kpi.icon className="w-16 h-16" />
            </div>
            <p className="text-on-surface-variant text-[10px] font-bold uppercase tracking-widest mb-2">{kpi.label}</p>
            <h3 className="text-3xl font-black text-on-surface tracking-tighter">{kpi.value}</h3>
            <div className="flex items-center gap-1 mt-3 text-primary text-[10px] font-bold">
              <ArrowUpRight className="w-3 h-3" />
              <span>{kpi.trend}</span>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-10 gap-6">
        {/* Today's Timeline Mockup */}
        <div className="col-span-10 lg:col-span-6 bg-surface-container rounded-xl flex flex-col overflow-hidden">
          <div className="p-4 border-b border-border flex justify-between items-center">
            <h4 className="text-xs font-bold text-heading uppercase tracking-tight">Facility Resource Timeline</h4>
            <div className="flex gap-4">
              <span className="flex items-center gap-1 text-[10px] text-on-surface-variant"><span className="w-2 h-2 rounded-full bg-primary" /> Confirmed</span>
              <span className="flex items-center gap-1 text-[10px] text-on-surface-variant"><span className="w-2 h-2 rounded-full bg-blue-500" /> Active</span>
            </div>
          </div>
          <div className="p-6">
            {bookings.filter(b => b.status !== 'Cancelled' && b.status !== 'Completed').length > 0 ? (
              <div className="space-y-3">
                {bookings
                  .filter(b => b.status !== 'Cancelled' && b.status !== 'Completed')
                  .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
                  .slice(0, 5)
                  .map((b) => {
                    const start = new Date(b.startTime);
                    const end = new Date(b.endTime);
                    const timeStr = `${start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })} – ${end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}`;
                    const isActive = b.status === 'Active';
                    return (
                      <div key={b.id} className="flex items-center gap-4 p-3 bg-surface-container-low rounded-lg border border-border">
                        <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-blue-500 animate-pulse' : 'bg-primary'}`} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-on-surface truncate">{b.customerName}</span>
                            <span className="text-[10px] text-on-surface-variant">{b.sport}</span>
                          </div>
                          <span className="text-[10px] text-on-surface-variant">{b.resourceName} • {timeStr}</span>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg ${isActive ? 'bg-blue-500/10 text-blue-400' : 'bg-primary/10 text-primary'}`}>
                          {b.status}
                        </span>
                      </div>
                    );
                  })}
              </div>
            ) : (
              <div className="flex items-center justify-center h-32 text-on-surface-variant/30 italic">
                <div className="text-center">
                  <CalendarIcon className="w-12 h-12 mx-auto mb-4 opacity-20" />
                  <p>No bookings for today</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Upcoming Check-ins */}
        <div className="col-span-10 lg:col-span-4 bg-surface-container rounded-xl flex flex-col">
          <div className="p-4 border-b border-border">
            <h4 className="text-xs font-bold text-heading uppercase tracking-tight">Upcoming Check-ins</h4>
          </div>
          <div className="p-4 space-y-3">
            {upcomingBookings.length > 0 ? upcomingBookings.map(b => {
              const start = new Date(b.startTime);
              const timeStr = start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
              return (
                <div key={b.id} className="p-3 bg-surface-container-low rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-surface-container-highest rounded-full flex items-center justify-center text-primary font-bold">
                      {b.sport[0]}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-heading">{b.customerName}</p>
                      <p className="text-[10px] text-on-surface-variant">{b.resourceName} • {timeStr}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate('/bookings')}
                    className="bg-primary/10 text-primary text-[10px] font-bold px-3 py-1.5 rounded-lg uppercase hover:bg-primary hover:text-on-primary transition-all"
                  >
                    View
                  </button>
                </div>
              );
            }) : (
              <div className="flex items-center justify-center py-8 text-on-surface-variant/30 italic text-sm">
                No upcoming check-ins
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Active Sessions Strip */}
      {sessions.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-heading uppercase tracking-tight">Live Active Sessions</h4>
            <button onClick={() => navigate('/sessions')} className="text-primary text-xs font-bold hover:underline">View All</button>
          </div>
          <div className="space-y-3">
            {sessions.slice(0, 3).map(session => (
              <ActiveSessionCard
                key={session.bookingId}
                session={session}
                onExtend={handleExtend}
                onCheckOut={() => setCheckoutTarget(session.bookingId)}
              />
            ))}
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={checkoutTarget !== null}
        title="Check Out Session"
        message="Are you sure you want to end this session? The resource will become available for new bookings immediately."
        confirmText="Complete Session"
        type="warning"
        onConfirm={() => checkoutTarget && handleCheckOut(checkoutTarget)}
        onClose={() => setCheckoutTarget(null)}
      />
    </div>
  );
};
