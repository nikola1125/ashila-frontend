import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useSmoothScroll } from '../../Context/SmoothScroll/SmoothScrollProvider';

const ScrollToTop = () => {
  const { pathname } = useLocation();
  const { scrollToTop } = useSmoothScroll();

  useEffect(() => {
    // Scroll to top instantly when route changes
    if (scrollToTop) {
      scrollToTop({ immediate: true });
    } else {
      // Fallback to native scroll
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'instant'
      });
    }
  }, [pathname, scrollToTop]);

  return null;
};

export default ScrollToTop;

