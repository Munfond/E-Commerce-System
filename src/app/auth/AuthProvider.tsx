import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { clearAccessToken, clearRole, getAccessToken, getRole, setAccessToken, setRole, type AuthRole } from '../api/authStorage';
import { api } from '../api/client';
import { endpoints } from '../api/endpoints';
import type { AuthState, AuthUser } from './authTypes';

type LoginInput = { provider: string; email: string; password: string };

type AuthContextValue = AuthState & {
  login: (input: LoginInput) => Promise<void>;
  logout: () => void;
  setUserRole: (role: AuthRole) => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    loading: true,
  });

  useEffect(() => {
    const token = getAccessToken();
    const role = getRole();
    if (token && role) {
      // Token exists but we don't have full user data yet
      // This should be fetched from /auth/me endpoint
      setState({ token, user: null, loading: false });
    } else {
      setState({ token: null, user: null, loading: false });
    }
  }, []);

  const value = useMemo<AuthContextValue>(() => {
    return {
      ...state,
      async login(input: LoginInput) {
        const res = await api.post<{ accessToken: string; user: AuthUser }>(endpoints.auth.login, {
          provider: input.provider,
          email: input.email,
          password: input.password,
        }, { auth: false });
        const token = res.data.accessToken;
        const user = res.data.user;
        setAccessToken(token);
        setRole(user.role);
        setState({ token, user, loading: false });
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

