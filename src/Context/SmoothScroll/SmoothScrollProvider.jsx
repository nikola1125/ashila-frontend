import React, { useEffect, useRef, useContext, useCallback } from 'react';
import Lenis from 'lenis';

const SmoothScrollContext = React.createContext(undefined);

export const SmoothScrollProvider = ({ children }) => {
  const lenisRef = useRef(null);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      smooth: true,
      smoothTouch: false,
    });
    lenisRef.current = lenis;

    let rafId;
    const raf = (time) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      try {
        lenis.destroy();
      } catch {
        // ignore
      }
      lenisRef.current = null;
    };
  }, []);

  const scrollToTop = useCallback((options = {}) => {
    if (lenisRef.current) {
      lenisRef.current.scrollTo(0, options);
    }
  }, []);

  const getScroll = useCallback(() => {
    if (lenisRef.current) {
      return lenisRef.current.scroll;
    }
    return window.scrollY;
  }, []);

  const value = {
    lenis: lenisRef.current,
    scrollToTop,
    getScroll,
  };

  return <SmoothScrollContext.Provider value={value}>{children}</SmoothScrollContext.Provider>;
};

export const useSmoothScroll = () => {
  const context = useContext(SmoothScrollContext);
  if (context === undefined) {
    throw new Error('useSmoothScroll must be used within a SmoothScrollProvider');
  }
  return context;
};