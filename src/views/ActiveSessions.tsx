import React from 'react';
import { motion } from 'motion/react';
import { Search, Filter, ArrowDownNarrowWide, Radio } from 'lucide-react';
import { useSessions } from '../contexts/SessionContext';
import { useBookings } from '../contexts/BookingContext';
import { useToast } from '../contexts/ToastContext';
import { ActiveSessionCard } from '../components/ActiveSessionCard';
import { ConfirmDialog } from '../components/ConfirmDialog';

export const ActiveSessionsView: React.FC = () => {
  const { sessions, checkOut, extend } = useSessions();
  const { completeBooking } = useBookings();
  const { success } = useToast();
  const [searchTerm, setSearchTerm] = React.useState('');
  const [checkoutTarget, setCheckoutTarget] = React.useState<string | null>(null);

  const filtered = sessions.filter(s => {
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return (
      s.customerName.toLowerCase().includes(q) ||
      s.bookingId.toLowerCase().includes(q) ||
      s.sport.toLowerCase().includes(q)
    );
  });

  const handleCheckOut = async (bookingId: string) => {
    try {
      checkOut(bookingId);
      await completeBooking(bookingId);
      success('Session Completed', 'Customer has been checked out successfully.');
    } catch (err) {
      console.error('Check-out failed:', err);
    }
    setCheckoutTarget(null);
  };

  const handleExtend = (bookingId: string) => {
    extend(bookingId, 15); // extend by 15 minutes
    success('Session Extended', 'Added 15 minutes to the session.');
  };

  return (
    <div className="flex-1 overflow-y-auto p-8 no-scrollbar space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <Radio className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-on-surface tracking-tight">Live Sessions</h2>
            <p className="text-xs text-on-surface-variant font-medium uppercase tracking-widest">Monitoring {sessions.length} active resources</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by ID, Name..."
              className="bg-surface-container-low border border-border rounded-xl pl-10 pr-4 py-2 text-sm text-on-surface focus:border-primary focus:ring-0 transition-all w-64"
            />
          </div>
          <button className="p-2 bg-surface-container hover:bg-surface-container-high rounded-xl text-on-surface-variant transition-colors border border-border">
            <Filter className="w-5 h-5" />
          </button>
          <button className="p-2 bg-surface-container hover:bg-surface-container-high rounded-xl text-on-surface-variant transition-colors border border-border">
            <ArrowDownNarrowWide className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filtered.map((session) => (
          <ActiveSessionCard
            key={session.bookingId}
            session={session}
            onExtend={handleExtend}
            onCheckOut={() => setCheckoutTarget(session.bookingId)}
          />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-on-surface-variant/30">
          <Radio className="w-16 h-16 mb-4 opacity-10" />
          <p className="text-lg font-medium italic">No active sessions found.</p>
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
