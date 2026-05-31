import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { clearAccessToken, clearRole, getAccessToken, getRole, setAccessToken, setRole, type AuthRole } from '../api/authStorage';
import { api } from '../api/client';
import { endpoints } from '../api/endpoints';
import type { AuthState, AuthUser } from './authTypes';

type LoginInput = { email: string; password: string };
type RawAuthUser = {
  id?: string;
  username?: string;
  email: string;
  roles: string[];
};

type AuthContextValue = AuthState & {
  login: (input: LoginInput) => Promise<AuthUser>;
  logout: () => void;
  setUserRole: (role: AuthRole) => void;
  setSession: (token: string, user: AuthUser) => void;
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

    if (!token || !role) {
      setState({ token: null, user: null, loading: false });
      return;
    }

    let isMounted = true;
    setState({ token, user: null, loading: true });

    api
      .get<AuthUser>(endpoints.auth.me, { auth: true })
      .then((res) => {
        if (!isMounted) return;
        setState({ token, user: res.data, loading: false });
      })
      .catch(() => {
        if (!isMounted) return;
        clearAccessToken();
        clearRole();
        setState({ token: null, user: null, loading: false });
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const value = useMemo<AuthContextValue>(() => {
    return {
      ...state,
      async login(input: LoginInput) {
        const res = await api.post<{ message: string; data: { accessToken: string; user: RawAuthUser } }>(
          endpoints.auth.login,
          {
            email: input.email,
            password: input.password,
          },
          { auth: false }
        );
        const token = res.data.data.accessToken;
        const rawUser = res.data.data.user;
        const role = rawUser.roles.includes('customer')
          ? 'user'
          : rawUser.roles.includes('seller')
          ? 'seller'
          : rawUser.roles.includes('admin')
          ? 'admin'
          : 'user';
        const user: AuthUser = {
          id: rawUser.id ?? '',
          username: rawUser.username,
          email: rawUser.email,
          role,
          roles: rawUser.roles.filter((r): r is AuthRole => r === 'user' || r === 'seller' || r === 'admin'),
        };
        setAccessToken(token);
        setRole(user.role);
        setState({ token, user, loading: false });
        return user;
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
      setSession(token: string, user: AuthUser) {
        setAccessToken(token);
        setRole(user.role);
        setState({ token, user, loading: false });
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

