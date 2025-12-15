import React, { useContext, useRef, useEffect, useCallback } from 'react';
import { CartContext } from '../../../Context/Cart/CartContext';
import { useThrottle } from '../../../hooks/useThrottle';

const Cart = ({ isScrolled = true, onCartClick, iconSize = 20, useNavColors = false }) => {
  const { totalQuantity } = useContext(CartContext);
  const touchStartRef = useRef(null);
  const touchMovedRef = useRef(false);
  const isScrollingRef = useRef(false);
  const scrollTimeoutRef = useRef(null);
  const lastScrollYRef = useRef(window.scrollY);

  // Track if user is actively scrolling - longer timeout to prevent accidental opens
  const handleScroll = useCallback(() => {
    const currentScrollY = window.scrollY;
    const lastScrollY = lastScrollYRef.current;
    const scrollDelta = Math.abs(currentScrollY - lastScrollY);
    
    // Update last scroll position
    lastScrollYRef.current = currentScrollY;
    
    // If scroll is significant, mark as scrolling
    if (scrollDelta > 1) {
      isScrollingRef.current = true;
      
      // Clear existing timeout
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      
      // Set scrolling to false after scroll stops (longer delay to prevent accidental opens)
      // Increased delay to prevent cart from opening during navbar color transition
      scrollTimeoutRef.current = setTimeout(() => {
        isScrollingRef.current = false;
      }, 500); // Increased from 300ms to 500ms
    }
  }, []);

  // Throttle scroll handler for better performance
  const throttledHandleScroll = useThrottle(handleScroll, 50);

  useEffect(() => {
    window.addEventListener('scroll', throttledHandleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', throttledHandleScroll);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [throttledHandleScroll]);

  const handleTouchStart = (e) => {
    // Prevent event from bubbling up
    e.stopPropagation();
    
    // Don't start touch handling if user is actively scrolling
    // This prevents cart from opening when navbar changes color during scroll
    if (isScrollingRef.current) {
      touchStartRef.current = null;
      return;
    }
    
    // Additional check: if scroll timeout is active, don't allow touch
    // This prevents opening during the delay period after scrolling stops
    if (scrollTimeoutRef.current) {
      touchStartRef.current = null;
      return;
    }
    
    touchStartRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
      time: Date.now(),
      scrollY: window.scrollY
    };
    touchMovedRef.current = false;
  };

  const handleTouchMove = (e) => {
    if (touchStartRef.current) {
      const deltaX = Math.abs(e.touches[0].clientX - touchStartRef.current.x);
      const deltaY = Math.abs(e.touches[0].clientY - touchStartRef.current.y);
      const scrollDelta = Math.abs(window.scrollY - touchStartRef.current.scrollY);
      
      // Much stricter: if moved more than 5px OR page scrolled at all, consider it a scroll, not a tap
      if (deltaX > 5 || deltaY > 5 || scrollDelta > 1) {
        touchMovedRef.current = true;
      }
    }
  };

  const handleTouchEnd = (e) => {
    // Prevent event from bubbling up
    e.stopPropagation();
    
    if (touchStartRef.current && !touchMovedRef.current) {
      const timeDiff = Date.now() - touchStartRef.current.time;
      const scrollDelta = Math.abs(window.scrollY - touchStartRef.current.scrollY);
      
      // Very strict conditions - only trigger if:
      // 1. It was a very quick tap (less than 200ms)
      // 2. Absolutely no movement (already checked via touchMovedRef)
      // 3. Page didn't scroll at all during the touch (scrollDelta must be 0)
      // 4. User is not actively scrolling (with extra check)
      // 5. Final touch position matches start position (within 2px tolerance)
      const finalDeltaX = Math.abs(e.changedTouches[0].clientX - touchStartRef.current.x);
      const finalDeltaY = Math.abs(e.changedTouches[0].clientY - touchStartRef.current.y);
      
      // More strict conditions to prevent opening during scroll/navbar transitions
      if (
        timeDiff < 200 && 
        scrollDelta === 0 && 
        !isScrollingRef.current &&
        finalDeltaX < 2 &&
        finalDeltaY < 2 &&
        !scrollTimeoutRef.current // Don't open if scroll timeout is still active
      ) {
        e.preventDefault();
        onCartClick();
      }
    }
    touchStartRef.current = null;
    touchMovedRef.current = false;
  };

  const handleClick = (e) => {
    // For mouse clicks, always allow
    if (e.type === 'click' && !e.touches) {
      onCartClick();
    }
  };

  return (
    <button
      onClick={handleClick}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="relative p-1.5 hover:opacity-80 transition-opacity min-h-[44px] min-w-[44px] flex items-center justify-center"
      aria-label="Open cart"
      style={{ 
        touchAction: 'manipulation',
        WebkitTouchCallout: 'none',
        WebkitUserSelect: 'none',
        userSelect: 'none'
      }}
    >
      <div className="relative">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`transition-colors duration-300 ease-in-out ${
            useNavColors ? 'text-[#5A3F2A] hover:text-[#4A3320]' : (isScrolled ? 'text-[#A67856]' : 'text-white')
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          width={iconSize}
          height={iconSize}
          style={{ willChange: 'color' }}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
        {totalQuantity > 0 && (
          <span className="cart-badge absolute -top-0.5 -right-0.5 bg-black text-yellow-400 text-[8px] font-bold w-3.5 h-3.5 flex items-center justify-center leading-none">
            {totalQuantity}
          </span>
        )}
      </div>
    </button>
  );
};

export default Cart;
