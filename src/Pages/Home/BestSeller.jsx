import React, { useRef, useContext, useCallback, useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import useAxiosSecure from '../../hooks/useAxiosSecure';
import DataLoading from '../../Components/Common/Loaders/DataLoading';
import { ChevronLeft, ChevronRight, ShoppingBag } from 'lucide-react';
import { CartContext } from '../../Context/Cart/CartContext';

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
    <div
      ref={productRef}
      className={`flex-shrink-0 w-40 md:w-56 overflow-hidden transition-all group bg-white scale-in ${isVisible ? 'visible' : ''} stagger-${Math.min(index + 1, 4)}`}
    >
      {/* Product Image */}
      <div 
        className="relative flex items-center justify-center w-full bg-[#EFEEED] cursor-pointer"
        style={{ aspectRatio: '1/1' }}
        onClick={() => onProductClick(product._id)}
      >
        <img
          src={product.image || '/placeholder.png'}
          alt={product.itemName}
          loading="lazy"
          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            e.target.src = '/placeholder.png';
          }}
        />
        {pricing.discountPercent > 0 && (
          <div className="absolute top-2 right-2 bg-[#A67856] text-white px-2 py-1 text-[10px] font-semibold tracking-wide">
            Save {pricing.discountPercent}%
          </div>
        )}
        {product.stock === 0 && (
          <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 text-[10px] font-semibold tracking-wide">
            Sold Out
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-2 md:p-3">
        <h3 
          className="text-[10px] md:text-xs font-medium text-gray-900 line-clamp-2 mb-1.5 cursor-pointer hover:text-gray-600 transition-colors min-h-[1.75rem]"
          onClick={() => onProductClick(product._id)}
        >
          {product.itemName}
        </h3>

        {/* Price and Add to Cart - vertically stacked like reference */}
        <div className="flex flex-col gap-1">
          <div className="flex items-baseline gap-1">
            {pricing.discounted ? (
              <>
                <span className="text-[11px] md:text-sm font-semibold text-[#A67856]">
                  from {pricing.discounted.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} ALL
                </span>
                <span className="text-[9px] md:text-xs text-gray-400 line-through">
                  {pricing.original.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} ALL
                </span>
              </>
            ) : (
              <span className="text-[11px] md:text-sm font-semibold text-[#4A3628]">
                {pricing.original.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} ALL
              </span>
            )}
          </div>

          <div className="flex justify-end pt-1">
            <button 
              onClick={(e) => onAddToCart(e, product)}
              className="bg-white hover:bg-gray-100/50 text-gray-600 px-2 md:px-3 py-1 text-[9px] md:text-xs gap-1 min-w-[70px] justify-center flex items-center transition-all duration-200"
            >
              <ShoppingBag size={11} className="md:w-4 md:h-4" />
              <span className="hidden sm:inline">Add</span>
            </button>
          </div>
        </div>
      </div>
    </div>
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
    addItem(cartItem);
  }, [addItem]);

  const handleProductClick = useCallback((productId) => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    navigate(`/product/${productId}`);
  }, [navigate]);

  return (
    <section className="mt-0 bg-white lux-section">
      <div className="lux-section-inner">
        {/* Centered Title */}
        <div className="text-center mb-10 md:mb-12 space-y-3 fade-in">
          <p className="lux-heading">Koleksioni i përzgjedhur</p>
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
                  className="relative overflow-hidden px-4 md:px-0 md:mx-auto"
                  style={{
                    // On desktop, limit visible width to show exactly 4 products
                    // 4 products * 224px (w-56) + 3 gaps * 24px (gap-6) = 896 + 72 = 968px
                    maxWidth: '968px'
                  }}
                >
                  {/* Left Arrow - Only show when scrolled, hidden on mobile */}
                  {showLeftArrow && (
                    <button
                      onClick={() => scroll('left')}
                      className="hidden md:block absolute left-0 top-1/2 -translate-y-1/2 -translate-x-12 z-10 bg-white rounded-full p-2 shadow-lg hover:bg-gray-50 transition-all"
                      aria-label="Scroll left"
                    >
                      <ChevronLeft size={24} className="text-gray-700" />
                    </button>
                  )}

                  <div
                    ref={scrollContainerRef}
                    className="flex gap-6 overflow-x-auto scroll-smooth pb-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
                  >
                    {products.map((p, index) => {
                      if (!p || !p._id) return null;
                      const pricing = calculatePrice(p.price, p.discount);
                      
                      return (
                        <ProductCard
                          key={p._id}
                          product={p}
                          pricing={pricing}
                          index={index}
                          onProductClick={handleProductClick}
                          onAddToCart={handleAddToCart}
                        />
                      );
                    })}
                  </div>

                  {/* Right Arrow - Only show when there are more products, hidden on mobile */}
                  {showRightArrow && (
                    <button
                      onClick={() => scroll('right')}
                      className="hidden md:block absolute right-0 top-1/2 -translate-y-1/2 translate-x-12 z-10 bg-white p-2 shadow-lg hover:bg-[#EBD8C8] transition-all border-2 border-[#D9BFA9]"
                      aria-label="Scroll right"
                    >
                      <ChevronRight size={24} className="text-[#A67856]" />
                    </button>
                  )}
                </div>
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