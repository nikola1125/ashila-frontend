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
  onOpenVariantSidebar,
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
              key={medicine._id || medicine.id || index}
              className="w-full max-w-[280px] border border-gray-200 overflow-hidden bg-white text-center pb-4 flex flex-col h-full"
            >
              {/* Product Image Container */}
              <div
                className="relative w-full overflow-hidden bg-white cursor-pointer h-[185px] md:h-[240px] pt-4 md:pt-0"
                onClick={(e) => {
                  e.stopPropagation(); // Prevent any parent click handlers
                  window.scrollTo({ top: 0, behavior: 'instant' });
                  // If product has variants, navigate to first variant, otherwise use product ID
                  const productId = (medicine.variants && medicine.variants.length > 0) 
                    ? medicine.variants[0]._id 
                    : (medicine._id || medicine.id);
                  if (productId) {
                    navigate(`/product/${productId}`);
                  }
                }}
              >
                <img
                  src={getProductImage(medicine.image, medicine._id || index)}
                  alt={medicine.itemName}
                  className="w-full h-full object-contain p-1 md:p-5"
                  onError={(e) => {
                    e.target.src = getProductImage(null, medicine._id || index);
                  }}
                />

                {/* Badges Container - Top Right */}
                <div className="absolute top-2.5 right-2.5 flex flex-col gap-1 items-end z-10">
                  {/* Discount Badge */}
                  {medicine.discount > 0 && (medicine.totalStock > 0 && medicine.stock > 0) && (
                    <div className="bg-red-500 text-white px-2.5 py-1.5 text-sm font-bold shadow-sm">
                      Save {Math.round(medicine.discount)}%
                    </div>
                  )}
                  {/* Sold Out Badge */}
                  {(medicine.totalStock === 0 || medicine.stock === 0) && (
                    <div className="bg-red-500 text-white px-2.5 py-1.5 text-sm font-bold shadow-sm">
                      Sold Out
                    </div>
                  )}
                </div>
              </div>

              {/* Product Info */}
              <div className="px-1.5 md:px-2.5 pt-1.5 md:pt-4 flex flex-col flex-grow">
                {/* Decorative Line */}
                <div
                  className="mx-auto mb-3 h-[1px] w-[40px]"
                  style={{ backgroundColor: 'rgba(74, 54, 40, 0.3)' }}
                ></div>
                {/* Medicine Name */}
                <h3
                  className="lux-serif-text !text-[12px] md:!text-[14px] mb-2 text-gray-800 leading-snug whitespace-normal break-words min-h-[28px] md:min-h-[40px] cursor-pointer hover:text-gray-600 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent any parent click handlers
                    window.scrollTo({ top: 0, behavior: 'instant' });
                    // If product has variants, navigate to first variant, otherwise use product ID
                    const productId = (medicine.variants && medicine.variants.length > 0) 
                      ? medicine.variants[0]._id 
                      : (medicine._id || medicine.id);
                    if (productId) {
                      navigate(`/product/${productId}`);
                    }
                  }}
                >
                  {medicine.itemName}
                </h3>

                <div className="mt-auto">
                  {/* Price */}
                  {(() => {
                    // If product has variants, find the lowest price variant
                    let displayPrice = Number(medicine.price);
                    let displayDiscount = Number(medicine.discount) || 0;
                    
                    if (medicine.variants && medicine.variants.length > 0) {
                      // Find variant with lowest final price (after discount)
                      let lowestVariant = medicine.variants[0];
                      let lowestFinalPrice = Number(lowestVariant.price) * (1 - (Number(lowestVariant.discount) || 0) / 100);
                      
                      medicine.variants.forEach(variant => {
                        const variantPrice = Number(variant.price);
                        const variantDiscount = Number(variant.discount) || 0;
                        const finalPrice = variantPrice * (1 - variantDiscount / 100);
                        
                        if (finalPrice < lowestFinalPrice) {
                          lowestFinalPrice = finalPrice;
                          lowestVariant = variant;
                        }
                      });
                      
                      displayPrice = Number(lowestVariant.price);
                      displayDiscount = Number(lowestVariant.discount) || 0;
                    }
                    
                    return displayDiscount > 0 ? (
                      <>
                        <span className="lux-price-number text-sm md:text-lg font-medium text-black">
                          {(displayPrice * (1 - displayDiscount / 100)).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} ALL
                        </span>
                        <span className="lux-price-number text-xs md:text-sm text-gray-400 line-through">
                          {displayPrice.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} ALL
                        </span>
                      </>
                    ) : (
                      <span className="lux-price-number text-sm md:text-lg font-medium text-black">
                        {displayPrice.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} ALL
                      </span>
                    );
                  })()}

                  {/* Add to Cart */}
                  <div className="pt-3">
                    <button
                      type="button"
                      disabled={(medicine.totalStock === 0 && medicine.stock === 0)}
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent navigation
                        // Check if product has multiple variants
                        if (medicine.variants && medicine.variants.length > 1) {
                          // Open sidebar to select variant
                          if (onOpenVariantSidebar) {
                            onOpenVariantSidebar(medicine);
                          }
                        } else if (medicine.variants && medicine.variants.length === 1) {
                          // Single variant - add directly
                          const variant = medicine.variants[0];
                          const variantPrice = Number(variant.price);
                          const variantDiscount = Number(variant.discount || 0);
                          const discountedPrice = variantDiscount > 0
                            ? (variantPrice * (1 - variantDiscount / 100)).toFixed(2)
                            : null;

                          addItem({
                            id: variant._id,
                            name: medicine.itemName,
                            price: variantPrice,
                            discountedPrice: discountedPrice,
                            image: variant.image || medicine.image,
                            company: medicine.company,
                            genericName: medicine.genericName,
                            discount: variantDiscount,
                            seller: medicine.seller,
                            size: variant.size,
                            variantId: variant._id,
                            stock: Number(variant.stock) || 0
                          });
                        } else {
                          // No variants - add directly
                          addItem({
                            id: medicine._id,
                            name: medicine.itemName,
                            price: Number(medicine.price),
                            discountedPrice:
                              medicine.discount > 0
                                ? Number(medicine.price) * (1 - Number(medicine.discount) / 100)
                                : null,
                            image: medicine.image,
                            company: medicine.company,
                            genericName: medicine.genericName,
                            discount: medicine.discount || 0,
                            seller: medicine.seller,
                            size: medicine.size || 'Standard',
                            variantId: medicine._id,
                            stock: Number(medicine.stock) || 0
                          });
                        }
                      }}
                      className={`w-full px-3 py-2 text-xs md:text-sm font-semibold uppercase tracking-wide border ${(medicine.totalStock === 0 && medicine.stock === 0)
                        ? 'bg-gray-200 border-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-[#8B6F47]/70 border-[#8B6F47]/70 text-white hover:bg-[#7A5F3A]/80 hover:border-[#7A5F3A]/80'
                        } transition-colors duration-150`}
                    >
                      {(medicine.totalStock === 0 && medicine.stock === 0) ? 'Sold Out' : 'Shto ne shporte'}
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
                className={`btn btn-sm text-xs sm:text-sm px-2 sm:px-3 py-2 ${currentPage === idx + 1 ? 'btn-active' : ''
                  }`}
                onClick={() => goToPage(idx + 1)}
              >
                <span className="lux-price-number">{idx + 1}</span>
              </button>
            ))
          ) : (
            // If more than 5 pages, show smart pagination with max 5 page numbers
            <>
              {/* Always show first page */}
              <button
                className={`btn btn-sm text-xs sm:text-sm px-2 sm:px-3 py-2 ${currentPage === 1 ? 'btn-active' : ''
                  }`}
                onClick={() => goToPage(1)}
              >
                <span className="lux-price-number">1</span>
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
                    className={`btn btn-sm text-xs sm:text-sm px-2 sm:px-3 py-2 ${currentPage === pageNum ? 'btn-active' : ''
                      }`}
                    onClick={() => goToPage(pageNum)}
                  >
                    <span className="lux-price-number">{pageNum}</span>
                  </button>
                ))}

              {/* Show ellipsis if there's a gap */}
              {currentPage < totalPages - 2 && (
                <span className="px-1 sm:px-2 text-xs sm:text-sm">...</span>
              )}

              {/* Always show last page if it's different from first */}
              {totalPages > 1 && (
                <button
                  className={`btn btn-sm text-xs sm:text-sm px-2 sm:px-3 py-2 ${currentPage === totalPages ? 'btn-active' : ''
                    }`}
                  onClick={() => goToPage(totalPages)}
                >
                  <span className="lux-price-number">{totalPages}</span>
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