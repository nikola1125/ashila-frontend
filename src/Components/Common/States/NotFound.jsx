import React from 'react';
import { Link } from 'react-router-dom';
import Logo from '../Logo/Logo';

const NotFound = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center bg-gray-50 px-4">
      <div className="mb-6">
        <Logo />
      </div>
      <h1 className="text-7xl font-extrabold text-gray-900 mb-2">404</h1>
      <h2 className="text-2xl md:text-3xl font-semibold mb-2 text-gray-800">
        Page Not Found
      </h2>
      <p className="text-gray-500 mb-6 max-w-md">
        Sorry, the page you are looking for does not exist, has been moved, or
        the URL is incorrect.
      </p>
      <Link
        to="/"
        className="inline-block px-6 py-3 bg-[#946259] text-white shadow-md hover:bg-[#7a4f47] transition-all font-bold border-2 border-[#946259] uppercase tracking-wide"
      >
        Go to Homepage
      </Link>
    </div>
  );
};

export default NotFound;
