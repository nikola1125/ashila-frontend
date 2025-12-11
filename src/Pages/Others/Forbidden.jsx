import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useLocation } from 'react-router-dom';

const Forbidden = () => {
  const location = useLocation()
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center bg-gray-100 text-gray-800 p-8">
      <Helmet key={location.pathname}>
        <title>Forbidden Access</title>
      </Helmet>
      <h1 className="text-7xl font-extrabold m-0">403</h1>
      <h2 className="mt-4 mb-2 text-2xl font-semibold">Forbidden</h2>
      <p className="mb-8 max-w-md text-center text-base">
        Sorry, you don't have permission to access this page.
        <br />
        Please contact your administrator if you believe this is a mistake.
      </p>
      <Link
        to="/"
        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded font-bold text-base shadow-md transition-colors duration-200"
      >
        Go to Home
      </Link>
    </div>
  );
};

export default Forbidden;
