import React, { useReducer } from 'react';
import { CartContext } from './CartContext';

const CART_KEY = 'medimart_cart';

// Initial state
const initialState = {
  items: [],
  totalQuantity: 0,
  totalPrice: 0,
  discountedTotal: 0,
};

// Reducer function
const cartReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existingItem = state.items.find(
        (item) => item.id === action.payload.id
      );

      if (existingItem) {
        const updatedItems = state.items.map((item) =>
          item.id === action.payload.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );

        const updatedTotalPrice = updatedItems.reduce(
          (total, item) => total + Number(item.price) * item.quantity,
          0
        );
        const updatedDiscountedTotal = updatedItems.reduce(
          (total, item) => total + (item.discountedPrice ? Number(item.discountedPrice) * item.quantity : Number(item.price) * item.quantity),
          0
        );
        const updatedTotalQuantity = updatedItems.reduce(
          (qty, item) => qty + item.quantity,
          0
        );
        return {
          ...state,
          items: updatedItems,
          totalQuantity: updatedTotalQuantity,
          totalPrice: updatedTotalPrice,
          discountedTotal: updatedDiscountedTotal,
        };
      } else {
        const newItem = { ...action.payload, quantity: 1 };
        const updatedItems = [...state.items, newItem];
        const updatedTotalPrice = updatedItems.reduce(
          (total, item) => total + Number(item.price) * item.quantity,
          0
        );
        const updatedDiscountedTotal = updatedItems.reduce(
          (total, item) => total + (item.discountedPrice ? Number(item.discountedPrice) * item.quantity : Number(item.price) * item.quantity),
          0
        );
        const updatedTotalQuantity = updatedItems.reduce(
          (qty, item) => qty + item.quantity,
          0
        );
        return {
          ...state,
          items: updatedItems,
          totalQuantity: updatedTotalQuantity,
          totalPrice: updatedTotalPrice,
          discountedTotal: updatedDiscountedTotal,
        };
      }
    }

    case 'REMOVE_ITEM': {
      const updatedItems = state.items.filter(
        (item) => item.id !== action.payload.id
      );
      const updatedTotalPrice = updatedItems.reduce(
        (total, item) => total + Number(item.price) * item.quantity,
        0
      );
      const updatedDiscountedTotal = updatedItems.reduce(
        (total, item) => total + (item.discountedPrice ? Number(item.discountedPrice) * item.quantity : Number(item.price) * item.quantity),
        0
      );
      const updatedTotalQuantity = updatedItems.reduce(
        (qty, item) => qty + item.quantity,
        0
      );
      return {
        ...state,
        items: updatedItems,
        totalQuantity: updatedTotalQuantity,
        totalPrice: updatedTotalPrice,
        discountedTotal: updatedDiscountedTotal,
      };
    }

    case 'UPDATE_QUANTITY': {
      const updatedItems = state.items.map((item) =>
        item.id === action.payload.id
          ? { ...item, quantity: action.payload.quantity }
          : item
      );

      const updatedTotalPrice = updatedItems.reduce(
        (total, item) => total + Number(item.price) * item.quantity,
        0
      );

      const updatedDiscountedTotal = updatedItems.reduce(
        (total, item) => total + (item.discountedPrice ? Number(item.discountedPrice) * item.quantity : Number(item.price) * item.quantity),
        0
      );
      const updatedTotalQuantity = updatedItems.reduce(
        (qty, item) => qty + item.quantity,
        0
      );
      return {
        ...state,
        items: updatedItems,
        totalQuantity: updatedTotalQuantity,
        totalPrice: Number(updatedTotalPrice),
        discountedTotal: updatedDiscountedTotal,
      };
    }

    case 'CLEAR_CART': {
      return initialState;
    }

    case 'INIT_CART': {
      return action.payload;
    }
    default:
      return state;
  }
};

// Cart Provider component
export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState, (initial) => {
    const savedCart = localStorage.getItem(CART_KEY);
    return savedCart ? JSON.parse(savedCart) : initial;
  });

  // Save cart to localStorage
  React.useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(state));
  }, [state]);

  const addItem = (item) => {
    dispatch({ type: 'ADD_ITEM', payload: item });
  };

  const removeItem = (id) => {
    dispatch({ type: 'REMOVE_ITEM', payload: { id } });
  };

  const updateQuantity = (id, quantity) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const value = {
    items: state.items,
    totalQuantity: state.totalQuantity,
    totalPrice: state.totalPrice,
    discountedTotal: state.discountedTotal,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
  };


  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export default CartProvider;
