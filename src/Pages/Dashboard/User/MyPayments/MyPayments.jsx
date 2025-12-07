import React, { useContext } from 'react';
import Payments from '../../../../Components/Common/Payments/Payments';
import useAxiosSecure from '../../../../hooks/useAxiosSecure';
import { AuthContext } from '../../../../Context/Auth/AuthContext';
import { useQuery } from '@tanstack/react-query';

import LoadingError from '../../../../Components/Common/States/LoadingError';
import DataLoading from '../../../../Components/Common/Loaders/DataLoading';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';

const MyPayments = () => {
  const location = useLocation()
  const { privateApi } = useAxiosSecure();
  const { user } = useContext(AuthContext);

  const { data, isLoading, error } = useQuery({
    queryKey: ['payments', user?.email],
    queryFn: () => privateApi.get(`/payments?email=${user?.email}`),
  });

  if (isLoading) {
    return <DataLoading label="Payments" />;
  }

  if (error) {
    return <LoadingError label="payments" showAction={true} />;
  }
  return <>
  <Helmet key={location.pathname}>
        <title>My payments</title>
      </Helmet>
  <Payments payments={data} /></>;
};

export default MyPayments;
