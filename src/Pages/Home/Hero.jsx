// Hero with full screen background image that fades on scroll
import React, { useEffect, useRef, useState } from 'react';

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

  // Use scroll attachment for mobile, fixed for desktop (better performance)
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <section
      ref={heroRef}
      className="relative w-full h-[60vh] sm:h-[70vh] md:h-screen overflow-hidden z-0"
      style={{ 
        backgroundImage: `url(${bg})`, 
        backgroundSize: 'cover', 
        backgroundPosition: 'center top', 
        backgroundAttachment: isMobile ? 'scroll' : 'fixed', // Disable fixed on mobile for performance
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
      <div className="absolute inset-0 z-10 flex items-center justify-center">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center lg:items-end justify-between gap-8 lg:gap-16">
            {/* Left side - Text content (positioned on left for desktop) */}
            <div className="flex-1 max-w-2xl lg:max-w-3xl text-center lg:text-left lg:pb-24 xl:pb-32">
              <p 
                className="hero-text text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl font-medium text-white mb-6 md:mb-8"
                style={{
                  lineHeight: '1.6',
                  textShadow: '0 2px 12px rgba(0, 0, 0, 0.6), 0 1px 3px rgba(0, 0, 0, 0.4)',
                  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif"
                }}
              >
            Premium beauty and skincare products crafted with natural ingredients. Experience the difference with our dermatologist-tested formulations.
          </p>
              <div className="flex justify-center lg:justify-start">
          <button
            onClick={() => window.location.href = '/shop'}
                  className="bg-[#A67856] hover:bg-[#8B6345] active:bg-[#8B6345] text-white px-6 py-3 md:px-8 md:py-4 font-semibold transition-all duration-300 uppercase tracking-wide text-sm md:text-base border border-[#A67856] min-h-[44px] min-w-[160px] shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            Zbulo produktet
          </button>
              </div>
            </div>
            
            {/* Right side - Empty space for desktop layout balance */}
            <div className="hidden lg:block w-0 lg:w-64 xl:w-80 flex-shrink-0"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
