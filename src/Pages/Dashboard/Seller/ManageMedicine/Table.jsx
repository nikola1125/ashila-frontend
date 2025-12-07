import React from 'react';

const Table = ({ setShowModal, medicinesArr }) => {
  return (
    <div className="overflow-x-auto w-full">
      <div className="flex justify-center my-4">
        <button
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-5 py-2 rounded-lg shadow transition duration-150 focus:outline-none focus:ring-2 focus:ring-emerald-400"
          onClick={() => setShowModal(true)}
        >
          + Add Medicine
        </button>
      </div>
      <table className="min-w-full bg-white rounded-xl shadow-md overflow-hidden">
        <thead className="bg-blue-100 text-blue-800">
          <tr>
            <th className="py-3 px-2 text-left font-semibold">#</th>
            <th className="py-3 px-2 text-left font-semibold">Name</th>
            <th className="py-3 px-2 text-left font-semibold">Company</th>
            <th className="py-3 px-2 text-left font-semibold">Category</th>
            <th className="py-3 px-2 text-left font-semibold">Description</th>
            <th className="py-3 px-2 text-left font-semibold">Mass unit</th>
            <th className="py-3 px-2 text-left font-semibold">Price</th>
            <th className="py-3 px-2 text-left font-semibold">Discount</th>
          </tr>
        </thead>
        <tbody>
          {medicinesArr?.length === 0 && (
            <tr>
              <td
                colSpan="8"
                className="text-center py-8 text-gray-400 text-lg"
              >
                No medicines found.
              </td>
            </tr>
          )}
          {medicinesArr?.map((medicine, index) => (
            <tr
              key={medicine._id}
              className={
                index % 2 === 0
                  ? 'bg-white'
                  : 'bg-blue-50 hover:bg-blue-100 transition'
              }
            >
              <td className="py-3 px-2 font-medium">{index + 1}</td>
              <td className="py-3 px-2">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-lg overflow-hidden border border-blue-200 shadow-sm">
                    <img
                      src={medicine.image}
                      alt={medicine.itemName}
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <div>
                    <div className="font-bold text-blue-700">
                      {medicine.itemName}
                    </div>
                    <div className="text-xs text-gray-500">
                      {medicine.genericName}
                    </div>
                  </div>
                </div>
              </td>
              <td className="py-3 px-2">{medicine.company}</td>
              <td className="py-3 px-2">
                {medicine.categoryName || (medicine.category?.categoryName) || 'N/A'}
              </td>
              <td className="py-3 px-2">
                {medicine.description
                  ? medicine.description.length > 20
                    ? medicine.description.slice(0, 20) + '...'
                    : medicine.description
                  : 'N/A'}
              </td>
              <td className="py-3 px-2">{medicine.massUnit}</td>
              <td className="py-3 px-2">{Number(medicine.price).toLocaleString()} ALL</td>
              <td className="py-3 px-2">{medicine.discount}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
