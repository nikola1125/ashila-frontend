import React from 'react';

const Table = ({ data }) => {
  return (
    <div className="overflow-x-auto rounded-xl shadow bg-white">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gradient-to-r from-stone-50 to-blue-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-bold text-stone-700 uppercase tracking-wider flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-stone-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19.428 15.341A8 8 0 118.659 4.572m10.769 10.769L12 12"
                />
              </svg>
              #
            </th>
            <th className="px-6 py-3 text-left text-xs font-bold text-stone-700 uppercase tracking-wider">
              Buyer
            </th>
            <th className="px-6 py-3 text-left text-xs font-bold text-stone-700 uppercase tracking-wider">
              Total Amount
            </th>
            <th className="px-6 py-3 text-left text-xs font-bold text-stone-700 uppercase tracking-wider">
              Payment Status
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-100">
          {data?.map((payment, index) => (
            <tr
              key={payment._id || index}
              className="hover:bg-stone-50/60 transition-colors"
            >
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-semibold">
                {index + 1}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                {payment.buyer}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                {payment.totalAmount?.toLocaleString(undefined, {
                  minimumFractionDigits: 0,
                })} ALL
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-semibold 
                  ${
                    payment.paymentStatus === 'paid'
                      ? 'bg-stone-100 text-stone-700 border border-stone-300'
                      : 'bg-red-100 text-red-700 border border-red-300'
                  }`}
                >
                  {payment.paymentStatus}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
