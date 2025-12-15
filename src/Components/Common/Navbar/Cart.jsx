import React, { useContext, useRef, useEffect, useCallback } from 'react';
import { CartContext } from '../../../Context/Cart/CartContext';
import { useThrottle } from '../../../hooks/useThrottle';

const Cart = ({ isScrolled = true, onCartClick, iconSize = 20, useNavColors = false, disabled = false }) => {
  const { totalQuantity } = useContext(CartContext);
  const isScrollingRef = useRef(false);
  const scrollTimeoutRef = useRef(null);
  const lastScrollYRef = useRef(window.scrollY);
  const touchStartScrollY = useRef(0);
  const shouldBlockClick = useRef(false);

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

  const handleTouchStart = () => {
    touchStartScrollY.current = window.scrollY;
    shouldBlockClick.current = false;
  };

  const handleTouchMove = () => {
    // If finger moves on the screen (swiping), block the click
    shouldBlockClick.current = true;
  };

  const handleTouchEnd = () => {
    // If scroll position changed during the touch (page scrolled), block the click
    if (Math.abs(window.scrollY - touchStartScrollY.current) > 2) {
      shouldBlockClick.current = true;
    }
  };

  const handleClick = (e) => {
    // Prevent default behavior to avoid double-firing
    e.preventDefault();
    e.stopPropagation();
    
    // 0. Check if disabled (e.g., during navbar transition)
    if (disabled) {
      return;
    }
    
    // 1. Check if we detected scroll or movement during the specific touch interaction
    if (shouldBlockClick.current) {
      shouldBlockClick.current = false;
      return;
    }

    // 2. Don't open if user is actively scrolling
    if (isScrollingRef.current) {
      return;
    }
    
    // 3. Don't open if scroll timeout is active (just finished scrolling)
    if (scrollTimeoutRef.current) {
      return;
    }

    onCartClick();
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
        WebkitTapHighlightColor: 'transparent'
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
