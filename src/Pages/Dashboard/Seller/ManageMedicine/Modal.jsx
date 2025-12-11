import React from 'react';
const Modal = ({
  onSubmit,
  categories,
  loading,
  setShowModal,
  register,
  handleSubmit,
  reset,
}) => {
  const companies = ['Company A', 'Company B', 'Company C'];
  return (
    <dialog className="modal modal-open">
      <form
        method="dialog"
        className="modal-box bg-white rounded-2xl shadow-2xl p-6 md:p-10 border border-blue-100 max-w-lg mx-auto"
        onSubmit={handleSubmit(onSubmit)}
      >
        <h3 className="font-bold text-2xl text-blue-700 mb-6 text-center">
          Add Medicine
        </h3>
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Item Name
            </label>
            <input
              {...register('itemName', { required: true })}
              type="text"
              className="input input-bordered w-full focus:ring-2 focus:ring-blue-300"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Item Generic Name
            </label>
            <input
              {...register('genericName', { required: true })}
              type="text"
              className="input input-bordered w-full focus:ring-2 focus:ring-blue-300"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Short Description
            </label>
            <textarea
              {...register('shortDescription', { required: true })}
              className="textarea textarea-bordered w-full focus:ring-2 focus:ring-blue-300"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Image Upload
            </label>
            <input
              {...register('image', { required: true })}
              type="file"
              className="file-input file-input-bordered w-full"
              accept="image/*"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Category
            </label>
            <select
              {...register('category', { required: true })}
              className="select select-bordered w-full focus:ring-2 focus:ring-blue-300"
              required
            >
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat.categoryName}>
                  {cat.categoryName}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Company
            </label>
            <select
              {...register('company', { required: true })}
              className="select select-bordered w-full focus:ring-2 focus:ring-blue-300"
              required
            >
              <option value="">Select Company</option>
              {companies.map((comp) => (
                <option key={comp} value={comp}>
                  {comp}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Item Mass Unit
            </label>
            <select
              {...register('massUnit', { required: true })}
              className="select select-bordered w-full focus:ring-2 focus:ring-blue-300"
              required
            >
              <option value="Mg">Mg</option>
              <option value="ML">ML</option>
            </select>
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Per Unit Price
            </label>
            <input
              {...register('price', { required: true, min: 0 })}
              type="number"
              className="input input-bordered w-full focus:ring-2 focus:ring-blue-300"
              required
              min="0"
              step="0.01"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Discount Percentage
            </label>
            <input
              {...register('discount', { min: 0, max: 100 })}
              defaultValue="0"
              type="number"
              className="input input-bordered w-full focus:ring-2 focus:ring-blue-300"
              min="0"
              max="100"
            />
          </div>
        </div>
        <div className="modal-action flex justify-between mt-8">
          <button
            type="submit"
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6 py-2 rounded-lg shadow focus:outline-none focus:ring-2 focus:ring-emerald-400 transition"
            disabled={loading}
          >
            {loading ? 'Submitting...' : 'Submit'}
          </button>
          <button
            type="button"
            className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold px-6 py-2 rounded-lg shadow focus:outline-none focus:ring-2 focus:ring-gray-400 transition"
            onClick={() => {
              setShowModal(false);
              reset();
            }}
            disabled={loading}
          >
            Cancel
          </button>
        </div>
      </form>
    </dialog>
  );
};

export default Modal;
