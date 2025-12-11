import { Button, Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import React, { useState } from 'react';
import { uploadImage } from '../../../../utils/uploadImage';
import useAxiosSecure from '../../../../hooks/useAxiosSecure';
import Loading from '../../../../Components/Common/Loaders/Loading'
import { toast } from 'react-toastify';

const AddCategoryModal = ({ isOpen, close, refetch }) => {
  const { privateApi } = useAxiosSecure();
  const [categoryName, setCategoryName] = useState('');
  const [categoryImage, setCategoryImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false)

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setCategoryImage(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true)
    try {
      const imgUrl = await uploadImage(categoryImage);
      if (!imgUrl) {
        toast.error('Failed to upload the image');
        return;
      }
      const categoryData = {
        categoryImage: imgUrl,
        categoryName,
        createdAt: new Date().toISOString()
      };
      const response = await privateApi.post('/categories', categoryData);
      if (response.success === true) {
        refetch && refetch();
        toast.success('Category added successfully');
        setCategoryName('');
        setCategoryImage(null);
        setImagePreview(null);
        close && close();
      }
    } catch (error) {
      toast.error('Failed to add category');
      console.log(error);
    } finally {
      setLoading(false)
    }
  };

  return (
    <Dialog
      open={isOpen}
      as="div"
      className="relative z-20 focus:outline-none"
      onClose={close}
    >
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-gradient-to-br from-blue-100/80 via-white/80 to-emerald-100/80 backdrop-blur-sm"
        aria-hidden="true"
      />
      <div className="fixed inset-0 z-20 w-screen overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <DialogPanel
            transition
            className="w-full max-w-lg rounded-2xl bg-white shadow-xl p-8 border border-emerald-200"
          >
            {/* Header icon and title */}
            <div className="flex flex-col items-center mb-6">
              <div className="bg-blue-100 p-3 rounded-full shadow-md mb-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-blue-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
              </div>
              <DialogTitle
                as="h3"
                className="text-2xl font-bold text-blue-700 tracking-tight mb-1 text-center"
              >
                Add New Category
              </DialogTitle>
              <p className="text-sm text-blue-500 text-center">
                Fill in the details to add a new medicine category.
              </p>
            </div>
            <form
              className="flex flex-col gap-5"
              onSubmit={handleSubmit}
              encType="multipart/form-data"
            >
              <div>
                <label className="block text-blue-700 font-semibold mb-1">
                  Category Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="block w-full text-sm text-blue-700 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200 transition-colors duration-150"
                  required
                />
                {imagePreview && (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="mt-3 h-28 w-full rounded-lg object-cover border border-blue-200 shadow-sm"
                  />
                )}
              </div>
              <div>
                <label className="block text-blue-700 font-semibold mb-1">
                  Category Name
                </label>
                <input
                  type="text"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  className="w-full rounded-lg px-3 py-2 bg-blue-50 text-blue-900 border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder-blue-400 transition-all"
                  placeholder="Enter category name"
                  required
                />
              </div>
              <div className="flex gap-3 justify-end mt-4">
                <Button
                  type="button"
                  className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-semibold text-blue-700 border border-blue-200 shadow-sm hover:bg-gray-200 hover:text-blue-900 transition-colors"
                  onClick={close}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white shadow-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-400 transition-colors"
                >
                  {
                    loading ? <Loading /> : "Submit"
                  }
                </Button>
              </div>
            </form>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
};

export default AddCategoryModal;
