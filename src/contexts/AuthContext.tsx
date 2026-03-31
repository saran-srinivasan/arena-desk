import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { AppUser, UserRole } from '../types';

// ── State ─────────────────────────────────────────────────────
interface AuthState {
  user: AppUser;
}

const defaultUser: AppUser = {
  id: 'user-1',
  name: 'Alex Rivera',
  role: 'Super Admin',
  avatarUrl: 'https://picsum.photos/seed/alex/100/100',
};

// ── Actions ───────────────────────────────────────────────────
type AuthAction = { type: 'SET_ROLE'; payload: UserRole };

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'SET_ROLE':
      return { ...state, user: { ...state.user, role: action.payload } };
    default:
      return state;
  }
}

// ── Context ───────────────────────────────────────────────────
interface AuthContextValue {
  user: AppUser;
  setRole: (role: UserRole) => void;
  canAccessFinancials: () => boolean;
  canManageStaff: () => boolean;
  canAccessSettings: () => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// ── Provider ──────────────────────────────────────────────────
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, { user: defaultUser });

  const setRole = useCallback((role: UserRole) => {
    dispatch({ type: 'SET_ROLE', payload: role });
  }, []);

  const canAccessFinancials = useCallback(() => state.user.role === 'Super Admin', [state.user.role]);
  const canManageStaff = useCallback(() => state.user.role === 'Super Admin', [state.user.role]);
  const canAccessSettings = useCallback(() => state.user.role === 'Super Admin', [state.user.role]);

  return (
    <AuthContext.Provider value={{ user: state.user, setRole, canAccessFinancials, canManageStaff, canAccessSettings }}>
      {children}
    </AuthContext.Provider>
  );
};

// ── Hook ──────────────────────────────────────────────────────
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
