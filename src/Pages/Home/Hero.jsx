// Hero with full screen background image
import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const Hero = () => {
  const navigate = useNavigate();
  // Random demo background image (online URL) – you can change this to any image you like
  const bg =
    'https://images.pexels.com/photos/3738344/pexels-photo-3738344.jpeg?auto=compress&cs=tinysrgb&w=1600';
  const heroRef = useRef(null);

  return (
    <section
      ref={heroRef}
      className="relative w-full h-[60vh] sm:h-[70vh] md:h-screen overflow-hidden z-0 bg-cover bg-center"
      style={{ 
        opacity: 1,
        transform: 'translateZ(0)',
        backfaceVisibility: 'hidden',
        WebkitBackfaceVisibility: 'hidden',
        WebkitTransform: 'translateZ(0)',
        marginTop: 0,
        paddingTop: 0,
        top: 0,
        left: 0,
        right: 0,
        touchAction: 'pan-y',
        WebkitOverflowScrolling: 'touch',
        overscrollBehavior: 'contain',
        backgroundImage: `url(${bg})`
      }}
    >
      {/* Dark overlay */}
      <div 
        className="absolute inset-0 bg-black/35 z-0" 
        style={{ 
          transform: 'translateZ(0)',
          willChange: 'auto'
        }} 
      />
      
      {/* Hero Content Overlay - CTAs positioned bottom-right, slightly higher */}
      <div className="absolute inset-0 z-10 flex items-end justify-end">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-4 pb-10 sm:pb-24 md:pb-28 flex justify-end">
          <div className="flex flex-col items-end gap-2 md:gap-3 hero-cta-group">
            <button
              onClick={() => {
                const message = encodeURIComponent('Pershendetje, interesohem per te bere nje skin test.');
                window.open(`https://wa.me/355686879292?text=${message}`, '_blank');
              }}
              className="lux-btn-primary px-2 py-1 text-[10px] md:px-8 md:py-3 md:text-base shadow-lg hover:shadow-xl transform hover:scale-[1.02] hero-cta-primary"
            >
              Rezervo skin test-in tend
            </button>
            <button
              onClick={() => {
                navigate('/shop');
              }}
              className="lux-btn-outline px-2 py-1 text-[10px] md:px-8 md:py-3 md:text-base shadow-md hover:shadow-lg transform hover:scale-[1.01] hero-cta-secondary"
            >
              Zbulo produktet
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;