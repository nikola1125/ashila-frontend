import React, { useContext, useRef, useEffect } from 'react';
import { CartContext } from '../../../Context/Cart/CartContext';

const Cart = ({ isScrolled = true, onCartClick, iconSize = 20 }) => {
  const { totalQuantity } = useContext(CartContext);
  const touchStartRef = useRef(null);
  const touchMovedRef = useRef(false);
  const isScrollingRef = useRef(false);
  const scrollTimeoutRef = useRef(null);

  // Track if user is actively scrolling
  useEffect(() => {
    let scrollTimer = null;
    
    const handleScroll = () => {
      isScrollingRef.current = true;
      
      // Clear existing timeout
      if (scrollTimer) {
        clearTimeout(scrollTimer);
      }
      
      // Set scrolling to false after scroll stops
      scrollTimer = setTimeout(() => {
        isScrollingRef.current = false;
      }, 150);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimer) {
        clearTimeout(scrollTimer);
      }
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  const handleTouchStart = (e) => {
    // Prevent event from bubbling up
    e.stopPropagation();
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
      
      // If moved more than 8px OR page scrolled, consider it a scroll, not a tap
      if (deltaX > 8 || deltaY > 8 || scrollDelta > 5) {
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
      
      // Only trigger if:
      // 1. It was a quick tap (less than 250ms)
      // 2. Minimal movement (already checked via touchMovedRef)
      // 3. Page didn't scroll during the touch
      // 4. User is not actively scrolling
      if (timeDiff < 250 && scrollDelta < 3 && !isScrollingRef.current) {
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
          className={`transition-colors duration-300 ease-in-out ${isScrolled ? 'text-[#A67856]' : 'text-white'}`}
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
