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
<<<<<<< HEAD
          className="h-3 sm:h-4 md:h-4 lg:h-4 w-auto object-contain max-h-full max-w-[110px] lg:max-w-[90px]" 
          style={{ maxHeight: '100%', maxWidth: '110px' }}
=======
          className="h-3 sm:h-4 md:h-4 lg:h-5 w-auto object-contain max-h-full max-w-[120px] lg:max-w-[100px]" 
          style={{ maxHeight: '100%', maxWidth: '120px' }}
>>>>>>> ea66fd40a6e2147c3388b6e1e2051246ee7624cc
        />
      </NavLink>
    </>
  );
};

export default Logo;
