import React from 'react';
import logo from '../../../assets/logo.png';
import { NavLink, useLocation } from 'react-router-dom';

const Logo = ({ isScrolled = true }) => {
  const location = useLocation();
  
  return (
    <>
      <NavLink 
        to='/' 
        onClick={() => {
          if (location.pathname === '/') {
            window.scrollTo({ top: 0, behavior: 'instant' });
          }
        }}
        className="flex items-center"
      >
        <img 
          src={logo} 
          alt="Ashila Pharmacy Logo" 
          className="h-10 sm:h-12 md:h-14 lg:h-12 w-auto object-contain" 
        />
      </NavLink>
    </>
  );
};

export default Logo;
