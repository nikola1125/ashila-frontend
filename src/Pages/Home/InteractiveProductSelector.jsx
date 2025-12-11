import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const InteractiveProductSelector = () => {
  const navigate = useNavigate();
  const [selectedProductIndex, setSelectedProductIndex] = useState(0);

  // Images from public/images - cycling through available images
  const productImages = [
    '/images/25-12-248-5_f6d1d39c-0dbb-41df-b09b-606b8643c4d4.webp',
    '/images/2d6c295f-0d8b-4ed7-9048-15c38970f06c.webp',
    '/images/4_191a7880-0b71-4057-9ab7-35e79aafa669.webp',
    '/images/5_0bf7b0e1-73b6-44dd-94f4-dc404b267c7a.webp',
    '/images/baume.webp',
    '/images/BeautyofJoseon-ReliefSuntexture.webp',
    '/images/centella.webp',
    '/images/ceravefoaming2.webp',
    '/images/IMG_2112_301a03db-e67d-4e84-9cd9-9c97c40824d2.webp',
    '/images/MisshaALLAROUNDSUNSPF50.webp',
    '/images/puff_254f1eef-7b9c-446a-be78-d82c14da0c4b.webp',
    '/images/skin55ml_c9356fb5-f92f-4b33-b31b-0c44cf88c58e.webp',
    '/images/TheOrdinaryGlycolicAcid7_ToningSolutiontexture.webp',
  ];

  // Use first 6 images, cycling if needed
  const displayImages = Array.from({ length: 6 }, (_, i) => 
    productImages[i % productImages.length]
  );

  // Product positions for circles (these would be adjusted based on actual image)
  // Format: { x: percentage, y: percentage }
  const productPositions = [
    { x: 20, y: 30 },   // Product 1
    { x: 50, y: 25 },   // Product 2
    { x: 80, y: 30 },   // Product 3
    { x: 25, y: 65 },   // Product 4
    { x: 55, y: 70 },   // Product 5
    { x: 85, y: 65 },   // Product 6
  ];

  const selectedImage = displayImages[selectedProductIndex];

  const handleProductClick = (index) => {
    setSelectedProductIndex(index);
  };

  const handleViewProduct = () => {
    navigate('/shop');
  };

  return (
    <section className="bg-white relative overflow-hidden mt-0 md:mt-0 lux-section">
      <div className="lux-section-inner relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 lg:gap-16 items-center">
          {/* Left Side - Group Image with Clickable Circles */}
          <div className="order-1 lg:order-1 relative">
            <div className="relative w-full bg-[#EFEEED] aspect-square max-h-[500px] lg:max-h-[600px]">
              {/* Group Product Image */}
              <div className="w-full h-full flex items-center justify-center p-8">
                <div className="grid grid-cols-3 gap-4 w-full h-full">
                  {displayImages.map((image, index) => (
                    <div key={index} className="flex items-center justify-center">
                      <img
                        src={image}
                        alt={`Product ${index + 1}`}
                        className="max-w-full max-h-full object-contain opacity-60"
                        onError={(e) => {
                          e.target.src = '/placeholder.png';
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Clickable Circles Overlay */}
              {displayImages.map((image, index) => (
                <button
                  key={index}
                  onClick={() => handleProductClick(index)}
                  className={`absolute w-8 h-8 md:w-10 md:h-10 rounded-full border-2 transition-all duration-300 ${
                    selectedProductIndex === index
                      ? 'bg-[#A67856] border-[#A67856] scale-125'
                      : 'bg-white border-gray-400 hover:border-[#A67856] hover:scale-110'
                  }`}
                  style={{
                    left: `${productPositions[index]?.x || 0}%`,
                    top: `${productPositions[index]?.y || 0}%`,
                    transform: 'translate(-50%, -50%)',
                  }}
                  aria-label={`Select product ${index + 1}`}
                >
                  <div className={`w-full h-full rounded-full ${
                    selectedProductIndex === index ? 'bg-[#A67856]' : 'bg-white'
                  }`}></div>
                </button>
              ))}
            </div>
          </div>

          {/* Right Side - Selected Product Info */}
          <div className="order-2 lg:order-2">
            <div className="max-w-lg mx-auto lg:mx-0">
              {/* Category Label */}
              <div className="mb-3 md:mb-4">
                <span className="lux-heading text-[#A67856]">
                  Produkt i Përzgjedhur
                </span>
              </div>

              {/* Product Name */}
              <h2 className="lux-title text-[#A67856] mb-3 md:mb-4">
                Produkt Premium
              </h2>
              
              {/* Elegant Underline */}
              <div className="flex items-center gap-3 mb-4 md:mb-6">
                <div className="w-16 h-0.5 bg-[#A67856]"></div>
                <div className="w-1.5 h-1.5 bg-[#A67856]"></div>
              </div>

              {/* Product Description */}
              <div className="mb-6 md:mb-8">
                <p className="text-[#4A3628] text-sm md:text-base leading-[1.7] font-light lux-subtitle max-w-none">
                  Produkt i kualitetit të lartë, i kuruar me kujdes për nevojat tuaja. Formuluar me përbërës natyralë dhe efektivë për rezultate optimale.
                </p>
              </div>

              {/* Price */}
              <div className="mb-6 md:mb-8">
                <span className="text-xl md:text-2xl font-semibold text-[#4A3628]">
                  2,500.00 ALL
                </span>
              </div>

              {/* View Product Button */}
              <button
                onClick={handleViewProduct}
                className="group relative lux-btn-outline px-6 md:px-8 py-2 md:py-3 overflow-hidden"
              >
                <span className="relative z-10 flex items-center gap-2">
                  Shiko produktin
                  <svg 
                    className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </span>
                <div className="absolute inset-0 bg-[#A67856] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default InteractiveProductSelector;

