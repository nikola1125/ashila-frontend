// Cross-browser compatibility utilities

// Detect browser and device
export const detectBrowser = () => {
  const userAgent = navigator.userAgent;
  
  // Browser detection
  const isChrome = /Chrome/.test(userAgent) && /Google Inc/.test(navigator.vendor);
  const isFirefox = /Firefox/.test(userAgent);
  const isSafari = /Safari/.test(userAgent) && /Apple Computer/.test(navigator.vendor);
  const isEdge = /Edg/.test(userAgent);
  const isIE = /MSIE|Trident/.test(userAgent);
  
  // Device detection
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
  const isIOS = /iPad|iPhone|iPod/.test(userAgent);
  const isAndroid = /Android/.test(userAgent);
  
  // iPhone model detection
  const getIPhoneModel = () => {
    if (!isIOS) return null;
    
    const width = window.screen.width;
    const height = window.screen.height;
    const ratio = window.devicePixelRatio || 1;
    
    // iPhone 12/13/14/15/16/17 Pro detection
    if (width === 390 && height === 844 && ratio === 3) return 'iPhone Pro';
    // iPhone 12/13/14/15/16/17 Pro Max detection
    if (width === 430 && height === 932 && ratio === 3) return 'iPhone Pro Max';
    // iPhone 12/13/14/15/16/17 mini detection
    if (width === 375 && height === 812 && ratio === 3) return 'iPhone mini';
    // iPhone 12/13/14/15/16/17 standard detection
    if (width === 390 && height === 844 && ratio === 3) return 'iPhone standard';
    
    return 'iPhone unknown';
  };
  
  return {
    isChrome,
    isFirefox,
    isSafari,
    isEdge,
    isIE,
    isMobile,
    isIOS,
    isAndroid,
    iPhoneModel: getIPhoneModel(),
    userAgent
  };
};

// Safe area detection for iPhone notch
export const getSafeAreaInsets = () => {
  const style = getComputedStyle(document.documentElement);
  
  return {
    top: parseInt(style.getPropertyValue('env(safe-area-inset-top)') || '0'),
    right: parseInt(style.getPropertyValue('env(safe-area-inset-right)') || '0'),
    bottom: parseInt(style.getPropertyValue('env(safe-area-inset-bottom)') || '0'),
    left: parseInt(style.getPropertyValue('env(safe-area-inset-left)') || '0')
  };
};

// Viewport height fix for mobile browsers
export const getCorrectViewportHeight = () => {
  const browser = detectBrowser();
  
  if (browser.isIOS) {
    // Use -webkit-fill-available for iOS
    return window.innerHeight * (window.devicePixelRatio || 1);
  }
  
  return window.innerHeight;
};

// Touch detection
export const isTouchDevice = () => {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
};

// Add browser-specific classes to document
export const addBrowserClasses = () => {
  const browser = detectBrowser();
  const html = document.documentElement;
  
  // Add browser classes
  if (browser.isChrome) html.classList.add('chrome');
  if (browser.isFirefox) html.classList.add('firefox');
  if (browser.isSafari) html.classList.add('safari');
  if (browser.isEdge) html.classList.add('edge');
  if (browser.isIE) html.classList.add('ie');
  
  // Add device classes
  if (browser.isMobile) html.classList.add('mobile');
  if (browser.isIOS) html.classList.add('ios');
  if (browser.isAndroid) html.classList.add('android');
  if (browser.iPhoneModel) html.classList.add(browser.iPhoneModel.toLowerCase().replace(/\s+/g, '-'));
  
  // Add touch class
  if (isTouchDevice()) html.classList.add('touch');
  else html.classList.add('no-touch');
  
  // Add safe area support
  if (CSS.supports('padding', 'max(0px)')) {
    html.classList.add('supports-safe-area');
  }
};

// Fix viewport height for mobile
export const fixViewportHeight = () => {
  const browser = detectBrowser();
  
  if (browser.isIOS || browser.isMobile) {
    const setVH = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };
    
    setVH();
    window.addEventListener('resize', setVH);
    window.addEventListener('orientationchange', setVH);
  }
};

// Prevent zoom on input focus for iOS
export const preventInputZoom = () => {
  const browser = detectBrowser();
  
  if (browser.isIOS) {
    const inputs = document.querySelectorAll('input[type="text"], input[type="email"], input[type="password"], input[type="number"], input[type="tel"], textarea, select');
    
    inputs.forEach(input => {
      input.addEventListener('focus', () => {
        input.style.fontSize = '16px';
      });
      
      input.addEventListener('blur', () => {
        input.style.fontSize = '';
      });
    });
  }
};

// Smooth scroll polyfill for older browsers
export const smoothScrollPolyfill = () => {
  if (!('scrollBehavior' in document.documentElement.style)) {
    // Load smooth scroll polyfill if needed
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/smoothscroll-polyfill@0.4.4/dist/smoothscroll.min.js';
    script.onload = () => {
      window.__forceSmoothScrollPolyfill__ = true;
      window.smoothscroll.polyfill();
    };
    document.head.appendChild(script);
  }
};

// Intersection Observer polyfill
export const intersectionObserverPolyfill = () => {
  if (!('IntersectionObserver' in window)) {
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/intersection-observer@0.12.0/intersection-observer.js';
    document.head.appendChild(script);
  }
};

// Initialize all compatibility fixes
export const initCompatibilityFixes = () => {
  addBrowserClasses();
  fixViewportHeight();
  preventInputZoom();
  smoothScrollPolyfill();
  intersectionObserverPolyfill();
  
  // Add global compatibility object
  window.browserCompatibility = {
    detect: detectBrowser,
    getSafeAreaInsets,
    getCorrectViewportHeight,
    isTouchDevice
  };
};

// Export default for easy import
export default {
  detectBrowser,
  getSafeAreaInsets,
  getCorrectViewportHeight,
  isTouchDevice,
  addBrowserClasses,
  fixViewportHeight,
  preventInputZoom,
  smoothScrollPolyfill,
  intersectionObserverPolyfill,
  initCompatibilityFixes
};
