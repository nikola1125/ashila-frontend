import React, { useContext } from 'react';
import { AuthContext } from '../Context/Auth/AuthContext';
import useAxiosSecure from './useAxiosSecure';
import { useQuery } from '@tanstack/react-query';
const useUserRole = () => {
  const { user, isUserLoading } = useContext(AuthContext);
  const { privateApi } = useAxiosSecure();

  const {
    data: role,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['userRole', user?.email],
    enabled: !isUserLoading && !!user?.email,
    queryFn: async () => {
      const res = await privateApi.get(`users/role?email=${user?.email}`);
      return res?.role || 'user';
    },
  });

  // Return default role only when not loading and user exists
  const finalRole =
    !isLoading && !isUserLoading && user ? role || 'user' : null;
  return { role: finalRole, isLoading, refetch };
};

export default useUserRole;
