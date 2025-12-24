import React, { useReducer, useEffect, useMemo } from 'react';
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
// Reducer function
const cartReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_ITEM': {
      // Create a unique ID for the cart item based on product ID and variant ID
      const newItemId = action.payload.variantId
        ? `${action.payload.id}-${action.payload.variantId}`
        : action.payload.id;

      // Check if this specific item (product + variant) is already in cart
      const existingItemIndex = state.items.findIndex(
        (item) => (item.cartItemId || item.id) === newItemId
      );

      let updatedItems;

      if (existingItemIndex > -1) {
        // Increment quantity for existing item, but check stock first (only if stock is provided)
        const existingItem = state.items[existingItemIndex];
        const stock = action.payload.stock !== undefined && action.payload.stock !== null 
          ? Number(action.payload.stock) 
          : (existingItem.stock !== undefined && existingItem.stock !== null ? Number(existingItem.stock) : null);
        const newQuantity = existingItem.quantity + 1;
        
        // Don't increment if it would exceed stock (only if stock is explicitly provided)
        if (stock !== null && !isNaN(stock) && newQuantity > stock) {
          return state; // Return unchanged state
        }
        
        updatedItems = state.items.map((item, index) =>
          index === existingItemIndex
            ? { ...item, quantity: newQuantity, stock: stock !== null ? stock : item.stock } // Update stock too if provided
            : item
        );
      } else {
        // Add new item with unique cartItemId
        const newItem = {
          ...action.payload,
          cartItemId: newItemId,
          quantity: 1,
          stock: action.payload.stock !== undefined && action.payload.stock !== null ? Number(action.payload.stock) : undefined // Include stock if available
        };
        updatedItems = [...state.items, newItem];
      }

      // Calculate totals
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

    case 'REMOVE_ITEM': {
      const updatedItems = state.items.filter(
        (item) => (item.cartItemId || item.id) !== action.payload.id
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
      const updatedItems = state.items.map((item) => {
        if ((item.cartItemId || item.id) === action.payload.id) {
          const requestedQuantity = action.payload.quantity;
          
          // Only limit quantity if stock is explicitly provided and we're increasing
          if (item.stock !== undefined && item.stock !== null && requestedQuantity > item.quantity) {
            const stock = Number(item.stock);
            if (!isNaN(stock) && stock > 0) {
              // Don't allow quantity to exceed stock when increasing
              const newQuantity = Math.min(requestedQuantity, stock);
              return { ...item, quantity: newQuantity };
            }
          }
          // Allow the quantity update (for decreases or when no stock info)
          return { ...item, quantity: requestedQuantity };
        }
        return item;
      });

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

import VariantSelectionSidebar from '../../Components/Common/Products/VariantSelectionSidebar';
import { useState } from 'react';

// Cart Provider component
export const CartProvider = ({ children }) => {
  const [variantModalOpen, setVariantModalOpen] = useState(false);
  const [currentProductForVariant, setCurrentProductForVariant] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);

  const [state, dispatch] = useReducer(cartReducer, initialState, (initial) => {
    try {
      const savedCart = localStorage.getItem(CART_KEY);
      if (savedCart) {
        const parsed = JSON.parse(savedCart);
        // Ensure items is always an array
        if (parsed && parsed.items && Array.isArray(parsed.items)) {
          // Sanitize items: Ensure every item has a cartItemId
          parsed.items = parsed.items.map(item => {
            if (!item.cartItemId) {
              // Generate a cartItemId for legacy items
              // Use id + variantId if available, otherwise just id
              const newItemId = item.variantId
                ? `${item.id}-${item.variantId}`
                : item.id;

              return {
                ...item,
                cartItemId: newItemId
              };
            }
            return item;
          });
          return parsed;
        }
      }
    } catch (error) {
      console.error('Error loading cart from localStorage:', error);
      // Clear corrupted cart data
      localStorage.removeItem(CART_KEY);
    }
    return initial;
  });

  // Save cart to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(state));
    } catch (error) {
      console.error('Error saving cart to localStorage:', error);
    }
  }, [state]);

  const addItem = (item) => {
    if (!item || !item.id) {
      console.error('Invalid item added to cart:', item);
      return;
    }

    // Check stock before adding to cart (only if stock is explicitly provided)
    // If stock is undefined/null, allow addition (for backward compatibility)
    if (item.stock !== undefined && item.stock !== null) {
      const stock = Number(item.stock);
      if (isNaN(stock) || stock <= 0) {
        // Item is out of stock, don't add to cart
        return;
      }
    }

    // Check for product with variants without a selected variant
    // We modify this to check if 'variants' array exists and has ANY items (> 0), AND 'variantId' is missing
    if (item.variants && item.variants.length > 0 && !item.variantId) {
      setCurrentProductForVariant(item);
      setVariantModalOpen(true);
      return;
    }

    // Check if adding this item would exceed available stock (only if stock is provided)
    const stock = item.stock !== undefined && item.stock !== null ? Number(item.stock) : null;
    if (stock !== null && !isNaN(stock)) {
      const existingItemIndex = state.items.findIndex(
        (cartItem) => (cartItem.cartItemId || cartItem.id) === (item.variantId ? `${item.id}-${item.variantId}` : item.id)
      );

      if (existingItemIndex > -1) {
        const existingItem = state.items[existingItemIndex];
        const existingStock = existingItem.stock !== undefined && existingItem.stock !== null ? Number(existingItem.stock) : stock;
        const newQuantity = existingItem.quantity + 1;
        if (existingStock !== null && !isNaN(existingStock) && newQuantity > existingStock) {
          // Would exceed stock, don't add
          return;
        }
      }
    }

    // Default behavior for single variant or already selected variant
    // If has 1 variant and no variantId, we might want to auto-select it here too, 
    // but usually callers might have handled it. 
    // Safest is to just proceed if it's 1 variant or legacy.

    // Auto-resolve single variant if not specified? 
    // ProductDetail handles this. Other pages might not.
    // If logic is consistent: if 1 variant, treat as main product.
    // Let's ensure we don't block 1-variant products.

    dispatch({ type: 'ADD_ITEM', payload: item });

    // Trigger animation
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 300);
  };

  const removeItem = (id) => {
    dispatch({ type: 'REMOVE_ITEM', payload: { id } });
  };

  const updateQuantity = (id, quantity) => {
    if (quantity < 1) {
      removeItem(id);
      return;
    }
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  // Ensure items is always an array
  const cartItems = useMemo(() => {
    if (!state.items) return [];
    return Array.isArray(state.items) ? state.items : [];
  }, [state.items]);

  const handleVariantSelect = (variant) => {
    if (!currentProductForVariant) return;

    // Check stock before adding (only if stock is explicitly provided)
    // If stock is undefined/null, allow addition (for backward compatibility)
    if (variant.stock !== undefined && variant.stock !== null) {
      const stock = Number(variant.stock);
      if (isNaN(stock) || stock <= 0) {
        // Variant is out of stock, don't add to cart
        setVariantModalOpen(false);
        setTimeout(() => {
          setCurrentProductForVariant(null);
        }, 400);
        return;
      }
    }

    // Construct the new item with variant details
    const price = Number(variant.price);
    const discount = Number(variant.discount || 0);
    const itemToAdd = {
      id: variant._id, // Use variant ID as the product ID
      name: currentProductForVariant.name || currentProductForVariant.itemName,
      itemName: currentProductForVariant.itemName || currentProductForVariant.name,
      image: variant.image || currentProductForVariant.image,
      price: price,
      discountedPrice: discount > 0 ? (price * (1 - discount / 100)).toFixed(2) : null,
      size: variant.size,
      variantId: variant._id,
      discount: discount,
      stock: variant.stock !== undefined && variant.stock !== null ? Number(variant.stock) : undefined, // Include stock in cart item if available
      seller: currentProductForVariant.seller,
      sellerEmail: currentProductForVariant.sellerEmail,
      description: currentProductForVariant.description,
      category: currentProductForVariant.category,
      categoryName: currentProductForVariant.categoryName,
      categoryPath: currentProductForVariant.categoryPath
    };

    dispatch({ type: 'ADD_ITEM', payload: itemToAdd });
    setVariantModalOpen(false);

    // Delay clearing product to allow exit animation
    setTimeout(() => {
      setCurrentProductForVariant(null);
    }, 400);
  };

  const value = {
    items: cartItems,
    totalQuantity: state.totalQuantity || 0,
    totalPrice: state.totalPrice || 0,
    discountedTotal: state.discountedTotal || 0,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    isAnimating,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
      {currentProductForVariant && (
        <VariantSelectionSidebar
          isOpen={variantModalOpen}
          onClose={() => setVariantModalOpen(false)}
          product={currentProductForVariant}
          selectedVariant={null} // Always start fresh selection
          onSelectVariant={(v) => {
            // In sidebar we usually expect onSelectVariant to set local state.
            // But here we might want to just let the sidebar handle its local state
            // and when they click "Add to Cart" it calls our handler?
            // VariantSelectionSidebar expects `selectedVariant` prop.
            // If we pass null, it won't show selection.
            // We need either a wrapper or the sidebar to manage state.
            // Current Sidebar implementation manages its own 'selectedVariant' ?
            // ANSWER: Sidebar takes `selectedVariant` and `onSelectVariant` as props. It doesn't manage it internally.
            // So we need state here for temporary selection?
            // Actually, the Sidebar is designed to be controlled.
            // We can create a wrapper or just add state here.
          }}
        // Wait, if Sidebar is controlled, we need state for 'currentlySelectedInModal'.
        // Let's modify the Sidebar usage slightly.
        />
      )}
      {/* 
         Re-evaluating Sidebar usage:
         The Sidebar requires `selectedVariant` and `onSelectVariant` props.
         So we need `[tempSelectedVariant, setTempSelectedVariant]` in CartProvider?
         That pollutes CartProvider nicely.
         Better: Create a wrapper component `GlobalVariantSidebar` that manages the selection state.
      */}
      <GlobalVariantSidebarWrapper
        isOpen={variantModalOpen}
        onClose={() => setVariantModalOpen(false)}
        product={currentProductForVariant}
        onConfirm={handleVariantSelect}
      />
    </CartContext.Provider>
  );
};

// Internal wrapper to manage local selection state
const GlobalVariantSidebarWrapper = ({ isOpen, onClose, product, onConfirm }) => {
  const [selected, setSelected] = useState(null);

  // Reset selected when opening
  useEffect(() => {
    if (isOpen) setSelected(null);
  }, [isOpen, product]);

  if (!product) return null;

  return (
    <VariantSelectionSidebar
      isOpen={isOpen}
      onClose={onClose}
      product={product}
      selectedVariant={selected}
      onSelectVariant={setSelected}
      onAddToCart={() => onConfirm(selected)}
    />
  );
};

export default CartProvider;
