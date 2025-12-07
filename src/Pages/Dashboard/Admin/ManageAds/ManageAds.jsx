import React from 'react';
import useAxiosSecure from '../../../../hooks/useAxiosSecure';
import { useQuery } from '@tanstack/react-query';
import DataLoading from '../../../../Components/Common/Loaders/DataLoading';
import LoadingError from '../../../../Components/Common/States/LoadingError';
import EmptyArray from '../../../../Components/Common/States/EmptyArray';
import AdsTable from './AdsTable';
import { Brain } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

const ManageAds = () => {
  const location = useLocation;
  const { privateApi } = useAxiosSecure();
  const {
    data: adsData = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['ads'],
    queryFn: () => privateApi.get('/ads'),
  });

  const [ads, setAds] = React.useState([]);

  React.useEffect(() => {
    setAds(adsData);
  }, [adsData]);

  const handleStatusChange = (updatedAd) => {
    setAds((prevAds) =>
      prevAds.map((ad) => (ad._id === updatedAd._id ? updatedAd : ad))
    );
  };

  if (isLoading) {
    return <DataLoading label="advertisements" />;
  }

  if (error) {
    return <LoadingError label="advertisements" showAction={true} />;
  }

  if (!ads.length) {
    return <EmptyArray message="No advertisements found" />;
  }

  return (
    <div className="max-w-5xl mx-auto mt-8">
      <Helmet key={location.pathname}>
        <title>Manage Ads</title>
      </Helmet>
      <div className="flex flex-col sm:flex-row items-center gap-3 mb-6">
        <span className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-gradient-to-tr from-blue-200 to-stone-200 shadow">
          <Brain className="h-7 w-7 text-blue-600" />
        </span>
        <h2 className="text-3xl font-extrabold text-blue-800 tracking-tight text-center">
          Manage Advertisements
        </h2>
      </div>
      <AdsTable ads={ads} onStatusChange={handleStatusChange} />
    </div>
  );
};

export default ManageAds;
