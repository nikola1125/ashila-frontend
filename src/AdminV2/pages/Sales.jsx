import React from 'react';
import { useQuery } from '@tanstack/react-query';
import useAxiosSecure from '../../hooks/useAxiosSecure';
import DataLoading from '../../Components/Common/Loaders/DataLoading';
import LoadingError from '../../Components/Common/States/LoadingError';
import SectionHeader from '../components/SectionHeader';
import StatCard from '../components/StatCard';

const Sales = () => {
  const { privateApi } = useAxiosSecure();

  const ordersQuery = useQuery({
    queryKey: ['admin-v2', 'sales', 'orders'],
    queryFn: () => privateApi.get('/orders'),
  });

  if (ordersQuery.isLoading) return <DataLoading label="Sales" />;
  if (ordersQuery.isError) return <LoadingError label="Sales" showAction={true} />;

  const orders = Array.isArray(ordersQuery.data) ? ordersQuery.data : [];
  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((sum, o) => sum + Number(o.finalPrice || 0), 0);
  const avgOrderValue = totalOrders ? totalRevenue / totalOrders : 0;

  const byDay = new Map();
  for (const o of orders) {
    const d = o.createdAt ? new Date(o.createdAt) : null;
    if (!d || Number.isNaN(d.getTime())) continue;
    const key = d.toISOString().slice(0, 10);
    byDay.set(key, (byDay.get(key) || 0) + Number(o.finalPrice || 0));
  }

  const dayRows = Array.from(byDay.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .slice(-14);

  const qtyMap = new Map();
  for (const o of orders) {
    for (const item of o.items || []) {
      const key = item.itemName || String(item.productId || 'Unknown');
      qtyMap.set(key, (qtyMap.get(key) || 0) + Number(item.quantity || 0));
    }
  }

  const bestSellers = Array.from(qtyMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  const statusMap = new Map();
  for (const o of orders) {
    const s = o.status || 'unknown';
    statusMap.set(s, (statusMap.get(s) || 0) + 1);
  }
  const statusRows = Array.from(statusMap.entries()).sort((a, b) => b[1] - a[1]);

  return (
    <div className="space-y-8">
      <SectionHeader
        title="Sales & Economy"
        subtitle="Revenue, orders, and best-selling products"
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Total revenue" value={`${Number(totalRevenue).toLocaleString()} ALL`} />
        <StatCard title="Order count" value={totalOrders} />
        <StatCard
          title="Average order value"
          value={`${Number(avgOrderValue).toLocaleString(undefined, { maximumFractionDigits: 0 })} ALL`}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-amber-100 rounded-2xl shadow-sm p-5">
          <div className="font-semibold text-amber-950">Revenue per day (last 14)</div>
          <div className="mt-4 overflow-x-auto">
            <table className="table w-full">
              <thead>
                <tr>
                  <th>Date</th>
                  <th className="text-right">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {dayRows.length === 0 ? (
                  <tr>
                    <td colSpan={2} className="text-gray-500">No data.</td>
                  </tr>
                ) : (
                  dayRows.map(([d, v]) => (
                    <tr key={d}>
                      <td>{d}</td>
                      <td className="text-right">{Number(v).toLocaleString()} ALL</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white border border-amber-100 rounded-2xl shadow-sm p-5">
          <div className="font-semibold text-amber-950">Order status breakdown</div>
          <div className="mt-4 overflow-x-auto">
            <table className="table w-full">
              <thead>
                <tr>
                  <th>Status</th>
                  <th className="text-right">Count</th>
                </tr>
              </thead>
              <tbody>
                {statusRows.length === 0 ? (
                  <tr>
                    <td colSpan={2} className="text-gray-500">No data.</td>
                  </tr>
                ) : (
                  statusRows.map(([s, c]) => (
                    <tr key={s}>
                      <td className="capitalize">{s}</td>
                      <td className="text-right">{c}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="bg-white border border-amber-100 rounded-2xl shadow-sm p-5">
        <div className="font-semibold text-amber-950">Best-selling products (top 10)</div>
        <div className="mt-4 overflow-x-auto">
          <table className="table w-full">
            <thead>
              <tr>
                <th>Product</th>
                <th className="text-right">Quantity sold</th>
              </tr>
            </thead>
            <tbody>
              {bestSellers.length === 0 ? (
                <tr>
                  <td colSpan={2} className="text-gray-500">No data.</td>
                </tr>
              ) : (
                bestSellers.map(([name, qty]) => (
                  <tr key={name}>
                    <td className="font-medium">{name}</td>
                    <td className="text-right">{qty}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Sales;
