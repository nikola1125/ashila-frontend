import React from 'react';
import Payments from '../../../../Components/Common/Payments/Payments';
import useAxiosSecure from '../../../../hooks/useAxiosSecure';
import { useQuery } from '@tanstack/react-query';

import LoadingError from '../../../../Components/Common/States/LoadingError';
import DataLoading from '../../../../Components/Common/Loaders/DataLoading';
import { useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

const ManagePayments = () => {
  const location = useLocation()
  const { privateApi } = useAxiosSecure();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['payments'],
    queryFn: () => privateApi.get('/payments'),
  });

  if (isLoading) {
    return <DataLoading label="Payments" />;
  }

  if (error) {
    return <LoadingError label="payments" showAction={true} />;
  }

  return (
    <div>
      <Helmet key={location.pathname}>
        <title>Manage Payments</title>
      </Helmet>
      <Payments payments={data || []} refetch={refetch} />
    </div>
  );
};

export default ManagePayments;
