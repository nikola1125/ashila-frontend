import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import papulesImage from '../../assets/papules.png';
import pustulesImage from '../../assets/pustules.png';
import blackHeadsImage from '../../assets/blackHeads.jpg';
import cystImage from '../../assets/cyst.png';
import backAcneImage from '../../assets/backAcne.png';
import { getProductImage } from '../../utils/productImages';
import { useThrottle } from '../../hooks/useThrottle';

const items = [
  { key: 'papules', title: 'Papules', image: papulesImage },
  { key: 'cyst', title: 'Cyst', image: cystImage },
  { key: 'pustules', title: 'Pustules', image: pustulesImage },
  { key: 'blackhead', title: 'Blackhead', image: blackHeadsImage },
  { key: 'back-acne', title: 'Back Acne', image: backAcneImage }
];

const AcneCategories = () => {
  const navigate = useNavigate();
  const sliderRef = useRef(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [showScrollHint, setShowScrollHint] = useState(true);

  // Chunk items into groups of 2 for mobile
  const chunkedItems = useMemo(() => {
    const chunks = [];
    for (let i = 0; i < items.length; i += 2) {
      chunks.push(items.slice(i, i + 2));
    }
    return chunks;
  }, []);

  // Track scroll position for page numbers
  const handleScroll = useCallback(() => {
    const slider = sliderRef.current;
    if (!slider) return;
    const width = slider.clientWidth || 1;
    const pageIndex = Math.round(slider.scrollLeft / width);
    setCurrentPage(Math.min(chunkedItems.length, pageIndex + 1));
    
    // Hide scroll hint after user starts scrolling
    if (slider.scrollLeft > 5 && showScrollHint) {
      setShowScrollHint(false);
    }
  }, [chunkedItems.length, showScrollHint]);

  // Throttle scroll handler for better performance
  const throttledHandleScroll = useThrottle(handleScroll, 100);

  useEffect(() => {
    const slider = sliderRef.current;
    if (!slider) return;

    handleScroll();
    slider.addEventListener('scroll', throttledHandleScroll, { passive: true });
    return () => slider.removeEventListener('scroll', throttledHandleScroll);
  }, [handleScroll, throttledHandleScroll]);

  return (
    <section className="pt-0 pb-4 md:py-16 bg-white -mt-12 md:mt-0">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        {/* Centered Title */}
        <div className="text-center mb-8 md:mb-12 fade-in">
          <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-[#4A3628] mb-3 md:mb-4">
            Bli sipas llojit të akneve
          </h2>
          <div className="w-16 h-0.5 bg-[#A67856] mx-auto"></div>
        </div>

        {/* Desktop Grid Layout - 5 items with circular frames and titles below */}
        <div className="hidden lg:grid grid-cols-5 gap-6 lg:gap-8 acne-category-grid">
          {items.map((item, index) => (
            <button
              key={item.key}
              onClick={() => navigate(`/shop?category=${item.key}`)}
              className={`group flex flex-col items-center scale-in stagger-${Math.min(index + 1, 4)}`}
            >
              {/* Circular Image Frame */}
              <div className="relative w-full aspect-square mb-4 rounded-full overflow-hidden border border-[#D9BFA9] group-hover:border-[#A67856] shadow-sm group-hover:shadow-lg transition-all duration-200">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full transition-transform duration-200 group-hover:scale-105"
                  style={index < 2 ? { 
                    objectFit: 'cover', 
                    objectPosition: 'center',
                    width: '100%',
                    height: '100%',
                    transform: 'scale(1.1)'
                  } : { objectFit: 'cover' }}
                  loading="lazy"
                  onError={(e) => {
                    e.target.src = getProductImage();
                  }}
                />
              </div>
              
              {/* Title with Animated Underline */}
              <div className="flex flex-col items-center">
                <h3 className="text-[#4A3628] font-semibold text-base lg:text-lg mb-2 group-hover:text-[#A67856] transition-colors duration-200">
                  {item.title}
                </h3>
                <div className="relative w-12 h-0.5 overflow-hidden">
                  <div className="absolute inset-0 bg-[#A67856] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-center"></div>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Tablet Grid Layout - 3 columns with circular frames and titles below */}
        <div className="hidden md:grid lg:hidden grid-cols-3 gap-6">
          {items.map((item, index) => (
            <button
              key={item.key}
              onClick={() => navigate(`/shop?category=${item.key}`)}
              className={`group flex flex-col items-center scale-in stagger-${Math.min(index + 1, 4)}`}
            >
              {/* Circular Image Frame */}
              <div className="relative w-full aspect-square mb-4 rounded-full overflow-hidden border border-[#D9BFA9] group-hover:border-[#A67856] shadow-sm group-hover:shadow-lg transition-all duration-200">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full transition-transform duration-200 group-hover:scale-105"
                  style={index < 2 ? { 
                    objectFit: 'cover', 
                    objectPosition: 'center',
                    width: '100%',
                    height: '100%',
                    transform: 'scale(1.1)'
                  } : { objectFit: 'cover' }}
                  loading="lazy"
                  onError={(e) => {
                    e.target.src = getProductImage();
                  }}
                />
              </div>
              
              {/* Title with Animated Underline */}
              <div className="flex flex-col items-center">
                <h3 className="text-[#4A3628] font-semibold text-sm mb-2 group-hover:text-[#A67856] transition-colors duration-200">
                  {item.title}
                </h3>
                <div className="relative w-10 h-0.5 overflow-hidden">
                  <div className="absolute inset-0 bg-[#A67856] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-center"></div>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Mobile - Swipeable slider with 2 items per page */}
        <div className="block md:hidden fade-in relative">
          <div
            ref={sliderRef}
            className="flex overflow-x-auto snap-x snap-mandatory scroll-smooth [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden scroll-hint-right relative"
          >
            {chunkedItems.map((group, pageIndex) => (
              <div key={`page-${pageIndex}`} className="min-w-full snap-start px-2">
                <div className="grid grid-cols-2 gap-4">
                  {group.map((item, itemIndex) => {
                    // Add swipe hint animation with delay
                    const delayClass = itemIndex < 4 
                      ? `swipe-hint-animation-delay-${Math.min(itemIndex, 3)}` 
                      : '';
                    
                    return (
                    <button
                      key={item.key}
                      onClick={() => navigate(`/shop?category=${item.key}`)}
                      className={`group flex flex-col items-center scale-in stagger-${Math.min(itemIndex + 1, 4)} swipe-hint-animation ${delayClass}`}
                    >
                      {/* Circular Image Frame */}
                      <div className="relative w-full aspect-square mb-3 rounded-full overflow-hidden border border-[#D9BFA9] active:border-[#A67856] shadow-sm transition-all duration-200">
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-full h-full transition-transform duration-200 active:scale-105"
                          style={itemIndex < 2 ? { 
                            objectFit: 'cover', 
                            objectPosition: 'center',
                            width: '100%',
                            height: '100%',
                            transform: itemIndex < 2 ? 'scale(1.1)' : 'scale(1)'
                          } : { objectFit: 'cover' }}
                          loading="lazy"
                          onError={(e) => {
                            e.target.src = getProductImage();
                          }}
                        />
                      </div>
                      
                      {/* Title with Animated Underline */}
                      <div className="flex flex-col items-center w-full">
                        <h3 className="text-[#4A3628] font-semibold text-xs mb-1.5 group-active:text-[#A67856] transition-colors duration-200">
                          {item.title}
                        </h3>
                        <div className="relative w-8 h-0.5 overflow-hidden">
                          <div className="absolute inset-0 bg-[#A67856] transform scale-x-0 group-active:scale-x-100 transition-transform duration-300 origin-center"></div>
                        </div>
                      </div>
                    </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
          {/* Page numbers */}
          <div className="mt-6 text-center text-sm text-[#4A3628] font-semibold">
            {currentPage} / {chunkedItems.length}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AcneCategories;