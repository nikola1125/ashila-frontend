// Hero with full screen background image that fades on scroll
import React, { useEffect, useRef } from 'react';

const Hero = () => {
  const bg = 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=1600&auto=format&fit=crop&q=80';
  const heroRef = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => {
    let ticking = false;
    let lastScrollY = 0;
    const heroElement = heroRef.current;

    if (!heroElement) return;

    const handleScroll = () => {
      if (!ticking) {
        rafRef.current = requestAnimationFrame(() => {
          const scrollY = window.scrollY;
          
          // Only update if scroll changed significantly (throttle updates)
          if (Math.abs(scrollY - lastScrollY) > 5) {
            const fadeDistance = window.innerHeight;
            const opacity = Math.max(0, 1 - scrollY / fadeDistance);
            
            // Direct DOM manipulation to avoid re-renders
            heroElement.style.opacity = opacity.toString();
            lastScrollY = scrollY;
          }
          
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  return (
    <section
      ref={heroRef}
      className="relative w-full h-[70vh] md:h-screen overflow-hidden z-0"
      style={{ 
        backgroundImage: `url(${bg})`, 
        backgroundSize: 'cover', 
        backgroundPosition: 'center top', 
        backgroundAttachment: 'fixed',
        backgroundRepeat: 'no-repeat',
        opacity: 1,
        transform: 'translateZ(0)',
        backfaceVisibility: 'hidden',
        WebkitBackfaceVisibility: 'hidden',
        marginTop: 0,
        paddingTop: 0,
        top: 0,
        left: 0,
        right: 0
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
      
      {/* Hero Content Overlay */}
      <div className="absolute inset-0 z-10 flex items-center justify-center md:items-end md:justify-end">
        <div className="max-w-2xl md:max-w-3xl px-4 sm:px-6 pt-8 pb-2 sm:pt-0 sm:pb-20 md:pb-32 lg:pb-40 text-center md:text-right pr-0 md:pr-4 lg:pr-16 xl:pr-48 text-white">
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl leading-relaxed font-medium drop-shadow-lg mb-4 md:mb-6">
            Premium beauty and skincare products crafted with natural ingredients. Experience the difference with our dermatologist-tested formulations.
          </p>
          <button
            onClick={() => window.location.href = '/shop'}
            className="bg-[#A67856] hover:bg-[#8B6345] text-white px-6 py-3 md:px-8 md:py-4 font-semibold transition-all duration-300 uppercase tracking-wide text-sm md:text-base border border-[#A67856]"
          >
            Zbulo produktet
          </button>
        </div>
      </div>
    </section>
  );
};

export default Hero;
