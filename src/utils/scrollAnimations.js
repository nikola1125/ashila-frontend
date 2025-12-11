// Scroll animation utility
export const initScrollAnimations = () => {
  // Different thresholds for mobile vs desktop
  const isMobile = window.innerWidth <= 768;
  const threshold = isMobile ? 0.01 : 0.1;
  const rootMargin = isMobile ? '50px 0px 50px 0px' : '0px 0px -50px 0px';
  
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          // On mobile, also check if element is already in viewport
          if (isMobile) {
            const rect = entry.target.getBoundingClientRect();
            const isInViewport = rect.top < window.innerHeight && rect.bottom > 0;
            if (isInViewport) {
              entry.target.classList.add('visible');
            }
          }
        }
      });
    },
    { threshold, rootMargin }
  );

  // Observe all elements with animation classes
  const animatedElements = document.querySelectorAll('.fade-in, .slide-left, .slide-right, .scale-in');
  animatedElements.forEach((el) => {
    observer.observe(el);
    // On mobile, check if element is already in viewport and make it visible immediately
    if (isMobile) {
      const rect = el.getBoundingClientRect();
      const isInViewport = rect.top < window.innerHeight + 100 && rect.bottom > -100;
      if (isInViewport) {
        // Small delay to ensure CSS is loaded
        setTimeout(() => {
          el.classList.add('visible');
        }, 50);
      }
    }
  });

  return () => observer.disconnect();
};