import React, { useContext, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import { CartContext } from '../../../Context/Cart/CartContext';
import { AuthContext } from '../../../Context/Auth/AuthContext';
import useAxiosSecure from '../../../hooks/useAxiosSecure';
import { getProductImage } from '../../../utils/productImages';
import { groupItemsBySeller } from '../../../utils/groupItemsBySeller';
import { toast } from 'react-toastify';

const CartSidebar = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const {
    items,
    totalQuantity,
    discountedTotal,
    updateQuantity,
    removeItem
  } = useContext(CartContext);
  const { user } = useContext(AuthContext);
  const { publicApi, privateApi } = useAxiosSecure();
  const sidebarRef = useRef(null);

  // Handle body scroll locking
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isOpen && sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    // Add touchstart for mobile responsiveness
    document.addEventListener('touchstart', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Handle Escape key to close
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const handleCheckout = async () => {
    // Ensure items is an array before checking length
    const currentItems = Array.isArray(items) ? items : [];
    if (currentItems.length === 0) return;

    try {
      onClose();
      navigate('/checkout');
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error('Could not initiate checkout. Please try again.');
    }
  };

  const cartItems = Array.isArray(items) ? items : [];

  return (
    <>
      {/* Backdrop */}
      <div
        className={`ixed left-0 right-0 bottom-0 top-[64px] bg-black/50 z-[9998] transition-opacity duration-300 ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
          }`}
        aria-hidden="true"
      />

      {/* Sidebar Panel */}
      <aside
        ref={sidebarRef}
        className={`fixed right-0 top-[64px] h-[calc(100vh-64px)] w-full sm:w-[400px] md:w-[450px] bg-white z-[9999] shadow-2xl transform transition-transform duration-300 ease-out flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-3">
            <ShoppingBag className="w-5 h-5 text-[#5A3F2A]" />
            <h2 className="text-lg font-semibold text-[#5A3F2A] tracking-wide">
              Shporta (<span className="lux-price-number">{totalQuantity}</span>)
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-gray-800"
            aria-label="Close cart"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Cart Items Content */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-6">
          {cartItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center">
                <ShoppingBag className="w-8 h-8 text-gray-300" />
              </div>
              <div>
                <p className="text-gray-900 font-medium text-lg">Your cart is empty</p>
                <p className="text-gray-500 text-sm mt-1">Looks like you haven't added anything yet.</p>
              </div>
              <button
                onClick={() => {
                  onClose();
                  navigate('/shop');
                }}
                className="mt-4 px-6 py-2 bg-[#5A3F2A] text-white rounded-full hover:bg-[#4A3320] transition-colors text-sm font-medium"
              >
                Start Shopping
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {cartItems.map((item) => (
                <div key={item.cartItemId || item.id} className="flex gap-4 group">
                  {/* Product Image */}
                  <div
                    className="w-24 h-24 bg-gray-50 rounded-lg overflow-hidden border border-gray-100 shrink-0 cursor-pointer"
                    onClick={() => {
                      onClose();
                      navigate(`/product/${item.slug || item.id}`);
                    }}
                  >
                    <img
                      src={getProductImage(item.image, item.id)}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.currentTarget.src = getProductImage(null, item.id);
                      }}
                    />
                  </div>

                  {/* Product Details */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                    <div>
                      <div className="flex justify-between items-start gap-2">
                        <h3
                          className="text-[9px] sm:text-[12px] font-medium text-[#5A3F2A] leading-tight whitespace-normal break-words cursor-pointer hover:underline"
                          onClick={() => {
                            onClose();
                            navigate(`/product/${item.slug || item.id}`);
                          }}
                        >
                          {item.name}
                        </h3>
                        <button
                          onClick={() => removeItem(item.cartItemId || item.id)}
                          className="text-gray-400 hover:text-red-500 transition-colors p-1 -mr-1"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      {item.size && (
                        <p className="text-sm text-gray-500 mt-1">Size: {item.size}</p>
                      )}
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      {/* Quantity Controls */}
                      <div className="flex items-center border border-gray-200 rounded-lg bg-white">
                        <button
                          onClick={() => updateQuantity(item.cartItemId || item.id, Math.max(1, item.quantity - 1))}
                          className="p-1.5 hover:bg-gray-50 text-gray-600 disabled:opacity-50"
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-8 text-center text-sm font-medium text-gray-900 select-none">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.cartItemId || item.id, item.quantity + 1)}
                          className="p-1.5 hover:bg-gray-50 text-gray-600"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Price */}
                      <div className="text-right">
                        {item.discountedPrice && Number(item.discountedPrice) < Number(item.price) ? (
                          <div className="flex flex-col items-end">
                            <span className="lux-price-number font-semibold text-[#5A3F2A]">
                              {(Number(item.discountedPrice) * item.quantity).toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} ALL
                            </span>
                            <span className="lux-price-number text-xs text-gray-400 line-through">
                              {(Number(item.price) * item.quantity).toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} ALL
                            </span>
                          </div>
                        ) : (
                          <span className="lux-price-number font-semibold text-[#5A3F2A]">
                            {(Number(item.price) * item.quantity).toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} ALL
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {cartItems.length > 0 && (
          <div className="border-t border-gray-100 bg-gray-50/50 p-6 space-y-4 shrink-0">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>Nentotali</span>
                <span className="font-medium text-gray-900 lux-price-number">
                  {Number(discountedTotal).toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} ALL
                </span>
              </div>
              <p className="text-xs text-gray-500 text-center">
                Taksat dhe transporti llogariten në arkë.
              </p>
            </div>

            <button
              onClick={handleCheckout}
              className="w-full py-3.5 bg-[#5A3F2A] hover:bg-[#4A3320] text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-xl active:scale-[0.98] uppercase tracking-wide text-sm"
            >
              Checkout
            </button>
          </div>
        )}
      </aside>
    </>
  );
};

export default CartSidebar;
