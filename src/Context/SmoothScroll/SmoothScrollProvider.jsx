import React, { useEffect, useRef, createContext, useContext } from 'react';
import Lenis from 'lenis';

const SmoothScrollContext = createContext(null);

export const useSmoothScroll = () => {
  const context = useContext(SmoothScrollContext);
  return context;
};

export const SmoothScrollProvider = ({ children }) => {
  const lenisRef = useRef(null);
  const valueRef = useRef({});

  useEffect(() => {
    // Detect if device is mobile
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || window.innerWidth < 768;
    
    // Initialize Lenis smooth scroll - works on both desktop and mobile
    const lenis = new Lenis({
      duration: isMobile ? 1.0 : 1.2, // Slightly faster on mobile for better feel
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true, // Desktop smooth scrolling
      wheelMultiplier: 1,
      smoothTouch: true, // Enable smooth scrolling on mobile too
      touchMultiplier: isMobile ? 1.5 : 2, // Adjusted for mobile
      infinite: false,
    });

    lenisRef.current = lenis;

    // Scroll to function
    const scrollTo = (target, options = {}) => {
      if (lenis) {
        if (options.immediate) {
          lenis.scrollTo(target, { immediate: true });
        } else {
          lenis.scrollTo(target, {
            duration: options.duration || 1.2,
            easing: options.easing || undefined,
            offset: options.offset || 0,
          });
        }
      } else {
        // Fallback to native scroll
        if (typeof target === 'number') {
          window.scrollTo({ top: target, behavior: options.immediate ? 'instant' : 'smooth' });
        } else if (target instanceof Element) {
          target.scrollIntoView({ behavior: options.immediate ? 'instant' : 'smooth' });
        }
      }
    };

    // Scroll to top
    const scrollToTop = (options = {}) => {
      scrollTo(0, options);
    };

    // Get scroll position
    const getScroll = () => {
      if (lenis) {
        return lenis.scroll;
      }
      return window.scrollY;
    };

    // Stop smooth scroll (useful for instant scrolls)
    const stop = () => {
      if (lenis) {
        lenis.stop();
      }
    };

    // Start smooth scroll
    const start = () => {
      if (lenis) {
        lenis.start();
      }
    };

    // Update value ref
    valueRef.current = {
      lenis,
      scrollTo,
      scrollToTop,
      getScroll,
      stop,
      start,
    };

    // Animation frame loop
    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    // Cleanup
    return () => {
      lenis.destroy();
    };
  }, []);

  return (
    <SmoothScrollContext.Provider value={valueRef.current}>
      {children}
    </SmoothScrollContext.Provider>
  );
};

