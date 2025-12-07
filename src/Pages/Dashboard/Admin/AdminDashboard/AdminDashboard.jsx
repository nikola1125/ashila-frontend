import React from 'react';
import useAxiosSecure from '../../../../hooks/useAxiosSecure';
import { useQuery } from '@tanstack/react-query';

import LoadingError from '../../../../Components/Common/States/LoadingError';
import EmptyArray from '../../../../Components/Common/States/EmptyArray';
import DataLoading from '../../../../Components/Common/Loaders/DataLoading';
import { useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

const AdminDashboard = () => {
  const location = useLocation();
  const { privateApi } = useAxiosSecure();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: () => privateApi.get('/orders/admin-dashboard'),
  });

  if (isLoading) {
    return <DataLoading label="Admin Dashboard" />;
  }

  if (isError) {
    return <LoadingError label="Admin Dashboard" showAction={true} />;
  }

  // If no data or all values are falsy/zero, show empty state
  if (!data || Object.values(data).every((v) => !v || v === 0)) {
    return <EmptyArray message="No dashboard data found" />;
  }

  const dashboard = Array.isArray(data) ? data[0] : data;

  return (
    <div className="p-6 md:p-10">
      <Helmet key={location.pathname}>
        <title>Admin Dashboard</title>
      </Helmet>
      <h2 className="mb-8 text-2xl md:text-3xl font-bold text-gray-800">
        Admin Dashboard
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-4">
        <div className="bg-white rounded-xl shadow-md flex flex-col items-center justify-center p-6">
          <h3 className="text-lg font-semibold text-gray-600 mb-2">
            Total Sales
          </h3>
          <p className="text-3xl font-bold text-blue-600">
            $
            {dashboard?.totalAmount?.toLocaleString(undefined, {
              minimumFractionDigits: 2,
            }) || '0.00'}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-md flex flex-col items-center justify-center p-6">
          <h3 className="text-lg font-semibold text-gray-600 mb-2">
            Total Orders
          </h3>
          <p className="text-3xl font-bold text-blue-600">
            {dashboard?.totalOrders ?? 0}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-md flex flex-col items-center justify-center p-6">
          <h3 className="text-lg font-semibold text-gray-600 mb-2">
            Total Paid
          </h3>
          <p className="text-3xl font-bold text-blue-600">
            $
            {dashboard?.totalPaid?.toLocaleString(undefined, {
              minimumFractionDigits: 2,
            }) || '0.00'}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-md flex flex-col items-center justify-center p-6">
          <h3 className="text-lg font-semibold text-gray-600 mb-2">
            Total Pending
          </h3>
          <p className="text-3xl font-bold text-blue-600">
            $
            {dashboard?.totalPending?.toLocaleString(undefined, {
              minimumFractionDigits: 2,
            }) || '0.00'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
