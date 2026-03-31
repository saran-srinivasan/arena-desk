import React from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { useAuth } from './contexts/AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import { BookingFormModal } from './components/BookingFormModal';
import { BookingListModal } from './components/BookingListModal';

const viewTitles: Record<string, string> = {
  '/dashboard': 'Dashboard Overview',
  '/calendar': 'Calendar View',
  '/sessions': 'Active Sessions',
  '/bookings': 'Bookings',
  '/customers': 'Customers',
  '/onboard': 'New Customer Onboarding',
  '/reports': 'Reports & Analytics',
  '/settings': 'Settings',
};

export default function AppLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, setRole } = useAuth();
  
  const [bookingModalState, setBookingModalState] = React.useState<{isOpen: boolean, editBookingId?: string}>({isOpen: false});
  const [listModalState, setListModalState] = React.useState<{isOpen: boolean, date: Date | null, resourceId?: string}>({isOpen: false, date: null});

  const activeView = location.pathname.replace('/', '') || 'dashboard';
  const title = viewTitles[location.pathname] || activeView.charAt(0).toUpperCase() + activeView.slice(1);

  return (
    <div className="flex h-screen w-full bg-surface overflow-hidden font-sans">
      <Sidebar
        activeView={activeView}
        onViewChange={(view) => navigate(`/${view}`)}
        role={user.role}
      />

      <main className="flex-1 ml-[240px] flex flex-col min-h-screen relative">
        <Header
          title={title}
          onNewBooking={() => setBookingModalState({isOpen: true})}
          onOnboard={() => navigate('/onboard')}
        />

        <div className="flex-1 overflow-hidden flex flex-col pt-16">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex-1 flex flex-col overflow-hidden"
            >
              <Outlet context={{ 
                openBookingModal: (editBookingId?: string) => setBookingModalState({isOpen: true, editBookingId}),
                openListModal: (date: Date, resourceId?: string) => setListModalState({isOpen: true, date, resourceId})
              }} />
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Role Toggle for Demo */}
      <div className="fixed bottom-4 right-4 z-[100] flex bg-surface-container border border-border-strong rounded-full p-1 shadow-2xl">
        <button
          onClick={() => setRole('Super Admin')}
          className={`px-3 py-1 rounded-full text-[10px] font-bold transition-all ${user.role === 'Super Admin' ? 'bg-primary text-on-primary' : 'text-on-surface-variant'}`}
        >
          OWNER
        </button>
        <button
          onClick={() => setRole('Admin')}
          className={`px-3 py-1 rounded-full text-[10px] font-bold transition-all ${user.role === 'Admin' ? 'bg-primary text-on-primary' : 'text-on-surface-variant'}`}
        >
          STAFF
        </button>
      </div>

      <BookingFormModal 
        isOpen={bookingModalState.isOpen} 
        editBookingId={bookingModalState.editBookingId}
        onClose={() => setBookingModalState({isOpen: false})} 
      />
      <BookingListModal
        isOpen={listModalState.isOpen}
        date={listModalState.date}
        resourceId={listModalState.resourceId}
        onClose={() => setListModalState(prev => ({...prev, isOpen: false}))}
        onEditBooking={(id) => setBookingModalState({isOpen: true, editBookingId: id})}
      />
    </div>
  );
}
