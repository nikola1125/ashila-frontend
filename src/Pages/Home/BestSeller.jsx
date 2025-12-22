import React, { useRef, useContext, useCallback, useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import useAxiosSecure from '../../hooks/useAxiosSecure';
import DataLoading from '../../Components/Common/Loaders/DataLoading';
import { ChevronLeft, ChevronRight, ShoppingBag } from 'lucide-react';
import { CartContext } from '../../Context/Cart/CartContext';
import { getProductImage } from '../../utils/productImages';
import { useThrottle } from '../../hooks/useThrottle';

// Product Card Component with animation
const ProductCard = React.memo(({ product, pricing, index, onProductClick, onAddToCart }) => {
  const productRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Reset visibility when component mounts
    setIsVisible(false);

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
        observer.disconnect();
      }
    }, {
      threshold: 0.1,
      rootMargin: '50px'
    });

    if (productRef.current) {
      observer.observe(productRef.current);
      // Also set visible after a short delay to ensure visibility on desktop
      const timeout = setTimeout(() => {
        setIsVisible(true);
      }, 200);
      return () => {
        clearTimeout(timeout);
        observer.disconnect();
      };
    }
  }, [product._id]); // Re-run when product changes

  return (
    <motion.div
      ref={productRef}
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={isVisible ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 30, scale: 0.95 }}
      transition={{
        duration: 0.5,
        delay: index * 0.1,
        ease: [0.4, 0, 0.2, 1],
      }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      className="w-full md:w-full md:max-w-[260px] md:flex-shrink-0 border border-gray-200 overflow-hidden bg-white text-center pb-1.5 md:pb-4 flex flex-col h-full swipe-hint-animation"
    >
      {/* Product Image Container */}
      <motion.div
        className="relative w-full overflow-hidden bg-[#f9f9f9] cursor-pointer h-[145px] md:h-[240px]"
        onClick={() => onProductClick(product._id)}
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.2 }}
      >
        <motion.img
          src={getProductImage(product.image, product._id || index)}
          alt={product.itemName}
          loading="lazy"
          className="w-full h-full object-contain p-3 md:p-5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: index * 0.1 + 0.2 }}
          onError={(e) => {
            e.target.src = getProductImage(null, product._id || index);
          }}
        />
        {pricing.discountPercent > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 + 0.3 }}
            className="absolute top-1.5 md:top-2.5 right-1.5 md:right-2.5 bg-red-500 text-white px-1.5 md:px-2.5 py-1 md:py-1.5 text-xs md:text-sm font-bold"
          >
            Save <span className="lux-price-number">{pricing.discountPercent}%</span>
          </motion.div>
        )}
        {product.stock === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 + 0.3 }}
            className="absolute top-1.5 md:top-2.5 left-1.5 md:left-2.5 bg-red-500 text-white px-1.5 md:px-2.5 py-1 md:py-1.5 text-xs md:text-sm font-bold"
          >
            Sold Out
          </motion.div>
        )}
      </motion.div>

      {/* Product Info */}
      <div className="px-1.5 md:px-2.5 pt-1.5 md:pt-4 flex flex-col flex-grow">
        <h3
          className="lux-serif-text !text-[12px] md:!text-[14px] mb-1.5 md:mb-2.5 text-gray-800 leading-snug whitespace-normal break-words min-h-[24px] md:min-h-[40px] cursor-pointer hover:text-gray-600 transition-colors"
          onClick={() => onProductClick(product._id)}
        >
          {product.itemName}
        </h3>

        <div className="mt-auto">
          {/* Price */}
          <div className="flex items-center justify-center gap-1.5 md:gap-2.5 mt-0.5 md:mt-0">
            {pricing.discounted ? (
              <>
                <span className="lux-price-number text-sm md:text-lg font-medium text-amber-700">
                  {pricing.discounted.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} ALL
                </span>
                <span className="lux-price-number text-xs md:text-sm text-gray-400 line-through">
                  {pricing.original.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} ALL
                </span>
              </>
            ) : (
              <span className="lux-price-number text-sm md:text-lg font-medium text-black">
                {pricing.original.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} ALL
              </span>
            )}
          </div>

          {/* Add to Cart */}
          <div className="pt-1.5 md:pt-3">
            <button
              type="button"
              disabled={product.stock === 0}
              onClick={(e) => onAddToCart && onAddToCart(e, product)}
              className={`w-full inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 md:px-3 md:py-2 text-[11px] md:text-xs font-semibold uppercase tracking-wide border ${product.stock === 0
                ? 'bg-gray-200 border-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-[#8B6F47]/70 border-[#8B6F47]/70 text-white hover:bg-[#7A5F3A]/80 hover:border-[#7A5F3A]/80'
                } transition-colors duration-150`}
            >
              <ShoppingBag className="w-3.5 h-3.5 md:w-4 md:h-4" />
              {product.stock === 0 ? 'Out of stock' : 'Shto ne shporte'}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
});

const BestSeller = () => {
  const { publicApi } = useAxiosSecure();
  const { addItem } = useContext(CartContext);
  const navigate = useNavigate();
  const scrollContainerRef = useRef(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showScrollHint, setShowScrollHint] = useState(true);

  const { data: products = [], isLoading: loading, error } = useQuery({
    queryKey: ['bestsellers', 'skincare'],
    queryFn: async () => {
      try {
        const res = await publicApi.get(`/medicines/bestsellers`);
        const list = Array.isArray(res) ? res : (res?.result || res || []);
        return Array.isArray(list) ? list : [];
      } catch (err) {
        console.warn('BestSeller fetch failed:', err);
        return [];
      }
    },
    staleTime: 2 * 60 * 1000, // 2 minutes - will use default refetchOnMount
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

    // Hide scroll hint after user starts scrolling
    if (scrollLeft > 5 && showScrollHint) {
      setShowScrollHint(false);
    }

    // Calculate current page for mobile (2 items per full-width page)
    if (window.innerWidth < 768) {
      const pageWidth = clientWidth || 1;
      const currentPageNum = Math.round(scrollLeft / pageWidth) + 1;
      const totalPagesNum = Math.ceil((products.length || 0) / 2);
      setCurrentPage(Math.max(1, Math.min(currentPageNum, totalPagesNum)));
      setTotalPages(totalPagesNum || 1);
    }
  }, [products.length, showScrollHint]);

  // Throttle scroll handler for better performance (100ms throttle for smooth scrolling)
  const throttledCheckScrollPosition = useThrottle(checkScrollPosition, 100);

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

    // Listen to scroll events with throttling
    container.addEventListener('scroll', throttledCheckScrollPosition, { passive: true });

    // Also check on resize (debounced)
    const handleResize = () => {
      setTimeout(checkScrollPosition, 100); // Small delay to ensure layout is updated
    };
    window.addEventListener('resize', handleResize, { passive: true });

    return () => {
      container.removeEventListener('scroll', throttledCheckScrollPosition);
      window.removeEventListener('resize', handleResize);
    };
  }, [products, checkScrollPosition, throttledCheckScrollPosition]);

  const scroll = useCallback((direction) => {
    const container = scrollContainerRef.current;
    if (!container) return;

    let scrollAmount;

    if (window.innerWidth < 768) {
      // Mobile: scroll by one full page (the visible width that contains 2 products)
      scrollAmount = container.clientWidth || 1;
    } else {
      // Desktop: scroll by approximately one product card + gap
      scrollAmount = 280;
    }

    container.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    });
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
      variants: product.variants // Pass variants to trigger global selection if needed
    };
    addItem(cartItem);
  }, [addItem]);

  const handleProductClick = useCallback((productId) => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    navigate(`/product/${productId}`);
  }, [navigate]);

  return (
    <section className="mt-0 bg-white lux-section pt-4 md:pt-[5.5rem] -mt-4 md:mt-0">
      <div className="lux-section-inner">
        {/* Centered Title */}
        <div className="text-center mb-10 md:mb-12 space-y-3 fade-in">
          <h2 className="lux-title">Best sellers</h2>
          <p className="lux-subtitle mx-auto">
            Produktet më të preferuara nga klientët tanë, të kuruara për rezultate të dukshme dhe të qëndrueshme.
          </p>
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
              <div className="relative flex items-center justify-center">
                {/* Scrollable Container - Show 4 products on desktop, centered */}
                <div
                  className="relative overflow-hidden px-0 -mx-4 md:mx-auto md:px-0"
                  style={{
                    // On desktop, limit visible width to show exactly 4 products
                    // 4 products * 224px (w-56) + 3 gaps * 24px (gap-6) = 896 + 72 = 968px
                    maxWidth: '968px'
                  }}
                >
                  {/* Mobile Arrows - show on mobile when scrollable */}
                  {showLeftArrow && (
                    <button
                      onClick={() => scroll('left')}
                      className="absolute left-1 top-[40%] -translate-y-1/2 z-10 carousel-arrow p-1.5 shadow-md border border-[#E0CBB5] md:hidden"
                      aria-label="Scroll left"
                    >
                      <ChevronLeft size={18} className="text-[#A67856]" />
                    </button>
                  )}

                  {showRightArrow && (
                    <button
                      onClick={() => scroll('right')}
                      className="absolute right-1 top-[40%] -translate-y-1/2 z-10 carousel-arrow p-1.5 shadow-md border border-[#E0CBB5] md:hidden"
                      aria-label="Scroll right"
                    >
                      <ChevronRight size={18} className="text-[#A67856]" />
                    </button>
                  )}

                  {/* Left Arrow - Only show when scrolled, hidden on mobile */}
                  {showLeftArrow && (
                    <button
                      onClick={() => scroll('left')}
                      className="hidden md:block absolute left-0 top-1/2 -translate-y-1/2 -translate-x-12 z-10 carousel-arrow p-2 shadow-lg border border-[#E0CBB5]"
                      aria-label="Scroll left"
                    >
                      <ChevronLeft size={24} className="text-[#A67856]" />
                    </button>
                  )}

                  <div
                    ref={scrollContainerRef}
                    className={`flex gap-0 md:gap-5 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] ${products.length === 1 ? 'justify-center' : ''} ${products.length < 4 ? 'md:justify-center' : 'md:justify-start'
                      } ${showScrollHint ? 'scroll-hint-right' : ''} relative`}
                    style={{
                      scrollBehavior: 'smooth',
                      WebkitOverflowScrolling: 'touch',
                      overscrollBehavior: 'contain',
                    }}
                  >
                    {products.map((p, index) => {
                      if (!p || !p._id) return null;
                      const pricing = calculatePrice(p.price, p.discount);

                      // Add delay class based on index for staggered animation
                      const delayClass = index < 4
                        ? `swipe-hint-animation-delay-${Math.min(index, 3)}`
                        : '';

                      return (
                        <div
                          key={p._id}
                          className={`swipe-hint-animation ${delayClass} snap-start w-1/2 flex-shrink-0 px-1 md:w-[227px] md:px-0`}
                        >
                          <ProductCard
                            product={p}
                            pricing={pricing}
                            index={index}
                            onProductClick={handleProductClick}
                            onAddToCart={handleAddToCart}
                          />
                        </div>
                      );
                    })}
                  </div>

                  {/* Right Arrow - Only show when there are more products, hidden on mobile */}
                  {showRightArrow && (
                    <button
                      onClick={() => scroll('right')}
                      className="hidden md:block absolute right-0 top-1/2 -translate-y-1/2 translate-x-12 z-10 carousel-arrow p-2 shadow-lg border border-[#E0CBB5]"
                      aria-label="Scroll right"
                    >
                      <ChevronRight size={24} className="text-[#A67856]" />
                    </button>
                  )}
                </div>
              </div>

              {/* Page numbers for mobile */}
              <div className="block md:hidden mt-6 text-center text-sm text-[#4A3628] font-semibold font-sans" style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
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