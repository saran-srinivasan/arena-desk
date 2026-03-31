import React from 'react';
import { motion } from 'motion/react';
import { Search, Filter, ArrowDownNarrowWide, Ticket, Calendar, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { useBookings } from '../contexts/BookingContext';
import { useSessions } from '../contexts/SessionContext';
import { useToast } from '../contexts/ToastContext';
import { cn } from '../lib/utils';
import { BookingStatus } from '../types';
import { ConfirmDialog } from '../components/ConfirmDialog';

const statusConfig: Record<BookingStatus, { label: string; color: string; icon: React.ElementType }> = {
  Confirmed: { label: 'Confirmed', color: 'text-blue-400 bg-blue-400/10 border-blue-400/20', icon: Clock },
  CheckedIn: { label: 'Checked In', color: 'text-amber-400 bg-amber-400/10 border-amber-400/20', icon: Clock },
  Active: { label: 'Active', color: 'text-primary bg-primary/10 border-primary/20', icon: CheckCircle2 },
  Completed: { label: 'Completed', color: 'text-on-surface-variant bg-surface-container-highest border-border', icon: CheckCircle2 },
  Cancelled: { label: 'Cancelled', color: 'text-error bg-error/10 border-error/20', icon: XCircle },
};

export const BookingsListView: React.FC = () => {

  const { bookings, cancelBooking, checkInBooking } = useBookings();
  const { checkIn } = useSessions();
  const { success, error } = useToast();
  const [searchTerm, setSearchTerm] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<BookingStatus | 'All'>('All');
  const [cancelTarget, setCancelTarget] = React.useState<string | null>(null);

  const filtered = bookings.filter(b => {
    const matchesSearch = !searchTerm ||
      b.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.sport.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCheckIn = (booking: typeof bookings[0]) => {
    checkInBooking(booking.id);
    checkIn({ ...booking, status: 'Active' });
    success('Checked In', `${booking.customerName} has been checked in for ${booking.sport}.`);
  };

  const handleCancel = (bookingId: string) => {
    cancelBooking(bookingId);
    success('Booking Cancelled', 'The booking has been cancelled and the slot is now free.');
    setCancelTarget(null);
  };

  return (
    <div className="flex-1 overflow-y-auto p-8 no-scrollbar space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <Ticket className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-on-surface tracking-tight">Bookings</h2>
            <p className="text-xs text-on-surface-variant font-medium uppercase tracking-widest">
              {filtered.length} of {bookings.length} bookings
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by ID, Name, Sport..."
              className="bg-surface-container-low border border-border rounded-xl pl-10 pr-4 py-2 text-sm text-on-surface focus:border-primary focus:ring-0 transition-all w-64"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as BookingStatus | 'All')}
            className="bg-surface-container-low border border-border rounded-xl px-4 py-2 text-sm text-on-surface focus:border-primary focus:ring-0 transition-all"
          >
            <option value="All">All Status</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Active">Active</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-surface-container rounded-xl overflow-hidden border border-border">
        <div className="grid grid-cols-[1fr_1.2fr_0.8fr_0.8fr_1fr_0.8fr_1fr] gap-0 px-6 py-3 bg-surface-container-low border-b border-border text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
          <span>Booking ID</span>
          <span>Customer</span>
          <span>Sport</span>
          <span>Resource</span>
          <span>Time</span>
          <span>Status</span>
          <span className="text-right">Actions</span>
        </div>

        <div className="divide-y divide-border">
          {filtered.map((booking, i) => {
            const cfg = statusConfig[booking.status];
            const startDate = new Date(booking.startTime);
            const endDate = new Date(booking.endTime);
            const timeStr = `${startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })} – ${endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}`;

            return (
              <motion.div
                key={booking.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="grid grid-cols-[1fr_1.2fr_0.8fr_0.8fr_1fr_0.8fr_1fr] gap-0 px-6 py-4 items-center hover:bg-surface-container-high/50 transition-colors"
              >
                <span className="text-xs font-mono font-bold text-primary">{booking.id}</span>
                <span className="text-sm font-semibold text-on-surface">{booking.customerName}</span>
                <span className="text-xs text-on-surface-variant font-medium">{booking.sport}</span>
                <span className="text-xs text-on-surface-variant font-medium">{booking.resourceName}</span>
                <span className="text-xs text-on-surface-variant font-medium">{timeStr}</span>
                <span className={cn('text-[10px] font-bold px-2 py-1 rounded-lg border inline-flex items-center gap-1 w-fit', cfg.color)}>
                  <cfg.icon className="w-3 h-3" />
                  {cfg.label}
                </span>
                <div className="text-right flex items-center justify-end gap-2">
                  {booking.status === 'Confirmed' && (
                    <>
                      <button
                        onClick={() => handleCheckIn(booking)}
                        className="px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-[10px] font-bold hover:bg-primary hover:text-on-primary transition-all"
                      >
                        Check In
                      </button>
                      <button
                        onClick={() => setCancelTarget(booking.id)}
                        className="px-3 py-1.5 rounded-lg bg-error/10 text-error text-[10px] font-bold hover:bg-error hover:text-on-primary transition-all"
                      >
                        Cancel
                      </button>
                    </>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-on-surface-variant/30">
            <Ticket className="w-12 h-12 mb-3 opacity-10" />
            <p className="text-sm font-medium italic">No bookings match your criteria.</p>
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={cancelTarget !== null}
        title="Cancel Booking"
        message="Are you sure you want to cancel this booking? This action cannot be undone."
        confirmText="Yes, Cancel"
        type="danger"
        onConfirm={() => cancelTarget && handleCancel(cancelTarget)}
        onClose={() => setCancelTarget(null)}
      />
    </div>
  );
};
