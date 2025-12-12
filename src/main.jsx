import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { RouterProvider } from 'react-router-dom';
import { router } from './Routes/Router';
import AuthProvider from './Context/Auth/AuthProvider';
import { ToastContainer } from 'react-toastify';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import CartProvider from './Context/Cart/CartProvider';
import { HelmetProvider } from 'react-helmet-async';
import { SmoothScrollProvider } from './Context/SmoothScroll/SmoothScrollProvider';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: true,
      refetchOnMount: true,
      refetchOnReconnect: true,
      staleTime: 2 * 60 * 1000, // 2 minutes
      cacheTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <SmoothScrollProvider>
          <AuthProvider>
            <CartProvider>
              <RouterProvider router={router} />
            </CartProvider>
            <ToastContainer position="top-center" />
          </AuthProvider>
        </SmoothScrollProvider>
      </QueryClientProvider>
    </HelmetProvider>
  </StrictMode>
);
