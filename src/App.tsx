import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import { BookingProvider } from './contexts/BookingContext';
import { SessionProvider } from './contexts/SessionContext';
import AppLayout from './AppLayout';
import { DashboardView } from './views/Dashboard';
import { CalendarView } from './views/Calendar';
import { ActiveSessionsView } from './views/ActiveSessions';
import { OnboardingView } from './views/Onboarding';
import { BookingsListView } from './views/BookingsList';
import { CustomersListView } from './views/CustomersList';
import { ReportsView } from './views/Reports';
import { SettingsView } from './views/Settings';
import { ProtectedRoute } from './components/ProtectedRoute';

export default function App() {
  return (
    <ThemeProvider>
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <BookingProvider>
            <SessionProvider>
              <Routes>
              <Route element={<AppLayout />}>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<DashboardView />} />
                <Route path="/calendar" element={<CalendarView />} />
                <Route path="/sessions" element={<ActiveSessionsView />} />
                <Route path="/bookings" element={<BookingsListView />} />
                <Route path="/customers" element={<CustomersListView />} />
                <Route path="/onboard" element={<OnboardingView />} />
                <Route
                  path="/reports"
                  element={
                    <ProtectedRoute requiredRole="Super Admin">
                      <ReportsView />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/settings"
                  element={
                    <ProtectedRoute requiredRole="Super Admin">
                      <SettingsView />
                    </ProtectedRoute>
                  }
                />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Route>
            </Routes>
          </SessionProvider>
        </BookingProvider>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
    </ThemeProvider>
  );
}
