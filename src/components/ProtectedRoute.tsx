import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types';

interface ProtectedRouteProps {
  requiredRole: UserRole;
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ requiredRole, children }) => {
  const { user } = useAuth();

  if (requiredRole === 'Super Admin' && user.role !== 'Super Admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};
