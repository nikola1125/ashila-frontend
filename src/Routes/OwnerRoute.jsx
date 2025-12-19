import React, { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import DataLoading from '../Components/Common/Loaders/DataLoading';
import { AuthContext } from '../Context/Auth/AuthContext';
import useAxiosSecure from '../hooks/useAxiosSecure';

const OwnerRoute = ({ children }) => {
  const location = useLocation();
  const { user, isUserLoading } = useContext(AuthContext);
  const { privateApi } = useAxiosSecure();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['owner-check', user?.uid],
    enabled: !isUserLoading && !!user,
    queryFn: async () => privateApi.get('/owner/check'),
    retry: false,
  });

  if (isUserLoading || isLoading) {
    return <DataLoading />;
  }

  if (!user) {
    return <Navigate to="/admin-login" state={{ from: location }} replace />;
  }

  if (isError || !data?.ok) {
    return <Navigate to="/admin-login" state={{ from: location }} replace />;
  }

  return children;
};

export default OwnerRoute;
