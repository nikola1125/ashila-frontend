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
  });

  // Keep existing code expectations: `publicApi.get()` returns `data`, not AxiosResponse.
  instance.interceptors.response.use(
    (res) => res?.data,
    (error) => Promise.reject(error)
  );

  return instance;
};

const useAxiosSecure = () => {
  const baseURL = normalizeBaseUrl(import.meta.env.VITE_BASE_API);
  const timeoutMs = 15000;

  const publicApi = useMemo(() => createClient({ baseURL, timeoutMs }), [baseURL]);

  const privateApi = useMemo(() => {
    const client = createClient({ baseURL, timeoutMs });

    client.interceptors.request.use(async (config) => {
      const nextConfig = { ...config };
      nextConfig.headers = { ...(config?.headers || {}) };

      try {
        const user = auth?.currentUser;
        if (user) {
          const token = await user.getIdToken();
          if (token) {
            nextConfig.headers.Authorization = `Bearer ${token}`;
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