import type { AppProps } from 'next/app';
import { AuthProvider } from '@/contexts/AuthContext';
import { CartProvider } from '@/contexts/CartContext';
import { Toaster } from 'sonner';
import ErrorBoundary from '@/components/ErrorBoundary';
import '@/styles/globals.css';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <CartProvider>
          <Component {...pageProps} />
          <Toaster />
        </CartProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
} 