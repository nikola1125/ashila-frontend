// Scroll animation utility
export const initScrollAnimations = () => {
  // Disconnect any existing observers first
  const existingObservers = document.querySelectorAll('[data-animation-observed]');
  existingObservers.forEach(el => {
    el.removeAttribute('data-animation-observed');
  });

  // Different thresholds for mobile vs desktop
  const isMobile = window.innerWidth <= 768;
  const threshold = isMobile ? 0.01 : 0.1;
  const rootMargin = isMobile ? '50px 0px 50px 0px' : '0px 0px -50px 0px';
  
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    },
    { threshold, rootMargin }
  );

  // Observe all elements with animation classes
  const animatedElements = document.querySelectorAll('.fade-in, .slide-left, .slide-right, .scale-in');
  animatedElements.forEach((el) => {
    // Remove visible class first to reset animation
    el.classList.remove('visible');
    // Mark as observed
    el.setAttribute('data-animation-observed', 'true');
    observer.observe(el);
    
    // Check if element is already in viewport and make it visible
    const rect = el.getBoundingClientRect();
    const isInViewport = rect.top < window.innerHeight + 100 && rect.bottom > -100;
    if (isInViewport) {
      // Small delay to ensure CSS is loaded and animation can trigger
      setTimeout(() => {
        el.classList.add('visible');
      }, 150);
    }
  });

  return () => {
    observer.disconnect();
  };
};