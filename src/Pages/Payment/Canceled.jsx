import React from 'react';
import { Link, useLocation } from 'react-router-dom';
// eslint-disable-next-line no-unused-vars
import { motion } from "motion/react"
import { Helmet } from 'react-helmet-async';

const Canceled = () => {
  const location = useLocation()
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <Helmet key={location.pathname}>
        <title>Payment Canceled</title>
      </Helmet>
      <motion.div 
        animate={{ opacity: 1, scale: 1 }}
        initial={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full"
      >
        <div className="text-center">
          <div className="mb-8">
            <svg 
              className="mx-auto h-12 w-12 text-red-500" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth="2" 
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Payment Canceled</h1>
          <p className="text-gray-600 mb-8">
            Your payment has been canceled. If you'd like to continue shopping,
            you can return to the homepage or try again later.
          </p>
          <div className="space-y-4">
            <Link 
              to="/"
              className="inline-block bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 transition duration-200"
            >
              Return to Home
            </Link>
            <Link 
              to="/cart"
              className="inline-block bg-gray-200 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-300 transition duration-200"
            >
              Return to Cart
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Canceled;
