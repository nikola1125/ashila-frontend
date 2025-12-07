import React from 'react';
import useUserRole from '../../../hooks/useUserRole';
import AdminDashboard from '../Admin/AdminDashboard/AdminDashboard';
import UserDashboard from '../User/UserDashboard/UserDashboard';
import SellerDashboard from '../Seller/SellerDashboard/SellerDashboard';
import DataLoading from '../../../Components/Common/Loaders/DataLoading';


const DashboardRouteElement = () => {
  const { role, isLoading } = useUserRole();

  if (isLoading) return <DataLoading />;

  if (role === 'admin') return <AdminDashboard />;
  if (role === 'seller') return <SellerDashboard />;
  if (role === 'user') return <UserDashboard />;

  return <div>Unauthorized</div>;
};

export default DashboardRouteElement;
