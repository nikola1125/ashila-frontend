import React, { useState, useContext, useCallback, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import useAxiosSecure from '../../hooks/useAxiosSecure';
import { CartContext } from '../../Context/Cart/CartContext';
import { Helmet } from 'react-helmet-async';
import { ShoppingBag, Minus, Plus, Facebook, Twitter, Mail, ChevronLeft, ChevronRight } from 'lucide-react';
import DataLoading from '../../Components/Common/Loaders/DataLoading';
import LoadingError from '../../Components/Common/States/LoadingError';
import { getProductImage } from '../../utils/productImages';
import { useThrottle } from '../../hooks/useThrottle';
import VariantSelectionSidebar from '../../Components/Common/Products/VariantSelectionSidebar';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { publicApi } = useAxiosSecure();
  const { addItem } = useContext(CartContext);
  const [quantity, setQuantity] = useState(1);
  const [activeVariant, setActiveVariant] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const { data: product, isLoading, error } = useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      const response = await publicApi.get(`/medicines/${id}`);
      return response;
    },
    enabled: !!id,
  });

  // Fetch related products (same category, excluding current product)
  const { data: relatedProducts = [] } = useQuery({
    queryKey: ['relatedProducts', product?.category?._id, id],
    queryFn: async () => {
      if (!product?.category?._id) return [];
      const response = await publicApi.get(`/medicines`);
      const allProducts = response?.result || response || [];
      // Filter: same category, exclude current product, limit to 4
      const related = allProducts
        .filter(p =>
          p._id !== id &&
          (p.category?._id === product.category._id || p.category === product.category._id)
        )
        .slice(0, 4);
      // If not enough in same category, add products in order (no random)
      if (related.length < 4) {
        const additional = allProducts
          .filter(p => p._id !== id && !related.find(r => r._id === p._id))
          .slice(0, 4 - related.length);
        return [...related, ...additional].slice(0, 4);
      }
      return related;
    },
    enabled: !!product && !!product.category,
  });

  const relatedScrollRef = useRef(null);
  const [showLeftRelatedArrow, setShowLeftRelatedArrow] = useState(false);
  const [showRightRelatedArrow, setShowRightRelatedArrow] = useState(false);
  const [relatedCurrentPage, setRelatedCurrentPage] = useState(1);
  const [relatedTotalPages, setRelatedTotalPages] = useState(1);
  const [relatedShowScrollHint, setRelatedShowScrollHint] = useState(true);

  // Scroll to top when component mounts or product ID changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);

  // Handle scroll state for related products carousel
  const checkRelatedScroll = useCallback(() => {
    const container = relatedScrollRef.current;
    if (!container || relatedProducts.length === 0) {
      setShowLeftRelatedArrow(false);
      setShowRightRelatedArrow(false);
      setRelatedCurrentPage(1);
      setRelatedTotalPages(1);
      return;
    }

    const { scrollLeft, scrollWidth, clientWidth } = container;
    const isAtStart = scrollLeft <= 10;
    const isAtEnd = scrollLeft + clientWidth >= scrollWidth - 10;

    setShowLeftRelatedArrow(!isAtStart);
    setShowRightRelatedArrow(!isAtEnd);

    if (scrollLeft > 5 && relatedShowScrollHint) {
      setRelatedShowScrollHint(false);
    }

    // Page calculation
    const pageWidth = clientWidth || 1;
    const currentPageNum = Math.round(scrollLeft / pageWidth) + 1;
    const totalPagesNum = Math.max(1, Math.ceil(scrollWidth / pageWidth));
    setRelatedCurrentPage(Math.min(currentPageNum, totalPagesNum));
    setRelatedTotalPages(totalPagesNum);
  }, [relatedProducts.length, relatedShowScrollHint]);

  const throttledCheckRelatedScroll = useThrottle(checkRelatedScroll, 100);

  useEffect(() => {
    const container = relatedScrollRef.current;
    if (!container || relatedProducts.length === 0) {
      setShowLeftRelatedArrow(false);
      setShowRightRelatedArrow(false);
      return;
    }

    checkRelatedScroll();
    container.addEventListener('scroll', throttledCheckRelatedScroll, { passive: true });

    const handleResize = () => {
      setTimeout(checkRelatedScroll, 100);
    };
    window.addEventListener('resize', handleResize, { passive: true });

    return () => {
      container.removeEventListener('scroll', throttledCheckRelatedScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, [relatedProducts, checkRelatedScroll, throttledCheckRelatedScroll]);

  const scrollRelated = useCallback((direction) => {
    const container = relatedScrollRef.current;
    if (!container) return;

    let scrollAmount;

    if (window.innerWidth < 768) {
      // Mobile: scroll by one full "page" (the visible width that contains 2 products)
      scrollAmount = container.clientWidth || 1;
    } else {
      // Desktop: scroll roughly one card at a time
      scrollAmount = 240;
    }

    container.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  }, []);

  // Initialize selected variant logic
  useEffect(() => {
    if (product) {
      // Always start with no variant selected to force user choice
      // even if there is only one variant.
      setActiveVariant(null);
    }
  }, [product]);

  // Derived values based on selected variant or fallback to product base values for display
  // We want to show the "Starting at" price or the first variant's price, 
  // but WITHOUT treating it as "selected".
  const displayVariant = activeVariant || (product?.variants?.length > 0 ? product.variants[0] : null) || product;

  const currentPrice = displayVariant ? Number(displayVariant.price) : 0;
  const currentDiscount = displayVariant ? Number(displayVariant.discount) : 0;
  const currentStock = displayVariant ? Number(displayVariant.stock) : 0;

  const discountedPrice = currentDiscount > 0
    ? currentPrice * (1 - currentDiscount / 100)
    : currentPrice;

  const isInStock = currentStock > 0;

  const handleAddToCart = useCallback(() => {
    if (!product) return false;

    // Check if variant selection is required
    const hasVariants = product.variants && product.variants.length > 0;

    if (hasVariants && !activeVariant) {
      setIsSidebarOpen(true);
      return false;
    }

    // Use activeVariant or fallback (only for legacy products without variants array)
    const variantToAdd = activeVariant || {
      size: product.size || 'Standard',
      _id: 'legacy-id'
    };

    // Add item quantity times
    for (let i = 0; i < quantity; i++) {
      addItem({
        id: product._id,
        name: product.itemName,
        price: currentPrice,
        discountedPrice: currentDiscount > 0
          ? discountedPrice.toFixed(2)
          : null,
        image: product.image,
        company: product.company,
        genericName: product.genericName,
        discount: currentDiscount,
        seller: product.seller,
        size: activeVariant ? activeVariant.size : (product.size || 'Standard'),
        variantId: activeVariant ? activeVariant._id : undefined
      });
    }
    return true;
  }, [product, quantity, activeVariant, currentPrice, currentDiscount, discountedPrice, addItem]);

  const handleBuyNow = useCallback(() => {
    if (handleAddToCart()) {
      navigate('/cart');
    }
  }, [handleAddToCart, navigate]);

  const handleQuantityChange = useCallback((change) => {
    setQuantity(prev => Math.max(1, prev + change));
  }, []);

  if (isLoading) {
    return <DataLoading label="Product Details" />;
  }

  if (error || !product) {
    return <LoadingError label="Product" showAction={true} />;
  }

  return (
    <div className="min-h-screen bg-[#faf9f6]">
      <Helmet>
        <title>{product.itemName} - Product Details</title>
      </Helmet>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 sm:pt-32 md:pt-40 pb-10">
        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-10 mb-10 sm:mb-12">
          {/* Left Column - Product Image */}
          <div className="relative bg-white lux-card lux-card-elevated overflow-hidden">
            {/* Product Image */}
            <div className="flex items-center justify-center min-h-[300px] sm:min-h-[400px] md:min-h-[500px] p-4 sm:p-6 md:p-8">
              <img
                src={getProductImage(product.image, product._id)}
                alt={product.itemName}
                className="max-w-full max-h-[400px] sm:max-h-[500px] md:max-h-[600px] object-contain w-full h-auto"
                onError={(e) => {
                  e.target.src = getProductImage(null, product._id);
                }}
              />
            </div>
          </div>

          {/* Right Column - Product Details */}
          <div className="flex flex-col lux-serif-text">
            {/* Shop Name */}
            <p className="text-sm text-gray-500 mb-2 font-light">Ashila</p>

            {/* Product Title */}
            <h1 className="lux-serif-text text-lg sm:text-2xl md:text-3xl font-bold text-[#4A3628] mb-2 break-words">{product.itemName}</h1>
            <div className="w-16 h-0.5 bg-[#A67856] mb-4"></div>

            {/* Price */}
            <div className="mb-4 sm:mb-6 flex items-baseline gap-3">
              <span className="lux-price-number text-base sm:text-xl md:text-2xl font-medium text-[#4A3628]">
                {discountedPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ALL
              </span>
              {currentDiscount > 0 && (
                <span className="lux-price-number text-sm sm:text-lg md:text-xl text-gray-400 line-through decoration-gray-400">
                  {currentPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ALL
                </span>
              )}
            </div>

            <div className="border-t border-[#D9BFA9] pt-6 mb-6"></div>

            {/* SIZE Selector (Variants) */}
            <div className="mb-6">
              <label className="block text-xs font-semibold text-[#4A3628] uppercase tracking-wide mb-2">
                SIZE / VARIANT
              </label>
              <div className="flex flex-wrap gap-2">
                {product.variants && product.variants.length > 0 ? (
                  product.variants.map((variant, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveVariant(variant)}
                      className={`px-4 py-2 text-sm font-medium border transition-all duration-200 ${activeVariant === variant
                        ? 'bg-[#4A3628] text-white border-[#4A3628]'
                        : 'bg-white text-[#4A3628] border-[#4A3628] hover:bg-[#EBD8C8]'
                        }`}
                    >
                      {variant.size}
                    </button>
                  ))
                ) : (
                  <div className="px-3 py-2 border border-[#4A3628] bg-white text-[#4A3628] font-medium text-sm">
                    {product.size || 'Standard'}
                  </div>
                )}
              </div>
            </div>

            {/* QUANTITY Selector */}
            <div className="mb-6">
              <label className="block text-xs font-semibold text-[#4A3628] uppercase tracking-wide mb-2">
                QUANTITY
              </label>
              <div className="flex items-center gap-2 sm:gap-3">
                <button
                  onClick={() => handleQuantityChange(-1)}
                  disabled={quantity <= 1}
                  className="w-12 h-12 sm:w-10 sm:h-10 flex items-center justify-center border-2 border-[#4A3628] hover:bg-[#EBD8C8] disabled:opacity-50 disabled:cursor-not-allowed transition-all bg-white min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 text-lg leading-none text-[#4A3628]"
                  aria-label="Decrease quantity"
                >
                  -
                </button>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => {
                    const val = parseInt(e.target.value) || 1;
                    setQuantity(Math.max(1, val));
                  }}
                  className="w-20 h-12 sm:w-16 sm:h-10 text-center border-2 border-[#4A3628] focus:outline-none bg-white text-[#4A3628] font-medium text-base sm:text-sm min-h-[44px] sm:min-h-0"
                  min="1"
                  readOnly
                />
                <button
                  onClick={() => handleQuantityChange(1)}
                  disabled={!isInStock}
                  className="w-12 h-12 sm:w-10 sm:h-10 flex items-center justify-center border-2 border-[#4A3628] hover:bg-[#EBD8C8] disabled:opacity-50 disabled:cursor-not-allowed transition-all bg-white min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 text-lg leading-none text-[#4A3628]"
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 mb-6">
              {isInStock ? (
                <>
                  <button
                    onClick={handleAddToCart}
                    className="w-full lux-btn-outline px-4 sm:px-6 py-3 sm:py-4 text-sm sm:text-base min-h-[44px]"
                  >
                    Shto ne shporte
                  </button>
                  <button
                    onClick={handleBuyNow}
                    className="w-full lux-btn-primary px-4 sm:px-6 py-3 sm:py-4 text-sm sm:text-base min-h-[44px]"
                  >
                    Buy it now
                  </button>
                </>
              ) : (
                <button
                  disabled
                  className="w-full bg-gray-200 text-gray-500 px-4 sm:px-6 py-3 sm:py-4 font-medium cursor-not-allowed min-h-[44px]"
                >
                  Sold out
                </button>
              )}
            </div>

            {/* Social Sharing */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${window.location.href}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-[#4A3628] transition-colors"
                >
                  <Facebook size={18} />
                </a>
                <a
                  href={`https://twitter.com/intent/tweet?url=${window.location.href}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-[#4A3628] transition-colors"
                >
                  <Twitter size={18} />
                </a>
                <a
                  href={`https://pinterest.com/pin/create/button/?url=${window.location.href}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-[#4A3628] transition-colors"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 19c-.721 0-1.418-.109-2.076-.312.286-.465.713-1.227.95-1.878.098-.35.595-2.394.595-2.394s.152.304.465.496c.435.287.936.46 1.526.46 2.01 0 3.38-1.843 3.38-4.31 0-1.87-1.577-3.174-3.832-3.174-2.602 0-4.198 1.928-4.198 3.922 0 1.152.44 2.17 1.561 2.553.174.071.334.041.384-.107.036-.137.124-.48.163-.656.053-.204.033-.275-.115-.455-.323-.38-.53-.873-.53-1.57 0-2.03 1.54-3.894 4.01-3.894 2.105 0 3.636 1.503 3.636 3.505 0 2.33-1.464 4.296-3.64 4.296-.712 0-1.387-.37-1.617-.863 0 0-.352 1.34-.436 1.67-.158.609-.586 1.37-.872 1.833A11.98 11.98 0 0 0 12 19z" />
                  </svg>
                </a>
                <a
                  href={`mailto:?subject=${encodeURIComponent(product.itemName)}&body=${encodeURIComponent(window.location.href)}`}
                  className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-[#4A3628] transition-colors"
                >
                  <Mail size={18} />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Product Description */}
        <div className="border-t border-[#D9BFA9] pt-8 mb-8">
          <h2 className="lux-serif-text text-xl font-semibold text-[#4A3628] mb-4">Description</h2>
          <div className="prose max-w-none text-[#4A3628] leading-relaxed lux-serif-text">
            {product.description ? (
              <p>{product.description}</p>
            ) : (
              <p>
                {product.genericName && (
                  <>
                    <strong>Generic Name:</strong> {product.genericName}
                    <br />
                  </>
                )}
                {product.company && (
                  <>
                    <strong>Company:</strong> {product.company}
                    <br />
                  </>
                )}
                {product.category?.categoryName && (
                  <>
                    <strong>Category:</strong> {product.category.categoryName}
                  </>
                )}
              </p>
            )}
          </div>
        </div>

        {/* Breaking Line */}
        <div className="border-t border-[#D9BFA9] my-12"></div>

        {/* Related Products Section */}
        {
          relatedProducts.length > 0 && (
            <div className="mt-12 lux-serif-text">
              <h2 className="text-2xl font-semibold text-[#4A3628] mb-8 text-center">Sugjerime</h2>
              <div className="relative flex items-center justify-center">
                {/* Desktop Arrows */}
                {showLeftRelatedArrow && (
                  <button
                    onClick={() => scrollRelated('left')}
                    className="hidden md:block absolute left-0 top-1/2 -translate-y-1/2 -translate-x-6 z-10 carousel-arrow p-2 shadow-lg border border-[#E0CBB5]"
                    aria-label="Scroll left"
                  >
                    <ChevronLeft size={24} className="text-[#A67856]" />
                  </button>
                )}

                {showRightRelatedArrow && (
                  <button
                    onClick={() => scrollRelated('right')}
                    className="hidden md:block absolute right-0 top-1/2 -translate-y-1/2 translate-x-6 z-10 carousel-arrow p-2 shadow-lg border border-[#E0CBB5]"
                    aria-label="Scroll right"
                  >
                    <ChevronRight size={24} className="text-[#A67856]" />
                  </button>
                )}

                {/* Mobile Arrows */}
                {showLeftRelatedArrow && (
                  <button
                    onClick={() => scrollRelated('left')}
                    className="absolute left-1 top-1/2 -translate-y-1/2 z-10 carousel-arrow p-1.5 shadow-md border border-[#E0CBB5] md:hidden"
                    aria-label="Scroll left"
                  >
                    <ChevronLeft size={18} className="text-[#A67856]" />
                  </button>
                )}

                {showRightRelatedArrow && (
                  <button
                    onClick={() => scrollRelated('right')}
                    className="absolute right-1 top-1/2 -translate-y-1/2 z-10 carousel-arrow p-1.5 shadow-md border border-[#E0CBB5] md:hidden"
                    aria-label="Scroll right"
                  >
                    <ChevronRight size={18} className="text-[#A67856]" />
                  </button>
                )}

                <div className="relative overflow-hidden px-0 -mx-4 md:mx-0 md:px-0 w-full">
                  <div
                    ref={relatedScrollRef}
                    className={`flex md:grid md:grid-cols-4 gap-3 md:gap-5 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] md:overflow-x-visible md:justify-items-center ${relatedShowScrollHint ? 'scroll-hint-right' : ''}`}
                    style={{
                      scrollBehavior: 'smooth',
                      WebkitOverflowScrolling: 'touch',
                      overscrollBehavior: 'contain',
                    }}
                  >
                    {Array.from(
                      { length: Math.ceil((relatedProducts?.length || 0) / 2) },
                      (_, slideIndex) => relatedProducts.slice(slideIndex * 2, slideIndex * 2 + 2)
                    ).map((slideProducts, slideIndex) => (
                      <div
                        key={`related-slide-${slideIndex}`}
                        className="w-full flex-shrink-0 snap-start px-1 md:w-auto md:px-0"
                      >
                        <div className="grid grid-cols-2 gap-3 md:contents">
                          {slideProducts.map((relatedProduct, index) => {
                            const relatedDiscountedPrice = relatedProduct.discount > 0
                              ? Number(relatedProduct.price) * (1 - Number(relatedProduct.discount) / 100)
                              : Number(relatedProduct.price);

                            return (
                              <div
                                key={relatedProduct._id}
                                className="swipe-hint-animation w-full border border-gray-200 overflow-hidden bg-white text-center pb-4 flex flex-col h-full cursor-pointer hover:shadow-lg transition-shadow"
                                onClick={() => {
                                  window.scrollTo({ top: 0, behavior: 'instant' });
                                  navigate(`/product/${relatedProduct._id}`);
                                }}
                              >
                                <div className="relative w-full overflow-hidden bg-[#f9f9f9] h-[200px] md:h-[250px]">
                                  <img
                                    src={getProductImage(relatedProduct.image, relatedProduct._id || index)}
                                    alt={relatedProduct.itemName}
                                    className="w-full h-full object-contain p-5"
                                    onError={(e) => {
                                      e.target.src = getProductImage(null, relatedProduct._id || index);
                                    }}
                                  />
                                  {relatedProduct.discount > 0 && (
                                    <div className="absolute top-2.5 right-2.5 bg-red-500 text-white px-2.5 py-1.5 text-sm font-bold">
                                      Save {relatedProduct.discount}%
                                    </div>
                                  )}
                                  {relatedProduct.stock === 0 && (
                                    <div className="absolute top-2.5 left-2.5 bg-red-500 text-white px-2.5 py-1.5 text-sm font-bold">
                                      Sold Out
                                    </div>
                                  )}
                                </div>

                                <div className="px-2.5 pt-4 flex flex-col flex-grow">
                                  <h3 className="lux-serif-text !text-[12px] md:!text-[14px] mb-2 text-gray-800 min-h-[24px] md:min-h-[40px] leading-snug whitespace-normal break-words">
                                    {relatedProduct.itemName}
                                  </h3>
                                  <div className="mt-auto">
                                    <div className="flex items-center justify-center gap-2.5">
                                      {relatedProduct.discount > 0 ? (
                                        <>
                                          <span className="lux-price-number text-[11px] md:text-lg font-medium text-black">
                                            {relatedDiscountedPrice.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} ALL
                                          </span>
                                          <span className="lux-price-number text-[9px] md:text-sm text-gray-400 line-through">
                                            {Number(relatedProduct.price).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} ALL
                                          </span>
                                        </>
                                      ) : (
                                        <span className="lux-price-number text-[11px] md:text-lg font-medium text-black">
                                          {Number(relatedProduct.price).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} ALL
                                        </span>
                                      )}
                                    </div>

                                    <div className="pt-3">
                                      <button
                                        type="button"
                                        disabled={relatedProduct.stock === 0}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          addItem({
                                            id: relatedProduct._id,
                                            name: relatedProduct.itemName,
                                            price: relatedProduct.price,
                                            discountedPrice:
                                              relatedProduct.discount > 0
                                                ? (Number(relatedProduct.price) * (1 - Number(relatedProduct.discount) / 100)).toFixed(2)
                                                : null,
                                            image: relatedProduct.image,
                                            company: relatedProduct.company,
                                            genericName: relatedProduct.genericName,
                                            discount: relatedProduct.discount || 0,
                                            seller: relatedProduct.seller,
                                          });
                                        }}
                                        className={`w-full px-3 py-2 text-xs md:text-sm font-semibold uppercase tracking-wide border ${relatedProduct.stock === 0
                                          ? 'bg-gray-200 border-gray-300 text-gray-500 cursor-not-allowed'
                                          : 'bg-[#8B6F47]/70 border-[#8B6F47]/70 text-white hover:bg-[#7A5F3A]/80 hover:border-[#7A5F3A]/80'
                                          } transition-colors duration-150`}
                                      >
                                        {relatedProduct.stock === 0 ? 'Out of stock' : 'Shto ne shporte'}
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Page indicator */}
              {relatedTotalPages > 1 && (
                <div className="mt-4 text-center text-sm text-[#4A3628]">
                  {relatedCurrentPage} / {relatedTotalPages}
                </div>
              )}
            </div>
          )
        }
      </div>

      <VariantSelectionSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        product={product}
        selectedVariant={activeVariant}
        onSelectVariant={setActiveVariant}
        onAddToCart={() => {
          if (handleAddToCart()) {
            setIsSidebarOpen(false);
          }
        }}
      />
    </div>
  );
};

export default ProductDetail;