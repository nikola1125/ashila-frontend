import React, { memo } from 'react';
import Categories from './Categories';
import Hero from './Hero';
import Discount from './Discount';
import Testimonial from './Testimonial';
import Newsletter from './Newsletter';
import HowItWorks from './HowItWorks';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import LatestProduct from './LatestProduct';
import BestSeller from './BestSeller';
import HydrationSection from './HydrationSection';
import AcneCategories from './AcneCategories';

const Home = memo(() => {
  const location = useLocation();
  return (
    <>
      <Helmet key={location.pathname}>
        <title>Ashila - Home</title>
        <link rel="canonical" href="https://www.tacobell.com/" />
      </Helmet>
      <Hero />
      
      {/* Hero Content Overlay */}
      <div className="relative z-20 min-h-[65vh] md:min-h-screen w-full overflow-hidden flex items-center justify-center md:items-end md:justify-end">
        <div className="max-w-2xl md:max-w-3xl px-4 sm:px-6 pt-8 pb-2 sm:pt-0 sm:pb-20 md:pb-32 lg:pb-40 text-center md:text-right pr-0 md:pr-4 lg:pr-16 xl:pr-48 text-white">
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl leading-relaxed font-medium drop-shadow-lg mb-4 md:mb-6">
            Premium beauty and skincare products crafted with natural ingredients. Experience the difference with our dermatologist-tested formulations.
          </p>
          <button
            onClick={() => window.location.href = '/shop'}
            className="bg-[#946259] hover:bg-[#7a4f47] text-white px-6 py-3 md:px-8 md:py-4 font-semibold transition-all duration-300 uppercase tracking-wide text-sm md:text-base border border-[#946259]"
          >
            Zbulo produktet
          </button>
        </div>
      </div>

      <div className="relative z-20 bg-white -mt-1 md:mt-0">
        <BestSeller />
        <HydrationSection />
        <AcneCategories />
        <Categories />
        <Discount />
        <LatestProduct />
        <HowItWorks />
        <Testimonial />
        <Newsletter />
      </div>
    </>  
  );
});

Home.displayName = 'Home';

export default Home;
