import React from 'react';
import { useQuery } from '@tanstack/react-query';
import useAxiosSecure from '../../hooks/useAxiosSecure';
import DataLoading from '../../Components/Common/Loaders/DataLoading';
import LoadingError from '../../Components/Common/States/LoadingError';
import SectionHeader from '../components/SectionHeader';
import StatCard from '../components/StatCard';

const Overview = () => {
  const { privateApi } = useAxiosSecure();

  const dashboardQuery = useQuery({
    queryKey: ['admin-v2', 'overview', 'dashboard'],
    queryFn: () => privateApi.get('/orders/admin-dashboard'),
  });

  const isLoading = dashboardQuery.isLoading;
  const isError = dashboardQuery.isError;

  if (isLoading) return <DataLoading label="Overview" />;
  if (isError) return <LoadingError label="Overview" showAction={true} />;

  const dashboard = dashboardQuery.data || {};

  return (
    <div className="space-y-8">
      <SectionHeader
        title="Dashboard Overview"
        subtitle="Quick view of products, inventory alerts, orders and revenue"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total orders" value={dashboard.totalOrders ?? 0} />
        <StatCard title="Total revenue" value={`${Number(dashboard.totalAmount || 0).toLocaleString()} ALL`} />
        <StatCard title="Total paid" value={`${Number(dashboard.totalPaid || 0).toLocaleString()} ALL`} />
        <StatCard title="Total pending" value={`${Number(dashboard.totalPending || 0).toLocaleString()} ALL`} />
      </div>
    </div>
  );
};

export default Overview;
