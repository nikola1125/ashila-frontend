import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import papulesImage from '../../assets/papules.png';
import pustulesImage from '../../assets/pustules.png';
import blackHeadsImage from '../../assets/blackHeads.jpg';
import cystImage from '../../assets/cyst.png';
import backAcneImage from '../../assets/backAcne.png';

const items = [
  { key: 'papules', title: 'Papules', image: papulesImage },
  { key: 'cyst', title: 'Cyst', image: cystImage },
  { key: 'pustules', title: 'Pustules', image: pustulesImage },
  { key: 'blackhead', title: 'Blackhead', image: blackHeadsImage },
  { key: 'back-acne', title: 'Back Acne', image: backAcneImage }
];

const AcneCategories = () => {
  const navigate = useNavigate();
  const sliderRef = useRef(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Chunk items into groups of 2 for mobile
  const chunkedItems = useMemo(() => {
    const chunks = [];
    for (let i = 0; i < items.length; i += 2) {
      chunks.push(items.slice(i, i + 2));
    }
    return chunks;
  }, []);

  // Track scroll position for page numbers
  useEffect(() => {
    const slider = sliderRef.current;
    if (!slider) return;

    const handleScroll = () => {
      const width = slider.clientWidth || 1;
      const pageIndex = Math.round(slider.scrollLeft / width);
      setCurrentPage(Math.min(chunkedItems.length, pageIndex + 1));
    };

    handleScroll();
    slider.addEventListener('scroll', handleScroll);
    return () => slider.removeEventListener('scroll', handleScroll);
  }, [chunkedItems.length]);

  return (
    <section className="py-8 md:py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        {/* Centered Title */}
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-[#4A3628] mb-3 md:mb-4">
            Bli sipas llojit të akneve
          </h2>
          <div className="w-16 h-0.5 bg-[#A67856] mx-auto"></div>
        </div>

        {/* Desktop Grid Layout - 5 items, NO overlay by default, images fully visible */}
        <div className="hidden lg:grid grid-cols-5 gap-6 lg:gap-8 acne-category-grid">
          {items.map((item) => (
            <button
              key={item.key}
              onClick={() => navigate(`/shop?category=${item.key}`)}
              className="group relative w-full aspect-square overflow-hidden border-2 border-[#D9BFA9] hover:border-[#A67856] shadow-sm hover:shadow-lg transition-all duration-200"
            >
                <img
                  src={item.image}
                  alt={item.title}
                className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                loading="lazy"
                style={{ display: 'block', width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={(e) => {
                    e.target.src = `https://via.placeholder.com/400x400/EFEEED/999999?text=${encodeURIComponent(item.title)}`;
                  }}
                />
                
              {/* Overlay ONLY on hover - Desktop */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-end p-6 pointer-events-none">
                <h3 className="text-white font-semibold text-base lg:text-lg mb-2 drop-shadow-lg">
                    {item.title}
                  </h3>
                <div className="w-12 h-0.5 bg-[#A67856] mb-3"></div>
                <span className="text-white text-sm bg-white/20 backdrop-blur-sm px-4 py-2 inline-block border border-white/30">
                    Shiko produktet
                  </span>
              </div>
            </button>
          ))}
        </div>

        {/* Tablet Grid Layout - 3 columns */}
        <div className="hidden md:grid lg:hidden grid-cols-3 gap-6">
          {items.map((item) => (
            <button
              key={item.key}
              onClick={() => navigate(`/shop?category=${item.key}`)}
              className="group relative w-full aspect-square overflow-hidden border-2 border-[#D9BFA9] hover:border-[#A67856] shadow-sm hover:shadow-lg transition-all duration-200"
            >
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                loading="lazy"
                style={{ display: 'block', width: '100%', height: '100%', objectFit: 'cover' }}
                onError={(e) => {
                  e.target.src = `https://via.placeholder.com/400x400/EFEEED/999999?text=${encodeURIComponent(item.title)}`;
                }}
              />
              
              {/* Overlay ONLY on hover - Tablet */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-end p-4 pointer-events-none">
                <h3 className="text-white font-semibold text-sm mb-2 drop-shadow-lg">
                  {item.title}
                </h3>
                <div className="w-10 h-0.5 bg-[#A67856] mb-2"></div>
                <span className="text-white text-xs bg-white/20 backdrop-blur-sm px-3 py-1.5 inline-block border border-white/30">
                  Shiko produktet
                </span>
              </div>
            </button>
          ))}
        </div>

        {/* Mobile - Swipeable slider with 2 items per page */}
        <div className="block md:hidden">
          <div
            ref={sliderRef}
            className="flex overflow-x-auto snap-x snap-mandatory scroll-smooth [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {chunkedItems.map((group, pageIndex) => (
              <div key={`page-${pageIndex}`} className="min-w-full snap-start px-2">
                <div className="grid grid-cols-2 gap-3">
                  {group.map((item) => (
                    <button
                      key={item.key}
                      onClick={() => navigate(`/shop?category=${item.key}`)}
                      className="group relative w-full aspect-square overflow-hidden border-2 border-[#D9BFA9] active:border-[#A67856] shadow-sm transition-all duration-200"
                    >
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        loading="lazy"
                        style={{ display: 'block', width: '100%', height: '100%', objectFit: 'cover' }}
                          onError={(e) => {
                            e.target.src = `https://via.placeholder.com/400x400/EFEEED/999999?text=${encodeURIComponent(item.title)}`;
                          }}
                        />
                      {/* Elegant static overlay for mobile - ALWAYS VISIBLE */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent flex flex-col justify-end p-3 pointer-events-none">
                        <h3 className="text-white font-semibold text-xs text-center mb-1 drop-shadow-lg">
                          {item.title}
                        </h3>
                        <div className="w-8 h-0.5 bg-[#A67856] mx-auto mb-2"></div>
                        <span className="text-white text-[10px] bg-white/25 backdrop-blur-sm px-3 py-1.5 inline-block border border-white/30 text-center rounded-sm">
                          Shiko produktet
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
          {/* Page numbers */}
          <div className="mt-6 text-center text-sm text-[#4A3628] font-semibold">
            {currentPage} / {chunkedItems.length}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AcneCategories;
