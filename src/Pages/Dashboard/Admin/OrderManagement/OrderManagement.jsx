import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Package, Truck, CheckCircle, Clock, XCircle, Eye, Volume2, VolumeX, Settings } from 'lucide-react';
import useAxiosSecure from '../../../../hooks/useAxiosSecure';
import DataLoading from '../../../../Components/Common/Loaders/DataLoading';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import OrderDetailsModal from './OrderDetailsModal';
import { getProductImage } from '../../../../utils/productImages';
import notificationManager from '../../../../utils/notifications';
import SoundPicker from '../../../../Components/Common/SoundPicker';

const OrderManagement = () => {
    const { privateApi } = useAxiosSecure();
    const queryClient = useQueryClient();
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [soundEnabled, setSoundEnabled] = useState(true);
    const [showSoundPicker, setShowSoundPicker] = useState(false);
    const [currentSound, setCurrentSound] = useState(notificationManager.getSelectedSound());
    const previousOrdersCount = useRef(0);

    const { data: orders = [], isLoading } = useQuery({
        queryKey: ['admin-orders'],
        queryFn: async () => {
            const res = await privateApi.get('/orders');
            return res.data || res;
        }
    });

    // Detect new orders and play notification
    useEffect(() => {
        if (orders.length > previousOrdersCount.current && previousOrdersCount.current > 0) {
            const newOrdersCount = orders.length - previousOrdersCount.current;
            if (soundEnabled) {
                // Play notification sound for each new order
                for (let i = 0; i < Math.min(newOrdersCount, 3); i++) {
                    setTimeout(() => {
                        notificationManager.playNotificationSound('order');
                    }, i * 500); // Stagger sounds for multiple orders
                }
                
                // Show browser notification
                if (newOrdersCount === 1) {
                    notificationManager.showNotification('New Order Received', 'A customer has placed a new order');
                } else {
                    notificationManager.showNotification(`${newOrdersCount} New Orders`, `${newOrdersCount} customers have placed new orders`);
                }
            }
        }
        previousOrdersCount.current = orders.length;
    }, [orders, soundEnabled]);

    const updateStatusMutation = useMutation({
        mutationFn: async ({ id, status }) => {
            await privateApi.patch(`/orders/${id}`, { status });
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['admin-orders']);
            // Also invalidate products queries to refresh stock levels
            queryClient.invalidateQueries(['admin-v2', 'products']);
            queryClient.invalidateQueries(['inventory-products']);
            toast.success('Order status updated');
        },
        onError: (err) => {
            toast.error(err.message);
        }
    });

    const handleStatusChange = (id, newStatus) => {
        updateStatusMutation.mutate({ id, status: newStatus });
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Pending': return 'bg-yellow-100 text-yellow-700';
            case 'Confirmed': return 'bg-blue-100 text-blue-700';
            case 'Shipped': return 'bg-purple-100 text-purple-700';
            case 'Completed': return 'bg-green-100 text-green-700';
            case 'Cancelled': return 'bg-red-100 text-red-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const [searchTerm, setSearchTerm] = useState('');

    const filteredOrders = orders.filter(o => {
        // 1. Status Filter
        if (statusFilter !== 'all' && o.status !== statusFilter) return false;

        // 2. Search Filter (Order #, Name, Email)
        const term = searchTerm.toLowerCase();
        const matchesSearch =
            (o.orderNumber || '').toLowerCase().includes(term) ||
            (o.buyerName || '').toLowerCase().includes(term) ||
            (o.buyerEmail || '').toLowerCase().includes(term) ||
            (new Date(o.createdAt).toLocaleDateString().includes(term)); // Simple date match

        return matchesSearch;
    });

    // Sorting: Pending first, then by Date desc
    const sortedOrders = [...filteredOrders].sort((a, b) => {
        if (a.status === 'Pending' && b.status !== 'Pending') return -1;
        if (a.status !== 'Pending' && b.status === 'Pending') return 1;
        return new Date(b.createdAt) - new Date(a.createdAt);
    });

    if (isLoading) return <DataLoading />;

    return (
        <div className="w-full">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-amber-900">Orders</h2>
                    <p className="text-amber-700 text-sm">Manage client orders and deliveries</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => {
                            setSoundEnabled(!soundEnabled);
                            if (soundEnabled) {
                                notificationManager.disable();
                            } else {
                                notificationManager.enable();
                            }
                        }}
                        className={`p-2 rounded-lg border transition-colors ${
                            soundEnabled 
                                ? 'bg-amber-100 border-amber-300 text-amber-700 hover:bg-amber-200' 
                                : 'bg-gray-100 border-gray-300 text-gray-500 hover:bg-gray-200'
                        }`}
                        title={soundEnabled ? 'Disable notification sounds' : 'Enable notification sounds'}
                    >
                        {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
                    </button>
                    <button
                        onClick={() => setShowSoundPicker(true)}
                        className="p-2 rounded-lg border border-amber-300 bg-amber-100 text-amber-700 hover:bg-amber-200 transition-colors"
                        title="Sound settings"
                    >
                        <Settings size={18} />
                    </button>
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search orders..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-4 pr-10 py-2 border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                        />
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                <XCircle size={16} />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-4 mb-2">
                {['all', 'Pending', 'Confirmed', 'Shipped', 'Completed', 'Cancelled'].map(status => (
                    <button
                        key={status}
                        onClick={() => setStatusFilter(status)}
                        className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition ${statusFilter === status ? 'bg-amber-600 text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200 hover:bg-amber-50'}`}
                    >
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                ))}
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-amber-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-amber-50 text-amber-900 text-sm font-semibold">
                        <tr>
                            <th className="p-4">Order ID</th>
                            <th className="p-4">Customer</th>
                            <th className="p-4">Items</th>
                            <th className="p-4">Total</th>
                            <th className="p-4">Date</th>
                            <th className="p-4">Status</th>
                            <th className="p-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-amber-50 text-sm">
                        {sortedOrders.map(order => (
                            <tr
                                key={order._id}
                                className="hover:bg-amber-50/50 cursor-pointer transition-colors"
                                onClick={() => setSelectedOrder(order)}
                            >
                                <td className="p-4 font-mono text-gray-500">{order.orderNumber}</td>
                                <td className="p-4">
                                    <div className="font-medium text-gray-800">{order.buyerName || 'Guest'}</div>
                                    <div className="text-xs text-gray-400">{order.buyerEmail}</div>
                                </td>
                                <td className="p-4">
                                    <div className="flex -space-x-2">
                                        {order.items.slice(0, 3).map((item, idx) => (
                                            <div key={idx} className="w-8 h-8 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-xs overflow-hidden" title={item.itemName}>
                                                {item.image || item.productId?.image || item.productId?.imageUrl ? (
                                                    <img
                                                        src={getProductImage(item.productId?.image || item.productId?.imageUrl || item.productId?.imageId || item.image, item.productId?._id || item.productId)}
                                                        alt={item.itemName}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <Package size={14} className="text-gray-400" />
                                                )}
                                            </div>
                                        ))}

                                        {order.items.length > 3 && (
                                            <div className="w-8 h-8 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-xs font-medium text-gray-500">
                                                +{order.items.length - 3}
                                            </div>
                                        )}
                                    </div>
                                </td>
                                <td className="p-4 font-bold text-gray-800">{order.finalPrice.toFixed(2)} ALL</td>
                                <td className="p-4 text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                                        {order.status}
                                    </span>
                                </td>
                                <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                                    <select
                                        value={order.status}
                                        onChange={(e) => handleStatusChange(order._id, e.target.value)}
                                        className="px-2 py-1 border border-gray-200 rounded text-xs bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                                    >
                                        <option value="Pending">Pending</option>
                                        <option value="Confirmed">Confirmed</option>
                                        <option value="Shipped">Shipped</option>
                                        <option value="Completed">Completed</option>
                                        <option value="Cancelled">Cancelled</option>
                                    </select>
                                </td>
                            </tr>
                        ))}
                        {sortedOrders.length === 0 && (
                            <tr>
                                <td colSpan="7" className="p-8 text-center text-gray-500">No orders found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {
                selectedOrder && (
                    <OrderDetailsModal
                        isOpen={!!selectedOrder}
                        onClose={() => setSelectedOrder(null)}
                        order={selectedOrder}
                    />
                )
            }
            
            {/* Sound Picker Modal */}
            <SoundPicker
                isOpen={showSoundPicker}
                onClose={() => setShowSoundPicker(false)}
                currentSound={currentSound}
                onSoundChange={(soundId) => {
                    setCurrentSound(soundId);
                    notificationManager.setSelectedSound(soundId);
                }}
            />
        </div >
    );
};

export default OrderManagement;
