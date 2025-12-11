import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Footer from '../Components/Common/Footer';
import Navbar from '../Components/Common/Navbar/Navbar';
import ScrollToTop from '../Components/Common/ScrollToTop';
import ScrollToTopButton from '../Components/Common/ScrollToTopButton';
import { initScrollAnimations } from '../utils/scrollAnimations';

const RootLayout = () => {
  const location = useLocation();

  // Initialize animations on mount and re-initialize on route changes
  useEffect(() => {
    // Small delay to ensure DOM is updated after route change
    let cleanup = null;
    const timeoutId = setTimeout(() => {
      cleanup = initScrollAnimations();
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      if (cleanup) {
        cleanup();
      }
    };
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col">
      <ScrollToTop />
      <Navbar />
      <main className="flex-1 w-full pt-0">
        <Outlet />
      </main>
      <Footer />
      <ScrollToTopButton />
    </div>
  );
};

export default RootLayout;