import React, { useState, useEffect, useRef, useContext, useCallback } from 'react';
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
  const hotspotPositions = [
    { x: 40, y: 30 },   // Product 1
    { x: 60, y: 50 },   // Product 2
    { x: 35, y: 70 },   // Product 3
    { x: 65, y: 70 },   // Product 4
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

  if (!productsData || productsData.length === 0) {
    return null;
  }

  const activeProduct = productsData[activeProductIndex];

  return (
    <section className="interactive-showcase py-16 px-5 bg-white">
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
              className={`hotspot absolute w-[50px] h-[50px] md:w-[50px] md:h-[50px] border-none bg-transparent cursor-pointer transform -translate-x-1/2 -translate-y-1/2 z-10 ${
                activeProductIndex === index ? 'active-hotspot' : ''
              }`}
              style={{
                left: `${hotspotPositions[index]?.x || 0}%`,
                top: `${hotspotPositions[index]?.y || 0}%`,
              }}
              aria-label={`View ${product.itemName || `product ${index + 1}`}`}
            >
              <span className="hotspot-pulse"></span>
              <span className={`hotspot-dot ${activeProductIndex === index ? 'active' : ''}`}></span>
            </button>
          ))}
        </div>

        {/* Product Information Panel */}
        {activeProduct && (
          <div className="product-info-panel flex-1 max-w-[500px] w-full p-10 bg-white rounded-[20px] shadow-[0_10px_30px_rgba(0,0,0,0.08)]">
            {/* Product Image */}
            <div className="flex items-center justify-center mb-6">
              <div 
                className="relative w-full overflow-hidden bg-[#f9f9f9] h-[200px] md:h-[250px]"
                style={{ 
                  maxWidth: '300px',
                }}
              >
                <img
                  src={getProductImage(activeProduct.image, activeProduct._id || activeProductIndex)}
                  alt={activeProduct.itemName}
                  className="w-full h-full object-contain p-5"
                  loading="lazy"
                  onError={(e) => {
                    e.target.src = getProductImage(null, activeProduct._id || activeProductIndex);
                  }}
                />
                {activeProduct.discount > 0 && (
                  <div className="absolute top-2.5 right-2.5 bg-red-500 text-white px-2.5 py-1.5 text-sm font-bold">
                    Save {activeProduct.discount}%
                  </div>
                )}
                {activeProduct.stock === 0 && (
                  <div className="absolute top-2.5 left-2.5 bg-red-500 text-white px-2.5 py-1.5 text-sm font-bold">
                    Sold Out
                  </div>
                )}
              </div>
            </div>

            {/* Product Name */}
            <h2 className="product-name text-[32px] md:text-[32px] text-[#4A3628] mb-8 font-semibold text-center md:text-left">
              {activeProduct.itemName}
            </h2>

            {/* Buttons */}
            <div className="flex flex-col gap-3">
              <button
                onClick={handleViewProduct}
                className="lux-btn-outline w-full"
              >
                Shiko detajet
              </button>
              <button
                onClick={handleAddToCart}
                className="lux-btn-primary w-full"
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
