import React from 'react';
import { useQuery } from '@tanstack/react-query';
import useAxiosSecure from '../../../../hooks/useAxiosSecure';
import TanstackTable from './TanstackTable';
import { useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

const SalesReport = () => {
  const location = useLocation();
  const { privateApi } = useAxiosSecure();

  const { data } = useQuery({
    queryKey: ['sales-data'],
    queryFn: () => privateApi.get('/orders/sales-report'),
  });


  return (
    <>
      <Helmet key={location.pathname}>
        <title>Sales Report</title>
      </Helmet>
      <TanstackTable data={data} />
    </>
  );
};

export default SalesReport;
