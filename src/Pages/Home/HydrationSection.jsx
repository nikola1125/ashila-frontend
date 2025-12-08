import React from 'react';
import { useNavigate } from 'react-router-dom';
import hydrationImage from '../../assets/hidratim.png';

const HydrationSection = () => {
  const navigate = useNavigate();

  const handleShopClick = () => {
    navigate('/shop?category=hydration');
  };

  return (
    <section className="pt-8 pb-8 md:pt-6 md:pb-12 bg-white relative overflow-hidden mt-0 md:mt-0">
      <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
        {/* Section Label */}
        <div className="mb-4 md:mb-12 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            Hidratimi dhe kujdesi ndaj lëkurës
          </h2>
          <div className="w-16 h-0.5 bg-[#A67856] mx-auto"></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-16 lg:gap-20 items-start">
          {/* Left Side - Article Content */}
          <div className="order-2 lg:order-1">
            <div className="max-w-xs md:max-w-lg mx-auto lg:mx-0">
              {/* Category Label */}
              <div className="mb-3 md:mb-4">
                <span className="text-[10px] font-semibold text-[#A67856] uppercase tracking-[0.2em] letter-spacing-wider">
                  Hidratim & Kujdes për Lëkurë
                </span>
              </div>

              {/* Main Headline */}
              <h2 className="text-xl md:text-3xl lg:text-4xl font-bold text-[#A67856] mb-3 md:mb-4 leading-tight">
                Sekreti i Lëkurës së Butë Në Dimër: Hidratoje si Duhet
              </h2>
              
              {/* Elegant Underline */}
              <div className="flex items-center gap-3 mb-4 md:mb-6">
                <div className="w-16 h-0.5 bg-[#A67856]"></div>
                <div className="w-1.5 h-1.5 bg-[#A67856]"></div>
              </div>
              
              {/* Article Text - Enhanced Typography */}
              <div className="space-y-3 md:space-y-4 mb-6 md:mb-8">
                <p className="text-[#4A3628] text-sm md:text-base leading-[1.7] font-light">
                  Në muajt e ftohtë, lëkura kërkon kujdes shtesë. Hidrato rregullisht duart, trupin dhe fytyrën me formula të pasura për të parandaluar çarjet, thatësinë dhe irritimet. Një rutinë e qëndrueshme është çelësi i një lëkure të shëndetshme.
                </p>
              </div>

              {/* Premium Shop Button */}
              <button
                onClick={handleShopClick}
                className="group relative bg-white text-[#A67856] border border-[#A67856] px-6 md:px-8 py-2 md:py-3 font-bold hover:bg-[#A67856] hover:text-white transition-all duration-300 uppercase tracking-wider text-xs overflow-hidden"
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

          {/* Right Side - Product Image with Simple Pharmacy Frame */}
          <div className="order-1 lg:order-2 flex items-start justify-start">
            <div className="relative w-full lg:w-full">
              {/* Simple Clean Frame - Fixed for mobile */}
              <div className="relative bg-white border border-[#D9BFA9] shadow-sm hover:shadow-md transition-shadow duration-300 w-full p-2 md:p-3 lg:p-4">
                {/* Image Container */}
                <div className="relative w-full overflow-hidden bg-white">
                  <img
                    src={hydrationImage}
                    alt="Hidratim & Kujdes për Lëkurë"
                    className="w-full h-auto object-contain max-h-[250px] md:max-h-[350px] lg:max-h-[600px]"
                    loading="lazy"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HydrationSection;

