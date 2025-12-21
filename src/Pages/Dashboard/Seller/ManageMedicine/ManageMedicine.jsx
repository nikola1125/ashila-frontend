import React, { useContext, useState } from 'react';
import useAxiosSecure from '../../../../hooks/useAxiosSecure';

import { toast } from 'react-toastify';
import Table from './Table';
import { AuthContext } from '../../../../Context/Auth/AuthContext';
import { useQuery } from '@tanstack/react-query';
import Modal from './Modal';
import { useForm } from 'react-hook-form';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';

const ManageMedicine = () => {
  const location = useLocation()
  const { privateApi, publicApi } = useAxiosSecure();
  const { user, isUserLoading } = useContext(AuthContext);
  const [showModal, setShowModal] = useState(false);
  const { register, handleSubmit, reset } = useForm();
  const [loading, setLoading] = useState(false);

  // get category and company
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => publicApi.get('/categories'),
  });

  // get medicine from db
  const { data, isPending, error, refetch } = useQuery({
    queryKey: ['medicines', user?.email],
    enabled: !isUserLoading && !!user?.email,
    queryFn: async () =>
      privateApi.get(`/medicines/seller?email=${user?.email}`),
  });
  const medicinesArr = data?.medicines;

  // add medicine to db
  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('itemName', data.itemName);
      formData.append('genericName', data.genericName);
      formData.append('company', data.company);
      formData.append('categoryName', data.categoryName);
      formData.append('price', data.price);
      formData.append('discount', data.discount || 0);
      formData.append('description', data.description);
      formData.append('stock', data.stock);
      formData.append('seller', user.email);
      formData.append('dosage', data.dosage);
      formData.append('manufacturer', data.manufacturer);

      // Append image file
      if (data.image && data.image[0]) {
        formData.append('image', data.image[0]);
      }

      await privateApi.post('/medicines', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      refetch();
      toast.success('Medicine added successfully!');
      setShowModal(false);
      reset();
    } catch (error) {
      console.error('Add medicine error:', error);
      toast.error(error.response?.data?.message || 'Failed to add medicine.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Helmet key={location.pathname}>
        <title>Manage Medicines</title>
      </Helmet>
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold text-blue-700 tracking-tight text-center">
          Manage Your Medicines
        </h1>

        {/* Loading State */}
        {isPending && (
          <div className="flex justify-center items-center py-8">
            <span className="loading loading-spinner loading-lg text-blue-600"></span>
          </div>
        )}
        {/* Error State */}
        {error && (
          <div className="text-center text-red-500 py-4 font-semibold">
            Failed to load medicines. Please try again.
          </div>
        )}
        {/* Table only renders if not loading and no error */}
        {!isPending && !error && (
          <Table setShowModal={setShowModal} medicinesArr={medicinesArr} />
        )}
      </div>
      {/* Modal */}
      {showModal && (
        <Modal
          onSubmit={onSubmit}
          categories={categories}
          loading={loading}
          setShowModal={setShowModal}
          register={register}
          handleSubmit={handleSubmit}
          reset={reset}
        />
      )}
    </div>
  );
};

export default ManageMedicine;
