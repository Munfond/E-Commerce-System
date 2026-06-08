import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  clearAccessToken,
  clearRefreshToken,
  clearRole,
  getAccessToken,
  getRefreshToken,
  getRole,
  setAccessToken,
  setRefreshToken,
  setRole,
  type AuthRole,
} from '../api/authStorage';
import { api } from '../api/client';
import { endpoints } from '../api/endpoints';
import type { AuthState, AuthUser } from './authTypes';

type LoginInput = { email: string; password: string };
type RawAuthUser = {
  id?: string;
  username?: string;
  fullName?: string;
  email?: string;
  roles?: string[];
  avatarUrl?: string;
};

type AuthContextValue = AuthState & {
  login: (input: LoginInput) => Promise<AuthUser>;
  logout: () => void;
  setUserRole: (role: AuthRole) => void;
  setSession: (token: string, user: AuthUser, refreshToken?: string) => void;
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
    const refreshToken = getRefreshToken();

    const clearSession = () => {
      clearAccessToken();
      clearRefreshToken();
      clearRole();
      setState({ token: null, user: null, loading: false });
    };

    const fetchProfile = async (accessToken: string) => {
      const res = await api.get<AuthUser | { data: AuthUser }>(endpoints.auth.me, { auth: true });
      const payload = 'data' in res.data ? res.data.data : res.data;
      const rawUser = payload as RawAuthUser;
      const role = rawUser.roles?.includes('seller')
        ? 'seller'
        : rawUser.roles?.includes('admin')
        ? 'admin'
        : rawUser.roles?.includes('customer')
        ? 'user'
        : rawUser.email || rawUser.fullName
        ? getRole()
        : undefined;

      if (!role) {
        throw new Error('No user role');
      }

      const user: AuthUser = {
        id: rawUser.id ?? '',
        username: rawUser.username ?? rawUser.fullName,
        email: rawUser.email ?? '',
        role,
        roles: rawUser.roles?.filter((r): r is AuthRole => r === 'user' || r === 'seller' || r === 'admin') ?? [role],
        avatarUrl: rawUser.avatarUrl,
      };

      return user;
    };

    const refreshAndFetch = async () => {
      if (!refreshToken) throw new Error('No refresh token');
      const refreshRes = await api.post<
        | { accessToken: string; refreshToken?: string; expiresIn: number }
        | { data: { accessToken: string; refreshToken?: string; expiresIn: number } }
      >(
        endpoints.auth.refresh,
        { refreshToken },
        { auth: false }
      );
      const refreshPayload = 'data' in refreshRes.data ? refreshRes.data.data : refreshRes.data;
      const newToken = refreshPayload.accessToken;
      const newRefreshToken = refreshPayload.refreshToken;
      if (!newToken) throw new Error('Refresh failed');
      setAccessToken(newToken);
      if (newRefreshToken) {
        setRefreshToken(newRefreshToken);
      }
      const user = await fetchProfile(newToken);
      if (!isMounted) return;
      if (!user.role) {
        clearSession();
        return;
      }
      setRole(user.role);
      setState({ token: newToken, user, loading: false });
    };

    const restoreSession = async () => {
      if (token) {
        setState({ token, user: null, loading: true });
        try {
          const user = await fetchProfile(token);
          if (!isMounted) return;
          setState({ token, user, loading: false });
        } catch {
          if (!refreshToken) {
            clearSession();
            return;
          }
          await refreshAndFetch().catch(() => {
            if (!isMounted) return;
            clearSession();
          });
        }
      } else if (refreshToken) {
        setState({ token: null, user: null, loading: true });
        await refreshAndFetch().catch(() => {
          if (!isMounted) return;
          clearSession();
        });
      } else {
        clearSession();
      }
    };

    let isMounted = true;
    void restoreSession();

    return () => {
      isMounted = false;
    };
  }, []);

  const value = useMemo<AuthContextValue>(() => {
    return {
      ...state,
      async login(input: LoginInput) {
        const res = await api.post<
          | { message: string; data: { accessToken: string; refreshToken?: string; user: RawAuthUser } }
          | { accessToken: string; refreshToken?: string; user: RawAuthUser }
        >(
          endpoints.auth.login,
          {
            email: input.email,
            password: input.password,
          },
          { auth: false }
        );

        const rawData = 'data' in res.data ? res.data.data : res.data;
        const token = rawData.accessToken;
        const refreshToken = rawData.refreshToken;
        const rawUser = rawData.user;
        const role = rawUser.roles.includes('seller')
          ? 'seller'
          : rawUser.roles.includes('admin')
          ? 'admin'
          : rawUser.roles.includes('customer')
          ? 'user'
          : 'user';
        const user: AuthUser = {
          id: rawUser.id ?? '',
          username: rawUser.username ?? rawUser.fullName,
          fullName: rawUser.fullName ?? rawUser.username,
          email: rawUser.email ?? '',
          role,
          roles: rawUser.roles.filter((r): r is AuthRole => r === 'user' || r === 'seller' || r === 'admin'),
          avatarUrl: rawUser.avatarUrl,
        };
        setAccessToken(token);
        if (refreshToken) {
          setRefreshToken(refreshToken);
        }
        setRole(user.role);
        setState({ token, user, loading: false });
        return user;
      },
      logout() {
        void api.post<{ success: boolean }>(endpoints.auth.logout, undefined, { auth: true }).catch(() => {
          // ignore logout errors, clear local session regardless
        });
        clearAccessToken();
        clearRefreshToken();
        clearRole();
        setState({ token: null, user: null, loading: false });
      },
      setUserRole(role: AuthRole) {
        setRole(role);
        setState((prev) => (prev.user ? { ...prev, user: { ...prev.user, role } } : prev));
      },
      setSession(token: string, user: AuthUser, refreshToken?: string) {
        setAccessToken(token);
        if (refreshToken) {
          setRefreshToken(refreshToken);
        }
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

