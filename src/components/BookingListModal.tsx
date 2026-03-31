import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Calendar, Clock, Edit2 } from 'lucide-react';
import { useBookings } from '../contexts/BookingContext';
import { format, isSameDay } from 'date-fns';
import { cn } from '../lib/utils';

interface BookingListModalProps {
  isOpen: boolean;
  onClose: () => void;
  date: Date | null;
  resourceId?: string;
  onEditBooking: (id: string) => void;
}

export const BookingListModal: React.FC<BookingListModalProps> = ({ isOpen, onClose, date, resourceId, onEditBooking }) => {
  const { bookings, resources } = useBookings();

  const activeBookings = useMemo(() => {
    if (!date) return [];
    return bookings.filter(b => {
      if (b.status === 'Cancelled') return false;
      if (!isSameDay(new Date(b.startTime), date)) return false;
      if (resourceId && b.resourceId !== resourceId) return false;
      return true;
    }).sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
  }, [bookings, date, resourceId]);

  const resourceName = useMemo(() => {
    if (!resourceId) return 'All Resources';
    return resources.find(r => r.id === resourceId)?.name || 'Unknown Resource';
  }, [resourceId, resources]);

  if (!isOpen || !date) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-surface-container w-full max-w-lg rounded-2xl shadow-2xl relative flex flex-col max-h-[80vh] overflow-hidden border border-border-strong"
        >
          <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-surface-container-low">
            <div>
              <h2 className="text-lg font-bold text-on-surface flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                Bookings for {format(date, 'MMM do, yyyy')}
              </h2>
              <p className="text-xs text-on-surface-variant font-medium mt-1">{resourceName}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-surface-container-high rounded-full text-on-surface-variant transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 scrollbar-hide flex flex-col gap-3 bg-surface">
            {activeBookings.length === 0 ? (
              <div className="text-center py-10 text-on-surface-variant">
                <Calendar className="w-10 h-10 mx-auto opacity-20 mb-3" />
                <p className="font-medium text-sm">No bookings found for this slot.</p>
              </div>
            ) : (
              activeBookings.map(b => {
                const startStr = format(new Date(b.startTime), 'HH:mm');
                const endStr = format(new Date(b.endTime), 'HH:mm');
                return (
                  <div key={b.id} className="bg-surface-container-low border border-border rounded-xl p-4 flex items-center justify-between group hover:bg-surface-container transition-colors">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-on-surface">{b.customerName}</span>
                        <span className="text-[10px] font-bold uppercase tracking-wide bg-surface-container-highest px-2 py-0.5 rounded text-on-surface-variant">{b.sport}</span>
                      </div>
                      <div className="flex items-center gap-4 mt-1">
                        <span className="text-xs font-medium text-primary flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {startStr} - {endStr}</span>
                        {!resourceId && <span className="text-xs text-on-surface-variant font-medium truncate max-w-[120px]">{b.resourceName}</span>}
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        onClose();
                        onEditBooking(b.id);
                      }}
                      className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant hover:text-primary hover:bg-primary/10 transition-colors shrink-0"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
