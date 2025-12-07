import React, { useState } from 'react';
import AddCategoryModal from './AddCategoryModal';
import UpdateCategoryModal from './UpdateCategoryModal';
import useAxiosSecure from '../../../../hooks/useAxiosSecure';
import Swal from 'sweetalert2';

const CategoryTable = ({ categories, refetch }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);
  const openUpdateModal = (category) => {
    setSelectedCategory(category);
    setIsUpdateModalOpen(true);
  };
  const closeUpdateModal = () => {
    setIsUpdateModalOpen(false);
    setSelectedCategory(null);
  };
  const { privateApi } = useAxiosSecure();

  const handleDelete = (id) => {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await privateApi.delete(`/categories/${id}`);
          if (response.success === true) {
            Swal.fire({
              title: 'Deleted!',
              text: 'Your file has been deleted.',
              icon: 'success',
            });
            refetch();
          }
        } catch (error) {
          console.log(error);
        }
      }
    });
  };

  return (
    <div className="overflow-x-auto">
      <table className="table">
        {/* head */}
        <thead>
          <tr>
            <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
              #
            </th>
            <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Image
            </th>
            <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Name
            </th>
            <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Action
            </th>
          </tr>
        </thead>
        <tbody>
          {categories.map((category, index) => (
            <tr key={category._id}>
              <th>{index + 1}</th>
              <td>
                <div className="avatar">
                  <div className="mask mask-squircle h-12 w-12">
                    <img
                      src={category.categoryImage}
                      alt={category.categoryName}
                    />
                  </div>
                </div>
              </td>
              <td className="px-4 py-3 text-gray-800 font-semibold">
                {category.categoryName}
              </td>
              <td className="px-4 py-3">
                <div className="flex gap-2">
                  <button
                    onClick={() => openUpdateModal(category)}
                    className="px-3 py-1 rounded-lg bg-blue-100 text-blue-700 font-semibold hover:bg-blue-200 transition"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(category._id)}
                    className="px-3 py-1 rounded-lg bg-red-100 text-red-700 font-semibold hover:bg-red-200 transition"
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
          <tr>
            <td colSpan={4} className="text-center py-4">
              <button
                className="px-5 py-2 rounded-lg bg-gradient-to-r from-emerald-500 to-blue-500 text-white font-bold shadow hover:from-emerald-600 hover:to-blue-600 transition"
                onClick={openModal}
              >
                + Add Category
              </button>
            </td>
          </tr>
        </tbody>
      </table>
      <AddCategoryModal
        isOpen={isModalOpen}
        close={closeModal}
        refetch={refetch}
      />
      <UpdateCategoryModal
        isOpen={isUpdateModalOpen}
        close={closeUpdateModal}
        refetch={refetch}
        categoryData={selectedCategory}
      />
    </div>
  );
};

export default CategoryTable;
