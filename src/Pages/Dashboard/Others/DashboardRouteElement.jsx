import React from 'react';
import useUserRole from '../../../hooks/useUserRole';
import UserDashboard from '../User/UserDashboard/UserDashboard';
import SellerDashboard from '../Seller/SellerDashboard/SellerDashboard';
import DataLoading from '../../../Components/Common/Loaders/DataLoading';
import { Navigate } from 'react-router-dom';


const DashboardRouteElement = () => {
  const { role, isLoading } = useUserRole();

  if (isLoading) return <DataLoading />;

  if (role === 'admin') return <Navigate to="/admin" replace />;
  if (role === 'seller') return <SellerDashboard />;
  if (role === 'user') return <UserDashboard />;

  return <div>Unauthorized</div>;
};

export default DashboardRouteElement;
