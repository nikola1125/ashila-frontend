import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import DataLoading from '../Components/Common/Loaders/DataLoading';
import useAxiosSecure from '../hooks/useAxiosSecure';

const getAdminToken = () => {
  try {
    const token =
      localStorage.getItem('adminToken') || sessionStorage.getItem('adminToken');
    if (!token) return null;
    const normalized = String(token).trim();
    if (!normalized) return null;
    if (normalized === 'null' || normalized === 'undefined') return null;
    return normalized;
  } catch {
    return null;
  }
};

const AdminTokenRoute = ({ children }) => {
  const location = useLocation();
  const { publicApi } = useAxiosSecure();

  const token = getAdminToken();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin-token-check', token],
    enabled: !!token,
    queryFn: async () =>
      publicApi.get('/admin/auth/check', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
    retry: false,
    staleTime: 0,
    cacheTime: 0,
    refetchOnMount: 'always',
  });

  if (!token) {
    return <Navigate to="/admin-login" state={{ from: location }} replace />;
  }

  if (isLoading) {
    return <DataLoading label="Admin" />;
  }

  if (isError || !data?.ok) {
    return <Navigate to="/admin-login" state={{ from: location }} replace />;
  }

  return children;
};

export default AdminTokenRoute;
