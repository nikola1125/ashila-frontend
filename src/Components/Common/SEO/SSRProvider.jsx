import React, { createContext, useContext, useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HelmetProvider } from 'react-helmet-async';

/**
 * SSR Provider for YMYL compliance
 * Ensures server-side rendering with proper SEO metadata
 */
const SSRContext = createContext();

export const useSSR = () => {
  const context = useContext(SSRContext);
  if (!context) {
    throw new Error('useSSR must be used within SSRProvider');
  }
  return context;
};

const SSRProvider = ({ children }) => {
  const [isSSR, setIsSSR] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Create QueryClient with SSR-friendly configuration
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        refetchOnReconnect: true,
        staleTime: 5 * 60 * 1000, // 5 minutes
        cacheTime: 10 * 60 * 1000, // 10 minutes
        retry: 1,
        // Enable SSR mode
        enabled: true,
      },
    },
  });

  useEffect(() => {
    setMounted(true);
    setIsSSR(typeof window === 'undefined');
  }, []);

  // SSR-safe data fetching
  const fetchSSRData = async (url, options = {}) => {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('SSR fetch error:', error);
      throw error;
    }
  };

  // Preload critical data for SEO
  const preloadSEOData = async (productSlug, categorySlug) => {
    if (!productSlug && !categorySlug) return null;

    try {
      const baseUrl = typeof window === 'undefined' 
        ? 'http://localhost:5000' 
        : '/api';

      const endpoints = [];
      
      if (productSlug) {
        endpoints.push(`${baseUrl}/products/slug/${productSlug}`);
      }
      
      if (categorySlug) {
        endpoints.push(`${baseUrl}/categories/${categorySlug}`);
      }

      const responses = await Promise.all(
        endpoints.map(endpoint => fetchSSRData(endpoint))
      );

      return responses;
    } catch (error) {
      console.error('Error preloading SEO data:', error);
      return null;
    }
  };

  const value = {
    isSSR,
    mounted,
    queryClient,
    fetchSSRData,
    preloadSEOData,
  };

  return (
    <SSRContext.Provider value={value}>
      <HelmetProvider>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </HelmetProvider>
    </SSRContext.Provider>
  );
};

export default SSRProvider;
