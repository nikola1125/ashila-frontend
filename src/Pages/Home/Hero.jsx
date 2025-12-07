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
            // Use viewport height for fade distance, shorter on mobile
            const viewportHeight = window.innerHeight;
            const fadeDistance = viewportHeight * 0.6; // Fade over 60% of viewport
            const opacity = Math.max(0, 1 - scrollY / fadeDistance);
            
            // Also move the background up as we scroll
            const translateY = Math.min(scrollY * 0.5, viewportHeight * 0.3);
            
            // Direct DOM manipulation to avoid re-renders
            heroElement.style.opacity = opacity.toString();
            heroElement.style.transform = `translateZ(0) translateY(${translateY}px)`;
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
      className="fixed top-0 left-0 w-full h-[65vh] md:h-screen overflow-hidden z-0"
      style={{ 
        backgroundImage: `url(${bg})`, 
        backgroundSize: 'cover', 
        backgroundPosition: 'center', 
        backgroundAttachment: 'scroll',
        backgroundRepeat: 'no-repeat',
        opacity: 1,
        transform: 'translateZ(0)',
        backfaceVisibility: 'hidden',
        WebkitBackfaceVisibility: 'hidden',
        contain: 'layout style paint',
        isolation: 'isolate'
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
    </section>
  );
};

export default Hero;
