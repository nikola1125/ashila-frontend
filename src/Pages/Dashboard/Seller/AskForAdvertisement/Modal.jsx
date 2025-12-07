import { Button, Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import React, { useContext } from 'react';

import { useState } from 'react';
import { uploadImage } from '../../../../utils/uploadImage';
import { toast } from 'react-toastify';
import useAxiosSecure from '../../../../hooks/useAxiosSecure';
import { AuthContext } from '../../../../Context/Auth/AuthContext';

const Modal = ({ isOpen, close, refetch }) => {
  const { privateApi } = useAxiosSecure();
  const { user } = useContext(AuthContext);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
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
    // For now, just log the values. You can send them to an API here.
    try {
      const imgUrl = await uploadImage(image);
      if (!imgUrl) {
        toast.error('Failed to upload the image');
        return;
      }
      const adData = {
        imgUrl,
        title,
        description,
        seller: user?.email,
        status: 'inactive',
      };
      const response = await privateApi.post('/ads', adData);
      if (response.insertedId) {
        refetch();
        toast.success('Advertisement added successfully');
        setTitle('');
        setDescription('');
        setImage(null);
        setImagePreview(null);
        close();
      }
    } catch (error) {
      console.log(error);
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
      <div className="fixed inset-0 bg-gradient-to-br from-cyan-100/80 via-white/80 to-stone-100/80 backdrop-blur-sm" aria-hidden="true" />
      <div className="fixed inset-0 z-20 w-screen overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <DialogPanel
            transition
            className="w-full max-w-lg rounded-2xl bg-white shadow-xl p-8 border border-cyan-200"
          >
            {/* Header icon and title */}
            <div className="flex flex-col items-center mb-6">
              <div className="bg-cyan-100 p-3 rounded-full shadow-md mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-cyan-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2a2 2 0 012-2h2a2 2 0 012 2v2m-6 0h6m-6 0a2 2 0 01-2-2v-2a2 2 0 012-2h6a2 2 0 012 2v2a2 2 0 01-2 2m-6 0v1a2 2 0 002 2h2a2 2 0 002-2v-1" /></svg>
              </div>
              <DialogTitle
                as="h3"
                className="text-2xl font-bold text-cyan-700 tracking-tight mb-1 text-center"
              >
                Request Advertisement
              </DialogTitle>
              <p className="text-sm text-cyan-500 text-center">Promote your medicine shop with Ashila</p>
            </div>
            <form
              className="flex flex-col gap-5"
              onSubmit={handleSubmit}
              encType="multipart/form-data"
            >
              <div>
                <label className="block text-cyan-700 font-semibold mb-1">Photo</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="block w-full text-sm text-cyan-700 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-cyan-100 file:text-cyan-700 hover:file:bg-cyan-200 transition-colors duration-150"
                  required
                />
                {imagePreview && (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="mt-3 h-28 w-full rounded-lg object-cover border border-cyan-200 shadow-sm"
                  />
                )}
              </div>
              <div>
                <label className="block text-cyan-700 font-semibold mb-1">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-lg px-3 py-2 bg-cyan-50 text-cyan-900 border border-cyan-200 focus:outline-none focus:ring-2 focus:ring-cyan-400 placeholder-cyan-400 transition-all"
                  placeholder="Enter a title"
                  required
                />
              </div>
              <div>
                <label className="block text-cyan-700 font-semibold mb-1">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-lg px-3 py-2 bg-cyan-50 text-cyan-900 border border-cyan-200 focus:outline-none focus:ring-2 focus:ring-cyan-400 placeholder-cyan-400 transition-all"
                  placeholder="Enter a description"
                  rows={3}
                  required
                />
              </div>
              <div className="flex gap-3 justify-end mt-4">
                <Button
                  type="button"
                  className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-semibold text-cyan-700 border border-cyan-200 shadow-sm hover:bg-gray-200 hover:text-cyan-900 transition-colors"
                  onClick={close}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="rounded-lg bg-cyan-600 px-4 py-2 text-sm font-bold text-white shadow-md hover:bg-cyan-700 focus:ring-2 focus:ring-cyan-400 transition-colors"
                >
                  Submit
                </Button>
              </div>
            </form>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
};

export default Modal;
