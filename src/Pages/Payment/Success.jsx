import React, { useContext, useEffect, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { CartContext } from '../../Context/Cart/CartContext';
import useAxiosSecure from '../../hooks/useAxiosSecure';
import { AuthContext } from '../../Context/Auth/AuthContext';
import { groupItemsBySeller } from '../../utils/groupItemsBySeller';
import { toast } from 'react-toastify';
import { Helmet } from 'react-helmet-async';
import { pdf } from '@react-pdf/renderer';
import InvoicePDF from './InvoicePDF';
import Logo from '../../Components/Common/Logo/Logo';

const Success = () => {
  const location = useLocation();
  const { user, isUserLoading } = useContext(AuthContext);
  const { items, discountedTotal, clearCart } = useContext(CartContext);
  const [searchParams] = useSearchParams();
  const { privateApi } = useAxiosSecure();
  const navigate = useNavigate();
  const [orderData, setOrderData] = useState(null);

  const sessionId = searchParams.get('session_id');

  // Show toast and redirect if sessionId is missing
  useEffect(() => {
    if (!sessionId) {
      toast.error('Wrong Session Id');
      navigate('/cart');
    }
  }, [sessionId, navigate]);

  useEffect(() => {
    if (sessionId && !isUserLoading && user && user.email) {
      const fetchOrder = async () => {
        try {
          const orderDetails = {
            orderId: `TRK_${Date.now()}_${Math.random()
              .toString(36)
              .substr(2, 9)}`,
            buyer: user.email,
            sellersGroup: groupItemsBySeller(items),
            totalPrice: discountedTotal.toFixed(2),
            paymentStatus: 'pending',
            paymentMethod: 'stripe',
            paymentDate: new Date().toISOString(),
          };

          const response = await privateApi.post(
            `/checkout/verify-payment?session_id=${sessionId}`,
            orderDetails
          );

          if (response?.payment_success === true) {
            setOrderData(response);
            clearCart();
          } else {
            navigate('/cart');
            throw new Error('Payment not successful');
          }
        } catch (error) {
          console.error('Error fetching order:', error);
        }
      };
      fetchOrder();
    }
  }, [sessionId, isUserLoading, user]);

  if (!orderData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
        <Helmet key={location.pathname}>
          <title>Ashila | Processing Payment</title>
        </Helmet>
        <div className="max-w-md w-full">
          <div className="text-center">
            <div className="mb-8">
              <Logo />
            </div>
            <div className="relative">
              <div className="w-24 h-24 mx-auto mb-6 relative">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-blue-500 rounded-full animate-pulse"></div>
                <div className="absolute inset-2 bg-white rounded-full flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-emerald-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-3">
                Processing Your Payment
              </h2>
              <p className="text-gray-600">
                Please wait while we verify your transaction...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleDownloadPDF = async () => {
    try {
      const link = document.createElement('a');
      const blob = await pdf(
        <InvoicePDF orderData={orderData} sessionId={sessionId} />
      ).toBlob();
      const url = URL.createObjectURL(blob);
      link.href = url;
      link.download = `invoice-${sessionId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(url), 100);
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate PDF. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-blue-50 to-indigo-50">
      <Helmet key={location.pathname}>
        <title>Payment Successful | Ashila</title>
      </Helmet>

      {/* Header Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/20 to-blue-500/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8">
          <div className="text-center">
            <div className="mb-8">
              <Logo />
            </div>

            {/* Success Animation */}
            <div className="mb-8">
              <div className="w-32 h-32 mx-auto relative">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-blue-500 rounded-full animate-ping opacity-20"></div>
                <div className="absolute inset-4 bg-gradient-to-r from-emerald-400 to-blue-500 rounded-full animate-pulse"></div>
                <div className="absolute inset-8 bg-white rounded-full flex items-center justify-center">
                  <svg
                    className="w-12 h-12 text-emerald-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Payment Successful!
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Your order has been confirmed and is being processed. You'll
              receive an email confirmation shortly.
            </p>

            {/* Order ID Badge */}
            <div className="inline-flex items-center px-6 py-3 bg-white rounded-full shadow-lg border border-gray-200 mb-8">
              <span className="text-sm font-medium text-gray-500 mr-2">
                Order ID:
              </span>
              <span className="text-sm font-bold text-gray-900 font-mono">
                {sessionId}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Summary Card */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="bg-gradient-to-r from-emerald-500 to-blue-500 px-6 py-8">
                <h2 className="text-2xl font-bold text-white mb-2">
                  Order Summary
                </h2>
                <p className="text-emerald-100">
                  Order placed on{' '}
                  {new Date().toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>

              <div className="p-6">
                {/* Order Items */}
                <div className="space-y-4 mb-8">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Items Ordered
                  </h3>
                  {Array.isArray(orderData?.items?.data) &&
                    orderData.items.data.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl"
                      >
                        <div className="flex-shrink-0">
                          {item.price.product.images?.[0] ? (
                            <img
                              src={item.price.product.images[0]}
                              alt={item.description}
                              className="w-16 h-16 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="w-16 h-16 rounded-lg bg-gray-200 flex items-center justify-center">
                              <svg
                                className="w-8 h-8 text-gray-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={1}
                                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                />
                              </svg>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-gray-900 truncate">
                            {item.description}
                          </h4>
                          <p className="text-xs text-gray-500">
                            Sold by{' '}
                            {item.price.product.metadata?.seller || 'Ashila'}
                          </p>
                          <p className="text-xs text-gray-500">
                            Qty: {item.quantity} × {(item.price.unit_amount / 100).toLocaleString()} ALL
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-gray-900">
                            {(item.amount_total / 100).toLocaleString()} ALL
                          </p>
                        </div>
                      </div>
                    ))}
                </div>

                {/* Order Totals */}
                <div className="border-t border-gray-200 pt-6">
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="font-medium">
                        {(orderData.amount_subtotal / 100).toLocaleString()} ALL
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Shipping</span>
                      <span className="text-emerald-600 font-medium">Free</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold border-t border-gray-200 pt-3">
                      <span>Total</span>
                      <span className="text-emerald-600">
                        {(orderData.amount_total / 100).toLocaleString()} ALL
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Customer Info Card */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <svg
                  className="w-5 h-5 text-emerald-500 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                Customer Details
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">
                    Email
                  </p>
                  <p className="text-sm font-medium text-gray-900">
                    {orderData.customer_email}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">
                    Shipping Address
                  </p>
                  <p className="text-sm text-gray-900">
                    {orderData.shipping?.address?.line1 || 'N/A'}
                    {orderData.shipping?.address?.line2 &&
                      `, ${orderData.shipping.address.line2}`}
                    {orderData.shipping?.address?.city &&
                      `, ${orderData.shipping.address.city}`}
                    {orderData.shipping?.address?.postal_code &&
                      `, ${orderData.shipping.address.postal_code}`}
                    {orderData.shipping?.address?.country &&
                      `, ${orderData.shipping.address.country}`}
                  </p>
                </div>
              </div>
            </div>

            {/* Payment Info Card */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <svg
                  className="w-5 h-5 text-blue-500 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                  />
                </svg>
                Payment Details
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Status</span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                    <svg
                      className="-ml-0.5 mr-1.5 h-2 w-2 text-emerald-400"
                      fill="currentColor"
                      viewBox="0 0 8 8"
                    >
                      <circle cx={4} cy={4} r={3} />
                    </svg>
                    Paid
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Method</span>
                  <span className="text-sm font-medium text-gray-900">
                    {orderData.payment_method_types?.[0]
                      ? orderData.payment_method_types[0]
                          .charAt(0)
                          .toUpperCase() +
                        orderData.payment_method_types[0].slice(1)
                      : 'Credit Card'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Amount</span>
                  <span className="text-sm font-bold text-emerald-600">
                    {(orderData.amount_total / 100).toLocaleString()} ALL
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={handleDownloadPDF}
                className="w-full px-6 py-3 bg-gradient-to-r from-emerald-500 to-blue-500 text-white rounded-xl font-medium hover:from-emerald-600 hover:to-blue-600 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <span>Download Invoice</span>
              </button>

              <button
                onClick={() => navigate('/shop')}
                className="w-full px-6 py-3 bg-white text-gray-700 border-2 border-gray-200 rounded-xl font-medium hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 flex items-center justify-center space-x-2"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                <span>Continue Shopping</span>
              </button>

              <button
                onClick={() => navigate('/dashboard')}
                className="w-full px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-all duration-200 flex items-center justify-center space-x-2"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
                <span>View Orders</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Success;
