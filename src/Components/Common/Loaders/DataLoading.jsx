import React from 'react';

const DataLoading = ({label}) => {
  return (
    <div className="min-h-[100vh] flex items-center justify-center">
      <div className="text-center">
        <span className="loading loading-spinner loading-lg text-primary"></span>
        <p className="mt-4 text-gray-600">Loading {label}...</p>
      </div>
    </div>
  );
};

export default DataLoading;
