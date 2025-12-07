import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import useAxiosSecure from '../../../../hooks/useAxiosSecure';
import DataLoading from '../../../../Components/Common/Loaders/DataLoading';
import LoadingError from '../../../../Components/Common/States/LoadingError';
import BestsellerTable from './BestsellerTable';
import { Helmet } from 'react-helmet-async';
import { Star } from 'lucide-react';

const ManageBestsellers = () => {
  const { privateApi } = useAxiosSecure();

  const {
    data: products,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['all-products'],
    queryFn: async () => {
      try {
        const response = await privateApi.get('/medicines');
        return Array.isArray(response) ? response : (response?.result || response || []);
      } catch (err) {
        console.error('Error fetching products:', err);
        throw err;
      }
    },
  });

  if (isLoading) {
    return <DataLoading label="Products" />;
  }

  if (error) {
    return <LoadingError label="products" showAction={true} />;
  }

  const productsList = products || [];

  return (
    <div className="p-6 md:p-10">
      <Helmet>
        <title>Manage Bestsellers</title>
      </Helmet>
      <div className="flex items-center gap-3 mb-6">
        <Star className="text-yellow-500" size={28} />
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
          Manage Bestsellers
        </h2>
      </div>
      <p className="text-gray-600 mb-6">
        Mark products as bestsellers and assign them to categories (Skincare, Hair Care, Body Care).
      </p>
      <BestsellerTable products={productsList} refetch={refetch} />
    </div>
  );
};

export default ManageBestsellers;

