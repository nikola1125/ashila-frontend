import React, { useState, useEffect, useCallback } from 'react';
import { ChevronUp } from 'lucide-react';
import { useThrottle } from '../../hooks/useThrottle';
import { useSmoothScroll } from '../../Context/SmoothScroll/SmoothScrollProvider';

const ScrollToTopButton = () => {
  const [isVisible, setIsVisible] = useState(false);
  const { scrollToTop, getScroll, lenis } = useSmoothScroll();

  const toggleVisibility = useCallback(() => {
    // Robust detection from multiple sources
    const winScroll = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
    const lenisScroll = lenis?.scroll || 0;
    const providerScroll = getScroll ? getScroll() : 0;

    // Use the highest detected value
    const currentScroll = Math.max(winScroll, lenisScroll, providerScroll);

    // Show button at 30px to make it very easy to see during testing
    setIsVisible(currentScroll > 30);
  }, [lenis, getScroll]);

  // Faster throttle (50ms) for smoother response
  const throttledToggleVisibility = useThrottle(toggleVisibility, 50);

  useEffect(() => {
    // Initial check position
    toggleVisibility();

    // Listen to everything
    window.addEventListener('scroll', throttledToggleVisibility, { passive: true });

    // If Lenis is active, listen to its scroll event too
    if (lenis) {
      lenis.on('scroll', throttledToggleVisibility);
    }

    return () => {
      window.removeEventListener('scroll', throttledToggleVisibility);
      if (lenis) {
        lenis.off('scroll', throttledToggleVisibility);
      }
    };
  }, [toggleVisibility, throttledToggleVisibility, lenis]);

  const handleScrollToTop = () => {
    // 1. Try Lenis directly (most reliable if active)
    if (lenis && typeof lenis.scrollTo === 'function') {
      lenis.scrollTo(0, { immediate: false });
      return;
    }

    // 2. Try the provider's scrollToTop
    if (scrollToTop && typeof scrollToTop === 'function') {
      scrollToTop({ immediate: false });
    }

    // 3. Robust Native Fallback (Smooth)
    // We fire these anyway to ensure the browser captures the intent
    try {
      window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });

      // Some browsers require targeting documentElement specifically
      if (document.documentElement && document.documentElement.scrollTop > 0) {
        document.documentElement.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (e) {
      console.warn('Native smooth scroll failed:', e);
    }
  };

  return (
    <button
      onClick={handleScrollToTop}
      className={`fixed right-6 z-[1000] bg-transparent text-[#A67856] p-3.5 transition-all duration-500 flex items-center justify-center min-h-[48px] min-w-[48px] group ${isVisible
        ? 'opacity-100 translate-y-0 pointer-events-auto'
        : 'opacity-0 translate-y-10 pointer-events-none'
        }`}
      style={{
        bottom: 'calc(6rem + env(safe-area-inset-bottom, 0px))',
      }}
      aria-label="Scroll to top"
    >
      <ChevronUp size={24} strokeWidth={2.5} className="transition-transform duration-300 group-hover:-translate-y-1" />
    </button>
  );
};

export default ScrollToTopButton;

