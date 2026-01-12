import React, { useReducer, useEffect, useMemo, useRef } from 'react';
import { CartContext } from './CartContext';
import useAxiosSecure from '../../hooks/useAxiosSecure';
import { toast } from 'react-toastify';

const CART_KEY = 'medimart_cart';

// Initial state
const initialState = {
  items: [],
  totalQuantity: 0,
  totalPrice: 0,
  discountedTotal: 0,
};

const parseStockValue = (value) => {
  if (value === undefined || value === null) return null;
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  const matches = String(value).match(/\d+/g);
  if (!matches || matches.length === 0) return null;
  const n = Number(matches[matches.length - 1]);
  return Number.isFinite(n) ? n : null;
};

const clampQuantity = (quantity, stock) => {
  const q = Math.max(1, Number(quantity) || 1);
  if (stock === null) return q;
  return Math.min(q, stock);
};

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
        const existingItem = state.items[existingItemIndex];
        const payloadStock = parseStockValue(action.payload.stock);
        const existingStock = parseStockValue(existingItem.stock);
        const stock = payloadStock ?? existingStock;
        const newQuantity = existingItem.quantity + 1;

        if (stock !== null && newQuantity > stock) {
          return state;
        }

        updatedItems = state.items.map((item, index) =>
          index === existingItemIndex
            ? { ...item, quantity: newQuantity, stock: stock ?? item.stock }
            : item
        );
      } else {
        // Add new item with unique cartItemId
        const payloadStock = parseStockValue(action.payload.stock);
        const newItem = {
          ...action.payload,
          cartItemId: newItemId,
          quantity: 1,
          stock: payloadStock ?? undefined
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

    case 'UPDATE_QUANTITY': {
      const updatedItems = state.items.map((item) => {
        if ((item.cartItemId || item.id) === action.payload.id) {
          const requestedQuantity = action.payload.quantity;
          const stock = action.payload.stock !== undefined
            ? parseStockValue(action.payload.stock)
            : parseStockValue(item.stock);
          const nextQuantity = clampQuantity(requestedQuantity, stock);
          return { ...item, quantity: nextQuantity, stock: stock ?? item.stock };
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
  const { publicApi } = useAxiosSecure();
  const [variantModalOpen, setVariantModalOpen] = useState(false);
  const [currentProductForVariant, setCurrentProductForVariant] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const stockCacheRef = useRef(new Map());

  const getLatestStock = async (productId) => {
    if (!productId) return null;
    const cache = stockCacheRef.current;
    const now = Date.now();
    const existing = cache.get(productId);

    if (existing?.value !== undefined && now - existing.ts < 5000) {
      return existing.value;
    }

    if (existing?.promise) {
      return existing.promise;
    }

    const promise = publicApi
      .get(`/products/${productId}`)
      .then((product) => {
        const stock = Number(product?.stock);
        const value = Number.isFinite(stock) ? stock : null;
        cache.set(productId, { value, ts: Date.now() });
        return value;
      })
      .catch(() => {
        cache.delete(productId);
        return null;
      });

    cache.set(productId, { promise });
    return promise;
  };

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
                cartItemId: newItemId,
                stock: parseStockValue(item.stock) ?? undefined,
                quantity: clampQuantity(item.quantity, parseStockValue(item.stock))
              };
            }
            const stock = parseStockValue(item.stock);
            return {
              ...item,
              stock: stock ?? undefined,
              quantity: clampQuantity(item.quantity, stock)
            };
          });

          const totalPrice = parsed.items.reduce(
            (total, item) => total + Number(item.price) * item.quantity,
            0
          );
          const discountedTotal = parsed.items.reduce(
            (total, item) => total + (item.discountedPrice ? Number(item.discountedPrice) * item.quantity : Number(item.price) * item.quantity),
            0
          );
          const totalQuantity = parsed.items.reduce(
            (qty, item) => qty + item.quantity,
            0
          );

          parsed.totalPrice = totalPrice;
          parsed.discountedTotal = discountedTotal;
          parsed.totalQuantity = totalQuantity;

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
      const stock = parseStockValue(item.stock);
      if (stock === null || stock <= 0) {
        // Item is out of stock, don't add to cart
        toast.error('Nuk ka stok');
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

    const addWithLiveStock = async () => {
      const dbStock = await getLatestStock(item.id);
      const fallbackStock = item.stock !== undefined && item.stock !== null ? parseStockValue(item.stock) : null;
      const stockToUse = dbStock ?? fallbackStock;

      if (stockToUse !== null && stockToUse <= 0) {
        toast.error('Nuk ka stok');
        return;
      }

      const cartKey = item.variantId ? `${item.id}-${item.variantId}` : item.id;
      const existingItemIndex = state.items.findIndex(
        (cartItem) => (cartItem.cartItemId || cartItem.id) === cartKey
      );
      if (existingItemIndex > -1) {
        const existingItem = state.items[existingItemIndex];
        const existingQty = Number(existingItem.quantity) || 0;
        if (stockToUse !== null && existingQty + 1 > stockToUse) {
          toast.error(`Vetëm ${stockToUse} në stok`);
          return;
        }
      }

      dispatch({
        type: 'ADD_ITEM',
        payload: {
          ...item,
          stock: stockToUse ?? item.stock,
        },
      });

      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 300);
    };

    void addWithLiveStock();
    return;

    // Check if adding this item would exceed available stock (only if stock is provided)
    const stock = item.stock !== undefined && item.stock !== null ? parseStockValue(item.stock) : null;
    if (stock !== null && !isNaN(stock)) {
      const existingItemIndex = state.items.findIndex(
        (cartItem) => (cartItem.cartItemId || cartItem.id) === (item.variantId ? `${item.id}-${item.variantId}` : item.id)
      );

      if (existingItemIndex > -1) {
        const existingItem = state.items[existingItemIndex];
        const existingStock = parseStockValue(existingItem.stock);
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

  };

  const removeItem = (id) => {
    dispatch({ type: 'REMOVE_ITEM', payload: { id } });
  };

  const updateQuantity = (id, quantity, stockOverride) => {
    if (quantity < 1) {
      removeItem(id);
      return;
    }
    
    // Check stock limit before updating quantity
    const item = state.items.find(item => (item.cartItemId || item.id) === id);
    const stock = stockOverride !== undefined
      ? parseStockValue(stockOverride)
      : (item ? parseStockValue(item.stock) : null);
    const nextQuantity = clampQuantity(quantity, stock);
    
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity: nextQuantity, stock: stockOverride } });
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

    const addVariantWithLiveStock = async () => {
      const dbStock = await getLatestStock(variant._id);
      const fallbackStock = variant.stock !== undefined && variant.stock !== null ? parseStockValue(variant.stock) : null;
      const stockToUse = dbStock ?? fallbackStock;
      if (stockToUse !== null && stockToUse <= 0) {
        setVariantModalOpen(false);
        setTimeout(() => {
          setCurrentProductForVariant(null);
        }, 400);
        return;
      }

      const price = Number(variant.price);
      const discount = Number(variant.discount || 0);
      const itemToAdd = {
        id: variant._id,
        name: currentProductForVariant.name || currentProductForVariant.itemName,
        itemName: currentProductForVariant.itemName || currentProductForVariant.name,
        image: variant.image || currentProductForVariant.image,
        price: price,
        discountedPrice: discount > 0 ? (price * (1 - discount / 100)).toFixed(2) : null,
        size: variant.size,
        variantId: variant._id,
        discount: discount,
        stock: stockToUse ?? undefined,
        seller: currentProductForVariant.seller,
        sellerEmail: currentProductForVariant.sellerEmail,
        description: currentProductForVariant.description,
        category: currentProductForVariant.category,
        categoryName: currentProductForVariant.categoryName,
        categoryPath: currentProductForVariant.categoryPath
      };

      dispatch({ type: 'ADD_ITEM', payload: itemToAdd });
      setVariantModalOpen(false);

      setTimeout(() => {
        setCurrentProductForVariant(null);
      }, 400);
    };

    void addVariantWithLiveStock();
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
