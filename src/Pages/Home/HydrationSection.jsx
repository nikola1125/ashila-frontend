import React from 'react';
import { useNavigate } from 'react-router-dom';
import hydrationVideo from '../../assets/hidratim.mp4';

const HydrationSection = () => {
  const navigate = useNavigate();

  const handleShopClick = () => {
    navigate('/shop?category=hydration');
  };

  return (
    <section className="py-20 md:py-28 bg-gradient-to-b from-[#faf9f6] to-white relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-10 w-64 h-64 border-2 border-[#946259]"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 border-2 border-[#946259]"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-20 items-start">
          {/* Left Side - Article Content */}
          <div className="order-2 lg:order-1">
            {/* Category Label */}
            <div className="mb-4">
              <span className="text-[10px] font-semibold text-[#946259] uppercase tracking-[0.2em] letter-spacing-wider">
                Hidratim & Kujdes për Lëkurë
              </span>
            </div>

            {/* Main Headline */}
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-[#946259] mb-4 leading-tight">
              Lëkura juaj ka nevojë për hidratim?
            </h2>
            
            {/* Elegant Underline */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-16 h-0.5 bg-[#946259]"></div>
              <div className="w-1.5 h-1.5 bg-[#946259]"></div>
            </div>
            
            {/* Article Text - Enhanced Typography */}
            <div className="space-y-4 mb-8">
              <p className="text-[#2c2c2c] text-sm md:text-base leading-[1.7] font-light">
                Lloji i lëkurës, mjedisi, stili i jetesës dhe klima luajnë një rol kyç në mënyrën e duhur të hidratimit të lëkurës suaj. Koleksioni ynë i kremrave, serumeve, vajrave dhe locioneve të përzgjedhur ofron një gamë të gjerë formulimesh, nga ato të lehta dhe delikate deri te ato të pasura dhe intensive, për të siguruar që çdo nevojë unike e lëkurës të përmbushet me kujdesin që meriton.
              </p>
              <p className="text-[#2c2c2c] text-sm md:text-base leading-[1.7] font-light">
                Hidratimi i duhur është themeli i një lëkure të shëndetshme dhe të shkëlqyer. Produktet tona janë krijuar me përbërës natyralë dhe teknologji të avancuar për të siguruar hidratim optimal për çdo lloj lëkure.
              </p>
            </div>

            {/* Premium Shop Button */}
            <button
              onClick={handleShopClick}
              className="group relative bg-white text-[#946259] border border-[#946259] px-8 py-3 font-bold hover:bg-[#946259] hover:text-white transition-all duration-300 uppercase tracking-wider text-xs overflow-hidden"
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
              <div className="absolute inset-0 bg-[#946259] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
            </button>
          </div>

          {/* Right Side - Product Video with Premium Frame */}
          <div className="order-1 lg:order-2 flex items-start justify-start pt-[8rem] lg:pt-[8rem]">
            <div className="relative w-full">
              {/* Decorative frame elements */}
              <div className="absolute -top-4 -right-4 w-full h-full border border-[#946259] opacity-20"></div>
              <div className="absolute -bottom-4 -left-4 w-full h-full border border-[#946259] opacity-10"></div>
              
              {/* Main video container */}
              <div className="relative bg-white shadow-2xl border border-[#d4d4c4] p-1 transform hover:scale-[1.01] transition-transform duration-500">
                <div className="relative overflow-hidden bg-gradient-to-br from-[#faf9f6] to-white">
                  {/* Video element - no controls, larger */}
                  <video
                    className="w-full h-auto object-cover"
                    autoPlay
                    loop
                    muted
                    playsInline
                    poster="https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=800&h=600&fit=crop"
                  >
                    <source src={hydrationVideo} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                  
                  {/* Overlay gradient for depth */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent pointer-events-none"></div>
                </div>
              </div>

              {/* Decorative accent */}
              <div className="absolute -bottom-6 -left-6 w-20 h-20 border border-[#946259] opacity-30 transform rotate-45"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HydrationSection;

