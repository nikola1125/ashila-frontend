import React, { memo } from 'react';
import Hero from './Hero';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import BestSeller from './BestSeller';
import HydrationSection from './HydrationSection';
import FluSection from './FluSection';
import InteractiveProductSelector from './InteractiveProductSelector';
import AcneCategories from './AcneCategories';
import SEO from "../../Components/Common/SEO/SEO";
import StructuredData from "../../Components/Common/SEO/StructuredData";

const Home = memo(() => {
  const location = useLocation();
  return (
    <>
      <SEO 
        title="Farmaci Ashila | Mjekësi & Kujdes Shëndetësor"
        description="Farmaci Ashila - Produkte mjekësore të kuruara, këshillim profesional dhe kujdes shëndetësor në Shqipëri"
        keywords="farmaci ashila, farmaci, mjekësi, shëndet, produkte farmaceutike, kujdes shëndetësor, Shqipëri, barna, medicamente"
        canonicalUrl="https://www.farmaciashila.com/"
      />
      <StructuredData type="LocalBusiness" />
      <Helmet key={location.pathname}>
        <title>Farmaci Ashila | Mjekësi & Kujdes Shëndetësor</title>
        <meta name="description" content="Farmaci Ashila - Produkte mjekësore të kuruara, këshillim profesional dhe kujdes shëndetësor në Shqipëri" />
        <link rel="canonical" href="https://www.farmaciashila.com/" />
      </Helmet>
      <div className="relative" style={{ marginTop: 0, paddingTop: 0 }}>
        <h1 className="sr-only">Farmaci Ashila - Produkte Mjekësore të Kuruara dhe Kujdes Shëndetësor</h1>
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
