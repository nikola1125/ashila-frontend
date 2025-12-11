import React from 'react';
import { useNavigate } from 'react-router-dom';
import gripImage from '../../assets/grip.png';

const FluSection = () => {
  const navigate = useNavigate();

  const handleShopClick = () => {
    navigate('/shop?category=vitamins');
  };

  return (
    <section className="bg-white relative overflow-hidden mt-0 md:mt-0 lux-section">
      <div className="lux-section-inner relative z-10">
        {/* Section Label */}
        <div className="mb-4 md:mb-12 text-center fade-in">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            Vitaminat dhe Mbrojtja Kundër Gripit
          </h2>
          <div className="w-16 h-0.5 bg-[#A67856] mx-auto"></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-10 lg:gap-12 items-start">
          {/* Left Side - Product Image with Simple Pharmacy Frame */}
          <div className="order-1 lg:order-1 flex items-start justify-start slide-left">
            <div className="relative w-full lg:w-4/5">
              {/* Simple Clean Frame - Fixed for mobile */}
              <div className="relative bg-white border border-[#D9BFA9] shadow-sm hover:shadow-md transition-shadow duration-300 w-full py-1 px-1 md:py-2 md:px-2 lg:py-3 lg:px-3">
                {/* Image Container */}
                <div className="relative w-full overflow-hidden bg-white">
                  <img
                    src={gripImage}
                    alt="Vitaminat dhe Mbrojtja Kundër Gripit"
                    className="w-full h-auto object-contain max-h-[250px] md:max-h-[350px] lg:max-h-[600px]"
                    loading="lazy"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Article Content */}
          <div className="order-2 lg:order-2 slide-right">
            <div className="max-w-xs md:max-w-lg mx-auto lg:mx-0 lg:ml-4">
              {/* Category Label */}
              <div className="mb-3 md:mb-4">
                <span className="lux-heading text-[#A67856]">
                  Vitaminat & Imuniteti
                </span>
              </div>

              {/* Main Headline */}
              <h2 className="lux-title text-[#A67856] mb-3 md:mb-4">
                Vitaminat: Mbrojtësi Juaj Kundër Gripit
              </h2>
              
              {/* Elegant Underline */}
              <div className="flex items-center gap-3 mb-4 md:mb-6">
                <div className="w-16 h-0.5 bg-[#A67856]"></div>
                <div className="w-1.5 h-1.5 bg-[#A67856]"></div>
              </div>
              
              {/* Article Text - Enhanced Typography */}
              <div className="space-y-3 md:space-y-4 mb-6 md:mb-8">
                <p className="text-[#4A3628] text-sm md:text-base leading-[1.7] font-light lux-subtitle max-w-none">
                  Vitaminat, veçanërisht C, D dhe B6, janë thelbësore për forcimin e sistemit imunitar dhe parandalimin e gripit sezonal. Ato ndihmojnë në luftën kundër infeksioneve dhe përshpejtojnë rikuperimin, duke mbështetur trupin gjatë sezonit të gripit dhe duke ulur rrezikun e infektimit.
                </p>
              </div>

              {/* Premium Shop Button */}
              <button
                onClick={handleShopClick}
                className="group relative lux-btn-outline px-6 md:px-8 py-2 md:py-3 overflow-hidden"
              >
                <span className="relative z-10 flex items-center gap-2">
                  Zbulo produktet
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

export default FluSection;

