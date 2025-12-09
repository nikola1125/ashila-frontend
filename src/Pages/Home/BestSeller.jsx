import React, { useRef, useContext, useCallback, useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import useAxiosSecure from '../../hooks/useAxiosSecure';
import DataLoading from '../../Components/Common/Loaders/DataLoading';
import { ChevronLeft, ChevronRight, ShoppingBag } from 'lucide-react';
import { CartContext } from '../../Context/Cart/CartContext';

const BestSeller = () => {
  const { publicApi } = useAxiosSecure();
  const { addItem } = useContext(CartContext);
  const navigate = useNavigate();
  const scrollContainerRef = useRef(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const { data: products = [], isLoading: loading, error } = useQuery({
    queryKey: ['bestsellers', 'skincare'],
    queryFn: async () => {
      try {
        const res = await publicApi.get(`/medicines/bestsellers/skincare`);
        const list = Array.isArray(res) ? res : (res?.result || res || []);
        return Array.isArray(list) ? list : [];
      } catch (err) {
        console.warn('BestSeller fetch failed:', err);
        return [];
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: 1,
  });

  // Check scroll position and update arrow visibility
  const checkScrollPosition = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const { scrollLeft, scrollWidth, clientWidth } = container;
    const isAtStart = scrollLeft <= 10; // Small threshold for floating point issues
    const isAtEnd = scrollLeft + clientWidth >= scrollWidth - 10; // Small threshold

    setShowLeftArrow(!isAtStart);
    setShowRightArrow(!isAtEnd);

    // Calculate current page for mobile (2 items per page on mobile)
    if (window.innerWidth < 768) {
      const itemWidth = 160; // w-40 = 160px on mobile
      const gap = 24; // gap-6 = 24px
      const itemsPerPage = 2;
      const pageWidth = (itemWidth + gap) * itemsPerPage;
      const currentPageNum = Math.round(scrollLeft / pageWidth) + 1;
      const totalPagesNum = Math.ceil(products.length / itemsPerPage);
      setCurrentPage(currentPageNum);
      setTotalPages(totalPagesNum);
    }
  }, [products.length]);

  // Update arrow visibility on scroll and when products change
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container || products.length === 0) {
      setShowLeftArrow(false);
      setShowRightArrow(false);
      return;
    }

    // Check initial position
    checkScrollPosition();

    // Listen to scroll events
    container.addEventListener('scroll', checkScrollPosition);
    
    // Also check on resize
    const handleResize = () => {
      setTimeout(checkScrollPosition, 100); // Small delay to ensure layout is updated
    };
    window.addEventListener('resize', handleResize);

    return () => {
      container.removeEventListener('scroll', checkScrollPosition);
      window.removeEventListener('resize', handleResize);
    };
  }, [products, checkScrollPosition]);

  const scroll = useCallback((direction) => {
    if (scrollContainerRef.current) {
      // Calculate scroll amount: width of one product card + gap
      // Product card is w-64 (256px) + gap-6 (24px) = 280px
      // On desktop, we want to scroll by exactly one product width
      const scrollAmount = 280;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  }, []);

  const calculatePrice = useCallback((price, discount) => {
    if (discount && discount > 0) {
      const discountedPrice = price * (1 - discount / 100);
      return {
        original: price,
        discounted: Math.round(discountedPrice),
        discountPercent: discount
      };
    }
    return { original: price, discounted: null, discountPercent: 0 };
  }, []);

  const handleAddToCart = useCallback((e, product) => {
    e.stopPropagation(); // Prevent navigation when clicking add to cart
    const cartItem = {
      id: product._id,
      name: product.itemName,
      price: product.price,
      discountedPrice: product.discount > 0
        ? (Number(product.price) * (1 - Number(product.discount) / 100)).toFixed(2)
        : null,
      image: product.image,
      company: product.company,
      genericName: product.genericName,
      discount: product.discount || 0,
      seller: product.seller,
    };
    console.log('Adding to cart:', cartItem);
    addItem(cartItem);
  }, [addItem]);

  const handleProductClick = useCallback((productId) => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    navigate(`/product/${productId}`);
  }, [navigate]);

  return (
    <section className="mt-0 pt-8 pb-4 md:pt-16 md:pb-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 md:px-4">
        {/* Centered Title */}
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Best sellers</h2>
          <div className="w-16 h-0.5 bg-[#A67856] mx-auto"></div>
        </div>

        {/* Content Container with min-height to prevent layout shift */}
        <div className="min-h-[400px]">
          {/* Loading State */}
          {loading && (
            <div className="py-12">
              <DataLoading />
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="text-center py-12">
              <p className="text-gray-500">Failed to load bestseller products</p>
            </div>
          )}

          {/* Products Carousel */}
          {!loading && !error && products.length > 0 && (
            <>
              <div className="relative">
                {/* Left Arrow - Only show when scrolled, hidden on mobile */}
                {showLeftArrow && (
                  <button
                    onClick={() => scroll('left')}
                    className="hidden md:block absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-2 shadow-lg hover:bg-gray-50 transition-all"
                    aria-label="Scroll left"
                  >
                    <ChevronLeft size={24} className="text-gray-700" />
                  </button>
                )}

                {/* Scrollable Container - Show 4 products on desktop */}
                <div 
                  className="overflow-hidden px-4 md:px-12"
                  style={{
                    // On desktop, limit visible width to show exactly 4 products
                    // 4 products * 256px (w-64) + 3 gaps * 24px (gap-6) = 1024 + 72 = 1096px
                  }}
                >
                  <div
                    ref={scrollContainerRef}
                    className="flex gap-6 overflow-x-auto scroll-smooth pb-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
                  >
                    {products.map((p) => {
                      if (!p || !p._id) return null;
                      const pricing = calculatePrice(p.price, p.discount);
                      
                      return (
                        <div
                          key={p._id}
                          className="flex-shrink-0 w-40 md:w-56 bg-white overflow-hidden shadow-sm hover:shadow-lg transition-all group border-2 border-[#D9BFA9]"
                        >
                          {/* Product Image */}
                          <div 
                            className="relative h-40 md:h-56 bg-gray-100 flex items-center justify-center overflow-hidden cursor-pointer"
                            onClick={() => handleProductClick(p._id)}
                          >
                            <img
                              src={p.image || '/placeholder.png'}
                              alt={p.itemName}
                              loading="lazy"
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              onError={(e) => {
                                e.target.src = '/placeholder.png';
                              }}
                            />
                            {pricing.discountPercent > 0 && (
                              <div className="absolute top-3 right-3 bg-[#A67856] text-white px-2.5 py-1 text-xs font-semibold">
                                Save {pricing.discountPercent}%
                              </div>
                            )}
                          </div>

                          {/* Product Info */}
                          <div className="p-2 md:p-4">
                            <h3 
                              className="text-xs md:text-sm font-medium text-gray-900 line-clamp-2 mb-1 md:mb-2 min-h-[2rem] md:min-h-[2.5rem] cursor-pointer hover:text-gray-600 transition-colors"
                              onClick={() => handleProductClick(p._id)}
                            >
                              {p.itemName}
                            </h3>

                            {/* Price and Add to Cart - Side by Side */}
                            <div className="flex items-center justify-between gap-1 md:gap-2">
                              {/* Price Section - Left */}
                              <div className="flex flex-col items-start gap-0.5">
                                {pricing.discounted ? (
                                  <>
                                    <div className="flex items-baseline gap-1 md:gap-2">
                                      <span className="text-[10px] md:text-xs text-[#4A3628] font-medium">from</span>
                                      <span className="text-xs md:text-base font-semibold text-[#4A3628]">
                                        {pricing.discounted.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} ALL
                                      </span>
                                    </div>
                                    <div className="flex items-baseline gap-1">
                                      <span className="text-[9px] md:text-xs text-gray-500 line-through">
                                        {pricing.original.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} ALL
                                      </span>
                                    </div>
                                  </>
                                ) : (
                                  <span className="text-xs md:text-base font-semibold text-[#4A3628]">
                                    {pricing.original.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} ALL
                                  </span>
                                )}
                              </div>

                              {/* Add to Cart Button - Right */}
                              <button 
                                onClick={(e) => handleAddToCart(e, p)}
                                className="bg-[#A67856] hover:bg-[#8B6345] text-white px-2 py-1 md:px-3 md:py-2 text-[10px] md:text-sm font-semibold transition-all flex items-center justify-center gap-1 flex-shrink-0 border-2 border-[#A67856]"
                              >
                                <ShoppingBag size={12} className="md:w-4 md:h-4" />
                                <span className="hidden sm:inline">Add</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Right Arrow - Only show when there are more products, hidden on mobile */}
                {showRightArrow && (
                  <button
                    onClick={() => scroll('right')}
                    className="hidden md:block absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white p-2 shadow-lg hover:bg-[#EBD8C8] transition-all border-2 border-[#D9BFA9]"
                    aria-label="Scroll right"
                  >
                    <ChevronRight size={24} className="text-[#A67856]" />
                  </button>
                )}
              </div>
              
              {/* Page numbers for mobile */}
              <div className="block md:hidden mt-6 text-center text-sm text-[#4A3628] font-semibold">
                {currentPage} / {totalPages}
              </div>
            </>
          )}

          {/* Empty State - Only show when not loading and no products */}
          {!loading && !error && products.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No bestseller products available for this category</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default BestSeller;
