import React, { useContext } from 'react';
import { FaTrash, FaPlus, FaMinus } from 'react-icons/fa';
import { CartContext } from '../../Context/Cart/CartContext';
import { AuthContext } from '../../Context/Auth/AuthContext';
import useAxiosSecure from '../../hooks/useAxiosSecure';
import { toast } from 'react-toastify';
import { groupItemsBySeller } from '../../utils/groupItemsBySeller';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';

const Cart = () => {
  const location = useLocation();
  const {
    items,
    totalQuantity,
    totalPrice,
    discountedTotal,
    removeItem,
    updateQuantity,
    clearCart,
  } = useContext(CartContext);
  const { user } = useContext(AuthContext);
  const { privateApi } = useAxiosSecure();

  const handleCheckout = async () => {
    try {
      if (!user) {
        throw new Error('Please log in to proceed with checkout');
      }
      const sellersGroup = groupItemsBySeller(items);

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

  if (items.length === 0) {
    return (
      <div>
        <Helmet key={location.pathname}>
          <title>Your Cart</title>
        </Helmet>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
            <p className="text-gray-600">
              Add some items to your cart to get started!
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet key={location.pathname}>
        <title>Your Cart</title>
      </Helmet>
      <div className="min-h-screen bg-[#f9f7f4] py-8 sm:py-12 px-4 sm:px-2 md:px-0">
        <div className="max-w-3xl mx-auto bg-white lux-card lux-card-elevated">
          <div className="p-4 sm:p-6 md:p-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                🛒 Your Cart
              </h2>
              <button
                onClick={clearCart}
                className="inline-flex items-center gap-1 text-xs sm:text-sm font-semibold text-red-600 hover:text-white hover:bg-red-500 transition px-3 py-2 sm:py-1.5 border border-red-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-red-400 min-h-[44px]"
              >
                <FaTrash className="inline" /> <span className="hidden sm:inline">Clear Cart</span><span className="sm:hidden">Clear</span>
              </button>
            </div>

            <div className="space-y-6">
              {items?.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-3 sm:p-4 bg-gray-50 border border-gray-200"
                >
                  <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-sm flex items-center justify-center flex-shrink-0 overflow-hidden">
                      <img className='w-full h-full object-cover' src={item.image} alt="medicine image" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 text-base sm:text-lg break-words">
                        {item.name}
                      </h3>
                      <p className="text-gray-700 text-sm">
                        Price:{' '}
                        <span className="font-semibold">
                          {!isNaN(Number(item.price))
                            ? Number(item.price).toLocaleString()
                            : '0'} ALL
                        </span>
                      </p>
                      {item.discountedPrice &&
                        Number(item.discountedPrice) < Number(item.price) && (
                          <p className="text-stone-600 text-xs font-semibold">
                            Discounted price: {Number(item.discountedPrice).toLocaleString()} ALL
                          </p>
                        )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        className="p-2 sm:p-2.5 bg-[#faf9f6] hover:bg-[#946259] disabled:opacity-40 text-[#946259] transition-all border-2 border-[#946259] min-w-[44px] min-h-[44px] flex items-center justify-center text-lg leading-none"
                        aria-label="Decrease quantity"
                      >
                        -
                      </button>
                      <span className="px-3 sm:px-4 py-1.5 sm:py-2 bg-white border-2 border-[#946259] text-[#946259] font-semibold shadow-sm min-w-[44px] text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="p-2 sm:p-2.5 bg-[#faf9f6] hover:bg-[#946259] text-[#946259] transition-all border-2 border-[#946259] min-w-[44px] min-h-[44px] flex items-center justify-center text-lg leading-none"
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-red-500 hover:text-white hover:bg-red-500 p-2 sm:p-2.5 rounded-sm border border-red-200 transition min-w-[44px] min-h-[44px] flex items-center justify-center"
                      aria-label="Remove item"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-10">
              <div className="flex flex-col sm:flex-row justify-between items-center py-6 border-t border-gray-200 gap-6">
                <div className="w-full sm:w-auto">
                  <p className="text-gray-700">
                    Total Items:{' '}
                    <span className="font-bold text-gray-900">
                      {items.length} items ({totalQuantity} units)
                    </span>
                  </p>
                  <p className="text-xl font-extrabold text-gray-900 mt-1">
                    Subtotal :{' '}
                    <del className="text-red-300 text-base">
                      {Number(totalPrice).toLocaleString()} ALL
                    </del>{' '}
                    {Number(discountedTotal).toLocaleString()} ALL
                  </p>
                </div>
                <button
                  onClick={handleCheckout}
                  className="w-full sm:w-auto lux-btn-primary px-6 sm:px-8 py-3 sm:py-4 font-bold text-base sm:text-lg shadow-md min-h-[44px]"
                >
                  Proceed to Checkout
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Cart;