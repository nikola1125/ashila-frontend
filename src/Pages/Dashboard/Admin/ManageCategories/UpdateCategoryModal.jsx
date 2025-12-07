import { Button, Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import React, { useState, useEffect } from 'react';
import { uploadImage } from '../../../../utils/uploadImage';
import useAxiosSecure from '../../../../hooks/useAxiosSecure';
import Loading from '../../../../Components/Common/Loaders/Loading';
import { toast } from 'react-toastify';


const UpdateCategoryModal = ({ isOpen, close, refetch, categoryData }) => {
  const { privateApi } = useAxiosSecure();
  const [categoryName, setCategoryName] = useState('');
  const [categoryImage, setCategoryImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);

  // Set default values when categoryData changes
  useEffect(() => {
    if (categoryData) {
      setCategoryName(categoryData.categoryName || '');
      setImagePreview(categoryData.categoryImage || null);
      setCategoryImage(null); // Reset file input
    }
  }, [categoryData]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setCategoryImage(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    } else {
      setImagePreview(categoryData?.categoryImage || null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let imgUrl = categoryData?.categoryImage; // Use existing image by default

      // Only upload new image if a file was selected
      if (categoryImage) {
        imgUrl = await uploadImage(categoryImage);
        if (!imgUrl) {
          toast.error('Failed to upload the image');
          return;
        }
      }

      const updateData = {
        categoryName,
        categoryImage: imgUrl,
        updatedAt: new Date().toISOString(),
      };

      const response = await privateApi.put(
        `/categories/${categoryData._id}`,
        updateData
      );
      if (response.success === true) {
        refetch && refetch();
        toast.success('Category updated successfully');
        setCategoryName('');
        setCategoryImage(null);
        setImagePreview(null);
        close && close();
      }
    } catch (error) {
      toast.error('Failed to update category');
      console.log(error);
    } finally {
      setLoading(false);
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
              <div className="bg-emerald-100 p-3 rounded-full shadow-md mb-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-emerald-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
              </div>
              <DialogTitle
                as="h3"
                className="text-2xl font-bold text-emerald-700 tracking-tight mb-1 text-center"
              >
                Update Category
              </DialogTitle>
              <p className="text-sm text-emerald-500 text-center">
                Modify the details to update the category.
              </p>
            </div>
            <form
              className="flex flex-col gap-5"
              onSubmit={handleSubmit}
              encType="multipart/form-data"
            >
              <div>
                <label className="block text-emerald-700 font-semibold mb-1">
                  Category Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="block w-full text-sm text-emerald-700 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-emerald-100 file:text-emerald-700 hover:file:bg-emerald-200 transition-colors duration-150"
                />
                {imagePreview && (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="mt-3 h-28 w-full rounded-lg object-cover border border-emerald-200 shadow-sm"
                  />
                )}
              </div>
              <div>
                <label className="block text-emerald-700 font-semibold mb-1">
                  Category Name
                </label>
                <input
                  type="text"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  className="w-full rounded-lg px-3 py-2 bg-emerald-50 text-emerald-900 border border-emerald-200 focus:outline-none focus:ring-2 focus:ring-emerald-400 placeholder-emerald-400 transition-all"
                  placeholder="Enter category name"
                  required
                />
              </div>
              <div className="flex gap-3 justify-end mt-4">
                <Button
                  type="button"
                  className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-semibold text-emerald-700 border border-emerald-200 shadow-sm hover:bg-gray-200 hover:text-emerald-900 transition-colors"
                  onClick={close}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-bold text-white shadow-md hover:bg-emerald-700 focus:ring-2 focus:ring-emerald-400 transition-colors"
                >
                  {loading ? <Loading /> : 'Update'}
                </Button>
              </div>
            </form>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
};

export default UpdateCategoryModal;
