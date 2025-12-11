import React, { useContext, useRef } from 'react';
import { CartContext } from '../../../Context/Cart/CartContext';

const Cart = ({ isScrolled = true, onCartClick, iconSize = 20 }) => {
  const { totalQuantity } = useContext(CartContext);
  const touchStartRef = useRef(null);
  const touchMovedRef = useRef(false);

  const handleTouchStart = (e) => {
    touchStartRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
      time: Date.now()
    };
    touchMovedRef.current = false;
  };

  const handleTouchMove = (e) => {
    if (touchStartRef.current) {
      const deltaX = Math.abs(e.touches[0].clientX - touchStartRef.current.x);
      const deltaY = Math.abs(e.touches[0].clientY - touchStartRef.current.y);
      // If moved more than 10px, consider it a scroll, not a tap
      if (deltaX > 10 || deltaY > 10) {
        touchMovedRef.current = true;
      }
    }
  };

  const handleTouchEnd = (e) => {
    if (touchStartRef.current && !touchMovedRef.current) {
      const timeDiff = Date.now() - touchStartRef.current.time;
      // Only trigger if it was a quick tap (less than 300ms) and minimal movement
      if (timeDiff < 300) {
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
      style={{ touchAction: 'manipulation' }}
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
