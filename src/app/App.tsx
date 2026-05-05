import { RouterProvider } from 'react-router';
import { router } from './routes';
import { AuthProvider } from './auth/AuthProvider';
import { CartProvider } from './contexts/cart';
import { Toaster } from './components/ui/sonner';

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <RouterProvider router={router} />
        <Toaster />
      </CartProvider>
    </AuthProvider>
  );
}