import React, { useState, useRef, useMemo, useContext, useCallback, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import useAxiosSecure from '../../hooks/useAxiosSecure';
import DataLoading from '../../Components/Common/Loaders/DataLoading';
import { ChevronLeft, ChevronRight, ShoppingBag } from 'lucide-react';
import { CartContext } from '../../Context/Cart/CartContext';

const BestSeller = () => {
  const sectionRef = useRef(null);
  const { publicApi } = useAxiosSecure();
  const { addItem } = useContext(CartContext);
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('skincare');
  const scrollContainerRef = useRef(null);

  const categories = useMemo(() => [
    { id: 'skincare', label: 'Skincare bestsellers' },
    { id: 'hair', label: 'Kujdesi për flokët' },
    { id: 'body', label: 'Kujdesi për trupin' }
  ], []);

  const { data: products = [], isLoading: loading, error } = useQuery({
    queryKey: ['bestsellers', activeCategory],
    queryFn: async () => {
      try {
        const res = await publicApi.get(`/medicines/bestsellers/${activeCategory}`);
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

  const scroll = useCallback((direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = 400;
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
    addItem({
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
    });
  }, [addItem]);

  const handleProductClick = useCallback((productId) => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    navigate(`/product/${productId}`);
  }, [navigate]);

  // Parallax scroll effect - move section up as user scrolls down
  useEffect(() => {
    let ticking = false;
    let rafId = null;
    const sectionElement = sectionRef.current;

    if (!sectionElement) return;

    const handleScroll = () => {
      if (!ticking) {
        rafId = requestAnimationFrame(() => {
          const scrollY = window.scrollY;
          const viewportHeight = window.innerHeight;
          
          // Only apply parallax when scrolled past the hero section
          if (scrollY > viewportHeight * 0.3) {
            const parallaxAmount = (scrollY - viewportHeight * 0.3) * 0.3; // Move up at 30% of scroll speed
            sectionElement.style.transform = `translateY(-${parallaxAmount}px)`;
          } else {
            sectionElement.style.transform = 'translateY(0)';
          }
          
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
    };
  }, []);

  return (
    <section ref={sectionRef} className="pt-0 pb-16 md:pt-8 md:pb-16 bg-white relative z-10 transition-transform duration-75 ease-out">
      <div className="max-w-7xl mx-auto px-4">
        {/* Category Tabs */}
        <div className="flex items-center gap-8 mb-8 border-b border-gray-200">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`pb-4 px-2 text-sm font-medium transition-colors relative ${
                activeCategory === cat.id
                  ? 'text-gray-900'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {cat.label}
              {activeCategory === cat.id && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900" />
              )}
            </button>
          ))}
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
            <div className="relative">
            {/* Left Arrow */}
            <button
              onClick={() => scroll('left')}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-2 shadow-lg hover:bg-gray-50 transition-all"
              aria-label="Scroll left"
            >
              <ChevronLeft size={24} className="text-gray-700" />
            </button>

            {/* Scrollable Container */}
            <div
              ref={scrollContainerRef}
              className="flex gap-6 overflow-x-auto scroll-smooth pb-4 px-12 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
            >
              {products.map((p) => {
                if (!p || !p._id) return null;
                const pricing = calculatePrice(p.price, p.discount);
                
                return (
                  <div
                    key={p._id}
                    className="flex-shrink-0 w-64 bg-white overflow-hidden shadow-sm hover:shadow-lg transition-all group border-2 border-[#d4d4c4]"
                  >
                    {/* Product Image */}
                    <div 
                      className="relative h-64 bg-gray-100 flex items-center justify-center overflow-hidden cursor-pointer"
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
                        <div className="absolute top-3 right-3 bg-[#946259] text-white px-2.5 py-1 text-xs font-semibold">
                          Save {pricing.discountPercent}%
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="p-4">
                      <h3 
                        className="text-sm font-medium text-gray-900 line-clamp-2 mb-2 min-h-[2.5rem] cursor-pointer hover:text-gray-600 transition-colors"
                        onClick={() => handleProductClick(p._id)}
                      >
                        {p.itemName}
                      </h3>

                      {/* Price and Add to Cart - Side by Side */}
                      <div className="flex items-center justify-between gap-2">
                        {/* Price Section - Left */}
                        <div className="flex items-baseline gap-2">
                          {pricing.discounted ? (
                            <>
                              <span className="text-base font-semibold text-gray-900">
                                from {pricing.discounted.toLocaleString()} ALL
                              </span>
                              <span className="text-sm text-gray-500 line-through">
                                {pricing.original.toLocaleString()} ALL
                              </span>
                            </>
                          ) : (
                            <span className="text-base font-semibold text-gray-900">
                              {pricing.original.toLocaleString()} ALL
                            </span>
                          )}
                        </div>

                        {/* Add to Cart Button - Right */}
                        <button 
                          onClick={(e) => handleAddToCart(e, p)}
                          className="bg-[#946259] hover:bg-[#7a4f47] text-white px-3 py-2 text-sm font-semibold transition-all flex items-center justify-center gap-1 flex-shrink-0 border-2 border-[#946259]"
                        >
                          <ShoppingBag size={16} />
                          <span className="hidden sm:inline">Add</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Right Arrow */}
            <button
              onClick={() => scroll('right')}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white p-2 shadow-lg hover:bg-[#faf9f6] transition-all border-2 border-[#d4d4c4]"
              aria-label="Scroll right"
            >
              <ChevronRight size={24} className="text-[#946259]" />
            </button>
          </div>
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
