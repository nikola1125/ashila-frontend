import React, { useState, useContext, useCallback, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import useAxiosSecure from '../../hooks/useAxiosSecure';
import { CartContext } from '../../Context/Cart/CartContext';
import { Helmet } from 'react-helmet-async';
import { ShoppingBag, Minus, Plus, Facebook, Twitter, Mail, ChevronLeft, ChevronRight } from 'lucide-react';
import DataLoading from '../../Components/Common/Loaders/DataLoading';
import LoadingError from '../../Components/Common/States/LoadingError';
import { getProductImage } from '../../utils/productImages';
import { useThrottle } from '../../hooks/useThrottle';
import VariantSelectionSidebar from '../../Components/Common/Products/VariantSelectionSidebar';
import { generateDirectProductUrl, getProductOptionSlugs } from '../../utils/productUrls';

const ProductDetail = () => {
  const { id, category, slug } = useParams();
  const navigate = useNavigate();
  const { publicApi } = useAxiosSecure();
  const { addItem } = useContext(CartContext);
  const [quantity, setQuantity] = useState(1);
  const [activeVariant, setActiveVariant] = useState(null);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // State for related product variant sidebar
  const [isRelatedSidebarOpen, setIsRelatedSidebarOpen] = useState(false);
  const [relatedSidebarProduct, setRelatedSidebarProduct] = useState(null);
  const [relatedSidebarVariant, setRelatedSidebarVariant] = useState(null);

  // Determine if we're using the new SEO URL structure
  const isSeoUrl = !!category && !!slug;
  
  // Query function to find product by ID or by category+slug
  const fetchProduct = async () => {
    if (isSeoUrl) {
      // Find product by category and slug
      const response = await publicApi.get('/medicines');
      const allProducts = response.data.result || response.data || [];
      
      // Find product matching the category and slug
      const matchedProduct = allProducts.find(product => {
        const optionSlugs = getProductOptionSlugs(product);
        const productSlug = `${product.itemName?.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-') || 'product'}`;
        
        return optionSlugs.includes(category) && productSlug === slug;
      });
      
      if (!matchedProduct) {
        throw new Error('Product not found');
      }
      
      return matchedProduct;
    } else {
      // Original behavior: fetch by ID
      const response = await publicApi.get(`/medicines/${id}`);
      return response.data;
    }
  };

  const { data: product, isLoading, error } = useQuery({
    queryKey: ['product', id, category, slug],
    queryFn: fetchProduct,
    enabled: !!(id || (category && slug)),
  });

  // Fetch all variants of the same product using variantGroupId
  const { data: allVariants = [] } = useQuery({
    queryKey: ['product-variants', product?.variantGroupId, product?._id],
    queryFn: async () => {
      if (!product) return [];
      
      // If product has variantGroupId, fetch all products with same variantGroupId
      if (product.variantGroupId) {
        const response = await publicApi.get(`/products?group=false`);
        const allProducts = response?.result || response || [];
        const variants = allProducts.filter(p => 
          p.variantGroupId === product.variantGroupId
        );
        return variants.length > 0 ? variants : [product];
      }
      
      // Fallback: if no variantGroupId, try to find by name/company/category
      const response = await publicApi.get(`/products?group=false`);
      const allProducts = response?.result || response || [];
      const variants = allProducts.filter(p => 
        p.itemName === product.itemName && 
        p.company === product.company && 
        p.categoryName === product.categoryName
      );
      return variants.length > 0 ? variants : [product];
    },
    enabled: !!product,
  });

  // Fetch related products (same category, excluding current product)
  // Use group=true to get grouped products
  const { data: relatedProducts = [] } = useQuery({
    queryKey: ['relatedProducts', product?.category?._id, id, product?.variantGroupId],
    queryFn: async () => {
      if (!product?.category?._id) return [];
      const response = await publicApi.get(`/products?group=true`);
      const allProducts = response?.result || response || [];
      // Filter: same category, exclude current product and its variants, limit to 4
      const currentVariantGroupId = product?.variantGroupId;
      const related = allProducts
        .filter(p => {
          // Exclude current product and products in the same variant group
          if (currentVariantGroupId && p.variantGroupId === currentVariantGroupId) return false;
          // Check if any variant matches current product ID
          if (p.variants && p.variants.some(v => v._id === id)) return false;
          if (p._id === id) return false;
          // Check category match
          return (p.category?._id === product.category._id || p.category === product.category._id);
        })
        .slice(0, 4);
      // If not enough in same category, add products in order (no random)
      if (related.length < 4) {
        const additional = allProducts
          .filter(p => {
            if (currentVariantGroupId && p.variantGroupId === currentVariantGroupId) return false;
            if (p.variants && p.variants.some(v => v._id === id)) return false;
            if (p._id === id) return false;
            return !related.find(r => r._id === p._id);
          })
          .slice(0, 4 - related.length);
        return [...related, ...additional].slice(0, 4);
      }
      return related;
    },
    enabled: !!product && !!product.category,
  });

  const relatedScrollRef = useRef(null);
  const [showLeftRelatedArrow, setShowLeftRelatedArrow] = useState(false);
  const [showRightRelatedArrow, setShowRightRelatedArrow] = useState(false);
  const [relatedCurrentPage, setRelatedCurrentPage] = useState(1);
  const [relatedTotalPages, setRelatedTotalPages] = useState(1);
  const [relatedShowScrollHint, setRelatedShowScrollHint] = useState(true);

  // Scroll to top when component mounts or product ID changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);

  // Handle scroll state for related products carousel
  const checkRelatedScroll = useCallback(() => {
    const container = relatedScrollRef.current;
    if (!container || relatedProducts.length === 0) {
      setShowLeftRelatedArrow(false);
      setShowRightRelatedArrow(false);
      setRelatedCurrentPage(1);
      setRelatedTotalPages(1);
      return;
    }

    const { scrollLeft, scrollWidth, clientWidth } = container;
    const isAtStart = scrollLeft <= 10;
    const isAtEnd = scrollLeft + clientWidth >= scrollWidth - 10;

    setShowLeftRelatedArrow(!isAtStart);
    setShowRightRelatedArrow(!isAtEnd);

    if (scrollLeft > 5 && relatedShowScrollHint) {
      setRelatedShowScrollHint(false);
    }

    // Page calculation
    const pageWidth = clientWidth || 1;
    const currentPageNum = Math.round(scrollLeft / pageWidth) + 1;
    const totalPagesNum = Math.max(1, Math.ceil(scrollWidth / pageWidth));
    setRelatedCurrentPage(Math.min(currentPageNum, totalPagesNum));
    setRelatedTotalPages(totalPagesNum);
  }, [relatedProducts.length, relatedShowScrollHint]);

  const throttledCheckRelatedScroll = useThrottle(checkRelatedScroll, 100);

  useEffect(() => {
    const container = relatedScrollRef.current;
    if (!container || relatedProducts.length === 0) {
      setShowLeftRelatedArrow(false);
      setShowRightRelatedArrow(false);
      return;
    }

    checkRelatedScroll();
    container.addEventListener('scroll', throttledCheckRelatedScroll, { passive: true });

    const handleResize = () => {
      setTimeout(checkRelatedScroll, 100);
    };
    window.addEventListener('resize', handleResize, { passive: true });

    return () => {
      container.removeEventListener('scroll', throttledCheckRelatedScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, [relatedProducts, checkRelatedScroll, throttledCheckRelatedScroll]);

  const scrollRelated = useCallback((direction) => {
    const container = relatedScrollRef.current;
    if (!container) return;

    let scrollAmount;

    if (window.innerWidth < 768) {
      // Mobile: scroll by one full "page" (the visible width that contains 2 products)
      scrollAmount = container.clientWidth || 1;
    } else {
      // Desktop: scroll roughly one card at a time
      scrollAmount = 240;
    }

    container.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  }, []);

  // Initialize selected variant logic
  useEffect(() => {
    if (product && allVariants.length > 0) {
      // Auto-select the current variant if it matches the URL ID
      const currentVariant = allVariants.find(v => v._id === id);
      if (currentVariant) {
        setActiveVariant(currentVariant);
      } else if (allVariants.length === 1) {
        // If only one variant, auto-select it
        setActiveVariant(allVariants[0]);
      } else {
        // Multiple variants - select the first one for display but don't treat as selected
        setActiveVariant(null);
      }
    }
  }, [product, allVariants, id]);

  // Derived values based on selected variant or fallback to product base values for display
  // We want to show the "Starting at" price or the first variant's price, 
  // but WITHOUT treating it as "selected".
  const displayVariant = activeVariant || (allVariants.length > 0 ? allVariants[0] : product) || product;

  const currentPrice = displayVariant ? Number(displayVariant.price) : 0;
  const currentDiscount = displayVariant ? Number(displayVariant.discount) : 0;
  const currentStock = displayVariant ? Number(displayVariant.stock) : 0;

  const discountedPrice = currentDiscount > 0
    ? currentPrice * (1 - currentDiscount / 100)
    : currentPrice;

  const isInStock = currentStock > 0;

  const handleAddToCart = useCallback(() => {
    if (!product) return false;

    // Check if variant selection is required
    const hasVariants = allVariants.length > 0;

    let effectiveVariant = activeVariant;

    // Handle case where no variant is explicitly selected
    if (hasVariants && !effectiveVariant) {
      if (allVariants.length === 1) {
        // Auto-select single variant immediately
        effectiveVariant = allVariants[0];
        setActiveVariant(effectiveVariant);
      } else {
        // Multiple variants require user selection
        setIsSidebarOpen(true);
        return false;
      }
    }

    // Use effectiveVariant or fallback (only for legacy products without variants array)
    const variantToAdd = effectiveVariant || {
      size: product.size || 'Standard',
      _id: product._id
    };

    // Add item quantity times
    for (let i = 0; i < quantity; i++) {
      addItem({
        id: variantToAdd._id, // Use variant ID
        name: product.itemName,
        price: variantToAdd.price || currentPrice,
        discountedPrice: (variantToAdd.discount || currentDiscount) > 0
          ? ((variantToAdd.price || currentPrice) * (1 - (variantToAdd.discount || currentDiscount) / 100)).toFixed(2)
          : null,
        image: variantToAdd.image || product.image,
        company: product.company,
        genericName: product.genericName,
        discount: variantToAdd.discount || currentDiscount,
        seller: product.seller,
        size: variantToAdd.size,
        variantId: variantToAdd._id,
        stock: Number(variantToAdd.stock) || Number(product.stock) || 0
      });
    }
    return true;
  }, [product, allVariants, quantity, activeVariant, currentPrice, currentDiscount, discountedPrice, addItem]);

  const handleBuyNow = useCallback(() => {
    if (handleAddToCart()) {
      navigate('/cart');
    }
  }, [handleAddToCart, navigate]);

  const handleQuantityChange = useCallback((change) => {
    setQuantity(prev => {
      const newQuantity = Math.max(1, prev + change);
      // Don't allow quantity to exceed available stock
      if (currentStock > 0 && newQuantity > currentStock) {
        return currentStock; // Cap at available stock
      }
      return newQuantity;
    });
  }, [currentStock]);

  if (isLoading) {
    return <DataLoading label="Product Details" />;
  }

  if (error || !product) {
    return <LoadingError label="Product" showAction={true} />;
  }

  return (
    <div className="min-h-screen bg-[#faf9f6]">
      <Helmet>
        <title>{product.itemName} {product.company ? `nga ${product.company}` : ''} | Farmacia Shila</title>
        <meta name="description" content={`Bli ${product.itemName} ${product.company ? `nga ${product.company}` : ''} në Farmacia Shila. ${product.description?.substring(0, 150) || 'Produkt cilësor për përkujdesjen tuaj shëndetësore.'}`} />
        <meta property="og:title" content={`${product.itemName} | Farmacia Shila`} />
        <meta property="og:description" content={product.description?.substring(0, 160)} />
        {product.image && <meta property="og:image" content={product.image} />}
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 sm:pt-32 md:pt-40 pb-10">
        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-10 mb-10 sm:mb-12">
          {/* Left Column - Product Image */}
          <div className="relative bg-white lux-card lux-card-elevated overflow-hidden">
            {/* Product Image */}
            <div className="flex items-center justify-center min-h-[300px] sm:min-h-[400px] md:min-h-[500px] p-4 sm:p-6 md:p-8">
              <img
                src={getProductImage(product.image, product._id)}
                alt={product.itemName}
                className="max-w-full max-h-[400px] sm:max-h-[500px] md:max-h-[600px] object-contain w-full h-auto"
                onError={(e) => {
                  e.target.src = getProductImage(null, product._id);
                }}
              />
            </div>
          </div>

          {/* Right Column - Product Details */}
          <div className="flex flex-col lux-serif-text">


            {/* Product Title */}
            <h1 className="lux-serif-text text-lg sm:text-2xl md:text-3xl font-bold text-[#4A3628] mb-2 break-words">{product.itemName}</h1>
            <div className="w-16 h-0.5 bg-[#A67856] mb-4"></div>

            {/* Price */}
            <div className="mb-4 sm:mb-6 flex items-baseline gap-3">
              <span className="lux-price-number text-base sm:text-xl md:text-2xl font-medium text-[#4A3628]">
                {discountedPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ALL
              </span>
              {currentDiscount > 0 && (
                <span className="lux-price-number text-sm sm:text-lg md:text-xl text-gray-400 line-through decoration-gray-400">
                  {currentPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ALL
                </span>
              )}
            </div>

            <div className="border-t border-[#D9BFA9] my-2"></div>

            {/* SIZE Selector (Variants) */}
            <div className="mb-2">
              <label className="block text-xs font-semibold text-[#4A3628] uppercase tracking-wide mb-2">
                SIZE
              </label>
              <div className="flex flex-wrap gap-2">
                {allVariants.length > 0 ? (
                  allVariants.map((variant, idx) => (
                    <button
                      key={variant._id}
                      onClick={() => setActiveVariant(variant)}
                      className={`px-4 py-2 text-sm font-medium border transition-all duration-200 ${activeVariant === variant
                        ? 'bg-[#4A3628] text-white border-[#4A3628]'
                        : 'bg-white text-[#4A3628] border-[#4A3628] hover:bg-[#EBD8C8]'
                        }`}
                    >
                      {variant.size}
                    </button>
                  ))
                ) : (
                  <div className="px-3 py-2 border border-[#4A3628] bg-white text-[#4A3628] font-medium text-sm">
                    {product.size || 'Standard'}
                  </div>
                )}
              </div>
            </div>

            {/* QUANTITY Selector */}
            <div className="mb-6">
              <label className="block text-xs font-semibold text-[#4A3628] uppercase tracking-wide mb-2">
                QUANTITY
              </label>
              {currentStock <= 10 && currentStock > 0 && (
                <div className="mb-2 text-sm text-orange-600 font-medium">
                  Only {currentStock} left in stock!
                </div>
              )}
              <div className="flex items-center gap-2 sm:gap-3">
                <button
                  onClick={() => handleQuantityChange(-1)}
                  disabled={quantity <= 1}
                  className="w-12 h-12 sm:w-10 sm:h-10 flex items-center justify-center border-2 border-[#4A3628] hover:bg-[#EBD8C8] disabled:opacity-50 disabled:cursor-not-allowed transition-all bg-white min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 text-lg leading-none text-[#4A3628]"
                  aria-label="Decrease quantity"
                >
                  -
                </button>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => {
                    const val = parseInt(e.target.value) || 1;
                    const maxQuantity = currentStock > 0 ? currentStock : val;
                    setQuantity(Math.min(Math.max(1, val), maxQuantity));
                  }}
                  className="w-20 h-12 sm:w-16 sm:h-10 text-center border-2 border-[#4A3628] focus:outline-none bg-white text-[#4A3628] font-medium text-base sm:text-sm min-h-[44px] sm:min-h-0"
                  min="1"
                  readOnly
                />
                <button
                  onClick={() => handleQuantityChange(1)}
                  disabled={!isInStock || quantity >= currentStock}
                  className="w-12 h-12 sm:w-10 sm:h-10 flex items-center justify-center border-2 border-[#4A3628] hover:bg-[#EBD8C8] disabled:opacity-50 disabled:cursor-not-allowed transition-all bg-white min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 text-lg leading-none text-[#4A3628]"
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 mb-6">
              {isInStock ? (
                <>
                  <button
                    onClick={handleAddToCart}
                    className="w-full lux-btn-outline px-4 sm:px-6 py-3 sm:py-4 text-sm sm:text-base min-h-[44px]"
                  >
                    Shto ne shporte
                  </button>
                  <button
                    onClick={handleBuyNow}
                    className="w-full lux-btn-primary px-4 sm:px-6 py-3 sm:py-4 text-sm sm:text-base min-h-[44px]"
                  >
                    Bli tani
                  </button>
                </>
              ) : (
                <button
                  disabled
                  className="w-full bg-gray-200 text-gray-500 px-4 sm:px-6 py-3 sm:py-4 font-medium cursor-not-allowed min-h-[44px]"
                >
                  Sold out
                </button>
              )}
            </div>

            {/* Social Sharing */}

          </div>
        </div>

        {/* Product Description */}
        <div className="border-t border-[#D9BFA9] pt-8 mb-8">
          <h2 className="lux-serif-text text-xl font-semibold text-[#4A3628] mb-4">Description</h2>
          <div className="prose max-w-none text-[#4A3628] leading-relaxed lux-serif-text">
            {product.description ? (
              <div>
                {/* Desktop: Show full description */}
                <div className="hidden md:block whitespace-pre-wrap">
                  {product.description}
                </div>
                
                {/* Mobile: Show truncated description with See More */}
                <div className="md:hidden">
                  <div 
                    className={`whitespace-pre-wrap transition-all duration-300 ease-in-out ${
                      showFullDescription ? 'max-h-none' : 'max-h-24 overflow-hidden'
                    }`}
                  >
                    {product.description}
                  </div>
                  {product.description.length > 150 && (
                    <button
                      onClick={() => setShowFullDescription(!showFullDescription)}
                      className="text-[#4A3628] font-medium hover:text-[#A67856] transition-colors duration-200 mt-2 text-sm underline"
                    >
                      {showFullDescription ? 'See Less' : 'See More'}
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <p>
                {product.genericName && (
                  <>
                    <strong>Generic Name:</strong> {product.genericName}
                    <br />
                  </>
                )}
                {product.company && (
                  <>
                    <strong>Company:</strong> {product.company}
                    <br />
                  </>
                )}
                {product.category?.categoryName && (
                  <>
                    <strong>Category:</strong> {product.category.categoryName}
                  </>
                )}
              </p>
            )}
          </div>
        </div>

        {/* Breaking Line */}
        <div className="border-t border-[#D9BFA9] my-12"></div>

        {/* Related Products Section */}
        {
          relatedProducts.length > 0 && (
            <div className="mt-12 lux-serif-text">
              <h2 className="text-2xl font-semibold text-[#4A3628] mb-8 text-center">Sugjerime</h2>
              <div className="relative flex items-center justify-center">
                {/* Desktop Arrows */}
                {showLeftRelatedArrow && (
                  <button
                    onClick={() => scrollRelated('left')}
                    className="hidden md:block absolute left-0 top-1/2 -translate-y-1/2 -translate-x-6 z-10 carousel-arrow p-2 shadow-lg border border-[#E0CBB5]"
                    aria-label="Scroll left"
                  >
                    <ChevronLeft size={24} className="text-[#A67856]" />
                  </button>
                )}

                {showRightRelatedArrow && (
                  <button
                    onClick={() => scrollRelated('right')}
                    className="hidden md:block absolute right-0 top-1/2 -translate-y-1/2 translate-x-6 z-10 carousel-arrow p-2 shadow-lg border border-[#E0CBB5]"
                    aria-label="Scroll right"
                  >
                    <ChevronRight size={24} className="text-[#A67856]" />
                  </button>
                )}

                {/* Mobile Arrows */}
                {showLeftRelatedArrow && (
                  <button
                    onClick={() => scrollRelated('left')}
                    className="absolute left-1 top-1/2 -translate-y-1/2 z-10 carousel-arrow p-1.5 shadow-md border border-[#E0CBB5] md:hidden"
                    aria-label="Scroll left"
                  >
                    <ChevronLeft size={18} className="text-[#A67856]" />
                  </button>
                )}

                {showRightRelatedArrow && (
                  <button
                    onClick={() => scrollRelated('right')}
                    className="absolute right-1 top-1/2 -translate-y-1/2 z-10 carousel-arrow p-1.5 shadow-md border border-[#E0CBB5] md:hidden"
                    aria-label="Scroll right"
                  >
                    <ChevronRight size={18} className="text-[#A67856]" />
                  </button>
                )}

                <div className="relative overflow-hidden px-0 -mx-4 md:mx-0 md:px-0 w-full">
                  <div
                    ref={relatedScrollRef}
                    className={`flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] ${relatedShowScrollHint ? 'scroll-hint-right' : ''}`}
                    style={{
                      WebkitOverflowScrolling: 'touch',
                      overscrollBehavior: 'contain',
                    }}
                  >
                    {relatedProducts.map((relatedProduct, index) => {
                      // Find smallest variant by price
                      let displayPrice = Number(relatedProduct.price);
                      let displayDiscount = Number(relatedProduct.discount) || 0;

                      if (relatedProduct.variants && relatedProduct.variants.length > 0) {
                        // Find variant with lowest original price
                        let smallestVariant = relatedProduct.variants[0];
                        let lowestOriginalPrice = Number(smallestVariant.price);

                        relatedProduct.variants.forEach(variant => {
                          const variantPrice = Number(variant.price);
                          if (variantPrice < lowestOriginalPrice) {
                            lowestOriginalPrice = variantPrice;
                            smallestVariant = variant;
                          }
                        });

                        displayPrice = Number(smallestVariant.price);
                        displayDiscount = Number(smallestVariant.discount) || 0;
                      }

                      const relatedDiscountedPrice = displayDiscount > 0
                        ? displayPrice * (1 - displayDiscount / 100)
                        : displayPrice;

                      return (
                        <div
                          key={relatedProduct._id}
                          className="min-w-[calc(50%-8px)] md:min-w-[240px] w-[calc(50%-8px)] md:w-[240px] flex-shrink-0 snap-start h-auto flex"
                        >
                          <div
                            className="swipe-hint-animation w-full border border-gray-200 overflow-hidden bg-white text-center pb-4 flex flex-col cursor-pointer hover:shadow-lg transition-shadow h-full"
                            onClick={() => {
                              window.scrollTo({ top: 0, behavior: 'instant' });
                              // If product has variants, navigate to first variant, otherwise use product ID
                              const productId = (relatedProduct.variants && relatedProduct.variants.length > 0) 
                                ? relatedProduct.variants[0]._id 
                                : relatedProduct._id;
                              navigate(`/product/${productId}`);
                            }}
                          >
                            <div className="relative w-full overflow-hidden bg-white h-[185px] md:h-[240px] pt-4 md:pt-6">
                              <img
                                src={getProductImage(relatedProduct.image, relatedProduct._id || index)}
                                alt={relatedProduct.itemName}
                                className="w-full h-full object-contain p-1 md:p-5"
                                onError={(e) => {
                                  e.target.src = getProductImage(null, relatedProduct._id || index);
                                }}
                              />
                              <div className="absolute top-2.5 right-2.5 flex flex-col gap-1 items-end z-10">
                                {displayDiscount > 0 && (relatedProduct.totalStock > 0 && (relatedProduct.variants?.some(v => v.stock > 0) || relatedProduct.stock > 0)) && (
                                  <div className="bg-red-500 text-white px-2.5 py-1.5 text-sm font-bold">
                                    Save {Math.round(displayDiscount)}%
                                  </div>
                                )}
                                {relatedProduct.stock === 0 && (
                                  <div className="bg-red-500 text-white px-2.5 py-1.5 text-sm font-bold">
                                    Sold Out
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="px-1.5 md:px-2.5 pt-1.5 md:pt-4 flex flex-col flex-grow">
                              {/* Decorative Line */}
                              <div
                                className="mx-auto mb-5 h-[1px] w-[40px]"
                                style={{ backgroundColor: 'rgba(74, 54, 40, 0.3)' }}
                              ></div>
                              <h3 className="lux-serif-text !text-[12px] md:!text-[14px] mb-2 text-gray-800 leading-snug whitespace-normal break-words min-h-[28px] md:min-h-[40px]">
                                {relatedProduct.itemName}
                              </h3>

                              <div className="mt-auto">
                                <div className="flex items-center justify-center gap-2.5">
                                  {displayDiscount > 0 ? (
                                    <>
                                      <span className="lux-price-number text-sm md:text-lg font-medium text-black">
                                        {relatedDiscountedPrice.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} ALL
                                      </span>
                                      <span className="lux-price-number text-xs md:text-sm text-gray-400 line-through">
                                        {displayPrice.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} ALL
                                      </span>
                                    </>
                                  ) : (
                                    <span className="lux-price-number text-sm md:text-lg font-medium text-black">
                                      {displayPrice.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} ALL
                                    </span>
                                  )}
                                </div>

                                <div className="pt-3">
                                  <button
                                    type="button"
                                    disabled={relatedProduct.stock === 0}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (relatedProduct.variants && relatedProduct.variants.length > 1) {
                                        setRelatedSidebarProduct(relatedProduct);
                                        setRelatedSidebarVariant(relatedProduct.variants[0]);
                                        setIsRelatedSidebarOpen(true);
                                      } else if (relatedProduct.variants && relatedProduct.variants.length === 1) {
                                        // Single variant - add directly
                                        const variant = relatedProduct.variants[0];
                                        const variantPrice = Number(variant.price);
                                        const variantDiscount = Number(variant.discount || 0);
                                        const discountedPrice = variantDiscount > 0
                                          ? (variantPrice * (1 - variantDiscount / 100)).toFixed(2)
                                          : null;

                                        addItem({
                                          id: variant._id,
                                          name: relatedProduct.itemName,
                                          price: variantPrice,
                                          discountedPrice: discountedPrice,
                                          image: variant.image || relatedProduct.image,
                                          company: relatedProduct.company,
                                          genericName: relatedProduct.genericName,
                                          discount: variantDiscount,
                                          seller: relatedProduct.seller,
                                          size: variant.size,
                                          variantId: variant._id
                                        });
                                      } else {
                                        // No variants - add directly
                                        addItem({
                                          id: relatedProduct._id,
                                          name: relatedProduct.itemName,
                                          price: relatedProduct.price,
                                          discountedPrice:
                                            relatedProduct.discount > 0
                                              ? (Number(relatedProduct.price) * (1 - Number(relatedProduct.discount) / 100)).toFixed(2)
                                              : null,
                                          image: relatedProduct.image,
                                          company: relatedProduct.company,
                                          genericName: relatedProduct.genericName,
                                          discount: relatedProduct.discount || 0,
                                          seller: relatedProduct.seller,
                                          size: relatedProduct.size || 'Standard',
                                          variantId: relatedProduct._id
                                        });
                                      }
                                    }}
                                    className={`w-full px-3 py-2 text-xs md:text-sm font-semibold uppercase tracking-wide border ${relatedProduct.stock === 0
                                      ? 'bg-gray-200 border-gray-300 text-gray-500 cursor-not-allowed'
                                      : 'bg-[#8B6F47]/70 border-[#8B6F47]/70 text-white hover:bg-[#7A5F3A]/80 hover:border-[#7A5F3A]/80'
                                      } transition-colors duration-150`}
                                  >
                                    {relatedProduct.stock === 0 ? 'Out of stock' : 'Shto ne shporte'}
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Page indicator */}
              {relatedTotalPages > 1 && (
                <div className="mt-4 text-center text-sm text-[#4A3628]">
                  {relatedCurrentPage} / {relatedTotalPages}
                </div>
              )}
            </div>
          )
        }
      </div>

      <VariantSelectionSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        product={product}
        selectedVariant={activeVariant}
        onSelectVariant={setActiveVariant}
        onAddToCart={() => {
          if (handleAddToCart()) {
            setIsSidebarOpen(false);
          }
        }}
      />

      <VariantSelectionSidebar
        isOpen={isRelatedSidebarOpen}
        onClose={() => {
          setIsRelatedSidebarOpen(false);
          setRelatedSidebarProduct(null);
          setRelatedSidebarVariant(null);
        }}
        product={relatedSidebarProduct}
        selectedVariant={relatedSidebarVariant}
        onSelectVariant={setRelatedSidebarVariant}
        onAddToCart={() => {
          if (relatedSidebarProduct && relatedSidebarVariant) {
            const variantPrice = Number(relatedSidebarVariant.price);
            const variantDiscount = Number(relatedSidebarVariant.discount || 0);
            const discountedPrice = variantDiscount > 0
              ? (variantPrice * (1 - variantDiscount / 100)).toFixed(2)
              : null;

            addItem({
              id: relatedSidebarProduct._id,
              name: relatedSidebarProduct.itemName,
              price: variantPrice,
              discountedPrice: discountedPrice,
              image: relatedSidebarProduct.image,
              company: relatedSidebarProduct.company,
              genericName: relatedSidebarProduct.genericName,
              discount: variantDiscount,
              seller: relatedSidebarProduct.seller,
              size: relatedSidebarVariant.size,
              variantId: relatedSidebarVariant._id
            });
            setIsRelatedSidebarOpen(false);
          }
        }}
      />
    </div >
  );
};

export default ProductDetail;
