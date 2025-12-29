// Hero with full screen background video
import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Hero = () => {
  const navigate = useNavigate();
  const heroRef = useRef(null);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [videoError, setVideoError] = useState(false);

  useEffect(() => {
    // Preload video
    const video = document.createElement('video');
    video.src = '/images/backg.mp4';
    video.muted = true;
    video.playsInline = true;
    
    video.addEventListener('canplaythrough', () => {
      setVideoLoaded(true);
    });
    
    video.addEventListener('error', () => {
      setVideoError(true);
    });
    
    // Start loading
    video.load();
  }, []);

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
        // Show background image immediately while video loads
        backgroundImage: videoLoaded ? 'none' : 'url(/images/background.png)',
        backgroundColor: videoError ? '#f3f4f6' : 'transparent'
      }}
    >
      {/* Background video with fallback */}
      {(videoLoaded || !videoError) && (
        <video
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300"
          src="/images/backg.mp4"
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          aria-hidden="true"
          style={{
            opacity: videoLoaded ? 1 : 0,
            transform: 'translateZ(0)',
            willChange: 'transform'
          }}
          onCanPlayThrough={() => setVideoLoaded(true)}
          onError={() => {
            console.log('Video failed to load, using background image');
            setVideoError(true);
          }}
        />
      )}
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
              className="lux-btn-primary !min-h-[34px] !px-4 !py-2 md:!min-h-[44px] md:!px-8 md:!py-3 shadow-lg hover:shadow-xl transform hover:scale-[1.02] hero-cta-primary"
            >
              Rezervo skin test-in tend
            </button>
            <button
              onClick={() => {
                navigate('/shop');
              }}
              className="lux-btn-outline !min-h-[34px] !px-4 !py-2 md:!min-h-[44px] md:!px-8 md:!py-3 shadow-md hover:shadow-lg transform hover:scale-[1.01] hero-cta-secondary"
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