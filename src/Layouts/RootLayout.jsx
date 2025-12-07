import React from 'react';
import { Outlet } from 'react-router-dom';
import Footer from '../Components/Common/Footer';
import Navbar from '../Components/Common/Navbar/Navbar';

const RootLayout = () => {
  return (
    <>
      <Navbar />
      <div className="w-full">
        <Outlet />
      </div>
      <Footer />
    </>
  );
};

export default RootLayout;
