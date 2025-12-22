import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';

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
  const desktopSliderRef = useRef(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [showScrollHint, setShowScrollHint] = useState(true);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);
  const [showLeftMobileArrow, setShowLeftMobileArrow] = useState(false);
  const [showRightMobileArrow, setShowRightMobileArrow] = useState(false);

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

    // Update mobile arrow visibility based on scroll position
    const maxScrollLeft = slider.scrollWidth - slider.clientWidth;
    const isAtStart = slider.scrollLeft <= 5;
    const isAtEnd = slider.scrollLeft >= maxScrollLeft - 5;

    const hasOverflow = maxScrollLeft > 5;
    setShowLeftMobileArrow(hasOverflow && !isAtStart);
    setShowRightMobileArrow(hasOverflow && !isAtEnd);
  }, [chunkedItems.length, showScrollHint]);

  // Throttle scroll handler for better performance
  const throttledHandleScroll = useThrottle(handleScroll, 100);

  // Desktop scroll position and arrow visibility
  const checkDesktopScroll = useCallback(() => {
    const slider = desktopSliderRef.current;
    if (!slider) return;

    const { scrollLeft, scrollWidth, clientWidth } = slider;
    const hasOverflow = scrollWidth > clientWidth + 10;
    const isAtStart = scrollLeft <= 10;
    const isAtEnd = scrollLeft + clientWidth >= scrollWidth - 10;

    setShowLeftArrow(hasOverflow && !isAtStart);
    setShowRightArrow(hasOverflow && !isAtEnd);
  }, []);

  const throttledCheckDesktopScroll = useThrottle(checkDesktopScroll, 100);

  useEffect(() => {
    const slider = sliderRef.current;

    if (!slider) return;

    // Initial check with a small delay to ensure layout is ready
    const checkInitial = () => {
      const maxScrollLeft = slider.scrollWidth - slider.clientWidth;
      const hasOverflow = maxScrollLeft > 5;
      const isAtStart = slider.scrollLeft <= 5;
      const isAtEnd = slider.scrollLeft >= maxScrollLeft - 5;

      setShowLeftMobileArrow(hasOverflow && !isAtStart);
      setShowRightMobileArrow(hasOverflow && !isAtEnd);
    };

    checkInitial();
    setTimeout(checkInitial, 100);

    slider.addEventListener('scroll', throttledHandleScroll, { passive: true });

    const handleResize = () => {
      setTimeout(checkInitial, 100);
    };
    window.addEventListener('resize', handleResize, { passive: true });

    return () => {
      slider.removeEventListener('scroll', throttledHandleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, [throttledHandleScroll]);

  useEffect(() => {
    const slider = desktopSliderRef.current;
    if (!slider) {
      setShowLeftArrow(false);
      setShowRightArrow(false);
      return;
    }

    checkDesktopScroll();

    slider.addEventListener('scroll', throttledCheckDesktopScroll, { passive: true });
    const handleResize = () => {
      setTimeout(checkDesktopScroll, 100);
    };
    window.addEventListener('resize', handleResize, { passive: true });

    return () => {
      slider.removeEventListener('scroll', throttledCheckDesktopScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, [checkDesktopScroll, throttledCheckDesktopScroll]);

  const scrollDesktop = useCallback((direction) => {
    const slider = desktopSliderRef.current;
    if (!slider) return;

    const firstChild = slider.firstElementChild;
    const cardWidth = firstChild ? firstChild.clientWidth : 260;
    const gap = 24; // approx gap-6
    const scrollAmount = cardWidth + gap;

    slider.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  }, []);

  const scrollMobile = useCallback((direction) => {
    const slider = sliderRef.current;
    if (!slider) return;

    const width = slider.clientWidth || 1;

    slider.scrollBy({
      left: direction === 'left' ? -width : width,
      behavior: 'smooth',
    });
  }, []);

  return (
    <section className="pt-0 pb-4 md:pt-8 md:pb-16 bg-white -mt-12 md:mt-0">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        {/* Centered Title */}
        <div className="text-center mb-8 md:mb-12 fade-in">
          <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-[#4A3628] mb-3 md:mb-4">
            Bli sipas llojit të akneve
          </h2>
          <div className="w-16 h-0.5 bg-[#A67856] mx-auto"></div>
        </div>

        {/* Desktop Grid Layout - 5 items with circular frames and titles below */}
        <div className="hidden lg:block relative">
          <div className="relative overflow-hidden">
            {showLeftArrow && (
              <button
                onClick={() => scrollDesktop('left')}
                className="hidden lg:block absolute left-0 top-1/2 -translate-y-1/2 -translate-x-6 z-10 carousel-arrow p-2 shadow-lg border border-[#E0CBB5]"
                aria-label="Scroll left"
              >
                <ChevronLeft size={24} className="text-[#A67856]" />
              </button>
            )}

            <div
              ref={desktopSliderRef}
              className="flex gap-6 lg:gap-8 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden scroll-smooth acne-category-grid"
            >
              {items.map((item, index) => (
                <button
                  key={item.key}
                  onClick={() => navigate(`/shop?skinProblem=${item.key}`)}
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

            {showRightArrow && (
              <button
                onClick={() => scrollDesktop('right')}
                className="hidden lg:block absolute right-0 top-1/2 -translate-y-1/2 translate-x-6 z-10 carousel-arrow p-2 shadow-lg border border-[#E0CBB5]"
                aria-label="Scroll right"
              >
                <ChevronRight size={24} className="text-[#A67856]" />
              </button>
            )}
          </div>
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

        {/* Mobile Carousel Layout - 2 items per page with swipe */}
        <div className="md:hidden relative">
          <div className="relative">
            {showLeftMobileArrow && (
              <button
                onClick={() => scrollMobile('left')}
                className="absolute left-1 top-[45%] -translate-y-1/2 z-10 carousel-arrow p-1.5 shadow-md border border-[#E0CBB5]"
                aria-label="Scroll left"
              >
                <ChevronLeft size={18} className="text-[#A67856]" />
              </button>
            )}

            {showRightMobileArrow && (
              <button
                onClick={() => scrollMobile('right')}
                className="absolute right-1 top-[45%] -translate-y-1/2 z-10 carousel-arrow p-1.5 shadow-md border border-[#E0CBB5]"
                aria-label="Scroll right"
              >
                <ChevronRight size={18} className="text-[#A67856]" />
              </button>
            )}

            <div
              ref={sliderRef}
              className="flex overflow-x-auto snap-x snap-mandatory scroll-smooth [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden scroll-hint-right"
            >
              {chunkedItems.map((group, pageIndex) => (
                <div key={`page-${pageIndex}`} className="min-w-full snap-start px-2">
                  <div className="grid grid-cols-2 gap-4">
                    {group.map((item, itemIndex) => {
                      const delayClass = itemIndex < 4
                        ? `swipe-hint-animation-delay-${Math.min(itemIndex, 3)}`
                        : '';

                      return (
                        <button
                          key={item.key}
                          onClick={() => navigate(`/shop?skinProblem=${item.key}`)}
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