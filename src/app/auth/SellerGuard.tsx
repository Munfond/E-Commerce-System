import { Navigate, Outlet, useLocation } from 'react-router';
import { useAuth } from './AuthProvider';

export default function SellerGuard() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return null;

  if (!user) {
    const next = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?next=${next}`} replace />;
  }

  if (user.role !== 'seller') {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

