import React from 'react';
import useAxiosSecure from '../../../../hooks/useAxiosSecure';
import { useQuery } from '@tanstack/react-query';
import CategoryTable from './CategoryTable';
import DataLoading from '../../../../Components/Common/Loaders/DataLoading';
import LoadingError from '../../../../Components/Common/States/LoadingError';
import { useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

const ManageCategories = () => {
  const location = useLocation();
  const { publicApi } = useAxiosSecure();

  const {
    data: categories,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['categories'],
    queryFn: () => publicApi.get('/categories'),
  });

  if (isLoading) return <DataLoading label="Categories" />;

  if (error) return <LoadingError label="categories" showAction={true} />;

  return (
    <section className="min-h-[70vh] py-10 bg-gradient-to-br from-blue-50 via-white to-emerald-50 rounded-xl my-8 shadow-md">
      <Helmet key={location.pathname}>
        <title>Manage Categories</title>
      </Helmet>
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="flex flex-col items-center mb-8">
          <div className="flex flex-col sm:flex-row items-center gap-3 mb-2">
            <span className="bg-gradient-to-r from-primary to-secondary p-3 rounded-full shadow-lg">
              {/* You can use a relevant icon here, e.g., a medical icon */}
              <svg
                className="text-white w-7 h-7"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 4v16m8-8H4"
                ></path>
              </svg>
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-800 tracking-tight drop-shadow-sm text-center">
              Manage Categories
            </h2>
          </div>
          <p className="text-md text-gray-600 max-w-2xl text-center">
            Add, edit, or remove medicine categories for your pharmacy
            inventory.
          </p>
        </div>
        <CategoryTable categories={categories} refetch={refetch} />
      </div>
    </section>
  );
};

export default ManageCategories;
