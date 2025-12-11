import React, { useContext } from 'react';
import useUserRole from '../hooks/useUserRole';
import { Navigate } from 'react-router';
import { AuthContext } from '../Context/Auth/AuthContext';
import DataLoading from '../Components/Common/Loaders/DataLoading';

const AdminRoute = ({ children }) => {
  const { user, isUserLoading } = useContext(AuthContext)
  const { role, isLoading } = useUserRole();

  if (isUserLoading || isLoading) {
    return <DataLoading />;
  }

  if (!user || role !== 'admin') {
    return <Navigate to="/forbidden" />;
  }

  return children;
};

export default AdminRoute;
