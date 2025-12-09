import React, { useContext } from 'react';
import { CartContext } from '../../../Context/Cart/CartContext';

const Cart = ({ isScrolled = true, onCartClick, iconSize = 20 }) => {
  const { totalQuantity } = useContext(CartContext);

  return (
    <button
      onClick={onCartClick}
      className="relative p-1.5 hover:opacity-80 transition-opacity min-h-[44px] min-w-[44px] flex items-center justify-center"
      aria-label="Open cart"
    >
      <div className="relative">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={isScrolled ? 'text-[#A67856]' : 'text-white'}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          width={iconSize}
          height={iconSize}
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
