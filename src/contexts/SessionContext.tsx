import React, { createContext, useContext, useReducer, useCallback, useEffect, useRef } from 'react';
import { ActiveSession, SessionSeverity, Booking } from '../types';
import { mockSessions } from '../data/mockData';

// ── Helpers ───────────────────────────────────────────────────
export function deriveSeverity(remainingSeconds: number): SessionSeverity {
  if (remainingSeconds < 0) return 'overstay';
  if (remainingSeconds < 300) return 'red';       // < 5 min
  if (remainingSeconds < 600) return 'amber';     // < 10 min
  return 'green';
}

function computeRemaining(endTime: string): number {
  return Math.floor((new Date(endTime).getTime() - Date.now()) / 1000);
}

// ── State ─────────────────────────────────────────────────────
interface SessionState {
  sessions: ActiveSession[];
}

// ── Actions ───────────────────────────────────────────────────
type SessionAction =
  | { type: 'TICK' }
  | { type: 'ADD_SESSION'; payload: ActiveSession }
  | { type: 'REMOVE_SESSION'; payload: string }
  | { type: 'EXTEND_SESSION'; payload: { bookingId: string; additionalMinutes: number } };

function sessionReducer(state: SessionState, action: SessionAction): SessionState {
  switch (action.type) {
    case 'TICK':
      return {
        ...state,
        sessions: state.sessions.map(s => {
          const remaining = computeRemaining(s.endTime);
          return {
            ...s,
            remainingSeconds: remaining,
            isOverstay: remaining < 0,
            severity: deriveSeverity(remaining),
          };
        }),
      };

    case 'ADD_SESSION':
      return { ...state, sessions: [...state.sessions, action.payload] };

    case 'REMOVE_SESSION':
      return {
        ...state,
        sessions: state.sessions.filter(s => s.bookingId !== action.payload),
      };

    case 'EXTEND_SESSION':
      return {
        ...state,
        sessions: state.sessions.map(s => {
          if (s.bookingId !== action.payload.bookingId) return s;
          const newEnd = new Date(
            new Date(s.endTime).getTime() + action.payload.additionalMinutes * 60 * 1000
          ).toISOString();
          const remaining = computeRemaining(newEnd);
          return {
            ...s,
            endTime: newEnd,
            remainingSeconds: remaining,
            isOverstay: remaining < 0,
            severity: deriveSeverity(remaining),
          };
        }),
      };

    default:
      return state;
  }
}

// ── Context ───────────────────────────────────────────────────
interface SessionContextValue {
  sessions: ActiveSession[];
  checkIn: (booking: Booking) => void;
  checkOut: (bookingId: string) => void;
  extend: (bookingId: string, additionalMinutes: number) => void;
}

const SessionContext = createContext<SessionContextValue | null>(null);

// ── Provider ──────────────────────────────────────────────────
export const SessionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(sessionReducer, {
    sessions: mockSessions.map(s => ({
      ...s,
      severity: deriveSeverity(s.remainingSeconds) as SessionSeverity,
    })),
  });

  // Global timer — single interval for all sessions
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      dispatch({ type: 'TICK' });
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const checkIn = useCallback((booking: Booking) => {
    const remaining = computeRemaining(booking.endTime);
    const session: ActiveSession = {
      bookingId: booking.id,
      customerId: booking.customerId,
      customerName: booking.customerName,
      sport: booking.sport,
      resourceId: booking.resourceId,
      resourceName: booking.resourceName,
      startTime: booking.startTime,
      endTime: booking.endTime,
      remainingSeconds: remaining,
      isOverstay: remaining < 0,
      severity: deriveSeverity(remaining),
    };
    dispatch({ type: 'ADD_SESSION', payload: session });
  }, []);

  const checkOut = useCallback((bookingId: string) => {
    dispatch({ type: 'REMOVE_SESSION', payload: bookingId });
  }, []);

  const extend = useCallback((bookingId: string, additionalMinutes: number) => {
    dispatch({ type: 'EXTEND_SESSION', payload: { bookingId, additionalMinutes } });
  }, []);

  return (
    <SessionContext.Provider value={{ sessions: state.sessions, checkIn, checkOut, extend }}>
      {children}
    </SessionContext.Provider>
  );
};

// ── Hook ──────────────────────────────────────────────────────
export function useSessions(): SessionContextValue {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSessions must be used within SessionProvider');
  return ctx;
}
