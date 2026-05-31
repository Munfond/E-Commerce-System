import type { AuthRole } from '../api/authStorage';

export type AuthUser = {
  id?: string;
  username?: string;
  email: string;
  role: AuthRole;
  roles: AuthRole[];
};

export type AuthState = {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
};

