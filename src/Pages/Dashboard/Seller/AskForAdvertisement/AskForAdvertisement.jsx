import React, { useContext, useState } from 'react';
import { AuthContext } from '../../../../Context/Auth/AuthContext';
import useAxiosSecure from '../../../../hooks/useAxiosSecure';
import { useQuery } from '@tanstack/react-query';
import EmptyArray from '../../../../Components/Common/States/EmptyArray';
import DataLoading from '../../../../Components/Common/Loaders/DataLoading';
import LoadingError from '../../../../Components/Common/States/LoadingError';
import Modal from './Modal';
import { Button } from '@headlessui/react';
import Table from './Table';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';

const AskForAdvertisement = () => {
  const location = useLocation();
  const { user, isUserLoading } = useContext(AuthContext);
  const { privateApi } = useAxiosSecure();

  const {
    data: ads = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['ads', user?.email],
    enabled: !isUserLoading && !!user?.email,
    queryFn: () => privateApi.get(`/ads/seller?email=${user.email}`),
  });

  // modal logic
  let [isOpen, setIsOpen] = useState(false);
  function open() {
    setIsOpen(true);
  }
  function close() {
    setIsOpen(false);
  }

  if (isLoading || isUserLoading) {
    return <DataLoading label="advertisements" />;
  }
  if (error) {
    return <LoadingError label="advertisements" showAction />;
  }

  return (
    <div className="min-h-[80vh] bg-gradient-to-br from-cyan-50 via-white to-stone-50">
      <Helmet key={location.pathname}>
        <title>Ask For Advertisement</title>
      </Helmet>
      {/* Header */}
      <div className="max-w-3xl mx-auto mb-8 flex flex-col items-center text-center">
        <div className="bg-cyan-100 rounded-full shadow mb-3">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-10 w-10 text-cyan-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 17v-2a2 2 0 012-2h2a2 2 0 012 2v2m-6 0h6m-6 0a2 2 0 01-2-2v-2a2 2 0 012-2h6a2 2 0 012 2v2a2 2 0 01-2 2m-6 0v1a2 2 0 002 2h2a2 2 0 002-2v-1"
            />
          </svg>
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold text-cyan-700 mb-2 tracking-tight">
          Manage Your Advertisements
        </h1>
        <p className="text-cyan-500 max-w-xl">
          Promote your medicine shop and reach more customers with Ashila's
          advertisement feature. Add, view, and manage your shop's ads easily.
        </p>
      </div>
      {/* Content Card */}
      <div className="max-w-3xl mx-auto bg-white/90 rounded-2xl shadow-lg border border-cyan-100 sm:p-4 md:p-8">
        {!ads || ads.length === 0 ? (
          <>
            <EmptyArray message="No advertisements found." />
            <div className="flex justify-center mb-6">
              <Button
                onClick={open}
                className="rounded-lg bg-cyan-600 px-6 py-2 text-lg font-bold text-white shadow-md hover:bg-cyan-700 focus:ring-2 focus:ring-cyan-400 transition-colors"
              >
                Add Advertise
              </Button>
            </div>
          </>
        ) : (
          <>
            <Table ads={ads} />
            <div className="flex justify-center my-6">
              <Button
                onClick={open}
                className="rounded-lg bg-cyan-600 px-6 py-2 text-lg font-bold text-white shadow-md hover:bg-cyan-700 focus:ring-2 focus:ring-cyan-400 transition-colors"
              >
                Add Advertise
              </Button>
            </div>
          </>
        )}
      </div>
      {/* Modal rendered once, always present */}
      <Modal isOpen={isOpen} close={close} refetch={refetch} />
    </div>
  );
};

export default AskForAdvertisement;
