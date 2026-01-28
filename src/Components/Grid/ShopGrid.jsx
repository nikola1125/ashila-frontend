import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { CartContext } from '../../Context/Cart/CartContext';
import { getProductImage } from '../../utils/productImages';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import ShopGridSkeleton from './ShopGridSkeleton';

const ShopGrid = ({
  paginatedMedicines,
  handleItemsPerPageChange,
  itemsPerPage,
  currentPage,
  goToPage,
  totalPages,
  onOpenVariantSidebar,
  isLoading,
}) => {
  const { addItem } = useContext(CartContext);
  const navigate = useNavigate();

  if (isLoading) {
    return <ShopGridSkeleton itemsPerPage={itemsPerPage} />;
  }

  const getProductIdForDetails = (product) => {
    if (!product) return null;
    if (product.variants && product.variants.length > 0) {
      return product.variants[0]._id || product.variants[0].id;
    }
    return product._id || product.id;
  };

  return (
    <div>
      {/* Grid Layout - Using auto-fill with minmax */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5 justify-items-center">
        {paginatedMedicines?.map((medicine, index) => {
          const detailsId = getProductIdForDetails(medicine);

          return (
            <div
              key={medicine._id || medicine.id || index}
              className="w-full max-w-[280px] border border-gray-200 overflow-hidden bg-white text-center pb-2 flex flex-col h-full"
            >
              {/* Product Image Container */}
              <div
                className="relative w-full overflow-hidden bg-white cursor-pointer h-[160px] md:h-[200px] flex items-center justify-center"
                onClick={(e) => {
                  e.stopPropagation(); // Prevent any parent click handlers
                  window.scrollTo({ top: 0, behavior: 'auto' });
                  if (detailsId) navigate(`/product/${detailsId}`);
                }}
              >
                <img
                  src={getProductImage(medicine.image, medicine._id || index)}
                  alt={medicine.itemName}
                  className="w-full h-full object-contain p-6"
                  style={{
                    objectPosition: 'center'
                  }}
                  onError={(e) => {
                    console.warn('Image failed to load for product:', medicine.itemName, 'Error:', e);
                    console.warn('Image data:', {
                      image: medicine.image,
                      productId: medicine._id || index,
                      fallbackImage: getProductImage(null, medicine._id || index)
                    });
                    e.target.src = getProductImage(null, medicine._id || index);
                  }}
                />

                {/* Badges Container - Top Right */}
                <div className="absolute top-2.5 right-2.5 flex flex-col gap-1 items-end z-10">
                  {/* Discount Badge */}
                  {(() => {
                    let displayDiscount = Number(medicine.discount) || 0;
                    if (medicine.variants && medicine.variants.length > 0) {
                      let smallestVariant = medicine.variants[0];
                      let lowestOriginalPrice = Number(smallestVariant.price);
                      medicine.variants.forEach(variant => {
                        const variantPrice = Number(variant.price);
                        if (variantPrice < lowestOriginalPrice) {
                          lowestOriginalPrice = variantPrice;
                          smallestVariant = variant;
                        }
                      });
                      displayDiscount = Number(smallestVariant.discount) || 0;
                    }

                    return displayDiscount > 0 && (medicine.totalStock > 0 && (medicine.variants?.some(v => v.stock > 0) || medicine.stock > 0)) && (
                      <div className="bg-red-500 text-white pill-badge px-3 py-1 text-xs font-bold shadow-sm">
                        Save {Math.round(displayDiscount)}%
                      </div>
                    );
                  })()}
                  {/* Sold Out Badge */}
                  {(medicine.totalStock === 0 || medicine.stock === 0) && (
                    <div className="bg-red-500 text-white pill-badge px-3 py-1 text-xs font-bold shadow-sm">
                      Sold Out
                    </div>
                  )}
                </div>
              </div>

              {/* Product Info */}
              <div className="px-1.5 md:px-2.5 pt-1 md:pt-2 flex flex-col flex-grow">
                {/* Decorative Line */}
                <div
                  className="mx-auto mb-2 h-[1px] w-[30px]"
                  style={{ backgroundColor: 'rgba(74, 54, 40, 0.3)' }}
                ></div>
                {/* Medicine Name */}
                <h3
                  className="lux-serif-text !text-[11px] md:!text-[13px] mb-1 text-gray-800 leading-tight whitespace-normal break-words min-h-[24px] md:min-h-[32px] cursor-pointer hover:text-gray-600 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent any parent click handlers
                    window.scrollTo({ top: 0, behavior: 'auto' });
                    if (detailsId) navigate(`/product/${detailsId}`);
                  }}
                >
                  {medicine.itemName}
                </h3>

                <div className="mt-auto">
                  {/* Price */}
                  {(() => {
                    // If product has variants, find smallest variant by price
                    let displayPrice = Number(medicine.price);
                    let displayDiscount = Number(medicine.discount) || 0;

                    if (medicine.variants && medicine.variants.length > 0) {
                      // Find variant with lowest original price
                      let smallestVariant = medicine.variants[0];
                      let lowestOriginalPrice = Number(smallestVariant.price);

                      medicine.variants.forEach(variant => {
                        const variantPrice = Number(variant.price);
                        if (variantPrice < lowestOriginalPrice) {
                          lowestOriginalPrice = variantPrice;
                          smallestVariant = variant;
                        }
                      });

                      displayPrice = Number(smallestVariant.price);
                      displayDiscount = Number(smallestVariant.discount) || 0;
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
                  <div className="pt-2">
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

      {/* Luxurious Pagination Controls */}
      <div className="flex justify-center items-center py-12 mt-8 border-t border-gray-100">
        <div className="flex items-center gap-8 sm:gap-16">
          {/* Prev Button */}
          <button
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
            className={`flex items-center gap-2 group transition-all duration-300 ${currentPage === 1 ? 'opacity-20 cursor-not-allowed' : 'opacity-100 hover:text-[#8B6F47]'
              }`}
          >
            <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-[10px] sm:text-xs font-light tracking-[0.2em] uppercase hidden sm:block">Mëparshme</span>
          </button>

          {/* Progress Indicator */}
          <div className="flex items-center">
            <span className="text-[11px] sm:text-[13px] font-light tracking-[0.3em] uppercase text-gray-400">
              <span className="text-[#8B6F47] font-medium">{currentPage}</span>
              <span className="mx-3 sm:mx-4">/</span>
              <span className="text-gray-900">{totalPages}</span>
            </span>
          </div>

          {/* Next Button */}
          <button
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`flex items-center gap-2 group transition-all duration-300 ${currentPage === totalPages ? 'opacity-20 cursor-not-allowed' : 'opacity-100 hover:text-[#8B6F47]'
              }`}
          >
            <span className="text-[10px] sm:text-xs font-light tracking-[0.2em] uppercase hidden sm:block">Tjetra</span>
            <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShopGrid;
