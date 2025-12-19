import React, { createContext, useContext, useRef, useEffect } from 'react';

const SmoothScrollContext = createContext();

export const useSmoothScroll = () => useContext(SmoothScrollContext);

export const SmoothScrollProvider = ({ children }) => {
  const valueRef = useRef({
    lenis: null,
    scrollTo: () => {},
    scrollToTop: () => {},
    getScroll: () => 0,
    stop: () => {},
    start: () => {},
  });

  useEffect(() => {
    const isWindows =
      typeof navigator !== 'undefined' &&
      (String(navigator.userAgent || '').toLowerCase().includes('windows') ||
        String(navigator.platform || '').toLowerCase().includes('win'));

    // Fallback to native scrolling on Windows to avoid wheel-scroll issues.
    if (isWindows) {
      const scrollTo = (target, options = {}) => {
        if (typeof target === 'number') {
          window.scrollTo({ top: target, behavior: options.immediate ? 'instant' : 'smooth' });
        } else if (target instanceof Element) {
          target.scrollIntoView({ behavior: options.immediate ? 'instant' : 'smooth' });
        }
      };

      valueRef.current = {
        lenis: null,
        scrollTo,
        scrollToTop: (options = {}) => scrollTo(0, options),
        getScroll: () => window.scrollY,
        stop: () => {},
        start: () => {},
      };

      return;
    }

    // Initialize Lenis on non-Windows platforms
    let lenisInstance = null;
    import('@studio-freight/lenis').then(({ Lenis }) => {
      lenisInstance = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        direction: 'vertical',
        gestureDirection: 'vertical',
        smooth: true,
        mouseMultiplier: 1,
        smoothTouch: false,
        touchMultiplier: 2,
        infinite: false,
      });

      function raf(time) {
        lenisInstance.raf(time);
        requestAnimationFrame(raf);
      }

      requestAnimationFrame(raf);

      valueRef.current = {
        lenis: lenisInstance,
        scrollTo: (target, options = {}) => {
          if (typeof target === 'number') {
            lenisInstance.scrollTo(target, { ...options, immediate: options.immediate });
          } else if (target instanceof Element) {
            lenisInstance.scrollTo(target, options);
          }
        },
        scrollToTop: (options = {}) => lenisInstance.scrollTo(0, options),
        getScroll: () => lenisInstance.scroll,
        stop: () => lenisInstance.stop(),
        start: () => lenisInstance.start(),
      };
    });

    return () => {
      if (lenisInstance) lenisInstance.destroy();
    };
  }, []);

  return (
    <SmoothScrollContext.Provider value={valueRef.current}>
      {children}
    </SmoothScrollContext.Provider>
  );
};