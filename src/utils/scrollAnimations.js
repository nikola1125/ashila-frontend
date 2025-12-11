// Scroll animation utility
export const initScrollAnimations = () => {
  // Different thresholds for mobile vs desktop
  const isMobile = window.innerWidth <= 768;
  const threshold = isMobile ? 0.05 : 0.1;
  const rootMargin = isMobile ? '0px 0px -20px 0px' : '0px 0px -50px 0px';
  
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
  animatedElements.forEach((el) => observer.observe(el));

  return () => observer.disconnect();
};