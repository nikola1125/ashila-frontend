
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import useAxiosSecure from '../../../../hooks/useAxiosSecure';
import DataLoading from '../../../../Components/Common/Loaders/DataLoading';
import LoadingError from '../../../../Components/Common/States/LoadingError';
import BestsellerTable from './BestsellerTable';
import SelectProductModal from './SelectProductModal';
import CreateProductModal from '../ManageProducts/CreateProductModal';
import { Helmet } from 'react-helmet-async';
import { Star, Plus } from 'lucide-react';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';

const ManageBestsellers = () => {
  const { privateApi } = useAxiosSecure();
  const queryClient = useQueryClient();
  const [isSelectModalOpen, setIsSelectModalOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const {
    data: products,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['bestsellers-admin'],
    queryFn: async () => {
      try {
        const response = await privateApi.get('/medicines/bestsellers');
        const list = Array.isArray(response) ? response : (response?.result || response || []);
        // The endpoint /bestsellers returns the array directly or result object
        return Array.isArray(list) ? list : (list.result || []);
      } catch (err) {
        console.error('Error fetching bestsellers:', err);
        throw err;
      }
    },
  });

  const handleEdit = (product) => {
    setEditingProduct(product);
    setIsEditModalOpen(true);
  };

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      await privateApi.delete(`/medicines/${id}`);
    },
    onSuccess: () => {
      toast.success('Product deleted from inventory');
      refetch();
    },
    onError: (err) => {
      toast.error(err.message);
    }
  });

  const handleDelete = (id) => {
    Swal.fire({
      title: 'Delete from Inventory?',
      text: "This will permanently delete the product from the entire inventory, not just bestsellers!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        deleteMutation.mutate(id);
      }
    });
  };

  if (isLoading) {
    return <DataLoading label="Bestsellers" />;
  }

  if (error) {
    return <LoadingError label="bestsellers" showAction={true} />;
  }

  const productsList = products || [];

  return (
    <div className="p-6 md:p-10">
      <Helmet>
        <title>Manage Bestsellers</title>
      </Helmet>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Star className="text-yellow-500" size={28} />
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
              Manage Bestsellers
            </h2>
          </div>
          <p className="text-gray-600">
            Manage your best selling products. Add from inventory or edit existing.
          </p>
        </div>

        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 transition"
          >
            <Plus size={18} /> Add Product
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-100 py-1 z-10">
              <button
                onClick={() => {
                  setEditingProduct(null);
                  setIsEditModalOpen(true);
                  setIsDropdownOpen(false);
                }}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-amber-50 hover:text-amber-700 transition"
              >
                Create New Product
              </button>
              <button
                onClick={() => {
                  setIsSelectModalOpen(true);
                  setIsDropdownOpen(false);
                }}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-amber-50 hover:text-amber-700 transition"
              >
                Select from Inventory
              </button>
            </div>
          )}
        </div>
      </div>

      <BestsellerTable
        products={productsList}
        refetch={refetch}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {isSelectModalOpen && (
        <SelectProductModal
          isOpen={isSelectModalOpen}
          onClose={() => setIsSelectModalOpen(false)}
          refetch={refetch}
        />
      )}

      {isEditModalOpen && (
        <CreateProductModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          productToEdit={editingProduct}
          refetch={refetch}
          isBestseller={true}
        />
      )}
    </div>
  );
};

export default ManageBestsellers;

