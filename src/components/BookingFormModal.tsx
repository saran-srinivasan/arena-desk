import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Calendar, Clock, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useBookings } from '../contexts/BookingContext';
import { useConflict } from '../hooks/useConflict';
import { SportType, ProposedBooking, BookingStatus, Booking } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { cn } from '../lib/utils';
import { format, parse, startOfDay, addHours } from 'date-fns';

interface BookingFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  editBookingId?: string;
}

export const BookingFormModal: React.FC<BookingFormModalProps> = ({ isOpen, onClose, editBookingId }) => {
  const { bookings, customers, resources, createBooking, updateBooking, generateBookingId } = useBookings();
  const { checkConflicts } = useConflict();
  const { user } = useAuth();
  const { success } = useToast();

  const [customerId, setCustomerId] = useState('');
  const [sport, setSport] = useState<SportType>('Cricket');
  const [resourceId, setResourceId] = useState('');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [startTime, setStartTime] = useState('10:00');
  const [endTime, setEndTime] = useState('11:00');
  const [notes, setNotes] = useState('');

  // ── Derived Options ──────────────────────────────────────────
  const availableResources = useMemo(() => {
    return resources.filter(r => r.supportedSports.includes(sport as SportType));
  }, [resources, sport]);

  // ── Edit Mode Init ──────────────────────────────────────────
  const isEditing = !!editBookingId;
  const editingBooking = useMemo(() => {
    return isEditing ? bookings.find(b => b.id === editBookingId) || null : null;
  }, [isEditing, editBookingId, bookings]);

  useEffect(() => {
    if (isOpen && editingBooking) {
      setCustomerId(editingBooking.customerId);
      setSport(editingBooking.sport);
      setResourceId(editingBooking.resourceId);
      setDate(format(new Date(editingBooking.startTime), 'yyyy-MM-dd'));
      setStartTime(format(new Date(editingBooking.startTime), 'HH:mm'));
      setEndTime(format(new Date(editingBooking.endTime), 'HH:mm'));
      setNotes(editingBooking.notes || '');
    } else if (isOpen && !editingBooking) {
      setCustomerId('');
      setSport('Cricket');
      setResourceId('');
      setDate(format(new Date(), 'yyyy-MM-dd'));
      setStartTime('10:00');
      setEndTime('11:00');
      setNotes('');
    }
  }, [isOpen, editingBooking]);

  // Select first available resource when sport changes (only if not editing)
  useEffect(() => {
    if (availableResources.length > 0 && !availableResources.find(r => r.id === resourceId)) {
      setResourceId(availableResources[0].id);
    }
  }, [sport, availableResources, resourceId]);

  // ── Conflict Validation ─────────────────────────────────────
  const proposedBooking = useMemo((): ProposedBooking | null => {
    if (!resourceId || !date || !startTime || !endTime) return null;

    try {
      // Build full ISO strings for start/end
      const startD = parse(startTime, 'HH:mm', new Date(date));
      const endD = parse(endTime, 'HH:mm', new Date(date));

      return {
        resourceId,
        sport,
        startTime: startD.toISOString(),
        endTime: endD.toISOString(),
      };
    } catch (e) {
      return null;
    }
  }, [resourceId, sport, date, startTime, endTime]);

  const conflicts = useMemo(() => {
    if (!proposedBooking) return [];

    // Additional basic validation
    const startD = new Date(proposedBooking.startTime);
    const endD = new Date(proposedBooking.endTime);
    if (startD >= endD) return [{ existingBooking: {} as any, type: 'INVALID_TIME' as any }];

    return checkConflicts(proposedBooking, editBookingId);
  }, [proposedBooking, checkConflicts, editBookingId]);

  const invalidTime = conflicts.some(c => c.type === 'INVALID_TIME' as any);
  const isValid = conflicts.length === 0 && customerId !== '' && resourceId !== '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid || !proposedBooking) return;

    const customer = customers.find(c => c.id === customerId);
    const resource = resources.find(r => r.id === resourceId);
    if (!customer || !resource) return;

    try {
      if (isEditing && editingBooking) {
        await updateBooking(editingBooking.id, {
          customerId: customer.id,
          customerName: customer.name,
          sport,
          resourceId: resource.id,
          resourceName: resource.name,
          startTime: proposedBooking.startTime,
          endTime: proposedBooking.endTime,
          notes,
        });
        success('Booking Updated', `Successfully updated booking for ${resource.name}.`);
      } else {
        const newBooking: Booking = {
          id: generateBookingId(), // Temporary — server assigns real ID
          customerId: customer.id,
          customerName: customer.name,
          sport,
          resourceId: resource.id,
          resourceName: resource.name,
          startTime: proposedBooking.startTime,
          endTime: proposedBooking.endTime,
          status: 'Confirmed',
          notes,
          createdBy: user.name,
          createdAt: new Date().toISOString(),
          priceCents: 5000,
        };

        await createBooking(newBooking);
        success('Booking Confirmed', `Successfully booked ${resource.name} at ${startTime}.`);
      }
      handleClose();
    } catch (err: any) {
      console.error('Booking failed:', err);
    }
  };

  const handleClose = () => {
    setCustomerId('');
    setSport('Cricket');
    setDate(format(new Date(), 'yyyy-MM-dd'));
    setStartTime('10:00');
    setEndTime('11:00');
    setNotes('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-surface-container w-full max-w-2xl rounded-2xl shadow-2xl relative flex flex-col max-h-[90vh] overflow-hidden border border-border-strong"
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-surface-container-low">
            <h2 className="text-lg font-bold text-on-surface flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              {isEditing ? 'Edit Booking' : 'New Booking'}
            </h2>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-surface-container-high rounded-full text-on-surface-variant transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
            <form id="booking-form" onSubmit={handleSubmit} className="space-y-6">

              {/* Customer & Sport */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant px-1">Customer</label>
                  <select
                    value={customerId}
                    onChange={(e) => setCustomerId(e.target.value)}
                    className="w-full bg-surface-container-lowest border border-border focus:border-primary focus:ring-1 focus:ring-primary text-on-surface px-4 py-3 rounded-xl transition-all"
                    required
                  >
                    <option value="" disabled>Select a customer...</option>
                    {customers.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant px-1">Sport</label>
                  <select
                    value={sport}
                    onChange={(e) => setSport(e.target.value as SportType)}
                    className="w-full bg-surface-container-lowest border border-border focus:border-primary focus:ring-1 focus:ring-primary text-on-surface px-4 py-3 rounded-xl transition-all"
                  >
                    {['Cricket', 'Pickleball', 'Volleyball', 'Basketball', 'Swimming'].map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Resource & Date */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant px-1">Resource</label>
                  <select
                    value={resourceId}
                    onChange={(e) => setResourceId(e.target.value)}
                    className="w-full bg-surface-container-lowest border border-border focus:border-primary focus:ring-1 focus:ring-primary text-on-surface px-4 py-3 rounded-xl transition-all"
                    required
                    disabled={availableResources.length === 0}
                  >
                    {availableResources.length === 0 && <option value="" disabled>No resources for {sport}</option>}
                    {availableResources.map(r => (
                      <option key={r.id} value={r.id}>{r.name} ({r.subType})</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant px-1">Date</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-surface-container-lowest border border-border focus:border-primary focus:ring-1 focus:ring-primary text-on-surface px-4 py-3 rounded-xl transition-all"
                    required
                  />
                </div>
              </div>

              {/* Timing */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant px-1">Start Time</label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full bg-surface-container-lowest border border-border focus:border-primary focus:ring-1 focus:ring-primary text-on-surface px-4 py-3 rounded-xl transition-all"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant px-1">End Time</label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full bg-surface-container-lowest border border-border focus:border-primary focus:ring-1 focus:ring-primary text-on-surface px-4 py-3 rounded-xl transition-all"
                    required
                  />
                </div>
              </div>

              {/* Add notes */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant px-1">Notes (Optional)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-surface-container-lowest border border-border focus:border-primary focus:ring-1 focus:ring-primary text-on-surface px-4 py-3 rounded-xl transition-all resize-none h-24"
                  placeholder="E.g. Wants extra net..."
                />
              </div>
            </form>
          </div>

          {/* Footer & Conflict Warnings */}
          <div className="px-6 py-4 bg-surface-container-low border-t border-border flex flex-col gap-4">

            {/* Conflict Banner */}
            {conflicts.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className={cn(
                  "p-3 rounded-lg flex items-start gap-3 text-sm",
                  invalidTime ? "bg-error/10 text-error border border-error/20" : "bg-tertiary/10 text-tertiary border border-tertiary/20"
                )}
              >
                <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Cannot Create Booking</p>
                  <ul className="list-disc pl-4 mt-1 opacity-90 text-xs space-y-1">
                    {invalidTime && <li>Start time must be before end time.</li>}
                    {conflicts.filter(c => c.type === 'DIRECT').map((c, i) => (
                      <li key={`direct-${i}`}>Conflict with existing {c.existingBooking.sport} booking ({format(new Date(c.existingBooking.startTime), 'HH:mm')} - {format(new Date(c.existingBooking.endTime), 'HH:mm')}).</li>
                    ))}
                    {conflicts.filter(c => c.type === 'CROSS_SPORT').map((c, i) => (
                      <li key={`cross-${i}`}>Cross-sport conflict: Court is physically blocked by an existing {c.existingBooking.sport} booking ({format(new Date(c.existingBooking.startTime), 'HH:mm')} - {format(new Date(c.existingBooking.endTime), 'HH:mm')}).</li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            )}

            <div className="flex items-center justify-between">
              <div className="text-xs text-on-surface-variant flex items-center gap-2">
                {!isValid && !invalidTime && conflicts.length === 0 && (
                  <span className="flex items-center gap-1.5"><Clock className="w-3 h-3" /> Fill all required fields</span>
                )}
                {isValid && (
                  <span className="flex items-center gap-1.5 text-primary"><CheckCircle2 className="w-3 h-3" /> Slot available</span>
                )}
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-5 py-2.5 rounded-xl font-bold text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  form="booking-form"
                  disabled={!isValid}
                  className="px-6 py-2.5 rounded-xl font-bold bg-primary text-on-primary hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
                >
                  {isEditing ? 'Save Changes' : 'Confirm Booking'}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
