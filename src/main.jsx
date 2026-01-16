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

// Define default meta tags for mobile responsiveness
const defaultMeta = {
  viewport: 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover',
  'theme-color': '#A67856',
  'apple-mobile-web-app-capable': 'yes',
  'apple-mobile-web-app-status-bar-style': 'default'
};

// Register Service Worker for Background Notifications
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('Service Worker registered with scope:', registration.scope);

        // Request notification permission
        if ('Notification' in window && Notification.permission === 'default') {
          Notification.requestPermission().then((permission) => {
            console.log('Notification permission:', permission);
          });
        }
      })
      .catch((error) => {
        console.log('Service Worker registration failed:', error);
      });
  });
}

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
    <HelmetProvider defaultMeta={defaultMeta}>
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
