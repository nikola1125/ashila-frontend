import React from 'react';
import logo from '/images/logo.png';
import { NavLink, useLocation } from 'react-router-dom';

const Logo = ({ isScrolled = true }) => {
  const location = useLocation();
  
  return (
    <>
      <NavLink 
        to='/' 
        onClick={() => {
          if (location.pathname === '/') {
            window.scrollTo({ top: 0, behavior: 'auto' });
          }
        }}
        className="flex items-center"
      >
        <img 
          src={logo} 
          alt="Ashila Pharmacy Logo" 
          className="h-6 sm:h-8 md:h-8 lg:h-8 w-auto object-contain max-h-full max-w-[120px] lg:max-w-[100px]" 
          style={{ maxHeight: '100%', maxWidth: '120px' }}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = '/images/logo.png';
          }}
        />
      </NavLink>
    </>
  );
};

export default Logo;
