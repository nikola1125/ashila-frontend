import React, { memo } from 'react';
import Hero from './Hero';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import BestSeller from './BestSeller';
import HydrationSection from './HydrationSection';
import FluSection from './FluSection';
import InteractiveProductSelector from './InteractiveProductSelector';
import AcneCategories from './AcneCategories';

const Home = memo(() => {
  const location = useLocation();
  return (
    <>
      <Helmet key={location.pathname}>
        <title>Ashila - Home</title>
        <link rel="canonical" href="https://www.tacobell.com/" />
      </Helmet>
      <div className="relative" style={{ marginTop: 0, paddingTop: 0 }}>
        <Hero />
      </div>
      
      <div className="relative z-10 bg-white">
        <div className="mb-12 md:mb-0">
          <BestSeller />
        </div>
        <div className="mt-12 md:mt-0">
          <AcneCategories />
        </div>
        <HydrationSection />
        <FluSection />
        <InteractiveProductSelector />
      </div>
    </>  
  );
});

Home.displayName = 'Home';

export default Home;
