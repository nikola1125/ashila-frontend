import React from 'react'

const GridView = ({ payments, role, handleAccept, getStatusColor, getStatusIcon}) => (
  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
    {payments.map((payment, idx) => (
      <div
        key={payment._id || idx}
        className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 overflow-hidden group"
      >
        {/* Card Header */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-semibold text-sm">
                  #{idx + 1}
                </span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Transaction</h3>
                <p className="text-sm text-gray-500">
                  ID: {payment.transactionId?.slice(0, 8) || 'N/A'}...
                </p>
              </div>
            </div>
            <div
              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
                payment.status
              )}`}
            >
              {getStatusIcon(payment.status)}
              <span className="ml-1">{payment.status || 'N/A'}</span>
            </div>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-6 space-y-4">
          {/* Buyer Info */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
              <svg
                className="w-4 h-4 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-800">Buyer</p>
              <p className="text-sm text-gray-600 truncate">
                {payment.buyer || 'N/A'}
              </p>
            </div>
          </div>

          {/* Amount */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-stone-100 rounded-full flex items-center justify-center">
              <svg
                className="w-4 h-4 text-stone-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-800">Amount</p>
              <p className="text-lg font-bold text-stone-600">
                ${payment.total_amount || 'N/A'}
              </p>
            </div>
          </div>

          {/* Payment Method */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
              <svg
                className="w-4 h-4 text-purple-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-800">
                Payment Method
              </p>
              <p className="text-sm text-gray-600 capitalize">
                {payment.payment_method || 'N/A'}
              </p>
            </div>
          </div>

          {/* Action Button for Admin */}
          {role === 'admin' && (
            <div className="pt-4 border-t border-gray-100">
              {payment.status === 'paid' ? (
                <div className="flex items-center justify-center space-x-2 text-emerald-600 bg-emerald-50 rounded-xl py-3 px-4">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span className="font-semibold">Payment Accepted</span>
                </div>
              ) : (
                <button
                  onClick={() => handleAccept(payment.transactionId)}
                  className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Accept Payment
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    ))}
  </div>
);

export default GridView
