import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { clearAccessToken, clearRole, getAccessToken, getRole, setAccessToken, setRole, type AuthRole } from '../api/authStorage';
import { api } from '../api/client';
import { endpoints } from '../api/endpoints';
import type { AuthState, AuthUser } from './authTypes';

type LoginInput = { email: string; password: string; roleHint?: AuthRole };

type AuthContextValue = AuthState & {
  login: (input: LoginInput) => Promise<void>;
  logout: () => void;
  setUserRole: (role: AuthRole) => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function buildDemoUser(email: string, role: AuthRole): AuthUser {
  return {
    id: 'demo-user',
    email,
    role,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    loading: true,
  });

  useEffect(() => {
    const token = getAccessToken();
    const role = getRole() ?? 'user';
    if (token) {
      setState({ token, user: buildDemoUser('demo@shopviet.local', role), loading: false });
    } else {
      setState({ token: null, user: null, loading: false });
    }
  }, []);

  const value = useMemo<AuthContextValue>(() => {
    return {
      ...state,
      async login(input: LoginInput) {
        const nextRole = input.roleHint ?? (input.email.toLowerCase().includes('seller') ? 'seller' : 'user');
        // Frontend-only now uses mock API when enabled. Later backend will implement these endpoints.
        const res = await api.post<{ accessToken: string; role?: AuthRole }>(endpoints.auth.login, {
          email: input.email,
          password: input.password,
        }, { auth: false });
        const token = res.data.accessToken;
        const role = res.data.role ?? nextRole;
        setAccessToken(token);
        setRole(role);
        setState({ token, user: buildDemoUser(input.email, role), loading: false });
      },
      logout() {
        clearAccessToken();
        clearRole();
        setState({ token: null, user: null, loading: false });
      },
      setUserRole(role: AuthRole) {
        setRole(role);
        setState((prev) => (prev.user ? { ...prev, user: { ...prev.user, role } } : prev));
      },
    };
  }, [state]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

