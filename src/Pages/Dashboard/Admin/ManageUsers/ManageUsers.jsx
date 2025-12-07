import { useQuery } from '@tanstack/react-query';
import React from 'react';
import useAxiosSecure from '../../../../hooks/useAxiosSecure';
import Table from './Table';

import Logo from '../../../../Components/Common/Logo/Logo';
import DataLoading from '../../../../Components/Common/Loaders/DataLoading';
import { useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

const ManageUsers = () => {
  const { privateApi } = useAxiosSecure();
  const location = useLocation();

  const {
    data: users,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['users'],
    queryFn: async () => privateApi.get('/users'),
  });

  if (isLoading) return <DataLoading label="Users" />;
  if (error)
    return (
      <div className="text-red-600 text-center py-8 font-semibold">
        Error: {error.message}
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-stone-50 py-10 px-2 md:px-8">
      <Helmet key={location.pathname}>
        <title>Manage Users</title>
      </Helmet>
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col items-center mb-8">
          <Logo />
          <h1 className="mt-4 text-3xl md:text-4xl font-extrabold text-blue-800 tracking-tight drop-shadow-sm">
            Manage Users
          </h1>
          <p className="text-blue-500 mt-2 text-lg font-medium">
            Administer all users of Ashila
          </p>
        </div>
        <div className="bg-white/90 rounded-3xl shadow-xl border border-blue-100 p-6 md:p-10">
          <Table users={users} />
        </div>
      </div>
    </div>
  );
};

export default ManageUsers;
