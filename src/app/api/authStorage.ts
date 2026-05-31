const ACCESS_TOKEN_KEY = 'shopviet.accessToken';
const ROLE_KEY = 'shopviet.role';

export type AuthRole = 'user' | 'seller' | 'admin';
export type RawAuthRole = AuthRole | 'customer';

export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function setAccessToken(token: string) {
  window.localStorage.setItem(ACCESS_TOKEN_KEY, token);
}

export function clearAccessToken() {
  window.localStorage.removeItem(ACCESS_TOKEN_KEY);
}

export function getRole(): AuthRole | null {
  if (typeof window === 'undefined') return null;
  const raw = window.localStorage.getItem(ROLE_KEY);
  if (raw === 'user' || raw === 'seller' || raw === 'admin') return raw;
  return null;
}

export function setRole(role: AuthRole) {
  window.localStorage.setItem(ROLE_KEY, role);
}

export function clearRole() {
  window.localStorage.removeItem(ROLE_KEY);
}

