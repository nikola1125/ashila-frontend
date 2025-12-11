import React, { useContext, useEffect, useMemo, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { CartContext } from '../../../Context/Cart/CartContext';
import { AuthContext } from '../../../Context/Auth/AuthContext';
import useAxiosSecure from '../../../hooks/useAxiosSecure';
import { toast } from 'react-toastify';
import { groupItemsBySeller } from '../../../utils/groupItemsBySeller';
import { X, Plus, Minus, Trash2, Bell } from 'lucide-react';

const CartSidebar = ({ isOpen, onClose }) => {
  // Prevent body scroll when cart is open (iOS-safe approach)
  useEffect(() => {
    if (!isOpen) return;
    
    // Store original values
    const scrollY = window.scrollY;
    const body = document.body;
    const html = document.documentElement;
    
    // Prevent backdrop clicks from triggering multiple times
    body.style.pointerEvents = 'none';
    const sidebar = document.querySelector('[data-cart-sidebar]');
    if (sidebar) {
      sidebar.style.pointerEvents = 'auto';
    }
    
    // iOS-safe body scroll lock
    body.style.position = 'fixed';
    body.style.top = `-${scrollY}px`;
    body.style.width = '100%';
    body.style.overflow = 'hidden';
    html.style.overflow = 'hidden';
    
    return () => {
      // Restore scroll position
      body.style.position = '';
      body.style.top = '';
      body.style.width = '';
      body.style.overflow = '';
      html.style.overflow = '';
      body.style.pointerEvents = 'auto';
      window.scrollTo(0, scrollY);
    };
  }, [isOpen]);

  const navigate = useNavigate();
  const {
    items: rawItems,
    totalQuantity,
    totalPrice,
    discountedTotal,
    removeItem,
    updateQuantity,
  } = useContext(CartContext);
  const { user } = useContext(AuthContext);
  const { privateApi } = useAxiosSecure();

  // Ensure items is always an array
  const cartItems = useMemo(() => {
    if (!rawItems) return [];
    return Array.isArray(rawItems) ? rawItems : [];
  }, [rawItems]);

  const handleCheckout = async () => {
    try {
      if (!user) {
        toast.warn('Please log in to proceed with checkout');
        onClose();
        navigate('/login');
        return;
      }
      const sellersGroup = groupItemsBySeller(cartItems);
      const response = await privateApi.post('/checkout', sellersGroup);
      if (response) {
        window.location.href = response;
      } else {
        throw new Error('Invalid response from checkout API');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast.warn(error.message || 'An error occurred during checkout');
    }
  };

  const backdropRef = useRef(null);
  const sidebarRef = useRef(null);

  const handleBackdropClick = useCallback((e) => {
    // Only close if clicking directly on backdrop, not on sidebar content
    // Use refs for more reliable checking on mobile
    // Prevent touch events from triggering clicks
    if (e.type === 'touchstart' || e.type === 'touchmove') {
      return;
    }
    if (
      e.target === backdropRef.current ||
      (backdropRef.current && backdropRef.current.contains(e.target) && 
       !(sidebarRef.current && sidebarRef.current.contains(e.target)))
    ) {
      onClose();
    }
  }, [onClose]);

  // Prevent cart from opening/closing unintentionally
  useEffect(() => {
    if (!isOpen) return;
    
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscape);
    
    return () => {
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          ref={backdropRef}
          className="fixed inset-0 bg-black/50 z-40 transition-opacity animate-in fade-in duration-300"
          onClick={handleBackdropClick}
          onTouchStart={(e) => {
            // Only handle touch if it's a tap, not a scroll
            const touch = e.touches[0];
            if (touch) {
              const startY = touch.clientY;
              const startX = touch.clientX;
              
              const handleTouchEnd = (endEvent) => {
                const endTouch = endEvent.changedTouches[0];
                if (endTouch) {
                  const deltaY = Math.abs(endTouch.clientY - startY);
                  const deltaX = Math.abs(endTouch.clientX - startX);
                  // Only treat as click if movement is minimal (less than 10px)
                  if (deltaY < 10 && deltaX < 10) {
                    if (endEvent.target === backdropRef.current) {
                      onClose();
                    }
                  }
                }
                document.removeEventListener('touchend', handleTouchEnd);
              };
              
              document.addEventListener('touchend', handleTouchEnd, { once: true });
            }
            e.stopPropagation();
          }}
          style={{ touchAction: 'pan-y' }}
        />
      )}

      {/* Sidebar */}
      <div 
        ref={sidebarRef}
        data-cart-sidebar
        className={`fixed right-0 top-0 h-screen w-full max-w-md bg-white shadow-2xl z-50 flex flex-col transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{
          WebkitOverflowScrolling: 'touch',
          touchAction: 'pan-y',
          overscrollBehavior: 'contain',
        }}
        onClick={(e) => {
          // Prevent clicks inside sidebar from closing it
          e.stopPropagation();
        }}
        onTouchStart={(e) => {
          // Stop touch events from bubbling to backdrop
          e.stopPropagation();
        }}
        onTouchMove={(e) => {
          // Allow touch scrolling within sidebar
          e.stopPropagation();
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#D9BFA9]">
          <h2 className="text-xl font-serif font-normal text-[#A67856] uppercase tracking-wide">SHPORTA E BLERJEVE</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#EBD8C8] transition-all"
            aria-label="Close cart"
          >
            <X size={20} className="text-[#4A3628]" />
          </button>
        </div>

        {/* Announcement Banner */}
        <div className="px-6 py-3 bg-white border-b border-[#D9BFA9] flex items-center gap-2">
          <Bell size={16} className="text-[#A67856]" />
          <p className="text-sm text-[#4A3628] font-light">
            Announce discount codes, free shipping etc
          </p>
        </div>

        {/* Cart Items - Scrollable Container */}
        <div 
          className="flex-1 px-6 py-4 overflow-y-auto"
          style={{
            WebkitOverflowScrolling: 'touch',
            touchAction: 'pan-y',
            overscrollBehavior: 'contain',
          }}
        >
          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-[200px] text-center">
              <p className="text-[#4A3628] mb-2 font-medium">Your cart is empty</p>
              <p className="text-sm text-[#4A3628]">Add some items to get started!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 pb-4 border-b border-[#D9BFA9] last:border-0"
                >
                  {/* Product Image */}
                  <div className="w-20 h-20 flex-shrink-0 overflow-hidden bg-[#EFEEED] border border-[#D9BFA9]">
                    <img
                      src={item.image || '/placeholder.png'}
                      alt={item.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = '/placeholder.png';
                      }}
                    />
                  </div>

                  {/* Product Details */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-[#4A3628] mb-1 line-clamp-2">
                      {item.name}
                    </h3>
                    {item.size && (
                      <p className="text-xs text-[#4A3628] mb-2">{item.size}</p>
                    )}
                    
                    {/* Quantity and Remove */}
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-2 sm:gap-2">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          className="w-10 h-10 sm:w-8 sm:h-8 flex items-center justify-center border-2 border-[#D9BFA9] hover:bg-[#EBD8C8] disabled:opacity-50 disabled:cursor-not-allowed transition-all bg-white min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 text-lg leading-none text-[#4A3628]"
                          aria-label="Decrease quantity"
                        >
                          -
                        </button>
                        <span className="w-10 sm:w-8 text-center text-base sm:text-sm font-medium text-[#4A3628] min-h-[44px] sm:min-h-0 flex items-center justify-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-10 h-10 sm:w-8 sm:h-8 flex items-center justify-center border-2 border-[#D9BFA9] hover:bg-[#EBD8C8] transition-all bg-white min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 text-lg leading-none text-[#4A3628]"
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="p-2 sm:p-1.5 hover:bg-red-50 transition-all min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 flex items-center justify-center"
                        aria-label="Remove item"
                      >
                        <Trash2 size={18} className="sm:w-4 sm:h-4 text-[#4A3628] hover:text-red-600" />
                      </button>
                    </div>

                    {/* Price - Show total price for this quantity */}
                    <div className="mt-2">
                      {item.discountedPrice && Number(item.discountedPrice) < Number(item.price) ? (
                        <p className="text-sm font-semibold text-[#4A3628]">
                          {(Number(item.discountedPrice) * (item.quantity || 1)).toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} ALL
                        </p>
                      ) : (
                        <p className="text-sm font-semibold text-[#4A3628]">
                          {(Number(item.price) * (item.quantity || 1)).toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} ALL
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {cartItems.length > 0 && (
          <div className="border-t border-[#D9BFA9] p-6 bg-white">
            <p className="text-xs text-[#4A3628] mb-4 text-center font-light">
              Taksat dhe transporti llogariten në arkë.
            </p>
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-semibold text-[#4A3628] uppercase tracking-wide">NËNTOTALI</span>
              <span className="text-lg font-semibold text-[#4A3628]">
                {Number(discountedTotal).toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} ALL
              </span>
            </div>
            <button
              onClick={handleCheckout}
              className="w-full bg-[#A67856] hover:bg-[#8B6345] text-white py-3 px-6 font-semibold transition-all duration-200 uppercase tracking-wide"
            >
              CHECK OUT
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default CartSidebar;