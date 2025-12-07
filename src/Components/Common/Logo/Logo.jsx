import React from 'react';
import logo from '../../../assets/logo.png';
import { NavLink } from 'react-router-dom';

const Logo = ({ isScrolled = true }) => {
  return (
    <>
      <NavLink to='/' className="flex items-center">
        <img 
          src={logo} 
          alt="Ashila Pharmacy Logo" 
          className="h-16 md:h-20 w-auto object-contain" 
        />
      </NavLink>
    </>
  );
};

export default Logo;
