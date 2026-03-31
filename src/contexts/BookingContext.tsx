import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { Booking, BookingStatus, Customer, ProposedBooking, Conflict, Resource } from '../types';
import { getConflicts } from '../lib/conflictEngine';
import { mockBookings, mockResources, mockCustomers } from '../data/mockData';

// ── State ─────────────────────────────────────────────────────
interface BookingState {
  bookings: Booking[];
  customers: Customer[];
  resources: Resource[];
}

// ── Actions ───────────────────────────────────────────────────
type BookingAction =
  | { type: 'CREATE_BOOKING'; payload: Booking }
  | { type: 'UPDATE_BOOKING'; payload: { id: string; patch: Partial<Booking> } }
  | { type: 'CANCEL_BOOKING'; payload: string }
  | { type: 'CHECKIN_BOOKING'; payload: string }
  | { type: 'COMPLETE_BOOKING'; payload: string }
  | { type: 'ADD_CUSTOMER'; payload: Customer };

function bookingReducer(state: BookingState, action: BookingAction): BookingState {
  switch (action.type) {
    case 'CREATE_BOOKING':
      return { ...state, bookings: [...state.bookings, action.payload] };

    case 'UPDATE_BOOKING':
      return {
        ...state,
        bookings: state.bookings.map(b =>
          b.id === action.payload.id ? { ...b, ...action.payload.patch } : b
        ),
      };

    case 'CANCEL_BOOKING':
      return {
        ...state,
        bookings: state.bookings.map(b =>
          b.id === action.payload ? { ...b, status: 'Cancelled' as BookingStatus } : b
        ),
      };

    case 'CHECKIN_BOOKING':
      return {
        ...state,
        bookings: state.bookings.map(b =>
          b.id === action.payload ? { ...b, status: 'Active' as BookingStatus } : b
        ),
      };

    case 'COMPLETE_BOOKING':
      return {
        ...state,
        bookings: state.bookings.map(b =>
          b.id === action.payload ? { ...b, status: 'Completed' as BookingStatus } : b
        ),
      };

    case 'ADD_CUSTOMER':
      return { ...state, customers: [...state.customers, action.payload] };

    default:
      return state;
  }
}

// ── Context ───────────────────────────────────────────────────
interface BookingContextValue {
  bookings: Booking[];
  customers: Customer[];
  resources: Resource[];
  createBooking: (booking: Booking) => void;
  updateBooking: (id: string, patch: Partial<Booking>) => void;
  cancelBooking: (id: string) => void;
  checkInBooking: (id: string) => void;
  completeBooking: (id: string) => void;
  addCustomer: (customer: Customer) => void;
  checkConflicts: (proposed: ProposedBooking, ignoreBookingId?: string) => Conflict[];
  getBookingsForDate: (date: Date) => Booking[];
  getBookingsForResource: (resourceId: string, date: Date) => Booking[];
  generateBookingId: () => string;
}

const BookingContext = createContext<BookingContextValue | null>(null);

// ── Provider ──────────────────────────────────────────────────
export const BookingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(bookingReducer, {
    bookings: mockBookings,
    customers: mockCustomers,
    resources: mockResources,
  });

  const createBooking = useCallback((booking: Booking) => {
    dispatch({ type: 'CREATE_BOOKING', payload: booking });
  }, []);

  const updateBooking = useCallback((id: string, patch: Partial<Booking>) => {
    dispatch({ type: 'UPDATE_BOOKING', payload: { id, patch } });
  }, []);

  const cancelBooking = useCallback((id: string) => {
    dispatch({ type: 'CANCEL_BOOKING', payload: id });
  }, []);

  const checkInBooking = useCallback((id: string) => {
    dispatch({ type: 'CHECKIN_BOOKING', payload: id });
  }, []);

  const completeBooking = useCallback((id: string) => {
    dispatch({ type: 'COMPLETE_BOOKING', payload: id });
  }, []);

  const addCustomer = useCallback((customer: Customer) => {
    dispatch({ type: 'ADD_CUSTOMER', payload: customer });
  }, []);

  const checkConflicts = useCallback(
    (proposed: ProposedBooking, ignoreBookingId?: string) => getConflicts(proposed, state.bookings.filter(b => b.id !== ignoreBookingId), state.resources),
    [state.bookings, state.resources]
  );

  const getBookingsForDate = useCallback(
    (date: Date) => {
      const dayStart = new Date(date);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(date);
      dayEnd.setHours(23, 59, 59, 999);
      return state.bookings.filter(b => {
        if (b.status === 'Cancelled') return false;
        const bStart = new Date(b.startTime);
        return bStart >= dayStart && bStart <= dayEnd;
      });
    },
    [state.bookings]
  );

  const getBookingsForResource = useCallback(
    (resourceId: string, date: Date) => {
      return getBookingsForDate(date).filter(b => b.resourceId === resourceId);
    },
    [getBookingsForDate]
  );

  const generateBookingId = useCallback(() => {
    const num = Math.floor(1000 + Math.random() * 9000);
    return `BK-${num}`;
  }, []);

  return (
    <BookingContext.Provider
      value={{
        bookings: state.bookings,
        customers: state.customers,
        resources: state.resources,
        createBooking,
        updateBooking,
        cancelBooking,
        checkInBooking,
        completeBooking,
        addCustomer,
        checkConflicts,
        getBookingsForDate,
        getBookingsForResource,
        generateBookingId,
      }}
    >
      {children}
    </BookingContext.Provider>
  );
};

// ── Hook ──────────────────────────────────────────────────────
export function useBookings(): BookingContextValue {
  const ctx = useContext(BookingContext);
  if (!ctx) throw new Error('useBookings must be used within BookingProvider');
  return ctx;
}
