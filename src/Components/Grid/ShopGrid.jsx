import { Button } from '@headlessui/react';
import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { CartContext } from '../../Context/Cart/CartContext';

const ShopGrid = ({
  paginatedMedicines,
  handleItemsPerPageChange,
  itemsPerPage,
  currentPage,
  goToPage,
  totalPages,
}) => {
  const { addItem } = useContext(CartContext);
  const navigate = useNavigate();

  return (
    <div>
      {/* Grid Layout - 2 products per row on mobile, 3 on desktop */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 md:gap-6 justify-center lg:justify-start">
        {paginatedMedicines?.map((medicine, index) => {
          return (
            <div
              key={medicine._id || index}
              className="overflow-hidden cursor-pointer flex flex-col bg-white"
            >
              <div 
                className="relative overflow-hidden cursor-pointer flex items-center justify-center w-full"
                style={{ 
                  aspectRatio: '1/1',
                  backgroundColor: '#EFEEED',
                  maxWidth: '100%'
                }}
                onClick={() => {
                  window.scrollTo({ top: 0, behavior: 'instant' });
                  navigate(`/product/${medicine._id}`);
                }}
              >
              <img
                src={medicine.image}
                alt={medicine.itemName}
                className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
              />
              
              {/* Discount Badge - Top Left */}
              {medicine.discount > 0 && (
                <div className="absolute top-0.5 left-0.5 bg-[#A67856] text-white px-1 py-0.5 text-[8px] md:text-[9px] font-semibold">
                  Save {medicine.discount}%
                </div>
              )}

              {/* Sold Out Badge - Top Left (if stock is 0) */}
              {medicine.stock === 0 && (
                <div className="absolute top-0.5 left-0.5 bg-red-500 text-white px-1 py-0.5 text-[8px] md:text-[9px] font-semibold">
                  Sold Out
                </div>
              )}

              {/* Add to Cart Icon - Bottom Right Overlay */}
              <button
                className="absolute bottom-2 right-2 bg-white hover:bg-gray-100/50 text-gray-600 p-1.5 md:p-2 transition-all duration-200 flex items-center justify-center z-10"
                onClick={(e) => {
                  e.stopPropagation();
                  addItem({
                    id: medicine._id,
                    name: medicine.itemName,
                    price: medicine.price,
                    discountedPrice: (
                      Number(medicine.price) *
                      (1 - Number(medicine.discount) / 100)
                    ).toFixed(2),
                    image: medicine.image,
                    company: medicine.company,
                    genericName: medicine.genericName,
                    discount: medicine.discount,
                    seller: medicine.seller,
                  });
                }}
                disabled={medicine.stock === 0}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-3 h-3 md:w-4 md:h-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                  <line x1="3" y1="6" x2="21" y2="6"></line>
                  <path d="M16 10a4 4 0 0 1-8 0"></path>
                </svg>
              </button>
            </div>

            {/* Card Content - Below Image */}
            <div className="p-1.5 md:p-2">
              {/* Medicine Name */}
              <h3 
                className="font-medium text-[9px] md:text-xs text-gray-900 mb-1 line-clamp-2 min-h-[1.5rem] md:min-h-[1.75rem] cursor-pointer hover:text-gray-600 transition-colors"
                onClick={() => {
                  window.scrollTo({ top: 0, behavior: 'instant' });
                  navigate(`/product/${medicine._id}`);
                }}
              >
                {medicine.itemName}
              </h3>

              {/* Price - aligned with BestSeller layout */}
              <div className="flex items-baseline gap-1">
                {medicine.discount > 0 ? (
                  <>
                    <span className="text-[10px] md:text-xs font-semibold text-[#A67856]">
                      from {(Number(medicine.price) * (1 - Number(medicine.discount) / 100)).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} ALL
                    </span>
                    <span className="text-[8px] md:text-[10px] text-gray-400 line-through">
                      {Number(medicine.price).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} ALL
                    </span>
                  </>
                ) : (
                  <span className="text-[10px] md:text-xs font-semibold text-[#4A3628]">
                    {Number(medicine.price).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} ALL
                  </span>
                )}
              </div>
            </div>
          </div>
          );
        })}
      </div>

      {/* Pagination Controls */}
      <div className="flex flex-wrap justify-center items-center my-4 gap-2 rounded-lg shadow-sm p-3">
        {/* Prev Button */}
        <button
          className="btn btn-sm text-xs sm:text-sm px-2 sm:px-3 py-2"
          onClick={() => goToPage(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Prev
        </button>

        {/* Page Numbers */}
        <div className="flex items-center gap-1 sm:gap-2">
          {totalPages <= 5 ? (
            // If total pages is 5 or less, show all page numbers
            [...Array(totalPages)].map((_, idx) => (
              <button
                key={idx + 1}
                className={`btn btn-sm text-xs sm:text-sm px-2 sm:px-3 py-2 ${
                  currentPage === idx + 1 ? 'btn-active' : ''
                }`}
                onClick={() => goToPage(idx + 1)}
              >
                {idx + 1}
              </button>
            ))
          ) : (
            // If more than 5 pages, show smart pagination with max 5 page numbers
            <>
              {/* Always show first page */}
              <button
                className={`btn btn-sm text-xs sm:text-sm px-2 sm:px-3 py-2 ${
                  currentPage === 1 ? 'btn-active' : ''
                }`}
                onClick={() => goToPage(1)}
              >
                1
              </button>

              {/* Show ellipsis if there's a gap */}
              {currentPage > 3 && (
                <span className="px-1 sm:px-2 text-xs sm:text-sm">...</span>
              )}

              {/* Show current page and 2 pages around it (max 3 pages) */}
              {Array.from({ length: 3 }, (_, i) => currentPage - 1 + i)
                .filter((pageNum) => pageNum > 1 && pageNum < totalPages)
                .map((pageNum) => (
                  <button
                    key={pageNum}
                    className={`btn btn-sm text-xs sm:text-sm px-2 sm:px-3 py-2 ${
                      currentPage === pageNum ? 'btn-active' : ''
                    }`}
                    onClick={() => goToPage(pageNum)}
                  >
                    {pageNum}
                  </button>
                ))}

              {/* Show ellipsis if there's a gap */}
              {currentPage < totalPages - 2 && (
                <span className="px-1 sm:px-2 text-xs sm:text-sm">...</span>
              )}

              {/* Always show last page if it's different from first */}
              {totalPages > 1 && (
                <button
                  className={`btn btn-sm text-xs sm:text-sm px-2 sm:px-3 py-2 ${
                    currentPage === totalPages ? 'btn-active' : ''
                  }`}
                  onClick={() => goToPage(totalPages)}
                >
                  {totalPages}
                </button>
              )}
            </>
          )}
        </div>


        {/* Items Per Page Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs sm:text-sm text-gray-600 hidden sm:inline">
            Show:
          </span>
          <select
            value={itemsPerPage}
            onChange={handleItemsPerPageChange}
            className="select select-sm select-bordered text-xs sm:text-sm min-w-[60px] sm:min-w-[80px]"
          >
            {[5, 10, 20, 50].map((num) => (
              <option key={num} value={num}>
                {num}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default ShopGrid;