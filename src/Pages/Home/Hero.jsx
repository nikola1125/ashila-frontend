// Hero with full screen background video that fades on scroll
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Hero = () => {
  const navigate = useNavigate();
  const bg = '/images/backg.mp4';
  const heroRef = useRef(null);
  const videoRef = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => {
    let ticking = false;
    let lastScrollY = 0;
    let scrollTimeout = null;
    let cleanup = null;
    const heroElement = heroRef.current;
    const videoElement = videoRef.current;

    if (!heroElement) return;

    // Wait for video to be ready in production builds
    const handleScroll = () => {
      // Clear any pending timeout
      if (scrollTimeout) {
        clearTimeout(scrollTimeout);
      }

      if (!ticking) {
        rafRef.current = requestAnimationFrame(() => {
          const scrollY = window.scrollY;
          
          // Only update if scroll changed significantly (throttle updates)
          // On mobile, be more lenient to avoid glitches, especially in production
          const isMobile = window.innerWidth < 768;
          const threshold = isMobile ? 15 : 5; // Increased threshold for production mobile
          
          if (Math.abs(scrollY - lastScrollY) > threshold) {
            const fadeDistance = window.innerHeight;
            const opacity = Math.max(0, 1 - scrollY / fadeDistance);
            
            // Direct DOM manipulation to avoid re-renders
            // Use will-change for better performance on mobile
            if (heroElement) {
              heroElement.style.willChange = 'opacity';
              heroElement.style.opacity = opacity.toString();
            }
            if (videoElement) {
              videoElement.style.willChange = 'opacity';
              videoElement.style.opacity = opacity.toString();
            }
            lastScrollY = scrollY;
            
            // Reset will-change after animation (debounced for production)
            scrollTimeout = setTimeout(() => {
              if (heroElement) heroElement.style.willChange = 'auto';
              if (videoElement) videoElement.style.willChange = 'auto';
            }, 400);
          }
          
          ticking = false;
        });
        ticking = true;
      }
    };

    const initScrollHandler = () => {
      window.addEventListener('scroll', handleScroll, { passive: true });
    };

    // In production, wait for video to load before initializing scroll handler
    // This prevents timing issues in production builds where assets load differently
    if (videoElement) {
      let isInitialized = false;
      const handleVideoReady = () => {
        if (isInitialized) return;
        isInitialized = true;
        // Small delay to ensure everything is ready in production
        setTimeout(initScrollHandler, 150);
      };
      
      if (videoElement.readyState >= 2) {
        // Video already loaded
        handleVideoReady();
      } else {
        videoElement.addEventListener('loadeddata', handleVideoReady, { once: true });
        videoElement.addEventListener('canplay', handleVideoReady, { once: true });
        // Fallback timeout in case events don't fire in production (Netlify/CDN issues)
        setTimeout(() => {
          if (!isInitialized) {
            handleVideoReady();
          }
        }, 2000);
      }
    } else {
      // No video, initialize immediately
      initScrollHandler();
    }

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimeout) {
        clearTimeout(scrollTimeout);
      }
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

  // iOS-specific fixes for scroll glitches on mobile
  useEffect(() => {
    if (!isMobile) return;

    // Ensure smooth scrolling on iOS
    const heroElement = heroRef.current;
    if (heroElement) {
      heroElement.style.WebkitOverflowScrolling = 'touch';
      heroElement.style.overscrollBehavior = 'contain';
    }

    return () => {
      if (heroElement) {
        heroElement.style.WebkitOverflowScrolling = '';
        heroElement.style.overscrollBehavior = '';
      }
    };
  }, [isMobile]);

  // Ensure video loops forever and never stops
  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    // Force video to play and loop continuously
    const ensurePlaying = () => {
      if (videoElement.paused) {
        videoElement.play().catch(err => {
          console.warn('Video autoplay prevented:', err);
        });
      }
    };

    // Handle video end - restart immediately
    const handleEnded = () => {
      videoElement.currentTime = 0;
      videoElement.play().catch(err => {
        console.warn('Video restart failed:', err);
      });
    };

    // Handle video pause - resume immediately
    const handlePause = () => {
      if (videoElement.ended) {
        videoElement.currentTime = 0;
      }
      videoElement.play().catch(err => {
        console.warn('Video resume failed:', err);
      });
    };

    // Ensure video is playing on load
    const handleLoadedData = () => {
      videoElement.loop = true;
      ensurePlaying();
    };

    // Ensure video continues playing
    const handleTimeUpdate = () => {
      // If video is near the end, ensure it loops
      if (videoElement.currentTime >= videoElement.duration - 0.1) {
        videoElement.currentTime = 0;
      }
    };

    // Add event listeners
    videoElement.addEventListener('ended', handleEnded);
    videoElement.addEventListener('pause', handlePause);
    videoElement.addEventListener('loadeddata', handleLoadedData);
    videoElement.addEventListener('timeupdate', handleTimeUpdate);

    // Set loop attribute programmatically
    videoElement.loop = true;
    videoElement.setAttribute('loop', 'true');

    // Ensure video starts playing
    ensurePlaying();

    // Periodic check to ensure video is playing (fallback)
    const playInterval = setInterval(() => {
      ensurePlaying();
    }, 1000);

    return () => {
      videoElement.removeEventListener('ended', handleEnded);
      videoElement.removeEventListener('pause', handlePause);
      videoElement.removeEventListener('loadeddata', handleLoadedData);
      videoElement.removeEventListener('timeupdate', handleTimeUpdate);
      clearInterval(playInterval);
    };
  }, []);

  return (
    <section
      ref={heroRef}
      className="relative w-full h-[60vh] sm:h-[70vh] md:h-screen overflow-hidden z-0"
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
        overscrollBehavior: 'contain'
      }}
    >
      {/* Background Video */}
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        webkit-playsinline="true"
        x5-playsinline="true"
        className="absolute inset-0 w-full h-full object-cover z-0"
        onEnded={(e) => {
          // Force restart if loop fails
          e.target.currentTime = 0;
          e.target.play().catch(() => {});
        }}
        onPause={(e) => {
          // Prevent pausing - resume immediately
          if (!e.target.ended) {
            e.target.play().catch(() => {});
          }
        }}
        style={{
          position: isMobile ? 'absolute' : 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          opacity: 1,
          transform: 'translateZ(0)',
          WebkitTransform: 'translateZ(0)',
          backfaceVisibility: 'hidden',
          WebkitBackfaceVisibility: 'hidden',
          pointerEvents: 'none',
          touchAction: 'none',
          willChange: 'opacity',
          // Production-specific fixes
          isolation: 'isolate',
          contain: 'layout style paint'
        }}
      >
        <source src={bg} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      
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
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-4 pb-20 sm:pb-24 md:pb-28 flex justify-end">
          <div className="flex flex-col items-end gap-3 hero-cta-group">
            <button
              onClick={() => {
                const message = encodeURIComponent('Pershendetje, interesohem per te bere nje skin test.');
                window.open(`https://wa.me/355686879292?text=${message}`, '_blank');
              }}
              className="lux-btn-primary px-3 py-1.5 text-xs md:px-8 md:py-3 md:text-base shadow-lg hover:shadow-xl transform hover:scale-[1.02] hero-cta-primary"
            >
              Rezervo skin test-in tend
            </button>
            <button
              onClick={() => {
                navigate('/shop');
              }}
              className="lux-btn-outline px-3 py-1.5 text-xs md:px-8 md:py-3 md:text-base shadow-md hover:shadow-lg transform hover:scale-[1.01] hero-cta-secondary"
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