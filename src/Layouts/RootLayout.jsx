import React from 'react';
import { Outlet } from 'react-router-dom';
import Footer from '../Components/Common/Footer';
import Navbar from '../Components/Common/Navbar/Navbar';
import ScrollToTop from '../Components/Common/ScrollToTop';

const RootLayout = () => {
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
