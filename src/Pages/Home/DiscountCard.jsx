import React from 'react';
<<<<<<< HEAD
import logo from '../../assets/logo.png';

const DiscountCard = ({ medicine }) => {
  const discountedPrice = Number(medicine.price * (1 - medicine.discount / 100));

  return (
    <div className="elegant-product-card bg-[#EBD8C8] border-2 border-[#D9BFA9] p-5 flex flex-col items-center transition-all hover:shadow-xl relative min-h-[330px]">
      {/* Top accent line is added via CSS ::before */}
      
      {/* Faded symbol background - using logo */}
      <div 
        className="symbol-background"
        style={{ 
          backgroundImage: `url(${logo})`,
        }}
      />
      
      {/* Discount Badge - Bottom Left */}
      {medicine.discount > 0 && (
        <span className="elegant-badge bg-[#F4A640] text-white px-2.5 py-1 text-xs font-semibold">
          Save {medicine.discount}%
        </span>
      )}

      {/* Product Image */}
      <div className="w-32 h-32 md:w-36 md:h-36 mb-4 mt-2 flex items-center justify-center bg-white overflow-hidden relative z-[2]">
        <img
          src={medicine.image}
          alt={medicine.itemName}
          className="product-img w-full h-full object-contain"
=======

const DiscountCard = ({ medicine }) => {
  return (
    <div className="bg-white shadow-sm border-2 border-[#D9BFA9] p-4 flex flex-col items-center transition-all hover:shadow-lg">
      <div className="w-28 h-28 mb-3 flex items-center justify-center bg-[#faf9f6] overflow-hidden">
        <img
          src={medicine.image}
          alt={medicine.itemName}
          className="w-full h-full object-contain"
>>>>>>> ea66fd40a6e2147c3388b6e1e2051246ee7624cc
          onError={(e) => {
            e.target.src = '/placeholder.png';
          }}
        />
      </div>
<<<<<<< HEAD

      {/* Product Info */}
      <div className="w-full text-center relative z-[2]">
        <h3 className="font-semibold text-base md:text-lg text-[#4A3628] mb-1 truncate">
          {medicine.itemName}
        </h3>
        {medicine.genericName && (
          <div className="text-xs text-[#6B5A4A] mb-1">{medicine.genericName}</div>
        )}
        {medicine.company && (
          <div className="text-sm text-[#6B5A4A] mb-3">{medicine.company}</div>
        )}
        
        {/* Price Section */}
        <div className="flex items-center justify-center gap-2 mb-2">
          <span className="line-through text-gray-400 text-xs">
            {Number(medicine.price).toLocaleString()} ALL
          </span>
          <span className="text-[#A67856] font-bold text-lg md:text-xl">
            {discountedPrice.toLocaleString()} ALL
          </span>
        </div>
        
        {medicine.categoryName && (
          <div className="text-xs text-[#8B7A6B] mt-2">
            {medicine.categoryName || (medicine.category?.categoryName) || 'N/A'}
          </div>
        )}
=======
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
>>>>>>> ea66fd40a6e2147c3388b6e1e2051246ee7624cc
      </div>
    </div>
  );
};

export default DiscountCard;
