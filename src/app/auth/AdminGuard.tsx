import { Navigate, Outlet, useLocation } from 'react-router';
import { useAuth } from './AuthProvider';

export default function AdminGuard() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return null;

  if (!user) {
    const next = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?next=${next}`} replace />;
  }

  if (user.role !== 'admin' && !user.roles?.includes('admin')) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
