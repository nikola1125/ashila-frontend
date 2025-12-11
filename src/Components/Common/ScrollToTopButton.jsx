import React, { useState, useEffect } from 'react';
import { ChevronUp } from 'lucide-react';

const ScrollToTopButton = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      // Show button when user scrolls down 300px
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    // Listen to scroll events
    window.addEventListener('scroll', toggleVisibility, { passive: true });

    // Check initial scroll position
    toggleVisibility();

    return () => {
      window.removeEventListener('scroll', toggleVisibility);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  if (!isVisible) {
    return null;
  }

  return (
    <button
      onClick={scrollToTop}
      className="fixed bottom-6 right-6 md:bottom-8 md:right-8 z-50 bg-transparent hover:bg-black/10 text-black p-3 md:p-4 rounded-full transition-all duration-300 transform hover:scale-110 hover:-translate-y-1 active:scale-95 flex items-center justify-center min-h-[44px] min-w-[44px] md:min-h-[50px] md:min-w-[50px] shadow-md hover:shadow-lg"
      aria-label="Scroll to top"
      style={{ aspectRatio: '1/1' }}
    >
      <ChevronUp size={24} className="md:w-6 md:h-6 text-black transition-transform duration-300 hover:scale-110" />
    </button>
  );
};

export default ScrollToTopButton;

