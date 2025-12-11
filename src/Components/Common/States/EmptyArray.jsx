import React from 'react'

/**
 * EmptyArray component
 * Shows a friendly message (and optional icon/image) when an array is empty.
 *
 * Props:
 * - message: string (optional, default: 'No data found')
 * - icon: React node (optional, for custom icon or image)
 */
const defaultIcon = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 48 48"
    className="w-12 h-12 text-gray-300"
  >
    <rect x="8" y="16" width="32" height="20" rx="4" fill="currentColor" />
    <rect x="14" y="12" width="20" height="4" rx="2" fill="currentColor" opacity="0.6" />
    <rect x="18" y="28" width="12" height="2" rx="1" fill="#fff" opacity="0.7" />
  </svg>
);

const EmptyArray = ({ message = 'No data found', icon = null }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[180px] p-6 bg-white border-2 border-[#d4d4c4] text-[#946259] shadow-sm my-6">
      <div className="mb-3 text-4xl opacity-60">{icon || defaultIcon}</div>
      <div className="text-lg font-medium text-center">{message}</div>
    </div>
  );
};

export default EmptyArray
