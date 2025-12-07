import React from 'react';
import { Link } from 'react-router-dom';

const LoadingError = ({ showAction, label }) => {
  return (
    <div className="min-h-[400px] flex items-center justify-center">
      <div className="text-center">
        <div className="text-error text-6xl mb-4">⚠️</div>
        <h3 className="text-xl font-semibold text-error mb-2">
          Failed to load {label}
        </h3>
        <p className="text-gray-600">Please try again later</p>
        {showAction && (
          <Link to="/" className="btn btn-primary mt-4">
            Go To Home
          </Link>
        )}
      </div>
    </div>
  );
};

export default LoadingError;
