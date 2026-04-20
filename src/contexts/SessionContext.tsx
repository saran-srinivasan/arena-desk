import React, { createContext, useContext, useReducer, useCallback, useEffect, useRef } from 'react';
import { ActiveSession, SessionSeverity, Booking } from '../types';
import { sessionApi } from '../api/sessionApi';

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
  loading: boolean;
}

// ── Actions ───────────────────────────────────────────────────
type SessionAction =
  | { type: 'TICK' }
  | { type: 'SET_SESSIONS'; payload: ActiveSession[] }
  | { type: 'ADD_SESSION'; payload: ActiveSession }
  | { type: 'REMOVE_SESSION'; payload: string }
  | { type: 'UPDATE_SESSION'; payload: ActiveSession }
  | { type: 'SET_LOADING'; payload: boolean };

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

    case 'SET_SESSIONS':
      return { ...state, sessions: action.payload, loading: false };

    case 'SET_LOADING':
      return { ...state, loading: action.payload };

    case 'ADD_SESSION':
      return { ...state, sessions: [...state.sessions, action.payload] };

    case 'REMOVE_SESSION':
      return {
        ...state,
        sessions: state.sessions.filter(s => s.bookingId !== action.payload),
      };

    case 'UPDATE_SESSION':
      return {
        ...state,
        sessions: state.sessions.map(s =>
          s.bookingId === action.payload.bookingId ? action.payload : s
        ),
      };

    default:
      return state;
  }
}

// ── Context ───────────────────────────────────────────────────
interface SessionContextValue {
  sessions: ActiveSession[];
  loading: boolean;
  checkIn: (booking: Booking) => void;
  checkOut: (bookingId: string) => void;
  extend: (bookingId: string, additionalMinutes: number) => void;
  refreshSessions: () => Promise<void>;
}

const SessionContext = createContext<SessionContextValue | null>(null);

// ── Provider ──────────────────────────────────────────────────
export const SessionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(sessionReducer, {
    sessions: [],
    loading: true,
  });

  // ── Fetch initial sessions from API ─────────────────────
  const fetchSessions = useCallback(async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const sessions = await sessionApi.getAll();
      dispatch({ type: 'SET_SESSIONS', payload: sessions });
    } catch (err) {
      console.error('Failed to fetch sessions:', err);
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

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

  // Check in is now handled by BookingContext.checkInBooking() which calls the API.
  // This just adds the session to local state for immediate UI feedback.
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

  const extend = useCallback(async (bookingId: string, additionalMinutes: number) => {
    try {
      const updated = await sessionApi.extend(bookingId, additionalMinutes);
      dispatch({ type: 'UPDATE_SESSION', payload: updated });
    } catch (err) {
      console.error('Failed to extend session:', err);
    }
  }, []);

  const refreshSessions = useCallback(async () => {
    try {
      const sessions = await sessionApi.getAll();
      dispatch({ type: 'SET_SESSIONS', payload: sessions });
    } catch (err) {
      console.error('Failed to refresh sessions:', err);
    }
  }, []);

  return (
    <SessionContext.Provider value={{ sessions: state.sessions, loading: state.loading, checkIn, checkOut, extend, refreshSessions }}>
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
