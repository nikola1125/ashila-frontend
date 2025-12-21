import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import useAxiosSecure from '../../hooks/useAxiosSecure';
import { CartContext } from '../../Context/Cart/CartContext';
import { toast } from 'react-toastify';
import { getProductImage } from '../../utils/productImages';
import '../../styles/InteractiveProductSelector.css';

const InteractiveProductSelector = () => {
  const navigate = useNavigate();
  const { publicApi } = useAxiosSecure();
  const { addItem } = useContext(CartContext);
  const [activeProductIndex, setActiveProductIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile for responsive pulse size
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Fetch products from API
  const { data: productsData = [] } = useQuery({
    queryKey: ['interactiveProducts'],
    queryFn: async () => {
      try {
        const response = await publicApi.get('/medicines');
        const allProducts = response?.result || response || [];
        // Return first 3-4 products for the interactive selector
        return Array.isArray(allProducts) ? allProducts.slice(0, 4) : [];
      } catch (err) {
        console.warn('Failed to fetch products for interactive selector:', err);
        return [];
      }
    },
    staleTime: 2 * 60 * 1000,
  });

  // Product positions for hotspots on the produkt.png image
  // Position values are percentages: x (0-100) = horizontal position, y (0-100) = vertical position
  // x: 0% = left edge, 50% = center, 100% = right edge
  // y: 0% = top edge, 50% = center, 100% = bottom edge
  // The hotspot is centered on these coordinates
  const hotspotPositions = [
    { x: 73, y: 30 },   // Product 1 - Adjust these values to move the hotspot
    { x: 60, y: 50 },   // Product 2 - Example: { x: 25, y: 45 } moves it 25% from left, 45% from top
    { x: 38, y: 50 },   // Product 3
    { x: 65, y: 90 },   // Product 4
  ];

  const handleHotspotClick = useCallback((index) => {
    setActiveProductIndex(index);
  }, []);

  const handleViewProduct = useCallback(() => {
    if (productsData[activeProductIndex]?._id) {
      window.scrollTo({ top: 0, behavior: 'instant' });
      navigate(`/product/${productsData[activeProductIndex]._id}`);
    } else {
      navigate('/shop');
    }
  }, [productsData, activeProductIndex, navigate]);

  const handleAddToCart = useCallback((e) => {
    e.stopPropagation();
    if (productsData[activeProductIndex]) {
      const product = productsData[activeProductIndex];
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
  }, [productsData, activeProductIndex, addItem]);

  // Set first product as default when products load
  useEffect(() => {
    if (productsData.length > 0) {
      setActiveProductIndex(0);
    }
  }, [productsData.length]);

  // Calculate active product early to avoid reference errors
  const activeProduct = productsData && productsData.length > 0 ? productsData[activeProductIndex] : null;

  // Retrigger image animation when product changes
  useEffect(() => {
    if (activeProduct) {
      // Force reflow to retrigger image animation only
      const image = document.querySelector('.product-image-animated');
      if (image) {
        // Remove and re-add animation to retrigger
        image.style.animation = 'none';
        void image.offsetWidth; // Force reflow
        image.style.animation = '';
      }
    }
  }, [activeProductIndex, activeProduct]);

  if (!productsData || productsData.length === 0) {
    return null;
  }

  return (
    <section className="interactive-showcase py-8 md:py-16 px-5 bg-white -mt-8 md:mt-0">
      <div className="showcase-container max-w-[1200px] mx-auto flex flex-col md:flex-row items-center gap-16">
        {/* Main Product Image with Hotspots */}
        <div className="main-product-image relative flex-1 max-w-[600px] w-full">
          <img
            src="/images/produkt.png"
            alt="KN 1.0 Product"
            className="product-main-img w-full rounded-[20px] shadow-[0_10px_30px_rgba(0,0,0,0.1)]"
            loading="lazy"
            onError={(e) => {
              e.target.src = getProductImage();
            }}
          />

          {/* Hotspot Overlays */}
          {productsData.map((product, index) => (
            <button
              key={product._id || index}
              onClick={() => handleHotspotClick(index)}
              className={`hotspot absolute w-[50px] h-[50px] md:w-[50px] md:h-[50px] border-none bg-transparent cursor-pointer z-10 ${activeProductIndex === index ? 'active' : ''}`}
              style={{
                left: `${hotspotPositions[index]?.x || 0}%`,
                top: `${hotspotPositions[index]?.y || 0}%`,
                borderRadius: '50%',
                transform: 'translate3d(-50%, -50%, 0)',
                WebkitTransform: 'translate3d(-50%, -50%, 0)',
              }}
              aria-label={`View ${product.itemName || `product ${index + 1}`}`}
            >
              {/* Pulse Animation - CSS based */}
              <span
                className="hotspot-pulse"
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  width: isMobile ? '32px' : '40px',
                  height: isMobile ? '32px' : '40px',
                  background: 'rgba(166, 120, 86, 0.6)',
                  borderRadius: '50%',
                  zIndex: 1,
                  pointerEvents: 'none',
                  transform: 'translate3d(-50%, -50%, 0)',
                  WebkitTransform: 'translate3d(-50%, -50%, 0)',
                }}
              />
              {/* Hotspot Dot */}
              <span
                className={`hotspot-dot ${activeProductIndex === index ? 'active' : ''}`}
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate3d(-50%, -50%, 0)',
                  WebkitTransform: 'translate3d(-50%, -50%, 0)',
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  border: '3px solid white',
                  zIndex: 2,
                }}
              />
            </button>
          ))}
        </div>

        {/* Product Information Panel */}
        {activeProduct && (
          <div className="product-info-panel flex-1 max-w-[500px] w-full p-10 bg-white rounded-[20px] shadow-[0_10px_30px_rgba(0,0,0,0.08)]">
            {/* Product Image - Animated on change */}
            <div className="flex items-center justify-center mb-6">
              <div
                className="relative w-full overflow-hidden bg-[#f9f9f9] h-[200px] md:h-[250px]"
                style={{
                  maxWidth: '300px',
                }}
              >
                <img
                  key={activeProduct._id}
                  src={getProductImage(activeProduct.image, activeProduct._id || activeProductIndex)}
                  alt={activeProduct.itemName}
                  className="w-full h-full object-contain p-5 product-image-animated"
                  loading="lazy"
                  onError={(e) => {
                    e.target.src = getProductImage(null, activeProduct._id || activeProductIndex);
                  }}
                />
                {activeProduct.discount > 0 && (
                  <div className="absolute top-2.5 right-2.5 bg-red-500 text-white px-2.5 py-1.5 text-sm font-bold product-badge">
                    Save {activeProduct.discount}%
                  </div>
                )}
                {activeProduct.stock === 0 && (
                  <div className="absolute top-2.5 left-2.5 bg-red-500 text-white px-2.5 py-1.5 text-sm font-bold product-badge">
                    Sold Out
                  </div>
                )}
              </div>
            </div>

            {/* Product Name */}
            {/* Product Name */}
            <h2 className="lux-title text-[32px] md:text-[32px] text-[#4A3628] mb-8 text-center md:text-left">
              {activeProduct.itemName}
            </h2>

            {/* Buttons - Static, no animation */}
            <div className="flex flex-col gap-3">
              <button
                onClick={handleViewProduct}
                className="lux-btn-outline w-full product-button"
              >
                Shiko detajet
              </button>
              <button
                onClick={handleAddToCart}
                className="lux-btn-primary w-full product-button"
              >
                Shto ne shporte
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default InteractiveProductSelector;
