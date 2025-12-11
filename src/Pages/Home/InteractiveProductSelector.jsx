import React, { useState, useEffect, useRef, useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import useAxiosSecure from '../../hooks/useAxiosSecure';
import { X } from 'lucide-react';
import { CartContext } from '../../Context/Cart/CartContext';
import { toast } from 'react-toastify';

const InteractiveProductSelector = () => {
  const navigate = useNavigate();
  const { publicApi } = useAxiosSecure();
  const { addItem } = useContext(CartContext);
  const [selectedProductIndex, setSelectedProductIndex] = useState(null);
  const [showPanel, setShowPanel] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const panelRef = useRef(null);
  const sectionRef = useRef(null);

  // Fetch products from API
  const { data: productsData = [] } = useQuery({
    queryKey: ['interactiveProducts'],
    queryFn: async () => {
      try {
        const response = await publicApi.get('/medicines');
        const allProducts = response?.result || response || [];
        // Return first 4 products for the interactive selector
        return Array.isArray(allProducts) ? allProducts.slice(0, 4) : [];
      } catch (err) {
        console.warn('Failed to fetch products for interactive selector:', err);
        return [];
      }
    },
    staleTime: 2 * 60 * 1000,
  });

  const handleClosePanel = useCallback(() => {
    setShowPanel(false);
    // Delay clearing selected product for smooth transition
    setTimeout(() => {
      setSelectedProductIndex(null);
      setIsTransitioning(false);
    }, 300);
  }, []);

  // Set first product as selected by default on page load (mobile only)
  useEffect(() => {
    if (productsData.length > 0 && selectedProductIndex === null) {
      // Only set default on mobile (screen width < 768px)
      if (window.innerWidth < 768) {
        setSelectedProductIndex(0);
        setShowPanel(true);
      }
    }
  }, [productsData, selectedProductIndex]);

  // Close panel as soon as scrolling starts (desktop only)
  useEffect(() => {
    if (!showPanel || window.innerWidth < 768) return;

    let scrollTimeout = null;
    let hasScrolled = false;

    const handleScroll = () => {
      // Close immediately on first scroll
      if (!hasScrolled) {
        hasScrolled = true;
        // Clear any pending timeout
        if (scrollTimeout) {
          clearTimeout(scrollTimeout);
        }
        // Close immediately
        handleClosePanel();
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimeout) {
        clearTimeout(scrollTimeout);
      }
    };
  }, [showPanel, handleClosePanel]);


  // Product positions for hotspots on the produkt.png image
  // Format: { x: percentage, y: percentage }
  // Positions adjusted to be inside each of the 4 products visible in the image
  const hotspotPositions = [
    { x: 20, y: 50 },   // Product 1 - Left side product (white bottle with green cap)
    { x: 52, y: 45 },   // Product 2 - Center product (gold ANEW jar)
    { x: 75, y: 48 },   // Product 3 - Right side product (purple cap product)
    { x: 45, y: 72 },   // Product 4 - Bottom product
  ];

  const handleHotspotClick = (index, e) => {
    e.stopPropagation();
    if (selectedProductIndex === index && showPanel) {
      // If clicking the same hotspot, just close
      handleClosePanel();
    } else {
      // If different product or panel is closed, open with image transition only
      if (selectedProductIndex !== null && showPanel) {
        // Switching products - animate image only
        setIsTransitioning(true);
        setSelectedProductIndex(index);
        setTimeout(() => setIsTransitioning(false), 300);
      } else {
        // Opening panel for first time
        setSelectedProductIndex(index);
        setShowPanel(true);
      }
    }
  };

  const handleViewProduct = () => {
    if (productsData[selectedProductIndex]?._id) {
      window.scrollTo({ top: 0, behavior: 'instant' });
      navigate(`/product/${productsData[selectedProductIndex]._id}`);
    } else {
      navigate('/shop');
    }
  };

  const handleAddToCart = (e) => {
    e.stopPropagation();
    if (selectedProduct && productsData[selectedProductIndex]) {
      const product = productsData[selectedProductIndex];
      const cartItem = {
        id: product._id,
        name: product.itemName,
        price: product.price,
        discountedPrice: product.discount > 0
          ? (Number(product.price) * (1 - Number(product.discount) / 100)).toFixed(2)
          : null,
        image: product.image,
        company: product.company,
        genericName: product.genericName,
        discount: product.discount || 0,
        seller: product.seller,
      };
      addItem(cartItem);
      toast.success('Produkti u shtua në shportë');
    }
  };

  if (!productsData || productsData.length === 0) {
    return null;
  }

  const selectedProduct = selectedProductIndex !== null ? productsData[selectedProductIndex] : null;
  const discountedPrice = selectedProduct?.discount > 0
    ? Number(selectedProduct.price) * (1 - Number(selectedProduct.discount) / 100)
    : Number(selectedProduct?.price || 0);

  return (
    <section ref={sectionRef} className="bg-white relative overflow-hidden mt-0 md:mt-0 lux-section">
      <div className="lux-section-inner relative z-10">
        {/* Lifestyle Image with Hotspots */}
        <div className="relative w-full aspect-[4/3] md:aspect-[16/10] max-h-[500px] md:max-h-[700px] overflow-hidden">
          {/* Lifestyle Product Image */}
          <img
            src="/images/produkt.png"
            alt="Skincare Products Collection"
            className="w-full h-full object-cover pointer-events-none"
            loading="lazy"
            onError={(e) => {
              e.target.src = '/placeholder.png';
            }}
          />

          {/* Hotspot Overlays */}
          {productsData.map((product, index) => {
            const handleTouch = (e) => {
              e.preventDefault();
              e.stopPropagation();
              handleHotspotClick(index, e);
            };

            return (
              <button
                key={product._id || index}
                onClick={(e) => handleHotspotClick(index, e)}
                onTouchEnd={handleTouch}
                className={`absolute hotspot-button ${
                  selectedProductIndex === index ? 'hotspot-active' : ''
                }`}
                style={{
                  left: `${hotspotPositions[index]?.x || 0}%`,
                  top: `${hotspotPositions[index]?.y || 0}%`,
                  transform: 'translate(-50%, -50%)',
                  touchAction: 'manipulation',
                  WebkitTapHighlightColor: 'transparent',
                  zIndex: 10,
                  width: '24px',
                  height: '24px',
                }}
                aria-label={`View ${product.itemName || `product ${index + 1}`}`}
              >
                <span className="ring"></span>
                <span className="circle"></span>
              </button>
            );
          })}
        </div>

        {/* Mobile Product Details - Below Image */}
        {selectedProduct && (
          <div className={`md:hidden w-full bg-white transition-all duration-300 ease-in-out overflow-hidden ${
            showPanel ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
          }`}>
            <div className="p-4">
              <div className="flex gap-4 items-start mb-4">
                {/* Product Thumbnail - Fixed size to prevent movement */}
                <div 
                  className="relative flex-shrink-0 rounded-lg overflow-hidden bg-transparent"
                  style={{ 
                    width: '80px',
                    height: '80px',
                    minHeight: '80px',
                  }}
                >
                  <img
                    key={selectedProduct._id || selectedProductIndex}
                    src={selectedProduct.image || '/placeholder.png'}
                    alt={selectedProduct.itemName}
                    className="absolute inset-0 w-full h-full object-contain p-2 transition-opacity duration-300"
                    style={{
                      opacity: isTransitioning ? 0 : 1,
                    }}
                    loading="lazy"
                    onError={(e) => {
                      e.target.src = '/placeholder.png';
                    }}
                  />
                  {selectedProduct.discount > 0 && (
                    <div className="absolute top-1 left-1 bg-[#A67856] text-white px-2 py-0.5 text-xs font-semibold rounded">
                      Save {selectedProduct.discount}%
                    </div>
                  )}
                  {selectedProduct.stock === 0 && (
                    <div className="absolute top-1 left-1 bg-red-500 text-white px-2 py-0.5 text-xs font-semibold rounded">
                      Sold Out
                    </div>
                  )}
                </div>

                {/* Product Info - Fixed height to prevent movement */}
                <div className="flex-1 min-w-0" style={{ minHeight: '80px' }}>
                  {/* Product Name */}
                  <h2 
                    className="text-sm font-semibold text-[#4A3628] mb-2 cursor-pointer hover:text-[#A67856] transition-colors"
                    onClick={handleViewProduct}
                    style={{
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      lineHeight: '1.4',
                      maxHeight: '2.8em',
                    }}
                  >
                    {selectedProduct.itemName}
                  </h2>

                  {/* Price */}
                  <div className="mb-3" style={{ minHeight: '28px' }}>
                    {selectedProduct.discount > 0 ? (
                      <div className="flex items-baseline gap-2">
                        <span className="text-lg font-bold text-[#A67856]">
                          {discountedPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ALL
                        </span>
                        <span className="text-sm text-gray-400 line-through">
                          {Number(selectedProduct.price).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ALL
                        </span>
                      </div>
                    ) : (
                      <span className="text-lg font-bold text-[#4A3628]">
                        {Number(selectedProduct.price).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ALL
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={handleViewProduct}
                  onTouchStart={(e) => e.stopPropagation()}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 active:bg-gray-300 text-[#4A3628] py-2.5 px-4 font-medium transition-all duration-200 rounded-lg min-h-[44px] touch-manipulation text-sm"
                >
                  More details
                </button>
                <button
                  onClick={handleAddToCart}
                  onTouchStart={(e) => e.stopPropagation()}
                  className="flex-1 bg-[#A67856] hover:bg-[#8B6345] active:bg-[#7a5438] text-white py-2.5 px-4 font-medium transition-all duration-200 rounded-lg min-h-[44px] touch-manipulation text-sm"
                >
                  Dergo porosine
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Desktop Side Panel for Product Details */}
        <div
          ref={panelRef}
          className={`hidden md:block fixed top-16 right-0 h-[calc(100vh-64px)] w-[450px] lg:w-[500px] bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out overflow-y-auto ${
            showPanel ? 'translate-x-0' : 'translate-x-full'
          }`}
          style={{
            WebkitOverflowScrolling: 'touch',
            overscrollBehavior: 'contain',
          }}
        >
          {selectedProduct && (
            <div className="flex flex-col h-full">
              {/* Panel Header */}
              <div className="flex items-center justify-between p-4 md:p-6 border-b border-gray-100 flex-shrink-0">
                <h3 className="text-lg md:text-xl font-semibold text-[#4A3628]">Product Details</h3>
                <button
                  onClick={handleClosePanel}
                  onTouchStart={(e) => e.stopPropagation()}
                  className="p-2 hover:bg-gray-50 active:bg-gray-100 rounded-full transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center touch-manipulation"
                  aria-label="Close panel"
                >
                  <X size={20} className="text-gray-600" />
                </button>
              </div>

              {/* Panel Content */}
              <div className="flex-1 overflow-y-auto p-4 md:p-6" style={{ touchAction: 'pan-y' }}>
                {/* Product Image with smooth transition - Fixed container to prevent movement */}
                <div className="flex items-center justify-center mb-6" style={{ minHeight: '300px' }}>
                  <div 
                    className="relative flex items-center justify-center rounded-lg overflow-hidden bg-transparent"
                    style={{ 
                      aspectRatio: '1/1',
                      width: '100%',
                      maxWidth: '300px',
                      height: '300px',
                    }}
                  >
                    <img
                      key={selectedProduct._id || selectedProductIndex}
                      src={selectedProduct.image || '/placeholder.png'}
                      alt={selectedProduct.itemName}
                      className="absolute inset-0 w-full h-full object-contain p-6 transition-opacity duration-300"
                      style={{
                        opacity: isTransitioning ? 0 : 1,
                      }}
                      loading="lazy"
                      onError={(e) => {
                        e.target.src = '/placeholder.png';
                      }}
                    />
                    {selectedProduct.discount > 0 && (
                      <div className="absolute top-3 left-3 bg-[#A67856] text-white px-3 py-1 text-xs font-semibold rounded">
                        Save {selectedProduct.discount}%
                      </div>
                    )}
                    {selectedProduct.stock === 0 && (
                      <div className="absolute top-3 left-3 bg-red-500 text-white px-3 py-1 text-xs font-semibold rounded">
                        Sold Out
                      </div>
                    )}
                  </div>
                </div>

                {/* Product Name */}
                <h2 
                  className="text-xl md:text-2xl font-semibold text-[#4A3628] mb-4 cursor-pointer hover:text-[#A67856] transition-colors"
                  onClick={handleViewProduct}
                >
                  {selectedProduct.itemName}
                </h2>

                {/* Price */}
                <div className="mb-6">
                  {selectedProduct.discount > 0 ? (
                    <div className="flex items-baseline gap-3">
                      <span className="text-2xl md:text-3xl font-bold text-[#A67856]">
                        {discountedPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ALL
                      </span>
                      <span className="text-lg text-gray-400 line-through">
                        {Number(selectedProduct.price).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ALL
                      </span>
                    </div>
                  ) : (
                    <span className="text-2xl md:text-3xl font-bold text-[#4A3628]">
                      {Number(selectedProduct.price).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ALL
                    </span>
                  )}
                </div>
              </div>

              {/* Panel Footer */}
              <div className="p-4 md:p-6 border-t border-gray-100 bg-gray-50 flex-shrink-0 space-y-3">
                <button
                  onClick={handleAddToCart}
                  onTouchStart={(e) => e.stopPropagation()}
                  className="w-full bg-[#A67856] hover:bg-[#8B6345] active:bg-[#7a5438] text-white py-3 md:py-3 px-6 font-semibold transition-all duration-200 uppercase tracking-wide rounded min-h-[44px] touch-manipulation"
                >
                  Dergo porosine
                </button>
                <button
                  onClick={handleViewProduct}
                  onTouchStart={(e) => e.stopPropagation()}
                  className="w-full bg-white hover:bg-gray-50 active:bg-gray-100 text-[#4A3628] border-2 border-[#A67856] py-3 md:py-3 px-6 font-semibold transition-all duration-200 uppercase tracking-wide rounded min-h-[44px] touch-manipulation"
                >
                  Shiko detajet
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default InteractiveProductSelector;
