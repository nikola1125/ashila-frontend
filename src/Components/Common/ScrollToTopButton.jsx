import React, { useState, useEffect, useCallback } from 'react';
import { ChevronUp } from 'lucide-react';
import { useThrottle } from '../../hooks/useThrottle';
import { useSmoothScroll } from '../../Context/SmoothScroll/SmoothScrollProvider';

const ScrollToTopButton = () => {
  const [isVisible, setIsVisible] = useState(false);
  const { scrollToTop, getScroll, lenis } = useSmoothScroll();

  const toggleVisibility = useCallback(() => {
    // Show button when user scrolls down 30px
    const scrollY = getScroll ? getScroll() : window.scrollY;
    // Show button almost immediately (30px)
    if (scrollY > 30) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, [getScroll]);

  // Throttle scroll handler for better performance
  const throttledToggleVisibility = useThrottle(toggleVisibility, 100);

  useEffect(() => {
    // Check initial scroll position
    toggleVisibility();

    // Listen to Lenis scroll events if available, otherwise use window scroll
    if (lenis) {
      lenis.on('scroll', throttledToggleVisibility);
      return () => {
        lenis.off('scroll', throttledToggleVisibility);
      };
    } else {
      // Fallback to window scroll
      window.addEventListener('scroll', throttledToggleVisibility, { passive: true });
      return () => {
        window.removeEventListener('scroll', throttledToggleVisibility);
      };
    }
  }, [toggleVisibility, throttledToggleVisibility, lenis]);

  const handleScrollToTop = () => {
    if (scrollToTop) {
      scrollToTop({ immediate: false });
    } else {
      // Fallback to native scroll
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  };

  if (!isVisible) {
    return null;
  }

  return (
    <button
      onClick={handleScrollToTop}
      className="fixed bottom-6 right-6 md:bottom-8 md:right-8 z-[9999] bg-transparent hover:bg-transparent text-[#5A3F2A] p-3 md:p-4 rounded-full transition-all duration-300 transform hover:scale-110 hover:-translate-y-1 active:scale-95 flex items-center justify-center min-h-[44px] min-w-[44px] md:min-h-[50px] md:min-w-[50px]"
      aria-label="Scroll to top"
      style={{ aspectRatio: '1/1' }}
    >
      <ChevronUp size={24} className="md:w-6 md:h-6 text-[#5A3F2A] transition-transform duration-300 hover:scale-110" />
    </button>
  );
};

export default ScrollToTopButton;

