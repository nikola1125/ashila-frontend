import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { CartContext } from '../../Context/Cart/CartContext';
import { getProductImage } from '../../utils/productImages';

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
      {/* Grid Layout - Using auto-fill with minmax */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5 justify-items-center">
        {paginatedMedicines?.map((medicine, index) => {
          return (
            <div
              key={medicine._id || index}
              className="w-full max-w-[280px] border border-gray-200 overflow-hidden bg-white text-center pb-4 flex flex-col h-full"
            >
              {/* Product Image Container */}
              <div 
                className="relative w-full overflow-hidden bg-[#f9f9f9] cursor-pointer h-[200px] md:h-[250px]"
                onClick={() => {
                  window.scrollTo({ top: 0, behavior: 'instant' });
                  navigate(`/product/${medicine._id}`);
                }}
              >
                <img
                  src={getProductImage(medicine.image, medicine._id || index)}
                  alt={medicine.itemName}
                  className="w-full h-full object-contain p-5"
                  onError={(e) => {
                    e.target.src = getProductImage(null, medicine._id || index);
                  }}
                />
                
                {/* Discount Badge - Top Right */}
                {medicine.discount > 0 && (
                  <div className="absolute top-2.5 right-2.5 bg-red-500 text-white px-2.5 py-1.5 text-sm font-bold">
                    Save {medicine.discount}%
                  </div>
                )}

                {/* Sold Out Badge - Top Left */}
                {medicine.stock === 0 && (
                  <div className="absolute top-2.5 left-2.5 bg-red-500 text-white px-2.5 py-1.5 text-sm font-bold">
                    Sold Out
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="px-2.5 pt-4 flex flex-col flex-grow">
                {/* Medicine Name */}
                <h3 
                  className="lux-serif-text !text-[12px] md:!text-[14px] mb-2 text-gray-800 leading-snug whitespace-normal break-words min-h-[28px] md:min-h-[40px] cursor-pointer hover:text-gray-600 transition-colors"
                  onClick={() => {
                    window.scrollTo({ top: 0, behavior: 'instant' });
                    navigate(`/product/${medicine._id}`);
                  }}
                >
                  {medicine.itemName}
                </h3>

                <div className="mt-auto">
                  {/* Price */}
                  <div className="flex items-center justify-center gap-2.5">
                    {medicine.discount > 0 ? (
                      <>
                        <span className="lux-serif-text text-[11px] md:text-lg font-medium text-black">
                          {(Number(medicine.price) * (1 - Number(medicine.discount) / 100)).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} ALL
                        </span>
                        <span className="lux-serif-text text-[9px] md:text-sm text-gray-400 line-through">
                          {Number(medicine.price).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} ALL
                        </span>
                      </>
                    ) : (
                      <span className="lux-serif-text text-[11px] md:text-lg font-medium text-black">
                        {Number(medicine.price).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} ALL
                      </span>
                    )}
                  </div>

                  {/* Add to Cart */}
                  <div className="pt-3">
                    <button
                      type="button"
                      disabled={medicine.stock === 0}
                      onClick={() =>
                        addItem({
                          id: medicine._id,
                          name: medicine.itemName,
                          price: Number(medicine.price),
                          discountedPrice:
                            medicine.discount > 0
                              ? Number(medicine.price) * (1 - Number(medicine.discount) / 100)
                              : null,
                          image: medicine.image,
                          slug: medicine._id,
                        })
                      }
                      className={`w-full px-3 py-2 text-xs md:text-sm font-semibold uppercase tracking-wide border ${
                        medicine.stock === 0
                          ? 'bg-gray-200 border-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-[#8B6F47]/70 border-[#8B6F47]/70 text-white hover:bg-[#7A5F3A]/80 hover:border-[#7A5F3A]/80'
                      } transition-colors duration-150`}
                    >
                      {medicine.stock === 0 ? 'Out of stock' : 'Shto ne shporte'}
                    </button>
                  </div>
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