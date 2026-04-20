import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import { Booking, BookingStatus, Customer, ProposedBooking, Conflict, Resource } from '../types';
import { getConflicts } from '../lib/conflictEngine';
import { bookingApi } from '../api/bookingApi';
import { resourceApi } from '../api/resourceApi';
import { customerApi } from '../api/customerApi';

// ── State ─────────────────────────────────────────────────────
interface BookingState {
  bookings: Booking[];
  customers: Customer[];
  resources: Resource[];
  loading: boolean;
  error: string | null;
}

// ── Actions ───────────────────────────────────────────────────
type BookingAction =
  | { type: 'SET_DATA'; payload: { bookings: Booking[]; customers: Customer[]; resources: Resource[] } }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'SET_BOOKINGS'; payload: Booking[] }
  | { type: 'SET_CUSTOMERS'; payload: Customer[] }
  | { type: 'CREATE_BOOKING'; payload: Booking }
  | { type: 'UPDATE_BOOKING'; payload: { id: string; booking: Booking } }
  | { type: 'CANCEL_BOOKING'; payload: { id: string; booking: Booking } }
  | { type: 'CHECKIN_BOOKING'; payload: { id: string; booking: Booking } }
  | { type: 'COMPLETE_BOOKING'; payload: { id: string; booking: Booking } }
  | { type: 'ADD_CUSTOMER'; payload: Customer };

function bookingReducer(state: BookingState, action: BookingAction): BookingState {
  switch (action.type) {
    case 'SET_DATA':
      return {
        ...state,
        bookings: action.payload.bookings,
        customers: action.payload.customers,
        resources: action.payload.resources,
        loading: false,
        error: null,
      };

    case 'SET_LOADING':
      return { ...state, loading: action.payload };

    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };

    case 'SET_BOOKINGS':
      return { ...state, bookings: action.payload };

    case 'SET_CUSTOMERS':
      return { ...state, customers: action.payload };

    case 'CREATE_BOOKING':
      return { ...state, bookings: [...state.bookings, action.payload] };

    case 'UPDATE_BOOKING':
      return {
        ...state,
        bookings: state.bookings.map(b =>
          b.id === action.payload.id ? action.payload.booking : b
        ),
      };

    case 'CANCEL_BOOKING':
      return {
        ...state,
        bookings: state.bookings.map(b =>
          b.id === action.payload.id ? action.payload.booking : b
        ),
      };

    case 'CHECKIN_BOOKING':
      return {
        ...state,
        bookings: state.bookings.map(b =>
          b.id === action.payload.id ? action.payload.booking : b
        ),
      };

    case 'COMPLETE_BOOKING':
      return {
        ...state,
        bookings: state.bookings.map(b =>
          b.id === action.payload.id ? action.payload.booking : b
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
  loading: boolean;
  error: string | null;
  createBooking: (booking: Booking) => Promise<void>;
  updateBooking: (id: string, patch: Partial<Booking>) => Promise<void>;
  cancelBooking: (id: string) => Promise<void>;
  checkInBooking: (id: string) => Promise<void>;
  completeBooking: (id: string) => Promise<void>;
  addCustomer: (customer: Customer) => Promise<void>;
  checkConflicts: (proposed: ProposedBooking, ignoreBookingId?: string) => Conflict[];
  getBookingsForDate: (date: Date) => Booking[];
  getBookingsForResource: (resourceId: string, date: Date) => Booking[];
  generateBookingId: () => string;
  refreshBookings: () => Promise<void>;
}

const BookingContext = createContext<BookingContextValue | null>(null);

// ── Provider ──────────────────────────────────────────────────
export const BookingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(bookingReducer, {
    bookings: [],
    customers: [],
    resources: [],
    loading: true,
    error: null,
  });

  // ── Fetch initial data from API ─────────────────────────
  const fetchAllData = useCallback(async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const [bookings, customers, resources] = await Promise.all([
        bookingApi.getAll(),
        customerApi.getAll(),
        resourceApi.getAll(),
      ]);
      dispatch({ type: 'SET_DATA', payload: { bookings, customers, resources } });
    } catch (err: any) {
      console.error('Failed to fetch data:', err);
      dispatch({ type: 'SET_ERROR', payload: err.message || 'Failed to load data' });
    }
  }, []);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // ── Mutations (API-first, then update local state) ──────
  const createBooking = useCallback(async (booking: Booking) => {
    try {
      const created = await bookingApi.create({
        customerId: booking.customerId,
        sport: booking.sport,
        resourceId: booking.resourceId,
        startTime: booking.startTime,
        endTime: booking.endTime,
        notes: booking.notes,
        createdBy: booking.createdBy,
        priceCents: booking.priceCents,
      });
      dispatch({ type: 'CREATE_BOOKING', payload: created });
    } catch (err: any) {
      console.error('Failed to create booking:', err);
      throw err;
    }
  }, []);

  const updateBooking = useCallback(async (id: string, patch: Partial<Booking>) => {
    try {
      const updated = await bookingApi.update(id, patch);
      dispatch({ type: 'UPDATE_BOOKING', payload: { id, booking: updated } });
    } catch (err: any) {
      console.error('Failed to update booking:', err);
      throw err;
    }
  }, []);

  const cancelBooking = useCallback(async (id: string) => {
    try {
      const cancelled = await bookingApi.cancel(id);
      dispatch({ type: 'CANCEL_BOOKING', payload: { id, booking: cancelled } });
    } catch (err: any) {
      console.error('Failed to cancel booking:', err);
      throw err;
    }
  }, []);

  const checkInBooking = useCallback(async (id: string) => {
    try {
      const checkedIn = await bookingApi.checkIn(id);
      dispatch({ type: 'CHECKIN_BOOKING', payload: { id, booking: checkedIn } });
    } catch (err: any) {
      console.error('Failed to check in booking:', err);
      throw err;
    }
  }, []);

  const completeBooking = useCallback(async (id: string) => {
    try {
      const completed = await bookingApi.complete(id);
      dispatch({ type: 'COMPLETE_BOOKING', payload: { id, booking: completed } });
    } catch (err: any) {
      console.error('Failed to complete booking:', err);
      throw err;
    }
  }, []);

  const addCustomer = useCallback(async (customer: Customer) => {
    try {
      const created = await customerApi.create({
        name: customer.name,
        phone: customer.phone,
        email: customer.email,
        preferredSport: customer.preferredSport,
        photoUrl: customer.photoUrl,
      });
      dispatch({ type: 'ADD_CUSTOMER', payload: created });
    } catch (err: any) {
      console.error('Failed to add customer:', err);
      throw err;
    }
  }, []);

  // ── Client-side conflict check (still uses local data for speed) ──
  const checkConflicts = useCallback(
    (proposed: ProposedBooking, ignoreBookingId?: string) =>
      getConflicts(proposed, state.bookings.filter(b => b.id !== ignoreBookingId), state.resources),
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

  // This is still used by the booking form as a temporary ID before server assigns one
  const generateBookingId = useCallback(() => {
    const num = Math.floor(1000 + Math.random() * 9000);
    return `BK-${num}`;
  }, []);

  const refreshBookings = useCallback(async () => {
    try {
      const bookings = await bookingApi.getAll();
      dispatch({ type: 'SET_BOOKINGS', payload: bookings });
    } catch (err: any) {
      console.error('Failed to refresh bookings:', err);
    }
  }, []);

  return (
    <BookingContext.Provider
      value={{
        bookings: state.bookings,
        customers: state.customers,
        resources: state.resources,
        loading: state.loading,
        error: state.error,
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
        refreshBookings,
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
