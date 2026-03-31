import React, { useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PlusCircle, Calendar as CalendarIcon, Ban, ChevronLeft, ChevronRight, Lock, Clock, Users, Zap } from 'lucide-react';
import { useBookings } from '../contexts/BookingContext';
import { getSlotState } from '../lib/conflictEngine';
import { cn } from '../lib/utils';
import { format, addDays, subDays, startOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isSameDay, isSameMonth, addMonths, subMonths, isToday as isDateToday } from 'date-fns';
import { useOutletContext } from 'react-router-dom';

type CalendarViewType = 'day' | 'week' | 'month';

// ── Sport Color System ─────────────────────────────────────────
const SPORT_COLORS: Record<string, { bg: string; bgLight: string; text: string; dot: string; border: string }> = {
  Cricket: { bg: 'from-emerald-500 to-emerald-600', bgLight: 'bg-emerald-500/15', text: 'text-emerald-400', dot: 'bg-emerald-400', border: 'border-emerald-500/40' },
  Basketball: { bg: 'from-orange-500 to-orange-600', bgLight: 'bg-orange-500/15', text: 'text-orange-400', dot: 'bg-orange-400', border: 'border-orange-500/40' },
  Swimming: { bg: 'from-sky-500 to-sky-600', bgLight: 'bg-sky-500/15', text: 'text-sky-400', dot: 'bg-sky-400', border: 'border-sky-500/40' },
  Pickleball: { bg: 'from-violet-500 to-violet-600', bgLight: 'bg-violet-500/15', text: 'text-violet-400', dot: 'bg-violet-400', border: 'border-violet-500/40' },
  Volleyball: { bg: 'from-amber-500 to-amber-600', bgLight: 'bg-amber-500/15', text: 'text-amber-400', dot: 'bg-amber-400', border: 'border-amber-500/40' },
};

const getSportColor = (sport: string) => SPORT_COLORS[sport] || SPORT_COLORS.Cricket;

// ── Status badge color ─────────────────────────────────────────
const STATUS_STYLES: Record<string, string> = {
  Confirmed: 'bg-primary/20 text-primary',
  Active: 'bg-sky-500/20 text-sky-400',
  CheckedIn: 'bg-amber-500/20 text-amber-400',
};

export const CalendarView: React.FC = () => {
  const { bookings, resources } = useBookings();
  const [selectedDate, setSelectedDate] = React.useState(new Date());
  const [calendarView, setCalendarView] = React.useState<CalendarViewType>('day');
  const [direction, setDirection] = React.useState(0); // -1 back, 1 forward for animation
  const { openBookingModal, openListModal } = useOutletContext<{
    openBookingModal: (editBookingId?: string) => void;
    openListModal: (date: Date, resourceId?: string) => void;
  }>();

  // ── Current time (auto-updating) ─────────────────────────────
  const [now, setNow] = React.useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 30_000); // update every 30s
    return () => clearInterval(timer);
  }, []);

  // ── Day view: Full-day scrollable (6 AM–11 PM, 30-min slots) ─
  const DAY_START_HOUR = 6;
  const DAY_END_HOUR = 23;
  const TOTAL_SLOTS = (DAY_END_HOUR - DAY_START_HOUR) * 2; // 34 slots
  const SLOT_HEIGHT = 56; // px per 30-min slot

  const dayScrollRef = useRef<HTMLDivElement>(null);
  const hasAutoScrolled = useRef(false);

  // Auto-scroll to current time on first render of day view
  useEffect(() => {
    if (calendarView === 'day' && dayScrollRef.current && !hasAutoScrolled.current) {
      const currentHour = now.getHours();
      const currentMin = now.getMinutes();
      const slotIndex = (currentHour - DAY_START_HOUR) * 2 + (currentMin >= 30 ? 1 : 0);
      const scrollPos = Math.max(0, (slotIndex - 4) * SLOT_HEIGHT); // show ~2 hours before current time
      dayScrollRef.current.scrollTop = scrollPos;
      hasAutoScrolled.current = true;
    }
  }, [calendarView, now]);

  // Reset auto-scroll flag when date changes
  useEffect(() => {
    hasAutoScrolled.current = false;
  }, [selectedDate]);

  // ── Keyboard navigation ──────────────────────────────────────
  const handlePrev = useCallback(() => {
    setDirection(-1);
    if (calendarView === 'day') {
      setSelectedDate(prev => subDays(prev, 1));
    } else if (calendarView === 'week') {
      setSelectedDate(prev => subDays(prev, 7));
    } else {
      setSelectedDate(prev => subMonths(prev, 1));
    }
  }, [calendarView]);

  const handleNext = useCallback(() => {
    setDirection(1);
    if (calendarView === 'day') {
      setSelectedDate(prev => addDays(prev, 1));
    } else if (calendarView === 'week') {
      setSelectedDate(prev => addDays(prev, 7));
    } else {
      setSelectedDate(prev => addMonths(prev, 1));
    }
  }, [calendarView]);

  const jumpToToday = useCallback(() => {
    setDirection(0);
    setSelectedDate(new Date());
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Don't capture if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLSelectElement) return;
      if (e.key === 'ArrowLeft') { e.preventDefault(); handlePrev(); }
      if (e.key === 'ArrowRight') { e.preventDefault(); handleNext(); }
      if (e.key === 't' || e.key === 'T') { e.preventDefault(); jumpToToday(); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handlePrev, handleNext, jumpToToday]);

  // ── Helper: active bookings ──────────────────────────────────
  const activeBookings = bookings.filter(b => b.status !== 'Cancelled' && b.status !== 'Completed');

  const dayStart = startOfDay(selectedDate);
  const isTodaySelected = isDateToday(selectedDate);

  // ── Upcoming next booking ────────────────────────────────────
  const nextBooking = React.useMemo(() => {
    const upcoming = activeBookings
      .filter(b => new Date(b.startTime) > now)
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
    return upcoming[0] || null;
  }, [activeBookings, now]);

  // ── Today booking count ──────────────────────────────────────
  const todayBookingCount = React.useMemo(() => {
    return activeBookings.filter(b => isSameDay(new Date(b.startTime), now)).length;
  }, [activeBookings, now]);

  // ═══════════════════════════════════════════════════════════════
  //  DAY VIEW
  // ═══════════════════════════════════════════════════════════════
  const renderDayView = () => {
    const slots = Array.from({ length: TOTAL_SLOTS }, (_, i) => {
      const hour = DAY_START_HOUR + Math.floor(i / 2);
      const minute = i % 2 === 0 ? 0 : 30;
      return { hour, minute, index: i };
    });

    // Current time position
    const nowHour = now.getHours();
    const nowMin = now.getMinutes();
    const timeSlotIndex = (nowHour - DAY_START_HOUR) * 2 + nowMin / 30;
    const timeLineTop = timeSlotIndex * SLOT_HEIGHT;
    const isTimeVisible = isTodaySelected && nowHour >= DAY_START_HOUR && nowHour < DAY_END_HOUR;

    return (
      <div ref={dayScrollRef} className="w-full flex-1 overflow-y-auto overflow-x-auto relative calendar-scroll">
        <div className="min-w-[800px] relative" style={{ height: TOTAL_SLOTS * SLOT_HEIGHT }}>
          {/* Sticky Resource Header Row */}
          <div className="sticky top-0 z-40 bg-surface-container-high/95 backdrop-blur-xl h-10 flex items-center border-b border-border-strong">
            <div className="w-[72px] shrink-0 px-3 text-[9px] font-bold text-on-surface-variant uppercase tracking-widest sticky left-0 bg-surface-container-high/95 z-50 border-r border-border-strong h-full flex items-center">
              Time
            </div>

            {resources.map(res => (
              <div key={res.id} className="flex-1 min-w-[140px] text-center border-r border-border h-full flex flex-col justify-center px-2">
                <span className="text-xs font-bold text-on-surface truncate">{res.name}</span>
                <span className="text-[9px] text-on-surface-variant/70 uppercase tracking-tight">{res.subType}</span>
              </div>
            ))}
          </div>

          {/* Time Grid Rows */}
          {slots.map(({ hour, minute, index }) => {
            const isHourMark = minute === 0;
            const timeLabel = isHourMark
              ? hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`
              : '';

            return (
              <div
                key={index}
                className={cn(
                  "flex absolute w-full",
                  isHourMark ? "border-t border-border-strong" : "border-t border-dashed border-border"
                )}
                style={{ top: 40 + index * SLOT_HEIGHT, height: SLOT_HEIGHT }}
              >
                {/* Time label */}
                <div className="w-[72px] shrink-0 px-3 flex items-start pt-1 sticky left-0 z-30 bg-surface/90 backdrop-blur-sm border-r border-border">
                  {isHourMark && (
                    <span className="text-[10px] font-semibold text-on-surface-variant/60">{timeLabel}</span>
                  )}
                </div>

                {/* Resource cells */}
                {resources.map(res => {
                  const slotDate = new Date(dayStart);
                  slotDate.setHours(hour, minute, 0, 0);

                  // Check if this slot has a booking starting in it
                  const slotBookings = activeBookings.filter(b => {
                    if (b.resourceId !== res.id) return false;
                    const bStart = new Date(b.startTime);
                    if (!isSameDay(bStart, dayStart)) return false;
                    const bStartSlot = (bStart.getHours() - DAY_START_HOUR) * 2 + (bStart.getMinutes() >= 30 ? 1 : 0);
                    return bStartSlot === index;
                  });

                  // Check slot state
                  const { state } = getSlotState(res.id, hour, dayStart, bookings, resources);
                  const isBlocked = state === 'blocked';

                  return (
                    <div
                      key={res.id}
                      className={cn(
                        "flex-1 min-w-[140px] border-r border-border relative group/cell transition-colors",
                        isBlocked
                          ? "hatched-pattern cursor-not-allowed"
                          : "hover:bg-hover-overlay cursor-pointer"
                      )}
                      onClick={() => {
                        if (!isBlocked && slotBookings.length === 0) openBookingModal();
                      }}
                    >
                      {/* Hover hint */}
                      {!isBlocked && slotBookings.length === 0 && (
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/cell:opacity-100 transition-opacity">
                          <PlusCircle className="w-4 h-4 text-on-surface/15" />
                        </div>
                      )}

                      {isBlocked && isHourMark && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Lock className="w-3 h-3 text-on-surface-variant/20" />
                        </div>
                      )}

                      {/* Booking chips */}
                      {slotBookings.map(b => {
                        const bStart = new Date(b.startTime);
                        const bEnd = new Date(b.endTime);
                        const durationSlots = ((bEnd.getTime() - bStart.getTime()) / (1000 * 60 * 30));
                        const chipHeight = durationSlots * SLOT_HEIGHT - 4;
                        const sportColor = getSportColor(b.sport);

                        const startStr = format(bStart, 'h:mm a');
                        const endStr = format(bEnd, 'h:mm a');

                        return (
                          <motion.div
                            key={b.id}
                            initial={{ opacity: 0, scale: 0.96 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.2 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              openBookingModal(b.id);
                            }}
                            className={cn(
                              "absolute left-1 right-1 top-[2px] rounded-lg shadow-lg z-10 overflow-hidden cursor-pointer",
                              "bg-gradient-to-br text-white",
                              sportColor.bg,
                              "hover:brightness-110 hover:shadow-xl transition-all"
                            )}
                            style={{ height: chipHeight }}
                          >
                            <div className="p-2 h-full flex flex-col justify-between min-w-0">
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5 mb-0.5">
                                  <span className={cn("text-[8px] font-bold uppercase tracking-wide px-1.5 py-[1px] rounded-full bg-black/20")}>{b.sport}</span>
                                  <span className={cn("text-[8px] font-bold uppercase tracking-wide px-1.5 py-[1px] rounded-full", STATUS_STYLES[b.status] || 'bg-white/20')}>{b.status}</span>
                                </div>
                                <p className="text-xs font-bold truncate mt-0.5">{b.customerName}</p>
                              </div>
                              {chipHeight > 60 && (
                                <div className="flex items-center gap-1 mt-auto">
                                  <Clock className="w-3 h-3 opacity-70" />
                                  <span className="text-[10px] font-medium opacity-80">{startStr} – {endStr}</span>
                                </div>
                              )}
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            );
          })}

          {/* Current Time Line */}
          {isTimeVisible && (
            <div
              className="absolute left-0 right-0 z-20 pointer-events-none flex items-center"
              style={{ top: 40 + timeLineTop }}
            >
              <div className="w-[72px] shrink-0 flex justify-end pr-1 sticky left-0 z-30">
                <span className="text-[9px] font-bold text-error bg-error/15 px-1.5 py-0.5 rounded-full">
                  {format(now, 'h:mm')}
                </span>
              </div>
              <div className="flex-1 relative h-[2px]">
                <div className="absolute -left-1 -top-[4px] w-[10px] h-[10px] rounded-full bg-error shadow-[0_0_8px_rgba(239,68,68,0.5)] animate-pulse" />
                <div className="h-[2px] bg-error/80 w-full" />
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // ═══════════════════════════════════════════════════════════════
  //  WEEK VIEW
  // ═══════════════════════════════════════════════════════════════
  const renderWeekView = () => {
    const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
    const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

    return (
      <div className="w-full bg-surface relative flex flex-col min-w-[800px] flex-1">
        {/* Header */}
        <div className="sticky top-0 z-40 bg-surface-container-high/95 backdrop-blur-xl flex items-stretch border-b border-border-strong">
          <div className="w-[140px] px-4 text-[9px] font-bold text-on-surface-variant uppercase tracking-widest sticky left-0 bg-surface-container-high/95 z-50 border-r border-border-strong flex items-center shadow-md shrink-0">
            Resources
          </div>
          <div className="flex flex-1 h-full">
            {weekDays.map(d => {
              const dayCount = activeBookings.filter(b => isSameDay(new Date(b.startTime), d)).length;
              const isToday = isDateToday(d);
              return (
                <div
                  key={d.toString()}
                  className={cn(
                    "flex-1 py-3 flex flex-col items-center justify-center border-r border-border transition-colors",
                    isToday ? "bg-primary/5" : ""
                  )}
                >
                  <span className={cn("text-[10px] font-bold uppercase tracking-widest", isToday ? "text-primary" : "text-on-surface-variant/60")}>
                    {format(d, 'EEE')}
                  </span>
                  <span className={cn(
                    "text-lg font-bold mt-0.5 w-8 h-8 flex items-center justify-center rounded-full transition-colors",
                    isToday ? "bg-primary text-on-primary" : "text-on-surface"
                  )}>
                    {format(d, 'd')}
                  </span>
                  {dayCount > 0 && (
                    <span className={cn(
                      "text-[9px] font-bold mt-1 px-2 py-0.5 rounded-full",
                      isToday ? "bg-primary/20 text-primary" : "bg-surface-container-highest text-on-surface-variant"
                    )}>
                      {dayCount} {dayCount === 1 ? 'event' : 'events'}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Rows */}
        <div className="divide-y divide-border flex-1 overflow-y-auto calendar-scroll">
          {resources.map((res) => (
            <div key={res.id} className="flex min-h-[120px] group relative">
              <div className="w-[140px] px-4 h-full flex flex-col justify-center bg-surface-container-high/80 sticky left-0 z-30 shadow-[4px_0_16px_-4px_rgba(0,0,0,0.2)] border-r border-border-strong shrink-0 py-3">
                <span className="text-sm font-bold text-on-surface">{res.name}</span>
                <span className="text-[9px] text-on-surface-variant/60 uppercase font-bold tracking-tight mt-0.5">{res.subType}</span>
              </div>

              <div className="flex flex-1 h-full relative">
                {weekDays.map(d => {
                  const dayBookings = activeBookings.filter(b => b.resourceId === res.id && isSameDay(new Date(b.startTime), d));
                  const isToday = isDateToday(d);

                  return (
                    <div
                      key={d.toString()}
                      className={cn(
                        "flex-1 border-r border-border p-1.5 flex flex-col gap-1 overflow-y-auto calendar-scroll group/cell transition-colors cursor-pointer",
                        isToday ? "bg-primary/[0.03]" : "hover:bg-hover-overlay"
                      )}
                      onClick={() => dayBookings.length > 0 ? openListModal(d, res.id) : openBookingModal()}
                    >
                      {dayBookings.map(b => {
                        const sportColor = getSportColor(b.sport);
                        return (
                          <motion.div
                            key={b.id}
                            initial={{ opacity: 0, y: 4 }}
                            animate={{ opacity: 1, y: 0 }}
                            onClick={(e) => { e.stopPropagation(); openBookingModal(b.id); }}
                            className={cn(
                              "text-[10px] px-2 py-1.5 rounded-lg flex flex-col gap-0.5 border cursor-pointer transition-all hover:brightness-125",
                              sportColor.bgLight, sportColor.border, sportColor.text
                            )}
                          >
                            <div className="font-bold flex items-center gap-1">
                              <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", sportColor.dot)} />
                              {format(new Date(b.startTime), 'HH:mm')} - {format(new Date(b.endTime), 'HH:mm')}
                            </div>
                            <div className="truncate text-on-surface/80 font-medium">{b.customerName}</div>
                          </motion.div>
                        );
                      })}
                      {dayBookings.length === 0 && (
                        <div className="h-full w-full flex items-center justify-center">
                          <PlusCircle className="w-4 h-4 opacity-0 group-hover/cell:opacity-15 text-on-surface transition-opacity" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // ═══════════════════════════════════════════════════════════════
  //  MONTH VIEW
  // ═══════════════════════════════════════════════════════════════
  const renderMonthView = () => {
    const monthStart = startOfMonth(selectedDate);
    const monthEnd = endOfMonth(selectedDate);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });
    const rows: React.ReactNode[] = [];

    let days: React.ReactNode[] = [];
    let day = startDate;

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const cloneDay = day;
        const formattedDate = format(cloneDay, 'd');
        const dayBookings = activeBookings.filter(b => isSameDay(new Date(b.startTime), cloneDay));
        const isInMonth = isSameMonth(cloneDay, monthStart);
        const isToday = isDateToday(cloneDay);

        // Unique sports booked on this day
        const sportSet = [...new Set(dayBookings.map(b => b.sport))];

        days.push(
          <div
            key={cloneDay.toString()}
            className={cn(
              "flex flex-col min-h-[130px] p-2 border-r border-b border-border transition-all group/day cursor-pointer",
              !isInMonth ? "bg-surface-container-lowest/20 opacity-40" : "hover:bg-hover-overlay",
              isToday && "bg-primary/[0.04] ring-1 ring-inset ring-primary/20"
            )}
            onClick={() => dayBookings.length > 0 ? openListModal(cloneDay) : openBookingModal()}
          >
            {/* Date header */}
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1.5">
                <span className={cn(
                  "text-xs font-bold w-7 h-7 flex items-center justify-center rounded-full transition-colors",
                  isToday ? "bg-primary text-on-primary shadow-lg shadow-primary/20" : "text-on-surface"
                )}>
                  {formattedDate}
                </span>
                {/* Sport dots */}
                {sportSet.length > 0 && (
                  <div className="flex items-center gap-0.5">
                    {sportSet.slice(0, 3).map(s => (
                      <span key={s} className={cn("w-1.5 h-1.5 rounded-full", getSportColor(s).dot)} />
                    ))}
                  </div>
                )}
              </div>
              {dayBookings.length > 0 && (
                <span className="text-[9px] font-bold text-on-surface-variant bg-surface-container-highest px-1.5 py-0.5 rounded-full">
                  {dayBookings.length}
                </span>
              )}
            </div>

            {/* Booking previews */}
            <div className="flex flex-col gap-0.5 overflow-hidden flex-1">
              {dayBookings.slice(0, 3).map(b => {
                const sportColor = getSportColor(b.sport);
                return (
                  <div
                    key={b.id}
                    onClick={(e) => { e.stopPropagation(); openBookingModal(b.id); }}
                    className={cn(
                      "text-[9px] px-1.5 py-[3px] rounded flex items-center gap-1.5 transition-all cursor-pointer",
                      "hover:brightness-125 border-l-2",
                      sportColor.bgLight, sportColor.border
                    )}
                  >
                    <span className="font-bold text-primary/80 shrink-0">{format(new Date(b.startTime), 'HH:mm')}</span>
                    <span className="truncate flex-1 font-medium text-on-surface/80">{b.customerName}</span>
                  </div>
                );
              })}
              {dayBookings.length > 3 && (
                <div className="text-[9px] font-bold text-primary/60 text-center mt-0.5 opacity-0 group-hover/day:opacity-100 transition-opacity">
                  +{dayBookings.length - 3} more
                </div>
              )}
            </div>
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div className="grid grid-cols-7" key={day.toString()}>
          {days}
        </div>
      );
      days = [];
    }

    return (
      <div className="w-full flex-1 flex flex-col bg-surface min-w-[800px]">
        <div className="grid grid-cols-7 border-b border-border-strong bg-surface-container-high/60 sticky top-0 z-10 backdrop-blur-md">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
            <div key={d} className="py-3 text-center text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/60 border-r border-border">{d}</div>
          ))}
        </div>
        <div className="flex-1 flex flex-col overflow-y-auto calendar-scroll">
          {rows}
        </div>
      </div>
    );
  };

  // ═══════════════════════════════════════════════════════════════
  //  VIEW SWITCHER DATA
  // ═══════════════════════════════════════════════════════════════
  const views: { key: CalendarViewType; label: string }[] = [
    { key: 'day', label: 'Day' },
    { key: 'week', label: 'Week' },
    { key: 'month', label: 'Month' },
  ];

  // ── Date display text ────────────────────────────────────────
  const dateDisplayText = React.useMemo(() => {
    if (calendarView === 'month') return format(selectedDate, 'MMMM yyyy');
    if (calendarView === 'week') {
      const ws = startOfWeek(selectedDate, { weekStartsOn: 1 });
      const we = addDays(ws, 6);
      if (isSameMonth(ws, we)) return `${format(ws, 'MMM d')} – ${format(we, 'd, yyyy')}`;
      return `${format(ws, 'MMM d')} – ${format(we, 'MMM d, yyyy')}`;
    }
    return format(selectedDate, 'EEEE, MMMM d, yyyy');
  }, [selectedDate, calendarView]);

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-surface">
      {/* ═══ TOOLBAR ═══════════════════════════════════════════════ */}
      <section className="px-6 py-4 flex items-center justify-between bg-surface border-b border-border shrink-0">
        {/* Left: Navigation + Date */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <button
              onClick={handlePrev}
              className="p-2 hover:bg-surface-container-high rounded-lg text-on-surface-variant hover:text-on-surface transition-colors"
              title="Previous (←)"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNext}
              className="p-2 hover:bg-surface-container-high rounded-lg text-on-surface-variant hover:text-on-surface transition-colors"
              title="Next (→)"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={jumpToToday}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-bold transition-all border",
              isTodaySelected
                ? "bg-primary/10 text-primary border-primary/20"
                : "bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface border-border"
            )}
            title="Today (T)"
          >
            Today
          </button>

          {/* Date title with animation */}
          <div className="relative overflow-hidden h-7 min-w-[260px]">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.h2
                key={dateDisplayText}
                initial={{ y: direction >= 0 ? 20 : -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: direction >= 0 ? -20 : 20, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="text-lg font-bold text-on-surface tracking-tight absolute inset-0 flex items-center"
              >
                {dateDisplayText}
              </motion.h2>
            </AnimatePresence>
          </div>
        </div>

        {/* Right: View Switcher + Block Slot */}
        <div className="flex items-center gap-3">
          {/* View switcher */}
          <div className="flex bg-surface-container-low p-[3px] rounded-xl border border-border">
            {views.map(v => (
              <button
                key={v.key}
                onClick={() => { setDirection(0); setCalendarView(v.key); }}
                className={cn(
                  "relative px-4 py-1.5 text-xs font-bold rounded-lg transition-all z-10",
                  calendarView === v.key
                    ? "text-primary"
                    : "text-on-surface-variant hover:text-on-surface"
                )}
              >
                {calendarView === v.key && (
                  <motion.div
                    layoutId="viewSwitcherBg"
                    className="absolute inset-0 bg-surface-container-high rounded-lg shadow-sm"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative">{v.label}</span>
              </button>
            ))}
          </div>

          <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-error/30 text-error hover:bg-error/10 text-xs font-bold transition-all">
            <Ban className="w-3.5 h-3.5" />
            Block Slot
          </button>
        </div>
      </section>

      {/* ═══ LEGEND ════════════════════════════════════════════════ */}
      <div className="px-6 py-1.5 flex items-center gap-5 border-b border-border bg-surface-container-low/30 shrink-0">
        {Object.entries(SPORT_COLORS).map(([sport, colors]) => (
          <span key={sport} className="flex items-center gap-1.5 text-[9px] text-on-surface-variant/70 font-medium">
            <span className={cn("w-2 h-2 rounded-full", colors.dot)} />
            {sport}
          </span>
        ))}
        <span className="flex items-center gap-1.5 text-[9px] text-on-surface-variant/70 font-medium ml-2 pl-2 border-l border-border">
          <span className="w-2 h-2 rounded hatched-pattern border border-border-strong" />
          Blocked
        </span>
      </div>

      {/* ═══ CALENDAR CONTENT ══════════════════════════════════════ */}
      <section className="flex-1 overflow-hidden flex flex-col relative bg-surface">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={calendarView}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className="flex-1 flex flex-col overflow-hidden"
          >
            {calendarView === 'day' && renderDayView()}
            {calendarView === 'week' && renderWeekView()}
            {calendarView === 'month' && renderMonthView()}
          </motion.div>
        </AnimatePresence>
      </section>

      {/* ═══ FOOTER ════════════════════════════════════════════════ */}
      <footer className="h-9 bg-surface-container-low/80 border-t border-border px-6 flex items-center justify-between z-40 shrink-0">
        <div className="flex gap-5">
          <div className="flex items-center gap-1.5">
            <CalendarIcon className="w-3 h-3 text-primary/60" />
            <span className="text-[10px] font-medium text-on-surface-variant">
              Today: <span className="text-on-surface font-bold">{todayBookingCount}</span> bookings
            </span>
          </div>
          {nextBooking && (
            <div className="flex items-center gap-1.5">
              <Zap className="w-3 h-3 text-amber-400/60" />
              <span className="text-[10px] font-medium text-on-surface-variant">
                Next: <span className="text-on-surface font-bold">{nextBooking.customerName}</span> at <span className="text-primary font-bold">{format(new Date(nextBooking.startTime), 'h:mm a')}</span>
              </span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[9px] text-on-surface-variant/40 font-medium">← → navigate · T today</span>
          <span className="text-[10px] font-mono text-on-surface-variant/50">
            {format(now, 'h:mm a')}
          </span>
        </div>
      </footer>
    </div>
  );
};
