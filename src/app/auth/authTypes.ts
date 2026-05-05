import type { AuthRole } from '../api/authStorage';

export type AuthUser = {
  id: string;
  email: string;
  role: AuthRole;
};

export type AuthState = {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
};

