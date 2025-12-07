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
      {/* Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
        {paginatedMedicines?.map((medicine, index) => (
          <div
            key={medicine._id || index}
            className="bg-white shadow-sm hover:shadow-lg transition-all duration-200 border-2 border-[#d4d4c4] overflow-hidden group"
          >
            {/* Medicine Image */}
            <div 
              className="relative overflow-hidden cursor-pointer"
              onClick={() => {
                window.scrollTo({ top: 0, behavior: 'instant' });
                navigate(`/product/${medicine._id}`);
              }}
            >
              <img
                src={medicine.image}
                alt={medicine.itemName}
                className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
              />
              {medicine.discount > 0 && (
                <div className="absolute top-3 left-3 bg-[#946259] text-white px-2.5 py-1 text-xs font-semibold border-2 border-[#946259]">
                  Save {medicine.discount}%
                </div>
              )}
            </div>

            {/* Card Content */}
            <div className="p-4">
              {/* Medicine Name & Generic */}
              <div className="mb-3">
                <h3 
                  className="font-medium text-base text-gray-900 mb-1 line-clamp-2 min-h-[2.5rem] cursor-pointer hover:text-gray-600 transition-colors"
                  onClick={() => {
                    window.scrollTo({ top: 0, behavior: 'instant' });
                    navigate(`/product/${medicine._id}`);
                  }}
                >
                  {medicine.itemName}
                </h3>
                {medicine.genericName && (
                  <p className="text-sm text-gray-500 line-clamp-1">
                    {medicine.genericName}
                  </p>
                )}
              </div>

              {/* Price and Add to Cart - Side by Side */}
              <div className="flex items-center justify-between gap-2">
                {/* Price Section - Left */}
                <div className="flex items-baseline gap-2">
                  {medicine.discount > 0 ? (
                    <>
                      <span className="text-base font-semibold text-gray-900">
                        {(Number(medicine.price) * (1 - Number(medicine.discount) / 100)).toLocaleString()} ALL
                      </span>
                      <span className="text-sm text-gray-500 line-through">
                        {Number(medicine.price).toLocaleString()} ALL
                      </span>
                    </>
                  ) : (
                    <span className="text-base font-semibold text-gray-900">
                      {Number(medicine.price).toLocaleString()} ALL
                    </span>
                  )}
                </div>

                {/* Add to Cart Button - Right */}
                <button
                  className="bg-[#946259] hover:bg-[#7a4f47] text-white px-4 py-2 text-sm font-semibold transition-all duration-150 flex items-center justify-center gap-1 flex-shrink-0 border-2 border-[#946259]"
                  onClick={() =>
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
                    })
                  }
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-4 h-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="9" cy="21" r="1" />
                    <circle cx="20" cy="21" r="1" />
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                  </svg>
                  <span className="hidden sm:inline">Add</span>
                </button>
              </div>
            </div>
          </div>
        ))}
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

        {/* Next Button */}
        <button
          className="btn btn-sm text-xs sm:text-sm px-2 sm:px-3 py-2"
          onClick={() => goToPage(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Next
        </button>

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
