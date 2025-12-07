import React, { useContext } from 'react';
import { AuthContext } from '../Context/Auth/AuthContext';
import useUserRole from '../hooks/useUserRole';
import { Navigate } from 'react-router-dom';
import DataLoading from '../Components/Common/Loaders/DataLoading';

const SellerRoute = ({ children }) => {
  const { user, isUserLoading } = useContext(AuthContext);
  const { role, isLoading: roleLoading } = useUserRole();

  // Show loading while either user or role is loading
  if (isUserLoading || roleLoading) {
    return <DataLoading />;
  }

  // Only redirect if user exists but role is not seller, or if no user
  if (!user || (role && role !== 'seller')) {
    return <Navigate to="/forbidden" />;
  }

  return children;
};

export default SellerRoute;
