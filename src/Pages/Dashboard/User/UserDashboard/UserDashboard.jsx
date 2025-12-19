import React, { useContext, useMemo } from 'react';
import useAxiosSecure from '../../../../hooks/useAxiosSecure';
import { AuthContext } from '../../../../Context/Auth/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Package, Clock, CheckCircle, Truck, XCircle } from 'lucide-react';
import DataLoading from '../../../../Components/Common/Loaders/DataLoading';
import LoadingError from '../../../../Components/Common/States/LoadingError';

const UserDashboard = () => {
  const location = useLocation();
  const { user, isUserLoading } = useContext(AuthContext);
  const { privateApi } = useAxiosSecure();

  const { data: orders = [], error, isLoading } = useQuery({
    queryKey: ['user-orders', user?.email],
    enabled: !isUserLoading && !!user?.email,
    queryFn: async () => {
      try {
        const response = await privateApi.get(`/orders/buyer/${user?.email}`);
        return Array.isArray(response) ? response : [];
      } catch (err) {
        console.error('Error fetching orders:', err);
        return [];
      }
    },
    staleTime: 0,
    refetchOnMount: 'always',
  });

  // Group orders by status
  const ordersByStatus = useMemo(() => {
    const grouped = {
      pending: [],
      confirmed: [],
      shipped: [],
      delivered: [],
      cancelled: []
    };

    orders.forEach(order => {
      if (grouped[order.status]) {
        grouped[order.status].push(order);
      }
    });

    return grouped;
  }, [orders]);

  // Calculate statistics
  const stats = useMemo(() => {
    const totalOrders = orders.length;
    const pendingOrders = ordersByStatus.pending.length;
    const confirmedOrders = ordersByStatus.confirmed.length;
    const shippedOrders = ordersByStatus.shipped.length;
    const deliveredOrders = ordersByStatus.delivered.length;
    const totalSpent = orders
      .filter(o => o.status === 'delivered')
      .reduce((sum, order) => sum + (order.finalPrice || 0), 0);

    return {
      totalOrders,
      pendingOrders,
      confirmedOrders,
      shippedOrders,
      deliveredOrders,
      totalSpent
    };
  }, [orders, ordersByStatus]);

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get status badge
  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: Clock, label: 'Pending' },
      confirmed: { bg: 'bg-blue-100', text: 'text-blue-800', icon: Package, label: 'Confirmed' },
      shipped: { bg: 'bg-purple-100', text: 'text-purple-800', icon: Truck, label: 'Shipped' },
      delivered: { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle, label: 'Delivered' },
      cancelled: { bg: 'bg-red-100', text: 'text-red-800', icon: XCircle, label: 'Cancelled' }
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        <Icon size={14} />
        {config.label}
      </span>
    );
  };

  if (isUserLoading || !user?.email) {
    return <DataLoading label="Loading dashboard..." />;
  }

  if (error) {
    return <LoadingError label="Failed to load orders" showAction />;
  }

  if (isLoading) {
    return <DataLoading label="Loading orders..." />;
  }

  return (
    <div className="p-6 bg-white min-h-screen">
      <Helmet key={location.pathname}>
        <title>My Orders - User Dashboard</title>
      </Helmet>

      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Orders</h1>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          <div className="bg-white border border-gray-200 rounded-sm p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
              </div>
              <Package className="w-8 h-8 text-gray-400" />
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-sm p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pendingOrders}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-400" />
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-sm p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Confirmed</p>
                <p className="text-2xl font-bold text-blue-600">{stats.confirmedOrders}</p>
              </div>
              <Package className="w-8 h-8 text-blue-400" />
            </div>
          </div>
        </div>

        {/* Total Spent */}
        <div className="bg-gray-900 text-white rounded-sm p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-300 mb-1">Total Spent</p>
              <p className="text-3xl font-bold">{stats.totalSpent.toLocaleString()} ALL</p>
            </div>
          </div>
        </div>

        {/* Orders List */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900">Order History</h2>

          {orders.length === 0 ? (
            <div className="bg-gray-50 border border-gray-200 rounded-sm p-12 text-center">
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
              <p className="text-gray-600">Start shopping to see your orders here</p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .map((order) => (
                  <div
                    key={order._id}
                    className="bg-white border border-gray-200 rounded-sm p-6 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            Order #{order.orderNumber}
                          </h3>
                          {getStatusBadge(order.status)}
                        </div>
                        <p className="text-sm text-gray-600">
                          Placed on {formatDate(order.createdAt)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-gray-900">
                          {order.finalPrice?.toLocaleString()} ALL
                        </p>
                        {order.discountAmount > 0 && (
                          <p className="text-sm text-gray-500 line-through">
                            {order.totalPrice?.toLocaleString()} ALL
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Order Items */}
                    <div className="border-t border-gray-200 pt-4">
                      <h4 className="text-sm font-medium text-gray-900 mb-3">Items:</h4>
                      <div className="space-y-2">
                        {order.items?.map((item, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between text-sm bg-gray-50 p-2 rounded"
                          >
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">{item.itemName}</p>
                              <p className="text-gray-600">
                                Quantity: {item.quantity} × {item.price?.toLocaleString()} ALL
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-medium text-gray-900">
                                {(item.quantity * item.price)?.toLocaleString()} ALL
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Delivery Address */}
                    {order.deliveryAddress && (
                      <div className="border-t border-gray-200 pt-4 mt-4">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Delivery Address:</h4>
                        <p className="text-sm text-gray-600">
                          {order.deliveryAddress.street}, {order.deliveryAddress.city}
                          {order.deliveryAddress.postalCode && `, ${order.deliveryAddress.postalCode}`}
                        </p>
                        {order.deliveryAddress.phoneNumber && (
                          <p className="text-sm text-gray-600">Phone: {order.deliveryAddress.phoneNumber}</p>
                        )}
                      </div>
                    )}

                    {/* Tracking Number */}
                    {order.trackingNumber && (
                      <div className="border-t border-gray-200 pt-4 mt-4">
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Tracking:</span> {order.trackingNumber}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
