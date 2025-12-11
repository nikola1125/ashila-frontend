import { useQuery } from '@tanstack/react-query';
import React, { useContext } from 'react';
import useAxiosSecure from '../../../../hooks/useAxiosSecure';
import { AuthContext } from '../../../../Context/Auth/AuthContext';
import Table from './Table';

import LoadingError from '../../../../Components/Common/States/LoadingError';
import EmptyArray from '../../../../Components/Common/States/EmptyArray';
import DataLoading from '../../../../Components/Common/Loaders/DataLoading';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';

const PaymentHistory = () => {
  const location = useLocation()
  const { privateApi } = useAxiosSecure();
  const { user, isUserLoading } = useContext(AuthContext);

  const { data, isLoading, error } = useQuery({
    queryKey: ['seller-payments-history', user?.email],
    enabled: !isUserLoading && !!user?.email,
    queryFn: () =>
      privateApi.get(
        `orders/sellers/payment-history?sellerEmail=${user.email}`
      ),
    retry: 1,
    retryDelay: 1000,
  });


  if (isLoading || isUserLoading)
    return <DataLoading label="payment history" />;
  if (error) return <LoadingError label="payment history" showAction={true} />;
  // Check if data exists and has content
  const paymentData = data || [];
  if (
    !paymentData ||
    (Array.isArray(paymentData) && paymentData.length === 0)
  ) {
    return <EmptyArray message="No payment history found" />;
  }

  return (
    <section className="max-w-4xl mx-auto">
      <Helmet key={location.pathname}>
        <title>Payment History</title>
      </Helmet>
      <div className="mb-8 flex flex-col sm:flex-row items-center gap-3">
        <div className="bg-gradient-to-tr from-stone-400 to-blue-400 rounded-full p-2 shadow-md">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-8 w-8 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 17v-2a4 4 0 014-4h3m4 4v2a4 4 0 01-4 4H7a4 4 0 01-4-4v-2a4 4 0 014-4h3m4 0V7a4 4 0 00-4-4H7a4 4 0 00-4 4v2a4 4 0 004 4h3m4 0h3a4 4 0 014 4v2a4 4 0 01-4 4H7a4 4 0 01-4-4v-2a4 4 0 014-4h3"
            />
          </svg>
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-1 text-center sm:text-left">
            Payment History
          </h1>
          <p className="text-gray-500 text-sm md:text-base text-center sm:text-left">
            Track all your medicine sales payments here.
          </p>
        </div>
      </div>
      <div className="bg-white rounded-2xl shadow-lg">
        <Table data={paymentData} />
      </div>
    </section>
  );
};

export default PaymentHistory;
