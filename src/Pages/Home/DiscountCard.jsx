import React from 'react';

const DiscountCard = ({ medicine }) => {
  return (
    <div className="bg-white shadow-sm border-2 border-[#d4d4c4] p-4 flex flex-col items-center transition-all hover:shadow-lg">
      <div className="w-28 h-28 mb-3 flex items-center justify-center bg-[#faf9f6] overflow-hidden">
        <img
          src={medicine.image}
          alt={medicine.itemName}
          className="w-full h-full object-contain"
          onError={(e) => {
            e.target.src = '/placeholder.png';
          }}
        />
      </div>
      <div className="w-full text-center">
        <h3 className="font-semibold text-base text-gray-900 mb-1 truncate">
          {medicine.itemName}
        </h3>
        <div className="text-xs text-gray-500 mb-1">{medicine.genericName}</div>
        <div className="text-sm text-gray-600 mb-2">{medicine.company}</div>
        <div className="flex items-center justify-center gap-2 mb-2">
          <span className="bg-[#946259] text-white font-bold px-2 py-1 text-xs border-2 border-[#946259]">
            -{medicine.discount}%
          </span>
          <span className="line-through text-gray-400 text-xs">
            {Number(medicine.price).toLocaleString()} ALL
          </span>
          <span className="text-gray-900 font-bold text-base">
            {Number(medicine.price * (1 - medicine.discount / 100)).toLocaleString()} ALL
          </span>
        </div>
        <div className="text-xs text-gray-500">
          {medicine.categoryName || (medicine.category?.categoryName) || 'N/A'}
        </div>
      </div>
    </div>
  );
};

export default DiscountCard;
