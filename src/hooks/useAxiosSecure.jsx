import { useMemo } from 'react';
import axios from 'axios';
import { auth } from '../Services/firebase.config';

const normalizeBaseUrl = (value) => {
  if (!value) return '';
  const trimmed = String(value).trim();
  return trimmed.replace(/\/+$/, '');
};

const createClient = ({ baseURL, timeoutMs }) => {
  const instance = axios.create({
    baseURL,
    timeout: timeoutMs,
    headers: {
      'Accept': 'application/json',
    },
  });

  // Keep existing code expectations: `publicApi.get()` returns `data`, not AxiosResponse.
  instance.interceptors.response.use(
    (res) => res?.data,
    (error) => {
      // Add mobile debugging
      if (typeof window !== 'undefined') {
        console.log('API Error:', {
          status: error?.response?.status,
          url: error?.config?.url,
          method: error?.config?.method,
          userAgent: navigator?.userAgent,
          isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
        });
      }
      return Promise.reject(error);
    }
  );

  return instance;
};

const useAxiosSecure = () => {
  const baseURL = normalizeBaseUrl(import.meta.env.VITE_BASE_API) || 'http://localhost:5001';
  const timeoutMs = 30000; // Increased from 15s to 30s for Render cold starts

  console.log('--- API CONFIG ---');
  console.log('Base URL:', baseURL);

  const publicApi = useMemo(() => createClient({ baseURL, timeoutMs }), [baseURL]);

  const privateApi = useMemo(() => {
    const client = createClient({ baseURL, timeoutMs });

    client.interceptors.request.use(async (config) => {
      const nextConfig = { ...config };
      nextConfig.headers = { ...(config?.headers || {}) };

      try {
        // 1. Check for Admin Token (Custom Auth)
        const adminToken = localStorage.getItem('adminToken') || sessionStorage.getItem('adminToken');
        if (adminToken) {
          nextConfig.headers.Authorization = `Bearer ${adminToken}`;
        } else {
          // 2. Fallback to Firebase Token (Client Auth)
          const user = auth?.currentUser;
          if (user) {
            const token = await user.getIdToken();
            if (token) {
              nextConfig.headers.Authorization = `Bearer ${token}`;
            }
          }
        }
      } catch {
        // ignore token issues; request will proceed unauthenticated
      }

      return nextConfig;
    });

    return client;
  }, [baseURL]);

  return { publicApi, privateApi };
};

export default useAxiosSecure;