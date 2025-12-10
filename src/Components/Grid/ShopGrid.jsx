import { Button } from '@headlessui/react';
import React, { useContext, useEffect, useRef, useState } from 'react';
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
  const [visibleItems, setVisibleItems] = useState(new Set());

  // Intersection Observer for scroll animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleItems((prev) => new Set([...prev, entry.target.id]));
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    const elements = document.querySelectorAll('.product-card');
    elements.forEach((el) => observer.observe(el));

    return () => {
      elements.forEach((el) => observer.unobserve(el));
    };
  }, [paginatedMedicines]);

  return (
    <div>
      {/* Grid Layout - 2 products per row on mobile, 3 on desktop */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-5 mb-8 px-2 md:px-0">
        {paginatedMedicines?.map((medicine, index) => {
          const isVisible = visibleItems.has(`product-${medicine._id || index}`);
          return (
            <div
            key={medicine._id || index}
            id={`product-${medicine._id || index}`}
            className={`product-card bg-white transition-all duration-200 overflow-hidden group border-2 border-[#D9BFA9] shadow-sm hover:shadow-lg ${
              isVisible 
                ? 'opacity-100 translate-y-0' 
                : 'opacity-0 translate-y-8'
            } transition-all duration-700 ease-out`}
            style={{ transitionDelay: `${index * 100}ms` }}
          >
            {/* Medicine Image Container */}
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
                className="absolute bottom-0.5 right-0.5 bg-white hover:bg-[#A67856] text-[#A67856] hover:text-white p-1 md:p-1.5 rounded-full shadow-md transition-all duration-200 flex items-center justify-center z-10"
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
                  className="w-3 h-3 md:w-3.5 md:h-3.5"
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
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 md:w-2.5 md:h-2.5 bg-[#A67856] text-white text-[6px] md:text-[7px] font-bold rounded-full flex items-center justify-center leading-none">+</span>
              </button>
            </div>

            {/* Card Content - Below Image */}
            <div className="p-1.5 md:p-2">
              {/* Medicine Name */}
              <h3 
                className="font-medium text-[9px] md:text-xs text-gray-900 mb-0.5 md:mb-1 line-clamp-2 min-h-[1.5rem] md:min-h-[1.75rem] cursor-pointer hover:text-gray-600 transition-colors"
                onClick={() => {
                  window.scrollTo({ top: 0, behavior: 'instant' });
                  navigate(`/product/${medicine._id}`);
                }}
              >
                {medicine.itemName}
              </h3>

              {/* Price */}
              <div className="flex items-baseline gap-0.5 md:gap-1">
                {medicine.discount > 0 ? (
                  <>
                    <span className="text-[10px] md:text-xs font-semibold text-gray-900">
                      {(Number(medicine.price) * (1 - Number(medicine.discount) / 100)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ALL
                    </span>
                    <span className="text-[8px] md:text-[10px] text-gray-500 line-through">
                      {Number(medicine.price).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ALL
                    </span>
                  </>
                ) : (
                  <span className="text-[10px] md:text-xs font-semibold text-gray-900">
                    {Number(medicine.price).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ALL
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
