// Scroll animation utility
export const initScrollAnimations = () => {
  // Disconnect any existing observers first
  const existingObservers = document.querySelectorAll('[data-animation-observed]');
  existingObservers.forEach(el => {
    el.removeAttribute('data-animation-observed');
  });

  // More sensitive thresholds for better sync with scroll position
  const isMobile = window.innerWidth <= 768;
  // Lower threshold means animation triggers when even a small part is visible
  const threshold = isMobile ? 0.01 : 0.05;
  // Larger rootMargin triggers animations earlier (before element fully enters viewport)
  // This makes animations feel more synced with scroll position
  // Increased top margin to trigger animations earlier as user scrolls
  const rootMargin = isMobile ? '120px 0px 50px 0px' : '200px 0px -80px 0px';
  
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const rect = entry.boundingClientRect;
          const viewportHeight = window.innerHeight;
          
          // Calculate how much of the element is visible
          const elementTop = rect.top;
          const elementHeight = rect.height;
          const viewportTop = 0;
          const viewportBottom = viewportHeight;
          
          // Calculate visible portion
          const visibleTop = Math.max(elementTop, viewportTop);
          const visibleBottom = Math.min(elementTop + elementHeight, viewportBottom);
          const visibleHeight = Math.max(0, visibleBottom - visibleTop);
          const visibilityPercent = elementHeight > 0 ? visibleHeight / elementHeight : 0;
          
          // Trigger animation immediately when element starts entering viewport
          // The larger rootMargin ensures this happens at the right scroll position
          if (entry.intersectionRatio > 0) {
            // Calculate delay based on how far into viewport the element is
            // Elements closer to viewport center animate faster
            const elementCenter = elementTop + (elementHeight / 2);
            const viewportCenter = viewportHeight / 2;
            const distanceFromCenter = Math.abs(elementCenter - viewportCenter);
            const maxDistance = viewportHeight;
            const normalizedDistance = Math.min(1, distanceFromCenter / maxDistance);
            
            // Shorter delay for elements closer to viewport center (more synced)
            const delay = Math.max(0, Math.min(80, normalizedDistance * 80));
            
            setTimeout(() => {
              entry.target.classList.add('visible');
            }, delay);
          }
        }
      });
    },
    { 
      threshold,
      rootMargin 
    }
  );

  // Observe all elements with animation classes
  const animatedElements = document.querySelectorAll('.fade-in, .slide-left, .slide-right, .scale-in');
  animatedElements.forEach((el) => {
    // Remove visible class first to reset animation
    el.classList.remove('visible');
    // Mark as observed
    el.setAttribute('data-animation-observed', 'true');
    observer.observe(el);
    
    // Check if element is already in viewport and make it visible immediately
    const rect = el.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const isInViewport = rect.top < viewportHeight + 200 && rect.bottom > -100;
    if (isInViewport) {
      // Calculate visibility for immediate elements
      const visibleHeight = Math.min(viewportHeight - Math.max(0, rect.top), rect.height);
      const visibilityPercent = rect.height > 0 ? Math.max(0, Math.min(1, visibleHeight / rect.height)) : 0;
      
      // Trigger immediately if already visible
      if (visibilityPercent > 0.05) {
        setTimeout(() => {
          el.classList.add('visible');
        }, 30);
      }
    }
  });

  return () => {
    observer.disconnect();
  };
};