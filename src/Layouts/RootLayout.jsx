<<<<<<< HEAD
import React, { useEffect } from 'react';
=======
import React from 'react';
>>>>>>> ea66fd40a6e2147c3388b6e1e2051246ee7624cc
import { Outlet } from 'react-router-dom';
import Footer from '../Components/Common/Footer';
import Navbar from '../Components/Common/Navbar/Navbar';
import ScrollToTop from '../Components/Common/ScrollToTop';
<<<<<<< HEAD
import { initScrollAnimations } from '../utils/scrollAnimations';

const RootLayout = () => {
  useEffect(() => {
    const cleanup = initScrollAnimations();
    return cleanup;
  }, []);

=======

const RootLayout = () => {
>>>>>>> ea66fd40a6e2147c3388b6e1e2051246ee7624cc
  return (
    <div className="min-h-screen flex flex-col">
      <ScrollToTop />
      <Navbar />
      <main className="flex-1 w-full pt-0">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default RootLayout;
