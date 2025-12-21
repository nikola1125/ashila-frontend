import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DollarSign, ShoppingBag, Users, TrendingUp, Package, CheckCircle, X } from 'lucide-react';
import useAxiosSecure from '../../../../hooks/useAxiosSecure';
import DataLoading from '../../../../Components/Common/Loaders/DataLoading';
import OrderDetailsModal from '../OrderManagement/OrderDetailsModal';
import { toast } from 'react-toastify';

const Economy = () => {
    const { privateApi } = useAxiosSecure();
    const queryClient = useQueryClient();
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const { data: stats, isLoading: statsLoading } = useQuery({
        queryKey: ['admin-stats'],
        queryFn: async () => {
            const res = await privateApi.get('/orders/stats/admin-dashboard');
            return res.data[0] || res[0] || {};
        },
        refetchInterval: 3000 // Real-time polling
    });

    const { data: salesReport = [] } = useQuery({
        queryKey: ['sales-report-chart'],
        queryFn: async () => {
            const res = await privateApi.get('/orders/admin/sales-report');
            return res.data || res;
        },
        refetchInterval: 5000
    });

    const { data: pendingOrders = [], isLoading: ordersLoading } = useQuery({
        queryKey: ['admin-pending-orders'],
        queryFn: async () => {
            const res = await privateApi.get('/orders');
            const allOrders = res.data || res;
            return allOrders.filter(o => o.status === 'Pending').slice(0, 5);
        },
        refetchInterval: 3000
    });

    const updateStatusMutation = useMutation({
        mutationFn: async ({ id, status }) => {
            await privateApi.patch(`/orders/${id}`, { status });
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries(['admin-pending-orders']);
            queryClient.invalidateQueries(['admin-stats']);
            queryClient.invalidateQueries(['admin-orders']);
            toast.success(`Order ${variables.status === 'Confirmed' ? 'confirmed' : 'cancelled'} successfully`);
        },
        onError: (err) => {
            toast.error(err.message);
        }
    });

    const handleQuickConfirm = (e, id, status) => {
        e.stopPropagation();
        updateStatusMutation.mutate({ id, status });
    };

    const handleRowClick = (order) => {
        setSelectedOrder(order);
        setIsModalOpen(true);
    };

    if (statsLoading || ordersLoading) return <DataLoading />;

    return (
        <div className="w-full">
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-amber-900">Dashboard Overview</h2>
                <p className="text-amber-700 text-sm">Welcome back, Admin</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.05)] border border-amber-50 flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center text-green-600">
                        <DollarSign size={28} />
                    </div>
                    <div>
                        <p className="text-gray-500 text-sm font-medium">Total Revenue</p>
                        <h3 className="text-2xl font-bold text-gray-900">{stats?.totalRevenue?.toLocaleString() || 0} ALL</h3>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.05)] border border-amber-50 flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                        <ShoppingBag size={28} />
                    </div>
                    <div>
                        <p className="text-gray-500 text-sm font-medium">Total Orders</p>
                        <h3 className="text-2xl font-bold text-gray-900">{stats?.totalOrders || 0}</h3>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.05)] border border-amber-50 flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-amber-50 flex items-center justify-center text-amber-600">
                        <Package size={28} />
                    </div>
                    <div>
                        <p className="text-gray-500 text-sm font-medium">Pending Orders</p>
                        <h3 className="text-2xl font-bold text-gray-900">{stats?.pendingOrders || 0}</h3>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.05)] border border-amber-50 flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
                        <Users size={28} />
                    </div>
                    <div>
                        <p className="text-gray-500 text-sm font-medium">Total Users</p>
                        <h3 className="text-2xl font-bold text-gray-900">{stats?.totalUsers || 0}</h3>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Pending Orders Section */}
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-amber-100">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-lg text-amber-900 flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                            Orders Needing Confirmation
                        </h3>
                        <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded-full">{pendingOrders.length} New</span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 text-gray-600 text-xs uppercase font-semibold">
                                <tr>
                                    <th className="p-3">Order ID</th>
                                    <th className="p-3">Customer</th>
                                    <th className="p-3">Total</th>
                                    <th className="p-3 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 text-sm">
                                {pendingOrders.map(order => (
                                    <tr
                                        key={order._id}
                                        className="hover:bg-amber-50/50 cursor-pointer transition"
                                        onClick={() => handleRowClick(order)}
                                    >
                                        <td className="p-3 font-mono text-gray-500">#{order.orderNumber?.slice(-6) || '...'}</td>
                                        <td className="p-3 font-medium text-gray-800">{order.buyerName}</td>
                                        <td className="p-3 font-bold text-gray-700">{order.finalPrice.toFixed(2)} ALL</td>
                                        <td className="p-3 text-right flex justify-end gap-2">
                                            <button
                                                onClick={(e) => handleQuickConfirm(e, order._id, 'Confirmed')}
                                                className="px-3 py-1 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition text-xs font-semibold flex items-center gap-1"
                                                title="Accept Order"
                                            >
                                                <CheckCircle size={14} /> Accept
                                            </button>
                                            <button
                                                onClick={(e) => handleQuickConfirm(e, order._id, 'Cancelled')}
                                                className="px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition text-xs font-semibold flex items-center gap-1"
                                                title="Decline Order"
                                            >
                                                <X size={14} /> Decline
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {pendingOrders.length === 0 && (
                                    <tr>
                                        <td colSpan="4" className="p-6 text-center text-gray-400">All orders caught up! No pending orders.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Sales Chart Section */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-amber-100">
                    <h3 className="font-bold text-lg text-amber-900 mb-6 flex items-center gap-2"><TrendingUp size={20} /> Revenue by Status</h3>
                    <div className="space-y-4">
                        {salesReport.map((item) => (
                            <div key={item._id} className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={`w-3 h-3 rounded-full ${item._id === 'Completed' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                                    <span className="text-gray-600 font-medium capitalize">{item._id || 'Unknown'}</span>
                                </div>
                                <div className="text-right">
                                    <span className="block font-bold text-gray-900">{item.totalRevenue.toLocaleString()} ALL</span>
                                    <span className="text-xs text-gray-400">{item.count} orders</span>
                                </div>
                            </div>
                        ))}
                        {salesReport.length === 0 && <p className="text-gray-400">No data available</p>}
                    </div>
                </div>
            </div>

            <OrderDetailsModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                order={selectedOrder}
            />
        </div>
    );
};

export default Economy;
